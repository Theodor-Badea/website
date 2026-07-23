---
Name: "Client Certificate Authentication"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Generating and signing a client certificate to authenticate to a protected service."
---

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

