// eslint-disable-next-line require-jsdoc
function evaluate(exp, env, callback) {
  // eslint-disable-next-line prefer-rest-params,new-cap
  GUARD(evaluate, arguments);
  switch (exp.type) {
    case 'num':
    case 'bool':
    case 'str':
      callback(exp.value);
      return;
    case 'var':
      callback(env.get(exp.value));
      return;
    case 'assign':
      if (exp.left.type !== 'var') {
        throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`);
      }
      evaluate(exp.right, env, function CC(right) {
      // eslint-disable-next-line prefer-rest-params,new-cap
        GUARD(CC, arguments);
        callback(env.set(exp.left.value, right));
      });
      return;
    case 'binary':
      evaluate(exp.left, env, function CC(left) {
      // eslint-disable-next-line new-cap,prefer-rest-params
        GUARD(CC, arguments);
        evaluate(exp.right, env, function CC(right) {
        // eslint-disable-next-line prefer-rest-params,new-cap
          GUARD(CC, arguments);
          callback(applyOp(exp.operator, left, right));
        });
      });
      return;
    case 'CRB':
      callback(makeCRB(env, exp));
      return;
    case 'if':
      evaluate(exp.cond, env, function CC(cond) {
        // eslint-disable-next-line new-cap,prefer-rest-params
        GUARD(CC, arguments);
                (cond !== false)
                    ? evaluate(exp.then, env, callback)
                    : ((exp.else)
                    ? evaluate(exp.else, env, callback)
                    : callback(false));
      });
      return;
    case 'prog':
      (function loop(last, i) {
      // eslint-disable-next-line prefer-rest-params,new-cap
        GUARD(loop, arguments);
                (i < exp.prog.length)
                    ? evaluate(exp.prog[i], env, function CC(val) {
                    // eslint-disable-next-line prefer-rest-params,new-cap
                      GUARD(CC, arguments);
                      loop(val, i + 1);
                    })
                    : callback(last);
      })(false, 0);
      return;
    case 'call':
      evaluate(exp.func, env, function CC(func) {
        // eslint-disable-next-line prefer-rest-params,new-cap
        GUARD(CC, arguments);
        (function loop(args, i) {
          // eslint-disable-next-line prefer-rest-params,new-cap
          GUARD(loop, arguments);
                    (i < exp.args.length)
                        ? evaluate(exp.args[i], env, function CC(arg) {
                          // eslint-disable-next-line prefer-rest-params,new-cap
                          GUARD(CC, arguments);
                          args[i + 1] = arg;
                          loop(args, i + 1);
                        })
                        // eslint-disable-next-line prefer-spread
                        : func.apply(null, args);
        })([callback], 0);
      });
      return;
    case 'let':
      (function loop(env, i) {
        // eslint-disable-next-line prefer-rest-params,new-cap
        GUARD(loop, arguments);
        if (i < exp.vars.length) {
          const v = exp.vars[i];
          if (v.def) {
            evaluate(v.def, env, function CC(value) {
              // eslint-disable-next-line prefer-rest-params,new-cap
              GUARD(CC, arguments);
              const scope = env.extend();
              scope.def(v.name, value);
              loop(scope, i + 1);
            });
          } else {
            const scope = env.extend();
            scope.def(v.name, false);
            loop(scope, i + 1);
          }
        } else {
          evaluate(exp.body, env, callback);
        }
      })(env, 0);
      return;
    default:
      throw new Error(`I don't know how to evaluate ${exp.type}`);
  }
}

// eslint-disable-next-line require-jsdoc
function applyOp(op, a, b) {
  // eslint-disable-next-line require-jsdoc
  function num(sym) {
    if (typeof sym !== 'number') {
      throw new Error(`Expected number but got ${sym}`);
    }
    return sym;
  }

  // eslint-disable-next-line require-jsdoc
  function div(sym) {
    if (num(sym) === 0) {
      throw new Error('Divide by zero');
    }
    return x;
  }

  switch (op) {
    case '+': return num(a) + num(b);
    case '-': return num(a) - num(b);
    case '*': return num(a) * num(b);
    case '/': return num(a) / div(b);
    case '%': return num(a) % div(b);
    case '&&': return a !== false && b !== false;
    case '||': return (a !== false || b !== false);
    case '<': return num(a) < num(b);
    case '>': return num(a) > num(b);
    case '<=': return num(a) <= num(b);
    case '>=': return num(a) >= num(b);
    case '==': return a === b;
    case '!=': return a !== b;
  }
  throw new Error(`Can't apply operator ${op}`);
}

// eslint-disable-next-line require-jsdoc
function makeCRB(env, exp) {
  if (exp.name) {
    env = env.extend();
    env.def(exp.name, CRB);
  }
  // eslint-disable-next-line require-jsdoc
  function CRB(callback) {
    // eslint-disable-next-line prefer-rest-params,new-cap
    GUARD(CRB, arguments);
    const names = exp.vars;
    const scope = env.extend();
    for (let i = 0; i < names.length; ++i) {
    // eslint-disable-next-line prefer-rest-params
      scope.def(names[i], i + 1 < arguments.length ? arguments[i + 1] : false);
    }
    evaluate(exp.body, scope, callback);
    return CRB;
  }
  return CRB;
}


/** CPS interpreter*/
let STACKLEN;
// eslint-disable-next-line require-jsdoc
function GUARD(f, args) {
  if (--STACKLEN < 0) throw new Continuation(f, args);
}

// eslint-disable-next-line require-jsdoc
function Continuation(f, args) {
  this.f = f;
  this.args =args;
}

// eslint-disable-next-line require-jsdoc
function Execute(f, args) {
  while (true) {
    try {
      STACKLEN = 200;
      // eslint-disable-next-line prefer-spread
      return f.apply(null, args);
    } catch (ex) {
      if (ex instanceof Continuation) {
        f = ex.f, args = ex.args;
      } else throw ex;
    }
  }
}

module.exports = {Execute, evaluate};
