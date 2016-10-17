module.exports = {
    on: require('./on'),
    class: {
        update: function(value){
            this.el.classList[value ? 'add' : 'remove'](this.event);
        }
    },
    text: {
        update: function(value){
            this.el.textContent = (typeof (value) === 'function') ? value() : value;
        }
    },
    each: require('./each')
}
