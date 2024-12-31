const { ObjectId } = require('mongodb')
const Database = require('better-sqlite3')
const hashObject = require('object-hash')

const getRootNode = require('./tree/get-root-node')
const getPaths = require('./tree/get-paths')
const createNode = require('./tree/create')
const getNode = require('./tree/get-node')
const getLevel = require('./tree/get-level')
const getDepth = require('./tree/get-depth')
const getChildren = require('./tree/get-children')
const getDescendants = require('./tree/get-descendants')
const moveTo = require('./tree/move-to')
const deleteNode = require('./tree/delete')
const toAdjacencyList = require('./tree/to-adjacency-list')
const importNodes = require('./tree/import-nodes')
const toLinearList = require('./tree/to-linear-list')
const getPrevNode = require('./tree/get-prev-node')
const getNodeByParentIndex = require('./tree/get-node-parent-index')

module.exports = class Tree {

    static MODIFIER_FUNCTIONS = ['create', 'import', 'moveTo', 'delete']
    static GETTER_FUNCTIONS = [
        'getNode',
        'getRootNode',
        'getPrevNode',
        'getNodeByParentIndex',
        'getPaths',
        'getLevel',
        'getDepth',
        'getChildren',
        'getDescendants',
        'countChilds',
        'toAdjacencyList',
        'toLinearList',
    ]

    db = null
    rootId = null

    _memoizer = {}

    constructor(rootId) {
        this.rootId = rootId
        return this
    }

    initialize() {
        let { rootId } = this
        if (_.isEmpty(rootId)) {
            rootId = ObjectId().toHexString()
            this.rootId = rootId
        }

        const db = new Database(':memory:', {
            // verbose: console.log
        })

        db.exec(`CREATE TABLE IF NOT EXISTS nodes (
            id varchar(24) NOT NULL,
            root varchar(24) NOT NULL,
            parent varchar(24),
            left int(11) NOT NULL,
            right int(11) NOT NULL,
            level int(11) NOT NULL
        );`)
        db.exec(`CREATE INDEX IF NOT EXISTS id ON nodes (id);`)
        db.exec(`CREATE INDEX IF NOT EXISTS root ON nodes (root);`)
        db.exec(`CREATE INDEX IF NOT EXISTS parent ON nodes (parent);`)
        db.exec(`CREATE INDEX IF NOT EXISTS left ON nodes (left);`)
        db.exec(`CREATE INDEX IF NOT EXISTS right ON nodes (right);`)

        db.prepare(`
            INSERT INTO nodes (
                id, root, parent, left, right, level
            ) VALUES (
                $rootId, $rootId, NULL, 1, 2, 0
            );`
        ).run({ rootId })

        this.db = db
        return this
    }

    create = (...args) => this.memoize('create', createNode(this), args)
    import = (...args) => this.memoize('import', importNodes(this), args)
    moveTo = (...args) => this.memoize('moveTo', moveTo(this), args)
    delete = (...args) => this.memoize('delete', deleteNode(this), args)

    getNode = (...args) => this.memoize('getNode', getNode(this), args)
    getRootNode = (...args) => this.memoize('getRootNode', getRootNode(this), args)
    getPrevNode = (...args) => this.memoize('getPrevNode', getPrevNode(this), args)
    getNodeByParentIndex = (...args) => this.memoize('getNodeByParentIndex', getNodeByParentIndex(this), args)
    getPaths = (...args) => this.memoize('getPaths', getPaths(this), args)
    getLevel = (...args) => this.memoize('getLevel', getLevel(this), args)
    getDepth = (...args) => this.memoize('getDepth', getDepth(this), args)
    getChildren = (...args) => this.memoize('getChildren', getChildren(this), args)
    getDescendants = (...args) => this.memoize('getDescendants', getDescendants(this), args)
    toAdjacencyList = (...args) => this.memoize('toAdjacencyList', toAdjacencyList(this), args)
    toLinearList = (...args) => this.memoize('toLinearList', toLinearList(this), args)

    memoize(fnName, origFn, fnArgs) {
        let fnResult

        if (!_.has(this._memoizer, fnName)) {
            this._memoizer[fnName] = _.memoize(origFn, (fnArgs) => !_.isEmpty(fnArgs) ? hashObject(fnArgs) : fnName)
        }

        if ((new RegExp(`^(${_.join(Tree.MODIFIER_FUNCTIONS, '|')})$`, 'g')).test(fnName)) {
            _.forEach(this._memoizer, (v, k) => {
                if (_.has(this._memoizer, k)) {
                    this._memoizer[k].cache.clear()
                }
            })
            fnResult = origFn.apply(this, fnArgs)
        }
        else {
            const memoFn = this._memoizer[fnName]
            fnResult = memoFn.apply(this, fnArgs)
        }

        return fnResult
    }
}
