import { useTask } from "../../../labbox"

type SurfaceInfo = {
    uri: string
    numVertices: number
    numFaces: number
}

export type ModelInfo = {
    surfaces: {[key: string]: SurfaceInfo}
}

const useModelInfo = (modelUri: string | undefined) => {
    console.log('---', modelUri)
    const {returnValue: modelInfo, task} = useTask<ModelInfo>(modelUri ? 'get_model_info.4' : '', {model_uri: modelUri})
    return {modelInfo, task}
}

export default useModelInfo