import {
  mouseEventListeners,
  wheelEventListener,
  keyEventListener,
  labelmapStateEventListener,
} from '../eventListeners'
import {
  imageRenderedEventDispatcher,
  cameraModifiedEventDispatcher,
  mouseToolEventDispatcher,
  keyboardToolEventDispatcher,
  imageSpacingCalibratedEventDispatcher,
} from '../eventDispatchers'
import { state } from './state'

import { annotationRenderingEngine } from '../util/triggerAnnotationRender'

/**
 * When an element is "enabled", add event listeners and dispatchers to it
 * so we can use interactions to affect tool behaviors
 *
 * @param evt The ELEMENT_ENABLED event
 */
export default function addEnabledElement(evt: CustomEvent): void {
  const { element, viewportUID } = evt.detail
  const svgLayer = _createSvgAnnotationLayer()

  // Reset/Create svgNodeCache for element
  _setSvgNodeCache(element)
  _appnedChild(svgLayer, element)

  // Add this element to the annotation rendering engine
  annotationRenderingEngine.addViewportElement(viewportUID, element)

  // Listeners
  mouseEventListeners.enable(element)
  wheelEventListener.enable(element)
  keyEventListener.enable(element)
  labelmapStateEventListener.enable(element)

  // Dispatchers: renderer
  imageRenderedEventDispatcher.enable(element)
  cameraModifiedEventDispatcher.enable(element)
  imageSpacingCalibratedEventDispatcher.enable(element)
  // Dispatchers: interaction
  mouseToolEventDispatcher.enable(element)
  keyboardToolEventDispatcher.enable(element)
  // touchToolEventDispatcher.enable(enabledElement);

  // labelmap
  // State
  state.enabledElements.push(element)
}

/**
 *
 */
function _createSvgAnnotationLayer(): SVGElement {
  const svgns = 'http://www.w3.org/2000/svg'
  const svgLayer = document.createElementNS(svgns, 'svg')

  svgLayer.classList.add('svg-layer')
  svgLayer.setAttribute('id', 'svg-layer')
  svgLayer.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgLayer.style.width = '100%'
  svgLayer.style.height = '100%'
  svgLayer.style.pointerEvents = 'none'
  svgLayer.style.position = 'absolute'
  // TODO: we should test this on high-res monitors
  //svgLayer.style.textRendering = 'optimizeSpeed'

  // Single dropshadow config for now
  const defs = document.createElementNS(svgns, 'defs')
  const filter = document.createElementNS(svgns, 'filter')
  const feOffset = document.createElementNS(svgns, 'feOffset')
  const feColorMatrix = document.createElementNS(svgns, 'feColorMatrix')
  const feGaussianBlur = document.createElementNS(svgns, 'feGaussianBlur')
  const feBlend = document.createElementNS(svgns, 'feBlend')

  //
  filter.setAttribute('id', 'shadow')
  filter.setAttribute('width', '110%')
  filter.setAttribute('height', '110%')

  //
  feOffset.setAttribute('result', 'offOut')
  feOffset.setAttribute('in', 'SourceGraphic')
  feOffset.setAttribute('dx', '0.5')
  feOffset.setAttribute('dy', '0.5')

  //
  feColorMatrix.setAttribute('result', 'matrixOut')
  feColorMatrix.setAttribute('in', 'offOut')
  feColorMatrix.setAttribute('type', 'matrix')
  feColorMatrix.setAttribute(
    'values',
    '0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0'
  )

  //
  feGaussianBlur.setAttribute('result', 'blurOut')
  feGaussianBlur.setAttribute('in', 'matrixOut')
  feGaussianBlur.setAttribute('stdDeviation', '0.25')

  //
  feBlend.setAttribute('in', 'SourceGraphic')
  feBlend.setAttribute('in2', 'blurOut')
  feBlend.setAttribute('mode', 'normal')

  filter.appendChild(feOffset)
  filter.appendChild(feColorMatrix)
  filter.appendChild(feGaussianBlur)
  filter.appendChild(feBlend)
  defs.appendChild(filter)
  svgLayer.appendChild(defs)

  return svgLayer
}

function _setSvgNodeCache(element) {
  const {
    viewportUid: viewportUID,
    sceneUid: sceneUID,
    renderingEngineUid: renderingEngineUID,
  } = element.dataset
  const elementHash = `${viewportUID}:${sceneUID}:${renderingEngineUID}`

  // Create or reset
  // TODO: If... Reset, we should blow out any nodes in DOM
  state.svgNodeCache[elementHash] = {}
}

/**
 *
 * @param newNode
 * @param referenceNode
 */
function _appnedChild(newNode: SVGElement, referenceNode: HTMLElement): void {
  referenceNode.querySelector('div.viewport-element').appendChild(newNode)
}
