import { useCallback, useMemo } from "react"
import { WorkspaceRoute } from "../../pluginInterface"
import { WorkspaceRouteAction } from "../../pluginInterface/WorkspaceRoute"
import useRoute from "../../route/useRoute"

const useWorkspaceRoute = () => {
    const {workspaceUri, routePath, setRoute} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')

    const workspaceRoute = useMemo((): WorkspaceRoute => {
        const p = routePath.split('/')
        if (routePath.startsWith('/workspace/model/')) {
            const modelId = p[3]
            if (p[4] === 'surface') {
                const surfaceName = p[5]
                return {
                    page: 'modelSurface',
                    modelId,
                    surfaceName,
                    workspaceUri
                }
            }
            else {
                return {
                    page: 'model',
                    modelId,
                    workspaceUri
                }
            }
        }
        else {
            return {
                page: 'main',
                workspaceUri
            }
        }
    }, [workspaceUri, routePath])
    const workspaceRouteDispatch = useCallback((action: WorkspaceRouteAction) => {
        if (action.type === 'gotoMainPage') {
            setRoute({routePath: '/workspace'})
        }
        else if (action.type === 'gotoModelPage') {
            setRoute({routePath: `/workspace/model/${action.modelId}`})
        }
        else if (action.type === 'gotoModelSurfacePage') {
            setRoute({routePath: `/workspace/model/${action.modelId}/surface/${action.surfaceName}`})
        }
    }, [setRoute])

    return {workspaceRoute, workspaceRouteDispatch}
}

export default useWorkspaceRoute

// jinjaroot synctool exclude