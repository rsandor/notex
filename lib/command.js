'use strict';

/**
 * Command type lookup map.
 * @type {Object}
 */
var commands = {};

/**
 * Greek letters.
 */
var greek = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota',
  'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau',
  'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta',
  'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi',
  'omicron',  'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
];

greek.forEach(function(name) {
  commands[name] = function() {
    return '<em>&' + name + ';</em>';
  };
});

/**
 * Commands the map to a specific html escape sequence.
 */
var mapToSequence = {
  'pm': '&plusmn;'
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
