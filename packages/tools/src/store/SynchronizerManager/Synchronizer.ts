import {
  getRenderingEngine,
  getEnabledElement,
  Enums,
  Types,
} from '@cornerstonejs/core'

export interface ISynchronizerEventHandler {
  (
    synchronizer: Synchronizer,
    sourceViewport: Types.IViewportId,
    targetViewport: Types.IViewportId,
    sourceEvent: any
  ): void
}

/**
 * Synchronizer is a class that listens to a specific event on a specific source
 * targets and fires a specific event on a specific target elements. Use cases
 * include: synchronizing a camera between two viewports, synchronizing a
 * windowLevel between various viewports.
 */
class Synchronizer {
  //
  private _enabled: boolean
  private _eventName: string
  private _eventHandler: ISynchronizerEventHandler
  private _ignoreFiredEvents: boolean
  private _sourceViewports: Array<Types.IViewportId>
  private _targetViewports: Array<Types.IViewportId>
  //
  public id: string

  constructor(
    synchronizerId: string,
    eventName: string,
    eventHandler: ISynchronizerEventHandler
  ) {
    this._enabled = true
    this._eventName = eventName
    this._eventHandler = eventHandler
    this._ignoreFiredEvents = false
    this._sourceViewports = []
    this._targetViewports = []

    //
    this.id = synchronizerId
  }

  /**
   * "Returns true if the synchronizer is disabled."
   * @returns A boolean value.
   */
  public isDisabled(): boolean {
    return !this._enabled || !this._hasSourceElements()
  }

  /**
   * Add a viewport to the list of targets and sources both.
   * @param viewportInfo - The viewportId and its renderingEngineUID to add to the list of targets and sources.
   */
  public add(viewportInfo: Types.IViewportId): void {
    this.addTarget(viewportInfo)
    this.addSource(viewportInfo)
  }

  /**
   * Add a viewport to the list of sources (source ONLY)
   * @param viewportInfo - The viewportId and its renderingEngineUID to add to the list of targets and sources.
   */
  public addSource(viewportInfo: Types.IViewportId): void {
    if (_containsViewport(this._sourceViewports, viewportInfo)) {
      return
    }

    const { renderingEngineUID, viewportId } = viewportInfo

    const { element } =
      getRenderingEngine(renderingEngineUID).getViewport(viewportId)

    // @ts-ignore
    element.addEventListener(this._eventName, this._onEvent.bind(this))
    this._updateDisableHandlers()

    this._sourceViewports.push(viewportInfo)
  }

  /**
   * Add a viewport to the list of viewports that will get the eventHandler
   * executed when the event is fired on the source viewport.
   * @param viewportInfo - The viewportId and its renderingEngineUID to add to the list of targets and sources.
   */
  public addTarget(viewportInfo: Types.IViewportId): void {
    if (_containsViewport(this._targetViewports, viewportInfo)) {
      return
    }

    this._targetViewports.push(viewportInfo)
    this._updateDisableHandlers()
  }

  /**
   * Get the list of source viewports (as {viewportId, renderingEngineUID} objects)
   * @returns An array of {viewportId, renderingEngineUID} objects.
   */
  public getSourceViewports(): Array<Types.IViewportId> {
    return this._sourceViewports
  }

  /**
   * Get the list of target viewports (as {viewportId, renderingEngineUID} objects)
   * @returns An array of {viewportId, renderingEngineUID} objects.
   */
  public getTargetViewports(): Array<Types.IViewportId> {
    return this._targetViewports
  }

  public destroy(): void {
    this._sourceViewports.forEach((s) => this.removeSource(s))
    this._targetViewports.forEach((t) => this.removeTarget(t))
  }

  /**
   * Remove the viewport from the list of targets and sources
   * @param viewportInfo - The viewport info including viewportId and renderingEngineUID.
   */
  public remove(viewportInfo: Types.IViewportId): void {
    this.removeTarget(viewportInfo)
    this.removeSource(viewportInfo)
  }

  /**
   * Remove the viewport from the list of source viewports
   * @param viewportInfo - The viewport info including viewportId and renderingEngineUID.
   */
  public removeSource(viewportInfo: Types.IViewportId): void {
    const index = _getViewportIndex(this._sourceViewports, viewportInfo)

    if (index === -1) {
      return
    }

    const element = _getViewportElement(viewportInfo)

    this._sourceViewports.splice(index, 1)
    // @ts-ignore
    element.removeEventListener(this._eventName, this._eventHandler)
    this._updateDisableHandlers()
  }

