'use strict';

var span = require('./util').span;

/**
 * Command type lookup map.
 * @type {Object}
 */
var commands = {};

/**
 * Greek letters.
 */
var greek = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta',
  'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron',
  'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
];

greek.forEach(function(name) {
  // Lower case greek letters should be italic
  commands[name] = function() {
    return span('&'+name+';', 'notex-id');
  };

  // Capital letters should not be italic
  var capital = name.substr(0, 1).toUpperCase() + name.substr(1);
  commands[capital] = function() {
    return span('&' + capital + ';', 'notex-id notex-plain');
  };
});


/**
 * Commands the map to a specific html escape sequence.
 */
var mapToSequence = {
  'pm': span('&plusmn;', 'notex-operator'),
  'cup': span('&#x22c3;', 'notex-operator'),
  'cap': span('&#x22c2;', 'notex-operator'),
  'in': span('&#8712;', 'notex-operator'),
  'notin': span('&#8713;', 'notex-operator')
};

var mapToSequenceKeys = [];
for (var name in mapToSequence) {
  mapToSequenceKeys.push(name);
}

mapToSequenceKeys.forEach(function (name) {
  commands[name] = function() {
    return mapToSequence[name];
  };
});

/**
 * Handles `command` type nodes when rendering html
 */
function visitCommand(node, recur) {
  var fn = commands[node.value];
  return (!fn) ? ' ' + node.value + ' ' : fn();
}

module.exports = visitCommand;
