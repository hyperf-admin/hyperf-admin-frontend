const glob = require('glob')
const path = require('path')
const getEntry = function() {
  let entries = {}
  const items = glob.sync('./src/modules/*/main.js')
  for (let i in items) {
    const filepath = items[i]
    const fileList = filepath.split('/')
    const fileName = fileList[fileList.length - 2]
    if (fileName === 'template' || (!!process.env.BUILD_UNIT && fileName !== process.env.BUILD_UNIT) ) {
      continue
    }
    entries[fileName] = {
      entry: `src/modules/${fileName}/main.js`,
      // 模板来源
      template: `public/index.html`,
      favicon: 'public/favicon.ico',
      // 在 dist/index.html 的输出
      filename: `${fileName}/index.html`,
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-libs', 'chunk-elementUI', 'chunk-common', fileName],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }
  }
  return entries
}

const getModules = function() {
  const entries = getEntry();
  return Object.keys(entries)
}

const resolve = function(dir) {
  return path.join(__dirname + '/../', dir)
}

module.exports = {
  getEntry,
  getModules,
  resolve
}
