---

Name: Lake Forks Permits
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/02/front-counter
Description: Lake Forks County's permits portal was redesigned in 2018 by a consultant who set the staff login credentials as a temporary default and noted "RESET BEFORE GOING LIVE" in the project binder on the clerk's shelf. The binder is in a different binder now. 

---


We scan and find /login
```bash
$ gobuster dir -url https://86be4987-5330-front-counter-11673.challenges.webverselabs-pro.com/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log,old,js -k
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     https://86be4987-5330-front-counter-11673.challenges.webverselabs-pro.com/
[+] Method:                  GET
[+] Threads:                 100
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              php,html,bak,zip,log,old,js,txt
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.well-known/http-opportunistic (Status: 200) [Size: 76]
about                (Status: 200) [Size: 15395]
login                (Status: 200) [Size: 6864]
records              (Status: 200) [Size: 13107]
robots.txt           (Status: 200) [Size: 1248]
```

There we try the default credentials `admin`:`admin` and they work

We are logged in and can read the flag
