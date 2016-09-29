// module.exports = {
//     capitalize: function(value) {
//         return value.charAt(0).toUpperCase() + value.substring(1);
//     }
// }
module.exports = {
    capitalize: function(value) {
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}