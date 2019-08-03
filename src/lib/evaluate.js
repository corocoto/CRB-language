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
    }
}