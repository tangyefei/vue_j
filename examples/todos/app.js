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
    scope.allDone = false
    scope.remaining = todos.reduce(function (count, todo) {
        return count + (todo.done ? 0 : 1)
    }, 0)

    // event handlers ---------------------------------------------------------
    scope.total = function () {
        return scope.todos.length
    }
    scope.addTodo = function (e) {
        var val = e.el.value
        if (val) {
            e.el.value = ''
            scope.todos.unshift({ text: val, done: false })
        }
        scope.remaining++
    }

    scope.updateCount = function (e) {
        scope.remaining += e.scope.done ? -1 : 1
        scope.allDone = scope.remaining === 0
    }

    scope.edit = function (e) {
        e.scope.editing = true
    }

    scope.stopEdit = function (e) {
        e.scope.editing = false
    }

    scope.toggleAll = function (e) {
        scope.todos.forEach(function (todo) {
            todo.done = e.el.checked
        })
        scope.remaining = e.el.checked ? 0 : scope.total()
    }
})

Seed.bootstrap();