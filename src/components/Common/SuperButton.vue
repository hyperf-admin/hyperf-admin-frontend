<template>
  <span :key="uniqueId">
    <el-popover v-if="type ==='api'" v-model="popoverShow" placement="top" :tabindex="999999">
      <p v-text="'确定要' + (btnText ? btnText : '操作') + '吗?'" />
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="onPopoverCancel">取消</el-button>
        <el-button size="mini" type="primary" :loading="submitLoading" @click="onPopoverSubmit">确定</el-button>
      </div>
      <el-button slot="reference" :icon="props.icon" :type="props.type" :size="props.size" :circle="props.circle" :round="props.round" :loading="loading">{{ btnText }}</el-button>
    </el-popover>
    <el-button v-else :icon="props.icon" :type="props.type" :size="props.size" :circle="props.circle" :round="props.round" :loading="loading" @click="onClick">{{ btnText }}</el-button>
    <el-dialog v-if="type === 'form'" :title="btnText" :visible.sync="showDialog" :modal="false">
      <v-form
        v-if="showDialog"
        ref="superButtonForm"
        v-model="fApi"
        :rule-api="realTarget"
        :rules="realRules"
        :option="Object.assign({}, formConfig, {submitBtn: false,resetBtn: false})"
        :compute-map="computeMap"
      />
      <span slot="footer">
        <el-button v-show="formConfig.resetBtn" size="small" @click="onCancel">取消</el-button>
        <el-button v-show="formConfig.submitBtn" type="primary" size="small" :loading="submitLoading" @click="onSubmit">确定</el-button>
      </span>
    </el-dialog>
    <template v-if="type === 'drawer'">
      <el-drawer
        :size="props.drawerSize || '50%'"
        :title="varReplace(props.drawerTitle, $props.baseData)"
        :with-header="props.drawerWithHeader || true"
        :visible.sync="drawer"
        :direction="props.drawerDirection || 'ltr'"
        :before-close="drawerClose"
      >
        <span>
          <async-load-comp :name="props.component" :props="transProps(props.componentProps)" />
        </span>
      </el-drawer>
    </template>
    <el-dialog v-if="type === 'table'" :visible.sync="showTableDialog" :modal="false">
      <tab-list
        v-if="showTableDialog"
        ref="table"
        :list-api="varReplace(props.listApi, $props.baseData)"
        :info-api="varReplace(props.infoApi, $props.baseData)"
        :list-options="Object.assign({pageTitle: btnText}, props.options || {})"
        :show-filter="false"
        :filter-with-query="false"
      />
    </el-dialog>
  </span>
