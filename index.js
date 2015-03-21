'use strict';

var notex = require('./lib/notex.js');

/* jshint ignore:start */
if (typeof window !== 'undefined' && typeof window !== null) {
  window.notex = notex;
}
else {
  module.exports = notex;
}
/* jshint ignore:end */