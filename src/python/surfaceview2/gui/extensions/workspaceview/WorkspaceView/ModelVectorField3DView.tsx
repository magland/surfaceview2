import React, { FunctionComponent, useMemo, useState } from 'react';
import useFetchCache from '../../../common/useFetchCache';
import { TaskStatusView, useBackendProviderClient } from '../../../labbox';
import BackendProviderClient from '../../../labbox/backendProviders/BackendProviderClient';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import ComponentSelector from './ComponentSelector';
import PlaneSelector from './PlaneSelector';
import RealImagSelector from './RealImagSelector';
import SlicesView, {SliceDataQuery} from './SlicesView/SlicesView';
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
  dim: number
  xgrid: number[]
  ygrid: number[]
  zgrid: number[]
  // values: number[][][][][] // real/imag x component x nx x ny x nz
}

const getSliceData = async (args: {client: BackendProviderClient | undefined, vectorField3DUri: string | undefined, plane: 'XY' | 'XZ' | 'YZ', sliceIndex: number}): Promise<{values: number[][][][]} | undefined> => {
  const { client, vectorField3DUri, plane, sliceIndex } = args
  if (!client) return undefined
  if (!vectorField3DUri) return undefined
  const task = client.initiateTask<{values: number[][][][]}>(
    'get_vector_field_3d_slice_data.3',
    {
      vector_field_3d_uri: vectorField3DUri,
      plane,
      slice_index: sliceIndex
    }
  )
  if (!task) throw Error('Unable to create get_vector_field_3d_slice_data task')
  return new Promise((resolve, reject) => {
    const check = () => {
      if (task.status === 'finished') {
        if (!task.returnValue) {
          reject('No return value')
          return
        }
        resolve(task.returnValue)
      }
      else if (task.status === 'error') {
        reject(task.errorMessage)
      }
    }
    task.onStatusChanged(status => check())
    check()
  })
}


const ModelVectorField3DView: FunctionComponent<WorkspaceViewProps & {modelId: string, vectorField3DName: string}> = ({ modelId, vectorField3DName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const [currentPlane, setCurrentPlane] = useState<'XY' | 'XZ' | 'YZ'>('XY')
  const {modelInfo, task: modelInfoTask} = useModelInfo(model?.uri)
  const vfInfo = modelInfo?.vectorfield3ds[vectorField3DName]
  const uri = vfInfo?.uri
  const client = useBackendProviderClient()

  const [currentComponent, setCurrentComponent] = useState<number | undefined>(0)
  const componentChoices = useMemo(() => (
    vfInfo ? [...Array(vfInfo.dim).keys()] : undefined
  ), [vfInfo])

  const [realImagIndex, setRealImagIndex] = useState<number>(0)

  const fetch = useMemo(() => (async (query: SliceDataQuery) => {
    switch(query.type) {
      case 'getSliceData': {
        const d = await getSliceData({client, vectorField3DUri: uri, plane: currentPlane, sliceIndex: query.sliceIndex})
        if (!d) return undefined
        if (currentComponent === undefined) return
        const nx = d.values[0][0].length
        const ny = d.values[0][0][0].length
        const ret: number[][] = []
        for (let ix = 0; ix < nx; ix++) {
          const A: number[] = []
          if (realImagIndex <= 1) {
            for (let iy = 0; iy < ny; iy++) {
              A.push(d.values[realImagIndex][currentComponent][ix][iy])
            }
          }
          else if (realImagIndex === 2) { // abs
            for (let iy = 0; iy < ny; iy++) {
              const re = d.values[0][currentComponent][ix][iy]
              const im = d.values[1][currentComponent][ix][iy]
              const abs = Math.sqrt(re * re + im * im)
              A.push(abs)
            }
          }
          ret.push(A)
        }
        return ret
      }
    }
    return undefined
  }), [client, uri, currentPlane, currentComponent, realImagIndex])
  const sliceData = useFetchCache<SliceDataQuery>(fetch)

  const {nx, ny, numSlices} = useMemo(() => {
    if (!vfInfo) return {nx: 0, ny: 0, numSlices: 0}
    if (currentPlane === 'XY') return {nx: vfInfo.nx, ny: vfInfo.ny, numSlices: vfInfo.nz}
    else if (currentPlane === 'XZ') return {nx: vfInfo.nx, ny: vfInfo.nz, numSlices: vfInfo.ny}
    else if (currentPlane === 'YZ') return {nx: vfInfo.ny, ny: vfInfo.nz, numSlices: vfInfo.nx}
    else throw Error('Unexpected plane.')
  }, [vfInfo, currentPlane])

  // const realImagIndex = 0 // 0 for real, 1 for imag, 2 for abs
  if (!model) return <span>Model not found.</span>
  if (!vfInfo) return <span>Vector field info not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={modelInfoTask} label="get model info" />
  }
  return (
    <div>
      <h3>Vector field: {model.label} ({model.modelId}) {vectorField3DName}</h3>
      <SlicesView
        numSlices={numSlices}
        nx={nx}
        ny={ny}
        width={300}
        height={300}
        valueRange={vfInfo.valueRange}
        sliceData={sliceData}
      />
      {
        componentChoices && (
          <ComponentSelector
            components={componentChoices}
            currentComponent={currentComponent}
            onCurrentComponentChanged={setCurrentComponent}
          />
        )
      }
      {
        <RealImagSelector
          realImagIndex={realImagIndex}
          onRealImagIndexChanged={setRealImagIndex}
        />
      }
      <PlaneSelector
        plane={currentPlane}
        onPlaneChanged={setCurrentPlane}
      />
    </div>
  )
}

export default ModelVectorField3DView