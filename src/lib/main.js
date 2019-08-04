const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
const {Execute, evaluate} = require('./evaluate');
const our_code = require('./our_code');
/** Node.js API */
const fs = require('fs');

/** create global context*/
const globalEnv = new Environment();

/** our compiling code*/
const code =
    `
    with-return = CRB(f) CRB() CallCC(f);
    ${our_code.toString()}
    `;
/** create AST */
const ast = Parse(TokenSteam(InputStream(code)));

/** define the primitive functions article*/
globalEnv.def("readFile", (k, filename) =>
    fs.readFile(filename, 'utf-8',(err, data) => {
        if (err) throw new Error(err);
        Execute(k, [data]);
    })
);

globalEnv.def("writeFile", (k, filename, data) =>
    fs.writeFile(filename, data, err => {
       if (err)  throw new Error(err);
       Execute(k, [false]);
    })
);

globalEnv.def("halt", function(k){});

globalEnv.def("println", (callback, txt) => {
    console.log(txt);
    callback(false); // call the continuation with some return value
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

/** run the evaluator */
Execute(evaluate, [ast, globalEnv, result =>{
    console.log("*** Result:", result);
    // the result of the entire program is now in "result"
}]);