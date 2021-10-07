import {
  fillInsideShape,
  getBoundingBoxAroundShape,
} from '../../../util/segmentation'
import { Point3 } from '../../../types'
import { ImageVolume, Types } from '@ohif/cornerstone-render'

type OperationData = {
  points: [Point3, Point3, Point3, Point3]
  labelmap: ImageVolume
  constraintFn: (x: [number, number, number]) => boolean
  segmentIndex: number
  segmentsLocked: number[]
}

type FillRectangleEvent = {
  enabledElement: Types.IEnabledElement
}

/**
 * FillInsideRectangle - Fill all pixels inside/outside the region defined
 * by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function fillRectangle(
  evt: FillRectangleEvent,
  operationData: OperationData,
  inside = true
): void {
  const { enabledElement } = evt
  const { renderingEngine } = enabledElement
  const { labelmap, points, constraintFn } = operationData
  const { vtkImageData, dimensions } = labelmap

  const rectangleCornersIJK = points.map((world) => {
    return vtkImageData.worldToIndex(world)
  })

  const boundsIJK = getBoundingBoxAroundShape(rectangleCornersIJK, dimensions)

  if (boundsIJK.every(([min, max]) => min !== max)) {
    throw new Error('Oblique segmentation tools are not supported yet')
  }

  const [[iMin, iMax], [jMin, jMax], [kMin, kMax]] = boundsIJK

  const topLeftFront = [iMin, jMin, kMin]
  const bottomRightBack = [iMax, jMax, kMax]

  // Since always all points inside the boundsIJK is inside the rectangle...
  const pointInShape = () => true

  inside
    ? fillInsideShape(
        evt,
        operationData,
        pointInShape,
        constraintFn,
        topLeftFront,
        bottomRightBack
      )
    : null //fillOutsideBoundingBox(evt, operationData, topLeftFront, bottomRightBack)

  // todo: this renders all viewports, only renders viewports that have the modified labelmap actor
  // right now this is needed to update the labelmap on other viewports that have it (pt)
  renderingEngine.render()
}

/**
 * Fill all pixels inside/outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillInsideRectangle(
  evt: FillRectangleEvent,
  operationData: OperationData
): void {
  fillRectangle(evt, operationData, true)
}

/**
 * Fill all pixels outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillOutsideRectangle(
  evt: FillRectangleEvent,
  operationData: OperationData
): void {
  fillRectangle(evt, operationData, false)
}
