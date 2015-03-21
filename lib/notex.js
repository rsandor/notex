'use strict';

/**
 * Parses given notex source and forms an abstract syntax tree.
 * @param  {string} src Source to parse.
 * @return {object} The abstract syntax tree for the given source.
 * @throws {SyntaxError} If the given source is not valid notex.
 */
var parse = require('./parser.js').parse;

/**
 * Traverses an abstract syntax tree and outputs the results to the console.
 * @param  {Object} ast Current ast node.
 * @param  {Number} [depth] Current depth of the traversal.
 */
function traverse(ast, depth) {
  depth = depth || 0;

  function log(str) {
    var tab = "";
    for (var i = 0; i < depth; i++) {
      tab += "  ";
    }
    console.log(tab + str);
  }

  switch (ast.type) {
    case 'root':
      log("ROOT");
      ast.list.forEach(function(child) {
        traverse(child, depth + 1);
      });
      break;
    case 'group':
      log("GROUP");
      ast.list.forEach(function(child) {
        traverse(child, depth + 1);
      });
      break;
    case 'paren':
      log("PAREN");
      ast.list.forEach(function(child) {
        traverse(child, depth + 1);
      });
      break;
    case 'superscript':
      log("SUPERSCRIPT");
      traverse(ast.expr, depth+1);
      break;
    case 'subscript':
      log("SUBSCRIPT");
      traverse(ast.expr, depth+1);
      break;
    case 'command':
      log("COMMAND("+ast.name+")");
      break;
    case 'id':
      log("IDENTIFIER("+ast.name+")");
      break;
    case 'operator':
      log("OPERATOR("+ast.name+")");
      break;
    case 'number':
      log("NUMBER("+ast.number+")");
      break;
    default:
      break;
  }
}

/**
 * Renders given notex source as HTML.
 * @param  {string} src notex source to render as html.
 * @return {string} HTML rendering of the given source.
 */
function render(src) {
  var ast = parse(src);
  traverse(ast);
  return ast;
}

/**
 * Module exports.
 */
module.exports = {
  render: render,
};
