<template>
  <!-- 组件最外层标记位 -->
  <div :class="{'_ruleCreate_root': level === 1}">
    <template v-for="(rule, index) in ruleList">
      <div :key="`root${index}`" class="rule-row">
        <RuleIndent
          v-model="rule.logicName"
          :level="level"
          :total-level="2"
          :first="index === 0"
          :last="index === ruleList.length - 1"
          :has-child="rule.children && rule.children.length > 0"
          @change="change()"
        />
        <RuleFields
          ref="_ruleForm"
          :data="rule"
          :add-child-visible="level === 1"
          :symbol-options="symbolOptions"
          :factor-options="factorOptions"
          @addChild="addChild(index, rule, ruleList)"
          @delete="deleteRow(index, ruleList)"
          @add="addRow(index, ruleList)"
          @change="change()"
        />
      </div>
      <!-- 递归组件 -->
      <RuleCreate
        v-if="rule.children && rule.children.length > 0"
        :key="`child${index}`"
        ref="_ruleCreate"
        v-model="rule.children"
        class="_child_root"
        :class="{'last-row-child': index === ruleList.length -1}"
        :level="level + 1"
        :symbol-options="symbolOptions"
        :factor-options="factorOptions"
        @change="changeRecursive"
      />
    </template>
    <div v-if="level === 1" class="preview">规则预览：{{ previewText }}</div>
    <div v-if="level === 1" class="el-form-item__error">{{ validateMessage }}</div>
  </div>
</template>

<script>
import RuleFields from './RuleFields'
import RuleIndent from './RuleIndent'
import { uniqueId } from '@form-create/utils'
// import { testJson } from './test'
export default {
  name: 'RuleCreate',
  components: {
    RuleFields,
    RuleIndent,
    // 递归组件
    RuleCreate: () => import('@/components/CustomForm/RuleCreate/Index.vue')
  },
  inject: {
    elForm: { default: '' },
    elFormItem: { default: '' }
  },
  props: {
    value: { type: Array, default: _ => [] },
    // 递归层级，从1开始
    level: { type: Number, default: _ => 1 },
    // 符号配置
    symbolOptions: { type: Array, default: _ => [] },
    // 因素配置
    factorOptions: { type: Array, default: _ => [] }
  },
  data() {
    const defaultConfig = { logicName: '&&', name: '', symbol: '', value: '' }
    return {
      validateMessage: '',
      defaultConfig,
      previewText: '',
      ruleList: []
    }
  },
  watch: {
    value: {
      handler(val) {
        console.warn('ruleCreate receive value:', val)
        if (Array.isArray(val) && val.length > 0) {
          this.ruleList = val
        } else {
          this.ruleList = [{ ...this.defaultConfig }]
        }
      },
      immediate: true,
      deep: true
    },
    previewText() {
      console.warn('previewText change:', this.previewText)
      this.$emit('ruleTextChange', this.previewText)
    }
  },
  created() {
    if (this.level === 1) {
      // 重写 elFormItem 实例的 validate 方法
      this.elFormItem && (this.elFormItem.validate = (trigger, callback = () => {}) => {
        console.warn('ruleCreate校验结果', this.validate())
        if (this.validate()) {
          this.validateMessage = ''
          callback()
        } else {
          this.validateMessage = '请填写正确的规则'
          callback('请填写正确的规则', [this.field])
          this.elForm && this.elForm.$emit('validate', this.field, true, '请填写正确的规则')
        }
      })
    }
  },
  mounted() {
    this.change()
  },
  methods: {
    getKey() {
      return uniqueId()
    },
    addRow(key, list) {
      // TODO 插入当前行后面
      list.push({ ...this.defaultConfig })
      this.change()
    },
    // 删除节点
    deleteRow(key, list) {
      if (list.length === 1 && this.level === 1) {
        return this.$message.warning('最少要保留一条！')
      }
      this.$delete(list, key)
      this.change()
    },
    // 添加子节点
    addChild(key, item, list) {
      if (item.children) {
        item.children.push({ ...this.defaultConfig })
      } else {
        this.$set(item, 'children', [{ ...this.defaultConfig }])
      }
      this.change()
    },
    validate() {
      // 内置校验方法
      let validRet = true
      const _ruleForms = this.$refs._ruleForm
      _ruleForms.forEach(form => {
        validRet = form.validate() && validRet
      })
      // 加上递归组件的校验结果
      const _ruleCreates = this.$refs._ruleCreate
      if (_ruleCreates) {
        _ruleCreates.forEach(form => {
          validRet = form.validate() && validRet
        })
      }
      return validRet
    },
    getPreviewText() {
      const getStr = (list, level = 1) => {
        const str = []
        list.map((item, index) => {
          let text = ''
          let type = ''
          const { name, symbol, logicName, value } = item
          try {
            type = this.factorOptions.filter(item => item.value === name)[0].label
          } catch (error) {
            // console.log(error)
          }
          text = (`${type}${symbol}${value}`)
          if (item.children && item.children.length > 0) {
            text = `(${text} ${getStr(item.children, level + 1)})`
          }
          // 不是第一个 并且不是根节点
          if (!(index === 0 && level === 1)) {
            text = ` ${logicName} ${text}`
          }
          str.push(text)
        })
        return str.join('')
      }
      this.previewText = getStr(this.ruleList, 1)
    },
    change() {
      if (this.level === 1) {
        this.getPreviewText()
      }
      this.$emit('input', this.ruleList)
      this.$emit('change', this.ruleList)
    },
    changeRecursive(val) {
      // 递归组件的change 注意层级事件的区别
      this.change()
    }
  }
}
</script>
<style scoped lang="less">
._ruleCreate_root{
  width: 740px;
}
i {
  font-size: 30px;
  color: #999;
  vertical-align: middle;
  cursor: pointer;
  &.icon-child{
    color: #ccc;
  }
  &.icon-remove {
    color: #f56c6c;
  }
  &.icon-add {
    color: #67c23a;
  }
}
._ruleCreate_root/deep/ ._child_root.last-row-child {
  .indent{
    border-left-color:#fff;
  }
}
.preview {
  border-top: 1px dashed #999;
  margin-top: 10px;
  padding: 10px 0;
  line-height: 18px;
  font-size: 14px;
}
</style>
