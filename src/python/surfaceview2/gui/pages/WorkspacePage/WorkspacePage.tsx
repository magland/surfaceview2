import React, { FunctionComponent, useMemo } from 'react'
import WorkspaceView from '../../extensions/workspaceview/WorkspaceView'
import { parseWorkspaceUri, useBackendProviderClient } from '../../labbox'
import useCurrentUserPermissions from '../../labbox/backendProviders/useCurrentUserPermissions'
import { sha1OfString, SubfeedHash } from '../../labbox/kacheryTypes'
import useSubfeedReducer from '../../labbox/misc/useSubfeedReducer'
import workspaceReducer, { initialWorkspaceState } from '../../pluginInterface/workspaceReducer'
import useRoute from '../../route/useRoute'
import useWorkspaceRoute from './useWorkspaceRoute'

type Props = {
    width: number
    height: number
}

const useWorkspace = (workspaceUri: string) => {
    const client = useBackendProviderClient()
    if (!client) throw Error('Unexpected: no backend provider client')
    const {feedId} = parseWorkspaceUri(workspaceUri)
    if (!feedId) throw Error(`Error parsing workspace URI: ${workspaceUri}`)

    const subfeedHash = sha1OfString('main') as any as SubfeedHash
    const [workspace, workspaceDispatch] = useSubfeedReducer(feedId, subfeedHash, workspaceReducer, initialWorkspaceState, {actionField: true})

    return {workspace, workspaceDispatch}
}

const WorkspacePage: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceUri} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    const {workspaceRoute, workspaceRouteDispatch} = useWorkspaceRoute()

    const {feedId} = parseWorkspaceUri(workspaceUri)
    const {workspace, workspaceDispatch} = useWorkspace(workspaceUri)

    const currentUserPermissions = useCurrentUserPermissions()

    const readOnly = useMemo(() => {
        if (!currentUserPermissions) return true
        if (currentUserPermissions.appendToAllFeeds) return false
        if (((currentUserPermissions.feeds || {})[feedId?.toString() || ''] || {}).append) return false
        return true
    }, [currentUserPermissions, feedId])
    const workspaceDispatch2 = readOnly ? undefined : workspaceDispatch

    return (
        <WorkspaceView
            workspace={workspace}
            workspaceDispatch={workspaceDispatch2}
            workspaceRoute={workspaceRoute}
            workspaceRouteDispatch={workspaceRouteDispatch}
            width={width}
            height={height}
        />
    )
}

export default WorkspacePage