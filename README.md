#Bookmarklet: A Bookmarklet

A bookmarklet and to download stuff

#### Bookmarklet

Either follow the instrucitons on [this page](https://cdn.rawgit.com/alternateaccount/dogbitez/master/bookmarklet.html), or manually create a bookmark with an address of the following javascript code.

```javascript
javascript:(function(){var el=document.createElement('script');el.src='https://cdn.rawgit.com/alternateaccount/dogbitez/master/file.min.js?bust='+new Date().getTime();document.body.appendChild(el);})();
```
