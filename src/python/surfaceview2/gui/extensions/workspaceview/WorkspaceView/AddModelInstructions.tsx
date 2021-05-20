import React from 'react'
import { FunctionComponent } from "react"
import useRoute from '../../../route/useRoute'
import Markdown from '../../../commonComponents/Markdown/Markdown'
import addModelMd from './addModel.md.gen'

type Props = {
}

const AddModelInstructions: FunctionComponent<Props> = () => {
    const {workspaceUri} = useRoute()
    return (
        <Markdown
            source={addModelMd}
            substitute={{
                workspaceUri
            }}
        />
    )
}

export default AddModelInstructions