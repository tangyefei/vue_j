var config = require('./config'),
    watchArray = require('./watch-array')

module.exports = {

    text: function (value) {
        this.el.textContent = value === null ? '' : value.toString()
    },

    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },

    class: function (value) {
        if(this.arg) {
            this.el.classList[value ? 'add' : 'remove'](this.arg)
        }
    },

    checked: {
        bind: function () {
            var el = this.el,
                self = this
            this.change = function () {
                self.seed.scope[self.key] = el.checked
            }
            el.addEventListener('change', this.change)
        },
        update: function (value) {
            // 真正值被储存在了binding.value中，这里只是用作同步到dom的操作
            this.el.checked = value
        },
        unbind: function () {
            this.el.removeEventListener('change', this.change)
        }
    },

    on: {
        update: function (handler) {
            var self = this,
                event = this.arg;
            if (this.handler) {
                this.el.removeEventListener(event, this.handler)
            }
            if (handler) {
                var _handler = function(e) {
                    handler({
                        el: e.currentTarget,
                        originalEvent: e,
                        directive: self,
                        seed: e.currentTarget.seed
                    })
                }
                this.el.addEventListener(event, _handler);
                this.handler = _handler
            }
        },
        unbind: function () {
            var event = this.arg
            if (this.handlers) {
                this.el.removeEventListener(event, this.handlers[event])
            }
        }
    },
    each: {
        bind: function () {
            this.el.removeAttribute(config.prefix + '-each')
            var ctn = this.container = this.el.parentNode
            this.marker = document.createComment('sd-each-' + this.arg)
            ctn.insertBefore(this.marker, this.el)
            ctn.removeChild(this.el)
            this.childSeeds = []
        },
        update: function (collection) {
            this.unbind(true);
            this.childSeeds = []

            if(!Array.isArray(collection))return
            watchArray(collection, this.mutate.bind(this))
            var self = this
            collection.forEach(function (item, i) {
                self.childSeeds.push(self.buildItem(item, i, collection))
            })
        },
        mutate: function (mutation) {
            console.log(mutation)
        },
        buildItem: function (data, index, collection) {
            var Seed = require('./seed'),
                node = this.el.cloneNode(true)
            
            var spore = new Seed(node, {
                    eachPrefixRE: new RegExp('^' + this.arg + '.'),
                    parentSeed: this.seed,
                    index: index,
                    data: data
                })
            this.container.insertBefore(node, this.marker)
            collection[index] = spore.scope
            return spore
        },
        unbind: function (rm) {
            if (this.childSeeds.length) {
                var fn = rm ? 'destroy' : 'unbind'
                this.childSeeds.forEach(function (child) {
                    child[fn].call()
                })
            }
        }
    }

}