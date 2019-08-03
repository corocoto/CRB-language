/** Token */
function TokenStream(input) {
    let current = null;
    const keywords = " if then else CRB CreativeRusBear true false ";

    return {
        next,
        peek,
        eof,
        croak: input.croak
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
        const id = readWhile(isId);
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
        return { type: "str", value: readEsc(`"`) };
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
}

module.exports = TokenStream;
