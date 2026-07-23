---
Name: "Inspect me PEM"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Inspecting PEM-encoded certificate material to locate sensitive data."
---

# Inspect me PEM
We inspect the certificate
```bash
openssl x509 -in example.crt -text -noout
```

And see the flag in the DNS field
```bash
DNS:example.com, DNS:SSS{hiding_in_plain_sight}, IP Address:10.0.0.1
```

