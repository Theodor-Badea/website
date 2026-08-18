---

Name: Halftrack Model Railroad Club
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/02/combination
Description: Halftrack has met in the basement of the VFW on the second Tuesday of every month since 1971. Hollis Kerrigan has been president since 1994. He picked the member-portal admin password himself when the website went up in 1998 and has refused to change it, on principle. There is no rate limit on the login form. 

---

While exploring the member portal, we find a note containing the username format:
```
Username is firstinitial + lastname (lowercase, no spaces or dots).
```

The president is Hollis Kerrigan, so following this format, his username should be:
```
hkerrigan
```

We can then capture the login request using Caido and send it to the Automation tool to brute-force the password.

Since the description tells us that there is no rate limiting on the login form, we can use a common password wordlist such as rockyou.txt.

After sending the requests, we find a successful login with:
```
username=hkerrigan&password=password1
```

We can now log in to the member portal using these credentials.

The flag is available on the dashboard.
