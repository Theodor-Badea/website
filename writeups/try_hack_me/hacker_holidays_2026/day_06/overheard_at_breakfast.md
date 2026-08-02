---

Name: Overheard at Breakfast
Difficulty: Easy
URL: https://tryhackme.com/room/hh-overheardatbreakfast-6f01793c
Description: Two strangers. One conversation. One profile they never meant to reveal.

---

# Examining the info
We have a png file containing a discord conversation

![conversation](./conversation.png)

Here we find one email address, lambobytelotushotel@gmail.com

# OSINT
I have found [emailosint](https://emailosint.org/) and used it to find more information about it

There is a profile link leading to [gravatar](https://gravatar.com/cheerfullysongf28e3c3716) 

# Gravatar
Here we find a description
```txt
Funny thing about email hashes, they follow you places you didn't expect. Glad you found the right corner of the internet! Here is your prize: VEhNe1MzY3JlVF9QcjBmaWwzX0g0c19iMzNuX0lkZW50MWZpM2R9
```

# Flag
We just decrypt it from base64
```bash
$ echo 'VEhNe1MzY3JlVF9QcjBmaWwzX0g0c19iMzNuX0lkZW50MWZpM2R9' | base64 -d
```
