import * as cornerstone3D from '../../cornerstone-render/src/index'
import * as csTools3d from '../src/index'

const {
  cache,
  RenderingEngine,
  Enums,
  utilities,
  metaData,
  volumeLoader,
  imageLoader,
} = cornerstone3D

const { unregisterAllImageLoaders } = imageLoader
const { registerVolumeLoader } = volumeLoader
const { VIEWPORT_TYPE, ORIENTATION } = Enums

const { ProbeTool, LengthTool, ToolGroupManager, ToolBindings } = csTools3d
const { fakeMetaDataProvider, fakeVolumeLoader } = utilities.testUtils

const renderingEngineUID = utilities.uuidv4()

const viewportUID1 = 'VIEWPORT1'
const viewportUID2 = 'VIEWPORT2'

function createViewports(width, height) {
  const element1 = document.createElement('div')

  element1.style.width = `${width}px`
  element1.style.height = `${height}px`
  document.body.appendChild(element1)

  const element2 = document.createElement('div')

  element2.style.width = `${width}px`
  element2.style.height = `${height}px`
  document.body.appendChild(element2)

  return [element1, element2]
}

describe('ToolGroup Manager: ', () => {
  beforeAll(() => {
    cornerstone3D.setUseCPURenderingOnlyForDebugOrTests(false)
  })

  describe('ToolGroup Manager: ', () => {
    beforeEach(function () {
      csTools3d.init()
      csTools3d.addTool(ProbeTool)
      cache.purgeCache()
      this.DOMElements = []

      this.toolGroup = ToolGroupManager.createToolGroup('volume1')
      this.toolGroup.addTool(ProbeTool.toolName)
      this.toolGroup.setToolActive(ProbeTool.toolName, {
        bindings: [
          {
            mouseButton: ToolBindings.Mouse.Primary,
          },
        ],
      })
      this.renderingEngine = new RenderingEngine(renderingEngineUID)
      registerVolumeLoader('fakeVolumeLoader', fakeVolumeLoader)
      metaData.addProvider(fakeMetaDataProvider, 10000)
    })

    afterEach(function () {
      // Destroy synchronizer manager to test it first since csTools3D also destroy
      // synchronizers
      ToolGroupManager.destroy()
      csTools3d.destroy()
      cache.purgeCache()
      this.renderingEngine.destroy()
      metaData.removeProvider(fakeMetaDataProvider)
      unregisterAllImageLoaders()
      this.DOMElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    })

    it('Should successfully creates tool groups', function () {
      const [element1, element2] = createViewports(512, 128)
      this.DOMElements.push(element1)
      this.DOMElements.push(element2)

      this.renderingEngine.setViewports([
        {
          viewportUID: viewportUID1,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element1,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
        {
          viewportUID: viewportUID2,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element2,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
      ])

      this.toolGroup.addViewport(viewportUID1, this.renderingEngine.uid)

      const tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')
      expect(tg).toBeDefined()
    })
  })

  describe('ToolGroup Manager: ', () => {
    beforeEach(function () {
      csTools3d.init()
      csTools3d.addTool(ProbeTool)
      cache.purgeCache()
      this.DOMElements = []

      this.toolGroup = ToolGroupManager.createToolGroup('volume1')
      this.toolGroup.addTool(ProbeTool.toolName)
      this.toolGroup.setToolActive(ProbeTool.toolName, {
        bindings: [
          {
            mouseButton: ToolBindings.Mouse.Primary,
          },
        ],
      })
      this.renderingEngine = new RenderingEngine(renderingEngineUID)
      registerVolumeLoader('fakeVolumeLoader', fakeVolumeLoader)
      metaData.addProvider(fakeMetaDataProvider, 10000)
    })

    afterEach(function () {
      // Destroy synchronizer manager to test it first since csTools3D also destroy
      // synchronizers
      ToolGroupManager.destroyToolGroupByToolGroupUID('volume1')
      csTools3d.destroy()
      cache.purgeCache()
      this.renderingEngine.destroy()
      metaData.removeProvider(fakeMetaDataProvider)
      unregisterAllImageLoaders()
      this.DOMElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    })

    it('Should successfully create toolGroup and get tool instances', function () {
      const [element1, element2] = createViewports(512, 128)
      this.DOMElements.push(element1)
      this.DOMElements.push(element2)

      this.renderingEngine.setViewports([
        {
          viewportUID: viewportUID1,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element1,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
        {
          viewportUID: viewportUID2,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element2,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
      ])

      this.toolGroup.addViewport(viewportUID1, this.renderingEngine.uid)

      const tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')
      expect(tg).toBeDefined()

      const tg2 = ToolGroupManager.getToolGroup(
        viewportUID1,
        renderingEngineUID
      )
      expect(tg2).toBeDefined()
      expect(tg).toBe(tg2)

      const tg3 = ToolGroupManager.createToolGroup('volume1')
      expect(tg3).toBeUndefined()

      const instance2 = tg.getToolInstance('probe')
      expect(instance2).toBeUndefined()
    })

    it('Should successfully Use toolGroup manager API', function () {
      const [element1, element2] = createViewports(512, 128)
      this.DOMElements.push(element1)
      this.DOMElements.push(element2)

      this.renderingEngine.setViewports([
        {
          viewportUID: viewportUID1,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element1,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
        {
          viewportUID: viewportUID2,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element2,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
      ])

      // Remove viewports
      let tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')

      tg.addViewport(viewportUID1, this.renderingEngine.uid)
      expect(tg.viewportsInfo.length).toBe(1)

      tg.removeViewports(renderingEngineUID)

      tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')
      expect(tg.viewportsInfo.length).toBe(0)

      //
      tg.addViewport(viewportUID1, this.renderingEngine.uid)
      tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')
      expect(tg.viewportsInfo.length).toBe(1)

      tg.removeViewports(renderingEngineUID, viewportUID2)
      expect(tg.viewportsInfo.length).toBe(1)
    })

    it('Should successfully make a tool enabled/disabled/active/passive', function () {
      const [element1, element2] = createViewports(512, 128)
      this.DOMElements.push(element1)
      this.DOMElements.push(element2)

      this.renderingEngine.setViewports([
        {
          viewportUID: viewportUID1,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element1,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
        {
          viewportUID: viewportUID2,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element2,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
      ])

      this.toolGroup.addViewport(viewportUID1, this.renderingEngine.uid)

      // Remove viewports
      let tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')
      expect(tg.getToolInstance(ProbeTool.toolName).mode).toBe('Active')
      expect(tg.getToolInstance(LengthTool.toolName)).toBeUndefined()

      tg.setToolPassive(ProbeTool.toolName)
      expect(tg.getToolInstance(ProbeTool.toolName).mode).toBe('Passive')
    })

    it('Should successfully setTool status', function () {
      const [element1, element2] = createViewports(512, 128)
      this.DOMElements.push(element1)
      this.DOMElements.push(element2)

      this.renderingEngine.setViewports([
        {
          viewportUID: viewportUID1,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element1,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
        {
          viewportUID: viewportUID2,
          type: VIEWPORT_TYPE.ORTHOGRAPHIC,
          element: element2,
          defaultOptions: {
            background: [1, 0, 1], // pinkish background
            orientation: ORIENTATION.AXIAL,
          },
        },
      ])

      this.toolGroup.addViewport(viewportUID1, this.renderingEngine.uid)

      // Remove viewports
      let tg = ToolGroupManager.getToolGroupByToolGroupUID('volume1')
      tg.setToolActive()
      tg.setToolPassive()
      tg.setToolEnabled()
      tg.setToolDisabled()

      expect(tg.getToolInstance(ProbeTool.toolName).mode).toBe('Active')

      csTools3d.addTool(LengthTool)
      tg.addTool(LengthTool.toolName)
      tg.setToolEnabled(LengthTool.toolName)
      expect(tg.getToolInstance(LengthTool.toolName).mode).toBe('Enabled')

      tg.setToolDisabled(LengthTool.toolName)
      expect(tg.getToolInstance(LengthTool.toolName).mode).toBe('Disabled')
    })
  })
})
