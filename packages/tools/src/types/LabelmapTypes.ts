import type { vtkColorTransferFunction } from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction'
import type { vtkPiecewiseFunction } from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction'

/**
 * Label map config for the label map representation
 */
export type labelmapConfig = {
  /** whether to render segmentation outline  */
  renderOutline?: boolean
  /** thickness of the outline when segmentation is active */
  outlineWidthActive?: number
  /** thickness of the outline when segmentation is inactive */
  outlineWidthInactive?: number
  /** whether to render segmentation filling */
  renderFill?: boolean
  /** alpha of the fill */
  fillAlpha?: number
  /** alpha of the fill when inactive */
  fillAlphaInactive?: number
}

/**
 * Labelmap representation type
 */
export type LabelmapRenderingConfig = {
  /** color transfer function */
  cfun?: vtkColorTransferFunction
  /** opacity transfer function */
  ofun?: vtkPiecewiseFunction
}

export type LabelmapSegmentationData = {
  volumeId: string
  referencedVolumeId?: string
}
