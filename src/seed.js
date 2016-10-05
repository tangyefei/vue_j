var Emitter = require('emitter'),
    config        = require('./config'),
    controllers   = require('./controllers'),
    DirectiveParser = require('./directive-parser')

var slice = Array.prototype.slice;

// lazy init
var ctrlAttr,
    eachAttr

function Seed (el, data, options) {

    // refresh
    ctrlAttr = config.prefix + '-controller'
    eachAttr = config.prefix + '-each'

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    el.seed = this
    this.el         = el
    this.scope      = data
    this._bindings  = {}

    if (options) {
        this.parentSeed = options.parentSeed
        this.eachPrefixRE = new RegExp('^' + options.eachPrefix + '.');
        this.eachIndex = options.eachIndex;
    }


    var key
    // keep a temporary copy for all the real data
    // so we can overwrite the passed in data object
    // with getter/setters.
    this._dataCopy = {}
    for (key in data) {
        this._dataCopy[key] = data[key]
    }

    // if has controller
    var ctrlID = el.getAttribute(ctrlAttr),
        controller = null
    if (ctrlID) {
        controller = controllers[ctrlID]
        el.removeAttribute(ctrlAttr)
        if (!controller) throw new Error('controller ' + ctrlID + ' is not defined.')
    }

    // process nodes for directives
    // first, child with sd-each directive
    
    this._compileNode(el, true)

    // initialize all variables by invoking setters
    for (key in this._dataCopy) {
        this.scope[key] = this._dataCopy[key]
    }
    delete this._dataCopy

    // copy in methods from controller
    if (controller) {
        controller.call(this, this.scope, this)
    }
}

Emitter(Seed.prototype)

Seed.prototype._compileNode = function (node, root) {
    var self = this

    if (node.nodeType === 3 || node.nodeType === 8) { // text node
        console.log('has come nodeType == 3 or 8')
        self._compileTextNode(node)

    } else {

        var eachExp = node.getAttribute(eachAttr),
            ctrlExp = node.getAttribute(ctrlAttr)

        if (eachExp) { // each block

            console.log('eachExp...')
            var binding = DirectiveParser.parse(eachAttr, eachExp)
            if (binding) {
                self._bind(node, binding)
                // need to set each block now so it can inherit
                // parent scope. i.e. the childSeeds must have been
                // initiated when parent scope setters are invoked

                // 找不到特别的理由，一定在这里调用

                self.scope[binding.key] = self._dataCopy[binding.key]
                delete self._dataCopy[binding.key]
            }
        } else if (ctrlExp && !root) { // nested controllers

        // TODO need to be clever here!

        } else if (node.attributes && node.attributes.length) { // normal node (non-controller)
            slice.call(node.attributes).forEach(function(attr) {
                var valid = false
                attr.value.split(',').forEach(function (exp) {
                    var binding = DirectiveParser.parse(attr.name, exp)
                    if (binding) {
                        valid = true
                        self._bind(node, binding)
                    }
                })
                if (valid) node.removeAttribute(attr.name)
            })
        }

        if(!eachExp && !ctrlExp) {
            if(node.childNodes.length) {
                slice.call(node.childNodes).forEach(function(child) {
                    self._compileNode(child);
                })

            }
        }
    }
}

Seed.prototype._compileTextNode = function (node) {
    return node
}

Seed.prototype._bind = function (node, directive) {

    directive.el = node
    directive.seed = this

    var key = directive.key,
        snr = this.eachPrefixRE,
        isEachKey = snr && snr.test(key),
        scopeOwner = this
    // TODO make scope chain work on nested controllers

    // 如果表达式中是类似于 todo.done的，那么直接替换掉todo.当前缀，然后使用自身作用域
    if (isEachKey) {
        key = key.replace(snr, '')
    } else if (snr) { // 否则是changeMessage这样的 ，表明需要使用父中的方法
        scopeOwner = this.parentSeed
    }

    directive.key = key;

    var binding = scopeOwner._bindings[key] || scopeOwner._createBinding(key)

    // add directive to this binding
    binding.instances.push(directive)

    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(binding.value)
    }

}

Seed.prototype._createBinding = function (key) {

    var binding = {
        value: null,
        instances: []
    }

    this._bindings[key] = binding

    // bind accessor triggers to scope
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.instances.forEach(function (instance) {
                console.log('key set: ' + JSON.stringify(value))
                instance.update(value)
            })
        }
    })

    return binding
}

Seed.prototype.dump = function () {
    var data = {}
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}

Seed.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].instances.forEach(unbind)
        delete this._bindings[key]
    }
    this.el.parentNode.removeChild(this.el)
    function unbind (instance) {
        if (instance.unbind) {
            instance.unbind()
        }
    }
}

module.exports = Seed