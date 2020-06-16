<template>
  <div v-loading="loading" :class="formClass">
    <Version
      v-model="versionId"
      :rule="rule"
      :show="versionEnable && versions.length > 0"
      :versions="versions"
      @change="changeVersion"
    >
      <form-create
        ref="form"
        :key="key"
        v-model="fApi"
        :rule="rule"
        :option="Object.assign({}, formOptions, {submitBtn: false, resetBtn: false})"
        @on-reload="onFormReload"
        @mounted="($f) => onFormMounted($f)"
      />
      <el-row :style="{paddingLeft: formOptions.form.labelWidth || '125px'}">
        <el-button
          v-show="formOptions.submitBtn && formOptions.submitBtn.show"
          v-bind="formOptions.submitBtn"
          style="width: 100px"
          :loading="submitLoading"
          @click="onSubmit(fApi.formData())"
        >{{ formOptions.submitBtn.innerText || '提交' }}</el-button>
        <el-button
          v-show="formOptions.resetBtn && formOptions.resetBtn.show"
          v-bind="formOptions.resetBtn"
          style="width: 100px"
          @click="$router.back(-1)"
        >{{ formOptions.resetBtn.innerText }}</el-button>
      </el-row>
    </Version>
  </div>
</template>

<script>
import formCreate from '@/utils/form-create'
import request from '@/utils/request'
import { maker } from '@/utils/form-maker'
import { strVarReplace, whereFilter, showEleByClassName, arrayColumn, type } from '@/utils/index'
import { Message } from 'element-ui'
import Version from '@/components/Common/Version'
import _ from 'lodash'

