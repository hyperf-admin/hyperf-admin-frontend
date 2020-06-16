'use strict'
const defaultSettings = require('./src/settings.js')
const utils = require('./build/utils')
const CompressionPlugin = require('compression-webpack-plugin')
// 监测打包各个阶段的时间
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
// bundle分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const TerserPlugin = require('terser-webpack-plugin')
// const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')

const name = defaultSettings.title || 'HyperfAdmin' // page title

const hashType = process.env.NODE_ENV === 'development' ? 'hash' : 'contenthash:8'

const port = process.env.port || process.env.npm_config_port || 9528 // dev port
// All configuration item explanations can be find in https://cli.vuejs.org/config/
const smp = new SpeedMeasurePlugin({
  outputFormat: 'human'
})
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  pages: utils.getEntry(),
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: !(process.env.ENV === 'production'), // 去除map文件
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        // 本地联调是请代理到对应开发ip
        target: `http://127.0.0.1:9511`,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        },
        logLevel: 'debug'
      }
    },
    before(app) {
      app.get('/', (req, res, next) => {
        if (process.env.BUILD_UNIT && process.env.ENV === 'development') {
          res.redirect(`/${process.env.BUILD_UNIT}/`)
        } else {
          res.redirect('/system/')
        }
      })
    }
    // after: require('./mock/mock-server.js')
  },
  configureWebpack(config) {
    const baseConf = {
      name: name,
      resolve: {
        alias: {
          '@': utils.resolve('src'),
          'vue$': 'vue/dist/vue.esm.js'
        }
      },
      output: {
        filename: `[name]/js/[name].[${hashType}].js`,
        publicPath: '/',
        chunkFilename: `static/js/[name].[${hashType}].js`
      },
      stats: 'none', // 屏蔽打包报警
      plugins: []
    }
    if (process.env.ENV === 'development') {
      if (process.env.BUILD_BNDAL) {
        baseConf.plugins.push(new BundleAnalyzerPlugin())
      }
      if (process.env.BUILD_SMP) {
        return smp.wrap(baseConf)
      }
    }
    if (process.env.ENV === 'production') {
      baseConf.plugins = [
        new CompressionPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false // false 不删除源文件 true 删除源文件
        })
        // 打包时过滤掉 console 打印
        // new TerserPlugin({
        //   terserOptions: {
        //     compress: {
        //       warnings: false,
        //       drop_console: true,
        //       drop_debugger: true,
        //       pure_funcs: ['console.log']
        //     }
        //   }
        // })
        // new FilterWarningsPlugin({
        //   exclude: /mini-css-extract-plugin[^]*Conflicting order between:/
        // })
      ]
    }
    return baseConf
  },
  chainWebpack(config) {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(utils.resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(utils.resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
              // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                jsonEditor: {
                  name: 'chunk-jsonEditor', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?v-jsoneditor(.*)/ // in order to adapt to cnpm
                },
                vue2editor: {
                  name: 'chunk-vue2editor', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?vue2-editor(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: utils.resolve('src/components'), // can customize your rules
                  minChunks: 1, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true,
                  chunks: 'initial'
                }
              }
            })
          // config.optimization.runtimeChunk('single')
        }
      )

    config.plugin('extract-css')
      .use(require('mini-css-extract-plugin'), [
        {
          filename: `[name]/css/[name].[${hashType}].css`,
          chunkFilename: `static/css/[name].[${hashType}].css`
        }
      ])

    // config.plugins.delete('friendly-errors') // 屏蔽打包报警
  }
}
