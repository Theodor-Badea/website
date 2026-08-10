---

Name: Vellichor Press
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/01/marginalia
Description: Vellichor Press is a six-person literary magazine that publishes four issues a year. Their new site went up last Tuesday on a tight deadline, Elias, the only engineer they have on retainer, told the editors he'd "do one more pass after launch." That pass never happened. Now the masthead looks immaculate to a reader, while a draft admin note sits where nobody scrolls. 

---

Inspecting the page source reveals an HTML note
```HTML
<!--
  ToDO(elias): remove before final launch. Tracking note while the
  reconciliation script runs against the Stripe export — do NOT push
  this to production after Tuesday's deploy.

  admin shortcut (drafts pane):  /staff/admin?token=stripe-recon-2026
  reconcile internal-ref:        WEBVERSE{REDACTED}

  — e.l, 2026-03-12, 11:48 ET. Removed by:                       .
-->
```
