import QueryString from 'querystring'

type Page = 'main' | 'model' | 'modelSurface' | 'modelVectorField3D'
export const isWorkspacePage = (x: string): x is Page => {
    return ['main', 'model', 'modelSurface', 'modelVectorField3D'].includes(x)
}

type WorkspaceMainRoute = {
    workspaceUri?: string
    page: 'main'
}
type WorkspaceModelRoute = {
    workspaceUri?: string
    page: 'model'
    modelId: string
}
type WorkspaceModelSurfaceRoute = {
    workspaceUri?: string
    page: 'modelSurface'
    modelId: string
    surfaceName: string
}
type WorkspaceModelVectorField3DRoute = {
    workspaceUri?: string
    page: 'modelVectorField3D'
    modelId: string
    vectorField3DName: string
}
export type WorkspaceRoute = WorkspaceMainRoute | WorkspaceModelRoute | WorkspaceModelSurfaceRoute | WorkspaceModelVectorField3DRoute
type GotoMainPageAction = {
    type: 'gotoMainPage'
}
type GotoModelPageAction = {
    type: 'gotoModelPage'
    modelId: string
}
type GotoModelSurfacePageAction = {
    type: 'gotoModelSurfacePage'
    modelId: string
    surfaceName: string
}
type GotoModelVectorField3DPageAction = {
    type: 'gotoModelVectorField3DPage'
    modelId: string
    vectorField3DName: string
}
export type WorkspaceRouteAction = GotoMainPageAction | GotoModelPageAction | GotoModelSurfacePageAction | GotoModelVectorField3DPageAction
export type WorkspaceRouteDispatch = (a: WorkspaceRouteAction) => void

export interface LocationInterface {
    pathname: string
    search: string
}

export interface HistoryInterface {
    location: LocationInterface
    push: (x: LocationInterface) => void
}

export const routeFromLocation = (location: LocationInterface): WorkspaceRoute => {
    const pathList = location.pathname.split('/')

    const query = QueryString.parse(location.search.slice(1));
    const workspace = (query.workspace as string) || 'default'
    const workspaceUri = workspace.startsWith('workspace://') ? workspace : undefined

    const page = pathList[1] || 'main'
    if (!isWorkspacePage(page)) throw Error(`Invalid page: ${page}`)
    switch (page) {
        case 'main': return {
            workspaceUri,
            page
        }
        case 'model': {
            const modelId = pathList[2]
            if (pathList[3] === 'surface') {
                return {
                    workspaceUri,
                    page: 'modelSurface',
                    modelId,
                    surfaceName: pathList[4]
                }
            }
            else if (pathList[3] === 'vectorField3D') {
                return {
                    workspaceUri,
                    page: 'modelVectorField3D',
                    modelId,
                    vectorField3DName: pathList[4]
                }
            }
            else {
                return {
                    workspaceUri,
                    page: 'model',
                    modelId
                }
            }
        }
        default: return {
            workspaceUri,
            page: 'main'
        }
    }
}

export const locationFromRoute = (route: WorkspaceRoute) => {
    const queryParams: { [key: string]: string } = {}
    if (route.workspaceUri) {
        queryParams['workspace'] = route.workspaceUri
    }
    switch (route.page) {
        case 'model': return {
            pathname: `/model/${route.modelId}`,
            search: queryString(queryParams)
        }
        case 'modelSurface': return {
            pathname: `/model/${route.modelId}/surface/${route.surfaceName}`,
            search: queryString(queryParams)
        }
        case 'modelVectorField3D': return {
            pathname: `/model/${route.modelId}/vectorField3D/${route.vectorField3DName}`,
            search: queryString(queryParams)
        }
        default: return {
            pathname: `/`,
            search: queryString(queryParams)
        }
    }
}

var queryString = (params: { [key: string]: string }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&')
    )
}

export const workspaceRouteReducer = (s: WorkspaceRoute, a: WorkspaceRouteAction): WorkspaceRoute => {
    let newRoute: WorkspaceRoute = s
    switch (a.type) {
        case 'gotoMainPage': newRoute = {
            page: 'main',
            workspaceUri: s.workspaceUri
        }; break;
        case 'gotoModelPage': newRoute = {
            page: 'model',
            modelId: a.modelId,
            workspaceUri: s.workspaceUri
        }; break;
        case 'gotoModelSurfacePage': newRoute = {
            page: 'modelSurface',
            modelId: a.modelId,
            surfaceName: a.surfaceName,
            workspaceUri: s.workspaceUri
        }; break;
        case 'gotoModelVectorField3DPage': newRoute = {
            page: 'modelVectorField3D',
            modelId: a.modelId,
            vectorField3DName: a.vectorField3DName,
            workspaceUri: s.workspaceUri
        }; break;
    }
    return newRoute
}

// jinjaroot synctool exclude