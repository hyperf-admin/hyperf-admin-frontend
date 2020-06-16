<template>
  <div class="v-input-range" :class="{'isFocus': isFocus}">
    <el-input
      v-model.number="startValue"
      :clearable="clearable"
      :disabled="disabled"
      v-bind="attrs"
      class="range-start"
      :placeholder="placeholder[0] || '最小值'"
      @change="change"
      @focus="focus"
      @clear="clear"
      @blur="blur"
      @input="input('startValue')"
      @keydown.native="keydown"
    />
    <el-input
      tabindex="1"
      class="range-split"
      placeholder="~"
      v-bind="attrs"
      readonly
      :disabled="disabled"
    />
    <el-input
      v-model.number="endValue"
      :placeholder="placeholder[1] || '最大值'"
      :clearable="clearable"
      :disabled="disabled"
      v-bind="attrs"
      class="range-end"
      @change="change"
      @focus="focus"
      @clear="clear"
      @blur="blur"
      @input="input('endValue')"
      @keydown.native="keydown"
    />
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: [String, Array],
      default: ''
    },
    clearable: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: Array,
      default: _ => []
    }
  },
  data() {
    return {
      isFocus: false,
      startValue: '',
      endValue: '',
      valueType: 'Array'
    }
  },
  computed: {
    inputValue() {
      const [a, b] = [this.formatNumber(this.startValue), this.formatNumber(this.endValue)]
      if (this.valueType === 'String') {
        return (a === '' && b === '') ? '' : [a, b].join(',')
      } else {
        return (a === '' && b === '') ? [] : [a, b]
      }
    },
    attrs() {
      return Object.assign({}, this.$attrs, { style: '' })
    }
  },
  watch: {
    value: {
      handler: function(val) {
        val = typeof val === 'string' ? val.split(',') : (val || [])
        this.startValue = this.formatNumber(val[0])
        this.endValue = this.formatNumber(val[1])
      },
      immediate: true
    }
  },
  created() {
    this.valueType = typeof this.value === 'string' ? 'String' : 'Array'
  },
  methods: {
    formatNumber(val) {
      if (typeof val === 'undefined' || val === null || val === '') {
        return ''
      }
      if (isNaN(val)) {
        return ''
      }
      return Number(val)
    },
    // 键盘输入控制
    keydown(e) {
      // const list = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Insert', 'Home', 'End']
      // if (/^[\d]$/.test(e.key) || list.indexOf(e.key) > -1) {
      //   e.returnValue = true
      // } else {
      //   e.returnValue = false
      // }
    },
    change() {
      this.$emit('change', this.inputValue)
    },
    blur(e) {
      this.isFocus = false
      this.$emit('blur', e)
    },
    input(valueKey) {
      const val = this[valueKey]
      if (typeof val === 'string') {
        this[valueKey] = /^d+$/.test(val) ? val : val.replace(/[^0-9]/ig, '')
      }
      this.$emit('input', this.inputValue)
    },
    focus(e) {
      this.isFocus = true
      this.$emit('focus', e)
    },
    clear() {
      this.$emit('clear')
    }
  }
}
</script>
<style lang="scss" scoped >
.v-input-range{
  font-size: 0;
  padding:0 15px;
  width: 300px;

  &:hover{
    /deep/ {
      .range-split input, .range-start input, .range-end input{
        border-color: #C0C4CC;
      }
    }
  }
  &.isFocus{
    /deep/ {
      .range-split input, .range-start input, .range-end input{
        border-color: #409EFF;
      }
    }
  }
}
/deep/ .range{
  &-split,&-start,&-end{
    display: inline-block;
    input{
      text-align: center;
    }
  }

  &-split{
    width: 30px;
    input {
      border-left: none;
      border-right: none;
      border-radius: 0;
      padding: 0;
      position: relative;
      z-index: 2;
      cursor: auto;
      &:focus, &:hover{
        border-color: #DCDFE6;
      }
    }
  }
  &-start {
    width: 50%;
    margin-left: -15px;
    input {
      border-right: none;
      border-radius: 4px 0 0 4px;
    }
  }
  &-end{
    margin-right: -15px;
    width: 50%;
    input {
      border-radius:  0 4px 4px 0;
      border-left: none;
    }
  }
}

</style>
