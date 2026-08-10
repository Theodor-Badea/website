---

Name: Hunter
Difficulty: Easy
URL: https://www.hacksmarter.org/events/7f9dc321-77ce-49b8-8acc-5c224ef25d8d/take/hunter-easy
Description: You are an operator for the Hack Smarter Red Team, currently conducting a black-box assessment on a client's external login portal. As part of the initial reconnaissance phase, our OSINT analysts have compiled a list of potential usernames. You need to identify which one is a valid username for the web application.

---

We see a normal login page

There is also a password reset page at /reset, but it always returns the same generic message:

```txt
If an account matches that username, a reset link has been sent to the email on file.
```

I've used [Caido](https://www.caido.io/) to brute force the request with all of the usernames. Although the response body is identical for every request, one username consistently takes noticeably longer to process

This timing difference indicates that the application performs additional work only when the username exists, allowing us to enumerate a valid account

![found_username](../../../../../public/images/hack_smarter/DEFCON_CTF/web/hunter/joey.png) 
