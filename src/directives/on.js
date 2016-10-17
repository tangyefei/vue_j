module.exports = {
    fn : true,
    update: function (handler) {
        if (!handler) return
        var self  = this,
            event = this.arg

        // a normal handler
        this.handler = function (e) {
            handler.call(self.seed.scope, {
                originalEvent : e,
                el            : e.currentTarget,
                scope         : self.seed.scope
            })
        }
        this.el.addEventListener(event, this.handler)
    },
}