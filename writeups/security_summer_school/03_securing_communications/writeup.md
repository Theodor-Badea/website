# Course #3
# Inspect me PEM
We inspect the certificate
```bash
openssl x509 -in example.crt -text -noout
```

And see the flag in the DNS field
```bash
DNS:example.com, DNS:SSS{hiding_in_plain_sight}, IP Address:10.0.0.1
```

# Inspect me DER
Same as the PEM one
```bash
openssl x509 -in example.der -inform DER -text -noout
```

```bash
DNS:example.com, DNS:SSS{change_comes_from_within}, IP Address:10.0.0.1
```

# Proper naming
The website says "Not here Call smokey.burger.com"

We add it to /etc/hosts, then go to http://smokey.burger.com:3280/
```txt
141.85.224.102    smokey.burger.com
```

```txt
Flag SSS{who_you_wanna_kill}
```

# Chosen-one
We have to find out which is the valid certificate
```bash
#!/bin/bash

for i in $(seq 1 100); do
    openssl verify -no_check_time -CAfile ca_two.crt "$i".crt > /dev/null 2>&1
    if test "$?" -eq 0; then
        openssl x509 -noout -subject -in "$i".crt | grep -o 'SSS{.*}'
    fi
done
```

```txt
SSS{Snowbelt}
```

# Client Certificate Authentication
## 1. We generatea private key for out client
```bash
openssl genrsa -out client.key 2048
```

## 2. We create a certificate signing request
```bash
openssl req -new -key client.key -out client.csr -subj "/CN=127.0.0.1"
```

## 3. We sign our client certificate with the CA's Private key
```bash
openssl x509 -req -in client.csr -CA certs/ca.crt -CAkey private/ca.key -CAcreateserial -out client.crt -days 365 -sha256
```

The password was "sss-web-ca", took it from the github repository, https://github.com/open-education-hub/web-security/tree/main/chapters/network-and-communication-security/securing-communication/media/client-certificate-authentication

## 4. Get the flag
```bash
curl -k --cert client.crt --key client.key https://141.85.224.102:31443
```

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
