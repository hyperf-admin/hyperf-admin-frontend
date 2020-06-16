<script>
export default {
  name: 'Icon',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon } = context.props

    if (icon) {
      if (icon.indexOf('el-') === 0 || icon.indexOf('oms-') === 0) {
        return <i class={icon}/>
      } else {
        return <svg-icon icon-class={icon}/>
      }
    }
    return <div />
  }
}
</script>
