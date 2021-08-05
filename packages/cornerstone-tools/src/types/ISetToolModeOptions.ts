import ToolBindings from '../enums/ToolBindings'

type ToolBindingMouseType =
  typeof ToolBindings.Mouse[keyof typeof ToolBindings.Mouse]
type ToolBindingKeyboardType =
  typeof ToolBindings.Keyboard[keyof typeof ToolBindings.Keyboard]

type IToolBinding = {
  mouseButton: ToolBindingMouseType
  modifierKey?: ToolBindingKeyboardType
}

export default interface ISetToolModeOptions {
  bindings: IToolBinding[]
}

export { IToolBinding }
