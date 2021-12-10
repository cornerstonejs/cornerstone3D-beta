import {
  ICache,
  IImage,
  IImageVolume,
  ImageLoadObject,
  VolumeLoadObject,
} from '../types'
import { triggerEvent, imageIdToURI } from '../utilities'
import eventTarget from '../eventTarget'
import EVENTS from '../enums/events'
import ERROR_CODES from '../enums/errorCodes'

const MAX_CACHE_SIZE_1GB = 1073741824

interface CachedImage {
  image?: IImage
  imageId: string
  imageLoadObject: ImageLoadObject
  loaded: boolean
  sharedCacheKey?: string
  timeStamp: number
  sizeInBytes: number
}

interface CachedVolume {
  volume?: IImageVolume
  volumeId: string
  volumeLoadObject: VolumeLoadObject
  loaded: boolean
  timeStamp: number
  sizeInBytes: number
}

/**
 * This module deals with Caching of images and volumes
 * The cache has two main components: a volatile portion for images and a
 * non-volatile portion for volumes. Individual 2D images are volatile and
 * will be replaced by new images hitting the cache. When you allocate volumes,
 * these are non-volatile and reserve a block of memory from the cache.
 * Volumes must be released manually.
 * We will have a shared block of memory allocated for the entire cache, e.g. 1GB
 * which will be shared for images and volumes.
 *
 * **When a new image is added:**
 * We check if there is enough unallocated + volatile space for the single image
 *
 * if so
 * - We allocate the image in image cache, and if necessary oldest images
 * are decached to match the maximumCacheSize criteria
 * - If a volume contains that imageId, copy it over using TypedArray's set method.
 * If no volumes contain the imageId, the image is fetched by image loaders
 *
 * If not (cache is mostly/completely full with volumes)
 * - throw that the cache does not have enough working space to allocate the image
 *
 *
 * **When a new volume is added:**
 * Check if there is enough unallocated + volatile space to allocate the volume:
 *
 * If so:
 * - Decache oldest images which won't be included in this volume until
 * we have enough free space for the volume
 * - If not enough space from previous space, decache images that will be included
 * in the volume until we have enough free space (These will need to be re-fetched,
 * but we must do this not to straddle over the given memory limit, even for a
 * short time, as this may crash the app)
 * - At this point, if any of the frames (indexed by imageId) are present in the volatile
 * image cache, copy these over to the volume now
 *
 * If not (cache is mostly/completely full with volumes),
 * - throw that the cache does not have enough working space to allocate the volume.
 *
 */
class Cache implements ICache {
  private readonly _imageCache: Map<string, CachedImage> // volatile space
  private readonly _volumeCache: Map<string, CachedVolume> // non-volatile space
  private _imageCacheSize: number
  private _volumeCacheSize: number
  private _maxCacheSize: number

  constructor() {
    this._imageCache = new Map()
    this._volumeCache = new Map()
    this._imageCacheSize = 0
    this._volumeCacheSize = 0
    this._maxCacheSize = MAX_CACHE_SIZE_1GB // Default 1GB
  }

  /**
   * Set the maximum cache Size
   *
   * Maximum cache size should be set before adding the data; otherwise, it
   * will throw an error.
   *
   * @param {number} newMaxCacheSize new maximum cache size
   *
   * @returns {void}
   */
  public setMaxCacheSize = (newMaxCacheSize: number): void => {
    if (!newMaxCacheSize || typeof newMaxCacheSize !== 'number') {
      const errorMessage = `New max cacheSize ${this._maxCacheSize} should be defined and should be a number.`
      throw new Error(errorMessage)
    }

    this._maxCacheSize = newMaxCacheSize
  }

  /**
   * Checks if there is enough space in the cache for requested byte size
   *
   * It throws error, if the sum of volatile (image) cache and unallocated cache
   * is less than the requested byteLength
   *
   * @param {number} byteLength byte length of requested byte size
   *
   * @returns {boolean}
   */
  public isCacheable = (byteLength: number): boolean => {
    const unallocatedSpace = this.getBytesAvailable()
    const imageCacheSize = this._imageCacheSize
    const availableSpace = unallocatedSpace + imageCacheSize

    return availableSpace > byteLength
  }

  /**
   * Returns maximum CacheSize allowed
   *
   * @returns {number} maximum allowed cache size
   */
  public getMaxCacheSize = (): number => this._maxCacheSize

  /**
   * Returns current size of the cache
   *
   * @returns {number} current size of the cache
   */
  public getCacheSize = (): number =>
    this._imageCacheSize + this._volumeCacheSize

