---
Name: "Nobody loves me"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Abusing session and cookie behaviour to reach protected application data."
---

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

