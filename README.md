# CRB-language (CreativeRusBear-language)

### Description

I present to you the programming language CRB-language, written in JavaScript.

### Syntax

***Keywords:***
* `let` - used to create loops, add new variables;
* `#` - comment;
* `CRB` - keyword used to create function;
* `CreativeRusBear` - also keyword used to create function;
* `if` - conditional operator if;
    * `then` - if conditional operator return true, then write this keyword;
    * `else` - if conditional operator return false, then write this keyword.

***A few words about the features of this programming language***

You can also write code without curly braces and the keywords `then` or `else`. In this case, I note that this is a lot of similarity with the JavaScript programming language. This also applies to functions.

You can also create multiple variables and loops using the `let` keyword. But you can also create it without using `let`. 

A choice of creating features is also provided. You can create both anonymous and named functions.

P.S. All possible usage examples are in the corresponding section.
### Examples:
1. 
```
sum = CRB(x, y) x + y; print(sum(2, 3)); # Create a function 'sum' that calculates the sum of two numbers
```
2.
```
print_range = CRB(a, b) {
    if a <= b {
        print(a);
        if a + 1 <= b {
            print(", ");
            print_range(a + 1, b);
        } else println("");
    }
};
print_range(1, 10); 
```
3.
```
cons = CRB(a, b) CRB(f) f(a, b);
car = CRB(cell) cell(CRB(a, b) a);
cdr = CRB(cell) cell(CRB(a, b) b);
NIL = CRB(f) f(NIL, NIL);

x = cons(1, cons(2, cons(3, cons(4, cons(5, NIL)))));
println(car(x));                      # 1
println(car(cdr(x)));                 # 2
println(car(cdr(cdr(x))));            # 3
println(car(cdr(cdr(cdr(x)))));       # 4
println(car(cdr(cdr(cdr(cdr(x))))));  # 5
```
4.
```
y = CreativeRusBear (a, b) {
    println(a+b);
    println("Hello world");
};
y(1, 7);
```
5.
```
cons = CRB(x, y)
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
println(cdr(x)); # 20
```
6.
```
let (x = 2, y = 3, z = x + y) print(x + y + z);
```
7.
```
print(let loop (n = 10)
        if n > 0 then n + loop(n - 1)
                 else 0);
```
8.
 ```
# create a named function 'loop'
print(
    (CRB loop (n) if n > 0 
        then n + loop(n - 1)
         else 0)
    (10)
);
```