module.exports = {
    update: function(collection) {
        var el = this.el;
        var scope = this.scope;
        var container = this.el.parentNode;
        var seed = this.seed;

        if(container) {
            container.removeChild(this.el);
            el._parentNode = container;
        }
        else {
            container = el._parentNode;
        }

        for (var i = container.children.length - 1; i >= 0; i--) {
            var node = container.children[i];
            container.removeChild(node);
        }

        seed.childSeeds = seed.childSeeds || [];

        var Seed = require("../seed");
        
        collection.forEach(function(data, i){
            var _el = el.cloneNode(true);
            _el.removeAttribute('sd-each');
            container.appendChild(_el);
            data._id = i;
            seed.childSeeds.push(new Seed(_el,{
                parentScope: scope,
                scope: data,
                root: false
            }));
        })
    }
}
