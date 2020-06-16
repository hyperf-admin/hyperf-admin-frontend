<template>
  <span>
    <el-dropdown :key="uniqueId" size="mini" type="primary" split-button trigger="click" @click="onClick({each: group[0], index: 0})" @command="onClick">
      {{ btnText }}
      <el-dropdown-menu slot="dropdown">
        <template v-for="(each, index) in group">
          <el-dropdown-item
            :key="index"
            :command="{each, index}"
          >
            {{ varReplace(each.text, baseData) }}
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog v-if="showDialog" :title="formTitle" :visible.sync="showDialog" :modal="false">
      <v-form ref="superButtonForm" v-model="fApi" :rule-api="realAction" :rules="formRule" :option="Object.assign({}, currentFormConfig, {submitBtn: false,resetBtn: false})" />
      <span slot="footer">
        <el-button v-show="currentFormConfig.resetBtn" size="small" @click="onCancel">取消</el-button>
        <el-button v-show="currentFormConfig.submitBtn" type="primary" size="small" :loading="submitLoading" @click="onSubmit">确定</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
import { getObjectNodeByKeyTree, strVarReplace, type } from '@/utils/index'
import VForm from '@/components/scaffold/VForm'
import { uniqueId } from '@form-create/utils'
import request from '@/utils/request'

export default {
  name: 'SuperButtonGroup',
  components: {
    VForm
  },
  props: {
    group: {
      type: [Array, Function],
      default: _ => []
    },
    btnText: {
      type: String,
      default: '更多'
    },
    injectData: {
      type: [Function, Object],
      default: function() {
        return {}
      }
    },
    baseData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    cancelCallback: {
      type: Function,
      default: () => {}
    },
    afterAction: {
      type: Function,
      default: () => {}
    },
    preCheck: {
      type: Function,
      default: () => {
        return true
      }
    }
  },
  data() {
    return {
      uniqueId: 'super_button_group' + uniqueId(),
      fApi: {},
      showDialog: false,
      formConfig: {
        injectEvent: true,
        submitBtn: true,
        resetBtn: true
      },
      currentFormConfig: {},
      submitLoading: false,
      formRule: [],
      computeMap: {},
      formTitle: '请输入',
      realAction: '',
      active: undefined
    }
  },
  methods: {
    onClick(row) {
      const { each } = row
      if (this.$props.preCheck(each) === false) {
        return
      }
      if (typeof each.target === 'function') {
        each.target()
        return
      }
      this.active = each
      this.realAction = strVarReplace(each.target, this.$props.baseData)

      if (each.type === 'form') {
        this.formRule = this._.cloneDeep(type(each.rules) === 'object' ? each.rules.form : (each.rules || []))
        this.computeMap = type(each.rules) === 'object' ? each.rules.compute_map : {}
        this.currentFormConfig = Object.assign({}, this.formConfig, each.rules ? (each.rules.form.form_ui || {}) : {})
        this.formRule.map(item => {
          item.value = getObjectNodeByKeyTree(item.field, this.$props.baseData, item.value)
          return item
        })
        this.showDialog = true
        this.loading = false
        return
      }

      if (each.type === 'api') {
        this.$confirm('确认要' + this.varReplace(each.text, this.baseData) + '选中的数据吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.onPopoverSubmit()
        }).catch(() => {
          this.onPopoverCancel()
        })
        return
      }
      if (/http.*/.test(this.realAction)) {
        window.open(this.realAction)
      } else {
        this.$router.push(this.realAction)
      }
      this.loading = false
    },
    onCancel() {
      this.showDialog = false
      this.$props.cancelCallback()
    },
    onSubmit() {
      this.submitLoading = true
      if (this.realAction.length > 0) {
        if (this.$refs.superButtonForm.validate()) {
          this.sendRequest(this.fApi.formData())
        } else {
          this.submitLoading = false
          this.loading = false
        }
      } else {
        this.submitLoading = false
        this.loading = false
        this.$props.afterAction(this.active)
      }
    },
    onPopoverCancel() {
      this.$props.cancelCallback()
    },
    onPopoverSubmit() {
      this.sendRequest()
    },
    sendRequest(data) {
      this.submitLoading = true
      request({
        url: this.realAction,
        method: this._.toUpper(this.$props.method || 'POST'),
        data: Object.assign({}, data)
      }).then(res => {
        this.submitLoading = false
        this.loading = false
        this.$message({
          message: res.message || '操作成功',
          type: 'success'
        })
        this.$props.afterAction(this.active)
      }).catch(exc => {
        this.submitLoading = false
        this.loading = false
        this.$props.afterAction(this.active, exc)
      })
    },
    varReplace(str, obj) {
      return strVarReplace(str, obj)
    },
    getInjectData() {
      if (typeof this.$props.injectData === 'function') {
        return this.$props.injectData()
      }
      return this.$props.injectData
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
    background: rgba(0, 0, 0, 0.1)
  }
</style>
