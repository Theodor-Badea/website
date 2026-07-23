---
Name: "Do you need Glasses"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Inspecting application behaviour and browser-visible data to uncover the flag."
---

# Do you need Glasses
A password in base64 can be found in the source code of the page 
```html
  <meta content="anVreG9xbm5jYQ==" name="password">
```

Which decrypts to "jukxoqnnca"

After using dirsearch we find (it was also hidden in the page source) 
```bash
http://141.85.224.101:30017/staff.html
```

Found a comment which mentions a secret field
```html
<!--<input type="checkbox" name="secret" class="form-control" id="checkbox" value="42">-->
```

We make a request with burp and are redirected to the admin page
```http
username=admin&password=jukxoqnnca&secret=42
```

```html
<!--<p>FFF{1_er4yyl_y1xr_y34i1at_ge4p3f_1a_p0zz3agf}</p>-->
```

It's encrypted with ROT13, using cyber chef it results into
```txt
SSS{1_re4lly_l1ke_l34v1ng_tr4c3s_1n_c0mm3nts}
```

