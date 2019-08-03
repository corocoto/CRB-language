const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
const evaluate = require('./evaluate');

// создание глобального контекста
const globalEnv = new Environment();

const code = "sum = CRB(x, y) x + y; print(sum(2, 3));";
const ast = Parse(TokenSteam(InputStream(code)));

// определить "нативную" функцию "print"
globalEnv.def("print", txt => console.log(txt));

// интерпретировать
evaluate(ast, globalEnv);