# MooTools-Scour
MooTools-Scour allows you to bind reusable event operations into DOM elements and have a CSS selector search through the conents of the DOM only once to update/fire the events that been detailed.

The problem with most plugins is that they require their own className or selector which is to be fired once the page loads. Keeping track of each of these selector operations can become a nightmare and can result in lots of useless, non-reusable code. Some older browsers may not include querySelector or getElementsByClassName DOM events so a page can end up rendering itself slower than it should.

Thankfully MooTools-Scour takes care of all of this. Here's how it works:

* Full documentation and a demo can be found at http://www.yearofmoo.com/Scour

## Simple Usage

We'll start by adding a common javascript event where an element has to be closed when clicked:

```html
<div data-role="Close">This element will close when clicked</div>
```
And now the javascript to find that element and add the event:

```javascript
Scour.Global.defineRole('Close',function(element,options) {
  element.addEvent('click',function(event) {
    event.stop();
    this.hide();
  });
});

//sets up the events
Scour.apply();
```
Now any element that contains the value "Close" within the attribute data-role will be scoured.


You can also embed option values directly into the HTML (as a JSON hash) and those can be used by the Scour event:

```html
<div data-role="Close" data-close-options="{ sayHelloBeforeClose : true }">This element will close when clicked</div>
```

And use those options within the JavaScript:

```javascript
Scour.Global.defineRole('Close',function(element,options) {
  var sayHello = options.getAsBoolean('sayHelloBeforeClose');
  element.addEvent('click',function(event) {
    if(sayHello) {
      alert("hello! I'm about to be closed");
    }
    event.stop();
    this.hide();
  });
});
```


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

You can also call the apply operation in a few ways:

```javascript
//Focus on a specific container (element) and run the operation on that and its children
Scour.apply(innerContainer);

//Or by role
Scour.apply('Close');

//Or On One Element Exclusively
Socur.applyOnElement(element);
```

## Custom Scour Objects

Custom Scour Objects can be defined:

```javascript
advancedBrowsers = new Scour;

advancedBrowsers.definedRole('Animate',function(element,options) {
  //perform a fancy animation that will only faster browsers can perform
});

//then later on when you call the operation
if(isFancyBrowser) {
  advancedBrowsers.apply();
}

//Or you can just set a condition to a global Scour role
Scour.Global.defineRole('Animate',{

  includeIf : function() { //the role will get included only if this returns true (if the method exists)
    if(isFancyBrowser) {
      return true;
    }
  },

  applyIf : function(element) { //this is a quick method to allow or prevent the onLoad or onIterate method from running every time
    return true;
  },

  onLoad : function(element,options) {
    //normal operation
  },

  onIterate : function(element,options) {
    //normal operation
  }

});

```

## More Info...

* Please visit http://www.yearofmoo.com/Scour for a full documentation and a demo of the Scour plugin.
