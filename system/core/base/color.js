const invert = require('invert-color')

const RGBA_REGEX = /^rgb(a|)\(([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)[, ]{0,}([+-]?([0-9]*[.])?[0-9]+|)\)$/gi
const HSLA_REGEX = /^hsl(a|)\(([0-9]+)[, ]+([0-9]+)\%[, ]+([0-9]+)\%[, ]{0,}([+-]?([0-9]*[.])?[0-9]+|)\)$/gi
const HEX_REGEX = /^#(|)?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/gi

class Color {

    get color() {
        return this._color
    }

    set color(value) {
        this._color = value
    }

    constructor(inputText) {
        this._color = Color.getColorInfo(inputText)
        return this
    }

    toRGBAString() {
        return Color.toRGBAString(this._color)
    }

    toHexString() {
        return Color.toHexString(this._color)
    }

    invertColor(options) {
        this._color = Color.getColorInfo(invert(this._color, options))
        return this
    }

    static getColorInfo(inputValue) {
        if (_.isPlainObject(inputValue)) {
            return inputValue
        }

        const isRgba = (new RegExp(RGBA_REGEX, 'gi')).test(inputValue)
        const isHsla = (new RegExp(HSLA_REGEX, 'gi')).test(inputValue)
        const isHex = (new RegExp(HEX_REGEX, 'gi')).test(inputValue)

        let colorInfo

        if (isRgba) {
            const matches = (new RegExp(RGBA_REGEX, 'gi')).exec(inputValue)
            colorInfo = {
                r: parseInt(matches[2], 10),
                g: parseInt(matches[3], 10),
                b: parseInt(matches[4], 10),
                a: _.isEmpty(matches[5]) ? (_.eq(matches[5], 0) ? 0 : 1) : Number.parseFloat(matches[5]),
            }
        }
        else if (isHex) {
            const matches = (new RegExp(HEX_REGEX, 'gi')).exec(inputValue)
            colorInfo = {
                r: parseInt(matches[2], 16),
                g: parseInt(matches[3], 16),
                b: parseInt(matches[4], 16),
                a: 1,
            }
        }
        else if (isHsla) {
            const matches = (new RegExp(HSLA_REGEX, 'gi')).exec(inputValue)
            colorInfo = Color.hslToRgb(
                parseInt(matches[2], 10),
                parseInt(matches[3], 10),
                parseInt(matches[4], 10),
            )
            colorInfo.a = _.isEmpty(matches[5]) ? (_.eq(matches[5], 0) ? 0 : 1) : Number.parseFloat(matches[5])
        }

        return colorInfo
    }

    static toRGBAString(colorInfo) {
        const hasA = _.lt(colorInfo.a, 1)
        return `rgb${hasA ? 'a' : ''}(${colorInfo.r},${colorInfo.g},${colorInfo.b}${hasA ? `,${colorInfo.a}` : ''})`
    }

    static toHexString(colorInfo) {
        // console.log(colorInfo)
        return `#${((1 << 24) + (colorInfo.r << 16) + (colorInfo.g << 8) + colorInfo.b).toString(16).slice(1)}`
    }

    static hslToRgb(h, s, l) {
        s /= 100
        l /= 100

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x
        }

        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)

        return { r, g, b }
    }
}

module.exports.RGBA_REGEX = RGBA_REGEX
module.exports.HSLA_REGEX = HSLA_REGEX
module.exports.HEX_REGEX = HEX_REGEX

module.exports.Color = Color
