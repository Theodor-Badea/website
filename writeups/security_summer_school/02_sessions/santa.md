---
Name: "Santa"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Inspecting client-side code to recover a hidden flag."
---

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

