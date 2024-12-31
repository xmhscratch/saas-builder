const conf = require('./conf')

module.exports = async function getCacheDir() {
    const cacheDirFS = fs(conf.CACHE_DIR).ensureSync()
    return cacheDirFS.root
}
