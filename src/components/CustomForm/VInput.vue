<template>
  <el-input
    v-model="inputValue"
    :show-word-limit="showWordLimit"
    :rows="rows"
    :clearable="clearable"
    :disabled="disabled"
    :readonly="readonly"
    v-bind="$attrs"
    :autosize="autosize"
    @change="change"
    @focus="focus"
    @clear="clear"
    @blur="blur"
    @input="input"
  >
    <el-button v-if="showCopy" slot="append" icon="el-icon-copy-document" @click="copy" />
  </el-input>
</template>

<script>
import { Message } from 'element-ui'

export default {
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    showWordLimit: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    rows: {
      type: Number,
      default: 6
    },
    showCopy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputValue: ''
    }
  },
  watch: {
    value: {
      handler: function(val) {
        this.inputValue = val || ''
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    change(val) {
      this.$emit('change', val)
    },
    blur(e) {
      this.$emit('blur', e)
    },
    focus(e) {
      this.$emit('focus', e)
    },
    clear() {
      this.$emit('clear')
    },
    input() {
      this.$emit('input', this.inputValue)
      // form-create拦截了input事件的冒泡，输入实时监控可以通过下面钩子
      this.$emit('inputNative', this.inputValue)
    },
    copy(e) {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.setAttribute('value', this.inputValue)
      input.select()
      if (document.execCommand('copy')) {
        Message({
          message: '已复制到剪贴板',
          type: 'success',
          duration: 1000
        })
        this.$emit('copy')
      }
      document.body.removeChild(input)
    }
  }
}
</script>
<style scoped lang="less">
// 解决line-height继承问题
.el-textarea/deep/ .el-input__count{
  line-height: 14px;
}
</style>
