const archiver = require('archiver')
const getCacheDir = require('./cache-dir')

async function zip(filePaths) {
    const archive = archiver('zip')
    const cacheDir = await getCacheDir()

    archive.on('error', handleError)

    _.each(filePaths, function (fileItem) {
        archive.append($.fs.createReadStream(fileItem.path), {
            name: fileItem.path.replace(cacheDir, '')
        })
    })

    archive.finalize()

    // this can be piped upon the request...
    return archive
}

module.exports = zip
