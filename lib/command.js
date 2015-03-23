'use strict';

/**
 * Commands that can be directly converted into html.
 * @type {Array}
 */
var direct = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota',
  'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau',
  'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta',
  'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi',
  'omicron',  'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
];

/**
 * Command type lookup map.
 * @type {Object}
 */
var commandType = {};

direct.forEach(function(command) {
  commandType[command] = 'direct';
});

/**
 * Handles `command` type nodes when rendering html
 */
function command(node, recur) {
  var name = node.value;
  var type = commandType[name];

  switch (type) {
    case 'direct':
      return '&' + name + ';';
  }

  return ' ' + name + ' ';
}

module.exports = command;