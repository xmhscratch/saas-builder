const crypto = require('crypto')
const parseJSON = require('parse-json')
const { v1: uuidV1, v4: uuidV4, v5: uuidV5 } = require('uuid')
const classNames = require('classnames')

module.exports.uuidV1 = uuidV1
module.exports.uuidV4 = uuidV4
module.exports.uuidV5 = uuidV5

module.exports.parseJSON = (string) => {
    var json = string
    try {
        json = parseJSON(string)
    }catch(e) {
        return json
    }
    return json
}

module.exports.randomString = (length) => {
    var result = ''
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))]
    return result
}

module.exports.replaceWithRandomChars = (tmpl) => {
    let idx = 0, rdms = module.exports.randomString(tmpl.match(/(\#{1})/gi).length)
    return tmpl.replace(/(\#{1})/gi, () => {
        let str = rdms[idx]; idx++;
        return str
    })
}

module.exports.encrypt = (text) => {
    const algorithm = config('system.crypto.algorithm')
    const password = config('system.crypto.password')
    const salt = config('system.crypto.salt')
    const key = crypto.scryptSync(password, salt, 24)
    const iv = Buffer.alloc(16, 0)
    const cipher = crypto.createCipheriv(
        algorithm, key, iv,
        { authTagLength: 16 }
    )

    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
}

module.exports.decrypt = (text) => {
    const algorithm = config('system.crypto.algorithm')
    const password = config('system.crypto.password')
    const salt = config('system.crypto.salt')
    const key = crypto.scryptSync(password, salt, 24)
    const decipher = crypto.createDecipheriv(
        algorithm, key, iv,
        { authTagLength: 16 },
    )

    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
}

module.exports.randomBytes = (length) => {
    const buf = crypto.randomBytes(length)
    return buf.toString('hex')
}

module.exports.fileSize = (a,b,c,d,e) => {
    return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)+' '+(e?'KMGTPEZY'[--e]+'iB':'Bytes')
}

module.exports.toBoolean = (string) => {
    return (/(true|1|yes|accept|on)/g).test(String(string).toLowerCase()) ? true : false
}

module.exports.domStyleToString = (obj) => {
    return _
        .chain(obj)
        .reduce((accumulator, value, key) => {
            if (_.isEmpty(key)) { return accumulator }
            accumulator += _.split(key, /(?=[A-Z])/).join('-').toLowerCase() + ':' + value + ';'
            return accumulator
        }, '')
        .value()
}

module.exports.domDataToString = (obj) => {
    return _
        .chain(obj)
        .reduce((accumulator, value, key) => {
            if (_.isEmpty(key)) { return accumulator }
            accumulator += `data-${_.kebabCase(key)}` + '="' + value + '" '
            return accumulator
        }, '')
        .value()
}

module.exports.getResponsiveClassNames = (value) => {
    let result = ''

    value = _.toArray(value)
    value = value.sort ? value.sort() : value
    value = _.map(value, _.toNumber)

    if (_.isNumber(value)) {
        result = 'is-hidden'
    }
    else if (!_.isEmpty(value) && !_.matches({ 0: 0, 1: 5 })(value)) {
        result = classNames(
            _.cond([
                [_.matches({ 0: 1 }), _.constant('is-hidden-mobile')],
                [_.matches({ 0: 2 }), _.constant('is-hidden-touch')],
                [_.matches({ 0: 3 }), _.constant('is-hidden-touch is-hidden-desktop-only')],
                [_.matches({ 0: 4 }), _.constant('is-hidden-touch is-hidden-desktop-only is-hidden-widescreen-only')],
            ])(value),
            {
                "is-hidden-tablet": _.matches({ 1: 1 })(value),
                "is-hidden-desktop": _.matches({ 1: 2 })(value),
                "is-hidden-widescreen": _.matches({ 1: 3 })(value),
                "is-hidden-fullhd": _.matches({ 1: 4 })(value),
            },
        )
    }
    else { }

    return result
}
