import cache from '../cache/cache'
// import type { VolumeViewport } from '../RenderingEngine'
import { ICamera, IImageVolume, IVolumeViewport } from '../types'
import getSpacingInNormalDirection from './getSpacingInNormalDirection'

/**
 * Given a volume viewport and camera, find the target volume.
 * The imageVolume is retrieved from cache for the specified targetVolumeUID or
 * in case it is not provided, it chooses the volumeUID on the viewport (there
 * might be more than one in case of fusion) that has the finest resolution in the
 * direction of view (normal).
 *
 * @param viewport - volume viewport
 * @param camera - current camera
 * @param targetVolumeUID - If a target volumeUID is given that volume
 * is forced to be used.
 *
 * @returns An object containing the imageVolume and spacingInNormalDirection.
 *
 */
export default function getTargetVolumeAndSpacingInNormalDir(
  viewport: IVolumeViewport,
  camera: ICamera,
  targetVolumeUID?: string
): {
  imageVolume: IImageVolume
  spacingInNormalDirection: number
} {
  const { viewPlaneNormal } = camera
  const volumeActors = viewport.getActors()

  if (!volumeActors && !volumeActors.length) {
    return { spacingInNormalDirection: null, imageVolume: null }
  }
  const numVolumeActors = volumeActors.length
  const imageVolumes = volumeActors.map((va) => cache.getVolume(va.uid))

  // If a volumeUID is defined, set that volume as the target
  if (targetVolumeUID) {
    const imageVolume = imageVolumes.find((iv) => iv.uid === targetVolumeUID)

    const spacingInNormalDirection = getSpacingInNormalDirection(
      imageVolume,
      viewPlaneNormal
    )

    return { imageVolume, spacingInNormalDirection }
  }

  // Fetch volume actor with finest resolution in direction of projection.
  const smallest = {
    spacingInNormalDirection: Infinity,
    imageVolume: null,
  }

  for (let i = 0; i < numVolumeActors; i++) {
    const imageVolume = imageVolumes[i]

    // TODO: Hacky workaround for undefined volumes created by Seg
    if (!imageVolume) {
      continue
    }

    const spacingInNormalDirection = getSpacingInNormalDirection(
      imageVolume,
      viewPlaneNormal
    )

    if (spacingInNormalDirection < smallest.spacingInNormalDirection) {
      smallest.spacingInNormalDirection = spacingInNormalDirection
      smallest.imageVolume = imageVolume
    }
  }

  return smallest
}
