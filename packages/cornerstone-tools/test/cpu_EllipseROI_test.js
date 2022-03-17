import * as cornerstone3D from '../../cornerstone-render/src/index'
import * as csTools3d from '../src/index'

const {
  cache,
  RenderingEngine,
  VIEWPORT_TYPE,
  ORIENTATION,
  EVENTS,
  Utilities,
  registerImageLoader,
  unregisterAllImageLoaders,
  metaData,
  getEnabledElement,
  eventTarget,
  registerVolumeLoader,
  setUseCPURenderingOnlyForDebugOrTests,
  resetCPURenderingOnlyForDebugOrTests,
} = cornerstone3D

const {
  EllipticalRoiTool,
  ToolGroupManager,
  getAnnotations,
  removeAnnotation,
  CornerstoneTools3DEvents,
  cancelActiveManipulations,
} = csTools3d

const {
  fakeImageLoader,
  fakeVolumeLoader,
  fakeMetaDataProvider,
  createNormalizedMouseEvent,
} = Utilities.testUtils

const renderingEngineUID = Utilities.uuidv4()

const viewportUID = 'VIEWPORT'

const AXIAL = 'AXIAL'

function createViewport(renderingEngine, viewportType, width, height) {
  const element = document.createElement('div')

  element.style.width = `${width}px`
  element.style.height = `${height}px`
  document.body.appendChild(element)

  renderingEngine.setViewports([
    {
      viewportUID: viewportUID,
      type: viewportType,
      element,
      defaultOptions: {
        background: [1, 0, 1], // pinkish background
        orientation: ORIENTATION[AXIAL],
      },
    },
  ])
  return element
}

const volumeId = `fakeVolumeLoader:volumeURI_100_100_4_1_1_1_0`

