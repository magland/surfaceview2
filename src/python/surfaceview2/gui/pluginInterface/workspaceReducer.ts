export type WorkspaceModel = {
    modelId: string
    label: string
    uri: string
}

export type WorkspaceState = {
    models: WorkspaceModel[]
}

export type WorkspaceAction = {
    type: 'addModel'
    modelId: string
    label: string
    uri: string
}

const workspaceReducer = (s: WorkspaceState, a: WorkspaceAction): WorkspaceState => {
    if (a.type === 'addModel') {
        if (s.models.filter(x => (x.modelId === a.modelId))[0]) return s
        return {
            ...s,
            models: [...s.models, {modelId: a.modelId, uri: a.uri, label: a.label}]
        }
    }
    return s
}

export const initialWorkspaceState: WorkspaceState = {models: []}

export type WorkspaceDispatch = (a: WorkspaceAction) => void

export default workspaceReducer

// jinjaroot synctool exclude