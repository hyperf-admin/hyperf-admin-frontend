<script>
export default {
  name: 'AsyncLoadComp',
  props: {
    name: {
      type: String,
      default: '',
      require: true
    },
    baseDir: {
      type: String,
      default: 'components/Common'
    },
    props: {
      type: Object,
      default: _ => {}
    }
  },
  render(h) {
    const { name, props, baseDir } = this.$props
    const Comp = require(`@/${baseDir}/${name}.vue`).default
    return <span><Comp {...{ props }} /></span>
  }
}
</script>
<style></style>
