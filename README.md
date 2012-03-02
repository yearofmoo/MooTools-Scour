# MooTools-Scour
MooTools-Scour allows you to bind reusable event operations into DOM elements and have a CSS selector search through the conents of the DOM only once to update/fire the events that been detailed.

The problem with most plugins is that they require their own className or selector which is to be fired once the page loads. Keeping track of each of these selector operations can become a nightmare and can result in lots of useless, non-reusable code. Some older browsers may not include querySelector or getElementsByClassName DOM events so a page can end up rendering itself slower than it should.

Thankfully MooTools-Scour takes care of all of this. Here's how it works:

## Simple Usage
<div data-role="Close">This element will close when clicked</div>

```javascript
Scour.Global.defineRole('Close',function(element,options) {
  element.addEvent('click',function(event) {
    event.stop();
    this.hide();
  });
});
```

//sets up the events
Scour.apply();

## Detailed Usage
You can also include a much more involved scour role:

```javascript
Scour.Global.defineRole('ReloadCount',{

  onLoad : function() {
    //loaded only once
  },

  onIterate : function() {
    //loaded every time the Scour.apply() function is called
  },

  onCleanup : function() {
    //loaded every time the Scour.cleanup() function is called
  },

  onUnLoad : function() {
    //fired just before the page is unloaded (onbeforeunload)
  }

});
```

You can also call the apply operation in a few ways

```javascript
//Focus on a specific container (element) and run the operation on that and its children
Scour.apply(innerContainer);

//Or by role
Scour.apply('Close');

//Or On One Element Exclusively
Socur.applyOnElement(element);
```
