require('dotenv').config()

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssnanoPlugin = require('cssnano-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  entry: {
    index: ['./src/assets/scripts/index.js', './src/assets/styles/index.scss']
  },
  output: {
    path: path.resolve(__dirname, 'dist/assets/'),
    publicPath: '/assets/',
    filename: 'scripts/[name].js'
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
              sourceMap: true,
              url: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              sourceMap: true,
              plugins: () => [
                require('autoprefixer')({ preset: 'default' }),
                require('./utils/postcss-font-smoothing')(),
                require('css-has-pseudo/postcss')
              ]
            }
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
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
          outputPath: 'fonts'
        }
      }
    ]
  },
  devtool: isDev ? 'source-map' : 'none',
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssnanoPlugin({
        sourceMap: true
      })
    ]
  },
  plugins: [new MiniCssExtractPlugin({ filename: `styles/index.css` })]
}
