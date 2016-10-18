var config = require('../config')

module.exports = {
    bind: function () {
        this.el.removeAttribute(config.prefix + '-each')
        var ctn = this.container = this.el.parentNode
        this.marker = document.createComment('sd-each-' + this.arg)
        ctn.insertBefore(this.marker, this.el)
        ctn.removeChild(this.el)
    },

    update: function(collection) {
        if (!Array.isArray(collection)) return
        this.collection = collection
        var self = this

        collection.forEach(function (data, i) {
            var seed = self.buildItem(data, i)
            self.container.insertBefore(seed.el, self.marker)
        })

        // var el = this.el;
        // var scope = this.scope;
        // var container = this.el.parentNode;
        // var seed = this.seed;

        // if(container) {
        //     container.removeChild(this.el);
        //     el._parentNode = container;
        // }
        // else {
        //     container = el._parentNode;
        // }

        // for (var i = container.children.length - 1; i >= 0; i--) {
        //     var node = container.children[i];
        //     container.removeChild(node);
        // }

        // seed.childSeeds = seed.childSeeds || [];

        // var Seed = require("../seed");
        
        // collection.forEach(function(data, i){
        //     var _el = el.cloneNode(true);
        //     _el.removeAttribute('sd-each');
        //     container.appendChild(_el);
        //     data._id = i;
        //     seed.childSeeds.push(new Seed(_el,{
        //         parentScope: scope,
        //         scope: data,
        //         root: false
        //     }));
        // })
    },
    // , index
    buildItem: function (data) {
        var Seed = require('../seed'),
            node = this.el.cloneNode(true)
        var spore = new Seed(node, {
                // each: true,
                eachPrefixRE: new RegExp('^' + this.arg + '.'),
                parentSeed: this.seed,
                // index: index,
                data: data
            })
        // this.collection[index] = spore.scope
        return spore
    },
}
