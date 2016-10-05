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
        else {
            console.log('ever come here?')
            this.el.classList.remove(this.lastvalue);
            this.el.classList.add(value);
            this.lastvalue = value;
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
                        seed: self.seed
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

    checked: {
        bind: function() {
            var self = this,
                el = this.el;

            this.change = function() {
                self.seed.scope[self.key] = el.checked;
            }
            el.addEventListener('change', this.change);
        },
        update: function(value) {
            // 真正值被储存在了binding.value中，这里只是用作同步到dom的操作
            this.el.checked = value;
        },
        unbind: function() {
            this.el.removeEventListener('change', this.change);
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
            if (this.childSeeds.length) {
                this.childSeeds.forEach(function (child) {
                    child.destroy()
                })
                this.childSeeds = []
            }
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
            
            var spore = new Seed(node, data, {
                    eachPrefix: this.arg,
                    parentSeed: this.seed,
                    eachIndex: index,
                    eachCollection: collection
                })
            this.container.insertBefore(node, this.marker)
            collection[index] = spore.scope
            return spore
        }
    }

}