import { VolumeViewport } from '../'
import type { IVolumeInput, IRenderingEngine } from '../../types'

/**
 * For each provided viewport it adds a volume to the viewport using the
 * provided renderingEngine
 *
 *
 * @param renderingEngine - The rendering engine to use to get viewports from
 * @param volumeInputs - Array of volume inputs including volumeUID. Other properties
 * such as visibility, callback, blendMode, slabThickness are optional
 * @param viewportUIDs - Array of viewport UIDs to add the volume to
 * @param immediateRender - If true, the volumes will be rendered immediately
 * @returns A promise that resolves when all volumes have been added
 */
async function addVolumesToViewports(
  renderingEngine: IRenderingEngine,
  volumeInputs: Array<IVolumeInput>,
  viewportUIDs: Array<string>,
  immediateRender = false
): Promise<void> {
  // Check if all viewports are volumeViewports
  viewportUIDs.forEach((viewportId) => {
    const viewport = renderingEngine.getViewport(viewportId)

    if (!viewport) {
      throw new Error(`Viewport with UID ${viewportId} does not exist`)
    }

    // if not instance of VolumeViewport, throw
    if (!(viewport instanceof VolumeViewport)) {
      throw new Error('addVolumesToViewports only supports VolumeViewport')
    }
  })

  const addVolumePromises = viewportUIDs.map(async (viewportId) => {
    const viewport = renderingEngine.getViewport(viewportId) as VolumeViewport

    await viewport.addVolumes(volumeInputs, immediateRender)
  })

  await Promise.all(addVolumePromises)

  return
}

export default addVolumesToViewports
