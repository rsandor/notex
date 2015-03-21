'use strict';

var exists = require('101/exists');
var notex = require('./lib/notex.js');

if (exists(window)) {
  window.notex = notex;
}
else {
  module.exports = notex;
}
