import React, { useState } from 'react'
import { FunctionComponent } from "react"
import Splitter from '../../../../commonComponents/Splitter/Splitter';
import Controls, { SurfaceViewOptions } from './Controls';
import SurfaceWidget from './SurfaceWidget';

export type SurfaceData = {
    vertices: [number, number, number][]
    ifaces: number[]
    faces: number[]
}

type Props = {
    surfaceData: SurfaceData
}

const SurfaceView: FunctionComponent<Props> = ({surfaceData}) => {
    const [options, setOptions] = useState<SurfaceViewOptions>({showWireframe: true, showMesh: true})
    return (
        <Splitter
            width={700}
            height={500}
            initialPosition={150}
        >
            <Controls options={options} setOptions={setOptions} />
            <SurfaceWidget surfaceData={surfaceData} width={0} height={0} options={options} />
        </Splitter>
    )
}

export default SurfaceView