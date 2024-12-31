const traverse = require('traverse')

module.exports = (obj, keys) => {
    return traverse(obj).forEach(function (x) {
        if (_.includes(keys, this.key)) {
            return this.remove()
        }
        if (/^\_/gi.test(this.key)) {
            return this.remove()
        }
    })
}
