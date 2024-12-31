// const { v4: uuidV4 } = require('uuid')

module.exports = function (db) {
    let queryString

    queryString = `
CREATE TABLE IF NOT EXISTS files (
    _node_id varchar(36) NOT NULL PRIMARY KEY,
    size bigint(20) NOT NULL,
    content_type varchar(100) NOT NULL,
    extension varchar(26) NOT NULL,
    thumbnail32 blob,
    thumbnail128 blob
);
CREATE TABLE IF NOT EXISTS folders (
    _node_id varchar(36) NOT NULL PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS nodes (
    id varchar(36) NOT NULL PRIMARY KEY,
    title varchar(128) NOT NULL,
    kind smallint(1) NOT NULL DEFAULT 2,
    state smallint(1) NOT NULL DEFAULT 1,
    description varchar(512) DEFAULT NULL,
    created_at datetime NOT NULL,
    modified_at datetime NOT NULL,
    _root varchar(36) DEFAULT NULL,
    _parent varchar(36) DEFAULT NULL,
    _left int(11) NOT NULL DEFAULT 0,
    _right int(11) NOT NULL DEFAULT 0,
    _depth int(11) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS id ON nodes (id);
CREATE INDEX IF NOT EXISTS root ON nodes (_root);
CREATE INDEX IF NOT EXISTS parent ON nodes (_parent);
CREATE INDEX IF NOT EXISTS left ON nodes (_left);
CREATE INDEX IF NOT EXISTS right ON nodes (_right);
`
    db.exec(queryString)

//     let rootId
//     rootId = uuidV4()
//     queryString = `
// INSERT INTO nodes (
//     title, kind, state, description, created_at, modified_at,
//     id, _root, _parent, _left, _right, _depth
// )
// VALUES (
//     'System', 2, 1, '', DATETIME(), DATETIME(),
//     :rootId, :rootId, NULL, 1, 2, 0
// );`
//     db
//         .prepare(queryString)
//         .run({ rootId })
//     queryString = `
// INSERT INTO folders (_node_id)
// VALUES (:rootId);`
//     db
//         .prepare(queryString)
//         .run({ rootId })

//     rootId = uuidV4()
//     queryString = `
// INSERT INTO nodes (
//     title, kind, state, description, created_at, modified_at,
//     id, _root, _parent, _left, _right, _depth
// )
// VALUES (
//     'Picture', 2, 1, '', DATE(), DATE(),
//     :rootId, :rootId, NULL, 1, 2, 0
// );`
//     db
//         .prepare(queryString)
//         .run({ rootId })
//     queryString = `
// INSERT INTO folders (_node_id)
// VALUES (:rootId);`
//     db
//         .prepare(queryString)
//         .run({ rootId })

//     rootId = uuidV4()
//     queryString = `
// INSERT INTO nodes (
//     title, kind, state, description, created_at, modified_at,
//     id, _root, _parent, _left, _right, _depth
// )
// VALUES (
//     'Document', 2, 1, '', DATE(), DATE(),
//     :rootId, :rootId, NULL, 1, 2, 0
// );`
//     db
//         .prepare(queryString)
//         .run({ rootId })
//     queryString = `
// INSERT INTO folders (_node_id)
// VALUES (:rootId);`
//     db
//         .prepare(queryString)
//         .run({ rootId })
}
