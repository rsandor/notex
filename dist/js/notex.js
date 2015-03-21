(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Renderinge engine for NoTex.
 * @author Ryan Sandor Richards
 */
function NoTex() {
}

/**
 * Renders given NoTex as HTML.
 * @param  {string} src NoTex source to render as html.
 * @return {string} HTML rendering of the given source.
 */
NoTex.prototype.render = function(src) {
  console.log("WHAAAT?");
  return '';
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
function render(src) {
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

},{}]},{},[1]);
