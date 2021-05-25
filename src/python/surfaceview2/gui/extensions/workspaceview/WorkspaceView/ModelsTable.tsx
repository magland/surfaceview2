import { Button } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import Hyperlink from '../../../commonComponents/Hyperlink/Hyperlink';
import NiceTable from '../../../commonComponents/NiceTable/NiceTable';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import './WorkspaceView.css';

interface Props {
    models: WorkspaceModel[]
    onDeleteModels?: (modelIds: string[]) => void
    onModelSelected?: (modelId: string) => void
}
const ModelsTable: FunctionComponent<Props> = ({ models, onDeleteModels, onModelSelected }) => {
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Model'
        }
    ]), [])

    const rows = useMemo(() => (models.map(x => {
        return {
            key: x.modelId,
            columnValues: {
                label: {
                    text: x.label,
                    element: <Hyperlink onClick={onModelSelected ? (() => {onModelSelected(x.modelId)}) : undefined}>{x.label}</Hyperlink>
                }
            }
        }
    })), [models, onModelSelected])

    const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])

    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const confirmOn = useCallback(() => {setConfirmingDelete(true)}, [])
    const confirmOff = useCallback(() => {setConfirmingDelete(false)}, [])
    useEffect(() => {confirmOff()}, [selectedModelIds, confirmOff])
    const handleDeleteSelectedModels = useCallback(() => {
        onDeleteModels && onDeleteModels(selectedModelIds)
        confirmOff()
    }, [onDeleteModels, selectedModelIds, confirmOff])

    return (
        <div>
            {
                selectedModelIds.length > 0 && (
                    confirmingDelete ? (
                        <span>Confirm delete {selectedModelIds.length} models? <button onClick={handleDeleteSelectedModels}>Delete</button> <button onClick={confirmOff}>Cancel</button></span>
                    ) : (
                        <Button onClick={confirmOn}>Delete selected models</Button>
                    )
                )
            }
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this model"}
                // onDeleteRow={onDeleteModels ? handleDeleteRow : undefined}
                selectedRowKeys={selectedModelIds}
                onSelectedRowKeysChanged={setSelectedModelIds}
                selectionMode={onDeleteModels ? "multiple" : "none"}
            />
        </div>
    );



    // const columns = useMemo(() => ([
    //     {
    //         key: 'label',
    //         label: 'Model'
    //     }
    // ]), [])

    // const rows = useMemo(() => (models.map(x => {
    //     return {
    //         key: x.modelId,
    //         columnValues: {
    //             label: {
    //                 text: x.label,
    //                 element: <Hyperlink onClick={onModelSelected ? (() => {onModelSelected(x.modelId)}) : undefined}>{x.label}</Hyperlink>
    //             }
    //         }
    //     }
    // })), [models, onModelSelected])

    // const handleDeleteRow = useCallback((modelId: string) => {
    //     onDeleteModels && onDeleteModels([modelId])
    // }, [onDeleteModels])

    

    // return (
    //     <div>
    //         <NiceTable
    //             rows={rows}
    //             columns={columns}
    //             deleteRowLabel={"Remove this model"}
    //             onDeleteRow={onDeleteModels ? handleDeleteRow : undefined}
    //         />
    //     </div>
    // );
}

export default ModelsTable