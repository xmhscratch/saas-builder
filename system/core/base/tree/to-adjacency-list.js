module.exports = (context) => {
    return (withDepth) => {
        // const { db } = context

        const evalNodeChild = (node) => {
            const childNodes = context.getChildren(node.id)

            if (!_.isEmpty(childNodes)) {
                node.children = childNodes
            }

            _.forEach(childNodes, (node) =>
                evalNodeChild(node)
            )

            if (withDepth) {
                node.depth = context.getDepth(node.id)
            }
            return node
        }

        const rootNode = context.getRootNode()
        return evalNodeChild(rootNode)
    }
}
