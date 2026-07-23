---
Name: "Tactical precision Dissaray"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Testing a constrained input field for a cross-site scripting vulnerability."
---

# Tactical precision Dissaray
Modified the request with burp (since there was a lenght limit) and added the payload in field 1
```html
<script>alert(document.cookie)</script>
```

Managed to create an XSS, but can't see the flag cookie, will try again tomorrow

---