</template>
<script>
import { strVarReplace, getObjectNodeByKeyTree, type } from '@/utils/index'
import VForm from '@/components/scaffold/VForm'
import { uniqueId } from '@form-create/utils'
import request from '@/utils/request'
import AsyncLoadComp from '@/components/Common/AsyncLoadComp'
export default {
  name: 'SuperButton',
  components: {
    VForm,
    AsyncLoadComp,
    'TabList': () => import('@/components/scaffold/tablist')
  },
  props: {
    props: {
      type: Object,
      default: () => {
        return {
          size: 'mini',
          circle: false,
          round: false,
          type: ''
        }
      }
    },
    type: {
      type: String,
      default: undefined
    },
    confirm: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      default: 'POST'
    },
    target: {
      type: [String, Function],
      default: ''
    },
    selectFilter: {
      type: Array,
      default: () => []
    },
    baseData: {
      type: Object,
      default: () => {}
    },
    formOptions: {
      type: [Array, Object],
      default: () => []
    },
    afterAction: {
      type: Function,
      default: _ => {}
    },
    cancelCallback: {
      type: Function,
      default: () => {}
    },
    preCheck: {
      type: Function,
      default: () => {
        return true
      }
    },
    injectData: {
      type: [Function, Object],
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      loading: this.$props.loading || false,
      realAction: undefined,
      showDialog: false,
      btnText: undefined,
      formConfig: {
        injectEvent: true,
        form: {
          size: 'mini'
        },
        submitBtn: true,
        resetBtn: true
      },
      realRules: [],
      realTarget: '',
      computeMap: {},
      uniqueId: 'super_button_' + uniqueId(),
      fApi: {},
      submitLoading: false,
      popoverShow: false,
      drawer: false,
      showTableDialog: false
    }
  },
  created() {
    // console.log('SuperButton created', this.$props)
    this.btnText = strVarReplace(this.$props.props.text, this.$props.baseData)
  },
  methods: {
    onClick(e) {
      // 按钮操作抛出，前端接收事件自定义处理
      if (this.type === 'native') {
        this.$emit('click', {
          text: this.$props.props.text
        })
        return false
      }
      if (typeof this.$props.target === 'function') {
        this.$props.target()
        return
      }
      if (this.$props.preCheck(this.$props) === false) {
        return
      }
      this.realTarget = strVarReplace(this.$props.target, this.$props.baseData)
      if (this.$props.type === 'table') {
        this.showTableDialog = true
        return
      }

      this.loading = true

      if (this.$props.type === 'form') {
        this.realRules = this._.cloneDeep(type(this.$props.formOptions) === 'object' ? this.$props.formOptions.form : this.$props.formOptions)
        this.computeMap = type(this.$props.formOptions) === 'object' ? this.$props.formOptions.compute_map : {}
        if (this.realRules && this.realRules.length > 0) {
          this.realRules.map(item => {
            item.value = getObjectNodeByKeyTree(item.field, this.$props.baseData, item.value)
            return item
          })
        }
        this.formConfig = Object.assign({}, this.formConfig, this.$props.formOptions.form_ui || {})
        this.showDialog = true
        this.loading = false
        return
      }

      if (this.$props.type === 'api') {
        this.popoverShow = true
        console.log('api ', this.popoverShow)
        return
      }
      if (this.$props.type === 'drawer') {
        this.drawer = true
        return
      }

      if (/http.*/.test(this.realTarget)) {
        window.open(this.realTarget)
      } else {
        this.$router.push(this.realTarget)
      }
      this.loading = false
    },
    onCancel() {
      this.showDialog = false
      this.$props.cancelCallback()
    },
    onSubmit() {
      if (this.$refs.superButtonForm.validate()) {
        this.sendRequest(this.fApi.formData())
      }
    },
    onPopoverCancel() {
      this.popoverShow = false
      this.$props.cancelCallback()
    },
    onPopoverSubmit() {
      if (this.$props.preCheck(this.$props) === false) {
        return
      }
      this.realTarget = strVarReplace(this.$props.target, this.$props.baseData)
      if (this.realTarget.length > 0) {
        this.sendRequest()
      } else {
        this.submitLoading = false
        this.showDialog = false
        this.loading = false
        this.popoverShow = false
        this.$props.afterAction(this.$props)
      }
    },
    sendRequest(data) {
      const formData = {}
      for (const i in data) {
        formData[i.split('-').join('.')] = data[i]
      }
      this.submitLoading = true
      request({
        url: this.realTarget,
        method: this._.toUpper(this.$props.method || 'POST'),
        data: Object.assign({}, this.getInjectData(), formData)
      }).then(res => {
        this.submitLoading = false
        this.showDialog = false
        this.loading = false
        this.popoverShow = false
        this.showMessage(res.payload.messageRule, res.message || '操作成功')
        this.$props.afterAction(this.$props)
      }).catch(exc => {
        this.submitLoading = false
        this.loading = false
        this.$props.afterAction(this.$props, exc)
      })
    },
    // 根据配置显示错误信息提示方式
    showMessage(rule = {}, msg = '') {
      let config = rule.props || {}
      if (rule.type === 'notification') {
        config = Object.assign({ type: 'success', message: msg, dangerouslyUseHTMLString: true }, config)
        this.$notify(config)
      } else {
        // duration设为 0 则不会自动关闭, 默认添加个关闭的按钮
        config = Object.assign({ type: 'success', message: msg, dangerouslyUseHTMLString: true, showClose: config.duration === 0 }, config)
        this.$message(config)
      }
    },
    getInjectData() {
      if (typeof this.$props.injectData === 'function') {
        return this.$props.injectData()
      }
      return this.$props.injectData
    },
    drawerClose() {
      this.drawer = false
      this.loading = false
    },
    varReplace(str, data) {
      return strVarReplace(str, data)
    },
    transProps(componentProps) {
      Object.keys(componentProps).forEach(item => {
        if (type(componentProps[item]) === 'string') {
          componentProps[item] = strVarReplace(componentProps[item], this.$props.baseData)
        }
      })
      return componentProps
    }
  }
}
</script>

<style scoped>
  .el-dialog__wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    margin: 0;
    background: rgba(0, 0, 0, 0.5)
  }
  /deep/ .el-dialog__body {
    padding: 10px;
  }
</style>
