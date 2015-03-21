'use strict';

var grammar = require('./grammar.js');

/**
 * Renderinge engine for NoTex.
 * @author Ryan Sandor Richards
 */
function NoTex() {
  this.grammar = grammar;
}

/**
 * Renders given NoTex as HTML.
 * @param  {string} src NoTex source to render as html.
 * @return {string} HTML rendering of the given source.
 */
NoTex.prototype.render = function(src) {
  return '';
};

/**
 * Sets the engine's grammar.
 * @param {Object} Grammar to use for the engine.
 */
NoTex.prototype.setGrammar = function(grammar) {
  this.grammar = grammar;
};

/**
 * @return {Object} The engine's grammar.
 */
NoTex.prototype.getGrammar = function() {
  return this.grammar;
};

/**
 * Default rendering engine for NoTex.
 * @type {NoTex}
 */
var defaultEngine = new NoTex();

/**
 * Helper function to render NoTex source using the default engine.
 * @see {@link NoTex.prototype.render} for more information.
 */
function defaultRender(src) {
  return defaultEngine.render(src);
}

/**
 * Module exports.
 */
module.exports = {
  engine: defaultEngine,
  render: defaultRender,
  NoTex: NoTex
};
