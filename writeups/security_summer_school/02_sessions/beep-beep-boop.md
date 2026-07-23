---
Name: "Beep Beep Boop"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Manipulating client-controlled state to recover a hidden flag."
---

# Beep Beep Boop
Using dirsearch shows robots.txt which disallows an interesting page
```txt
User-agent: *
Disallow: /73656372657420666f72204153494d4f.php
```

When accessing that page we see
```txt
This is a secure area that can only be accessed by the most advanced humanoid robots.
```

We see we have a cookie named "robotType" with has the value "HUMAN", changing it to "ASIMOV" shows the flag
```txt
SSS{We_w0rsh1p_1saac_As1m0v}
```

