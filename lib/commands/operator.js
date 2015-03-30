'use strict';

/**
 * Operator commands.
 * @author Ryan Sandor Richards
 */

var command = require('../command');
var span = require('../util').span;
var esc = require('../util').esc;

// missing: \star

// sequence commands
var map = {
  'ast': '#8727', 'pm': 'plusmn', 'cap': '#x22c2', 'lhd': '#8882',
  'mp': '#8723', 'cup': '#x22c3', 'rhd': '#8883',
  'cdot': '#8729',

  'leq': '#8804', 'le': '#8804',
  'geq': '#8805', 'ge': '#8805',
  'equiv': '#8801',
  'models': '#8872',
  'prec': '#8826',
  'succ': '#8827',
  'preceq': '#8828',
  'succeq': '#8829',

  'in': '#8712',
  'notin': '#8713'
};

var keys = [];
for (var name in map) {
  keys.push(name);
}

keys.forEach(function (name) {
  command.register(name, function() {
    var sequence = map[name];
    return span(esc(sequence), 'notex-operator');
  });
});

// Specific commands

command.register('sim', function() {
  return span('~', 'notex-operator');
});

command.register('perp', function() {
  return span(esc('#8866'), 'notex-operator notex-rotate-270');
});

command.register('amalg', function() {
  return span(esc('#8719'), 'notex-operator');
});

command.register('langle', function() {
  return span(esc('#9001'), 'notex-paren notex-langle');
});

command.register('rangle', function() {
  return span(esc('#9002'), 'notex-paren notex-rangle');
});

