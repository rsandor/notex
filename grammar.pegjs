{
  /**
   * Context free grammar for notex.
   * @author Ryan Sandor Richards.
   */
}

start
  = list:exprList {
    return {
      type: 'root',
      list: list
    };
  }

exprList "List of expressions"
  = _ first: expr rest:(_ expr)* _ {
    rest = rest.map(function(a) { return a[1]; });
    rest.unshift(first);
    return rest;
  }

expr "Single expression"
  = "{" _ list:exprList _ "}" {
    return {
      type: 'group',
      list: list
    };
  }
  / _ '(' _ list:exprList _ ')' _ {
    return {
      type: 'paren',
      list: list
    };
  }
  / _ sup _ expr:expr {
    return {
      type: 'superscript',
      expr: expr
    };
  }
  / _ sub _ expr:expr {
    return {
      type: 'subscript',
      expr: expr
    };
  }
  / esc "frac" _ "{" _ numerator:exprList _ "}" _ "{" _ denominator:exprList _ "}" {
    return {
      type: 'frac',
      numerator: numerator,
      denominator: denominator
    };
  }
  / esc command:id {
    return { type: 'command', value: command };
  }
  / name:id {
    return { type: 'id', value: name };
  }
  / number:number {
    return { type: 'number', value: number };
  }
  / name:op {
    return { type: 'operator', value: name };
  }

esc "Escape character '\'"
  = "\\"

sup "Superscript character '^'"
  = "^"

sub "Subscript character '_'"
  = "_"

id "identifier"
  = name:$([a-zA-Z]+) { return name.toString(); }

op "operator"
  = name:$([`~!@#$%^&*\-_=+\\|;:'",<.>/?])

number "decimal numbers"
  = number:$([-]?[0-9]+)

_ "optional whitespace"
  = [ \t\r\n]*

__ "mandatory whitespace"
  = [ \t\r\n]+
