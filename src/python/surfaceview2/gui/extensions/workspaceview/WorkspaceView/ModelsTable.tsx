import React, { FunctionComponent, useCallback, useMemo } from 'react';
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

    const handleDeleteRow = useCallback((modelId: string) => {
        onDeleteModels && onDeleteModels([modelId])
    }, [onDeleteModels])

    

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this model"}
                onDeleteRow={onDeleteModels ? handleDeleteRow : undefined}
            />
        </div>
    );
}

export default ModelsTable