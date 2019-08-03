const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
const evaluate = require('./evaluate');

// создание глобального контекста
const globalEnv = new Environment();
const code =`cons = CRB(x, y)
         CRB(a, i, v)
           if a == "get"
              then if i == 0 then x else y
              else if i == 0 then x = v else y = v;

car = CRB(cell) cell("get", 0);
cdr = CRB(cell) cell("get", 1);
set-car! = CRB(cell, val) cell("set", 0, val);
set-cdr! = CRB(cell, val) cell("set", 1, val);

# теперь NIL может быть обычным объектом
NIL = cons(0, 0);
set-car!(NIL, NIL);
set-cdr!(NIL, NIL);

## примеры:
x = cons(1, 2);
println(car(x)); # 1
println(cdr(x)); # 2
set-car!(x, 10);
set-cdr!(x, 20);
println(car(x)); # 10
println(cdr(x)); # 20`;
const ast = Parse(TokenSteam(InputStream(code)));

// определить "нативную" функцию "print"
globalEnv.def("print", txt => console.log(txt));
globalEnv.def("println", txt=> console.log(txt));

// интерпретировать
evaluate(ast, globalEnv);