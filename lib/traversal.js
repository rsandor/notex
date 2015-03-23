'use strict';
var exists = require('101/exists');
var debug = require('debug');
var warning = debug('notex:traversal:warning');

/**
 * Helper class for defining tree traversals.
 * @author Ryan Sandor Richards
 */
function TreeTraversal() {
  this.visitors = {};
  this.visitor = function() {};
  this.preorderProperties = [];
  this.postorderProperties = [];
}

// Private methods

/**
 * Given a traversal and a node, this method find the appropriate
 * visitor for the node.
 * @param {TreeTraversal} traversal Traversal the contains the
 *  visitor.
 * @param  {Object} node Node for which to find the visitor.
 * @return {TreeTraversal~visitorCallback} The visitor for the node
 *  or the default visitor if no, more specific, one could be found.
 */
function findVisitor(traversal, node) {
  var visitor = traversal.visitor;
  for (var propertyName in traversal.visitors) {
    if (!node.hasOwnProperty(propertyName)) {
      continue;
    }
    var value = node[propertyName];
    var propertyHandler = traversal.visitors[propertyName][value];
    if (exists(propertyHandler)) {
      visitor = propertyHandler;
      break;
    }
  }
  return visitor;
}

/**
 * Builds a recursive traversal callback for a given node at a given depth.
 * @param {Object} parent Parent node of the recur.
 * @param {Number} depth Depth of the parent node.
 * @return {TreeTraversal~recur} The recur method for the node and depth.
 */
function makeRecurCallback(traversal, parent, depth) {
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
 * Defines a new visitor that only applies to nodes that have a given
 * property set to the given value. If `node` is the node currently
 * being visited in the traversal, then this will only apply if
 * `node[property] === value`.
 *
 * @example
 * // Add a visitor for all `node.type === 'number'`
 * traversal().property('type', 'number', function(node, recur) {
 *  // Do something with the `node` and possibly `recur` on its
 *  // children.
 * });
 *
 * @param {string} key Key the node must have.
 * @param {string} value Value the node must have at the given key.
 * @param {TreeTraversal~visitorCallback} visitor Visitor callback
 *  to apply when `node[key] === value`.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.property = function(key, value, visitor) {
  if (!exists(this.visitors[key])) {
    this.visitors[key] = {};
  }
  this.visitors[key][value] = visitor;
  return this;
};

/**
 * Sets the default visitor for the traversal.
 * @param  {TreeTraversal~visitorCallback} visitor Default visitor to set.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.visit = function(visitor) {
  this.visitor = visitor;
  return this;
};

/**
 * Adds a node property name helper to the traversal.
 *
 * @example
 * // Create a couple property helpers for the traversal
 * var myTraversal = traversal()
 *  .addPropertyHelper('name')
 *  .addPropertyHelper('coolness')
 * // Use it to quickly handle special cases
 * myTraversal
 *  .name('ryan', function() { console.log('Ryan found'); })
 *  .name('ryan', function() { console.log('Airiel found'); })
 *  .name('nallely', function() { console.log('Nallely found'); })
 *  .coolness('totally', function() { console.log('Totally cool'); })
 *
 * @param {string} Property name helper to add.
 * @see {@link traverse} for usage via the factory method.
 */
TreeTraversal.prototype.addPropertyHelper = function(propertyName) {
  if (exists(this[propertyName])) {
    warning('Cannot create helper "' + propertyName + '", method already exists.');
    return;
  }
  this[propertyName] = function(value, visitor) {
    return this.addHandler(propertyName, value, visitor);
  };
};

/**
 * Helper method for registering visitors on the `type` property.
 *
 * @example
 * // Handles nodes such that `node.type === 'group'`.
 * traversal().type('group', function(node, recur) {
 *  // Do something for a 'group' type node...
 * });
 *
 * @param  {string} type Value of the type to match against `node.type`.
 * @param  {TreeTraversal~visitor} visitor Visitor closure for
 *  nodes of the given type.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.type = function(type, visitor) {
  return this.property('type', type, visitor);
};

/**
 * Adds node property names to the traversal that should
 * be recursively traversed *after* the node has been visited.
 * @param {...(string|string[])} propertyName Node property
 *  names that, if exist, should be automatically traversed.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.preorder = function() {
  var names = Array.prototype.slice.call(arguments);
  allToSet(this.preorderProperties, names);
  return this;
};

/**
 * Adds node property names to the traversal that should
 * be recursively traversed *before* the node has been visited.
 * @param {...(string|string[])} propertyName Node property
 *  names that, if exist, should be automatically traversed.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.postorder = function() {
  var names = Array.prototype.slice.call(arguments);
  allToSet(this.postorderProperties, names);
  return this;
};

/**
 * Perform the traversal on a given node.
 * @param {Object} node Root node to traverse.
 * @param {Number} [depth] Current depth of the traversal.
 */
TreeTraversal.prototype.walk = function(node, depth) {
  if (!depth) {
    depth = 0;
  }
  var visitor = findVisitor(this, node);
  var recur = makeRecurCallback(this, node, depth);

  // TODO Going to need a way to turn this off as a special case.
  this.postorderProperties.forEach(function(name) {
    if (exists(node[name])) {
      recur(node[name], depth);
    }
  });

  var result = visitor.call(this, node, recur, depth);

  if (recur.performAutoTraversal) {
    this.preorderProperties.forEach(function(name) {
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
 * @see  {@link walk}
 */
TreeTraversal.prototype.traverse = TreeTraversal.prototype.walk;

/**
 * Alias for `walk`.
 * @see  {@link walk}
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
 * @callback TreeTraversal~visitorCallback
 * @param {Object} node Node currently being visited during the traversal.
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
 * Stop automatic traversal for names defined with `preorder`
 * and `postorder`.
 * @callback TreeTraversal~recur.stop
 */

// Export the factory method.
module.exports = traverse;
