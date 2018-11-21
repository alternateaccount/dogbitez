# OFX Bookmarklet

A bookmarklet to screen-scrape transaction data for the Amazon Store Card on Synchrony Credit, convert and downloaded as an OFX file which can be imported into personal finance software.

#### Bookmarklet

Either follow the instrucitons on [this page](https://alternateaccount.github.io/dogbitez/bookmarklet.html), or manually create a bookmark with an address of the following javascript code.

```javascript
javascript:(function(){var el=document.createElement('script');el.src='https://alternateaccount.github.io/dogbitez/file.min.js?bust='+new Date().getTime();document.body.appendChild(el);})();
```
