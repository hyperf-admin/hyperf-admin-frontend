<template>
  <div>
    <template v-if="type === 'step'">
      <Version v-model="versionId" :rule="rules" :show="versionEnable && versions.length > 0" :versions="versions" @change="changeVersion">
        <el-steps :active="active" finish-status="success" simple>
          <el-step v-for="(item, index) in rule" :key="index" :title="item.title" />
        </el-steps>
        <div class="step-form-body">
          <v-form
            v-for="(item, index) in rule"
            v-show="(index + 1) === active"
            :key="index"
            ref="_target"
            v-model="forms[index]"
            :rules="item.rule"
            :option="options"
            :compute-map="realComputeMap"
            @change="onFormChange"
          />
        </div>
        <div class="step-form-button">
          <template v-if="active > 1">
            <el-button type="info" size="small" @click="prev">上一步</el-button>
          </template>
          <template v-if="active < rule.length">
            <el-button size="small" @click="next">下一步</el-button>
          </template>
          <template v-if="active === rule.length">
            <el-button type="success" size="small" :loading="loading" @click="onSubmit">提交</el-button>
          </template>
        </div>
      </Version>
    </template>
    <template v-else-if="type === 'card'">
      <Version v-model="versionId" :rule="rules" :show="versionEnable && versions.length > 0" :versions="versions" @change="changeVersion">
        <el-card v-for="(item, index) in rule" :key="index" style="margin-bottom: 15px">
          <div slot="header">{{ item.title }}</div>
          <v-form
            ref="_target"
            v-model="forms[index]"
            :rules="cloneRule(item.rule)"
            :option="getFormOption()"
            :compute-map="realComputeMap"
            @change="onFormChange"
          />
        </el-card>
        <div class="step-form-bottom">
          <el-button :type="realOptions.submitBtn.type || 'primary'" :size="realOptions.submitBtn.size || 'small'" :loading="loading" @click="onSubmit">{{ realOptions.submitBtn.innerText || '提交' }}</el-button>
          <el-button :size="realOptions.resetBtn.size || 'small'" @click="onCancel">{{ realOptions.resetBtn.innerText || '取消' }}</el-button>
        </div>
      </Version>
    </template>
    <template v-else>
      <span>not support type {{ type }}</span>
    </template>
  </div>
