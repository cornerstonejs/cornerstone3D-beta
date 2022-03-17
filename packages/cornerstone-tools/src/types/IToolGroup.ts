import { Types } from '@precisionmetrics/cornerstone-render'
import ISetToolModeOptions from './ISetToolModeOptions'

export default interface IToolGroup {
  // Unserializable instantiated tool classes, keyed by name
  _toolInstances: Record<string, any>
  uid: string
  viewportsInfo: Array<Types.IViewportUID>
  toolOptions: Record<string, any>
  //
  getViewportUIDs: () => Array<Types.IViewportUID>
  getToolInstance: { (toolName: string): any }
  addTool: { (toolName: string, toolConfiguration?: any): void }
  addViewports: {
    (renderingEngineUID: string, viewportUID?: string): void
  }
  removeViewports: {
    (renderingEngineUID: string, viewportUID?: string): void
  }
  // ~ setToolMode
  setToolActive: {
    (toolName: string, toolModeOptions?: ISetToolModeOptions): void
  }

  setToolPassive: {
    (toolName: string): void
  }
  setToolEnabled: {
    (toolName: string): void
  }
  setToolDisabled: {
    (toolName: string): void
  }
  getToolModeOptions: {
    (toolName: string): ISetToolModeOptions
  }
  isPrimaryButtonBinding: {
    (toolModeOptions: ISetToolModeOptions): boolean
  }
  refreshViewports: {
    (): void
  }
  getActivePrimaryButtonTools: {
    (): undefined | string
  }
  setViewportsCursorByToolName: {
    (toolName: string, strategyName?: string): void
  }
}
