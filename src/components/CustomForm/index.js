function warp(comp) {
  return Object.assign(comp, {
    type: 'template'
  })
}

export default function(comp_name) {
  const path = require.resolve(`./${comp_name}.js`)
  const comp = warp(require(`./${comp_name}.js`).default)
  delete require.cache[path]
  return comp
}
