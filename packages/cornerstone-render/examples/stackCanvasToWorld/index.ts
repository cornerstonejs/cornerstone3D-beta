import {
  RenderingEngine,
  Types,
  VIEWPORT_TYPE,
} from '@precisionmetrics/cornerstone-render'
import {
  initDemo,
  createImageIdsAndCacheMetaData,
  setTitleAndDescription,
} from '../../../../utils/demo/helpers'

// ======== Set up page ======== //
setTitleAndDescription(
  'Stack CanvasToWorld',
  'Displays the world coordinate when the mouse is moved over the canvas.'
)

const content = document.getElementById('content')
const element = document.createElement('div')
element.id = 'cornerstone-element'
element.style.width = '500px'
element.style.height = '500px'

content.appendChild(element)

const mousePosDiv = document.createElement('div')

const canvasPosElement = document.createElement('p')
const worldPosElement = document.createElement('p')

canvasPosElement.innerText = 'canvas:'
worldPosElement.innerText = 'world:'

content.appendChild(mousePosDiv)

mousePosDiv.appendChild(canvasPosElement)
mousePosDiv.appendChild(worldPosElement)

// ============================= //

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await initDemo()

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    SeriesInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
    wadoRsRoot: 'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs',
    type: 'STACK',
  })

  // Instantiate a rendering engine
  const renderingEngineUID = 'myRenderingEngine'
  const renderingEngine = new RenderingEngine(renderingEngineUID)

  // Create a stack viewport
  const viewportUID = 'CT_STACK'
  const viewportInput = {
    viewportUID,
    type: VIEWPORT_TYPE.STACK,
    element,
    defaultOptions: {
      background: <Types.Point3>[0.2, 0, 0.2],
    },
  }

  renderingEngine.enableElement(viewportInput)

  // Get the stack viewport that was created
  const viewport = <Types.IStackViewport>(
    renderingEngine.getViewport(viewportUID)
  )

  // Define a stack containing a single image
  const stack = [imageIds[0]]

  // Set the stack on the viewport
  viewport.setStack(stack)

  // Render the image
  renderingEngine.render()

  element.addEventListener('mousemove', (evt) => {
    const rect = element.getBoundingClientRect()

    const canvasPos: Types.Point2 = [
      Math.floor(evt.clientX - rect.left),
      Math.floor(evt.clientY - rect.top),
    ]
    // Convert canvas coordinates to world coordinates
    const worldPos = viewport.canvasToWorld(canvasPos)

    canvasPosElement.innerText = `canvas: (${canvasPos[0]}, ${canvasPos[1]})`
    worldPosElement.innerText = `world: (${worldPos[0].toFixed(
      2
    )}, ${worldPos[1].toFixed(2)}, ${worldPos[2].toFixed(2)})`
  })
}

run()
