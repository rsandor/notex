var exists = require('101/exists');
var debug = require('debug');
var warning = debug('notex:traversal:warning');

/**
 * Structure for representing "stream-style" tree traversals.
 * @author Ryan Sandor Richards
 */
function TreeTraversal() {
  this.handlers = {};
  this.defaultNodeHandler = function() {};
}

/**
 * Adds a traversal handler for a given node key and values.
 * The traversal will apply the handler for a node only if
 * the node has a property name (`key`) that equals the given
 * value (`value`).
 *
 * @example
 * // Add a handler for all `node.type === 'number'`
 * traversal().addHandler('type', 'number', function(node, recur) {
 *  // Do something with the `node` and possibly `recur` on its
 *  // children.
 * });
 *
 * @param {string} key Key associated with the handler.
 * @param {string} value Value required to run the handler.
 * @param {TreeTraversal~handler} handler Function that handles
 *  the traversal at a node which has the given property
 *  equal to the given value.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.addHandler = function(key, value, handler) {
  if (!exists(this.handlers[key])) {
    this.handlers[key] = {};
  }
  this.handlers[key][value] = handler;
  return this;
};

/**
 * Sets the default handler for the traversal.
 * @param  {TreeTraversal~handler} handler Default handler to set.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.defaultHandler = function(handler) {
  this.defaultNodeHandler = handler;
  return this;
};

/**
 * Adds a node property name helper to the traversal.
 * @param {string} Property name helper to add.
 * @see {@link traverse} for usage via the factory method.
 */
TreeTraversal.prototype.addHelper = function(propertyName) {
  if (exists(traversal[propertyName])) {
    warning('Cannot create helper "' + propertyName + '", method already exists.');
    return;
  }
  traversal[propertyName] = function(value, handler) {
    return this.addHandler(propertyName, value, handler);
  };
};

/**
 * Helper method for registering handlers on the `type` property.
 *
 * @example
 * // Handles nodes such that `node.type === 'group'`.
 * traversal().type('group', function(node, recur) {
 *  // Do something for a 'group' type node...
 * });
 *
 * @param  {string} type Value of the type to match against `node.type`.
 * @param  {TreeTraversal~handler} handler Hander for the given node type.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.type = function(type, handler) {
  return this.addHandler('type', type, handler);
};

/**
 * Finds a handler for the given node.
 * @param  {Object} node Node for which to find the handler.
 * @return {TreeTraversal~handler} The handler for the node
 *  or `null` if no such handler was found.
 */
TreeTraversal.prototype._findHandler = function(node) {
  var handler = null;
  for (var propertyName in this.handlers) {
    if (!node.hasOwnProperty(propertyName)) {
      continue;
    }
    var value = node[propertyName];
    handler = this.handlers[propertyName][value];
    if (exists(handler)) {
      break;
    }
  }
  return handler;
};

/**
 * Builds a recur callback for a given node at a given depth.
 * @param {Object} parent Parent node of the recur.
 * @param {Number} depth Depth of the parent node.
 * @return {TreeTraversal~recur} The recur method for the node and depth.
 */
TreeTraversal.prototype._makeRecur = function(parent, depth) {
  var traverse = this;
  var recur = function(node, givenDepth) {
    if (!givenDepth) {
      givenDepth = depth + 1;
    }
    traverse.run(node, givenDepth);
  };
  recur.each = function(list, givenDepth) {
    if (!givenDepth) {
      givenDepth = depth + 1;
    }
    list.forEach(function(node) {
      recur(node, givenDepth);
    });
  };
  return recur;
};

/**
 * Perform the traversal on a given node.
 * @param {Object} node Root node to traverse.
 * @param {Number} [depth] Current depth of the traversal.
 */
TreeTraversal.prototype.run = function(node, depth) {
  if (!depth) {
    depth = 0;
  }
  var handler = this._findHandler(node);
  if (exists(handler)) {
    var recur = this._makeRecur(node, depth);
    return handler.call(this, node, recur, depth);
  }
};

/**
 * Factory method for creating new tree traversals.
 * This is the only method exposed via the exports.
 *
 * @example
 * // Basic usage
 * traversal()
 *  // Handle nodes with `.name === 'wowza'`
 *  .addHandler('name', 'wowza', function(node, recur) {})
 *
 *  // Handle nodes with `.name === 'gene'`
 *  .addHandler('name', 'gene', function(node, recur) {})
 *
 *  // Handle nodes with `.value === 42`
 *  .addHandler('value', 42, function(node, recur) {})
 *
 *  // Run the traversal on a root node
 *  .run(rootNode);
 *
 * @example
 * // Add helper method to make thing faster
 * traversal(['name', 'value'])
 *  .name('wowza', function(node, recur) {})
 *  .name('gene', function(node, recur) {})
 *  .value(42, function(node, recur) {})
 *  .run(rootNode);
 *
 * @param {Array} helper List of node properties for which
 *  to add helper methods to the tree traversal.
 * @return {TreeTraversal} a new tree traversal.
 */
function traverse(helpers) {
  var traversal = new TreeTraversal();
  if (exists(helpers) && Array.isArray(helpers)) {
    helpers.forEach(function(propertyName) {
      traversal.addHelper(propertyName);
    });
  }
  return traversal;
}

// Callback descriptions

/**
 * Performs operations on a given node during a tree traversal.
 * @callback TreeTraversal~handler
 * @param {Object} node Node currently being handled during the traversal.
 * @param {TreeTraversal~recur} recur Continues the traversal on a given node.
 * @param {Number} depth Current depth of the traversal.
 */

/**
 * Recurs further into the traversal given the next node.
 * @callback TreeTraversal~recur
 * @param {Object} node Node on which to continue the traversal.
 * @param {Number} [givenDepth] Traversal depth override.
 */

/**
 * Recurs further in the traversal for each node in a given array.
 * @callback TreeTraversal~recur.each
 * @param {Array} list Array of nodes to traverse.
 * @param {Number} [givenDepth] Traversal depth override.
 */

// Export the factory method.
module.exports = traverse;
