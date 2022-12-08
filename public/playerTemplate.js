(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['player'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "	<div class=\"connected\">Connected <span></span></div>\r\n	<div class=\"ready\">Ready <span></span></div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"player\">\r\n	"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"p") || (depth0 != null ? lookupProperty(depth0,"p") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"p","hash":{},"data":data,"loc":{"start":{"line":2,"column":1},"end":{"line":2,"column":6}}}) : helper)))
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multiplayer") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":1},"end":{"line":6,"column":8}}})) != null ? stack1 : "")
    + "	<div class=\"score\">0</div>\r\n</div>";
},"useData":true});
})();