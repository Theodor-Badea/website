---

Name: Header Hunt
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/header-hunt
Description: Arc Logistics, a mid-sized regional freight carrier, just launched their public shipment tracking site. The build team rushed to hit the Q2 deadline and merged a debugging branch the night before launch. Nobody asked what got left behind. 

---

Since the challenge is called **Header Hunt**, the first thing I checked was the HTTP response headers.

I used `curl -I` to request only the response headers:

```bash
curl -I 'https://ae2ec0c3-5330-header-hunt-ac54e.challenges.webverselabs-pro.com/track?id=1234567'
```

The response contained several security-related headers, but one stood out:

```http
x-internal-order-ref: WEBVERSE{REDACTED}
```

The flag was directly exposed in the custom `X-Internal-Order-Ref` response header.
