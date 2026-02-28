/**
 * Rspack configuration for SSR server bundle
 *
 * Builds the Express SSR server that renders React on the server.
 * Target: Node.js (not browser)
 * Output: Single server.js file in dist/server/
 */

const path = require('node:path')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  context: __dirname,
  devtool: isProduction ? false : 'source-map',
  entry: {
    server: './src/ssr/server.tsx',
  },
  // Externalize Node.js built-ins but bundle npm packages
  externals: [
    // Externalize Socket.IO client to prevent browser-specific code in SSR bundle
    'socket.io-client',
    'engine.io-client',
  ],
  externalsPresets: {
    node: true, // Allows using Node built-ins like 'fs', 'path', 'crypto'
  },
  ignoreWarnings: [
    // Express view.js uses dynamic require() for template engines; we don't use views
    /Critical dependency: the request of a dependency is an expression/,
  ],
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        // Server doesn't need CSS processing (styles are extracted by Emotion)
        // Use type: 'asset/source' to ignore CSS imports
        type: 'asset/source',
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
    minimize: false, // Don't minify server code for better error messages
  },
  output: {
    chunkFilename: '[name].js',
    clean: true,
    filename: '[name].js',
    path: path.join(__dirname, '../web-app-dist/ssr/'),
    publicPath: '/',
  },
  plugins: [
    // Note: Removed Dotenv plugin to avoid DefinePlugin conflicts with debug library
    // Environment variables will be read at runtime from process.env instead
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
  target: 'node', // Target Node.js (not browser)
}
