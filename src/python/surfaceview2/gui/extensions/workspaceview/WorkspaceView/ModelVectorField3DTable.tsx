import React, { FunctionComponent, useMemo } from 'react'
import Hyperlink from '../../../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../../../commonComponents/NiceTable/NiceTable'
import { ModelInfo } from './useModelInfo'

type Props = {
    modelInfo: ModelInfo
    onVectorField3DClicked?: (name: string) => void
}

const ModelVectorField3DTable: FunctionComponent<Props> = ({modelInfo, onVectorField3DClicked}) => {
    const fieldNames = useMemo(() => {
        const ret = Object.keys(modelInfo.vectorfield3ds).sort()
        ret.sort()
        return ret
    }, [modelInfo.vectorfield3ds])

    const columns = useMemo(() => ([
        {
            key: 'fieldName',
            label: 'Vector field 3D'
        },
        {
            key: 'dimensions',
            label: 'Dimensions'
        }
    ]), [])

    const rows = useMemo(() => (
        fieldNames.map(fieldName => {
            const t = modelInfo.vectorfield3ds[fieldName]
            return {
                key: fieldName,
                columnValues: {
                    fieldName: {
                        text: fieldName,
                        element: <Hyperlink onClick={onVectorField3DClicked && (() => {onVectorField3DClicked(fieldName)})}>{fieldName}</Hyperlink>
                    },
                    dimensions: `${t.dim} x ${t.nx} x ${t.ny} x ${t.nz}`
                }
            }
        })
    ), [fieldNames, onVectorField3DClicked, modelInfo.vectorfield3ds])

    return (
        <NiceTable
            columns={columns}
            rows={rows}
        />
    )
}

export default ModelVectorField3DTable