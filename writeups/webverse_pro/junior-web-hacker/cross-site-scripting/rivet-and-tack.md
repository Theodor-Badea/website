---

Name: Rivet & Tack
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/rivet-and-tack
Desciption: Rivet & Tack is a two-generation leather shop out of Millerton, belts and dog collars from $48, custom saddle work by appointment, founded 1986. The order-lookup page was bolted on by the owner's nephew, a high-school junior who'd just discovered View Source and was prouder of how the markup read than of what the browser would do with it. 

---

## Finding the Vulnerability

The order-lookup page contains an input field where the value entered by the user is reflected directly into the value attribute:

```html
<input class="rt-mono-input" type="text" name="mono" value=HACKER placeholder="e.g. JPR" autocomplete="off">
```

Since the input is inserted into the HTML without proper escaping, I suspected that I could break out of the value attribute and inject HTML.

## XSS

I first closed the existing attribute and added a <script> tag:

```html
random><script>alert("Hacked")</script><input class="rt-mono-input"
```

The application rendered the input as HTML instead of treating it as plain text, causing the JavaScript to execute.

This confirmed a reflected Cross-Site Scripting (XSS) vulnerability.
