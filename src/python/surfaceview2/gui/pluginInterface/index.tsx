import { FunctionComponent, useMemo } from "react";
import { BasePlugin, CalculationPool, ExtensionContext, usePlugins } from "../labbox";
import { WorkspaceDispatch, WorkspaceState } from "./workspaceReducer";
import { WorkspaceRoute, WorkspaceRouteDispatch } from './WorkspaceRoute';
import { WorkspaceViewPlugin } from "./WorkspaceViewPlugin";

export type { WorkspaceRoute, WorkspaceRouteDispatch } from './WorkspaceRoute';


export type MainWindowProps = {
    workspace: WorkspaceState
    workspaceDispatch: WorkspaceDispatch
    workspaceRoute: WorkspaceRoute
    workspaceRouteDispatch: WorkspaceRouteDispatch
    version: string
    width?: number
    height?: number
}
export interface MainWindowPlugin extends BaseLabboxPlugin {
    type: 'MainWindow'
    component: FunctionComponent<MainWindowProps>
}

export interface BaseLabboxPlugin extends BasePlugin {
    priority?: number
    disabled?: boolean
    development?: boolean
}

export interface LabboxViewPlugin extends BaseLabboxPlugin {
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
    singleton?: boolean
}

export interface LabboxViewProps {
    plugins: LabboxPlugin
    calculationPool?: CalculationPool
    width?: number
    height?: number
}

export const filterPlugins = (plugins: LabboxPlugin[]) => {
    return plugins.filter(p => ((!p.disabled) && (!p.development)))
}

export type LabboxPlugin = MainWindowPlugin | WorkspaceViewPlugin

export type LabboxExtensionContext = ExtensionContext<LabboxPlugin>

export const useWorkspaceViewPlugins = (): WorkspaceViewPlugin[] => {
    const plugins = usePlugins<LabboxPlugin>()
    return useMemo(() => (
        plugins.filter(p => (p.type === 'WorkspaceView')).map(p => (p as any as WorkspaceViewPlugin))
    ), [plugins])
}