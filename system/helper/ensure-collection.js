module.exports = async (connection, databaseName, collectionName) => {
    const db = connection.db(databaseName)
    return db.collection(collectionName)
    // return new Promise((resolve, reject) => {
    //     // return db
    //     //     .collection(collectionName, { strict: true }, (error, collection) => {
    //     //         if (!error) { return resolve(collection) }
    //     //         return resolve(collection)
    //     //         // return db.createCollection(collectionName)
    //     //     })
    // })
}
