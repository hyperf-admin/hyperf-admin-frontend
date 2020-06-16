<template>
  <div class="sub-group">
    <div :class="{'sub-form-content': true, 'sub-form-border': repeat && !inlineForm, 'sub-form-inline': inlineForm}">
      <Draggable
        v-model="dragKeyList"
        v-bind="{ animation: 500, handle: '.icon-drag' }"
        @update="datadragEnd"
      >
        <transition-group>
          <div v-for="(key, index) in dragKeyList" :key="`key${key}`" class="repeat-cell">
            <i v-if="sort && repeat" class="icon-drag oms-icon-sort" />
            <VForm
              :key="key"
              ref="form"
              class="sub-form-body"
              :option="formOptions"
              :rules="cacheRule[key]"
              :compute-map="computeMap"
              @mounted="($f) => add$f(index, key, $f)"
              @change="($f, field, newVal) => onChange($f, field, newVal)"
            />
            <i v-if="repeat" class="icon-remove el-icon-remove-outline" @click="deleteRow(key)" />
          </div>
        </transition-group>
      </Draggable>
      <i v-if="repeat" class="icon-add el-icon-circle-plus-outline" @click="addRule('add')" />
    </div>
  </div>
</template>
<script>
import Draggable from 'vuedraggable'
import { Message } from 'element-ui'

export default {
  name: 'SubForm',
  components: {
    VForm: () => import('@/components/scaffold/VForm.vue'),
    Draggable
  },
  inject: {
    elForm: { default: '' },
    elFormItem: { default: '' }
  },
  props: {
    disabled: Boolean,
    sort: Boolean,
    repeat: Boolean,
    border: { type: Boolean, default: true },
    field: { type: String, default: '' },
    value: { type: [Array, Object], default: _ => [] },
    option: { type: Object, default: _ => {} },
    rule: { type: Object, default: _ => {} },
    rules: { type: Array, default: _ => [] },
    max: { type: Number, default: 10 },
    min: { type: Number, default: 1 },
    computeMap: { type: Object, default: _ => {} }
  },
  data() {
    return {
      len: 0,
      group$f: {},
      // 表单渲染规则映射
      cacheRule: {},
      // 基于cacheRule变化
      dragKeyList: [],
      inlineForm: false,
      formOptions: {
        injectEvent: true,
        submitBtn: false,
        resetBtn: false
      }
    }
  },
  computed: {
    formRule() {
      if (this.rule) return [this.rule]
      else if (this.rules) return this.rules
      return []
    }
  },
  watch: {
    value: {
      handler: function(n) {
        if (n.length === 0) {
          n = [this.rule ? this.rule.value || '' : this.rules.map(item => {
            return item.value || ''
          })]
        }

        const keys = this.dragKeyList
        const total = keys.length; const len = total - n.length
        if (len < 0) {
          for (let i = len; i < 0; i++) {
            this.addRule(keys[i])
          }
          for (let i = 0; i < total; i++) {
            this.setValue(this.group$f[keys[i]], n[i])
          }
        } else {
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              this.removeRule(keys[total - i - 1])
            }
          }
          n.forEach((val, i) => {
            this.setValue(this.group$f[keys[i]], n[i])
          })
        }
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.formOptions = Object.assign(this.formOptions, this.option)
    if (this.formOptions.form && this.formOptions.form.inline) {
      this.inlineForm = true
    }
    // 重写 elFormItem 实例的 validate 方法
    this.elFormItem && (this.elFormItem.validate = (trigger, callback = () => {}) => {
      if (this.validate()) {
        callback()
      } else {
        // 错误信息和未通过校验的字段。当前版本message参数暂时固定
        callback('subForm validate error', [this.field])
        // 被校验的表单项 prop 值，校验是否通过，错误消息（如果存在）, 当前版本message参数暂时固定
        this.elForm && this.elForm.$emit('validate', this.field, true, 'subForm validate error')
      }
    })
  },
  methods: {
    validate() {
      // 内置校验方法
      let validRet = true
      const forms = this.$refs.form
      forms.forEach(form => {
        if (!form.validate()) {
          validRet = false
        }
      })
      return validRet
    },
    datadragEnd(e) {
      e.preventDefault()
      this.updateData()
    },
    // 字段名的中划线和点互相转换
    transformFormData(formData, str1, str2) {
      const data = {}
      for (const i in formData) {
        data[i.replace(str1, str2)] = formData[i]
      }
      return data
    },
    updateData() {
      const newData = []
      for (const key of this.dragKeyList) {
        if (this.rule) {
          this.group$f[key] ? newData.push(this.group$f[key].formData()[this.rule.field]) : ''
        } else {
          this.group$f[key] ? newData.push(this.transformFormData(this.group$f[key].formData(), '-', '.')) : {}
        }
      }
      this.$emit('input', newData)
      this.$emit('change', newData, this.value)
    },
    onChange($f, field, newVal) {
      if (field) {
        this.updateData()
      }
    },
    setValue($f, value) {
      if (this.rule) {
        const fields = $f.fields()
        if (!fields[0]) return
        $f.setValue(fields[0], value)
      } else {
        $f.setValue(this.transformFormData(value, '.', '-'))
      }
    },
    addRule(falg) {
      if (falg && this.dragKeyList.length + 1 > this.max) {
        return Message.warning(`最多只能添加${this.max}个`)
      }
      const rule = this.copyRule()
      const key = `ruleKey_${++this.len}`
      this.$set(this.cacheRule, key, rule)
      this.dragKeyList.push(key)
    },
    // 挂载钩子
    add$f(i, key, $f) {
      this.group$f[key] = $f
      this.setValue($f, this.value[i])
      this.updateData()
      // 解决初始化触发校验的bug
      this.$nextTick(() => {
        $f.clearValidateState()
      })
    },
    deleteRow(key) {
      if (this.dragKeyList.length - 1 < this.min) {
        return Message.warning(`最少要保留${this.min}个`)
      }
      this.removeRule(key)
    },
    removeRule(key) {
      this.$delete(this.cacheRule, key)
      delete this.group$f[key]
      this._.remove(this.dragKeyList, item => item === key)
      this.updateData()
      this.$emit('remove', this.group$f)
    },
    copyRule() {
      return this._.cloneDeep(this.formRule)
    }
  }
}
</script>
<style lang="less" scoped>
// 普通模式
.sub-form-content {
  .repeat-cell:last-child {
    margin-bottom: -15px;
  }
  i {
    font-size: 30px;
    color: #999;
    vertical-align: middle;
    cursor: pointer;
    &.icon-remove {
      color: #f56c6c;
    }
    &.icon-add {
      margin-top: 8px;
      color: #67c23a;
    }
    &.icon-drag {
      cursor: move;
    }
  }
  /deep/ .el-form-item {
    margin-bottom:20px
  }
  /deep/ .form-create .el-form-item .el-form-item {
    margin-bottom:20px
  }
  // 这个组件行内模式未垂直居中
  /deep/ .el-color-picker {
    vertical-align: middle;
  }
}
// 多行模式 加 border
.sub-form-border {
  .repeat-cell {
    display: flex;
    align-items: center;
  }
  .sub-form-body {
    flex: 1 1 auto; //可放大 可缩小
    border: 1px dashed #DCDFE6;
    border-radius: 8px;
    padding: 20px 10px 10px 10px;
    margin-bottom: 10px;
  }
  .icon-remove {
    margin-left: 10px;
  }
  .icon-drag {
    margin-right: 10px;
  }
}
// form inline模式
.sub-form-inline {
  .sub-form-body {
    display: inline-block;
  }
}
</style>
