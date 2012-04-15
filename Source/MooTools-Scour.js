var Scour;

(function($) {

Scour = new Class({

  Implements : [Options, Events],

  options : {
    destroyElementsOnCleanup : false,
    selector : '[data-role]',
    cleanupSelector : '[data-role-cleanup]',
    roleAttribute : 'data-role',
    cleanupAttribute : 'data-role-cleanup',
    unLoadSelector : '[data-role-unload]',
    unLoadAttribute : 'data-role-unload',
    rolesKey : 'Scour:roles',
    definedKey : 'Scour:defined',
    eventsKey : 'Scour:events',
    apiKey : 'Scour:API',
    useBeforeUnloadEvent : true,
    mergeGlobalRoles : true
  }, 

  initialize : function(options) {
    this.setOptions(options);
    this.roles = {};
    this.counter = 0;
    if(this.options.useBeforeUnloadEvent) {
      window.addEvent('beforeunload',this.unLoad.bind(this));
    }
    if(this.options.mergeGlobalRoles) {
      this.mergeGlobalRoles();
    }
  },

  setContainer : function(element) {
    this.options.container = $(element);
  },

  getContainer : function() {
    if(!this.options.container) {
      this.options.container = document.body;
    }
    return this.options.container;
  },

  mergeGlobalRoles : function() {
    if(Scour.Global) {
      var roles = Scour.Global.getRoles();
      for(var role in roles) {
        this.defineRole(role,roles[role]);
      }
    }
  },

  defineRole : function(role,fn) {
    var events = {};
    if(typeOf(fn) == 'function') {
      events = { onLoad : fn };
    }
    else if(typeOf(fn) == 'object') {
      events = fn;
      if((typeOf(events.includeIf) == 'function' && !events.includeIf()) || events.includeIf === false) {
        return; //ignore the scour event from being added
      }
    }
    else {
      throw new Error('Invalid callback parameter given');
    }
    this.roles[role] = events;
  },

  removeRole : function(role) {
    if(this.isRoleDefined(role)) {
      delete this.roles[role];
    }
  },

  getRoles : function() {
    return this.roles;
  },

  getRole : function(role) {
    return this.getRoles()[role];
  },

  isRoleDefined : function(role) {
    return !! this.getRoles()[role];
  },

  elementHasRole : function(elm,role) {
    return element.get(this.options.roleAttribute).contains(role);
  },

  createStorageKey : function(key,role) {
    return key + ':' + role;
  },

  findElements : function(element,selector,roleAttribute) {
    element = $(element || this.getContainer());
    var elements = [];
    var results = element.getElements(selector);
    if(element.get(roleAttribute)) {
      results.push(element);
    }
    results.each(function(elm) {
      var roles = elm.retrieve(this.options.rolesKey);
      if(!roles) {
        roles = (elm.get(roleAttribute) || "").trim().split(' ');
        elm.store(this.options.rolesKey,roles);
      }
      roles.each(function(role) {
        if(role.length > 0 && this.isRoleDefined(role)) {
          var key = this.createStorageKey(this.options.eventsKey,role);
          var events = elm.retrieve(key);
          if(!events) {
            events = Object.clone(this.getRole(role));
            elm.store(key,events);
          }

          var pass = !events.applyIf || (typeOf(events.applyIf) == 'function' && events.applyIf(elm) == true);
          if(pass) {
            elements.push([elm,role,events]);
          }
        }
      },this);
    },this);
    return elements;
  },

  fireRoleEvent : function(element,role,fn,eventOptions) {
    var attr = this.getRoleOptionsAttr(role);
    var key = this.createStorageKey(this.options.apiKey,role);
    var api = element.retrieve(key);
    if(!api) {
      api = new Scour.OptionsAPI(element,attr);
      element.store(key,api);
    }
    fn.apply(eventOptions,[element,api]);
  },

  getRoleOptionsAttr : function(role) {
    return 'data-'+role.toLowerCase()+'-options';
  },

  apply : function(container) {
    var elements, role;
    if(typeOf(container) == 'string') {
      role = container;
      container = $(document.body);
    }
    elements = this.findElements(container,this.options.selector,this.options.roleAttribute);
    if(role) {
      elements = elements.filter(function(elm) {
        return elm[1] == role;
      });
    }
    elements.each(function(array) {
      var element = array[0];
      var events = array[2];
      var role = array[1];
      var fn = events.onIterate;

      var key = this.createStorageKey(this.options.definedKey,role);
      if(!element.retrieve(key)) {
        this.onFirstRun(element,role,events);
        element.store(key,true);
      }

      if(fn) {
        this.fireRoleEvent(element,role,fn,events);
      }
      else {
        this.onNoIterationMethodFound(element,role);
      }
    },this);
  },

  onNoIterationMethodFound : function(element,role) {
    var attr = this.options.roleAttribute;
    var value = element.getAttribute(attr);
    var r = new RegExp('\s*'+role+'\s*');
    value = value.replace(r,' ').trim();
    if(value.length > 0) {
      element.setAttribute(attr,value);
    }
    else {
      element.removeAttribute(attr);
    }
  },

  applyOnElement : function(element) {
    var attr = element.get(this.options.roleAttribute);
    if(attr.length > 0) {
      attr.split(' ').each(this.fireRoleEvent,this);
    }
  },

  onFirstRun : function(element,role,events) {
    if(events.onLoad) {
      this.fireRoleEvent(element,role,events.onLoad,events);
    }

    var filterMethods = ['onLoad','onIterate'];
    var methods = {};
    for(var i in events) {
      if(filterMethods.indexOf(i) == -1) {
        var fn = events[i];
        if(typeOf(fn) == 'function' && i.substr(0,2)=='on') {
          this.attachCustomEvent(element,role,i,fn);
        }
      }
    }
  },

  attachCustomEvent : function(element,role,name,fn) {
    var key = name.charAt(2).toLowerCase() + name.substr(3);
    var attr = 'data-'+key.toLowerCase();
    var value = element.getAttribute(attr) || '';
    if(value == '' || role.indexOf(value)==-1) {
      value += (value.length.length > 0 ? ' ' : '') + role;
      element.setAttribute(attr,value);
    }
  },

  fireCustomMethod : function(name,container) {
    if(!container) {
      container = document.id(document.body);
    }
    var attr = 'data-'+name.toLowerCase();
    var selector = '['+attr+']';
    var event = 'on' + name.charAt(0).toUpperCase() + name.substr(1);
    this.findElements(container,selector,attr).each(function(array) {
      var element = array[0];
      var role = array[1];
      var events = array[2];
      var fn = events[event];
      if(fn) {
        this.fireRoleEvent(element,role,fn,events);
      }
    },this);
  },

  cleanup : function(container) {
    this.fireCustomMethod('cleanup',container);
  },

  pause : function(container) {
    this.fireCustomMethod('pause',container);
  },

  resume : function(container) {
    this.fireCustomMethod('resume',container);
  },

  unLoad : function(container) {
    this.fireCustomMethod('unLoad',container);
  },

  reload : function(container) {
    this.cleanup(container);
    this.apply(container);
  }

});

Scour.Global = new Scour;

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

Element.implement({

  scour : function() {
    Scour.Global.apply(this);
  },

  hasRole : function(role) {
    return Scour.Global.elementHasRole(this,role);
  }

});

})(document.id);