  /**
   * Remove the viewport from the list of viewports that are currently targeted by
   * this handler
   * @param viewportInfo - The viewport info including viewportId and renderingEngineUID.
   *
   */
  public removeTarget(viewportInfo: Types.IViewportId): void {
    const index = _getViewportIndex(this._targetViewports, viewportInfo)

    if (index === -1) {
      return
    }

    this._targetViewports.splice(index, 1)
    this._updateDisableHandlers()
  }

  public hasSourceViewport(
    renderingEngineUID: string,
    viewportId: string
  ): boolean {
    return _containsViewport(this._sourceViewports, {
      renderingEngineUID,
      viewportId,
    })
  }

  private fireEvent(sourceViewport: Types.IViewportId, sourceEvent: any): void {
    if (this.isDisabled() || this._ignoreFiredEvents) {
      return
    }

    this._ignoreFiredEvents = true
    try {
      for (let i = 0; i < this._targetViewports.length; i++) {
        const targetViewport = this._targetViewports[i]
        const targetIsSource =
          sourceViewport.viewportId === targetViewport.viewportId

        if (targetIsSource) {
          continue
        }

        this._eventHandler(this, sourceViewport, targetViewport, sourceEvent)
      }
    } catch (ex) {
      console.warn(`Synchronizer, for: ${this._eventName}`, ex)
    } finally {
      this._ignoreFiredEvents = false
    }
  }

  private _onEvent = (evt: any): void => {
    if (this._ignoreFiredEvents === true) {
      return
    }

    // If no target viewports, then return immediately, this is useful
    // when switching between layouts, when previous layout has disabled
    // its viewports, and the new layout has not yet enabled them.
    // Right now we don't "delete" the synchronizer if all source and targets
    // are removed, but we may want to do that in the future.
    if (!this._targetViewports.length) {
      return
    }

    const enabledElement = getEnabledElement(evt.currentTarget)

    if (!enabledElement) {
      return
    }

    const { renderingEngineUID, viewportId } = enabledElement

    this.fireEvent(
      {
        renderingEngineUID,
        viewportId,
      },
      evt
    )
  }

  private _hasSourceElements(): boolean {
    return this._sourceViewports.length !== 0
  }

  private _updateDisableHandlers(): void {
    const viewports = _getUniqueViewports(
      this._sourceViewports,
      this._targetViewports
    )
    const _remove = this.remove
    const disableHandler = (elementDisabledEvent) => {
      _remove(elementDisabledEvent.detail.element)
    }

    viewports.forEach(function (vUid) {
      const { element } = getRenderingEngine(
        vUid.renderingEngineUID
      ).getViewport(vUid.viewportId)

      element.removeEventListener(Enums.Events.ELEMENT_DISABLED, disableHandler)
      element.addEventListener(Enums.Events.ELEMENT_DISABLED, disableHandler)
    })
  }
}

function _getUniqueViewports(
  vp1: Array<Types.IViewportId>,
  vp2: Array<Types.IViewportId>
): Array<Types.IViewportId> {
  const unique = []

  const vps = vp1.concat(vp2)

  for (let i = 0; i < vps.length; i++) {
    const vp = vps[i]
    if (
      !unique.some(
        (u) =>
          vp.renderingEngineUID === u.renderingEngineUID &&
          vp.viewportId === u.viewportId
      )
    ) {
      unique.push(vp)
    }
  }

  return unique
}

function _getViewportIndex(
  arr: Array<Types.IViewportId>,
  vp: Types.IViewportId
): number {
  return arr.findIndex(
    (ar) =>
      vp.renderingEngineUID === ar.renderingEngineUID &&
      vp.viewportId === ar.viewportId
  )
}

function _containsViewport(
  arr: Array<Types.IViewportId>,
  vp: Types.IViewportId
) {
  return arr.some(
    (ar) =>
      ar.renderingEngineUID === vp.renderingEngineUID &&
      ar.viewportId === vp.viewportId
  )
}

function _getViewportElement(vp: Types.IViewportId): HTMLElement {
  const renderingEngine = getRenderingEngine(vp.renderingEngineUID)
  if (!renderingEngine) {
    throw new Error(`No RenderingEngine for UID: ${vp.renderingEngineUID}`)
  }

  return renderingEngine.getViewport(vp.viewportId).element
}

export default Synchronizer
