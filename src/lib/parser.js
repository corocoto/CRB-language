/** Parser */
const FALSE = {type: 'bool', value: false};

// eslint-disable-next-line require-jsdoc
function Parse(input) {
  const PRECEDENCE = {
    '=': 1,
    '||': 2,
    '&&': 3,
    '<': 7, '>': 7, '<=': 7, '>=': 7, '==': 7, '!=': 7,
    '+': 10, '-': 10,
    '*': 20, '/': 20, '%': 20,
  };
  return parseTopLevel();


  // eslint-disable-next-line require-jsdoc
  function isPunc(char) {
    const tok = input.peek();
    return tok && tok.type == 'punc' && (!char || tok.value == char) && tok;
  }
  // eslint-disable-next-line require-jsdoc
  function isKw(char) {
    const tok = input.peek();
    return tok && tok.type == 'kw' && (!char || tok.value == char) && tok;
  }
  // eslint-disable-next-line require-jsdoc
  function isOp(char) {
    const tok = input.peek();
    return tok && tok.type == 'op' && (!char || tok.value == char) && tok;
  }

  // eslint-disable-next-line require-jsdoc
  function skipPunc(char) {
        (isPunc(char))
            ? input.next()
            : input.croak(`Expecting punctuation: ${char}`);
  }

  // eslint-disable-next-line require-jsdoc
  function skipKw(char) {
        (isKw(char))
            ? input.next()
            : input.croak(`Expecting keyword: ${char}`);
  }

  // eslint-disable-next-line require-jsdoc,no-unused-vars
  function skipOp(char) {
        (isOp(char))
            ? input.next()
            : input.croak(`Expecting operator: ${char}`);
  }

  // eslint-disable-next-line require-jsdoc
  function parseLet() {
    skipKw('let');
    if (input.peek().type === 'var') {
      const name = input.next().value;
      const defs = delimited('(', ')', ',', parseVardef);
      return {
        type: 'call',
        func: {
          type: 'CRB',
          name,
          vars: defs.map((def) => def.name),
          body: parseExp(),
        },
        args: defs.map((def) => def.def || FALSE),
      };
    }
    return {
      type: 'let',
      vars: delimited('(', ')', ',', parseVardef),
      body: parseExp(),
    };
  }
  // eslint-disable-next-line require-jsdoc
  function parseVardef() {
    const name = parseVarname();
    let def;
    if (isOp('=')) {
      input.next();
      def = parseExp();
    }
    return {name, def};
  }

  // eslint-disable-next-line require-jsdoc
  function parseCRB() {
    return {
      type: 'CRB',
      name: input.peek().type === 'var' ? input.next().value : null,
      vars: delimited('(', ')', ',', parseVarname),
      body: parseExp(),
    };
  }

  // eslint-disable-next-line require-jsdoc
  function parseTopLevel() {
    const prog = [];
    while (!input.eof()) {
      prog.push(parseExp());
      if (!input.eof()) skipPunc(';');
    }
    return {type: 'prog', prog: prog};
  }

  // eslint-disable-next-line require-jsdoc
  function parseIf() {
    skipKw('if');
    const cond = parseExp();
    if (!isPunc('{')) skipKw('then');
    const then = parseExp();
    const ret = {type: 'if', cond, then};
    if (isKw('else')) {
      input.next();
      ret.else = parseExp();
    }
    return ret;
  }

  // eslint-disable-next-line require-jsdoc
  function parseAtom() {
    return maybeCall(() => {
      if (isPunc('(')) {
        input.next();
        const exp = parseExp();
        skipPunc(')');
        return exp;
      }

      if (isKw('let')) return parseLet();
      if (isPunc('{')) return parseProg();
      if (isKw('if')) return parseIf();
      if (isKw('true') || isKw('false')) return parseBool();
      if (isKw('CRB') || isKw('CreativeRusBear')) {
        input.next();
        return parseCRB();
      }
      const types = ['var', 'num', 'str'];
      const tok = input.next();
      if (types.includes(tok.type)) {
        return tok;
      }
      unexpected();
    });
  }

  // eslint-disable-next-line require-jsdoc
  function parseProg() {
    const prog = delimited('{', '}', ';', parseExp);
    if (prog.length == 0) return FALSE;
    if (prog.length == 1) return prog[0];
    return {type: 'prog', prog};
  }

  // eslint-disable-next-line require-jsdoc
  function parseExp() {
    return maybeCall(() => maybeBin(parseAtom(), 0));
  }

  // eslint-disable-next-line require-jsdoc
  function parseCall(func) {
    return {
      type: 'call',
      func,
      args: delimited('(', ')', ',', parseExp),
    };
  }

  // eslint-disable-next-line require-jsdoc
  function parseVarname() {
    const name = input.next();
    if (name.type !== 'var') input.croak('Expecting variable name');
    return name.value;
  }

  // eslint-disable-next-line require-jsdoc
  function parseBool() {
    return {type: 'bool', value: input.next().value === 'true'};
  }

  // eslint-disable-next-line require-jsdoc
  function delimited(start, stop, separator, parser) {
    const a = [];
    let first = true;
    skipPunc(start);
    while (!input.eof()) {
      if (isPunc(stop)) break; // последний разделитель может быть пропущен
            (first) ? first = false : skipPunc(separator);
            if (isPunc(stop)) break;
            a.push(parser());
    }
    skipPunc(stop);
    return a;
  }

  // eslint-disable-next-line require-jsdoc
  function unexpected() {
    input.croak(`Unexpected token: ${JSON.stringify(input.peek())}`);
  }

  // eslint-disable-next-line require-jsdoc
  function maybeCall(exp) {
    exp = exp();
    return isPunc('(') ? parseCall(exp) : exp;
  }

  // eslint-disable-next-line require-jsdoc
  function maybeBin(left, myPrec) {
    const tok = isOp();
    if (tok) {
      const hisPrec = PRECEDENCE[tok.value];
      if (hisPrec > myPrec) {
        input.next();
        return maybeBin({
          type: tok.value === '=' ? 'assign' : 'binary',
          operator: tok.value,
          left: left,
          right: maybeBin(parseAtom(), hisPrec),
        }, myPrec);
      }
    }
    return left;
  }
}

module.exports = Parse;
