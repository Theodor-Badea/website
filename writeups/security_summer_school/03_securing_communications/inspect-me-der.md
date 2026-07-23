---
Name: "Inspect me DER"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Converting and examining DER certificate data to recover the flag."
---

# Inspect me DER
Same as the PEM one
```bash
openssl x509 -in example.der -inform DER -text -noout
```

```bash
DNS:example.com, DNS:SSS{change_comes_from_within}, IP Address:10.0.0.1
```

