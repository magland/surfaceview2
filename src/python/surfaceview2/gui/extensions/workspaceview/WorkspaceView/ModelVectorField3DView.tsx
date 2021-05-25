import React, { FunctionComponent, useMemo } from 'react';
import { TaskStatusView, useTask } from '../../../labbox';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import { identityAffineTransformation3D, SampledSlice } from './SlicedVolumeView1/mainLayer';
import SampledSlicesView from './SlicedVolumeView1/SampledSlicesView';
import useModelInfo from './useModelInfo';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

export type VectorField3DData = {
  xgrid: number[]
  ygrid: number[]
  zgrid: number[]
  values: number[][][][][] // real/imag x component x nx x ny x nz
}


const ModelVectorField3DView: FunctionComponent<WorkspaceViewProps & {modelId: string, vectorField3DName: string}> = ({ modelId, vectorField3DName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const {modelInfo, task: modelInfoTask} = useModelInfo(model?.uri)
  const uri = modelInfo?.vectorfield3ds[vectorField3DName].uri
  const {returnValue: vectorField3DData, task: dataTask} = useTask<VectorField3DData>(uri ? 'get_vector_field_3d_data.3' : '', {vector_field_3d_uri: uri})
  const realImagIndex = 0 // 0 for real, 1 for imag, 2 for abs
  const sampledSlices = useMemo(() => (vectorField3DData ? vectorField3DData.zgrid.map((z, iz) => {
    const values = vectorField3DData.values
    const dim = values[0].length
    const nx = values[0][0].length
    const ny = values[0][0][0].length
    // const nz = values[0][0][0].length
    const sliceData: (number[][])[] = []
    for (let i_d = 0; i_d < dim; i_d ++) {
      const B: number[][] = []
      for (let ix = 0; ix < nx; ix ++) {
        const A: number[] = []
        for (let iy = 0; iy < ny; iy ++) {
          A.push(values[realImagIndex][i_d][ix][iy][iz])
        }
        B.push(A)
      }
      sliceData.push(B)
    }
    const s: SampledSlice = {
      slice: {
        transformation: identityAffineTransformation3D,
        nx,
        ny
      },
      components: [...Array(dim).keys()].map((d, i_d) => (i_d + '')),
      data: sliceData
    }
    return s
  }) : undefined), [vectorField3DData])
  if (!model) return <span>Model not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={modelInfoTask} label="get model info" />
  }
  if ((!vectorField3DData) || (!sampledSlices)) {
    return <TaskStatusView task={dataTask} label="get vector field 3d data" />
  }
  console.log('--- vector field 3d data', vectorField3DData)
  console.log('---- sampled slices', sampledSlices)
  return (
    <div>
      <h3>Vector field: {model.label} ({model.modelId}) {vectorField3DName}</h3>
      <SampledSlicesView
        sampledSlices={sampledSlices}
      />
    </div>
  )
}

export default ModelVectorField3DView