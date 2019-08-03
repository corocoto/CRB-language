function evaluate(exp, env) {
    switch (Exp.type) {
        case "num"    :
        case "bool"   :
        case "str"    :
            return exp.value;
        case "var"    :
            return env.get(exp.value);
        case "assign" :
            return (exp.left.type !== "var") ? throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`) : env.set(exp.left.value, evaluate(exp.right, env));
        case "binary" :
            return applyOp(exp.operator, evaluate(exp.left, env), evaluate(exp.right, env));
        case "CRB"    :
            return makeCRB(env, exp);
        case "if"     :
            const cond = evaluate(exp.cond, env);
            if (cond !== false) return evaluate(exp.then, env);
            return exp.else ? evaluate(exp.else, env) : false;
        case "prog"   :
            let val = false;
            exp.prog.forEach(exp => val = evaluate(exp, env));
            return val;
        case "call" :
            const func = evaluate(exp.func, env);
            return func.apply(null, exp.args.map(arg => evaluate(arg, env)));
        default:
            throw new Error(`I don't know how to evaluate ${exp.type}`);
    }
}

function applyOp(op, a, b) {
    function num(sym) {
        return (typeof sym !== "number") ? throw new Error(`Expected number but got ${sym}`) : sym;
    }

    function div(sym) {
        return (num(sym) === 0) ? throw new Error("Divide by zero") : x;
    }

    switch (op) {
        case "+"  : return num(a) + num(b);
        case "-"  : return num(a) - num(b);
        case "*"  : return num(a) * num(b);
        case "/"  : return num(a) / num(b);
        case "%"  : return num(a) % num(b);
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
    function CRB() {
        const names = exp.vars;
        const scope = env.extend();
        for (let i = 0; i < names.length; ++i) {
            scope.def(names[i], i < arguments.length ? arguments[i] : false);
        }
        return evaluate(exp.body, scope);
    }
    return CRB;
}

module.exports = evaluate;