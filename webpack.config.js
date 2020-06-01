require('dotenv').config()

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssnanoPlugin = require('cssnano-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  entry: ['./src/assets/scripts/index.js', './src/assets/styles/index.scss'],
  output: {
    path: path.resolve(__dirname, 'dist/assets/scripts'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: 'babel-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /(node_modules|bower_components)/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              url: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              sourceMap: isDev,
              plugins: () => [
                require('autoprefixer')({ preset: 'default' }),
                require('./utils/postcss-font-smoothing')()
              ]
            }
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
              sassOptions: {
                url: true
              }
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
        options: {
          outputPath: '../fonts'
        }
      }
    ]
  },
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new CssnanoPlugin({
        sourceMap: true
      })
    ]
  },
  plugins: [new MiniCssExtractPlugin({ filename: `../styles/index.css` })]
}
