function TokenStream(input) {
  /** Token */
    let current = null;
    const keywords = " if then else CRB CreativeRusBear true false ";
    return {
        next: next, //возвращает следующий символ, извлекая его из потока
        peek: peek, //возвращает следующий символ, не извлекая его из потока
        eof: eof, //возвращает true, если больше нет символов в потоке
        croak: input.croak //бросает исключение, содержащее сообщение (msg) и текущее положение в потоке
    };

    function isKeyword(char) {
        return keywords.indexOf(` ${char} `) >= 0;
    }

    function isDigit(char) {
        return /[0-9]/i.test(char);
    }

    function isIdStart(char) {
        return /[a-zCRB_]/i.test(char);
    }

    function isId(char) {
        return isIdStart(char) || "?!-<>=0123456789".indexOf(char) >= 0;
    }

    function isOpChar(char) {
        return "+-*/%=&|<>!".indexOf(char) >= 0;
    }

    function isPunc(char) {
        return ",;(){}[]".indexOf(char) >= 0;
    }

    function isWhitespace(char) {
        return " \t\n".indexOf(char) >= 0;
    }

    function readWhile(predicate) {
        let str = "";
        while (!input.eof() && predicate(input.peek())) {
            str += input.next();
        }
        return str;
    }

    function readNum() {
        let hasDot = false;
        const number = readWhile(char => {
            if (char === ".") {
                if (hasDot) return false;
                hasDot = true;
                return true;
            }
            return isDigit(char);
        });
        return {type: "num", value: parseFloat(number)};
    }

    function readId() {
        const id = readWhile(isId());
        return {
            type: isKeyword(id) ? "kw" : "var",
            value: id
        }
    }

    function readEsc(end) {
        let esc = false;
        let str = "";
        input.next();

        while (!input.eof()) {
            const char = input.next();
            if (esc) {
                str += char;
                esc = false;
            } else if (char === "\\") {
                esc = true;
            } else if (char === end) {
                break;
            } else {
                str += char;
            }
        }
        return str;
    }

    function readStr() {
        return {type: "str", value: readEsc(`"`)};
    }

    function skipComment() {
        readWhile(char => char != "\n");
        input.next();
    }


    function next() {
        const char = input.charAt(pos++);
        if (char == "\n") line++, col = 0; else col++;
        return char;
    }

    function peek() {
        return input.charAt(pos);
    }

    function eof() {
        return peek() == "";
    }

    // function croak(msg) {
    //   throw new Error(`${msg} (at line ${line} on ${col})`);
    // }

    function readNext() {
        readWhile(isWhitespace);

        if (input.eof()) return null;
        const char = input.peek();

        if (char === "#") {
            skipComment();
            return readNext();
        }

        if (char === `"`) return readStr();

        if (isDigit(char)) return readNum();

        if (isIdStart(char)) return readId();

        if (isPunc(char)) return {
            type: "punc",
            value: input.next()
        };

        if (isOpChar(char)) return {
            type: "op",
            value: readWhile(isOpChar)
        };

        input.croak(`Can't handle character: ${char}`)
    }


    /** Parser */
    function parseCRB() {
      return {
        type: "CRB",
        vars: delimited("(", ")", ",", parseVarname),
        body: parseExp()
      };
    }

  function delimited(start, stop, separator, parser) {
    let a = [];
    let first = true;
    skipPunc(start);
    while (!input.eof()) {
      if (isPunc(stop)) break; // последний разделитель может быть пропущен
      a.push(parser());
    }
    skipPunc(stop);
    return a;
  }

  function parseTopLevel() {
      let prog = [];
      while (!input.eof()) {
          prog.push(parseExp());
          if (!input.eof()) skipPunc(";");
      }
      return { type: "prog", prog: prog }
  }

  function parseIf() {
      skipKw("if");
      let cond = parseExp();
      if (!isPunc("{")) skipKw("then");
      let then = parseExp();
      let ret = { type: "if", cond: cond, then: then };
      if (isKw("else")) {
          input.next();
          ret.else = parseExp();
      }
      return ret;
  }
  
  function parseAtom() {
      const types = ["var", "num", "str"];
      return maybeCall (() => {
         if (isPunc("(")) {
             input.next();
             const exp = parseExp();
             skipPunc(")");
             return exp;
         }

         if (isPunc("{")) return parseProg();
         if (isKeyword("if")) return parseIf();
         if (isKeyword("true") || isKeyword("false")) return parseBool();
         if (isKeyword("CRB") || isKeyword("CreativeRusBear")) {
             input.next();
             return parseCRB();
         }
         const tok = input.next();
          if(types.includes(tok)) {
             return tok;
          }
          unexpected();
      });
  }
}
