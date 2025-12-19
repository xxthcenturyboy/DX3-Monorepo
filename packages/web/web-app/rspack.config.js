const path = require('node:path')
const { CopyRspackPlugin, HtmlRspackPlugin } = require('@rspack/core')
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh')
const Dotenv = require('dotenv-webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const isProduction = process.env.NODE_ENV === 'production'
// const APP_DIR = 'web';
const LIB_PREFIX = 'lib'
const VENDOR_PREFIX = 'vendor'

module.exports = {
  context: __dirname,
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 3000,
    // Configure specific paths with cache headers for development
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      // Cache Lottie animations and static assets for 1 hour
      // This improves performance while still allowing changes to be picked up
      devServer.app.use('/assets', (_req, res, next) => {
        res.setHeader('Cache-Control', 'public, max-age=3600')
        next()
      })

      return middlewares
    },
  },
  entry: {
    main: './src/main.tsx',
  },
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        exclude: /node_modules/,
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
      },
    ],
  },
  optimization: {
    minimize: isProduction,
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          name: `${VENDOR_PREFIX}.main`,
          priority: 10,
          test: /[\\/]node_modules[\\/]/,
        },
        libs: {
          name: LIB_PREFIX,
          priority: 20,
          test: /[\\/]libs[\\/]/,
        },
        mui: {
          name: `${VENDOR_PREFIX}.mui`,
          priority: 30,
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
        },
        react: {
          name: `${VENDOR_PREFIX}.react`,
          priority: 40,
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
        },
      },
      chunks: 'all',
      minSize: 0,
    },
  },
  output: {
    chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].js',
    clean: true,
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    path: path.join(__dirname, '../web-app-dist/'),
    publicPath: '/',
  },
  performance: {
    assetFilter: (assetFilename) => {
      // Do not perform checks for assets ending with .json
      // This is useful for ignoring warnings about large Lottie animation files.
      return !assetFilename.endsWith('.json')
    },
    hints: 'warning',
  },
  plugins: [
    new HtmlRspackPlugin({
      favicon: './src/favicon.ico',
      index: './src/index.html',
      template: './src/index.html',
    }),
    new Dotenv({
      // Respects system-level environment variables (like NODE_ENV set by rspack) over .env file.
      systemvars: true,
    }),
    new CopyRspackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: 'assets',
        },
      ],
    }),
    !isProduction && new ReactRefreshPlugin(),
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ],
  resolve: {
    alias: {
      '@dx3/models-shared': path.resolve(__dirname, '../../shared/models/src/index.ts'),
      '@dx3/utils-shared': path.resolve(__dirname, '../../shared/utils/src/index.ts'),
      '@dx3/web-libs': path.resolve(__dirname, '../libs'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  stats: {
    children: false,
    colors: true,
    modules: false,
    reasons: false,
  },
}
