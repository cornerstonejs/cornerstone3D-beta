import { utilities as csUtils } from '@cornerstonejs/core';
import type { Types } from '@cornerstonejs/core';
import getBoundingBoxAroundShape from './getBoundingBoxAroundShape';
import extendBoundingBoxInSliceAxisIfNecessary from './extendBoundingBoxInSliceAxisIfNecessary';

function getBoundsIJKFromRectangleROIs(annotations, referenceVolume, options) {
  const { numSlicesToProject } = options;

  const AllBoundsIJK = [];
  annotations.forEach((annotation) => {
    const { data } = annotation;
    const { points } = data.handles;

    const { imageData, dimensions } = referenceVolume;

    let pointsToUse = points;
    // If the tool is a 2D tool but has projection points, use them
    if (data.cachedStats?.projectionPoints) {
      const { projectionPoints } = data.cachedStats;
      pointsToUse = [].concat(...projectionPoints); // cannot use flat() because of typescript compiler right now
    }

    const rectangleCornersIJK = pointsToUse.map(
      (world) => csUtils.transformWorldToIndex(imageData, world) as Types.Point3
    );
    let boundsIJK = getBoundingBoxAroundShape(rectangleCornersIJK, dimensions);

    // If the tool is 2D but it is configured to project to X amount of slices
    // Don't project the slices if projectionPoints have been used to define the extents
    if (numSlicesToProject && !data.cachedStats?.projectionPoints) {
      boundsIJK = extendBoundingBoxInSliceAxisIfNecessary(
        boundsIJK,
        numSlicesToProject
      );
    }

    AllBoundsIJK.push(boundsIJK);
  });

  if (AllBoundsIJK.length === 1) {
    return AllBoundsIJK[0];
  }

  // Get the intersection of all the bounding boxes
  // This is the bounding box that contains all the ROIs
  const boundsIJK = AllBoundsIJK.reduce(
    (accumulator, currentValue) => {
      return {
        iMin: Math.min(accumulator.iMin, currentValue.iMin),
        jMin: Math.min(accumulator.jMin, currentValue.jMin),
        kMin: Math.min(accumulator.kMin, currentValue.kMin),
        iMax: Math.max(accumulator.iMax, currentValue.iMax),
        jMax: Math.max(accumulator.jMax, currentValue.jMax),
        kMax: Math.max(accumulator.kMax, currentValue.kMax),
      };
    },
    {
      iMin: Infinity,
      jMin: Infinity,
      kMin: Infinity,
      iMax: -Infinity,
      jMax: -Infinity,
      kMax: -Infinity,
    }
  );

  return boundsIJK;
}

export default getBoundsIJKFromRectangleROIs;
