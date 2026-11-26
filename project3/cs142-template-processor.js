'use strict';
/* exported Cs142TemplateProcessor */

function Cs142TemplateProcessor(template) {
  this.template = template;
}

Cs142TemplateProcessor.prototype.fillIn = function (dictionary) {
  return this.template.replace(/\{\{([^{}]*)\}\}/g, function (match, property) {
    return dictionary[property] === undefined ? '' : String(dictionary[property]);
  });
};
