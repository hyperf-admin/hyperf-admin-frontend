<template lang="html">
  <div class="jsoneditor-container" :class="{'max-box':max,'min-box':!max}" :style="getHeight">
    <div ref="jsoneditor" class="jsoneditor-box" />
    <el-button v-if="options.mode === 'code' && plus" type="button" class="max-btn" size="mini" @click="max = !max" />
  </div>
</template>
<script>
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'
import 'jsoneditor/dist/jsoneditor.min.css'
export default {
  name: 'VJson',
  provide() {
    return {
      VJson: this
    }
  },
  inject: ['elForm', 'elFormItem'],
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          mode: 'code'
        }
      }
    },
    field: {
      type: String,
      default: ''
    },
    value: {
      type: [Object, Array, Number, String, Boolean],
      default: ''
    },
    height: {
      type: String,
      default: ''
    },
    plus: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      editor: null,
      style: {},
      max: false,
      internalChange: false
    }
  },
  computed: {
    getHeight() {
      if (this.height && !this.max) {
        return {
          height: this.height
        }
      }
      return {}
    }
  },
  watch: {
    value(value) {
      if (this.editor && value && !this.internalChange) {
        this.editor.set(value)
      }
    },
    max(value) {
      this.$nextTick(() => {
        this.initView()
      })
    }
  },
  mounted() {
    this.initView()
  },
  beforeDestroy() {
    this.destroyView()
  },
  methods: {
    onChange() {
      let json = ''
      try {
        json = this.editor.get()
        if (JSON.stringify(json) === '{}') {
          json = ''
        }
      } catch (error) {
        this.onError(error)
      }

      if (this.editor) {
        this.internalChange = true
        this.$emit('input', json)
        this.$emit('change', json)
        this.$nextTick(() => {
          this.internalChange = false
        })
      }
    },
    onError(errors) {
      this.$emit('error', errors)
      if (errors.length > 0) {
        this.elFormItem.validateMessage = errors[0].message
        this.elFormItem.validateState = errors[0].type
      } else {
        this.elFormItem.validateMessage = ''
        this.elFormItem.validateState = ''
      }
    },
    validate(rule, value, callback) {
      const errors = this.editor.lastSchemaErrors
      console.warn(errors)
      if (errors.length > 0) {
        callback(errors[0].message)
      } else {
        callback()
      }
    },
    initView() {
      if (!this.editor) {
        const container = this.$refs.jsoneditor
        const options = Object.assign({
          onChange: this.onChange,
          onValidationError: this.onError,
          navigationBar: false,
          statusBar: false
        },
        this.options)
        this.editor = new JSONEditor(container, options)
        this.elFormItem.rules.push({
          validator: (rule, value, callback) => this.validate(rule, value, callback)
        })
      }
      this.editor.set(this.value || {})
    },
    destroyView() {
      if (this.editor) {
        this.editor.destroy()
        this.editor = null
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .jsoneditor-container.max-box {
    position: fixed;
    top: 0px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  }
  .jsoneditor-container.min-box {
    position: relative;
    min-width: 300px;
    width: 100%;
  }
  .jsoneditor-box {
    height: 100%;
  }
  .jsoneditor-container:hover .max-btn {
    display: block;
  }
  .max-btn {
    display: none;
    position: absolute;
    top: 7px;
    right: 110px;
    color: #fff;
    width: 24px;
    hight: 24px;
    background: rgba(0, 0, 0, 0) url('./../../assets/plus.svg') no-repeat;
    background-position: 3px;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 3px;
  }
  .max-btn:hover {
    border: 1px solid #d7e6fe;
  }
</style>
