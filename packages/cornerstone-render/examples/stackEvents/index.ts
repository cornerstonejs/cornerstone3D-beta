import {
  RenderingEngine,
  Types,
  VIEWPORT_TYPE,
  getRenderingEngine,
  EVENTS as RenderingEngineEvents,
} from '@precisionmetrics/cornerstone-render'
import {
  initDemo,
  createImageIdsAndCacheMetaData,
  setTitleAndDescription,
  addButtonToToolbar,
} from '../../../../utils/demo/helpers'
import { vec3 } from 'gl-matrix'

// ======== Constants ======= //
const renderingEngineUID = 'myRenderingEngine'
const viewportUID = 'CT_STACK'

// ======== Set up page ======== //
setTitleAndDescription('Stack Events', 'Shows events emitted by Cornerstone Stack Viewports.')

const content = document.getElementById('content')
const element = document.createElement('div')
element.id = 'cornerstone-element'
element.style.width = '500px'
element.style.height = '500px'

content.appendChild(element)

const lastEvents = []
const lastEventsDiv = document.createElement('div')

content.appendChild(lastEventsDiv)

function updateLastEvents(number, eventName, detail) {
  if (lastEvents.length > 4) {
    lastEvents.pop()
  }

  lastEvents.unshift({ number, eventName, detail })

  // Display
  lastEventsDiv.innerHTML = ''

  lastEvents.forEach((le) => {
    const element = document.createElement('p')

    element.style.border = '1px solid black'
    element.innerText = le.number + ' ' + le.eventName + '\n\n' + le.detail

    lastEventsDiv.appendChild(element)
  })
}

let eventNumber = 1

const { IMAGE_RENDERED, CAMERA_MODIFIED, STACK_NEW_IMAGE } = RenderingEngineEvents

element.addEventListener(IMAGE_RENDERED, (evt) => {
  updateLastEvents(eventNumber, IMAGE_RENDERED, JSON.stringify(evt.detail))
  eventNumber++
})

element.addEventListener(CAMERA_MODIFIED, (evt) => {
  updateLastEvents(eventNumber, CAMERA_MODIFIED, JSON.stringify(evt.detail))
  eventNumber++
})

element.addEventListener(STACK_NEW_IMAGE, (evt) => {
  // Remove the image since then we serialise a bunch of pixeldata to the screen.
  const { imageId, renderingEngineUID, viewportUID } = evt.detail
  const detail = { imageId, renderingEngineUID, viewportUID, image: 'cornerstoneImageObject' }

  updateLastEvents(eventNumber, STACK_NEW_IMAGE, JSON.stringify(detail))
  eventNumber++
})

addButtonToToolbar('Set VOI Range', () => {
  // Get the rendering engine
  const renderingEngine = getRenderingEngine(renderingEngineUID)

  // Get the stack viewport
  const viewport = <Types.StackViewport>renderingEngine.getViewport(viewportUID)

  // Set a range to highlight bones
  viewport.setProperties({ voiRange: { upper: 2500, lower: -1500 } })

  viewport.render()
})

addButtonToToolbar('Next Image', () => {
  // Get the rendering engine
  const renderingEngine = getRenderingEngine(renderingEngineUID)

  // Get the stack viewport
  const viewport = <Types.StackViewport>renderingEngine.getViewport(viewportUID)

  // Get the current index of the image displayed
  const currentImageIdIndex = viewport.getCurrentImageIdIndex()

  // Increment the index, clamping to the last image if necessary
  const numImages = viewport.getImageIds().length
  let newImageIdIndex = currentImageIdIndex + 1

  newImageIdIndex = Math.min(newImageIdIndex, numImages - 1)

  // Set the new image index, the viewport itself does a re-render
  viewport.setImageIdIndex(newImageIdIndex)
})

addButtonToToolbar('Previous Image', () => {
  // Get the rendering engine
  const renderingEngine = getRenderingEngine(renderingEngineUID)

  // Get the stack viewport
  const viewport = <Types.StackViewport>renderingEngine.getViewport(viewportUID)

  // Get the current index of the image displayed
  const currentImageIdIndex = viewport.getCurrentImageIdIndex()

  // Increment the index, clamping to the first image if necessary
  let newImageIdIndex = currentImageIdIndex - 1

  newImageIdIndex = Math.max(newImageIdIndex, 0)

  // Set the new image index, the viewport itself does a re-render
  viewport.setImageIdIndex(newImageIdIndex)
})

addButtonToToolbar('Apply Random Zoom And Pan', () => {
  // Get the rendering engine
  const renderingEngine = getRenderingEngine(renderingEngineUID)

  // Get the stack viewport
  const viewport = <Types.StackViewport>renderingEngine.getViewport(viewportUID)

  // Reset the camera so that we can set some pan and zoom relative to the
  // defaults for this demo. Note that changes could be relative instead.
  viewport.resetCamera()

  // Get the current camera properties
  const camera = viewport.getCamera()
  const { viewUp, viewPlaneNormal, parallelScale, position, focalPoint } = camera

  // Modify the zoom by some factor
  const randomModifier = 0.5 + Math.random() - 0.5
  const newParallelScale = parallelScale * randomModifier

  // Move the camera in plane by some random number
  let viewRight = vec3.create() // Get the X direction of the viewport

  vec3.cross(viewRight, <vec3>viewUp, <vec3>viewPlaneNormal)

  viewRight = [-viewRight[0], -viewRight[1], -viewRight[2]]

  const randomPanX = 50 * (2.0 * Math.random() - 1)
  const randomPanY = 50 * (2.0 * Math.random() - 1)

  const diff = [0, 0, 0]

  // Pan X
  for (let i = 0; i <= 2; i++) {
    diff[i] += viewRight[i] * randomPanX
  }

  // Pan Y
  for (let i = 0; i <= 2; i++) {
    diff[i] += viewUp[i] * randomPanY
  }

  const newPosition = []
  const newFocalPoint = []

  for (let i = 0; i <= 2; i++) {
    newPosition[i] = position[i] + diff[i]
    newFocalPoint[i] = focalPoint[i] + diff[i]
  }

  viewport.setCamera({ parallelScale: newParallelScale, position: newPosition, focalPoint: newFocalPoint })
  viewport.render()
})

addButtonToToolbar('Reset Viewport', () => {
  // Get the rendering engine
  const renderingEngine = getRenderingEngine(renderingEngineUID)

  // Get the stack viewport
  const viewport = <Types.StackViewport>renderingEngine.getViewport(viewportUID)

  // Resets the viewport's camera
  viewport.resetCamera()
  // Resets the viewport's properties
  viewport.resetProperties()
  viewport.render()
})

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await initDemo()

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    SeriesInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
    wadoRsRoot: 'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs',
    type: 'STACK',
  })

  // Instantiate a rendering engine
  const renderingEngine = new RenderingEngine(renderingEngineUID)

  // Create a stack viewport

  const viewportInput = {
    viewportUID,
    type: VIEWPORT_TYPE.STACK,
    element,
    defaultOptions: {
      background: [0.2, 0, 0.2],
    },
  }

  renderingEngine.enableElement(viewportInput)

  // Get the stack viewport that was created
  const viewport = <Types.StackViewport>renderingEngine.getViewport(viewportUID)

  // Define a stack containing a single image
  const stack = [imageIds[0], imageIds[1], imageIds[2]]

  // Set the stack on the viewport
  viewport.setStack(stack)

  // Render the image
  renderingEngine.render()
}

run()
