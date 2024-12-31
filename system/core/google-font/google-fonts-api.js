const getSlug = require('speakingurl')

const conf = require('./conf')
// var debug = require('debug')('gwfh:googleFontsAPI')

// build up fonts cache via google API...
async function getFontsToDownload(googleAPIFontItems, cachedFonts) {
    return Promise
        .using(
            $helper.ensureCollection($mongo, 'google_fonts', `items`),
            async (fontItemCollection) => {
                fontItemCollection.createIndex({ id: 1 })

                const cachedSize = await fontItemCollection
                    .countDocuments()
                    .catch(handleError)

                if (cachedSize) {
                    // populate our items
                    cachedFonts = await fontItemCollection
                        .find()
                        .toArray()
                        .catch(handleError)

                    return cachedFonts
                }

                // googleAPIFontItems
                googleAPIFontItems = await new Promise((resolve, reject) => {
                    const req = $.https.request({
                        hostname: "www.googleapis.com",
                        method: 'GET',
                        port: 443,
                        path: '/webfonts/v1/webfonts?sort=popularity&key=' + conf.GOOGLE_FONTS_API_KEY,
                        headers: { 'Accept': 'application/json' },
                    }, function (res) {
                        let output = ''

                        res.setEncoding('utf8')

                        res.on('data', function (chunk) {
                            output += chunk
                        })

                        res.on('end', function () {
                            return resolve(JSON.parse(output).items)
                        })
                    })

                    req.on('error', function (e) {
                        console.error('problem with request: ' + e.message)
                        return reject(e)
                    })

                    return req.end()
                })

                // populate our items
                await Promise
                    .mapSeries(googleAPIFontItems, function (item, index) {
                        // debug(index + " - " + item.family)

                        const fontItem = {
                            id: getSlug(item.family),
                            family: item.family,
                            variants: item.variants,
                            subsets: item.subsets,
                            category: item.category,
                            version: item.version,
                            lastModified: item.lastModified,
                            popularity: index + 1,
                            // use latin per default, else first found font
                            defSubset: _.includes(item.subsets, 'latin') ? 'latin' : item.subsets[0],
                            defVariant: _.includes(item.variants, 'regular') ? 'regular' : item.variants[0]
                        }

                        // property order is guranteed --> popularity via index attr.
                        cachedFonts.push(fontItem)

                        return fontItemCollection.findOneAndUpdate(
                            { id: { $eq: fontItem.id, $exists: true } },
                            { $set: fontItem },
                            { upsert: true, returnDocument: false, },
                        )
                    })
                    .catch(handleError)

                return cachedFonts
            }
        )
        .catch(handleError)
}

module.exports = getFontsToDownload
