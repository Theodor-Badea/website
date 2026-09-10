---

Name: Biohazard
Difficulty: Medium
URL: https://tryhackme.com/room/biohazard
Description: A CTF room based on the old-time survival horror game, Resident Evil. Can you survive until the end?

---
<!--TODO make writeup better-->
# Introduction
## How many open ports?
```bash
$ rustscan -a biohazard.thm -r 1-65535 --ulimit 5000 -- -sC -sV

PORT   STATE SERVICE REASON  VERSION
21/tcp open  ftp     syn-ack vsftpd 3.0.3
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 c9:03:aa:aa:ea:a9:f1:f4:09:79:c0:47:41:16:f1:9b (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDM1/tmq8Lrur25evbyyI7/+nxDlhbVbMMiRfz5a0eI7Sq9yODJGCVNMPJGKOwtgA/BlPi7V3TKyYJVeH1QOzP8mPLVgfYom6ovelJiLiR6VrO4dqxx+G3ir+tj/OOSc4MpmdnqCvQKtAeJ4e5bbWakFihXyy14yi++oOzqp2VDlqMNN+d2k0uSAx1rDbngwP3UvRfE1E1TaSYhljnb9kvWRxBABhpdkUjbcRLwxBAQFBm9Vm+yQYPurC9YJ1BUlJzOFesYnbS27bG1vVCcuPQN3YjcljVCXBdd0qIvZdYlez4+mVUcJJh1iWl83sfgo+wZRmfHsedjdL1eWNrkt+ed
|   256 2e:1d:83:11:65:03:b4:78:e9:6d:94:d1:3b:db:f4:d6 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNy83txF27peDYxMhrPqfipXwZtBNY9H4fww7f2FRCkt09tEcp5f5BKhOE4cNo033XYpmaowy1r4qgFpIqKjf64=
|   256 91:3d:e4:4f:ab:aa:e2:9e:44:af:d3:57:86:70:bc:39 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMhTmk6F06eyLfM0j07nUcnqMqGdgOfFqsp3eLdbwwn0
80/tcp open  http    syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods:
|_  Supported Methods: HEAD GET POST OPTIONS
|_http-title: Beginning of the end
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

The answer is: 3

## What is the team name in operation
It can be found after visiting the web page http://biohazard.thm/

```text
STARS alpha team
```

# The Mansion
The link takes us to /mansionmain

## What is the emblem flag
We can see a note in the page source:
```html
	<!-- It is in the /diningRoom/ -->
```

Let's visit /diningRoom

There is another note 
```html
		<!-- SG93IGFib3V0IHRoZSAvdGVhUm9vbS8= -->
```

And a link to the emblem: /diningRoom/emblem.php

It also states that we should refresh the diningRoom page

It changed and now we have a new input:
```
 There is an emblem slot on the wall, put the emblem?
```

After some values I get redirected to /diningRoom/emblem_slot.php

And the message is:
```
Nothing happen
```

Decoding the note we found earlier, `SG93IGFib3V0IHRoZSAvdGVhUm9vbS8`, from base64 results in:
```
How about the /teaRoom/
```

Inside it we found the lock_pick and a suggestion to visit /artRoom/

There we find a map:
```
Look like a map

Location:
/diningRoom/
/teaRoom/
/artRoom/
/barRoom/
/diningRoom2F/
/tigerStatusRoom/
/galleryRoom/
/studyRoom/
/armorRoom/
/attic/
```

Inside the barRoom we find a locked door,
```
It can be open by a lockpick
```

I've put the flag value of the lock_pick item and it opened

Found the music sheet
```
NV2XG2LDL5ZWQZLFOR5TGNRSMQ3TEZDFMFTDMNLGGVRGIYZWGNSGCZLDMU3GCMLGGY3TMZL5
```

It is base32 encoded, decoding it results in the next item

I've played the piano with the item found earlier and I got sent to the secret bar room, here lies the gold_emblem item

Let's go back to the diningRoom and try this emblem, now it works and we find this weird string:
```
klfvg ks r wimgnd biz mpuiui ulg fiemok tqod. Xii jvmc tbkg ks tempgf tyi_hvgct_jljinf_kvc
```

I've tried ROT13 but it does not work

I've visited /diningRoom2F/ and found another note, looks pretty similar to the one found in the first diningRoom
```html
	<!-- Lbh trg gur oyhr trz ol chfuvat gur fgnghf gb gur ybjre sybbe. Gur trz vf ba gur qvavatEbbz svefg sybbe. Ivfvg fnccuver.ugzy -->
