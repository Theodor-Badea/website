---

Name: Palisade
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/palisade
Description: Palisade rents mountaineering kits. The dev wrote a case-sensitive string replace to strip "<script". He shipped it at 11pm the night before a demo. Nothing blew up. Yet. 

---

Maybe the challenge does not work well, a simple XSS payload added in the custom note revealed the flag
```html
<script>alert("Hacked")</script>
```

I think the intended way was to use something like:
```html
<ScRiPt>alert("Hacked")</ScRiPt>
```
