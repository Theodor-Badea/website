# Security Level - Low
We see a form that asks for our name

<!--TODO insert screenshot-->

And updates the page with that name

```html
<pre>Hello Theo</pre>
```

After trying an XSS payload we get the alert
```html
<script>alert("You have been Hacked")</script>
```

<!--TODO add a screenshot with the alert-->
