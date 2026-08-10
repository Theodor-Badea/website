---

Name: Brackish Brewing Co.
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/walk-in
Description: Brackish Brewing has been in Coalridge since 2017, a fifteen-barrel system, four year-round beers, a taproom that's walk-in only on weekends. The website's a Flask app the head brewer's partner wrote over a few rainy weekends, it has a small staff section where the floor manager posts the week's shifts and keg-pickup notes. The hosting setup got rearranged when they moved off their old reverse proxy in early 2025, and nobody on the brewing side thought to revisit the assumptions the staff section had been quietly making about where its traffic comes from. 

---

We go to /staff and find a note
```
Staff portal — internal network access only.

This portal is internal-network only. If you're seeing this from a personal device, you'll need to access it from the Coalridge office VPN or hit it from the LB hostname — the cloud load balancer is supposed to mark the request as a trusted hop before it gets here.

If you are on the office VPN and still seeing this, grab Hollis. The new load balancer changed how it labels in-network requests after the migration, and the staff handler may be looking for the old loopback marker.
```

Something checks we are from the internal network

We can trick it using the `X-Forwarded-For` header
```bash
curl -H "X-Forwarded-For: 127.0.0.1" https://9674c7a1-5330-walk-in-455ac.challenges.webverselabs-pro.com/staff 
```

In the response we have the flag
