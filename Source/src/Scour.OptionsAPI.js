Scour.OptionsAPI = new Class({

  initialize : function(element,attr) {
    this.element = element;
    this.attr = attr;
  },

  getElement : function() {
    return this.element;
  },

  getAttr : function() {
    return this.attr;
  },

  getData : function() {
    return this.getElement().get(this.getAttr());
  },

  getJSON : function() {
    return this.getData();
  },

  getObject : function() {
    if(!this.object) {
      var data = this.getData();
      if(data) {
        this.object = JSON.decode(this.getData());
      }
      else {
        this.object = {};
      }
    }
    return this.object;
  },

  getOptions : function() {
    return this.getObject();
  },

  hasKey : function(key) {
    return !! this.getObject()[key];
  },

  get : function(key,defaultValue) {
    var value = this.getObject()[key];
    if(value === null || value == undefined) {
      value = defaultValue;
    }
    return value;
  },

  set : function(key,value) {
    return this.getObject()[key]=value;
  },

  getAsElement : function(key) {
    var elm = this.get(key);
    if(elm) {
      return document.id(elm);
    }
  },

  getAsBoolean : function(key,defaultValue) {
    return !! this.get(key,defaultValue);
  },

  getAsArray : function(key) {
    var data = this.get(key);
    if(typeOf(data) != 'array') {
      data = [data];
    }
    return data;
  },

  del : function(key) {
    var value, object = this.getObject();
    if(typeOf(object[key]) != 'undefined') {
      value = object[key];
      delete object[key];
    }
    return value;
  },

  isNull : function(key) {
    return this.get(key) == null;
  }

});
