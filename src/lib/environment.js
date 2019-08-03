/** Environment */
function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
}

Environment.prototype = {
    extend: () => new Environment(this),
    lookup : name => {
        let scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
            scope = scope.parent;
        }
    },
    get: name => {
        if(name in this.vars)
            return this.vars[name];
        throw new Error(`Undefined variable ${name}`);
    },
    set: (name, value) => {
        const scope = this.lookup(name);
        // не разрешаем устанавливать неопределенные переменные не в глобальном контексте
        if (!scope && this.parent)
            throw new Error(`Undefined variable ${name}`);
        return (scope || this).vars[name] = value;
    },
    def : (name, value) => this.vars[name] = value
};

module.exports = Environment;