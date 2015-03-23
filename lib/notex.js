'use strict';

var logger = require('./logger');
var parser = require('./parser');
var traversal = require('./traversal');
var command = require('./command');

/**
 * notex to HTML renderer.
 * @type {TreeTraversal}
 */
var renderer = traversal()
  .addPropertyHelper('type');

renderer.type('root', function(node, recur) {
  if (!Array.isArray(node.list)) {
    return '';
  }
  return recur.each(node.list).trim();
});

renderer.type('group', function (node, recur) {
  if (!Array.isArray(node.list)) {
    return '';
  }
  return ' ' + recur.each(node.list) + ' ';
});

renderer.type('paren', function (node, recur) {
  // TODO Add progressively larger parens when nested, etc.
  // TODO Frac will have to increase paren size as well
  return '(' + recur.each(node.list) + ')';
});

renderer.type('superscript', function (node, recur) {
  return '<sup>' + recur(node.expr) + '</sup>';
});

renderer.type('subscript', function (node, recur) {
  return '<sub>' + recur(node.expr) + '</sub>';
});

renderer.type('frac', function (node, recur) {
  // TODO Need real fraction rendering
  return recur(node.numerator) + '/' + recur(node.denominator);
});

renderer.type('command', command);

renderer.type('id', function (node, recur) {
  return '<em>' + node.value + '</em>';
});

renderer.type('operator', function (node, recur) {
  return ' ' + node.value + ' ';
});

renderer.type('number', function (node, recur) {
  return node.value;
});

/**
 * Parses given notex source and forms an abstract syntax tree.
 * @param  {string} src Source to parse.
 * @return {object} The abstract syntax tree for the given source.
 * @throws {SyntaxError} If the given source is not valid notex.
 */
var parse = parser.parse;

/**
 * Renders given notex source as HTML.
 * @param {string} src notex source to render as html.
 * @param {boolean} debug If `true` log the resulting ast.
 * @return {string} HTML rendering of the given source.
 */
function render(src, debug) {
  var ast = parse(src);
  if (debug) {
    logger(ast);
  }
  return renderer.walk(ast);
}

/**
 * Module exports.
 */
module.exports = {
  render: render
};
