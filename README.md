# OFX Bookmarklet

A bookmarklet to screen-scrape transaction data for the Amazon Store Card on Synchrony Credit, convert and downloaded as an OFX file which can be imported into personal finance software.

## Installing Bookmarklet

Either follow the instrucitons on [this page](https://alternateaccount.github.io/dogbitez/bookmarklet.html), or manually create a bookmark with an address of the following javascript code.

```javascript
javascript:(function(){var el=document.createElement('script');el.src='https://alternateaccount.github.io/dogbitez/file.js?bust='+new Date().getTime();document.body.appendChild(el);})();
```

## Using Bookmarklet
When logged into Synchrony Credit for an Amazon Store Card, click the `View Activity` button to view transaction details.  Once the transaction details page loads, click the bookmarklet created in the [previous step](#installing-bookmarklet), and an OFX will be created and downloaded.
