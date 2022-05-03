import { Settings } from '@cornerstonejs/core';
import type { Types } from '@cornerstonejs/core';
import {
  drawHandles as drawHandlesSvg,
  drawPolyline as drawPolylineSvg,
} from '../../../drawingSvg';
import { polyline } from '../../../utilities/math';
import { PlanarFreehandROIAnnotation } from '../../../types/ToolSpecificAnnotationTypes';

const { pointsAreWithinCloseContourProximity } = polyline;

type PlanarFreehandROIRenderOptions = {
  color?: string;
  width?: number;
  connectFirstToLast?: boolean;
};

function _getRenderingOptions(
  annotation: PlanarFreehandROIAnnotation
): PlanarFreehandROIRenderOptions {
  const settings = Settings.getObjectSettings(annotation, this.getToolName());

  const lineWidth = this.getStyle(settings, 'lineWidth', annotation);
  const color = this.getStyle(settings, 'color', annotation);

  const isOpenContour = annotation.data.isOpenContour;

  const options = {
    color: color === undefined ? undefined : <string>color,
    width: lineWidth === undefined ? undefined : <number>lineWidth,
    connectLastToFirst: !isOpenContour,
  };

  return options;
}

/**
 * Renders a `PlanarFreehandROIAnnotation` that is not currently being drawn or edited.
 */
function renderContour(
  enabledElement: Types.IEnabledElement,
  svgDrawingHelper: any,
  annotation: PlanarFreehandROIAnnotation
): void {
  if (annotation.data.isOpenContour) {
    this.renderOpenContour(enabledElement, svgDrawingHelper, annotation);
  } else {
    this.renderClosedContour(enabledElement, svgDrawingHelper, annotation);
  }
}

/**
 * Renders an closed `PlanarFreehandROIAnnotation` annotation.
 */
function renderClosedContour(
  enabledElement: Types.IEnabledElement,
  svgDrawingHelper: any,
  annotation: PlanarFreehandROIAnnotation
): void {
  const { viewport } = enabledElement;
  const options = this._getRenderingOptions(annotation);

  // Its unfortunate that we have to do this for each annotation,
  // Even if its unchanged. In the future we could cache the canvas points per
  // element on the tool? That feels very weird also as we'd need to manage
  // it/clean them up. Its a pre-optimisation for now and we can tackle it if it
  // becomes a problem.
  const canvasPoints = annotation.data.polyline.map((worldPos) =>
    viewport.worldToCanvas(worldPos)
  );

  const polylineUID = '1';

  drawPolylineSvg(
    svgDrawingHelper,
    this.getToolName(),
    annotation.annotationUID,
    polylineUID,
    canvasPoints,
    options
  );
}

/**
 * Renders an open `PlanarFreehandROIAnnotation` annotation.
 */
function renderOpenContour(
  enabledElement: Types.IEnabledElement,
  svgDrawingHelper: any,
  annotation: PlanarFreehandROIAnnotation
): void {
  const { viewport } = enabledElement;
  const options = this._getRenderingOptions(annotation);

  const canvasPoints = annotation.data.polyline.map((worldPos) =>
    viewport.worldToCanvas(worldPos)
  );

  const polylineUID = '1';

  drawPolylineSvg(
    svgDrawingHelper,
    this.getToolName(),
    annotation.annotationUID,
    polylineUID,
    canvasPoints,
    options
  );

  const activeHandleIndex = annotation.data.handles.activeHandleIndex;

  if (activeHandleIndex !== null) {
    // Draw highlighted points
    const handleGroupUID = '0';

    // We already mapped all the points, so don't do the mapping again.
    // The activeHandleIndex can only be one of two points.
    const indexOfCanvasPoints =
      activeHandleIndex === 0 ? 0 : canvasPoints.length - 1;

    const handlePoint = canvasPoints[indexOfCanvasPoints];

    drawHandlesSvg(
      svgDrawingHelper,
      this.getToolName(),
      annotation.annotationUID,
      handleGroupUID,
      [handlePoint],
      { color: options.color }
    );
  }
}

