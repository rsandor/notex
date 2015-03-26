'use strict';


var traversal = require('traversal');

/**
 * Tree traversal that logs node information. Helpful for
 * debugging changes to the parser.
 * @author Ryan Sandor Richards
 */

/**
 * Traversal that logs node types and values.
 * @type {TreeTraversal}
 */
var logger = traversal()
  .visit(function (node, recur, depth) {
    var msg = node.type;
    if (node.value) {
      msg += ' -> ' + node.value;
    }
    log(msg, depth);
  })
  .preorder('list', 'expr');

/**
 * Special visitor for `'frac'` type nodes.
 */
logger.property('type', 'frac', function (node, recur, depth) {
  log('Frac', depth);
  log('Numerator', depth + 1);
  recur.each(node.numerator, depth+2);
  log('Denominator:', depth + 1);
  recur.each(node.denominator, depth+2);
});

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
 * Traverses a tree starting with the given node and
 * logs the types and values of nodes along the way.
 * @param  {Object} node Node for which to begin the traversal.
 */
function walk(node) {
  return logger.walk(node);
}

// Export the logger
module.exports = walk;
