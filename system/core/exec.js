import path from "path"

import { expose } from "threads/worker"
import { toPath, join, last } from 'lodash-es'

export default async (fnPath, ...args) => {
    const objPaths = toPath(fnPath)
    const fnExposePath = `./${join(objPaths, path.separator)}/model`

    expose(require(fnExposePath))

    const target = await spawn(new Worker(fnExposePath))
    const result = await target[last(objPaths)].apply(target, args).catch(handleError)
    await Thread.terminate(target)

    return result
}
