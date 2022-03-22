const CORNERSTONE_COLOR_LUT = [
  [0, 0, 0, 0],
  [221, 84, 84, 255],
  [77, 228, 121, 255],
  [166, 70, 235, 255],
  [189, 180, 116, 255],
  [109, 182, 196, 255],
  [204, 101, 157, 255],
  [123, 211, 94, 255],
  [93, 87, 218, 255],
  [225, 128, 80, 255],
  [73, 232, 172, 255],
  [181, 119, 186, 255],
  [176, 193, 112, 255],
  [105, 153, 200, 255],
  [208, 97, 120, 255],
  [90, 215, 101, 255],
  [135, 83, 222, 255],
  [229, 178, 76, 255],
  [122, 183, 181, 255],
  [190, 115, 171, 255],
  [149, 197, 108, 255],
  [100, 118, 205, 255],
  [212, 108, 93, 255],
  [86, 219, 141, 255],
  [183, 79, 226, 255],
  [233, 233, 72, 255],
  [118, 167, 187, 255],
  [194, 111, 146, 255],
  [116, 201, 104, 255],
  [115, 96, 209, 255],
  [216, 147, 89, 255],
  [82, 223, 188, 255],
  [230, 75, 224, 255],
  [163, 184, 121, 255],
  [114, 143, 191, 255],
  [198, 107, 114, 255],
  [99, 206, 122, 255],
  [153, 92, 213, 255],
  [220, 192, 85, 255],
  [78, 215, 227, 255],
  [234, 71, 173, 255],
  [141, 188, 117, 255],
  [110, 113, 195, 255],
  [202, 128, 103, 255],
  [95, 210, 157, 255],
  [195, 88, 217, 255],
  [206, 224, 81, 255],
  [74, 166, 231, 255],
  [185, 120, 139, 255],
  [113, 192, 113, 255],
  [133, 106, 199, 255],
  [207, 162, 98, 255],
  [91, 214, 198, 255],
  [221, 84, 198, 255],
  [159, 228, 77, 255],
  [70, 111, 235, 255],
  [189, 119, 116, 255],
  [109, 196, 138, 255],
  [165, 101, 204, 255],
  [211, 201, 94, 255],
  [87, 191, 218, 255],
  [225, 80, 153, 255],
  [106, 232, 73, 255],
  [124, 119, 186, 255],
  [193, 142, 112, 255],
  [105, 200, 168, 255],
  [203, 97, 208, 255],
  [184, 215, 90, 255],
  [83, 147, 222, 255],
  [229, 76, 101, 255],
  [122, 183, 130, 255],
  [146, 115, 190, 255],
  [197, 171, 108, 255],
  [100, 205, 205, 255],
  [212, 93, 177, 255],
  [141, 219, 86, 255],
  [79, 97, 226, 255],
  [233, 99, 72, 255],
  [118, 187, 150, 255],
  [173, 111, 194, 255],
  [197, 201, 104, 255],
  [96, 171, 209, 255],
  [216, 89, 137, 255],
  [94, 223, 82, 255],
  [107, 75, 230, 255],
  [184, 153, 121, 255],
  [114, 191, 175, 255],
  [198, 107, 191, 255],
  [166, 206, 99, 255],
  [92, 132, 213, 255],
  [220, 85, 91, 255],
  [78, 227, 115, 255],
  [159, 71, 234, 255],
  [188, 176, 117, 255],
  [110, 185, 195, 255],
  [202, 103, 161, 255],
  [129, 210, 95, 255],
  [88, 88, 217, 255],
  [224, 123, 81, 255],
  [74, 231, 166, 255],
  [177, 120, 185, 255],
  [179, 192, 113, 255],
  [106, 156, 199, 255],
  [207, 98, 125, 255],
  [91, 214, 96, 255],
  [130, 84, 221, 255],
  [228, 171, 77, 255],
  [70, 235, 221, 255],
  [189, 116, 174, 255],
  [153, 196, 109, 255],
  [101, 123, 204, 255],
  [211, 104, 94, 255],
  [87, 218, 136, 255],
  [177, 80, 225, 255],
  [232, 225, 73, 255],
  [119, 169, 186, 255],
  [193, 112, 149, 255],
  [121, 200, 105, 255],
  [111, 97, 208, 255],
  [215, 142, 90, 255],
  [83, 222, 181, 255],
  [229, 76, 229, 255],
  [165, 183, 122, 255],
  [115, 146, 190, 255],
  [197, 108, 119, 255],
  [100, 205, 118, 255],
  [148, 93, 212, 255],
  [219, 186, 86, 255],
  [79, 220, 226, 255],
  [233, 72, 179, 255],
  [144, 187, 118, 255],
  [111, 118, 194, 255],
  [201, 124, 104, 255],
  [96, 209, 153, 255],
  [189, 89, 216, 255],
  [211, 223, 82, 255],
  [75, 172, 230, 255],
  [184, 121, 142, 255],
  [117, 191, 114, 255],
  [130, 107, 198, 255],
  [206, 157, 99, 255],
  [92, 213, 193, 255],
  [220, 85, 203, 255],
  [165, 227, 78, 255],
  [71, 118, 234, 255],
  [188, 117, 117, 255],
  [110, 195, 135, 255],
  [161, 103, 202, 255],
  [210, 195, 95, 255],
  [88, 195, 217, 255],
  [224, 81, 158, 255],
  [113, 231, 74, 255],
  [123, 120, 185, 255],
  [192, 139, 113, 255],
  [106, 199, 164, 255],
  [198, 98, 207, 255],
  [188, 214, 91, 255],
  [84, 153, 221, 255],
  [228, 77, 108, 255],
  [70, 235, 84, 255],
  [143, 116, 189, 255],
  [196, 167, 109, 255],
  [101, 204, 199, 255],
  [211, 94, 182, 255],
  [147, 218, 87, 255],
  [80, 104, 225, 255],
  [232, 93, 73, 255],
  [119, 186, 147, 255],
  [170, 112, 193, 255],
  [200, 200, 105, 255],
  [97, 175, 208, 255],
  [215, 90, 142, 255],
  [100, 222, 83, 255],
  [101, 76, 229, 255],
  [183, 150, 122, 255],
  [115, 190, 171, 255],
  [197, 108, 194, 255],
  [170, 205, 100, 255],
  [93, 138, 212, 255],
  [219, 86, 97, 255],
  [79, 226, 110, 255],
  [153, 72, 233, 255],
  [187, 173, 118, 255],
  [111, 187, 194, 255],
  [201, 104, 165, 255],
  [134, 209, 96, 255],
  [89, 95, 216, 255],
  [223, 117, 82, 255],
  [75, 230, 159, 255],
  [174, 121, 184, 255],
  [182, 191, 114, 255],
  [107, 160, 198, 255],
  [206, 99, 130, 255],
  [92, 213, 92, 255],
  [124, 85, 220, 255],
  [227, 165, 78, 255],
  [71, 234, 214, 255],
  [188, 117, 176, 255],
  [156, 195, 110, 255],
  [103, 128, 202, 255],
  [210, 100, 95, 255],
  [88, 217, 131, 255],
  [170, 81, 224, 255],
  [231, 218, 74, 255],
  [120, 172, 185, 255],
  [192, 113, 153, 255],
  [125, 199, 106, 255],
  [107, 98, 207, 255],
  [214, 137, 91, 255],
  [84, 221, 175, 255],
  [222, 77, 228, 255],
  [194, 235, 70, 255],
  [116, 149, 189, 255],
  [196, 109, 123, 255],
  [101, 204, 114, 255],
  [143, 94, 211, 255],
  [218, 180, 87, 255],
  [80, 225, 225, 255],
  [232, 73, 186, 255],
  [147, 186, 119, 255],
  [112, 122, 193, 255],
  [200, 121, 105, 255],
  [97, 208, 148, 255],
  [184, 90, 215, 255],
  [216, 222, 83, 255],
  [76, 178, 229, 255],
  [183, 122, 145, 255],
  [121, 190, 115, 255],
  [126, 108, 197, 255],
  [205, 153, 100, 255],
  [93, 212, 187, 255],
  [219, 86, 208, 255],
  [171, 226, 79, 255],
  [72, 126, 233, 255],
  [187, 118, 121, 255],
  [111, 194, 132, 255],
  [157, 104, 201, 255],
  [209, 190, 96, 255],
  [89, 200, 216, 255],
  [223, 82, 164, 255],
  [120, 230, 75, 255],
  [121, 121, 184, 255],
  [191, 136, 114, 255],
  [107, 198, 160, 255],
  [192, 99, 206, 255],
  [193, 213, 92, 255],
  [85, 158, 220, 255],
  [227, 78, 115, 255],
  [71, 234, 78, 255],
  [141, 117, 188, 255],
  [195, 163, 110, 255],
  [103, 202, 194, 255],
  [210, 95, 186, 255],
  [153, 217, 88, 255],
  [81, 111, 224, 255],
]

export default CORNERSTONE_COLOR_LUT
