import React, { FunctionComponent } from 'react';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import ModelsView from './ModelsView';
import ModelView from './ModelView';
import ModelSurfaceView from './ModelSurfaceView'
import ModelVectorField3DView from './ModelVectorField3DView';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

const WorkspaceView: FunctionComponent<WorkspaceViewProps> = ({ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  if (workspaceRoute.page === 'model') {
    return (
      <ModelView
        {...{modelId: workspaceRoute.modelId, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else if (workspaceRoute.page === 'modelSurface') {
    return (
      <ModelSurfaceView
        {...{modelId: workspaceRoute.modelId, surfaceName: workspaceRoute.surfaceName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else if (workspaceRoute.page === 'modelVectorField3D') {
    return (
      <ModelVectorField3DView
        {...{modelId: workspaceRoute.modelId, vectorField3DName: workspaceRoute.vectorField3DName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else {
    return (
      <ModelsView
        {...{workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
}

export default WorkspaceView

// jinjaroot synctool exclude