describe('EllipticalRoiTool (CPU):', () => {
  beforeAll(() => {
    setUseCPURenderingOnlyForDebugOrTests(true)
  })

  afterAll(() => {
    resetCPURenderingOnlyForDebugOrTests()
  })

  beforeEach(function () {
    csTools3d.init()
    csTools3d.addTool(EllipticalRoiTool)
    this.DOMElements = []

    cache.purgeCache()
    this.stackToolGroup = ToolGroupManager.createToolGroup('stack')
    this.stackToolGroup.addTool(EllipticalRoiTool.toolName, {
      configuration: { volumeUID: volumeId },
    })
    this.stackToolGroup.setToolActive(EllipticalRoiTool.toolName, {
      bindings: [{ mouseButton: 1 }],
    })

    this.renderingEngine = new RenderingEngine(renderingEngineUID)
    registerImageLoader('fakeImageLoader', fakeImageLoader)
    registerVolumeLoader('fakeVolumeLoader', fakeVolumeLoader)
    metaData.addProvider(fakeMetaDataProvider, 10000)
  })

  afterEach(function () {
    this.renderingEngine.disableElement(viewportUID)

    csTools3d.destroy()
    eventTarget.reset()
    cache.purgeCache()
    this.renderingEngine.destroy()
    metaData.removeProvider(fakeMetaDataProvider)
    unregisterAllImageLoaders()
    ToolGroupManager.destroyToolGroupByToolGroupUID('stack')

    this.DOMElements.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
  })

  it('Should successfully create a ellipse tool on a cpu stack viewport with mouse drag - 512 x 128', function (done) {
    const element = createViewport(
      this.renderingEngine,
      VIEWPORT_TYPE.STACK,
      512,
      128
    )
    this.DOMElements.push(element)

    const imageId1 = 'fakeImageLoader:imageURI_64_64_10_5_1_1_0'
    const vp = this.renderingEngine.getViewport(viewportUID)

    const addEventListenerForAnnotationRendered = () => {
      element.addEventListener(
        CornerstoneTools3DEvents.ANNOTATION_RENDERED,
        () => {
          const ellipseAnnotations = getAnnotations(
            element,
            EllipticalRoiTool.toolName
          )
          // Can successfully add Length tool to annotationManager
          expect(ellipseAnnotations).toBeDefined()
          expect(ellipseAnnotations.length).toBe(1)

          const ellipseAnnotation = ellipseAnnotations[0]
          expect(ellipseAnnotation.metadata.referencedImageId).toBe(
            imageId1.split(':')[1]
          )

          expect(ellipseAnnotation.metadata.toolName).toBe(
            EllipticalRoiTool.toolName
          )
          expect(ellipseAnnotation.invalidated).toBe(false)

          const data = ellipseAnnotation.data.cachedStats
          const targets = Array.from(Object.keys(data))
          expect(targets.length).toBe(1)

          // the rectangle is drawn on the strip
          expect(data[targets[0]].mean).toBe(255)

          removeAnnotation(element, ellipseAnnotation.annotationUID)
          done()
        }
      )
    }

    element.addEventListener(EVENTS.IMAGE_RENDERED, () => {
      // Since ellipse draws from center to out, we are picking a very center
      // point in the image  (strip is 255 from 10-15 in X and from 0-64 in Y)
      const index1 = [12, 30, 0]
      const index2 = [14, 40, 0]

      const { imageData } = vp.getImageData()

      const {
        pageX: pageX1,
        pageY: pageY1,
        clientX: clientX1,
        clientY: clientY1,
        worldCoord: worldCoord1,
      } = createNormalizedMouseEvent(imageData, index1, element, vp)

      const {
        pageX: pageX2,
        pageY: pageY2,
        clientX: clientX2,
        clientY: clientY2,
        worldCoord: worldCoord2,
      } = createNormalizedMouseEvent(imageData, index2, element, vp)

      // Mouse Down
      let evt = new MouseEvent('mousedown', {
        target: element,
        buttons: 1,
        clientX: clientX1,
        clientY: clientY1,
        pageX: pageX1,
        pageY: pageY1,
      })
      element.dispatchEvent(evt)

      // Mouse move to put the end somewhere else
      evt = new MouseEvent('mousemove', {
        target: element,
        buttons: 1,
        clientX: clientX2,
        clientY: clientY2,
        pageX: pageX2,
        pageY: pageY2,
      })
      document.dispatchEvent(evt)

      // Mouse Up instantly after
      evt = new MouseEvent('mouseup')

      addEventListenerForAnnotationRendered()
      document.dispatchEvent(evt)
    })

    this.stackToolGroup.addViewports(this.renderingEngine.uid, vp.uid)

    try {
      vp.setStack([imageId1], 0)
      this.renderingEngine.render()
    } catch (e) {
      done.fail(e)
    }
  })

  it('Should cancel drawing of a EllipseTool annotation on a cpu stack viewport', function (done) {
    const element = createViewport(
      this.renderingEngine,
      VIEWPORT_TYPE.STACK,
      512,
      128
    )
    this.DOMElements.push(element)

    const imageId1 = 'fakeImageLoader:imageURI_64_64_10_5_1_1_0'
    const vp = this.renderingEngine.getViewport(viewportUID)

    let p1, p2

    element.addEventListener(EVENTS.IMAGE_RENDERED, () => {
      // Since ellipse draws from center to out, we are picking a very center
      // point in the image  (strip is 255 from 10-15 in X and from 0-64 in Y)
      const index1 = [12, 30, 0]
      const index2 = [14, 40, 0]

      const { imageData } = vp.getImageData()

      const {
        pageX: pageX1,
        pageY: pageY1,
        clientX: clientX1,
        clientY: clientY1,
        worldCoord: worldCoord1,
      } = createNormalizedMouseEvent(imageData, index1, element, vp)

      const {
        pageX: pageX2,
        pageY: pageY2,
        clientX: clientX2,
        clientY: clientY2,
        worldCoord: worldCoord2,
      } = createNormalizedMouseEvent(imageData, index2, element, vp)

      // Mouse Down
      let evt = new MouseEvent('mousedown', {
        target: element,
        buttons: 1,
        clientX: clientX1,
        clientY: clientY1,
        pageX: pageX1,
        pageY: pageY1,
      })
      element.dispatchEvent(evt)

      // Mouse move to put the end somewhere else
      evt = new MouseEvent('mousemove', {
        target: element,
        buttons: 1,
        clientX: clientX2,
        clientY: clientY2,
        pageX: pageX2,
        pageY: pageY2,
      })
      document.dispatchEvent(evt)

      // Cancel the drawing
      let e = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Esc',
        char: 'Esc',
      })
      element.dispatchEvent(e)

      e = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
      })
      element.dispatchEvent(e)
    })

    const cancelToolDrawing = () => {
      const canceledDataUID = cancelActiveManipulations(element)
      expect(canceledDataUID).toBeDefined()

      setTimeout(() => {
        const ellipseAnnotations = getAnnotations(
          element,
          EllipticalRoiTool.toolName
        )
        // Can successfully add Length tool to annotationManager
        expect(ellipseAnnotations).toBeDefined()
        expect(ellipseAnnotations.length).toBe(1)

        const ellipseAnnotation = ellipseAnnotations[0]
        expect(ellipseAnnotation.metadata.referencedImageId).toBe(
          imageId1.split(':')[1]
        )

        expect(ellipseAnnotation.metadata.toolName).toBe(
          EllipticalRoiTool.toolName
        )
        expect(ellipseAnnotation.invalidated).toBe(false)
        expect(ellipseAnnotation.highlighted).toBe(false)

        const data = ellipseAnnotation.data.cachedStats
        const targets = Array.from(Object.keys(data))
        expect(targets.length).toBe(1)

        // the rectangle is drawn on the strip
        expect(data[targets[0]].mean).toBe(255)

        removeAnnotation(element, ellipseAnnotation.annotationUID)
        done()
      }, 100)
    }

    this.stackToolGroup.addViewports(this.renderingEngine.uid, vp.uid)

    element.addEventListener(
      CornerstoneTools3DEvents.KEY_DOWN,
      cancelToolDrawing
    )

    try {
      vp.setStack([imageId1], 0)
      this.renderingEngine.render()
    } catch (e) {
      done.fail(e)
    }
  })
})
