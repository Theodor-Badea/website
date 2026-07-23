---
Name: "Chosen-one"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Following TLS and certificate clues to complete the challenge."
---

# Chosen-one
We have to find out which is the valid certificate
```bash
#!/bin/bash

for i in $(seq 1 100); do
    openssl verify -no_check_time -CAfile ca_two.crt "$i".crt > /dev/null 2>&1
    if test "$?" -eq 0; then
        openssl x509 -noout -subject -in "$i".crt | grep -o 'SSS{.*}'
    fi
done
```

```txt
SSS{Snowbelt}
```

