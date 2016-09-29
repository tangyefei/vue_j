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

var prefix = 'sd',
    Directives = require('./directives'),
    Filters = require('./filters'),

    // 无法识别到 sd-class-red sd-on-click，querySelectorAll是完整的匹配
    // 能被执行到是因为：sd-class-red的同一个dom有sd-text，而sd-on-click上手动processNode了。
    selector = Object.keys(Directives).map(function(d) {
        return '[' + prefix + '-' + d + ']';
    });

function Seed(opts) {
    var self = this,
        root = this.el = document.getElementById(opts.id),
        els = root.querySelectorAll(selector),
        bindings = {};

        // 这里尤其区分下scope和bingdings的作用，scope用来设置外部传入值更像是一个触发点
        // bindings上
            // 同步scope设置的值（这里的值包括变量名、方法名）
            // 并且会记录与该变量相关的Dom，以及在这些dom上配置的操作

        self.scope = {};

        [].forEach.call(els, processNode);

        processNode(root);

        for(var key in bindings) {
            self.scope[key] = opts.scope[key];
        }

        function processNode(el) {
            // 之所以要clone，是因为每个属性的值被记录到对应的变量下的bingding以后，会被删除
            // 不克隆，可能遍历过程会发现[a,b] [b] 第二次便利的时候index走到1了，b属性移位无法再被遍历到

            // el.attributes是特殊的对象结构，上面每个元素直接console查看是 sd-text="msg" 的文本
            // 实际上可以访问到 attr.name attr.value 分别对应 sd-text msg

            cloneAttributes(el.attributes).forEach(function(attr) {
                var directive = parseDirective(attr);

                 // 处理directives没有这样标签的场景
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
    // 在变量msg下的directives有多了一个，意味着一个msg值会触发多个位置的值的更新
    binding.directives.push(directive);

    // 暂且没用到
    if(directive.bind) {
        directive.bind(el, binding.value);
    }

    // 还没针对key，在scope上设置过set和get的触发点，要进行绑定
    // 如果已经设置过了，不用在设置，上面的操作directives.push(directive)的操作会影响到set内的执行结果了
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

            // 真正设置scope下的值的时候，会触发这里执行
            binding.directives.forEach(function(directive){

                // 本例特殊都有filters，所以这么写：["capitalize"] [".button"]
                if(value &&  directive.filters) {
                    // 内部执行逻辑分为，filters逻辑，和事件逻辑
                    // 1. 如果是sd-text一类，会对限制的值进行修改【filter修改】
                    // 2. 如果是sd-click一类，会得到一个方法，方法里只调用传入的value(一个Function，在这里是changeMessage)进行【方法修改】
                    value = applyFilters(value, directive);
                }

                // value：将最终得到要展示的值，或者要绑定的方法传入
                // 前者走一些text display class的逻辑
                    // text设置el.textContent
                    // display根据value的值得true/false来决定dispaly: block/none
                    // class根据value的值得true/false来决定是否添加class，具体class值为解析部分 sd-class-red这个例子中是"red"
                // 后者，会绑定点击事件，点击发生的时候执行传入的value方法
                    // 尤其注意，在该例子事件是绑定在#test上的，之所以能触发到，是因为点击.button后冒泡传递到了#test， 而限定e.target有.button的class相当于限定了点击.button才有效
                    // 实现颇为曲折
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

    // sd-text="msg | capitalize"
    return def ? {
        attr:attr, // text
        key:key, // msg
        filters:filters, //['capitalize']
        definition:def, // text: function(){....}
        argument:arg, // null, if sd-text-a, then a
        update: typeof def === 'function' ? def : def.update  // text(), if v-on-click, on:{update: function(){}}
    } : null;
}

module.exports = {
    create: function(opts) {
        return new Seed(opts);
    },
    filters: Filters,
    directives: Directives
}