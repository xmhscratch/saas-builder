const googleFontsAPI = require('./google-fonts-api')
const urlFetcher = require('./url-fetcher')
const downloader = require('./downloader')
const zipper = require('./zipper')
const subsetGen = require('./subset-gen')

// const debug = require('debug')('gwfh:core')

const { EventEmitter } = require('events')

const findByValues = function (collection, property, values) {
    return _.filter(collection, function (item) {
        return _.includes(values, item[property])
    })
}

class GoogleFont {

    constructor() {
        // manage multiple requests to non-complete resources via an emitter ()
        this.emitter = new EventEmitter()

        this.googleAPIFontItems = [] // holds originally fetched items from the Google Fonts API
        this.cachedFonts = [] // holds actual item list that can get requested - houses a "font" Object

        // The subsetStore is utilzing the subsetTuples generator and identified by the font.id!
        this.subsetStore = {} // every item in here holds a urlStore Object + a unique subset combo.
        // urlStore holds fetched urls to all conf.USER_AGENTS font formats
        // gets merged with an item from cachedFonts to form a so called "fontItem" Object

        // fileStore holds arrays of local paths to font files, id = fontItem.id + "-" + fontItem.storeID
        this.fileStore = {}

        return this
    }

    async initialize() {
        const {
            cachedFonts,
            googleAPIFontItems,
            subsetStore,
        } = this

        const items = await googleFontsAPI(googleAPIFontItems, cachedFonts)
            .catch(handleError)

        // items are cached, build up the subsetStore...
        let subsetStoreUniqueCombos = 0

        await Promise
            .each(items, function (item) {
                let uniqueSubsetCombos = subsetGen(item.subsets)

                // Create subsetStore for item
                subsetStore[item.id] = uniqueSubsetCombos

                // for startup: remember count of items to print it out...
                subsetStoreUniqueCombos += _.keys(uniqueSubsetCombos).length
            })
            .catch(handleError)

        // debug("fonts cached and initialized. num fonts: " + items.length +
        //   " num unique subset combos: " + subsetStoreUniqueCombos)
    }

    async findAll() {
        const { cachedFonts } = this
        if (cachedFonts.length <= 0) {
            await this.initialize().catch(handleError)
        }
        return cachedFonts
    }

    async get(id, subsetsArr) {
        const { cachedFonts } = this
        if (cachedFonts.length <= 0) {
            await this.initialize().catch(handleError)
        }
        const font = _.find(cachedFonts, { id })

        if (_.isUndefined(font) === false) {
            const fontItem = await this
                .getFontItem(font, subsetsArr)
                .catch(handleError)

            return fontItem
        } else {
            // font not found!
            // console.error("font not found: " + id)
            return null
        }
    }

    async getDownload(id, subsetsArr, variantsArr, formatsArr) {
        const { cachedFonts } = this
        if (cachedFonts.length <= 0) {
            await this.initialize().catch(handleError)
        }
        let font = _.find(cachedFonts, { id: id })

        if (_.isUndefined(font) === false) {
            const fontItem = await this
                .getFontItem(font, subsetsArr)
                .catch(handleError)

            const fileStoreItem = await this
                .getFontFiles(fontItem)
                .catch(handleError)

            var filteredFiles = fileStoreItem.files

            // filter away unwanted variants...
            if (variantsArr !== null) {
                filteredFiles = findByValues(filteredFiles, "variant", variantsArr)
            }

            // filter away unwanted formats...
            if (formatsArr !== null) {
                filteredFiles = findByValues(filteredFiles, "format", formatsArr)
            }

            if (filteredFiles.length > 0) {
                // callback and return archiveStream + zipped filename
                return {
                    archiveStream: await zipper(filteredFiles),
                    filename: fileStoreItem.zippedFilename,
                }
            } else {
                // no files left, return null
                return null
            }
        } else {
            // font not found!
            // console.error("font not found: " + id)
            return null
        }
    }

