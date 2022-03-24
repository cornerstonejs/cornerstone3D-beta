import {
  RenderingEngine,
  Types,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  CONSTANTS,
} from '@cornerstonejs/core'
import {
  initDemo,
  createImageIdsAndCacheMetaData,
  setTitleAndDescription,
  addToggleButtonToToolbar,
} from '../../../../utils/demo/helpers'
import * as cornerstoneTools from '@cornerstonejs/tools'
// Auto registers volume loader
import '@cornerstonejs/streaming-image-volume-loader' // Registers volume loader

const {
  PanTool,
  WindowLevelTool,
  ZoomTool,
  ToolGroupManager,
  StackScrollMouseWheelTool,
  Enums: csToolsEnums,
  synchronizers,
  SynchronizerManager,
} = cornerstoneTools

const { ViewportType } = Enums
const { ORIENTATION } = CONSTANTS
const { MouseBindings } = csToolsEnums

const { createCameraPositionSynchronizer, createVOISynchronizer } =
  synchronizers

// Define a unique id for the volume
const volumeName = 'CT_VOLUME_UID' // Id of the volume less loader prefix
const volumeLoaderProtocolName = 'cornerstoneStreamingImageVolume' // Loader id which defines which volume loader to use
const volumeUID = `${volumeLoaderProtocolName}:${volumeName}` // VolumeUID with loader id + volume id

const cameraSynchronizerId = 'CAMERA_SYNCHRONIZER_ID'
const voiSynchronizerId = 'VOI_SYNCHRONIZER_ID'

const renderingEngineId = 'myRenderingEngine'
const viewportUIDs = [
  'CT_SAGITTAL_STACK_1',
  'CT_SAGITTAL_STACK_2',
  'CT_SAGITTAL_STACK_3',
]

// ======== Set up page ======== //
setTitleAndDescription(
  'Synchronization of Volume Viewport Properties',
  'Here we demonstrate camera and window/level synchronization across viewports.'
)

const size = '500px'
const content = document.getElementById('content')
const viewportGrid = document.createElement('div')

viewportGrid.style.display = 'flex'
viewportGrid.style.display = 'flex'
viewportGrid.style.flexDirection = 'row'

const element1 = document.createElement('div')
const element2 = document.createElement('div')
const element3 = document.createElement('div')
element1.style.width = size
element1.style.height = size
element2.style.width = size
element2.style.height = size
element3.style.width = size
element3.style.height = size

// Disable right click context menu so we can have right click tools
element1.oncontextmenu = (e) => e.preventDefault()
// Disable right click context menu so we can have right click tools
element2.oncontextmenu = (e) => e.preventDefault()
// Disable right click context menu so we can have right click tools
element3.oncontextmenu = (e) => e.preventDefault()

viewportGrid.appendChild(element1)
viewportGrid.appendChild(element2)
viewportGrid.appendChild(element3)

content.appendChild(viewportGrid)

const instructions = document.createElement('p')
instructions.innerText = `
Left Click to change window/level
Use the mouse wheel to scroll through the stack.

Toggle the controls to add viewports to the synchronization groups.
`

content.append(instructions)
// ============================= //

const SynchronizerButtonInfo = [
  { viewportLabel: 'A', viewportId: viewportUIDs[0] },
  { viewportLabel: 'B', viewportId: viewportUIDs[1] },
  { viewportLabel: 'C', viewportId: viewportUIDs[2] },
]

SynchronizerButtonInfo.forEach(({ viewportLabel, viewportId }) => {
  addToggleButtonToToolbar(`Camera ${viewportLabel}`, (evt, toggle) => {
    const synchronizer =
      SynchronizerManager.getSynchronizerById(cameraSynchronizerId)

    if (!synchronizer) {
      return
    }

    if (toggle) {
      synchronizer.add({ renderingEngineId, viewportId })
    } else {
      synchronizer.remove({ renderingEngineId, viewportId })
    }
  })
})

SynchronizerButtonInfo.forEach(({ viewportLabel, viewportId }) => {
  addToggleButtonToToolbar(`VOI ${viewportLabel}`, (evt, toggle) => {
    const synchronizer =
      SynchronizerManager.getSynchronizerById(voiSynchronizerId)

    if (!synchronizer) {
      return
    }

    if (toggle) {
      synchronizer.add({ renderingEngineId, viewportId })
    } else {
      synchronizer.remove({ renderingEngineId, viewportId })
    }
  })
})

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await initDemo()

  const toolGroupId = 'TOOL_GROUP_UID'

  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(PanTool)
  cornerstoneTools.addTool(WindowLevelTool)
  cornerstoneTools.addTool(StackScrollMouseWheelTool)
  cornerstoneTools.addTool(ZoomTool)

  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId)

  // Add tools to the tool group
  toolGroup.addTool(WindowLevelTool.toolName, { configuration: { volumeUID } })
  toolGroup.addTool(PanTool.toolName)
  toolGroup.addTool(ZoomTool.toolName)
  toolGroup.addTool(StackScrollMouseWheelTool.toolName)

  // Set the initial state of the tools, here all tools are active and bound to
  // Different mouse inputs
  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary, // Left Click
      },
    ],
  })
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  })
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  })
  // As the Stack Scroll mouse wheel is a tool using the `mouseWheelCallback`
  // hook instead of mouse buttons, it does not need to assign any mouse button.
  toolGroup.setToolActive(StackScrollMouseWheelTool.toolName)

  // Create synchronizers
  const cameraSynchronizer =
    createCameraPositionSynchronizer(cameraSynchronizerId)
  const voiSynchronizer = createVOISynchronizer(voiSynchronizerId)

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    SeriesInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
    wadoRsRoot: 'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs',
    type: 'VOLUME',
  })

  // Instantiate a rendering engine
  const renderingEngine = new RenderingEngine(renderingEngineId)

  // Create the viewports
  const viewportInputArray = [
    {
      viewportId: viewportUIDs[0],
      type: ViewportType.ORTHOGRAPHIC,
      element: element1,
      defaultOptions: {
        orientation: ORIENTATION.SAGITTAL,
        background: <Types.Point3>[0.2, 0, 0.2],
      },
    },
    {
      viewportId: viewportUIDs[1],
      type: ViewportType.ORTHOGRAPHIC,
      element: element2,
      defaultOptions: {
        orientation: ORIENTATION.SAGITTAL,
        background: <Types.Point3>[0.2, 0, 0.2],
      },
    },
    {
      viewportId: viewportUIDs[2],
      type: ViewportType.ORTHOGRAPHIC,
      element: element3,
      defaultOptions: {
        orientation: ORIENTATION.SAGITTAL,
        background: <Types.Point3>[0.2, 0, 0.2],
      },
    },
  ]

  renderingEngine.setViewports(viewportInputArray)

  // Set the tool group on the viewports
  viewportUIDs.forEach((viewportId) =>
    toolGroup.addViewport(viewportId, renderingEngineId)
  )

  // Define a volume in memory
  const volume = await volumeLoader.createAndCacheVolume(volumeUID, {
    imageIds,
  })

  // Set the volume to load
  volume.load()

  setVolumesForViewports(renderingEngine, [{ volumeUID }], viewportUIDs)

  // Render the image
  renderingEngine.render()
}

run()
