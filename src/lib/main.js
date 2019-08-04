const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
const evaluate = require('./evaluate');

// создание глобального контекста
const globalEnv = new Environment();
const code =``;
const ast = Parse(TokenSteam(InputStream(code)));

// определить "нативную" функцию "print"
globalEnv.def("print", txt => console.log(txt));
globalEnv.def("println", txt=> console.log(txt));

// интерпретировать
evaluate(ast, globalEnv);