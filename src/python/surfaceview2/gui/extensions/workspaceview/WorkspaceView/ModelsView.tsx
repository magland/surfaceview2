import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import Splitter from '../../../commonComponents/Splitter/Splitter';
import { useVisible } from '../../../labbox';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import AddModelInstructions from './AddModelInstructions';
import ModelsTable from './ModelsTable';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

const ModelsView: FunctionComponent<WorkspaceViewProps> = ({ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const handleModelSelected = useCallback((modelId: string) => {
      workspaceRouteDispatch({
        type: 'gotoModelPage',
        modelId
      })
  }, [workspaceRouteDispatch])
  const {visible: instructionsVisible, show: showInstructions} = useVisible()
  return (
    <Splitter
            {...{width, height}}
            initialPosition={300}
            positionFromRight={true}
    >
      <div>
          {
              !instructionsVisible && (
                  <div><Button onClick={showInstructions}>Add model</Button></div>
              )
          }
          <ModelsTable
            models={workspace.models}
            onModelSelected={handleModelSelected}
          />
      </div>
      {
          instructionsVisible && (
              <AddModelInstructions />
          )
      }
      
    </Splitter>
  )
}

export default ModelsView