```

Inside /tigerStatusRoom/ is a slot for a gem

Inside /galleryRoom/ we can find a note:
```text
crest 2:
GVFWK5KHK5WTGTCILE4DKY3DNN4GQQRTM5AVCTKE
Hint 1: Crest 2 has been encoded twice
Hint 2: Crest 2 contanis 18 letters
Note: You need to collect all 4 crests, combine and decode to reavel another path
The combination should be crest 1 + crest 2 + crest 3 + crest 4. Also, the combination is a type of encoded base and you need to decode it
```

Inside /studyRoom/ there is a slot for a helmet

Inside /armorRoom/ there is a slot for a shield

The /attic/ also has a slot for a shield


I think I need to do something with these 2:
```text
klfvg ks r wimgnd biz mpuiui ulg fiemok tqod. Xii jvmc tbkg ks tempgf tyi_hvgct_jljinf_kvc
Lbh trg gur oyhr trz ol chfuvat gur fgnghf gb gur ybjre sybbe. Gur trz vf ba gur qvavatEbbz svefg sybbe. Ivfvg fnccuver.ugzy
```

The second one decrypts well with ROT13:
```text
You get the blue gem by pushing the status to the lower floor. The gem is on the diningRoom first floor. Visit sapphire.html
```

The gem can be found at: /diningRoom/sapphire.html


Let's go to /tigerStatusRoom/ and put the gem, we find another note:
```text
crest 1:
S0pXRkVVS0pKQkxIVVdTWUpFM0VTUlk9
Hint 1: Crest 1 has been encoded twice
Hint 2: Crest 1 contanis 14 letters
Note: You need to collect all 4 crests, combine and decode to reavel another path
The combination should be crest 1 + crest 2 + crest 3 + crest 4. Also, the combination is a type of encoded base and you need to decode it
```

We have to do something with this one:
```
klfvg ks r wimgnd biz mpuiui ulg fiemok tqod. Xii jvmc tbkg ks tempgf tyi_hvgct_jljinf_kvc
```

It might be a vigenere cipher

I have used https://www.dcode.fr/vigenere-cipher, because we know the part of the plaintext: shield_key

The decoded message results into: 
```text
there is a shield key inside the dining room. The html page is called the_great_shield_key
```

Going to /diningRoom/the_great_shield_key.html gives us the shield item

I got into the armorRoom and found another note:
```text
crest 3:
MDAxMTAxMTAgMDAxMTAwMTEgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAwMTEgMDAxMDAwMDAgMDAxMTAxMDAgMDExMDAxMDAgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAxMTAgMDAxMDAwMDAgMDAxMTAxMDAgMDAxMTEwMDEgMDAxMDAwMDAgMDAxMTAxMDAgMDAxMTEwMDAgMDAxMDAwMDAgMDAxMTAxMTAgMDExMDAwMTEgMDAxMDAwMDAgMDAxMTAxMTEgMDAxMTAxMTAgMDAxMDAwMDAgMDAxMTAxMTAgMDAxMTAxMDAgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTAxMTAgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTEwMDEgMDAxMDAwMDAgMDAxMTAxMTAgMDExMDAwMDEgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTEwMDEgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTAxMTEgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAxMDEgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAwMDAgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTEwMDAgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAwMTAgMDAxMDAwMDAgMDAxMTAxMTAgMDAxMTEwMDA=
Hint 1: Crest 3 has been encoded three times
Hint 2: Crest 3 contanis 19 letters
Note: You need to collect all 4 crests, combine and decode to reavel another path
The combination should be crest 1 + crest 2 + crest 3 + crest 4. Also, the combination is a type of encoded base and you need to decode it
```

I have also unlocked the attic and found the last note
```text
crest 4:
gSUERauVpvKzRpyPpuYz66JDmRTbJubaoArM6CAQsnVwte6zF9J4GGYyun3k5qM9ma4s
Hint 1: Crest 2 has been encoded twice
Hint 2: Crest 2 contanis 17 characters
Note: You need to collect all 4 crests, combine and decode to reavel another path
The combination should be crest 1 + crest 2 + crest 3 + crest 4. Also, the combination is a type of encoded base and you need to decode it
```

Now we have all of the crests:
```text
crest 1:
S0pXRkVVS0pKQkxIVVdTWUpFM0VTUlk9
Hint 1: Crest 1 has been encoded twice
Hint 2: Crest 1 contanis 14 letters

