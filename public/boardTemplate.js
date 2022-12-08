(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['board'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div id=\"play-space\">\r\n	<div class=\"row\">\r\n		<button class=\"play-square\" id=\"topLeft\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"topLeft") || (depth0 != null ? lookupProperty(depth0,"topLeft") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"topLeft","hash":{},"data":data,"loc":{"start":{"line":3,"column":43},"end":{"line":3,"column":54}}}) : helper)))
    + "</button>\r\n		<button class=\"play-square\" id=\"topCenter\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"topCenter") || (depth0 != null ? lookupProperty(depth0,"topCenter") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"topCenter","hash":{},"data":data,"loc":{"start":{"line":4,"column":45},"end":{"line":4,"column":58}}}) : helper)))
    + "</button>\r\n		<button class=\"play-square\" id=\"topRight\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"topRight") || (depth0 != null ? lookupProperty(depth0,"topRight") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"topRight","hash":{},"data":data,"loc":{"start":{"line":5,"column":44},"end":{"line":5,"column":56}}}) : helper)))
    + "</button>\r\n	</div>\r\n	<div class=\"row\">\r\n		<button class=\"play-square\" id=\"midLeft\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"midLeft") || (depth0 != null ? lookupProperty(depth0,"midLeft") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"midLeft","hash":{},"data":data,"loc":{"start":{"line":8,"column":43},"end":{"line":8,"column":54}}}) : helper)))
    + "</button>\r\n		<button class=\"play-square\" id=\"midCenter\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"midCenter") || (depth0 != null ? lookupProperty(depth0,"midCenter") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"midCenter","hash":{},"data":data,"loc":{"start":{"line":9,"column":45},"end":{"line":9,"column":58}}}) : helper)))
    + "</button>\r\n		<button class=\"play-square\" id=\"midRight\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"midRight") || (depth0 != null ? lookupProperty(depth0,"midRight") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"midRight","hash":{},"data":data,"loc":{"start":{"line":10,"column":44},"end":{"line":10,"column":56}}}) : helper)))
    + "</button>\r\n	</div>\r\n	<div class=\"row\">\r\n		<button class=\"play-square\" id=\"botLeft\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"botLeft") || (depth0 != null ? lookupProperty(depth0,"botLeft") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"botLeft","hash":{},"data":data,"loc":{"start":{"line":13,"column":43},"end":{"line":13,"column":54}}}) : helper)))
    + "</button>\r\n		<button class=\"play-square\" id=\"botCenter\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"botCenter") || (depth0 != null ? lookupProperty(depth0,"botCenter") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"botCenter","hash":{},"data":data,"loc":{"start":{"line":14,"column":45},"end":{"line":14,"column":58}}}) : helper)))
    + "</button>\r\n		<button class=\"play-square\" id=\"botRight\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"botRight") || (depth0 != null ? lookupProperty(depth0,"botRight") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"botRight","hash":{},"data":data,"loc":{"start":{"line":15,"column":44},"end":{"line":15,"column":56}}}) : helper)))
    + "</button>\r\n	</div>\r\n</div>";
},"useData":true});
})();