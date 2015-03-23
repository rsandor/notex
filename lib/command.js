'use strict';

/**
 * Command type lookup map.
 * @type {Object}
 */
var commands = {};

/**
 * Greek letters.
 */
var lowerGreek = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta',
  'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron',
  'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
];

lowerGreek.forEach(function(name) {
  commands[name] = function() {
    return '<em>&' + name + ';</em>';
  };

  var capital = name.substr(0, 1).toUpperCase() + name.substr(1);
  commands[capital] = function() {
    return '&' + capital + ';';
  };
});


/**
 * Commands the map to a specific html escape sequence.
 */
var mapToSequence = {
  'pm': '&plusmn;',
  'cup': ' &#x22c3; ',
  'cap': ' &#x22c2; ',
  'in': ' &#8712; ',
  'notin': ' &#8713; '
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
  console.log(node.value, fn);
  return (!fn) ? ' ' + node.value + ' ' : fn();
}

module.exports = visitCommand;
