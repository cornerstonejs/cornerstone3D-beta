const path = require('path')

// TODO: If we want to be able to run all examples from within one package,
// this needs to be configured or part of the function. THese used to be ../cornerstone-render,
// etc...
const csRenderBasePath = path.resolve('./packages/cornerstone-render')
const csToolsBasePath = path.resolve('./packages/cornerstone-tools')
const csStreamingBasePath = path.resolve(
  './packages/cornerstone-image-loader-streaming-volume'
)

module.exports = function buildConfig(names, exampleBasePaths, destPath, root) {
  let multiExampleEntryPoints = ''

  console.warn(names)

  names.forEach((name, index) => {
    const exampleBasePath = exampleBasePaths[index]
    multiExampleEntryPoints += `${name}: "${exampleBasePath}", \n`
  })

  let multiTemplates = ''
  names.forEach((name) => {
    multiTemplates += `
      new HtmlWebpackPlugin({
        title: '${name}',
        chunks: ['${name}'],
        filename: '${name}.html',
        template: '${root.replace(
          /\\/g,
          '\\\\'
        )}/utils/ExampleRunner/template.html',
      }),`
  })

  multiTemplates += '\n'

  return `
// THIS FILE IS AUTOGENERATED - DO NOT EDIT
const path = require('path')
const vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core
  .rules
const rules = [].concat(require('./rules-examples.js'), vtkRules);
const modules = [path.resolve('../node_modules/'), path.resolve('../../../node_modules/')];
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new ESLintPlugin(),
    ${multiTemplates}
    new webpack.DefinePlugin({
      __BASE_PATH__: "''",
    }),
  ],
  entry: {
    ${multiExampleEntryPoints}
  },
  output: {
    path: '${destPath.replace(/\\/g, '\\\\')}',
    filename: '[name].js',
  },
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@precisionmetrics/cornerstone-render': '${csRenderBasePath.replace(
        /\\/g,
        '\\\\'
      )}',
      '@precisionmetrics/cornerstone-tools': '${csToolsBasePath.replace(
        /\\/g,
        '\\\\'
      )}',
      '@precisionmetrics/cornerstone-image-loader-streaming-volume': '${csStreamingBasePath.replace(
        /\\/g,
        '\\\\'
      )}',
    },
    modules,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      events: false,
    },
  },
  devServer: {
    hot: true,
    open: false,
    port: 3000,
    historyApiFallback: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
};
`
}
