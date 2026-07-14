
import hashlib

target = "6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed"
salt = "1c362db832f3f864c8c2fe05f2002a05"

with open("/usr/share/wordlists/rockyou.txt", "rb") as f:
    for line in f:
        pw = line.rstrip(b"\r\n")
        if hashlib.sha512(pw + salt.encode()).hexdigest() == target:
            print("FOUND:", pw.decode(errors="ignore"))
            break
