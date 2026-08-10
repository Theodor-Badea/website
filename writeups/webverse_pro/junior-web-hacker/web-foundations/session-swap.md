---

Name: Session Swap
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/session-swap
Description: Ridgeline Hotels rolled out a brand-new internal portal for front-desk agents, housekeeping leads and assistant managers. Engineering shipped it sprint-end. The role-based access control lives entirely in a cookie the browser is happy to edit. 

---

We enter some randoms creds and we get redirected to the dashboard

There is a cookie `role` with the value `user`

At the moment we can not access /admin

But if we change the cookie to `admin` we manage to access the page and read the flag
