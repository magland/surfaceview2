import React from 'react'
import { FunctionComponent } from "react"
import Markdown from '../commonComponents/Markdown/Markdown'
import { useBackendProviderClient } from '../labbox'
import addWorkspaceMd from './addWorkspace.md.gen'

type Props = {
    
}

const AddWorkspaceInstructions: FunctionComponent<Props> = () => {
    const backendUri = useBackendProviderClient()?.backendUri
    return (
        <Markdown
            source={addWorkspaceMd}
            substitute={{
                backendUri
            }}
        />
    )
}

export default AddWorkspaceInstructions