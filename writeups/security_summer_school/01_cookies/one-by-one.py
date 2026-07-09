import requests
import re 

URL = "http://localhost:30010/one-by-one/"

# create the session
s = requests.Session()

flag = ""

while True:
    r = s.get(url=URL)
    
    # search using regex
    match = re.search(r'<p>(.*?)</p>', r.text)
    
    if match:
        # extract the letter
        letter = match.group(1) 
        
        # stop after the end of the flag    
        if letter == "}":
            break 

        flag += letter
        print(f"Found letter: {letter}")
    else:
        print("No more letters")
        break

print("\n\nFlag:", flag)
