/**
 * Rspack configuration for SSR client hydration bundle
 *
 * Builds the client-side JavaScript that hydrates SSR HTML.
 * Target: Browser (web)
 * Output: Client bundle in dist/static/js/
 *
 * This is separate from the main CSR bundle (rspack.config.js)
 * and uses client.tsx entry point for SSR hydration.
 */

const path = require('node:path')
const { CopyRspackPlugin } = require('@rspack/core')
const Dotenv = require('dotenv-webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const isProduction = process.env.NODE_ENV === 'production'
const LIB_PREFIX = 'lib'
const VENDOR_PREFIX = 'vendor'

module.exports = {
  context: __dirname,
  devtool: isProduction ? false : 'source-map',
  entry: {
    client: './src/client.tsx',
  },
  ignoreWarnings: [
    // Dotenv and Rspack mode both define process.env.NODE_ENV; mode (from --mode) takes precedence
    /Conflicting values for 'process\.env\.NODE_ENV'/,
  ],
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
                  development: false, // Use jsx not jsxDEV - avoids "jsxDEV is not a function" with split chunks
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
    chunkFilename: '[name].js', // Simplified for Phase 1 SSR
    clean: true,
    filename: '[name].js', // Simplified for Phase 1 SSR
    path: path.join(__dirname, '../web-app-dist/static/js/'),
    publicPath: '/static/js/',
  },
  performance: {
    assetFilter: (assetFilename) => {
      return !assetFilename.endsWith('.json')
    },
    hints: 'warning',
  },
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
    new CopyRspackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: '../../assets', // Copy to web-app-dist/assets
        },
      ],
    }),
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
  target: 'web',
}
