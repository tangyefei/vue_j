var config          = require('./config'),
    DirectiveParser = require('./directive-parser')

var slice           = Array.prototype.slice,
    ctrlAttr        = config.prefix + '-controller',
    eachAttr        = config.prefix + '-each'

function Seed (el, options) {
    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el         = el
    this._bindings  = {}

    // copy options
    options = options || {}
    for (var op in options) {
        this[op] = options[op]
    }

    this.scope = (options && options.data) || {};
    
    // revursively process nodes for directives
    this._compileNode(el, true)

    // if has controller, apply it
    var ctrlID = el.getAttribute(ctrlAttr)
    if (ctrlID) {
        el.removeAttribute(ctrlAttr)
        var controller = config.controllers[ctrlID]
        if (controller) {
            controller.call(this, this.scope)
        } else {
            console.warn('controller ' + ctrlID + ' is not defined.')
        }
    }
}

Seed.prototype._compileNode = function (node) {
    var self = this

    if (node.nodeType !== 3&&node.nodeType !== 8) { // exclude comment nodes

        var eachExp = node.getAttribute(eachAttr)

        if (eachExp) { // each block
            var binding = DirectiveParser.parse(eachAttr, eachExp)
            if (binding) {
                self._bind(node, binding)
            }
        }
        else {
            // parse if has attributes
            if (node.attributes && node.attributes.length) {
                slice.call(node.attributes).forEach(function (attr) {
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

            // recursively compile childNodes
            if (node.childNodes.length) {
                slice.call(node.childNodes).forEach(function (child) {
                    self._compileNode(child)
                })
            }
        }

    }
}


Seed.prototype._bind = function (node, directive) {
    directive.el   = node
    directive.seed = this

    var key = directive.key,
        epr = this.eachPrefixRE,
        isEachKey = epr && epr.test(key),
        scope = this

    if (isEachKey) {
        key = directive.key = key.replace(epr, '')
    }

    if (epr && !isEachKey) {
        scope = this.parentSeed
    }

    var binding = scope._bindings[key] || scope._createBinding(key)
            
    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(binding.value)
    }

    // add directive to this binding
    binding.instances.push(directive)

    // set initial value
    directive.update(binding.value)
}

Seed.prototype._createBinding = function (key) {

    var binding = {
        value: this.scope[key],
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
                instance.update(value)
            })
        }
    })

    return binding
}

module.exports = Seed