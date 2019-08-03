/** Parser */
const FALSE = {type: "bool", value: false};
function Parse(input) {
    const PRECEDENCE = {
        "=" : 1,
        "||" : 2,
        "&&" : 3,
        "<" : 7, ">" : 7, "<=" : 7, ">=" : 7, "==" : 7, "!=" : 7,
        "+" : 10, "-" : 10,
        "*" : 20, "/" : 20, "%" : 20
    };
    return parseTopLevel();
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
        return {type: "prog", prog: prog}
    }

    function parseIf() {
        skipKw("if");
        let cond = parseExp();
        if (!isPunc("{")) skipKw("then");
        let then = parseExp();
        let ret = {type: "if", cond: cond, then: then};
        if (isKw("else")) {
            input.next();
            ret.else = parseExp();
        }
        return ret;
    }

    function parseAtom() {
        const types = ["var", "num", "str"];
        return maybeCall(() => {
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
            if (types.includes(tok)) {
                return tok;
            }
            unexpected();
        });
    }


    function parseProg() {
        const prog = delimited("{", "}", ";", parseExp);
        if (prog.length == 0) return FALSE;
        if (prog.length == 1) return prog[0];
        return {type: "prog", prog: prog};
    }

    function parseExp() {
        return maybeCall(() => maybeBin(parseAtom(), 0));
    }

    function maybeCall(exp) {
        exp = exp();
        return isPunc("(") ? parseCall(exp) : exp;
    }

    function parseCall(func) {
        return {
            type: "call",
            func: func,
            args: delimited("(", ")", ",", parseExp)
        };
    }

    function maybeBin(left, myPrec) {
        const tok = isOp();
        if (tok) {
            const hisPrec = PRECEDENCE[tok.value];
            if (hisPrec > myPrec) {
                input.next();
                const right = maybeBin(parseAtom(), hisPrec);
                const bin = {
                    type : tok.value === "=" ? "assign" : "binary",
                    operator : tok.value,
                    left : left,
                    right: right
                };
                return maybeBin(bin, myPrec);
            }
        }
        return left;
    }
}

module.exports = Parse;