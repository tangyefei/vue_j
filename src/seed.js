// 拆分文件：包括directive和config √
// 无用代码移除 √ 
// 主流程优化 & 罗列不能解决的问题 √
    // 列表数据同步到界面
    // 代码可读性
    // 计算属性如何保证触发
// 参考You实现改进代码

var config = require("./config");
var controllers = config.controllers;
var directives = require('./directives');

var enhancedMethod = function(self){
// var enhancedMethod = function(key){
    // var _key = key;

    return function(){
        var _collection = this;
        var _arguments = Array.prototype.slice.apply(arguments);
        var _new = _arguments[0];

        _new._id = _collection.length;
        // _arguments.unshift(_collection);
        
        Array.prototype.push.call(_collection, _new);
        console.log('$push method called...')


        var _node = self.eachEl.cloneNode(true);
        var container = self.eachEl._parentNode;

        _node.removeAttribute('sd-each');
        container.appendChild(_node);

        new Seed(_node,{
            parentScope: self.scope,
            scope: _new,
            root: false
        });
        /*
        if(self.dependencies[_key]){
            for (var i = self.dependencies[_key].length - 1; i >= 0; i--) {
                var dKey = self.dependencies[_key][i];
                if(self.bindings[dKey] && self.bindings[dKey].directives && self.bindings[dKey].directives.length){

                    var updateValue = self.bindings[dKey]['value'];
                    var executeFunc = function(directive){
                        directive.update(updateValue);
                    }

                    self.bindings[dKey].directives.forEach(executeFunc)
                        // function(directive){
                        //     executeFunc(directive);
                        //     // directive.update();
                        // }
                }
            }
            console.log(self.dependencies[_key])
        }
        */
    }
}
function Seed(el,opts) {
    var self = this;
    var controller = el.getAttribute(config.ctrlExp);

    for(var okey in opts) {
        self[okey] = opts[okey];
    }

    self.el = el;
    self.scope = self.scope || {};
    self.bindings = {};
    self.dependencies = {};

    if(!controller&&self.root) {
        console.error('no controller defined on root element');
        return;
    }

    var controllerFn = controllers[controller] || function(){};

    controllerFn(self.scope);

    el.removeAttribute(config.ctrlExp);

    self.compileNode(el);

    for(var key in self.scope){
        if(self.scope[key] instanceof Array){
            self.scope[key].$push = enhancedMethod(self)
        }
    }

    for(var akey in self.bindings) {
        self._bind(akey, self.bindings[akey]);
    }

    function executeBindingDirectives(_binding){
        if(_binding.value && _binding.directives && _binding.directives.length){
            _binding.directives.forEach(function(directive){
                directive.update(_binding.value);
            })
        }
    }

    for(var bkey in self.bindings) {
        executeBindingDirectives(self.bindings[bkey]);
    }
}

Seed.prototype.createDirective = function(name, value, scope, el, seed) {
    var depended = value.indexOf(">")!==-1 ? value.split('>')[1] : null;

    value = value.indexOf(">")!==-1 ? value.split('>')[0] : value;

    var key = name.split("-")[1],
        event = value.indexOf(':')!==-1 ? value.split(":")[0] : '',
        arg = value.indexOf(':')!==-1 ? value.split(":")[1] : value,
        update = directives[key]["update"];

    if(depended) {
        seed.dependencies[depended] = seed.dependencies[depended] || [];
        seed.dependencies[depended].push(arg);
        console.log(depended + ' trigger:' + seed.dependencies[depended])
    }


    return {
        key:key,
        event:event,
        arg:arg,
        scope:scope,
        el:el,
        update:update,
        seed:seed,
        elBackup: el.cloneNode(true)
    }
}

Seed.prototype.destroy = function() {
    this.el.parentNode.removeChild(this.el);
}

Seed.prototype._bind = function(arg, binding){
    var prop = arg.indexOf(':')!==-1 ? arg.split(':')[1] : arg;

    if(this.scopeBinded)
        return false;
    
    Object.defineProperty(this.scope, prop, {
        get: function(){
            return binding.value;
        },
        set: function(value){
            binding.value = value;
            binding.directives.forEach(function(directive){
                directive.update(value);
            })
            /*
            if(self.dependencies[prop]) {
                // log('update:' + self.dependencies[prop])
                for(var dKey of self.dependencies[prop]){
                    if(self.bindings[dKey] && self.bindings[dKey].directives && self.bindings[dKey].directives.length){
                        self.bindings[dKey].directives.forEach(function(directive){
                            directive.update(self.bindings[dKey]['value']);
                        })
                    }
                }
            }
            */
        }
    });
}

Seed.prototype.compileNode = function(el) {
    if(el.nodeType===3||el.nodeType===8) return;

    var self = this;
    var isEachExp = Array.prototype.slice.call(el.attributes).find(function(attr){return attr.name===config.eachExp});

    Array.prototype.slice.call(el.attributes).forEach(function(attr){
        var name = attr.name,
            value = attr.value;

        if(name.indexOf(config.prefix) === -1)return;

        var arg = value.indexOf(':')!==-1 ? value.split(":")[1] : value;
        var bindingKey = arg.indexOf('.')!==-1 ? arg.split(".")[1] : arg;
        bindingKey = bindingKey.indexOf('>')!==-1 ?  bindingKey.split('>')[0] : bindingKey;

        var binding = self.bindings[bindingKey];
        if(!binding) {
            binding = self.bindings[bindingKey] = {
                directives: [],
                value: null
            };
        }

        var directive = self.createDirective(name, value, self.scope, el, self);

        binding.directives.push(directive);

        var _scope = self.scope;
        var _arg = directive.arg;

        if(directive.arg.indexOf('.')!==-1) {
            _arg = directive.arg.split('.')[1];
            _scope = self.scope;
        }
        else if(!_scope[_arg]){
            _scope = self.parentScope;
        }

        binding.value = _scope[_arg];

        if(!isEachExp){
            el.removeAttribute(name);
        }
        else {
            self.eachEl = el;
        }
    });

    if(!isEachExp) {
        el.childNodes.forEach(function(node){
            self.compileNode(node);
        });
    }
}

module.exports = Seed;