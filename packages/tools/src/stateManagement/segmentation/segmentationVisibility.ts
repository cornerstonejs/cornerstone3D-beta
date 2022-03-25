import { triggerSegmentationRepresentationModified } from './triggerSegmentationEvents'
import { getSegmentationRepresentations } from '../../stateManagement/segmentation/segmentationState'
import { ToolGroupSpecificSegmentationData } from '../../types/SegmentationStateTypes'

/**
 * Set the visibility of a segmentation data for a given tool group. It fires
 * a SEGMENTATION_REPRESENTATION_MODIFIED event.
 *
 * @triggers SEGMENTATION_REPRESENTATION_MODIFIED
 * @param toolGroupId - The Id of the tool group that contains the segmentation.
 * @param segmentationDataUID - The id of the segmentation data to modify its visibility.
 * @param visibility - boolean
 */
function setSegmentationVisibility(
  toolGroupId: string,
  segmentationDataUID: string,
  visibility: boolean
): void {
  const toolGroupSegmentations = getSegmentationRepresentations(toolGroupId)

  if (!toolGroupSegmentations) {
    return
  }

  toolGroupSegmentations.forEach(
    (segmentationData: ToolGroupSpecificSegmentationData) => {
      if (segmentationData.segmentationDataUID === segmentationDataUID) {
        segmentationData.visibility = visibility
        triggerSegmentationRepresentationModified(toolGroupId)
      }
    }
  )
}

/**
 * Get the visibility of a segmentation data for a given tool group.
 *
 * @param toolGroupId - The Id of the tool group that the segmentation
 * data belongs to.
 * @param segmentationDataUID - The id of the segmentation data to get
 * @returns A boolean value that indicates whether the segmentation data is visible or
 * not on the toolGroup
 */
function getSegmentationVisibility(
  toolGroupId: string,
  segmentationDataUID: string
): boolean | undefined {
  const toolGroupSegmentations = getSegmentationRepresentations(toolGroupId)

  const segmentationData = toolGroupSegmentations.find(
    (segmentationData: ToolGroupSpecificSegmentationData) =>
      segmentationData.segmentationDataUID === segmentationDataUID
  )

  if (!segmentationData) {
    return
  }

  return segmentationData.visibility
}

export { setSegmentationVisibility, getSegmentationVisibility }
