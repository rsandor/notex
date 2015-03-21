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