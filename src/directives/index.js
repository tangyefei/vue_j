module.exports = {
    on: require('./on'),

    focus: function (value) {
        this.el[value ? 'focus' : 'blur']()
    },
    
    class: function (value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg)
    },

    text: function (value) {
        this.el.textContent =
            (value !== null && value !== undefined)
            ? value.toString() : ''
    },

    value: {
        bind: function () {
            var el = this.el, self = this
            this.change = function () {
                self.seed.scope[self.key] = el.value
            }
            el.addEventListener('change', this.change)
        },
        update: function (value) {
            this.el.value = value
        },
        unbind: function () {
            this.el.removeEventListener('change', this.change)
        }
    },

    checked: {
        bind: function () {
            var el = this.el, self = this
            this.change = function () {
                self.seed.scope[self.key] = el.checked
            }
            el.addEventListener('change', this.change)
        },
        update: function (value) {
            this.el.checked = !!value
        },
        unbind: function () {
            this.el.removeEventListener('change', this.change)
        }
    },

    each: require('./each')
}
