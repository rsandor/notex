'use strict';

/* @module notex */

var traversal = require('traversal');
var logger = require('./logger');
var parser = require('./parser');
var command = require('./command');
var util = require('./util');
var span = util.span;
var esc = util.esc;

// Load commands
require('./commands');

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
  return span(recur.each(node.list).trim(), 'notex');
});

renderer.type('group', function (node, recur) {
  if (!Array.isArray(node.list)) {
    return '';
  }
  return span(recur.each(node.list), 'notex-group');
});

renderer.type('paren', function (node, recur) {
  // TODO Add progressively larger parens when nested, etc.
  // TODO Frac will have to increase paren size as well
  return [
    span('(', 'notex-left-paren'),
    recur.each(node.list),
    span(')', 'notex-right-paren')
  ].join('');
});

renderer.type('superscript', function (node, recur) {
  return span('<sup>' + recur(node.expr) + '</sup>', 'notex-super');
});

renderer.type('subscript', function (node, recur) {
  return span('<sub>' + recur(node.expr) + '</sub>', 'notex-sub');
});

renderer.type('frac', function (node, recur) {
  // TODO Need real fraction rendering
  var html = recur(node.numerator) + '/' + recur(node.denominator);
  return span(html, 'notex-frac');
});

renderer.type('command', command.visit);

renderer.type('id', function (node, recur) {
  return span(node.value, 'notex-id');
});

renderer.type('operator', function (node, recur) {
  return span(node.value, 'notex-operator');
});

renderer.type('number', function (node, recur) {
  return span(node.value, 'notex-number');
});

renderer.type('comma', function (node) {
  return span(',', 'notex-comma');
});

renderer.type('equals', function (node) {
  return span('=', 'notex-equals');
});

renderer.type('minus', function (node) {
  return span(esc('#8722'), 'notex-operator notex-minus');
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
