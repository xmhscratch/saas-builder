const gm = require('gm').subClass({ imageMagick: true })
const { v4: uuidV4 } = require('uuid')

class Thumbnail {

    static async create(
        imageBuffer,
        {
            width = 64,
            height = 64,
            quality = 100,
        },
    ) {
        const rootDirPath = config('system.rootDirPath')

        const sourcePath = `/export/tmp/${uuidV4()}.bin`
        const sourcePathFS = fs(sourcePath)

        await sourcePathFS
            .write(imageBuffer, { encoding: null })
            .catch(handleError)

        const objects = await new Promise((resolve, reject) => {
            const forked = $.childProcess
                .fork(`${rootDirPath}/bin/detect-face.js`)

            forked.on('message', (msg) => {
                return resolve(msg)
            })
            forked.send({ sourcePath })
        })

        let boost = [
            {
                x: 0,
                y: 0,
                width: width,
                height: height,
                weight: 1.0,
            }
        ]
        if (objects.length) {
            boost = objects.map((rect) => {
                return {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    weight: 1.0,
                }
            })
        }

        let thumbWidth = width
        let thumbHeight = height

        thumbWidth = thumbWidth || thumbHeight || 64
        thumbHeight = thumbHeight || thumbWidth || 64

        const { topCrop } = await new Promise((resolve, reject) => {
            const forked = $.childProcess
                .fork(`${rootDirPath}/bin/crop.js`)

            forked.on('message', (msg) => {
                resolve(msg)
            })
            forked.send({ sourcePath, options: { boost, width, height, } })
        })

        if (!topCrop) {
            console.log(topCrop, sourcePath)
        }

        const imageOperation = gm(imageBuffer)
            .crop(
                topCrop.width,
                topCrop.height,
                topCrop.x,
                topCrop.y,
            )
            .strip()
            .noProfile()
            .filter('hamming')
            .colorspace('RGB')
            // .define('profile:skip=ICC')
            .resize(thumbWidth, thumbHeight)
            .out('-quality', quality)

        const toBufferPromise = Promise.promisify(
            imageOperation.toBuffer.bind(imageOperation)
        )
        return toBufferPromise('PNG')
            .catch(handleError)
    }
}

module.exports = Thumbnail
