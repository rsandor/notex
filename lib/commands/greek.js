'use strict';

/**
 * Greek letter commands.
 * @author Ryan Sandor Richards
 */

var command = require('../command');
var span = require('../util').span;
var esc = require('../util').esc;

var greek = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta',
  'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron',
  'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
];

greek.forEach(function(name) {
  // Lower case greek letters should be treated as identifiers
  command.register(name, function() {
    return span(esc(name), 'notex-id');
  });

  // Capital letters should not be italic
  var capital = name.substr(0, 1).toUpperCase() + name.substr(1);
  command.register(capital, function() {
    return span(esc(capital), 'notex-id notex-plain');
  });
});
