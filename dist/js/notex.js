(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./lib/notex.js":4,"101/exists":7}],2:[function(require,module,exports){
'use strict';

/**
 * Command type lookup map.
 * @type {Object}
 */
var commands = {};

/**
 * Greek letters.
 */
var greek = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota',
  'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau',
  'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta',
  'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi',
  'omicron',  'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
];

greek.forEach(function(name) {
  commands[name] = function() {
    return '<em>&' + name + ';</em>';
  };
});

/**
 * Commands the map to a specific html escape sequence.
 */
var mapToSequence = {
  'pm': '&plusmn;'
};

var mapToSequenceKeys = [];
for (var name in mapToSequence) {
  mapToSequenceKeys.push(name);
}

mapToSequenceKeys.forEach(function (name) {
  commands[name] = function() {
    return mapToSequence[name];
  };
});

/**
 * Handles `command` type nodes when rendering html
 */
function visitCommand(node, recur) {
  var fn = commands[node.value];
  console.log(node.value, fn);
  return (!fn) ? ' ' + node.value + ' ' : fn();
}

module.exports = visitCommand;

},{}],3:[function(require,module,exports){
'use strict';

/**
 * Tree traversal that logs node information. Helpful for
 * debugging changes to the parser.
 * @author Ryan Sandor Richards
 */

var traversal = require('./traversal');

/**
 * Logs a message with indentation to denote depth
 * within the tree.
 * @param  {Object} msg Message to log.
 * @param  {Number} depth Depth in the traversal at which
 *  the message should be logged.
 */
function log(msg, depth) {
  var whitespace = "";
  for (var i = 0; i < depth; i++) {
    whitespace += "  ";
  }
  console.log(whitespace + msg);
}

/**
 * Traversal that logs node types and values.
 * @type {TreeTraversal}
 */
var logger = traversal()
  .visit(function (node, recur, depth) {
    var msg = node.type;
    if (node.value) {
      msg += ' -> ' + node.value;
    }
    log(msg, depth);
  })
  .preorder('list', 'expr');

/**
 * Special visitor for `'frac'` type nodes.
 */
logger.property('type', 'frac', function (node, recur, depth) {
  log('Frac', depth);
  log('Numerator', depth + 1);
  recur.each(node.numerator, depth+2);
  log('Denominator:', depth + 1);
  recur.each(node.denominator, depth+2);
});

/**
 * Traverses a tree starting with the given node and
 * logs the types and values of nodes along the way.
 * @param  {Object} node Node for which to begin the traversal.
 */
function run(node) {
  return logger.run(node);
}

// Export the logger
module.exports = run;

},{"./traversal":6}],4:[function(require,module,exports){
'use strict';

var logger = require('./logger');
var parser = require('./parser');
var traversal = require('./traversal');
var command = require('./command');

/**
 * notex to HTML renderer.
 * @type {TreeTraversal}
 */
var renderer = traversal()
  .addPropertyHelper('type');

renderer.type('root', function(node, recur) {
  if (!Array.isArray(node.list)) {
    return '';
  }
  return recur.each(node.list).trim();
});

renderer.type('group', function (node, recur) {
  if (!Array.isArray(node.list)) {
    return '';
  }
  return ' ' + recur.each(node.list) + ' ';
});

renderer.type('paren', function (node, recur) {
  // TODO Add progressively larger parens when nested, etc.
  // TODO Frac will have to increase paren size as well
  return '(' + recur.each(node.list) + ')';
});

renderer.type('superscript', function (node, recur) {
  return '<sup>' + recur(node.expr) + '</sup>';
});

renderer.type('subscript', function (node, recur) {
  return '<sub>' + recur(node.expr) + '</sub>';
});

renderer.type('frac', function (node, recur) {
  // TODO Need real fraction rendering
  return recur(node.numerator) + '/' + recur(node.denominator);
});

renderer.type('command', command);

renderer.type('id', function (node, recur) {
  return '<em>' + node.value + '</em>';
});

renderer.type('operator', function (node, recur) {
  return ' ' + node.value + ' ';
});

renderer.type('number', function (node, recur) {
  return node.value;
});

/**
 * Parses given notex source and forms an abstract syntax tree.
 * @param  {string} src Source to parse.
 * @return {object} The abstract syntax tree for the given source.
 * @throws {SyntaxError} If the given source is not valid notex.
 */
var parse = parser.parse;

/**
 * Renders given notex source as HTML.
 * @param {string} src notex source to render as html.
 * @param {boolean} debug If `true` log the resulting ast.
 * @return {string} HTML rendering of the given source.
 */
function render(src, debug) {
  var ast = parse(src);
  if (debug) {
    logger(ast);
  }
  return renderer.walk(ast);
}

/**
 * Module exports.
 */
module.exports = {
  render: render
};

},{"./command":2,"./logger":3,"./parser":5,"./traversal":6}],5:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = function(list) {
            return {
              type: 'root',
              list: list
            };
          },
        peg$c1 = { type: "other", description: "List of expressions" },
        peg$c2 = peg$FAILED,
        peg$c3 = [],
        peg$c4 = function(first, rest) {
            rest = rest.map(function(a) { return a[1]; });
            rest.unshift(first);
            return rest;
          },
        peg$c5 = { type: "other", description: "Single expression" },
        peg$c6 = "{",
        peg$c7 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c8 = "}",
        peg$c9 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c10 = function(list) {
            return {
              type: 'group',
              list: list
            };
          },
        peg$c11 = "(",
        peg$c12 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c13 = ")",
        peg$c14 = { type: "literal", value: ")", description: "\")\"" },
        peg$c15 = function(list) {
            return {
              type: 'paren',
              exprList: list
            };
          },
        peg$c16 = function(expr) {
            return {
              type: 'superscript',
              expr: expr
            };
          },
        peg$c17 = function(expr) {
            return {
              type: 'subscript',
              expr: expr
            };
          },
        peg$c18 = "frac",
        peg$c19 = { type: "literal", value: "frac", description: "\"frac\"" },
        peg$c20 = function(numerator, denominator) {
            return {
              type: 'frac',
              numerator: numerator,
              denominator: denominator
            };
          },
        peg$c21 = function(command) {
            return { type: 'command', value: command };
          },
        peg$c22 = function(name) {
            return { type: 'id', value: name };
          },
        peg$c23 = function(number) {
            return { type: 'number', value: number };
          },
        peg$c24 = function(name) {
            return { type: 'operator', value: name };
          },
        peg$c25 = { type: "other", description: "Escape character ''" },
        peg$c26 = "\\",
        peg$c27 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c28 = { type: "other", description: "Superscript character '^'" },
        peg$c29 = "^",
        peg$c30 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c31 = { type: "other", description: "Subscript character '_'" },
        peg$c32 = "_",
        peg$c33 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c34 = { type: "other", description: "identifier" },
        peg$c35 = /^[a-zA-Z]/,
        peg$c36 = { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
        peg$c37 = function(name) { return name.toString(); },
        peg$c38 = { type: "other", description: "operator" },
        peg$c39 = /^[`~!@#$%\^&*\-_=+\\|;:'",<.>\/?]/,
        peg$c40 = { type: "class", value: "[`~!@#$%\\^&*\\-_=+\\\\|;:'\",<.>\\/?]", description: "[`~!@#$%\\^&*\\-_=+\\\\|;:'\",<.>\\/?]" },
        peg$c41 = { type: "other", description: "decimal numbers" },
        peg$c42 = null,
        peg$c43 = /^[\-]/,
        peg$c44 = { type: "class", value: "[\\-]", description: "[\\-]" },
        peg$c45 = /^[0-9]/,
        peg$c46 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c47 = { type: "other", description: "optional whitespace" },
        peg$c48 = /^[ \t\r\n]/,
        peg$c49 = { type: "class", value: "[ \\t\\r\\n]", description: "[ \\t\\r\\n]" },
        peg$c50 = { type: "other", description: "mandatory whitespace" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseexprList();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c0(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseexprList() {
      var s0, s1, s2, s3, s4, s5, s6;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseexpr();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseexpr();
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c2;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseexpr();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c4(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c1); }
      }

      return s0;
    }

    function peg$parseexpr() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c6;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c7); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseexprList();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c8;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c9); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c10(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s2 = peg$c11;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c12); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseexprList();
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s6 = peg$c13;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c14); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c15(s4);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsesup();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseexpr();
                if (s4 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c16(s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsesub();
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseexpr();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c17(s4);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseesc();
              if (s1 !== peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c18) {
                  s2 = peg$c18;
                  peg$currPos += 4;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c19); }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parse_();
                  if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 123) {
                      s4 = peg$c6;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c7); }
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parse_();
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parseexprList();
                        if (s6 !== peg$FAILED) {
                          s7 = peg$parse_();
                          if (s7 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 125) {
                              s8 = peg$c8;
                              peg$currPos++;
                            } else {
                              s8 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c9); }
                            }
                            if (s8 !== peg$FAILED) {
                              s9 = peg$parse_();
                              if (s9 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 123) {
                                  s10 = peg$c6;
                                  peg$currPos++;
                                } else {
                                  s10 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c7); }
                                }
                                if (s10 !== peg$FAILED) {
                                  s11 = peg$parse_();
                                  if (s11 !== peg$FAILED) {
                                    s12 = peg$parseexprList();
                                    if (s12 !== peg$FAILED) {
                                      s13 = peg$parse_();
                                      if (s13 !== peg$FAILED) {
                                        if (input.charCodeAt(peg$currPos) === 125) {
                                          s14 = peg$c8;
                                          peg$currPos++;
                                        } else {
                                          s14 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c9); }
                                        }
                                        if (s14 !== peg$FAILED) {
                                          peg$reportedPos = s0;
                                          s1 = peg$c20(s6, s12);
                                          s0 = s1;
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$c2;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c2;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c2;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c2;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c2;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c2;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c2;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c2;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseesc();
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseid();
                  if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c21(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseid();
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c22(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsenumber();
                    if (s1 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c23(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parseop();
                      if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c24(s1);
                      }
                      s0 = s1;
                    }
                  }
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c5); }
      }

      return s0;
    }

    function peg$parseesc() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 92) {
        s0 = peg$c26;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c25); }
      }

      return s0;
    }

    function peg$parsesup() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 94) {
        s0 = peg$c29;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c28); }
      }

      return s0;
    }

    function peg$parsesub() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 95) {
        s0 = peg$c32;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c33); }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }

      return s0;
    }

    function peg$parseid() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      if (peg$c35.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c35.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c36); }
          }
        }
      } else {
        s2 = peg$c2;
      }
      if (s2 !== peg$FAILED) {
        s2 = input.substring(s1, peg$currPos);
      }
      s1 = s2;
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c37(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c34); }
      }

      return s0;
    }

    function peg$parseop() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      if (peg$c39.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      if (peg$c43.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$c42;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c45.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$c45.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c46); }
            }
          }
        } else {
          s3 = peg$c2;
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c48.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c48.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }

      return s0;
    }

    function peg$parse__() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c48.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c48.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c49); }
          }
        }
      } else {
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c50); }
      }

      return s0;
    }


      /**
       * Context free grammar for notex.
       * @author Ryan Sandor Richards.
       */


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
},{}],6:[function(require,module,exports){
'use strict';
var exists = require('101/exists');
var debug = require('debug');
var warning = debug('notex:traversal:warning');

/**
 * Helper class for defining tree traversals.
 * @author Ryan Sandor Richards
 */
function TreeTraversal() {
  this.visitors = {};
  this.visitor = function() {};
  this.preorderProperties = [];
  this.postorderProperties = [];
}

// Private methods

/**
 * Given a traversal and a node, this method find the appropriate
 * visitor for the node.
 * @param {TreeTraversal} traversal Traversal the contains the
 *  visitor.
 * @param  {Object} node Node for which to find the visitor.
 * @return {TreeTraversal~visitorCallback} The visitor for the node
 *  or the default visitor if no, more specific, one could be found.
 */
function findVisitor(traversal, node) {
  var visitor = traversal.visitor;
  for (var propertyName in traversal.visitors) {
    if (!node.hasOwnProperty(propertyName)) {
      continue;
    }
    var value = node[propertyName];
    var propertyHandler = traversal.visitors[propertyName][value];
    if (exists(propertyHandler)) {
      visitor = propertyHandler;
      break;
    }
  }
  return visitor;
}

/**
 * Builds a recursive traversal callback for a given node at a given depth.
 * @param {Object} parent Parent node of the recur.
 * @param {Number} depth Depth of the parent node.
 * @return {TreeTraversal~recur} The recur method for the node and depth.
 */
function makeRecurCallback(traversal, parent, depth) {
  var recur = function(node, givenDepth) {
    if (!givenDepth) {
      givenDepth = depth + 1;
    }
    return traversal.run(node, givenDepth);
  };

  recur.performAutoTraversal = true;
  recur.stop = function() {
    recur.performAutoTraversal = false;
  };

  recur.each = function(list, givenDepth) {
    if (!givenDepth) {
      givenDepth = depth + 1;
    }

    // TODO: This will work for now, but is not very generalized
    // considering we don't know what the user will be returning
    // from a visit method.
    return list.map(function (node) {
      return recur(node, givenDepth);
    }).reduce(function (left, right) {
      return left + right;
    }, "");
  };
  return recur;
}

/**
 * Treats a given array as a set and adds a value only if
 * the value doesn't exist in the array.
 * @param {Array} set Set to modify
 * @param {*} value Value to add to the set.
 */
function addToSet(set, value) {
  if (~set.indexOf(value)) {
    return;
  }
  set.push(value);
}

/**
 * Adds all values to a set.
 * @see {@link addToSet}
 * @param {Array} set Set to modify.
 * @param {Array} values Values to add to the set.
 */
function allToSet(set, values) {
  var flat = [].concat.apply([], values);
  flat.forEach(function(value) {
    addToSet(set, value);
  });
}

// Public methods

/**
 * Defines a new visitor that only applies to nodes that have a given
 * property set to the given value. If `node` is the node currently
 * being visited in the traversal, then this will only apply if
 * `node[property] === value`.
 *
 * @example
 * // Add a visitor for all `node.type === 'number'`
 * traversal().property('type', 'number', function(node, recur) {
 *  // Do something with the `node` and possibly `recur` on its
 *  // children.
 * });
 *
 * @param {string} key Key the node must have.
 * @param {string} value Value the node must have at the given key.
 * @param {TreeTraversal~visitorCallback} visitor Visitor callback
 *  to apply when `node[key] === value`.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.property = function(key, value, visitor) {
  if (!exists(this.visitors[key])) {
    this.visitors[key] = {};
  }
  this.visitors[key][value] = visitor;
  return this;
};

/**
 * Sets the default visitor for the traversal.
 * @param  {TreeTraversal~visitorCallback} visitor Default visitor to set.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.visit = function(visitor) {
  this.visitor = visitor;
  return this;
};

/**
 * Adds a node property name helper to the traversal. Note that
 * property names that correspond to methods on the traversal
 * will be ignored.
 *
 * @example
 * // Create a couple property helpers for the traversal
 * var myTraversal = traversal()
 *  .addPropertyHelper('name')
 *  .addPropertyHelper('coolness')
 * // Use it to quickly handle special cases
 * myTraversal
 *  .name('ryan', function() { console.log('Ryan found'); })
 *  .name('ryan', function() { console.log('Airiel found'); })
 *  .name('nallely', function() { console.log('Nallely found'); })
 *  .coolness('totally', function() { console.log('Totally cool'); })
 *
 * @param {string} Property name helper to add.
 * @return {TreeTraversal} This tree traversal (for chaining).
 * @see {@link traverse} for usage via the factory method.
 */
TreeTraversal.prototype.addPropertyHelper = function(propertyName) {
  if (exists(this[propertyName])) {
    warning('Cannot create helper "' + propertyName + '", method already exists.');
    return;
  }
  this[propertyName] = function(value, visitor) {
    return this.property(propertyName, value, visitor);
  };
  return this;
};

/**
 * Adds node property names to the traversal that should
 * be recursively traversed *after* the node has been visited.
 * @param {...(string|string[])} propertyName Node property
 *  names that, if exist, should be automatically traversed.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.preorder = function() {
  var names = Array.prototype.slice.call(arguments);
  allToSet(this.preorderProperties, names);
  return this;
};

/**
 * Adds node property names to the traversal that should
 * be recursively traversed *before* the node has been visited.
 * @param {...(string|string[])} propertyName Node property
 *  names that, if exist, should be automatically traversed.
 * @return {TreeTraversal} This tree traversal (for chaining).
 */
TreeTraversal.prototype.postorder = function() {
  var names = Array.prototype.slice.call(arguments);
  allToSet(this.postorderProperties, names);
  return this;
};

/**
 * Perform the traversal on a given node.
 * @param {Object} node Root node to traverse.
 * @param {Number} [depth] Current depth of the traversal.
 */
TreeTraversal.prototype.walk = function(node, depth) {
  if (!depth) {
    depth = 0;
  }
  var visitor = findVisitor(this, node);
  var recur = makeRecurCallback(this, node, depth);

  // TODO Going to need a way to turn this off as a special case.
  this.postorderProperties.forEach(function(name) {
    if (exists(node[name])) {
      recur(node[name], depth);
    }
  });

  var result = visitor.call(this, node, recur, depth);

  if (recur.performAutoTraversal) {
    this.preorderProperties.forEach(function(name) {
      if (exists(node[name])) {
        if (Array.isArray(node[name])) {
          recur.each(node[name], depth+1);
        }
        else {
          recur(node[name], depth+1);
        }
      }
    });
  }

  return result;
};

/**
 * Alias for `walk`.
 * @see  {@link walk}
 */
TreeTraversal.prototype.traverse = TreeTraversal.prototype.walk;

/**
 * Alias for `walk`.
 * @see  {@link walk}
 */
TreeTraversal.prototype.run = TreeTraversal.prototype.walk;

/**
 * Factory method for creating new tree traversals.
 * This is the only method exposed via the exports.
 *
 * @example
 * // Basic usage
 * traversal()
 *  // Handle nodes with `.name === 'wowza'`
 *  .addHandler('name', 'wowza', function(node, recur) {})
 *
 *  // Handle nodes with `.name === 'gene'`
 *  .addHandler('name', 'gene', function(node, recur) {})
 *
 *  // Handle nodes with `.value === 42`
 *  .addHandler('value', 42, function(node, recur) {})
 *
 *  // Run the traversal on a root node
 *  .run(rootNode);
 *
 * @example
 * // Add helper method to make thing faster
 * traversal(['name', 'value'])
 *  .name('wowza', function(node, recur) {})
 *  .name('gene', function(node, recur) {})
 *  .value(42, function(node, recur) {})
 *  .run(rootNode);
 *
 * @param {Array} helper List of node properties for which
 *  to add helper methods to the tree traversal.
 * @return {TreeTraversal} a new tree traversal.
 */
function traverse(helpers) {
  var traversal = new TreeTraversal();
  if (exists(helpers) && Array.isArray(helpers)) {
    helpers.forEach(function(propertyName) {
      traversal.addHelper(propertyName);
    });
  }
  return traversal;
}

// Callback descriptions

/**
 * Performs operations on a given node during a tree traversal.
 * @callback TreeTraversal~visitorCallback
 * @param {Object} node Node currently being visited during the traversal.
 * @param {TreeTraversal~recur} recur Continues the traversal on a given node.
 * @param {Number} depth Current depth of the traversal.
 */

/**
 * Recurs further into the traversal given the next node.
 * @callback TreeTraversal~recur
 * @param {Object} node Node on which to continue the traversal.
 * @param {Number} [givenDepth] Traversal depth override.
 */

/**
 * Recurs further in the traversal for each node in a given array.
 * @callback TreeTraversal~recur.each
 * @param {Array} list Array of nodes to traverse.
 * @param {Number} [givenDepth] Traversal depth override.
 */

/**
 * Stop automatic traversal for names defined with `preorder`
 * and `postorder`.
 * @callback TreeTraversal~recur.stop
 */

// Export the factory method.
module.exports = traverse;

},{"101/exists":7,"debug":8}],7:[function(require,module,exports){
/**
 * @module {function} 101/exists
 * @type {function}
 */

/**
 * Returns false for null and undefined, true for everything else.
 * @function module:101/exists
 * @param val {*} - value to be existance checked
 * @return {boolean} whether the value exists or not
 */
module.exports = exists;

function exists (val) {
  return val !== undefined && val !== null;
}
},{}],8:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":9}],9:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":10}],10:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}]},{},[1]);
