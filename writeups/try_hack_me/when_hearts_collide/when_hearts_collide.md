---

Name: When Hearts Collide
Difficulty: Medium
URL: https://tryhackme.com/room/lafb2026e1
Description: Matchmaker is a playful, hash-powered experience that pairs you with your ideal dog by comparing MD5 fingerprints. Upload a photo, let the hash chemistry do its thing, and watch the site reveal whether your vibe already matches one of our curated pups. The algorithm is completely transparent, making every match feel like a wink from fate instead of random swipes.

---

# Inspecting the app
The application allows us to upload an image and matches it with a dog based on the file's MD5 hash. Since the challenge description explicitly mentions MD5, it's a strong hint that the intended solution involves exploiting its weaknesses

MD5 is vulnerable to collision attacks, meaning it is possible to create two different files that produce the same hash. I used a pair of known colliding files from [here](https://www.mscs.dal.ca/~selinger/md5collision/)  

# Getting the flag
After uploading the first file, I uploaded the second file, which has different contents but the exact same MD5 hash. Because the application relies solely on the MD5 hash to identify uploaded files, it treats both files as the same image, resulting in a successful match and revealing the flag
