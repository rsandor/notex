'use strict';

var logger = require('./logger');
var parser = require('./parser');
var traversal = require('./traversal');

/**
 * Parses given notex source and forms an abstract syntax tree.
 * @param  {string} src Source to parse.
 * @return {object} The abstract syntax tree for the given source.
 * @throws {SyntaxError} If the given source is not valid notex.
 */
var parse = parser.parse;

/**
 * Renders given notex source as HTML.
 * @param  {string} src notex source to render as html.
 * @return {string} HTML rendering of the given source.
 */
function render(src) {
  var ast = parse(src);
  logger(ast);
  return ast;
}

/**
 * Module exports.
 */
module.exports = {
  render: render
};
