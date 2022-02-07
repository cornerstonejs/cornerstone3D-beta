import { IImageVolume } from '@precisionmetrics/cornerstone-render/src/types'
import isEqual from '../math/vec3/isEqual'

/**
 * Given a list of labelmaps (with the possibility of overlapping regions),
 * and a referenceVolume, it calculates the total metabolic tumor volume (TMTV)
 * by flattening and rasterizing each segment into a single labelmap and summing
 * the total number of volume voxels. It should be noted that for this calculation
 * we do not double count voxels that are part of multiple labelmaps.
 * @param {} labelmaps
 * @param {number} segmentIndex
 * @returns {number} TMTV in ml
 */
function calculateTMTV(
  labelmaps: Array<IImageVolume>,
  segmentIndex = 1
): number {
  labelmaps.forEach(({ direction, dimensions, origin, spacing }) => {
    if (
      !isEqual(dimensions, labelmaps[0].dimensions) ||
      !isEqual(direction, labelmaps[0].direction) ||
      !isEqual(spacing, labelmaps[0].spacing) ||
      !isEqual(origin, labelmaps[0].origin)
    ) {
      throw new Error('labelmaps must have the same size and shape')
    }
  })

  const labelmap = labelmaps[0]
  const [xSpacing, ySpacing, zSpacing] = labelmap.spacing

  const arrayType = labelmap.scalarData.constructor
  const outputData = new arrayType(labelmap.scalarData.length)

  labelmaps.forEach((labelmap) => {
    const { scalarData } = labelmap
    for (let i = 0; i < scalarData.length; i++) {
      if (scalarData[i] === segmentIndex) {
        outputData[i] = segmentIndex
      }
    }
  })

  // count non-zero values inside the outputData, this would
  // consider the overlapping regions to be only counted once
  const numVoxels = outputData.reduce((acc, curr) => {
    if (curr > 0) {
      return acc + 1
    }
    return acc
  }, 0)

  return numVoxels * xSpacing * ySpacing * zSpacing * 1e-3
}

export default calculateTMTV
