module.exports = async (db, collectionName) => {
    let collection

    try {
        collection = db.collection(collectionName, { strict: true })
    }
    catch (e) {
        // Create the collection
        collection = await db
            .createCollection(collectionName)
            .catch(handleError)
    }

    return collection
}
