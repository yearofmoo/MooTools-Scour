Element.implement({

  scour : function() {
    Scour.Global.apply(this);
  },

  hasRole : function(role) {
    return Scour.Global.elementHasRole(this,role);
  }

});
