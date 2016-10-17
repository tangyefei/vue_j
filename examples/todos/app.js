var Seed = require('seed')

var todos = [
    { text: 'make nesting controllers work', done: true },
    { text: 'complete ArrayWatcher', done: false },
    { text: 'computed properties', done: false },
    { text: 'parse textnodes', done: false }
]

Seed.controller('Todos', function(scope){

    // regular properties -----------------------------------------------------
    scope.todos = todos;    
    scope.remaining = todos.reduce(function (count, todo) {
        return count + (todo.done ? 0 : 1)
    }, 0)

    // event handlers ---------------------------------------------------------
    scope.addTodo = function (e) {
        var val = e.el.value
        if (val) {
            e.el.value = ''
            scope.todos.unshift({ text: val, done: false })
        }
        scope.remaining++
        console.log(scope.todos)
        console.log(scope.remaining)
    }
})

Seed.bootstrap();