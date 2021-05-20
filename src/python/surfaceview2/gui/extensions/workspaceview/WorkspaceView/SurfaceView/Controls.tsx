import { FormControlLabel, Switch } from '@material-ui/core'
import React, { useCallback } from 'react'
import { FunctionComponent } from "react"

export type SurfaceViewOptions = {
    showWireframe: boolean
    showMesh: boolean
}

type Props = {
    options: SurfaceViewOptions
    setOptions: (o: SurfaceViewOptions) => void
}

const Controls: FunctionComponent<Props> = ({options, setOptions}) => {
    const handleShowWireframeChanged = useCallback((e: any, val: boolean) => {
        setOptions({...options, showWireframe: val})
    }, [options, setOptions])
    const handleShowMeshChanged = useCallback((e: any, val: boolean) => {
        setOptions({...options, showMesh: val})
    }, [options, setOptions])
    return (
        <div>
            <FormControlLabel
                key="showWireframe"
                control={
                    <Switch
                        checked={options.showWireframe}
                        onChange={handleShowWireframeChanged}
                        color="primary"
                        disabled={false}
                    />
                }
                label={"Show wire frame"}
            />
            <FormControlLabel
                key="showMesh"
                control={
                    <Switch
                        checked={options.showMesh}
                        onChange={handleShowMeshChanged}
                        color="primary"
                        disabled={false}
                    />
                }
                label={"Show mesh"}
            />
        </div>
    )
}

export default Controls