import React, { FunctionComponent } from 'react';
import CanvasWidget from '../../../../commonComponents/CanvasWidget';
import { useLayer, useLayers } from '../../../../commonComponents/CanvasWidget/CanvasWidgetLayer';
import { createMainLayer, MainLayerProps, SampledSlice } from './mainLayer';

type Props = {
    width: number
    height: number
    sampledSlice: SampledSlice | undefined
    component: string | undefined
    valueRange: {min: number, max: number}
}

const SampledSliceView: FunctionComponent<Props> = ({width, height, sampledSlice, component, valueRange}) => {
    const mainLayerProps: MainLayerProps = {
        width: 300,
        height: 300,
        sampledSlice: sampledSlice,
        valueRange: valueRange,
        component
    }
    const mainLayer = useLayer(createMainLayer, mainLayerProps)
    const layers = useLayers([mainLayer])

    return (
        <CanvasWidget
            layers={layers}
            width={300}
            height={300}
        />
    )
}

export default SampledSliceView