    async getFontItem(font, subsetsArr) {
        const { subsetStore } = this
        // find the relevant subsetStore Object that holds the needed unique urlStore to fetch
        const subsetStoreKey = this.getUrlStoreKey(font, subsetsArr)
        const urlStore = subsetStore[font.id][subsetStoreKey]

        // debug(urlStore)
        return new Promise(async (resolve, reject) => {
            if (_.isUndefined(urlStore.variants) === false) {
                // debug(urlStore)
                if (urlStore.isDirty !== true) {
                    // already cached, return instantly
                    // debug("already cached!")
                    const fontItem = _.merge(_.cloneDeep(font), urlStore)
                    return resolve(fontItem)
                } else {
                    // process to cache has already begun, wait until it has finished...
                    // debug("waiting until cache...")

                    this.emitter.once(font.id + "-pathFetched-" + urlStore.storeID, function (fontItem) {
                        return resolve(fontItem)
                    })
                }
                // return here - attached to emitter or callbacked!
                return
            }

            // Download paths weren't fetched till now
            // add a new entry
            urlStore.variants = []
            urlStore.isDirty = true

            // debug(subsetStore)

            // Fetch fontItem for the first time...
            const urlStoreObject = await urlFetcher(font, subsetStoreKey)
                .catch(reject)

            // debug("fetched fontItem", urlStoreObject)
            var fontItem

            // save the urlStoreObject...
            _.assign(subsetStore[font.id][subsetStoreKey], urlStoreObject)

            // fontItem is ready, no longer dirty (but files still are!)
            // remove dirty flag from store...
            delete subsetStore[font.id][subsetStoreKey].isDirty

            // set and build up a proper fontItem
            fontItem = _.merge(_.cloneDeep(font), subsetStore[font.id][subsetStoreKey])

            // debug("saveable fontimte processed", fontItem)

            // fullfill the original request
            resolve(fontItem)

            // fullfill still pending requests awaiting process completion
            this.emitter.emit(font.id + "-pathFetched-" + urlStoreObject.storeID, fontItem)

            // trigger obviating downloading of font files (even tough it's might not needed!)
            this
                .getFontFiles(fontItem)
                .catch(handleError)

            // debug(urlStore)
        })
    }

    async getFontFiles(fontItem) {
        const { fileStore } = this
        var fileStoreID = fontItem.id + "-" + fontItem.storeID // unique identifier in filestore.

        return new Promise(async (resolve, reject) => {
            if (_.isUndefined(fileStore[fileStoreID]) === false) {
                if (fileStore[fileStoreID].isDirty !== true) {
                    // already cached, return instantly
                    // callback (if null, it's only obviating)
                    return resolve(fileStore[fileStoreID])
                } else {
                    // process has already begun, wait until it has finished...
                    this.emitter.once(fontItem.id + "-filesFetched-" + fontItem.storeID, function (fileStoreItem) {
                        // debug("Download: fulfilling pending download request...")
                        // callback (if null, it's only obviating)
                        return resolve(fileStoreItem)
                    })
                }
                // return here - attached to emitter or callbacked!
                return
            }

            fileStore[fileStoreID] = {}
            fileStore[fileStoreID].isDirty = true

            // trigger downloading of font files...
            const localPaths = await downloader(fontItem)
                .catch(reject)

            fileStore[fileStoreID].files = localPaths
            fileStore[fileStoreID].zippedFilename = fontItem.id + "-" + fontItem.version + "-" + fontItem.storeID + '.zip'

            // fileStore for item is ready, no longer dirty
            // remove dirty flag from store...
            delete fileStore[fileStoreID].isDirty

            // fullfill the original request
            // debug("Download: fulfill original request...")
            resolve(fileStore[fileStoreID])

            // fullfill still pending requests awaiting process completion
            this.emitter.emit(fontItem.id + "-filesFetched-" + fontItem.storeID, fileStore[fileStoreID])
        })
    }

    getFilterObject(font, subsetsArr) {
        var filterObj = {}

        if (_.isArray(subsetsArr) === false || subsetsArr.length === 0) {
            _.each(font.subsets, function (subsetItem) {
                // supply filter with the default subset as defined in googleFontsAPI fetcher (latin or if no found other)
                filterObj[subsetItem] = (subsetItem === font.defSubset) ? true : false
            })
        } else {
            _.each(font.subsets, function (subsetItem) {
                filterObj[subsetItem] = _.includes(subsetsArr, subsetItem)
            })
        }

        // debug(filterObj)
        return filterObj
    }

    getUrlStoreKey(font, subsetsArr) {
        const { subsetStore } = this
        var fontSubsetStore = subsetStore[font.id]
        var fontSubsetKey

        // debug(fontSubsetStore)

        if (_.isUndefined(fontSubsetStore) === false) {
            fontSubsetKey = _.findKey(fontSubsetStore, {
                subsetMap: this.getFilterObject(font, subsetsArr)
            })
            // debug(fontSubsetKey)
            if (_.isUndefined(fontSubsetKey) === false) {
                return fontSubsetKey
            } else {
                return handleError("fontSubsetKey for " + font.id + " subset " + subsetsArr + " not found!")
            }
        } else {
            return handleError("fontSubsetStore for " + font.id + " not found!")
        }
    }
}

module.exports = GoogleFont
