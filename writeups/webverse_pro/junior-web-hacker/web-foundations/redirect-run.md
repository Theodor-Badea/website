---

Name: Redirect run
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/redirect-run 
Description: Quikpay generates short, shareable receipt URLs for merchants. Visiting one bounces you to a friendly "thanks for your purchase" landing page. The redirect that gets you there isn't as silent as it looks, there's something the engineering team forgot to strip out of the intermediate response. 

---

We follow the shortened link and intercept each request with Burp Suite

We also intercept the responses from the server

Inside one of them we find this HTML comment
```html
<!--
─── Quikpay redirect debug (production safe? — ToDO: strip before launch) ───
request_token: qp-r4-7821ab
upstream_status: 200
upstream_latency_ms: 38
internal_ref: WEBVERSE{REDACTED}
reconciliation_window: 24h
cookie_strip_policy: strict
note: leave this in until QA signs off on the new tracing pipeline
-->
```