  /**
   * Returns the unallocated size of the cache
   *
   */
  public getBytesAvailable(): number {
    return this.getMaxCacheSize() - this.getCacheSize()
  }

  /**
   * Deletes the imageId from the image cache
   *
   * @param {string} imageId imageId
   *
   * @returns {void}
   */
  private _decacheImage = (imageId: string) => {
    const { imageLoadObject } = this._imageCache.get(imageId)

    // Cancel any in-progress loading
    if (imageLoadObject.cancel) {
      imageLoadObject.cancel()
    }

    if (imageLoadObject.decache) {
      imageLoadObject.decache()
    }

    this._imageCache.delete(imageId)
  }

  /**
   * Deletes the volumeId from the volume cache
   *
   * @param {string} volumeId volumeId
   *
   * @returns {void}
   */
  private _decacheVolume = (volumeId: string) => {
    const cachedVolume = this._volumeCache.get(volumeId)
    const { volumeLoadObject } = cachedVolume

    // Cancel any in-progress loading
    if (volumeLoadObject.cancel) {
      volumeLoadObject.cancel()
    }

    if (volumeLoadObject.decache) {
      volumeLoadObject.decache()
    }

    // Clear texture memory (it will probably only be released at garbage collection of the DOM element, but might as well try)
    // TODO We need to actually check if this particular scalar is used.
    // TODO: Put this in the volume loader's decache function?
    /*if (volume && volume.vtkOpenGLTexture) {
      volume.vtkOpenGLTexture.releaseGraphicsResources()
    }*/

    this._volumeCache.delete(volumeId)
  }

  /**
   * Deletes all the images and volumes in the cache
   *
   * Relevant events are fired for each decached image (IMAGE_CACHE_IMAGE_REMOVED) and
   * the decached volume (IMAGE_CACHE_VOLUME_REMOVED).
   *
   *
   * @param {number} numBytes number of bytes
   *
   * @returns {number} available number of bytes
   */
  public purgeCache = () => {
    const imageIterator = this._imageCache.keys()

    /* eslint-disable no-constant-condition */
    while (true) {
      const { value: imageId, done } = imageIterator.next()

      if (done) {
        break
      }

      this.removeImageLoadObject(imageId)

      triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_IMAGE_REMOVED, { imageId })
    }

    const volumeIterator = this._volumeCache.keys()

