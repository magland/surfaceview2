import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import { useVisible } from '../../labbox'
import useBackendInfo from '../../labbox/backendProviders/useBackendInfo'
import { pythonProjectVersion } from '../../version'
import useRoute from '../../route/useRoute'
import hyperlinkStyle from './hyperlinkStyle'
import customBackendInstructionsMd from './customBackendInstructions.md.gen'
import MarkdownDialog from '../../commonComponents/Markdown/MarkdownDialog'
import RecentlyUsedBackends from './RecentlyUsedBackends'

type Props = {
    onSelectBackendProvider: () => void
}

const BackendProviderSection: FunctionComponent<Props> = ({onSelectBackendProvider}) => {
    const {backendUri, setRoute} = useRoute()
    const backendInfo = useBackendInfo()
    const backendPythonProjectVersion = backendInfo.backendPythonProjectVersion
    const {visible: customBackendInstructionsVisible, show: showCustomBackendInstructions, hide: hideCustomBackendInstructions} = useVisible()
    const handleSetBackend = useCallback((backendUri: string) => {
        setRoute({backendUri})
    }, [setRoute])
    return (
        <div className="BackendProviderSection HomeSection">
            {
                backendUri ? (
                    <span>
                        <p>The selected backend provider is: {backendUri}</p>
                        {
                            backendPythonProjectVersion && (
                                <span>
                                    {
                                        backendPythonProjectVersion === pythonProjectVersion ? (
                                            <p>Backend Python project version is {backendInfo.backendPythonProjectVersion} (this is the expected version)</p>
                                        ) : (
                                            <p>Backend Python project version is {backendInfo.backendPythonProjectVersion} (expected version is {pythonProjectVersion})</p>
                                        )
                                    }
                                </span>
                            )
                        }
                        <p><Hyperlink style={hyperlinkStyle} onClick={onSelectBackendProvider}>Select a different backend provider</Hyperlink></p>
                        <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Use your own backend provider</Hyperlink></p>
                    </span>
                ) : (
                    <span>
                        <p>Start by selecting a <Hyperlink style={hyperlinkStyle} onClick={onSelectBackendProvider}>backend provider</Hyperlink></p>
                        <RecentlyUsedBackends onSelectBackend={handleSetBackend} />
                        <p><Hyperlink style={hyperlinkStyle} onClick={showCustomBackendInstructions}>Or use your own backend provider</Hyperlink></p>
                    </span>
                )
            }
            <MarkdownDialog
                visible={customBackendInstructionsVisible}
                onClose={hideCustomBackendInstructions}
                source={customBackendInstructionsMd}
            />
        </div>
    )
}

export default BackendProviderSection