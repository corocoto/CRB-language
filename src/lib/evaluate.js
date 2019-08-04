function evaluate(exp, env, callback) {
    GUARD(evaluate, arguments);
    switch (exp.type) {
        case "num"    :
        case "bool"   :
        case "str"    :
            callback(exp.value);
            return;
        case "var"    :
            callback(env.get(exp.value));
            return;
        case "assign" :
            if (exp.left.type !== "var")
                throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`);
            evaluate(exp.right, env, function CC (right){
                GUARD(CC, arguments);
                callback(env.set(exp.left.value, right));
            });
            return;
        case "binary" :
            evaluate(exp.left, env, function CC (left) {
                GUARD(CC, arguments);
                evaluate(exp.right, env, function CC (right) {
                    GUARD(CC, arguments);
                    callback(applyOp(exp.operator, left, right));
                });
            });
            return;
        case "CRB"    :
            callback(makeCRB(env, exp));
            return;
        case "if"     :
            evaluate(exp.cond, env, function CC (cond) {
                GUARD(CC, arguments);
                (cond !== false)
                    ? evaluate(exp.then, env, callback)
                    : ((exp.else) ? evaluate(exp.else, env, callback) : callback(false));
            });
            return;
        case "prog"   :
            (function loop(last, i) {
                GUARD(loop, arguments);
                (i < exp.prog.length)
                    ? evaluate(exp.prog[i], env, function CC (val) {
                        GUARD(CC, arguments);
                        loop(val, i + 1);
                    })
                    : callback(last);
            }) (false,0);
            return;
        case "call" :
            evaluate(exp.func, env, function CC (func) {
                GUARD(CC, arguments);
                (function loop(args, i) {
                    GUARD(loop, arguments);
                    (i < exp.args.length) ? evaluate(exp.args[i], env, function CC (arg){
                        GUARD(CC, arguments);
                        args[i + 1] = arg;
                        loop(args, i + 1);
                    }) : func.apply(null, args);
                }) ([ callback ], 0)
            });
            return;
        case "let" :
            (function loop(env, i) {
                GUARD(loop, arguments);
                if (i < exp.vars.length){
                    const v = exp.vars[i];
                    if (v.def) evaluate(v.def, env, function CC (value) {
                        GUARD(CC, arguments);
                        const scope = env.extend();
                        scope.def(v.name, value);
                        loop(scope, i + 1);
                    });
                    else {
                        const scope = env.extend();
                        scope.def(v.name, false);
                        loop(scope, i + 1);
                    }
                } else {
                     evaluate(exp.body, env, callback);
                }
            }) (env, 0);
            return;
        default:
            throw new Error(`I don't know how to evaluate ${exp.type}`);
    }
}

function applyOp(op, a, b) {
    function num(sym) {
        if (typeof sym !== "number")
            throw new Error(`Expected number but got ${sym}`);
        return sym;
    }

    function div(sym) {
        if (num(sym) === 0)
            throw new Error("Divide by zero");
        return x;
    }

    switch (op) {
        case "+"  : return num(a) + num(b);
        case "-"  : return num(a) - num(b);
        case "*"  : return num(a) * num(b);
        case "/"  : return num(a) / div(b);
        case "%"  : return num(a) % div(b);
        case "&&" : return a !== false && b !== false;
        case "||" : return (a !== false || b !== false);
        case "<"  : return num(a) < num(b);
        case ">"  : return num(a) > num(b);
        case "<=" : return num(a) <= num(b);
        case ">=" : return num(a) >= num(b);
        case "==" : return a === b;
        case "!=" : return a !== b;
    }
    throw new Error(`Can't apply operator ${op}`);
}

function makeCRB(env, exp) {
    if (exp.name) {
        env = env.extend();
        env.def(exp.name, CRB);
    }
    function CRB(callback) {
        GUARD(CRB, arguments);
        const names = exp.vars;
        const scope = env.extend();
        for (let i = 0; i < names.length; ++i) {
            scope.def(names[i], i + 1 < arguments.length ? arguments[i + 1] : false);
        }
        evaluate(exp.body, scope, callback);
        return CRB;
    }
    return CRB;
}


/** CPS interpreter*/
let STACKLEN;
function GUARD (f, args) {
    if (--STACKLEN < 0) throw new Continuation (f, args);
}

function Continuation (f, args) {
    this.f = f;
    this.args =args;
}

function Execute (f, args) {
    while (true)
        try {
            STACKLEN = 200;
            return f.apply(null, args);
        } catch (ex) {
            if (ex instanceof Continuation)
                f = ex.f, args = ex.args;
            else throw ex;
        }
}

module.exports = {Execute, evaluate};