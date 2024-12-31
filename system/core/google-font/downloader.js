const conf = require('./conf')
const getCacheDir = require('./cache-dir')
// const debug = require('debug')('gwfh:downloader')

async function downloadFontFiles(fontItem) {
    let filePaths = []

    await Promise
        .each(fontItem.variants, async (variantItem) => {
            // debug(_.keys(conf.USER_AGENTS))
            return Promise
                .each(_.keys(conf.USER_AGENTS), async (formatKey) => {
                    const filename = `${fontItem.id}-${fontItem.version}-${fontItem.storeID}-${variantItem.id}.${formatKey}`
                    const filepath = fs(await getCacheDir(), filename).root

                    if (!variantItem[formatKey]) {
                        // font format is not available for download...
                        console.warn(filepath, "format not available for download", formatKey)
                        return
                    }

                    // download the file for type (filepath now known)
                    await downloadFile(variantItem[formatKey], filepath)
                        .catch(handleError)

                    filePaths.push({
                        variant: variantItem.id, // variants and format are used to filter them out later!
                        format: formatKey,
                        path: filepath,
                    })

                    return
                })
        })
        .catch(handleError)

    // debug("family downloaded")

    return filePaths
}

async function downloadFile(url, dest) {
    return new Promise(async (resolve, reject) => {
        const cacheDir = await getCacheDir()
        const filename = dest.replace(cacheDir, '')

        const _downloadFile = () => {
            // debug("downloadFile", url, dest)
            var file = $.fs.createWriteStream(dest)
            var req = $.https.get(url, function (response) {
                response.pipe(file)

                file.on('finish', function () {
                    file.close(resolve)
                    console.info(`downloaded: ${filename}`)
                })
            })
            req.on('error', function (e) {
                // debug('problem with request: ' + e.message + " for url: " + url)
                return reject(e)
            })
            return req.end()
        }

        return $.fs.stat(dest, (err, stats) => {
            if (err) {
                return _downloadFile()
            }
            if (stats.size <= 0) {
                return _downloadFile()
            }
            return resolve()
        })
    })
}

module.exports = downloadFontFiles
