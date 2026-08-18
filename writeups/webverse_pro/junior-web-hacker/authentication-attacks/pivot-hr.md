---

Name: Pivot HR
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/02/side-door
Description: Pivot HR is a six-person SaaS for indie small businesses, payroll, time-off, the occasional 1099. They wired up MFA in a hurry after a customer asked for SOC 2. The MFA gate works perfectly. It just doesn't gate anything past the front door. 

---

After trying some credentials, we successfully reached an MFA page requiring a 6-digit OTP

I captured the /mfa request and sent it to Caido's Automation tool to test whether the OTP could be brute-forced. I also prepared an HTTPQL filter to distinguish failed attempts
```
resp.raw.ncont:"Try again"
```

However, after starting the attack, it became apparent that brute-forcing the OTP was unnecessary. The 6-digit code has 1,000,000 possible values, and the available time made testing the entire keyspace impractical

I then tried accessing /dashboard directly without completing MFA:
```
GET /dashboard
```

The dashboard was accessible despite the MFA session still being unverified

This revealed that the MFA check was only protecting the /mfa flow and was not enforced on the protected /dashboard endpoint. Therefore, an attacker could simply bypass the MFA page by directly requesting the dashboard
