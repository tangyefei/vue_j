module.exports = {
    on: require('./on'),

    class: function (value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg)
    },

    text: function (value) {
        this.el.textContent =
            (value !== null && value !== undefined)
            ? value.toString() : ''
    },

    each: require('./each')
}