export default {
  name: 'VForm',
  components: {
    Version,
    formCreate: formCreate.$form()
  },
  props: {
    value: {
      type: Object,
      default: function() {
        return {}
      }
    },
    rules: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 表单规则Api
    ruleApi: {
      type: String,
      default: function() {
        return this.$route.path
      }
    },
    saveApi: {
      type: String,
      default: function() {
        return this.$route.path
      }
    },
    afterSubmit: {
      type: Function,
      default: function() {
      }
    },
    routerBack: {
      type: Boolean,
      default: true
    },
    pKey: {
      type: String || Number,
      default: ''
    },
    dataVersionEnable: {
      type: Boolean,
      default: false
    },
    dataVersions: {
      type: Array,
      default: function() {
        return []
      }
    },
    computeMap: {
      type: Object,
      default: _ => {}
    },
    // 组件参数配置
    option: {
      type: Object,
      default: _ => {}
    }
  },
  data() {
    const defaultOptions = {
      injectEvent: true,
      form: {},
      submitBtn: {
        type: 'primary',
        show: true,
        icon: '',
        size: 'small'
      },
      resetBtn: {
        show: true,
        icon: '',
        innerText: '取消',
        size: 'small'
      }
    }
    return {
      versionId: '',
      forceUpdateVal: false,
      // doc: http://www.form-create.com/v2/element-ui/global.html
      formOptions: defaultOptions,
      fApi: {},
      model: {},
      rule: [],
      originRule: {},
      key: this.$props.pKey,
      versionEnable: false,
      versions: [],
      loading: true,
      submitLoading: false,
      realComputeMap: this.$props.computeMap || {},
      computeMapResource: {}
    }
  },
  computed: {
    formClass: function() {
      const arr = [
        'vform-content',
        this.loading ? 'form-loading' : '',
        (this.formOptions.form || {}).size || ''
      ]
      return arr.join(' ')
    }
  },
  created() {
    this.init()
    this.formRule()
  },
  methods: {
    init() {
      this.formOptions = this._.merge(this.formOptions, this.option)
    },
    cloneRule(rule) {
      return this._.cloneDeep(rule)
    },
    formRule(force_request = false) {
      if (this.$props.rules.length > 0 && !force_request) {
        this.formMaker(this.$props.rules)
        this.versionEnable = this.$props.dataVersionEnable
        this.versions = this.$props.dataVersions
        this.loading = false
        return
      }
      const params = { ...this.$route.query, ...(this.versionId ? { _ver: this.versionId } : {}) }
      this.loading = true
      request({
        url: this.$props.ruleApi,
        method: 'get',
        params
      }).then(res => {
        const data = res.payload.form
        this.versionEnable = res.payload.version_enable
        this.versions = res.payload.version_list
        this.rule = []
        this.formMaker(data)
        this.loading = false
        this.realComputeMap = res.payload.compute_map
        this.formOptions = this._.merge(this.formOptions, res.payload.form_ui || {})
      }).catch(() => {
        this.loading = false
      })
    },
    formMaker(rules) {
      rules.forEach(item => {
        const rule = maker(item)
        // if (this.originRule[item.field.split('-').join('.')].type === 'json') {
        //   rule.value = this.originRule[item.field.split('-').join('.')].value
        //   console.log('mnnnnnn', JSON.stringify(rule), rule, this.originRule[item.field.split('-').join('.')])
        // }
        rule.on = {
          ...rule.on,
          change: (inject, newVal, oldVal) => this.onChange(item.field, newVal, item, oldVal)
        }

        if (item.type === 'select' && item.props.remote === true) {
          rule.props.remoteMethod = this._.debounce((vm, val) => this.selectRemote(vm.self.field, val, vm.self), 200)
        }
        if (this.$route.query[item.field]) {
          rule.value = this.parseType(item, this.$route.query[item.field])
          console.log('VForm formMarker', rule, this.$route.query[item.field])
        }
        this.rule.push(rule)
        if (item.info && !(this.formOptions.form || {}).inline) {
          item.className = (item.className || '') + 'hasInfo'
          this.rule.push({
            type: 'form-item-info',
            native: true,
            props: {
              infoHtml: item.info,
              options: this.formOptions
            }
          })
          delete item.info
        }
      })
    },
    parseType(item, value) {
      let reference = item.value
      if (type(reference) === 'object') {
        return reference
      }
      if (item.options) {
        reference = item.options[item.options.length - 1].value
      }
      if (type(reference) === 'string' && type(reference) !== 'object') {
        return value + ''
      }
      if (type(reference) === 'number') {
        if (type(value) === 'array') {
          console.log(value, item)
          return value.map(each => {
            if ((each + '').indexOf('.') > -1) {
              return parseFloat(each)
            }
            return parseInt(each)
          })
        }
        if ((value + '').indexOf('.') > -1) {
          return parseFloat(value)
        }
        return parseInt(value)
      }
      return value
    },
    onCancel() {
      this.$router.back(-1)
    },
    onSubmit: _.throttle(function(formData) {
      const validRet = this.validate(this.fApi)
      console.log('validRet', validRet)
      console.warn('formData', JSON.stringify(formData))
      if (!validRet) {
        return
      }
      const data = {}
      for (const i in formData) {
        data[i.split('-').join('.')] = formData[i]
      }
      this.submitLoading = true
      request({
        url: this.$props.saveApi,
        method: 'post',
        data: data
      }).then(res => {
        this.submitLoading = false
        Message({
          message: (res.message || '操作成功').replace(/\n/g, '<br/>'),
          type: 'success',
          duration: 5 * 1000,
          dangerouslyUseHTMLString: true
        })
        this.$props.afterSubmit(res)
        if (history.length > 1) {
          this.routerBack && setTimeout(() => {
            this.$router.back(-1)
          }, 500)
        } else {
          setTimeout(() => {
            window.close() // 关闭当前tab窗口
          }, 500)
        }
      }).catch(_ => (this.submitLoading = false))
    }, 1000, { trailing: false }),
    validate(fApi = this.fApi) {
      let validRet = true
      for (let i = 0; i < fApi.fields().length; i++) {
        if (!fApi.hiddenStatus(fApi.fields()[i])) {
          fApi.validateField(fApi.fields()[i], (errMsg) => {
            validRet = validRet && !errMsg
          })
        }
      }
      if (validRet) {
        return fApi.formData()
      } else {
        showEleByClassName('is-error')
        return false
      }
    },
    onFormReload() {
      console.log('onFormReload')
      Object.keys(this.realComputeMap).forEach(key => this.formCompute(this.safeField(key)))
      this.onFormChange()
    },

    onChange(field, newVal, row, oldVal) {
      console.log('onChange', field, newVal)
      this.formCompute(field)
      this.onFormChange(field, newVal)
    },
    formCompute(field) {
      const _field = this.realField(field)
      if (this.realComputeMap[_field] === undefined) {
        return
      }
      const formData = this.fApi.formData()
      this.computeMapResource = this.computeMapResource || {}
      // 循环处理set项
      Object.keys(this.realComputeMap[_field]).forEach(set_field => {
        const _set_field = this.safeField(set_field)
        // 注册原始数据, 方便复原
        if (this.computeMapResource[_set_field] === undefined) {
          this.computeMapResource[_set_field] = Object.assign({}, this.fApi.getRule(_set_field))
        }

        const resource = this.computeMapResource[_set_field]

        let setData = {}
        const cell = this.realComputeMap[_field][set_field]
        cell.forEach(each => {
          const cell_check = whereFilter(formData, each.when, true)
          const set = {}
          Object.keys(each.set).forEach(k => {
            if (k === 'type') {
              set['hidden'] = cell_check
            }
            if (cell_check) {
              set[k] = each.set[k]
            }
          })
          if (Object.keys(set).length > 0) {
            setData = Object.assign(setData, set)
          }
        })
        console.log('VForm sets', setData)
        // options 备选项动态合并
        if (setData.options === undefined && resource.options !== undefined && resource.options.length > 0) {
          setData.options = resource.options
        }

        if (Object.keys(setData).length === 0) {
          return
        }

        // 更新规则
        this.fApi.updateRule(_set_field, Object.assign({}, setData, { value: undefined }), true)

        // value 复用
        const options_type = ['select', 'checkbox', 'cashcard']
        const setVal = (setData.options && options_type.indexOf(resource.type) > 0)
          ? this._.intersection(resource.value, arrayColumn(setData.options, 'value', function(cell) {
            return cell.disabled === undefined || cell.disabled === false
          }))
          : (setData.value !== undefined ? setData.value : resource.value)
        this.fApi.setValue(_set_field, setVal)

        // 处理显示状态
        if (setData.hidden !== undefined) {
          this.fApi.hidden(this.fApi.hiddenStatus(field) ? true : setData.hidden, _set_field)
        }
        console.log('VFrom', _set_field, setData)

        this.formCompute(_set_field)
        // 清理变动项验证状态
        this.fApi.clearValidateState(_set_field)
        if (this.forceUpdateVal && this.originRule[_set_field.split('-').join('.')] !== undefined) {
          this.fApi.setValue(_set_field, this.originRule[_set_field.split('-').join('.')].value)
        }
      })
    },
    selectRemote(field, keyWord, row) {
      const kw = typeof keyWord === 'object' ? keyWord.join(',') : keyWord
      if (kw === '') {
        return
      }
      request({
        url: strVarReplace(this.fApi.model()[field].props.selectApi, this.fApi.formData()),
        method: 'get',
        params: { kw }
      }).then(res => {
        const ret = JSON.stringify(res.payload) === '{}' ? [] : res.payload
        const rule = this.fApi.getRule(field)
        if (rule.props.multiple) {
          const selectedOptions = rule.options.filter(item => rule.value.indexOf(item.value) > -1)
          const resultOptions = (ret || []).filter(item => rule.value.indexOf(item.value) === -1)
          rule.options = [...selectedOptions, ...resultOptions]
        } else {
          rule.options = ret
        }
      })
    },
    changeVersion(id) {
      this.forceUpdateVal = true
      this.formRule(true)
    },
    onFormMounted($f) {
      Object.keys(this.realComputeMap).forEach(key => this.formCompute(this.safeField(key)))
      this.onFormChange()
      this.$emit('mounted', $f)
    },
    onFormChange(field = '', newVal) {
      this.$emit('input', this.fApi)
      this.$emit('change', this.fApi, field, newVal)
    },
    safeField(field) {
      return field.replace('.', '-')
    },
    realField(field) {
      return field.replace('-', '.')
    },
    parentUpdateRuleHook(data, compute_map) {
      this.rule = []
      console.log('xxxxxxxxxxxx', data, compute_map)
      this.formMaker(data)
      this.realComputeMap = compute_map
      this.forceUpdateVal = true
    }
  }
}

</script>

<style lang="less" scoped>
.form-loading {
  min-height: 500px;
}
/deep/ .el-form-item.is-error.hasInfo{
  margin-bottom: 40px;
}
/deep/ .el-cascader-menu__wrap{
  height:100%;
}
.mini /deep/ .el-form-item.is-error.hasInfo{
  margin-bottom: 30px;
}
// 注意：如果item隐藏了，后续的提示区域也要隐藏
/deep/ .__fc_h + .formItem-tip{
  display: none;
}
</style>
