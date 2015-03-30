'use strict';

/**
 * Responsible for command registration and node visiting.
 * @author Ryan Sandor Richards
 */

/**
 * Command type lookup map.
 * @type {Object}
 */
var commands = {};

/**
 * Registers a command with the given name.
 * @param {string} name Name of the command.
 * @param {function} fn Command function.
 */
function register(name, fn) {
  commands[name] = fn;
}

/**
 * Handles `command` type nodes when rendering html
 * @param {Object} node Node currently being visited.
 * @param {function} recur Recursive callback.
 */
function visit(node, recur) {
  var fn = commands[node.value];
  return (!fn) ? node.value : fn();
}

module.exports = {
  register: register,
  visit: visit
};
