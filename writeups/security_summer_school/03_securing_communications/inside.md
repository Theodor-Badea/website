---
Name: "Inside"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Inspecting a secured service to find information exposed behind its interface."
---

# Inside 
The website says we should "try secure", simply changing the protocol to https does not work

Instead of http://141.85.224.102:3380/, we try http://141.85.224.102:33443/, (HTTP uses 80, and HTTPs uses 443)

We inspect the certificate details
```bash
openssl s_client -connect 141.85.224.102:33443 </dev/null | openssl x509 -noout -text
```

And we discovered a servername
```bash
X509v3 extensions:
    X509v3 Subject Alternative Name: 
        DNS:pax.imperia.org, DNS:spqr.net, IP Address:10.0.0.1
```

```bash
echo | openssl s_client -connect 141.85.224.102:33443 -servername spqr.net | openssl x509 -text | grep "SSS"

Connecting to 141.85.224.102
depth=0 CN=spqr.net
verify error:num=18:self-signed certificate
verify return:1
depth=0 CN=spqr.net
verify return:1
DONE
                DNS:spqr.net, DNS:SSS{debbie_does_dallas}, IP Address:10.0.0.1
```