crest 2:
GVFWK5KHK5WTGTCILE4DKY3DNN4GQQRTM5AVCTKE
Hint 1: Crest 2 has been encoded twice
Hint 2: Crest 2 contanis 18 letters

crest 3:
MDAxMTAxMTAgMDAxMTAwMTEgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAwMTEgMDAxMDAwMDAgMDAxMTAxMDAgMDExMDAxMDAgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAxMTAgMDAxMDAwMDAgMDAxMTAxMDAgMDAxMTEwMDEgMDAxMDAwMDAgMDAxMTAxMDAgMDAxMTEwMDAgMDAxMDAwMDAgMDAxMTAxMTAgMDExMDAwMTEgMDAxMDAwMDAgMDAxMTAxMTEgMDAxMTAxMTAgMDAxMDAwMDAgMDAxMTAxMTAgMDAxMTAxMDAgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTAxMTAgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTEwMDEgMDAxMDAwMDAgMDAxMTAxMTAgMDExMDAwMDEgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTEwMDEgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTAxMTEgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAxMDEgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAwMDAgMDAxMDAwMDAgMDAxMTAxMDEgMDAxMTEwMDAgMDAxMDAwMDAgMDAxMTAwMTEgMDAxMTAwMTAgMDAxMDAwMDAgMDAxMTAxMTAgMDAxMTEwMDA=
Hint 1: Crest 3 has been encoded three times
Hint 2: Crest 3 contanis 19 letters

crest 4:
gSUERauVpvKzRpyPpuYz66JDmRTbJubaoArM6CAQsnVwte6zF9J4GGYyun3k5qM9ma4s
Hint 1: Crest 2 has been encoded twice
Hint 2: Crest 2 contanis 17 characters
```

After some trial and error I got these:
```text
1: from base64 + from base32
RlRQIHVzZXI6IG

2: from base32 + from base58
h1bnRlciwgRlRQIHBh

3: from base64 + from binary + from hex
c3M6IHlvdV9jYW50X2h

4: from base58 + from hex
pZGVfZm9yZXZlcg==
```

The final message is:
```
RlRQIHVzZXI6IGh1bnRlciwgRlRQIHBhc3M6IHlvdV9jYW50X2hpZGVfZm9yZXZlcg==
```

Decoding it from base64 results into:
```
FTP user: hunter, FTP pass: you_cant_hide_forever
```

# The guard house
```bash
$ ftp biohazard.thm
Connected to biohazard.thm (10.114.160.143).
220 (vsFTPd 3.0.3)
Name (biohazard.thm:theo): hunter
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
227 Entering Passive Mode (10,114,160,143,121,88).
150 Here comes the directory listing.
-rw-r--r--    1 0        0            7994 Sep 19  2019 001-key.jpg
-rw-r--r--    1 0        0            2210 Sep 19  2019 002-key.jpg
-rw-r--r--    1 0        0            2146 Sep 19  2019 003-key.jpg
-rw-r--r--    1 0        0             121 Sep 19  2019 helmet_key.txt.gpg
-rw-r--r--    1 0        0             170 Sep 20  2019 important.txt
226 Directory send OK.
ftp> get important.txt
local: important.txt remote: important.txt

```

```bash
$ cat important.txt
Jill,

I think the helmet key is inside the text file, but I have no clue on decrypting stuff. Also, I come across a /hidden_closet/ door but it was locked.

From,
Barry
```

We check the hidden directory /hidden_closet/, but it requires the helmet key

We find something hidden in the first key
```bash
 $ stegseek 001-key.jpg

[i] Found passphrase: ""
[i] Original filename: "key-001.txt".
[i] Extracting to "001-key.jpg.out".
```

```bash
$ cat 001-key.jpg.out
cGxhbnQ0Ml9jYW

