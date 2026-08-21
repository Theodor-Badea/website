---

Name: Sandpiper Stationery
Difficulty: Easy
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/sandpiper-stationery
Description: Sandpiper Stationery is a three-person wedding-invitation studio on the Cape, founded 2012, letterpress suites from $640, six-to-eight week lead times, an Etsy following that finally outgrew the Etsy template. Their first standalone site went up in March. The tracking page was a last-minute add the freelancer described as "five lines, can't go wrong" the afternoon before launch. 

---

## Finding the Vulnerability

The tracking page contains an input field where the user-controlled `guest` parameter is reflected directly into the `value` attribute:

```html
<input class="sp-guest" type="text" name="guest" value="HACKER" readonly autocomplete="off">
```

The input is placed inside a quoted HTML attribute, so I needed to escape the existing `"` character and break out of the `value` attribute.

## XSS

I used the following payload:

```html
random"><script>alert("Hacked")</script><input class="sp-guest
```

The first `"` closes the existing `value` attribute. The injected ``<script>`` tag is then interpreted as HTML and executes the JavaScript.

The final part starts another `<input>` element to keep the resulting HTML valid enough for the browser to render.

This confirmed a reflected Cross-Site Scripting (XSS) vulnerability.
