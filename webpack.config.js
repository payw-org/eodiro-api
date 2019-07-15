const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    'eodiro.api': ['babel-polyfill', './src/main.ts']
  },
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: __dirname + '/build/',
    filename: '[name].built.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      Configs: __dirname + '/src/configs/',
      Database: __dirname + '/src/database/',
      Resources: __dirname + '/src/resources/',
      Routes: __dirname + '/src/routes/',

      Controller: __dirname + '/src/app/controller/',
      DB: __dirname + '/src/app/db/',
      Middleware: __dirname + '/src/app/middleware/',
      Provider: __dirname + '/src/app/provider/',
      Helpers: __dirname + '/src/app/helpers'
    }
  },
  module: {
    rules: [
      {
        test: [/\.js$/],
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: [/\.tsx?$/],
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  }
}
