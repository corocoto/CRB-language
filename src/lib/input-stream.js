/** Character stream */
function InputStream(input) {
    let pos = 0;
    let line = 1;
    let col = 0;

    return {
        next  : next, //возвращает следующий символ, извлекая его из потока
        peek  : peek, //возвращает следующий символ, не извлекая его из потока
        eof   : eof, //возвращает true, если больше нет символов в потоке
        croak : croak //бросает исключение, содержащее сообщение (msg) и текущее положение в потоке
    };

    function next() {
        const ch = input.charAt(pos++);
        if (ch == "\n") line++, col = 0; else col++;
        return ch;
    }

    function peek() {
        return input.charAt(pos);
    }

    function eof() {
        return peek() == "";
    }

    function croak(msg) {
          throw new Error(`${msg} (at line ${line} on ${col})`);
        }
}

module.exports = InputStream;