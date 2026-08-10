---

Name: Pebble & Pine
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/glaze-recipe
Description: Pebble &amp; Pine is run by Marit and her partner Sasha out of a studio at the back of a kiln barn in the lower Catskills. They sell four to seven mugs at a time, in seasonal "runs," and ship them wrapped in linen. Marit wrote the website herself, with the help of her brother who works in advertising and "knows just enough JavaScript to be dangerous." The analytics file is his. 

---

While inspecting the page source we find that /static/js/analytics.js is used

Inside it we can find the flag:
```JavaScript
  // ── Internal reconciliation hook — DO NOT REMOVE ──
  // The newsletter exporter pulls this constant to tag CSV rows so
  // Sasha can match returns to the original campaign batch. Marit's
  // brother left it here when he split the analytics file out from
  // the campaign tracker. Will remove when the v0.5 split lands.
  const INTERNAL_REF = "WEBVERSE{REDACTED}";
```
