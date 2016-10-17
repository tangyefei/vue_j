var todos = [
    {title: 'Chan bug fix',done: false},
    {title: 'Learn vue source code',done: true},
    {title: 'What is the reason',done: false}
];

var app = require("seed");

app.controller('Todos', function(scope){
    scope.todos = todos;
    scope.total = todos.length;

    scope.completed = function(e){
        return scope.todos.filter(function(n,i){return n.done;}).length;
    }

    scope.setFilter = function(e){
        var filter = e.target.getAttribute('data-filter');
        var wrapper =document.getElementById('todoapp').className = filter;
    }

    scope.addTodo = function(e){
        var val = e.currentTarget.value;
        if(val && val.trim()){
            scope.todos.$push({title: val, done: false});
            scope.total++;
        }
        e.currentTarget.value = "";
    }

    scope.removeTodo = function(e, _id, seed) {
        scope.todos.filter(function(n){
            return n._id != _id;
        })
        scope.total--;
        seed.destroy();
    }

    scope.removeCompleted = function(e, _id, seed) {
        seed.childSeeds.forEach(function(seed){
            if(seed.scope.done) {
                seed.destroy();
                scope.total --;
                var index = scope.todos.indexOf(seed.scope);
                scope.todos.splice(seed.scope)
            }
        })
    }

    scope.selectAll = function(e){
        var checked = e.target.checked;
        scope.todos.forEach(function(todo){
            todo.done = checked;
        })
    }

    scope.toggleTodo = function(e, _id, seed) {
        var todo = scope.todos.find(function(n){
            return n._id == _id;
        })
        todo.done = !todo.done;
    }
})

app.bootstrap('#todoapp');