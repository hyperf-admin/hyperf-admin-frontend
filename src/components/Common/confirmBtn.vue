<template>
  <span>
    <el-popover v-model="show" placement="top" :tabindex="999999">
      <el-button slot="reference" :type="type" :icon="icon" :circle="circle" size="mini">
        <span v-text="circle ? '' : btnText" />
      </el-button>
      <p v-text="'确定要' + (btnText ? btnText : '操作') + '吗?'" />
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="onCancel">取消</el-button>
        <el-button size="mini" type="primary" :loading="loading" @click="onSubmit">确定</el-button>
      </div>
    </el-popover>
  </span>
</template>

<script>
export default {
  name: 'ConfirmBtn',
  props: {
    type: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    circle: {
      type: Boolean,
      default: false
    },
    btnText: {
      type: String,
      default: '删除'
    },
    submitCallback: {
      type: Function,
      default: function(res) {

      }
    },
    cancelCallback: {
      type: Function,
      default: function(res) {

      }
    }
  },
  data: function() {
    return {
      show: false,
      loading: false
    }
  },
  beforeMount: function() {
  },
  methods: {
    onSubmit: function() {
      this.loading = true
      this.submitCallback(this)
    },
    onCancel: function() {
      this.cancelCallback(this.data)
      this.show = false
    }
  }
}
</script>
