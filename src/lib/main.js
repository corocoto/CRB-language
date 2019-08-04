const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
// const Execute = require('./CPS');
const {Execute, evaluate} = require('./evaluate');

// создание глобального контекста
const globalEnv = new Environment();
const code =`
fib = CRB(n) {
 if n < 2 
 then n 
 else fib(n - 1) + fib(n - 2);
};

println(fib(20));
`;
const ast = Parse(TokenSteam(InputStream(code)));

// define the "print" primitive function
globalEnv.def("println", (callback, txt) => {
    // console.log(txt);
    // callback(false);
    callback(txt); // call the continuation with some return value
                     // if we don't call it, the program would stop
                     // abruptly after a print!
});
globalEnv.def("sleep", function(k, milliseconds){
    setTimeout(function(){
        Execute(k, [ false ]); // продолжения ожидают значения, передаем 'false'
    }, milliseconds);
});

globalEnv.def("CallCC", function(k, f){
    f(k, function CC(discarded, ret){
        k(ret);
    });
});
// run the evaluator
Execute(evaluate, [ast, globalEnv, result =>{
    console.log("*** Result:", result);
    // the result of the entire program is now in "result"
}]);