</template>
<script>
import VForm from '@/components/scaffold/VForm'
import request from '@/utils/request'
import { Message } from 'element-ui'
import Version from '@/components/Common/Version'
export default {
  name: 'StepForm',
  components: {
    VForm,
    Version
  },
  props: {
    type: {
      type: String,
      default: 'card'
    },
    rules: {
      type: Array,
      default: _ => []
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
      default: _ => []
    },
    routerBack: {
      type: Boolean,
      default: true
    },
    dataVersionEnable: {
      type: Boolean,
      default: false
    },
    dataVersions: {
      type: Array,
      default: _ => []
    },
    computeMap: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Object,
      default: _ => {}
    }
  },
  data() {
    return {
      versionId: '',
      newVersionWatcher: '',
      changedQuery: '',
      realOptions: this._.merge({
        injectEvent: true,
        info: {
          type: 'popover' // popover,tooltip
        },
        submitBtn: {
          show: false
        },
        resetBtn: {
          show: false
        }
      }, this.$props.options),
      rule: [],
      forms: [],
      active: 1,
      versionEnable: false,
      versions: [],
      loading: false,
      source: [],
      realComputeMap: this.$props.computeMap
    }
  },
  created: function() {
    this.formRule()
  },
  // watch: {
  //   rule: function(nv, ov) {
  //     for (var i = 0; i < this.$refs._target.length; i++) {
  //         console.log(nv[i], this.$refs._target[i].rules[1].value, this.$refs._target[i])
  //         // this.$refs._target[i].parentUpdateRuleHook(nv[i].rule)
  //         // console.log(this.$refs._target[i].rule)
  //         // this.$refs._target[i].formRule(true)
  //       }
  //   }
  // },
  methods: {
    getFormOption() {
      return Object.assign({}, this.realOptions, {
        injectEvent: true,
        submitBtn: {
          show: false
        },
        resetBtn: {
          show: false
        }
      })
    },
    cloneRule(rule) {
      return this._.cloneDeep(rule)
    },
    formRule(force_request = false) {
      if (this.$props.rules.length > 0 && !force_request) {
        this.ruleGroup(this.$props.rules)
        this.versionEnable = this.$props.dataVersionEnable
        this.versions = this.$props.dataVersions
        this.source = this.$props.rules
        return
      }
      request({
        url: this.$props.ruleApi,
        method: 'get',
        params: this.changedQuery || this.$route.query
      }).then(res => {
        this.ruleGroup(res.payload.form)
        this.source = res.payload.form
        this.versionEnable = res.payload.version_enable
        this.versions = res.payload.version_list
        this.realComputeMap = res.payload.compute_map
      })
    },
    ruleGroup(rules, callback = '') {
      const group = []
      const index = []
      for (let i = 0; i < rules.length; i++) {
        if (rules[i].section !== undefined) {
          group.push({
            title: rules[i].section,
            rule: []
          })
          index.push(i)
        }
      }
      index.push(rules.length)
      if (index[0] !== 0) {
        index.unshift(0)
        group.unshift({
          title: '基础信息',
          rule: []
        })
      }
      for (let i = 0; i < index.length - 1; i++) {
        group[i].rule = rules.slice(index[i], index[i + 1])
      }
      console.log('group', group)
      this.rule = group
      if (callback) {
        callback(group, this.realComputeMap)
      }
    },
    onSubmit() {
      let formData = {}
      let validRet = true
      for (let i = 0; i < this.forms.length; i++) {
        const item = this.forms[i]
        validRet = this.validate(item)
        if (validRet === false) {
          return
        }
        formData = Object.assign(formData, validRet)
      }
      const data = {}
      for (const i in formData) {
        data[i.split('-').join('.')] = formData[i]
      }
      this.loading = true
      request({
        url: this.$props.saveApi,
        method: 'post',
        data: data
      }).then(res => {
        this.loading = false
        Message({
          message: res.message || '操作成功',
          type: 'success',
          duration: 5 * 1000
        })
        this.$props.afterSubmit(res)
        this.routerBack && setTimeout(() => {
          this.$router.back(-1)
        }, 500)
      }).catch(exception => {
        this.loading = false
      })
    },
    onFormChange(fApi, field, newVal) {
      this.$emit('change', fApi, field, newVal)
    },
    validate(fApi) {
      let validRet = true
      let data = {}
      fApi.validate((valid) => {
        if (valid) {
          data = fApi.formData()
        } else {
          validRet = false
        }
      })
      if (!validRet) {
        setTimeout(() => {
          const isError = document.getElementsByClassName('is-error')
          isError[0].scrollIntoView({
            block: 'center', // 值有start,center,end,nearest，当前显示在视图区域中间
            behavior: 'smooth' // 值有auto,instant,smooth，缓动动画（当前是慢速的）
          })
          // isError[0].querySelector('input').focus()
        }, 100)
      }
      if (validRet) {
        return data
      }
      return false
    },
    next() {
      console.log('forms', this.forms)
      const validRet = this.validate(this.forms[this.active - 1])
      if (validRet === false) {
        return
      }
      this.active++
    },
    prev() {
      this.active--
    },
    changeVersion(id) {
      const params = { ...this.$route.query, ...(id ? { _ver: id } : {}) }
      request({
        url: this.$props.ruleApi,
        method: 'get',
        params: params
      }).then(res => {
        this.ruleGroup(res.payload.form, (rules, compute_map) => {
          for (var i = 0; i < this.$refs._target.length; i++) {
            this.$refs._target[i].parentUpdateRuleHook(rules[i].rule, compute_map)
          }
        })
        this.source = res.payload.form
        this.versionEnable = res.payload.version_enable
        this.versions = res.payload.version_list
        this.realComputeMap = res.payload.compute_map
      })
    },
    onCancel() {
      this.$router.back(-1)
    }
  }
}
</script>

<style scoped>
.step-form-body {
  padding: 20px 0;
}
.step-form-button {
  padding: 0 50px;
}
</style>
