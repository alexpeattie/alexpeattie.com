require('dotenv').config()

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssnanoPlugin = require('cssnano-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require('webpack')

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
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          reactivityTransform: true
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: isDev }
          },
          'css-loader'
        ]
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
                require('./utils/postcss-font-smoothing')()
              ]
            }
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                url: true,
                quietDeps: true
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
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: true
    }),
    new MiniCssExtractPlugin({ filename: `styles/index.css` })
  ]
}
