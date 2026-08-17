---

Name: FurFable
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/events/furfable
Description: FurFable started when two vet-school friends got tired of clients losing the paper after-visit sheet. They shipped a portal where every consult gets its own summary you can open anytime, and it reached a few thousand pet owners in a month. The summary loads whichever visit the link points at, and the team never circled back to lock down whose visit that is allowed to be. 


---

I've created a new account and clicked on `view summary` for my pet

This send me to:
```
https://053872fb-5330-furfable-9b90e.events.webverselabs-pro.com/visits/13
```

Looks like it might be vulnerable to IDOR, changing 13 to 12 confirms this is true

The flag can be found while viewing the pet with id 4
