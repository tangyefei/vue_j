module.exports = {
    update: function(handler){
        var event = this.event,
            el = this.el,
            that = this;

        var proxy = (function(that, handler) {
            var _id = that.scope._id;
            var seed = that.seed;

            return function(e){
                handler(e, _id, seed);
            }
        })(that, handler);

        // el.removeEventListener(event);
        el.addEventListener(event, proxy);
    }
}