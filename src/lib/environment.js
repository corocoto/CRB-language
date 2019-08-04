// eslint-disable-next-line valid-jsdoc
/** Environment */
function Environment(parent) {
  this.vars = Object.create(parent ? parent.vars : null);
  this.parent = parent;
}

Environment.prototype = {
  extend: function() {
    return new Environment(this);
  },
  lookup: function(name) {
    let scope = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
      scope = scope.parent;
    }
  },
  get: function(name) {
    if (name in this.vars) {
      return this.vars[name];
    }
    throw new Error(`Undefined variable ${name}`);
  },
  set: function(name, value) {
    const scope = this.lookup(name);
    // не разрешаем устанавливать
    // неопределенные переменные не в глобальном контексте
    if (!scope && this.parent) {
      throw new Error(`Undefined variable ${name}`);
    }
    return (scope || this).vars[name] = value;
  },
  def: function(name, value) {
    return this.vars[name] = value;
  },
};

module.exports = Environment;