    /* eslint-disable no-constant-condition */
    while (true) {
      const { value: volumeId, done } = volumeIterator.next()

      if (done) {
        break
      }

      this.removeVolumeLoadObject(volumeId)

      triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_VOLUME_REMOVED, { volumeId })
    }
  }

  /**
   * Purges the cache if necessary based on the requested number of bytes
   *
   * 1) it sorts the volatile (image) cache based on the most recent used images
   * and starts purging from the oldest ones.
   * Note: for a volume, if the volume-related image Ids is provided, it starts
   * by purging the none-related image Ids (those that are not related to the
   * current volume)
   * 2) For a volume, if we purge all images that won't be included in this volume and still
   * don't have enough unallocated space, purge images that will be included
   * in this volume until we have enough space. These will need to be
   * re-fetched, but we must do this not to straddle over the given memory
   * limit, even for a short time, as this may crash the application.
   *
   * @params {number} numBytes - Number of bytes for the image/volume that is
   * going to be stored inside the cache
   * @params {Array} [volumeImageIds] list of imageIds that correspond to the
   * volume whose numberOfBytes we want to store in the cache.
   * @returns {number | undefined} bytesAvailable or undefined in purging cache
   * does not successfully make enough space for the requested number of bytes
   */
  public decacheIfNecessaryUntilBytesAvailable(
    numBytes: number,
    volumeImageIds?: Array<string>
  ): number | undefined {
    let bytesAvailable = this.getBytesAvailable()

    // If max cache size has not been exceeded, do nothing
    if (bytesAvailable >= numBytes) {
      return bytesAvailable
    }

    let cachedImages = Array.from(this._imageCache.values())

    // Cache size has been exceeded, create list of images sorted by timeStamp
    // So we can purge the least recently used image
    function compare(a, b) {
      if (a.timeStamp > b.timeStamp) {
        return 1
      }
      if (a.timeStamp < b.timeStamp) {
        return -1
      }

      return 0
    }

    cachedImages.sort(compare)
    let cachedImageIds = cachedImages.map((im) => im.imageId)

    let imageIdsToPurge = cachedImageIds

    // if we are making space for a volume, we start by purging the imageIds
    // that are not related to the volume
    if (volumeImageIds) {
      imageIdsToPurge = cachedImageIds.filter(
        (id) => !volumeImageIds.includes(id)
      )
    }

    // Remove images (that are not related to the volume) from volatile cache
    // until the requested number of bytes become available
    for (const imageId of imageIdsToPurge) {
      this.removeImageLoadObject(imageId)

      triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_IMAGE_REMOVED, { imageId })

      bytesAvailable = this.getBytesAvailable()
      if (bytesAvailable >= numBytes) {
        return bytesAvailable
      }
    }

    // Remove the imageIds (both volume related and not related)
    cachedImages = Array.from(this._imageCache.values())
    cachedImageIds = cachedImages.map((im) => im.imageId)

    // Remove volume-image Ids from volatile cache until the requested number of bytes
    // become available
    for (const imageId of cachedImageIds) {
      this.removeImageLoadObject(imageId)

      triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_IMAGE_REMOVED, { imageId })

      bytesAvailable = this.getBytesAvailable()
      if (bytesAvailable >= numBytes) {
        return bytesAvailable
      }
    }

    // Technically we should not reach here, since isCacheable will throw an
    // error if unallocated + volatile (image) cache cannot fit the upcoming
    // number of bytes
  }

  /**
   * Puts a new image load object into the cache
   *
   * First, it creates a CachedImage object and put it inside the imageCache for
   * the imageId. After the imageLoadObject promise resolves to an image,
   * it: 1) adds the image into the correct CachedImage object 2) increments the
   * cache size, 3) triggers IMAGE_CACHE_IMAGE_ADDED  4) Purge the cache if
   * necessary -- if the cache size is greater than the maximum cache size, it
   * iterates over the imageCache and decache them one by one until the cache
   * size becomes less than the maximum allowed cache size
   *
   * @param {string} imageId ImageId for the image
   * @param {Object} imageLoadObject The object that is loading or loaded the image
   * @returns {void}
   */
  public putImageLoadObject(
    imageId: string,
    imageLoadObject: ImageLoadObject
  ): Promise<any> {
    if (imageId === undefined) {
      throw new Error('putImageLoadObject: imageId must not be undefined')
    }

    if (imageLoadObject.promise === undefined) {
      throw new Error(
        'putImageLoadObject: imageLoadObject.promise must not be undefined'
      )
    }

    if (this._imageCache.has(imageId)) {
      throw new Error('putImageLoadObject: imageId already in cache')
    }

    if (
      imageLoadObject.cancel &&
      typeof imageLoadObject.cancel !== 'function'
    ) {
      throw new Error(
        'putImageLoadObject: imageLoadObject.cancel must be a function'
      )
    }

    const cachedImage: CachedImage = {
      loaded: false,
      imageId,
      sharedCacheKey: undefined, // The sharedCacheKey for this imageId.  undefined by default
      imageLoadObject,
      timeStamp: Date.now(),
      sizeInBytes: 0,
    }

    this._imageCache.set(imageId, cachedImage)

    return imageLoadObject.promise
      .then((image: IImage) => {
        if (!this._imageCache.get(imageId)) {
          // If the image has been purged before being loaded, we stop here.
          console.warn(
            'The image was purged from the cache before it completed loading.'
          )
          return
        }

        if (image.sizeInBytes === undefined) {
          throw new Error(
            'putImageLoadObject: image.sizeInBytes must not be undefined'
          )
        }
        if (image.sizeInBytes.toFixed === undefined) {
          throw new Error(
            'putImageLoadObject: image.sizeInBytes is not a number'
          )
        }

        // check if there is enough space in unallocated + image Cache
        if (!this.isCacheable(image.sizeInBytes)) {
          throw new Error(ERROR_CODES.CACHE_SIZE_EXCEEDED)
        }

        // if there is, decache if necessary
        this.decacheIfNecessaryUntilBytesAvailable(image.sizeInBytes)

        cachedImage.loaded = true
        cachedImage.image = image
        cachedImage.sizeInBytes = image.sizeInBytes
        this._incrementImageCacheSize(cachedImage.sizeInBytes)

        const eventDetails = {
          image: cachedImage,
        }

        triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_IMAGE_ADDED, eventDetails)

        cachedImage.sharedCacheKey = image.sharedCacheKey
      })
      .catch((error) => {
        // console.warn(error)
        this._imageCache.delete(imageId)
        throw error
      })
  }

  /**
   * Returns the object that is loading a given imageId
   *
   * @param {string} imageId Image ID
   * @returns {void}
   */
  public getImageLoadObject(imageId: string): ImageLoadObject {
    if (imageId === undefined) {
      throw new Error('getImageLoadObject: imageId must not be undefined')
    }
    const cachedImage = this._imageCache.get(imageId)

    if (cachedImage === undefined) {
      return
    }

    // Bump time stamp for cached image
    cachedImage.timeStamp = Date.now()

    return cachedImage.imageLoadObject
  }

  /**
   * Returns the volume that contains the requested imageId. It will check the
   * imageIds inside the volume to find a match.
   *
   * @param {string} imageId Image ID
   * @returns {{ImageVolume, string}|undefined} {volume, imageIdIndex}
   */
  public getVolumeContainingImageId(imageId: string): {
    volume: IImageVolume
    imageIdIndex: number
  } {
    const volumeIds = Array.from(this._volumeCache.keys())
    const imageIdToUse = imageIdToURI(imageId)

    for (const volumeId of volumeIds) {
      const cachedVolume = this._volumeCache.get(volumeId)

      if (!cachedVolume.volume) {
        return
      }

      let { imageIds } = cachedVolume.volume

      if (!imageIds || imageIds.length === 0) {
        continue
      }

      imageIds = imageIds.map((id) => imageIdToURI(id))

      const imageIdIndex = imageIds.indexOf(imageIdToUse)
      if (imageIdIndex > -1) {
        return { volume: cachedVolume.volume, imageIdIndex }
      }
    }
  }

  /**
   * Returns the cached image from the imageCache for the requested imageId.
   * It first strips the imageId to remove the data loading scheme.
   *
   * @param {string} imageId Image ID
   * @returns {CachedImage} cached image
   */
  public getCachedImageBasedOnImageURI(imageId: string): any {
    const imageIdToUse = imageIdToURI(imageId)
    const imageIdsInCache = Array.from(this._imageCache.keys())

    const foundImageId = imageIdsInCache.find(
      (id) => id.indexOf(imageIdToUse) !== -1
    )

    return this._imageCache.get(foundImageId)
  }
  /**
   * Puts a new image load object into the cache
   *
   * First, it creates a CachedVolume object and put it inside the volumeCache for
   * the volumeId. After the volumeLoadObject promise resolves to a volume,
   * it: 1) adds the volume into the correct CachedVolume object inside volumeCache
   * 2) increments the cache size, 3) triggers IMAGE_CACHE_VOLUME_ADDED  4) Purge
   * the cache if necessary -- if the cache size is greater than the maximum cache size, it
   * iterates over the imageCache (not volumeCache) and decache them one by one
   * until the cache size becomes less than the maximum allowed cache size
   *
   * @param {string} volumeId volumeId of the volume
   * @param {Object} volumeLoadObject The object that is loading or loaded the volume
   * @returns {void}
   */
  public putVolumeLoadObject(
    volumeId: string,
    volumeLoadObject: VolumeLoadObject
  ): Promise<any> {
    if (volumeId === undefined) {
      throw new Error('putVolumeLoadObject: volumeId must not be undefined')
    }
    if (volumeLoadObject.promise === undefined) {
      throw new Error(
        'putVolumeLoadObject: volumeLoadObject.promise must not be undefined'
      )
    }
    if (this._volumeCache.has(volumeId)) {
      throw new Error(
        `putVolumeLoadObject: volumeId:${volumeId} already in cache`
      )
    }
    if (
      volumeLoadObject.cancel &&
      typeof volumeLoadObject.cancel !== 'function'
    ) {
      throw new Error(
        'putVolumeLoadObject: volumeLoadObject.cancel must be a function'
      )
    }

    // todo: @Erik there are two loaded flags, one inside cachedVolume and the other
    // inside the volume.loadStatus.loaded, the actual all pixelData loaded is the
    // loadStatus one. This causes confusion
    const cachedVolume: CachedVolume = {
      loaded: false,
      volumeId,
      volumeLoadObject,
      timeStamp: Date.now(),
      sizeInBytes: 0,
    }

    this._volumeCache.set(volumeId, cachedVolume)

    return volumeLoadObject.promise
      .then((volume: IImageVolume) => {
        if (!this._volumeCache.get(volumeId)) {
          // If the image has been purged before being loaded, we stop here.
          console.warn(
            'The image was purged from the cache before it completed loading.'
          )
          return
        }

        if (volume.sizeInBytes === undefined) {
          throw new Error(
            'putVolumeLoadObject: volume.sizeInBytes must not be undefined'
          )
        }
        if (volume.sizeInBytes.toFixed === undefined) {
          throw new Error(
            'putVolumeLoadObject: volume.sizeInBytes is not a number'
          )
        }

        // this.isCacheable is called at the volume loader, before requesting
        // the images of the volume

        this.decacheIfNecessaryUntilBytesAvailable(
          volume.sizeInBytes,
          // @ts-ignore: // todo ImageVolume does not have imageIds
          volume.imageIds
        )

        // cachedVolume.loaded = true
        cachedVolume.volume = volume
        cachedVolume.sizeInBytes = volume.sizeInBytes
        this._incrementVolumeCacheSize(cachedVolume.sizeInBytes)

        const eventDetails = {
          volume: cachedVolume,
          volumeId,
        }

        triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_VOLUME_ADDED, eventDetails)
      })
      .catch((error) => {
        this._volumeCache.delete(volumeId)
        throw error
      })
  }

  /**
   * Returns the object that is loading a given volumeId
   *
   * @param {string} volumeId Volume ID
   * @returns {void}
   */
  public getVolumeLoadObject = (volumeId: string): VolumeLoadObject => {
    if (volumeId === undefined) {
      throw new Error('getVolumeLoadObject: volumeId must not be undefined')
    }
    const cachedVolume = this._volumeCache.get(volumeId)

    if (cachedVolume === undefined) {
      return
    }

    // Bump time stamp for cached volume (not used for anything for now)
    cachedVolume.timeStamp = Date.now()

    return cachedVolume.volumeLoadObject
  }

  /**
   * Returns the volume associated with the volumeId
   *
   * @param {string} volumeId Volume ID
   * @returns {void}
   */
  public getVolume = (volumeId: string): IImageVolume => {
    if (volumeId === undefined) {
      throw new Error('getVolume: volumeId must not be undefined')
    }
    const cachedVolume = this._volumeCache.get(volumeId)

    if (cachedVolume === undefined) {
      return
    }

    // Bump time stamp for cached volume (not used for anything for now)
    cachedVolume.timeStamp = Date.now()

    return cachedVolume.volume
  }

  /**
   * Removes the image loader associated with a given Id from the cache
   *
   * It increases the cache size after removing the image.
   *
   * @param {string} imageId Image ID
   * @returns {void}
   */
  public removeImageLoadObject = (imageId: string): void => {
    if (imageId === undefined) {
      throw new Error('removeImageLoadObject: imageId must not be undefined')
    }
    const cachedImage = this._imageCache.get(imageId)

    if (cachedImage === undefined) {
      throw new Error(
        'removeImageLoadObject: imageId was not present in imageCache'
      )
    }

    this._incrementImageCacheSize(-cachedImage.sizeInBytes)

    const eventDetails = {
      image: cachedImage,
      imageId,
    }

    triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_IMAGE_REMOVED, eventDetails)
    this._decacheImage(imageId)
  }

  /**
   * Removes the volume loader associated with a given Id from the cache
   *
   * It increases the cache size after removing the image.
   *
   * @param {string} imageId Image ID
   * @returns {void}
   */
  public removeVolumeLoadObject = (volumeId: string): void => {
    if (volumeId === undefined) {
      throw new Error('removeVolumeLoadObject: volumeId must not be undefined')
    }
    const cachedVolume = this._volumeCache.get(volumeId)

    if (cachedVolume === undefined) {
      throw new Error(
        'removeVolumeLoadObject: volumeId was not present in volumeCache'
      )
    }

    this._incrementVolumeCacheSize(-cachedVolume.sizeInBytes)

    const eventDetails = {
      volume: cachedVolume,
      volumeId,
    }

    triggerEvent(eventTarget, EVENTS.IMAGE_CACHE_VOLUME_REMOVED, eventDetails)
    this._decacheVolume(volumeId)
  }

  /**
   * Increases the image cache size with the provided increment
   *
   * @param {number} increment bytes length
   * @returns {void}
   */
  private _incrementImageCacheSize = (increment: number) => {
    this._imageCacheSize += increment
  }

  /**
   * Increases the cache size with the provided increment
   *
   * @param {number} increment bytes length
   * @returns {void}
   */
  private _incrementVolumeCacheSize = (increment: number) => {
    this._volumeCacheSize += increment
  }
}

const cache = new Cache()
export default cache
export { Cache } // for documentation
