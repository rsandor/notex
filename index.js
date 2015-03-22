'use strict';

var notex = require('./lib/notex.js');
var exists = require('101/exists');

/* jshint ignore:start */
if (exists(window)) {
  window.notex = notex;
}
else if (exists(module)) {
  module.exports = notex;
}
/* jshint ignore:end */