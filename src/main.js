var prefix = 'sd',
    Directive = require('./directive'),
    Directives = require('./directives'),
    selector = Object.keys(Directives).map(function(d) {
        return '[' + prefix + '-' + d + ']';
    });

function Seed(opts) {
    var self = this,
        root = this.el = document.getElementById(opts.id),
        els = root.querySelectorAll(selector);

    self.bindings = {};
    self.scope = {};

    // bind的几个知识点
    // 1. bind可以改变this的指向，但是必须是bind的返回值的函数：_fn = fn.bind(_this)
    // 2. 这里有个语法可能有理解难度

    /*
        [].forEach.call(els, this.compileNode.bind(this));
        等价于
        [].forEach.call(els, function(){
            var _compileNode = this.compileNode.bind(this)
            _compileNode();
        });
    */

    // bind在这里的作用是什么
    [].forEach.call(els, this.compileNode.bind(this));
    this.compileNode(root);

    for(var key in self.bindings) {
        self.scope[key] = opts.scope[key];
    }
}

Seed.prototype.compileNode = function(node) {
    var self = this;
    cloneAttributes(node.attributes).forEach(function(attr) {
        var directive = Directive.parse(attr, prefix);
        if(directive) {
            self.bind(node, directive);
        }
    })
}

Seed.prototype.bind = function(node, directive) {
    directive.el = node;
    node.removeAttribute(directive.attr.name);

    var key = directive.key,
        binding = this.bindings[key] || this.createBinding(key);

    binding.directives.push(directive);

    // 暂且没用到?
    if(directive.bind) {
        directive.bind(node, binding.value);
    }
}


Seed.prototype.createBinding = function(key) {
    var binding = {
        value: undefined,
        directives: []
    }

    this.bindings[key] = binding;

    Object.defineProperty(this.scope, key, {
        get: function() {
            return binding.value;
        },
        set: function (value) {
            binding.value = value;
            binding.directives.forEach(function(directive){
                directive.update(value);
            })
        }
    })
    return binding;
}



Seed.prototype.destroy = function() {
    for(var key in this.bindings) {
        this.bindings[key].directives.forEach(unbind);
    }
    this.el.parentNode.remove(this.el);
    function unbind(directive) {
        if(directive.unbind) {
            directive.unbind();
        }
    }
}


function cloneAttributes(attributes) {
    return [].map.call(attributes, function(attr){
        return {
            name: attr.name,
            value: attr.value
        }
    });
}

module.exports = {
    create: function(opts) {
        return new Seed(opts);
    },
    directive: function () {
        // create dir
    },
    filter: function () {
        // create filter
    }
}

// 获取标记的dom
// 赋值过程，因为有很多属性名字可能会做重复的操作，排除跟sd打头无关的属性：多个sd怎么办
// 赋值过程上加上过滤的判定
// 多个标签引用同一个值的问题
// 识别不同的directive以及对应的处理
// 特殊的事件处理
// 深入理解事件处理部分的逻辑
// 再次阅读作者源码
/*

var prefix = "sd";
var Directives = require("./directives");
var Filters = require("./filters");
var selector = Object.keys(Directives).map(function(n){
    return '[' + prefix + '-' + n + ']';
});
selector.push('[sd-on-click]');
var log = console.log;

function Seed(opts) {
    var root = document.getElementById(opts.id);
    var els = root.querySelectorAll(selector);
    var self = this;

    self.scope = {};
    self.bindings = {};
    self.directives = {};

    for (var i = 0; i < els.length; i++) {
        bind(els[i], self);
    }

    bind(root, self);

    for(var key in opts.scope) {
        self.scope[key] = opts.scope[key];
    }
    log('els.length = '  + els.length )

    return self;
}

function cloneAttributes(attrs) {
    return [].map.call(attrs, function(n) {
        return {
            attr: n.name,
            name: n.value
        }
    })
}
function bind(el, seed) {
    var attrs = cloneAttributes(el.attributes);
    var attr, name;
    var directive;
    var binding;

    for(var key in attrs) {
        attr = attrs[key].attr;
        name = attrs[key].name;

        if(attr && attr.indexOf(prefix) !== -1) {

            // el.removeAttribute(attr);

            directive = createDirective(attr, name, el);

            if(!seed.bindings[directive.name]) {
                log(directive.name)
                binding = {directives:[], value:null};
                seed.bindings[directive.name] = binding;
            }
            else {
                binding = seed.bindings[directive.name];
            }

            binding.directives.push(directive);

            
            if(!seed.scope.hasOwnProperty(directive.name)) {
                bindSet(binding,{attr:attr,name:name},directive,seed);
            }
        }

    }
}

function bindSet(binding,attr,directive,seed) {
    Object.defineProperty(seed.scope, directive.name, {
        get: function() {
            return seed.bindings[name].value;
        },
        set: function(value) {
            binding.value = value;
            binding.directives.forEach(function(n){
                var filter = n.filter;
                var _value = value;

                if(filter && Filters[n.filter]) {
                    _value = Filters[n.filter].call(null, _value);
                }
                if(directive.definition.customFilter) {
                    _value = directive.definition.customFilter(_value, directive.filter);
                }

                n.update(n.el, _value, n.opt, n,seed);
            });
        }
    });
}
function createDirective(attr, name, el) {
    attr = attr.slice(3);
    var key, opt;
    var splits = attr.split('-');
    key = splits[0];
    opt = splits.splice(1);

    var pipeIndex = name.indexOf("|");
    var _name = pipeIndex === -1 ? name.trim() : name.substring(0, pipeIndex).trim();
    var filter = pipeIndex === -1 ? '' : name.substring(pipeIndex+1).trim();
    var def = Directives[key];
    
    return {
        el:el,
        definition: def,
        key: key,
        opt: opt,
        name: _name,
        filter: filter,
        update: typeof def === 'function' ? def : def.update
        // update: Directives[key] ? Directives[key] : null
    }
}

module.exports = {
    create: function(opts) {
        return Seed(opts);
    }
}
*/
