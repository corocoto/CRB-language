const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
// const Execute = require('./CPS');
const {Execute, evaluate} = require('./evaluate');

// создание глобального контекста
const globalEnv = new Environment();
const code =``;
const ast = Parse(TokenSteam(InputStream(code)));

// define the "print" primitive function
globalEnv.def("println", (callback, txt) => {
    // console.log(txt);
    callback(txt); // call the continuation with some return value
                     // if we don't call it, the program would stop
                     // abruptly after a print!
});

// run the evaluator
Execute(evaluate, [ast, globalEnv, result =>{
    console.log("*** Result:", result);
    // the result of the entire program is now in "result"
}]);