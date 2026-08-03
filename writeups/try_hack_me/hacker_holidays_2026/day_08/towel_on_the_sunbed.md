---

Name: Towel on the Sunbed
Difficulty: Medium
URL: https://tryhackme.com/room/hh-towelonthesunbed-61271709
Description: Ponzi set his towel down for one 24-hour reward claim. He came back to find the sunbed had been "claimed" three times over while he wasn't looking.

---

After providing an username and a password I managed to create an account an log into the app

We can collect 50 ponzi every 24 hours

In order to open the vault we have to reach at least 150 ponzi

We do not want to wait 3 days so we have to find another method

I've caught the request to claim the reward with [Caido](https://www.caido.io/) 

```http
POST /claim HTTP/1.1
Host: 10.113.129.253:3000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate
Referer: http://10.113.129.253:3000/dashboard
Origin: http://10.113.129.253:3000
Connection: keep-alive
Cookie: connect.sid=s%3AhiotWyxNZ8tgFH7ZpcZapzwKYiFC81zM.IjKVofzSi0r4orBfI4boRIsrA2Si2f%2FSM88DAGv80r8
Priority: u=0
Content-Length: 0
```

If I try to send it again I get an error, which was expected

```http
HTTP/1.1 429 Too Many Requests
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 95
ETag: W/"5f-f7w7ogkeSjWYg/D+guTHVqUkewc"
Date: Mon, 03 Aug 2026 18:21:57 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
    "error": "Reward already claimed. Please wait before claiming again.",
    "secondsRemaining": 86374
}
```

But what if I send it really fast?

I've made a new account, caught the request to claim the rewards, but instead of sending it directly I first sent it to Automate

I've tinkered with the settings and made it send the request 100 times with 40 workers

In the end I got 300 ponzi and was able to open the vault which had the flag
