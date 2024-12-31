const cssFetcher = require('./css-fetcher')

const conf = require('./conf')
// const debug = require('debug')('gwfh:urlFetcher')

async function fetchUrls(font, storeID) {
    let tmpUrlStoreObject = {
        variants: [],
        storeID: storeID
    }

    let cssSubsetString = _.clone(storeID).replace(/_/g, ",") // make the variant string google API compatible...
    // debug(cssSubsetString)

    await Promise
        .each(font.variants, async function (variant) {
            let variantItem = {
                id: variant,
            }

            await Promise
                .each(_.toPairs(conf.USER_AGENTS), async function (typeAgentPair) {
                    const resources = await cssFetcher(font.family + ":" + variant, cssSubsetString, typeAgentPair[0], typeAgentPair[1])
                        .catch(handleError)

                    // save the type (woff, eot, svg, ttf, usw...)
                    var type = typeAgentPair[0]
                    // debug(resources)

                    if (resources.length === 0) {
                        // console.error("no url for type available", type, variantItem)
                        return
                    }

                    var url = resources[0]._extracted.url

                    // safe the url directly
                    // rewrite url to use https instead on http!
                    url = url.replace(/^http:\/\//i, 'https://')
                    variantItem[type] = url

                    // if not defined, also save procedded font-family, fontstyle, font-weight, unicode-range
                    if (_.isUndefined(variantItem.fontFamily) && _.isUndefined(resources[0]["font-family"]) === false) {
                        variantItem.fontFamily = resources[0]["font-family"]
                    }

                    if (_.isUndefined(variantItem.fontStyle) && _.isUndefined(resources[0]["font-style"]) === false) {
                        variantItem.fontStyle = resources[0]["font-style"]
                    }

                    if (_.isUndefined(variantItem.fontWeight) && _.isUndefined(resources[0]["font-weight"]) === false) {
                        variantItem.fontWeight = resources[0]["font-weight"]
                    }

                    if (_.isUndefined(variantItem.local) && _.isUndefined(resources[0].localName) === false) {
                        variantItem.local = resources[0].localName
                    }

                    // successfully added type of variant, callback...
                    return
                })
                .catch(handleError)

            tmpUrlStoreObject.variants.push(variantItem)
            return
        })
        .catch(handleError)

    return tmpUrlStoreObject
}

module.exports = fetchUrls
