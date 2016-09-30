
module.exports = {
    text: function(value) {
        this.el.textContent = value || '';
    },
    show: function(value) {
        this.el.style.display = value ? '' : 'none';
    },
    class: function(value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg);
    },
    on: {
        update: function(handler) {
            var event = this.arg;
            if(!this.handlers) {
                this.handlers = {};
            }
            var handlers = this.handlers;
            if(handlers[event]) {
                this.el.removeEventListener(event, handlers[event]);
            }
            if(handler) {
                handler = handler.bind(this.el);
                this.el.addEventListener(event, handler);
                handlers[event] = handler;
            }
        },
        unbind: function() {
            var event = this.arg;
            if(this.handlers) {
                this.el.removeEventListener(event, this.handlers[event]);
            }
        }
    },
    each: {
        update: function() {

        }
    }
}// module.exports = {
//     text: function(el,value){
//         el.textContent = value;
//         console.log("sd-text executed...")
//     },
//     show: function(el,value){
//         console.log("sd-show executed...")
//         if(value){
//             el.style.display = 'block';
//         }
//         else {
//             el.style.display = 'none';
//         }
//     },
//     class: function(el,value,opt){
//         console.log("sd-class executed...")
//         el.classList[value ? 'add' : 'remove'](opt);
//     },
//     on: {
//         update: function(el,handler,opt) {
            
//             handler.bind(el);
//             el.addEventListener(opt, handler);
//         },
//         customFilter: function(handler, filter) {
//             return function(e) {
//                 if(e.target.webkitMatchesSelector(filter)) {
//                     handler();
//                     // handler.apply(this.arguments);
//                 }
//             }
//         }
//     }
// }   