let path = require('path')
let webpack = require('webpack')

module.exports = [
  {
    entry: './src/front-end-utils.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'front-end-utils.js',
      library: 'frontEndUtils',
      libraryExport: "default",
      globalObject: 'this',
      libraryTarget: 'umd'
    },
    mode: "production",
    module: {
      rules: [
        {
          test: /\.cdc$/i,
          include: [
            path.resolve(__dirname, 'src/contracts')
          ],
          exclude: /(node_modules|bower_components)/,
          loader: "raw-loader",
        },
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, 'src')
          ],
          exclude: /(node_modules|bower_components)/,
          loader: "babel-loader",
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        _: ['lodash']
      })
    ],
    externals: {
      lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_'
      }
    }
  }
]
