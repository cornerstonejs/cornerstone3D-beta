import type { Types } from '@cornerstonejs/core';

/**
 * cCalculates the area of an array of `Point2` points using the shoelace algorithm.
 */
export default function calculateAreaOfPoints(points: Types.Point2[]): number {
  // Shoelace algorithm.
  const n = points.length;
  let area = 0.0;
  let j = n - 1;

  for (let i = 0; i < n; i++) {
    area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1]);
    j = i; // j is previous vertex to i
  }

  // Return absolute value of half the sum (half as summing up traingles).
  return Math.abs(area / 2.0);
}