'use strict';

/**
 * Operator commands.
 * @author Ryan Sandor Richards
 */

var command = require('../command');
var span = require('../util').span;
var esc = require('../util').esc;

var map = {
  'pm': 'plusmn',
  'cup': '#x22c3',
  'cap': '#x22c2',
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
