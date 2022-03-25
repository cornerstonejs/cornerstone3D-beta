import { getActiveSegmentationInfo } from './activeSegmentation'
import { getSegmentation } from './segmentationState'
import { triggerSegmentationGlobalStateModified } from './triggerSegmentationEvents'

/**
 * Returns the active segment index for the active segmentation in the tool group
 *
 * @param toolGroupId - The Id of the tool group that contains an active segmentation.
 * @returns The active segment index.
 */
function getActiveSegmentIndex(toolGroupId: string): number | undefined {
  const segmentationInfo = getActiveSegmentationInfo(toolGroupId)

  if (!segmentationInfo) {
    throw new Error('toolGroup does not contain an active segmentation')
  }

  const { volumeId } = segmentationInfo
  const activeSegmentationGlobalState = getSegmentation(volumeId)

  if (activeSegmentationGlobalState) {
    return activeSegmentationGlobalState.activeSegmentIndex
  }
}

/**
 * Set the active segment index for the active segmentation of the toolGroup.
 * It fires a global state modified event.
 *
 * @triggers SEGMENTATION_GLOBAL_STATE_MODIFIED
 * @param toolGroupId - The Id of the tool group that contains the segmentation.
 * @param segmentIndex - The index of the segment to be activated.
 */
function setActiveSegmentIndex(
  toolGroupId: string,
  segmentIndex: number
): void {
  const segmentationInfo = getActiveSegmentationInfo(toolGroupId)

  if (!segmentationInfo) {
    throw new Error('element does not contain an active segmentation')
  }

  const { volumeId: segmentationId } = segmentationInfo
  const activeSegmentationGlobalState = getSegmentation(segmentationId)

  if (activeSegmentationGlobalState?.activeSegmentIndex !== segmentIndex) {
    activeSegmentationGlobalState.activeSegmentIndex = segmentIndex

    triggerSegmentationGlobalStateModified(segmentationId)
  }
}

/**
 * Set the active segment index for a segmentation Id. It fires a global state
 * modified event.
 *
 * @triggers SEGMENTATION_GLOBAL_STATE_MODIFIED
 * @param segmentationId - The id of the segmentation that the segment belongs to.
 * @param segmentIndex - The index of the segment to be activated.
 */
function setActiveSegmentIndexForSegmentation(
  segmentationId: string,
  segmentIndex: number
): void {
  const activeSegmentationGlobalState = getSegmentation(segmentationId)

  if (activeSegmentationGlobalState?.activeSegmentIndex !== segmentIndex) {
    activeSegmentationGlobalState.activeSegmentIndex = segmentIndex

    triggerSegmentationGlobalStateModified(segmentationId)
  }
}

/**
 * Get the active segment index for a segmentation in the global state
 * @param segmentationId - The id of the segmentation to get the active segment index from.
 * @returns The active segment index for the given segmentation.
 */
function getActiveSegmentIndexForSegmentation(
  segmentationId: string
): number | undefined {
  const activeSegmentationGlobalState = getSegmentation(segmentationId)

  if (activeSegmentationGlobalState) {
    return activeSegmentationGlobalState.activeSegmentIndex
  }
}

export {
  // toolGroup Active Segmentation
  getActiveSegmentIndex,
  setActiveSegmentIndex,
  // global segmentation
  getActiveSegmentIndexForSegmentation,
  setActiveSegmentIndexForSegmentation,
}
