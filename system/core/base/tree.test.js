// sqlite_web --port=8118 --host=192.168.56.150 /home/web/repos/../system/classes/core/tree-test.db

const Tree = require('./tree')
const samples = require('./tree/samples.json')

global._ = require('lodash')
global.t = console.log

module.exports = (async () => {
    const tree = new Tree('620244981c66ab7fbaac9122')
    tree.initialize()

    tree.import(samples)

    // tree.create("620244981c66ab7fbaac912a")
    // tree.delete("620244981c66ab7fbaac912a")
    // tree.moveTo("620244981c66ab7fbaac912e", "620244981c66ab7fbaac9126", "620244981c66ab7fbaac9146")
    // console.log(JSON.stringify(tree.toAdjacencyList()))
    // tree.moveTo("620244981c66ab7fbaac912e", "620244981c66ab7fbaac9126", "620244981c66ab7fbaac913a")
    // console.log(tree.toLinearList())

    // console.log(JSON.stringify(tree.getChildren("620244981c66ab7fbaac912a")))
    // console.log(JSON.stringify(tree.getDepth("620244981c66ab7fbaac912a")))
    // console.log(JSON.stringify(tree.getDescendants("620244981c66ab7fbaac912a")))
    // console.log(JSON.stringify(tree.getLevel("620244981c66ab7fbaac912a")))
    // console.log(JSON.stringify(tree.getNodeByParentIndex("620244981c66ab7fbaac912a", 0)))
    // console.log(JSON.stringify(tree.getNode("620244981c66ab7fbaac912a")))
    // console.log(JSON.stringify(tree.getPaths("620244981c66ab7fbaac912a")))
    // console.log(JSON.stringify(tree.getRootNode("620244981c66ab7fbaac912a")))
})()
