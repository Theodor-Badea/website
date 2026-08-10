---

Name: Cookie Cutter
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/cookie-cutter
Description: Northbrew Coffee Co., an indie roaster with eleven cafés across the Pacific Northwest, just launched their loyalty rewards site. The engineering team baked their account state into a single browser cookie so the experience would feel instant. They picked an encoding that's easy to read on the wire and easier still to read off it. 

---

Looking at the cookies we find `nb_session` with the value of:
```
eyJ0aWVyIjogImdvbGQiLCAiYmVhbl9iYWxhbmNlIjogMjQ3LCAibmV4dF9wZXJrIjogImZyZWVfb2F0X21pbGsiLCAiam9pbmVkIjogIjIwMjUtMDgtMTQiLCAiZGVidWciOiB7ImZlYXR1cmVfZmxhZyI6ICJyZXdhcmRzX3YyX2xpdmUiLCAiaW50ZXJuYWxfcmVmIjogIldFQlZFUlNFezdlZjdhYzk1ZGY2ZGU1MmEwMWMyZTg2OGJmYzMxZjJlfSJ9fQ==
```

Looks like it is base64 encoded:
```bash
$ echo <base64-text> | base64 -d
{"tier": "gold", "bean_balance": 247, "next_perk": "free_oat_milk", "joined": "2025-08-14", "debug": {"feature_flag": "rewards_v2_live", "internal_ref": "WEBVERSE{REDACTED}"}}
```

`internal_ref` has the flag:
```
"internal_ref": "WEBVERSE{REDACTED}"
```
