import React, { useEffect, useMemo, useState } from 'react'
import { FunctionComponent } from "react"
import { FetchCache } from '../../../../common/useFetchCache'
import BrightnessSlider from './BrightnessSlider'
import { identityAffineTransformation3D, SampledSlice } from './mainLayer'
import SampledSliceView from './SampledSliceView'
import SliceSlider from './SliceSlider'

export type SliceDataQuery = {
    type: 'getSliceData'
    sliceIndex: number
}

type Props = {
    nx: number
    ny: number
    numSlices: number
    width: number
    height: number
    sliceData: FetchCache<SliceDataQuery>
    valueRange: {min: number, max: number}
}

const SlicesView: FunctionComponent<Props> = ({nx, ny, numSlices, width, height, sliceData, valueRange}) => {
    const [currentSliceIndex, setCurrentSliceIndex] = useState<number | undefined>(undefined)

    const [brightness, setBrightness] = useState<number>(50)

    const defaultSliceIndex = numSlices ? Math.floor(numSlices / 2) : 0

    const valueRangeAdjusted = useMemo(() => {
        const factor = Math.exp((brightness - 50) / 50 * 4) * 30
        return {
            min: valueRange.min / factor,
            max: valueRange.max / factor
        }
    }, [valueRange, brightness])


    const d: number[][] | undefined = sliceData.get({
        type: 'getSliceData',
        sliceIndex: currentSliceIndex ?? defaultSliceIndex
    })
    const currentSliceData: SampledSlice | undefined = d ? {
        data: d,
        slice: {
            nx,
            ny,
            transformation: identityAffineTransformation3D
        } 
    } : undefined
    useEffect(() => {
        setCurrentSliceIndex(undefined)
    }, [numSlices])

    return (
        <div style={{margin: 30}}>
            <SampledSliceView
                width={width}
                height={300}
                sampledSlice={currentSliceData}
                valueRange={valueRangeAdjusted}
            />
            <SliceSlider
                width={width}
                numSlices={numSlices}
                currentSlice={currentSliceIndex ?? defaultSliceIndex}
                onCurrentSliceChanged={setCurrentSliceIndex}
            />
            <BrightnessSlider
                width={width}
                brightness={brightness}
                onBrightnessChanged={setBrightness}
            />
            <div>
                <pre>
                    {numSlices} slices ({nx} x {ny})<br />
                    Current slice index: {currentSliceIndex || defaultSliceIndex}<br />
                </pre>
            </div>
        </div>
    )
}

export default SlicesView