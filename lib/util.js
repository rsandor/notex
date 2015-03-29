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

/**
 * Formats an HTML escape sequence.
 * @example
 * // returns '&alpha;'
 * esc('alpha');
 * @param  {string} seq Sequences of characters to escape.
 * @return {string} The escaped string.
 */
function esc(seq) {
  return ['&', seq, ';'].join('');
}

module.exports = {
  span: span,
  esc: esc
};
