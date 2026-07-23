---
Name: "Colors"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Analyzing client-side state and request handling in a session-focused challenge."
---

# Colors
It only has a button to go to the next page
```http
http://141.85.224.101:30016/index.php?index=1
```

Going to index 10000000000, shows the message "WTF MAN? 404", we just have to check every index in order until we find the correct one, or do some sort of binary search

The index was 3141

```txt
SSS{d1d_y0u_4ctu4lly_cl1ck_3141_t1mes}
```

