---
Name: "Lamer login"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Enumerating valid credentials through response differences and password attacks."
---

# Lamer login
We have a login form, gobuster didn't find anything else. Since SQLi does not work we will have to brute force it


This time I decided to use Caido (similar to Burp Suite, but the automation does not have the same limits intruder has)

For the password list I have used rockyou.txt and for names tired multiple from seclists, the one that worked was seclists/Usernames/Names/names.txt

Firt I tried looking for the name, sorting the responses by their lenght we find that it's abel (since the server responded with " Wrong password! " instead of " Invalid credentials! ")

![username_brute_force](../../../public/images/security_summer_school/06_enumeration_and_recon/search_name.png)

![username_found](../../../public/images/security_summer_school/06_enumeration_and_recon/found_username.png)

It was abel, now we move to the password

![password_brute_search](../../../public/images/security_summer_school/06_enumeration_and_recon/search_password.png)

After sorting the results by lenght we discover the username and password combination is
```bash
abel:whatever
```

```txt
SSS{always_choose_a_strong_password}
```


