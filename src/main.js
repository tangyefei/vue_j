var prefix = 'sd',
    Directives = require('./directives'),
    Filters = require('./filters'),
    selector = Object.keys(Directives).map(function(d) {
        return '[' + prefix + '-' + d + ']';
    });

function Seed(opts) {
    console.log("Seed...")
    var self = this,
        root = this.el = document.getElementById(opts.id),
        els = root.querySelectorAll(selector),
        bindings = {};

        self.scope = {};

        [].forEach.call(els, processNode);

        processNode(root);

        for(var key in bindings) {
            self.scope[key] = opts.scope[key];
        }

        function processNode(el) {
            cloneAttributes(el.attributes).forEach(function(attr) {
                var directive = parseDirective(attr);
                if(directive) {
                    bindDirective(self, el, bindings, directive);
                }
            })
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

function bindDirective(seed, el, bindings, directive) {
    el.removeAttribute(directive.attr.name);
    var key = directive.key,
        binding = bindings[key];

    if(!binding) {
        bindings[key] = binding = {value: undefined,directives:[]};
    }

    directive.el = el;
    binding.directives.push(directive);
    if(directive.bind) {
        directive.bind(el, binding.value);
    }
    if(!seed.scope.hasOwnProperty(key)){
        bindAccessors(seed, key, binding);
    }
}

function bindAccessors(seed,key,binding) {
    Object.defineProperty(seed.scope, key, {
        get: function() {
            return binding.value;
        },
        set: function (value) {
            binding.value = value;
            binding.directives.forEach(function(directive){
                if(value &&  directive.filters) {
                    // 如果是 sd-on-click，执行得到的是一个调用方法，会查询当前el下的.button然后执行changeMessage
                    value = applyFilters(value, directive);
                }

                // 给方法绑定this对象，然后给el添加event的handler
                directive.update(
                    directive.el,
                    value,
                    directive.argument,
                    directive,
                    seed
                )
            })
        }
    })
}

function applyFilters(value, directive) {
    if(directive.definition.customFilter) {
        console.log('value = ' + value + ' filters = ' + JSON.stringify(directive.filters))
        return directive.definition.customFilter(value, directive.filters);
    } else {
        directive.filters.forEach(function(filter) {
            if(Filters[filter]) {
                value = Filters[filter](value);
            }
        });
        return value;
    }
}
function parseDirective(attr) {
    if(attr.name.indexOf(prefix) === -1)return;

    var noprefix = attr.name.slice(prefix.length + 1),
        argIndex = noprefix.indexOf('-'),
        dirname = argIndex === -1 ? noprefix : noprefix.slice(0, argIndex),
        def = Directives[dirname],
        arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);

    var exp = attr.value,
        pipeIndex = exp.indexOf('|'),
        key = pipeIndex === -1 ? exp.trim() : exp.slice(0, pipeIndex).trim(),
        filters = pipeIndex === -1 ? null : exp.slice(pipeIndex + 1).split('|').map(function (filter) {
            return filter.trim();
        })

    return def ? {
        attr:attr,
        key:key,
        filters:filters,
        definition:def,
        argument:arg,
        update: typeof def === 'function' ? def : def.update
    } : null;
            
}

module.exports = {
    create: function(opts) {
        return new Seed(opts);
    },
    filters: Filters,
    directives: Directives
}