```

Inside the second image there is a comment
```bash
$ exiftool 002-key.jpg
Comment                         : 5fYmVfZGVzdHJveV9
```

The third key contains a zip archive with a txt file:

```bash
$ binwalk -e 003-key.jpg

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
1930          0x78A           Zip archive data, at least v2.0 to extract, uncompressed size: 14, name: key-003.txt
2124          0x84C           End of Zip archive, footer length: 22
```

```bash
$ cat key-003.txt
3aXRoX3Zqb2x0
```

The final message is
```text
cGxhbnQ0Ml9jYW5fYmVfZGVzdHJveV93aXRoX3Zqb2x0
```

Which decodes to:
```
plant42_can_be_destroy_with_vjolt
```

Now let's get the helmet item:
```bash
gpg --batch --yes \
    --passphrase 'plant42_can_be_destroy_with_vjolt' \
    --output helmet_key.txt \
    --decrypt helmet_key.txt.gpg
```

# The Revisit
## What is the SSH login username
In the hidden closet I found MO_DISK1:
```bash
wpbwbxr wpkzg pltwnhro, txrks_xfqsxrd_bvv_fy_rvmexa_ajk
```

And a wolf medal:
```
SSH password: T_virus_rules
```

From my notes I found that /studyRoom also has a helmet slot

There I found a sealed book

It contained the SSH username:
```bash
$ tar -xzvf doom.tar.gz
eagle_medal.txt

$ cat eagle_medal.txt
SSH user: umbrella_guest
```

```bash
$ ssh umbrella_guest@biohazard.thm
```

## Who the STARS bravo team leader
In the hidden closet we find who the leader is and that a traitor exists
```
<p>In the cave, Jill met injured Enrico, the leader of the STARS Bravo team. He mentioned there is a traitor among the STARTS Alpha team.</p>
```

# The Underground laboratory
## Where you found Chris
I found a secret note inside jailcell
```bash
$ cat .jailcell/chris.txt
Jill: Chris, is that you?
Chris: Jill, you finally come. I was locked in the Jail cell for a while. It seem that weasker is behind all this.
Jil, What? Weasker? He is the traitor?
Chris: Yes, Jill. Unfortunately, he play us like a damn fiddle.
Jill: Let's get out of here first, I have contact brad for helicopter support.
Chris: Thanks Jill, here, take this MO Disk 2 with you. It look like the key to decipher something.
Jill: Alright, I will deal with him later.
Chris: see ya.

MO disk 2: albert
```

## Who is the traitor
I found a note:
```bash
$ cat weasker_note.txt
Weaker: Finally, you are here, Jill.
Jill: Weasker! stop it, You are destroying the  mankind.
Weasker: Destroying the mankind? How about creating a 'new' mankind. A world, only the strong can survive.
Jill: This is insane.
Weasker: Let me show you the ultimate lifeform, the Tyrant.

(Tyrant jump out and kill Weasker instantly)
(Jill able to stun the tyrant will a few powerful magnum round)

Alarm: Warning! warning! Self-detruct sequence has been activated. All personal, please evacuate immediately. (Repeat)
Jill: Poor bastard
```

From the note we learn that Weasker is the traitor

## The login password for the traitor
Somehow MO_DISK2 is the key to decrypting MO_DISK1
```text
wpbwbxr wpkzg pltwnhro, txrks_xfqsxrd_bvv_fy_rvmexa_ajk
albert
```

It looked similar to the vigenere-cipher so I again used https://www.dcode.fr/vigenere-cipher to decypher it, this time knowing the key
```text
weasker login password, stars_members_are_my_guinea_pig
```

## The name of the ultimate form
Tyrant

## The root flag
We can change users
```bash
$ su weasker
stars_members_are_my_guinea_pig
```

```bash
$ sudo -l
Matching Defaults entries for weasker on umbrella_corp:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User weasker may run the following commands on umbrella_corp:
    (ALL : ALL) ALL
```

We can run all commands with sudo, so let's become root:
```bash
$ sudo su
```

And read the flag
```bash
$ cat /root/root.txt

In the state of emergency, Jill, Barry and Chris are reaching the helipad and awaiting for the helicopter support.

Suddenly, the Tyrant jump out from nowhere. After a tough fight, brad, throw a rocket launcher on the helipad. Without thinking twice, Jill pick up the launcher and fire at the Tyrant.

The Tyrant shredded into pieces and the Mansion was blowed. The survivor able to escape with the helicopter and prepare for their next fight.

The End

flag: REDACTED
```
