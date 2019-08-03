const Environment = require ('./environment');
const InputStream = require('./input-stream');
const TokenSteam = require('./token-stream');
const Parse = require('./parser');
const evaluate = require('./evaluate');

// создание глобального контекста
const globalEnv = new Environment();

const code = `print_range = CRB(a, b) {
                if a <= b {
                  print(a);
                  if a + 1 <= b {
                    print(", ");
                    print_range(a + 1, b);
                  } else println("");
                }
              }; 
              print_range(1, 10);
`;
const ast = Parse(TokenSteam(InputStream(code)));

// определить "нативную" функцию "print"
globalEnv.def("print", txt => console.log(txt));
globalEnv.def("println", ()=> console.log());

// интерпретировать
evaluate(ast, globalEnv);