/**
 * Renders a new `PlanarFreehandROIAnnotation` annotation during
 * creation/drawing.
 */
function renderContourBeingDrawn(
  enabledElement: Types.IEnabledElement,
  svgDrawingHelper: any,
  annotation: PlanarFreehandROIAnnotation
): void {
  const options = this._getRenderingOptions(annotation);

  const { allowOpenContours } = this.configuration;
  const { canvasPoints } = this.drawData;

  // Override rendering whilst drawing the contour, we don't know if its open
  // or closed yet
  options.connectLastToFirst = false;

  drawPolylineSvg(
    svgDrawingHelper,
    this.getToolName(),
    annotation.annotationUID,
    '1',
    canvasPoints,
    options
  );

  if (allowOpenContours) {
    const firstPoint = canvasPoints[0];
    const lastPoint = canvasPoints[canvasPoints.length - 1];

    // Check if start and end are within close proximity
    if (
      pointsAreWithinCloseContourProximity(
        firstPoint,
        lastPoint,
        this.configuration.closeContourProximity
      )
    ) {
      // Preview join last points
      drawPolylineSvg(
        svgDrawingHelper,
        this.getToolName(),
        annotation.annotationUID,
        '2',
        [lastPoint, firstPoint],
        options
      );
    } else {
      // Draw start point
      const handleGroupUID = '0';

      drawHandlesSvg(
        svgDrawingHelper,
        this.getToolName(),
        annotation.annotationUID,
        handleGroupUID,
        [firstPoint],
        { color: options.color, handleRadius: 2 }
      );
    }
  }
}

/**
 * Renders a closed `PlanarFreehandROIAnnotation` being edited.
 */
function renderClosedContourBeingEdited(
  enabledElement,
  svgDrawingHelper,
  annotation
): void {
  const { fusedCanvasPoints } = this.editData;

  if (fusedCanvasPoints === undefined) {
    // No edit to render yet, render closed contour.
    this.renderClosedContour(enabledElement, svgDrawingHelper, annotation);

    return;
  }

  const options = this._getRenderingOptions(annotation);

  const polylineUIDToRender = 'preview-1';

  drawPolylineSvg(
    svgDrawingHelper,
    this.getToolName(),
    annotation.annotationUID,
    polylineUIDToRender,
    fusedCanvasPoints,
    options
  );
}

/**
 * Renders an open `PlanarFreehandROIAnnotation` being edited.
 */
function renderOpenContourBeingEdited(
  enabledElement: Types.IEnabledElement,
  svgDrawingHelper: any,
  annotation: PlanarFreehandROIAnnotation
): void {
  const { fusedCanvasPoints } = this.editData;

  if (fusedCanvasPoints === undefined) {
    // No edit to render yet, render closed contour.
    this.renderOpenContour(enabledElement, svgDrawingHelper, annotation);

    return;
  }

  const options = this._getRenderingOptions(annotation);

  const polylineUIDToRender = 'preview-1';

  drawPolylineSvg(
    svgDrawingHelper,
    this.getToolName(),
    annotation.annotationUID,
    polylineUIDToRender,
    fusedCanvasPoints,
    options
  );
}

/**
 * Registers the render methods of various contour states to the tool instance.
 */
function registerRenderMethods(toolInstance) {
  toolInstance.renderContour = renderContour.bind(toolInstance);
  toolInstance.renderClosedContour = renderClosedContour.bind(toolInstance);
  toolInstance.renderOpenContour = renderOpenContour.bind(toolInstance);

  toolInstance.renderContourBeingDrawn =
    renderContourBeingDrawn.bind(toolInstance);

  toolInstance.renderClosedContourBeingEdited =
    renderClosedContourBeingEdited.bind(toolInstance);
  toolInstance.renderOpenContourBeingEdited =
    renderOpenContourBeingEdited.bind(toolInstance);
  toolInstance._getRenderingOptions = _getRenderingOptions.bind(toolInstance);
}

export default registerRenderMethods;
