---

Name: Quickpay Receipts
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/double-entry
Description: Quikpay is a small payments backend used by a few dozen indie software shops. They take the integration seriously and the design seriously. They also have a debug branch in the resend handler that the engineering lead added during a late-night incident and never wrapped in a feature flag. 

---

The intended use of the resend function is
```https
POST /receipt/<token>/resend
Content-Type: application/x-www-form-urlencoded

email=customer@example.com
```

Which returns
```
{"message":"Receipt qp-r4-9981kl resent to the email on file","ok":true}
```

If we change the header to
```
Content-Type: application/json
```

We get a debug error message which has the flag
```json
"internal_ref":"WEBVERSE{REDACTED}",
```
