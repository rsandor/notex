/**
 * Tree traversal that logs node information. Helpful for
 * debugging changes to the parser.
 * @author Ryan Sandor Richards
 */

var traversal = require('./traversal');

/**
 * Logs a message with indentation to denote depth
 * within the tree.
 * @param  {Object} msg Message to log.
 * @param  {Number} depth Depth in the traversal at which
 *  the message should be logged.
 */
function log(msg, depth) {
  var whitespace = "";
  for (var i = 0; i < depth; i++) {
    whitespace += "  ";
  }
  console.log(whitespace + msg);
}

/**
 * Traversal that logs node types and values.
 * @type {[type]}
 */
var logger = traversal()
  .type('root', function (node, recur, depth) {
    log('Root', depth);
    recur.each(node.list);
  })
  .type('group', function (node, recur, depth) {
    log('Group', depth);
    recur.each(node.list);
  })
  .type('paren', function (node, recur, depth) {
    log('Paren', depth);
    recur.each(node.list);
  })
  .type('superscript', function (node, recur, depth) {
    log('Superscript', depth);
    recur(node.expr);
  })
  .type('subscript', function (node, recur, depth) {
    log('Subscript', depth);
    recur(node.expr);
  })
  .type('frac', function (node, recur, depth) {
    log('Frac', depth);
    log('  Numerator', depth);
    recur.each(node.numerator, depth+1);
    log('  Denominator:', depth);
    recur.each(node.denominator, depth+1);
  })
  .type('command', function (node, recur, depth) {
    log('Command = ' + node.name, depth);
  })
  .type('id', function (node, recur, depth) {
    log('Identifier = ' + node.name, depth);
  })
  .type('operator', function (node, recur, depth) {
    log('Operator = ' + node.name, depth);
  })
  .type('number', function (node, recur, depth) {
    log('Number = ' + node.number, depth);
  });

/**
 * Traverses a tree starting with the given node and
 * logs the types and values of nodes along the way.
 * @param  {Object} node Node for which to begin the traversal.
 */
function run(node) {
  return logger.run(node);
}

// Export the logger
module.exports = run;
