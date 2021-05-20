import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { TaskStatusView } from '../../../labbox';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import ModelSurfaceTable from './ModelSurfaceTable';
import useModelInfo from './useModelInfo';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}



const ModelView: FunctionComponent<WorkspaceViewProps & {modelId: string}> = ({ modelId, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const {modelInfo, task} = useModelInfo(model?.uri)
  const handleSurfaceClicked = useCallback((surfaceName: string) => {
    workspaceRouteDispatch({type: 'gotoModelSurfacePage', modelId, surfaceName})
  }, [workspaceRouteDispatch, modelId])
  if (!model) return <span>Model not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={task} label="get model info" />
  }
  return (
    <div>
      <h3>Model: {model.label} ({model.modelId})</h3>
      <ModelSurfaceTable
        modelInfo={modelInfo}
        onSurfaceClicked={handleSurfaceClicked}
      />
    </div>
  )
}

export default ModelView