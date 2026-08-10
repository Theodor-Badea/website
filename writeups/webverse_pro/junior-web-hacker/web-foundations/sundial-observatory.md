---

Name: Sundial Observatory
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/occultation
Description: The Sundial Observatory has met on the second Saturday of every month since 1987, at a converted ranger station above the Cascade Plateau. Pavel, a retired aerospace tech, runs the website out of his garage. He's allergic to leaks but believes, as a matter of principle, that asking search engines politely to stay away is the same thing as keeping a page private. 

---

The description mentioned asking "search engines to stay away", this strongly hints at the existence of robots.txt

The content of robots.txt is:
```text
# Sundial Observatory — please be courteous, search engines.
User-agent: *
Disallow: /members-only-2026
Disallow: /staff-archive
Disallow: /old-roster.html

Sitemap: /sitemap.xml
```

The flag can be found at the bottom of /members-only-2026
