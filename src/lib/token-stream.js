// eslint-disable-next-line valid-jsdoc
/** Token */
function TokenStream(input) {
  let current = null;
  const keywords = ' let if then else CRB CreativeRusBear true false ';

  return {
    next,
    peek,
    eof,
    croak: input.croak,
  };

  // eslint-disable-next-line require-jsdoc
  function isKeyword(char) {
    return keywords.indexOf(` ${char} `) >= 0;
  }

  // eslint-disable-next-line require-jsdoc
  function isDigit(char) {
    return /[0-9]/i.test(char);
  }

  // eslint-disable-next-line require-jsdoc
  function isIdStart(char) {
    return /[a-zCRB_]/i.test(char);
  }

  // eslint-disable-next-line require-jsdoc
  function isId(char) {
    return isIdStart(char) || '?!-<>=0123456789'.indexOf(char) >= 0;
  }

  // eslint-disable-next-line require-jsdoc
  function isOpChar(char) {
    return '+-*/%=&|<>!'.indexOf(char) >= 0;
  }

  // eslint-disable-next-line require-jsdoc
  function isPunc(char) {
    return ',;(){}[]'.indexOf(char) >= 0;
  }

  // eslint-disable-next-line require-jsdoc
  function isWhitespace(char) {
    return ' \t\n'.indexOf(char) >= 0;
  }

  // eslint-disable-next-line require-jsdoc
  function readWhile(predicate) {
    let str = '';
    while (!input.eof() && predicate(input.peek())) {
      str += input.next();
    }
    return str;
  }

  // eslint-disable-next-line require-jsdoc
  function readNum() {
    let hasDot = false;
    const number = readWhile((char) => {
      if (char === '.') {
        if (hasDot) return false;
        hasDot = true;
        return true;
      }
      return isDigit(char);
    });
    return {type: 'num', value: parseFloat(number)};
  }

  // eslint-disable-next-line require-jsdoc
  function readId() {
    const id = readWhile(isId);
    return {
      type: isKeyword(id) ? 'kw' : 'var',
      value: id,
    };
  }

  // eslint-disable-next-line require-jsdoc
  function readEsc(end) {
    let esc = false;
    let str = '';
    input.next();

    while (!input.eof()) {
      const char = input.next();
      if (esc) {
        str += char;
        esc = false;
      } else if (char === '\\') {
        esc = true;
      } else if (char === end) {
        break;
      } else {
        str += char;
      }
    }
    return str;
  }

  // eslint-disable-next-line require-jsdoc
  function readStr() {
    return {type: 'str', value: readEsc(`"`)};
  }

  // eslint-disable-next-line require-jsdoc
  function skipComment() {
    readWhile((char) => char != '\n');
    input.next();
  }

  // eslint-disable-next-line require-jsdoc
  function next() {
    const tok = current;
    current = null;
    return tok || readNext();
  }

  // eslint-disable-next-line require-jsdoc
  function peek() {
    return current || (current = readNext());
  }

  // eslint-disable-next-line require-jsdoc
  function eof() {
    return peek() == null;
  }

  // eslint-disable-next-line require-jsdoc
  function readNext() {
    readWhile(isWhitespace);

    if (input.eof()) return null;
    const char = input.peek();

    if (char === '#') {
      skipComment();
      return readNext();
    }

    if (char === `"`) return readStr();

    if (isDigit(char)) return readNum();

    if (isIdStart(char)) return readId();

    if (isPunc(char)) {
      return {
        type: 'punc',
        value: input.next(),
      };
    }

    if (isOpChar(char)) {
      return {
        type: 'op',
        value: readWhile(isOpChar),
      };
    }

    input.croak(`Can't handle character: ${char}`);
  }
}

module.exports = TokenStream;
