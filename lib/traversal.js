'use strict';
var exists = require('101/exists');
var debug = require('debug');
var warning = debug('notex:traversal:warning');

/**
 * Structure for representing "stream-style" tree traversals.
 * @author Ryan Sandor Richards
 */
function TreeTraversal() {
  this.handlers = {};
  this.defaultHandler = function() {};
  this.recurBeforeNames = [];
  this.recurAfterNames = [];
}

// Private methods

/**
 * Finds a handler for the given node.
 * @param  {Object} node Node for which to find the handler.
 * @return {TreeTraversal~handler} The handler for the node
 *  or the default handler if no specific handler was found.
 */
function findHandler(traversal, node) {
  var handler = traversal.defaultHandler;
  for (var propertyName in traversal.handlers) {
    if (!node.hasOwnProperty(propertyName)) {
      continue;
    }
    var value = node[propertyName];
    var propertyHandler = traversal.handlers[propertyName][value];
    if (exists(propertyHandler)) {
      handler = propertyHandler;
      break;
    }
  }
  return handler;
}

/**
 * Builds a recur callback for a given node at a given depth.
 * @param {Object} parent Parent node of the recur.
 * @param {Number} depth Depth of the parent node.
 * @return {TreeTraversal~recur} The recur method for the node and depth.
 */
function makeRecur(traversal, parent, depth) {
  var recur = function(node, givenDepth) {
    if (!givenDepth) {
      givenDepth = depth + 1;
    }
    traversal.run(node, givenDepth);
  };

  recur.performAutoTraversal = true;
  recur.stop = function() {
    recur.performAutoTraversal = false;
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
}

/**
 * Treats a given array as a set and adds a value only if
 * the value doesn't exist in the array.
 * @param {Array} set Set to modify
 * @param {*} value Value to add to the set.
 */
function addToSet(set, value) {
  if (~set.indexOf(value)) {
    return;
  }
  set.push(value);
}

/**
 * Adds all values to a set.
 * @see {@link addToSet}
 * @param {Array} set Set to modify.
 * @param {Array} values Values to add to the set.
 */
function allToSet(set, values) {
  var flat = [].concat.apply([], values);
  flat.forEach(function(value) {
    addToSet(set, value);
  });
}

// Public methods

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
TreeTraversal.prototype.handle = function(handler) {
  this.defaultHandler = handler;
  return this;
};

/**
 * Adds a node property name helper to the traversal.
 * @param {string} Property name helper to add.
 * @see {@link traverse} for usage via the factory method.
 */
TreeTraversal.prototype.addHelper = function(propertyName) {
  if (exists(this[propertyName])) {
    warning('Cannot create helper "' + propertyName + '", method already exists.');
    return;
  }
  this[propertyName] = function(value, handler) {
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
 * Set node properties that should be automatcally traversed
 * before handling node.
 * @param {...(string|string[])} propertyName Names of the
 *  properties that, given they exist, should be treated as
 *  nodes and automatically traversed.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.recurBefore = function() {
  var names = Array.prototype.slice.call(arguments);
  allToSet(this.recurBeforeNames, names);
  return this;
};

/**
 * Set node properties that should be automatically traversed
 * after handling a node.
 * @param {...(string|string[])} propertyName Names of the
 *  properties that, given they exist, should be treated as
 *  nodes and automatically traversed.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.recurAfter = function() {
  var names = Array.prototype.slice.call(arguments);
  allToSet(this.recurAfterNames, names);
  return this;
};

/**
 * Alias for `recurAfter`.
 * @see  {@link recurAfter}
 */
TreeTraversal.prototype.recurOn = TreeTraversal.prototype.recurAfter;

/**
 * Perform the traversal on a given node.
 * @param {Object} node Root node to traverse.
 * @param {Number} [depth] Current depth of the traversal.
 */
TreeTraversal.prototype.walk = function(node, depth) {
  if (!depth) {
    depth = 0;
  }
  var handler = findHandler(this, node);
  var recur = makeRecur(this, node, depth);

  // TODO Going to need a way to turn this off as a special case.
  this.recurBeforeNames.forEach(function(name) {
    if (exists(node[name])) {
      recur(node[name], depth);
    }
  });

  var result = handler.call(this, node, recur, depth);

  if (recur.performAutoTraversal) {
    this.recurAfterNames.forEach(function(name) {
      if (exists(node[name])) {
        if (Array.isArray(node[name])) {
          recur.each(node[name], depth+1);
        }
        else {
          recur(node[name], depth+1);
        }
      }
    });
  }

  return result;
};

/**
 * Alias for `walk`.
 * @see  {@link recurAfter}
 */
TreeTraversal.prototype.run = TreeTraversal.prototype.walk;

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

/**
 * Stop automatic traversal for names defined with `recurBefore`
 * and `recurAfter`.
 * @callback TreeTraversal~recur.stop
 */

// Export the factory method.
module.exports = traverse;
