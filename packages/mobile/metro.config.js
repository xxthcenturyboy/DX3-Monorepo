const { getDefaultConfig } = require('@expo/metro-config')
const { mergeConfig } = require('metro-config')
const path = require('node:path')

const defaultConfig = getDefaultConfig(__dirname)
const projectRoot = __dirname
const { assetExts, sourceExts } = defaultConfig.resolver

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: 'mobile',
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (typeof name !== 'string') {
            return target[name]
          }
          if (name.startsWith('@dx3/')) {
            return path.join(projectRoot, `../../libs/${name.replace('@dx3/', '')}/src`)
          }
          return path.join(process.cwd(), `node_modules/${name}`)
        },
      },
    ),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg', 'json'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  watchFolders: [path.resolve(__dirname, '../../libs')],
}

module.exports = mergeConfig(defaultConfig, customConfig)
