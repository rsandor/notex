/**
 * Utility library for notex.
 * @module notex:util
 */

/**
 * Wraps the given value in a span with the supplied classes.
 * @param value Value to wrap.
 * @param {string} classes Class names for the span.
 * @return {string} Resulting HTML.
 */
function span(value, classes) {
  return ['<span class="', classes, '">', value, '</span>'].join('');
}

module.exports = {
  span: span
};
