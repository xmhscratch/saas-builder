module.exports = async function (db, fileId, buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('buffer is empty')
    }

    let queryString = `
UPDATE files
SET thumbnail128 = :buffer
WHERE files._node_id = :fileId;`

    return db
        .prepare(queryString)
        .run({ fileId, buffer })
}
