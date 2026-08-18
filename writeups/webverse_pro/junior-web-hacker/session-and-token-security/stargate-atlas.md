---

Name: Stargate Atlas
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/03/unsealed
Description: Stargate Atlas grew out of one engineer's weekend project tracking upcoming rocket launches. After the Discord hit ten thousand members they bolted on subscriber accounts and a hand-rolled token auth layer, the kind of layer where every shortcut taken at 2 a.m. ends up in the public site copy somewhere. 

---

We start by creating a new account. After logging in, the application gives us a JWT authentication cookie:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJib2JAZ21haWwuY29tIiwicm9sZSI6InN1YnNjcmliZXIiLCJpYXQiOjE3ODcwNzYyNDAsImV4cCI6MTc4NzA3OTg0MH0.lvr08fdMvrikaOFvYRNUmvfCkKunAgzoUKRGPPDThgQ
```

Decoding the JWT shows the following header and payload:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

```json
{
  "sub": "bob@gmail.com",
  "role": "subscriber",
  "iat": 1787076240,
  "exp": 1787079840
}
```

The important part here is the `role` claim, which is currently set to `subscriber`. Since the application uses the JWT to determine our permissions, changing this value to `admin` could potentially give us administrative access.

The token specifies the `HS256` signing algorithm. However, the application also accepts JWTs using the `none` algorithm. The `none` algorithm means that the JWT is not signed and therefore has an empty signature.

This allows us to create our own token, change the `role` claim from `subscriber` to `admin`, and have the application accept it as a valid authentication token.

I generated the modified JWT using [jwt.io](https://www.jwt.io/).

![JWT with the none algorithm](../../../../public/images/webverse_pro/session-and-token-security/jwt-alg-none.png)

The forged token is:

```text
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODcwNzYyNDAsImV4cCI6MTc4NzA3OTg0MH0.
```

Notice that the token ends with a `.` and has no signature after it. This is because we are using the `none` algorithm.

We replace our original authentication cookie with the forged JWT and access:

```text
/admin/manifests
```

The application accepts the unsigned token and treats us as an administrator. We can now access the admin manifest page and retrieve the flag.

The vulnerability is caused by the application trusting the JWT's requested signing algorithm and accepting the `none` algorithm instead of enforcing the expected `HS256` algorithm and requiring a valid signature.
