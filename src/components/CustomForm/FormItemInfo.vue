<template>
  <el-col :span="24" :class="itemClass" :style="{ paddingLeft: (options.form||{}).labelWidth || '125px'}">
    <span class="el-icon-info" />
    <span v-html="infoHtml" />
  </el-col>
</template>
<script lang="js">

export default {
  props: {
    options: {
      type: Object,
      default: _ => {}
    },
    infoHtml: { type: String, default: '' }
  },
  computed: {
    itemClass: function() {
      const arr = [
        'formItem-tip',
        (this.options.form || {}).size || ''
      ]
      return arr.join(' ')
    }
  }
}
</script>
<style scoped lang="less">
.formItem-tip{
  font-size: 12px;
  color: #7b7e8a;
  margin-top: -20px;
  margin-bottom: 10px;
  line-height: 18px;

  &.mini{
    margin-top: -10px;
  }
}
</style>
