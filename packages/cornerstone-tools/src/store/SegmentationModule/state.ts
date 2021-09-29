import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction'
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction'
import { ISegmentationConfig } from './segmentationConfig'

type LabelmapState = {
  volumeUID: string
  activeSegmentIndex: number
  segmentsHidden: number[]
  colorLUTIndex: number
  cfun: vtkColorTransferFunction
  ofun: vtkPiecewiseFunction
  labelmapConfig: Partial<ISegmentationConfig>
}

export type ViewportSegmentationState = {
  activeLabelmapIndex: number
  labelmaps: LabelmapState[]
}

// [[0,0,0,0], [200,200,200,200], ....]
type ColorLUT = Array<[number, number, number, number]>

export interface SegmentationState {
  volumeViewports: { [key: string]: ViewportSegmentationState }
  colorLutTables: Array<ColorLUT>
}

const state: SegmentationState = {
  colorLutTables: [
    //[
    // ColorLUTTable-0
    // [0, 0, 0, 0],
    // [255, 0, 0, 255],
    // [0, 255, 0, 255],
    // [0, 0, 255, 255],
    // ...... ,
    //],
  ],
  volumeViewports: {},
  // volumeViewports: {
  //   axialCT: {
  //     activeLabelmapIndex: 0,
  //     labelmaps: [
  //       {
  //         volumeUID: 'seg1',
  //         activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //         segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //       },
  //     ],
  //   },
  //   sagittalCT: {
  //     activeLabelmapIndex: 1,
  //     labelmaps: [
  //       {
  //         volumeUID: 'seg1',
  //         activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //         segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //       },
  //       {
  //         volumeUID: 'seg2',
  //         activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //         segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //       },
  //     ],
  //   },
  //   coronalCT: {
  //     activeLabelmapIndex: 0,
  //     labelmaps: [
  //       {
  //         volumeUID: 'seg1',
  //         activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //         segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //       },
  //       {
  //         volumeUID: 'seg2',
  //         activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //         segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //       },
  //     ],
  //   },
  // },
  // stackViewports: {
  //   stackUltrasound: {
  //     imageId1: {
  //       activeLabelmapIndex: 0,
  //       labelmaps: [
  //         {
  //           volumeUID: 'seg1',
  //           activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //           segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //         },
  //         {
  //           volumeUID: 'seg2',
  //           activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //           segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //         },
  //       ],
  //     },
  //     imageId2: {
  //       activeLabelmapIndex: 0,
  //       labelmaps: [
  //         {
  //           volumeUID: 'seg1',
  //           activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //           segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //         },
  //         {
  //           volumeUID: 'seg2',
  //           activeSegmentIndex: 1,
  //         colorLUTIndex: 0,
  //         cfun: new cfun
  //         ofun: new ofun
  //           segmentsHidden: [],
  //         labelmapConfig: ISegmentationConfig
  //         },
  //       ],
  //     },
  //   },
  // },
}

window.state = state
export default state
