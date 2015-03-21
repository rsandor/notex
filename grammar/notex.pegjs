{
  /**
   * Context free grammar for notex.
   * @author Ryan Sandor Richards.
   */
}
start
  = exprList:exprList {
    return {
      type: 'root',
      exprList: exprList
    };
  }

exprList "List of expressions"
  = _ first: expr rest:(_ expr)* _ {
    rest = rest.map(function(a) { return a[1]; });
    rest.unshift(first);
    return rest;
  }

expr "Single expression"
  = "{" _ expr:expr _ "}" {
    return expr;
  }
  / _ '(' _ list:exprList _ ')' _ {
    return {
      type: 'paren',
      exprList: list
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
  / esc command:id {
    return { type: 'command', command: command };
  }
  / name:id {
    return { type: 'id', name: name };
  }
  / name:op {
    return { type: 'operator', name: name };
  }
  / number:number {
    return { type: 'number', number: number };
  }

esc "Escape character '\'"
  = "\\"

sup "Superscript character '^'"
  = "^"

sub "Subscript character '_'"
  = "_"

id "identifier"
  = name:$([a-zA-Z][a-zA-Z0-9]*) { return name.toString(); }

op "operator"
  = name:$([`~!@#$%^&*\-_=+\\|;:'",<.>/?])

number "decimal numbers"
  = number:$([0-9]+)

_ "optional whitespace"
  = [ \t\r\n]*

__ "mandatory whitespace"
  = [ \t\r\n]+
