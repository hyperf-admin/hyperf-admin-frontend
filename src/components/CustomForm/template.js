import Vue from 'vue'

export default {
  template: '<el-input v-model="data" @change="onChange" :size="size" :disable="disabled"></el-input>',
  vm: new Vue({
    props: {
      disabled: Boolean,
      value: {
        type: String,
        default: ''
      },
      size: {
        type: String,
        default: 'small'
      },
      field: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        data: undefined
      }
    },
    watch: {
      value(val) {
        this.data = val
      }
    },
    beforeCreate: function() {
    },
    created: function() {
    },
    methods: {
      onChange: function() {
        const newValue = this.selected
        this.change(newValue, newValue)
        this.$emit('input', newValue)
        this.$emit('change', newValue)
        console.log(this.$props.field)
        this.$props.formCreate.getRule(this.$props.field).on.change(newValue)
      }
    }
  })
}
