<template>
  <div class="ruleFields">
    <el-form ref="_form" :model="data" :rules="rules" inline size="small">
      <el-form-item prop="name">
        <el-select
          v-model="data.name"
          placeholder="请选择"
          @change="change"
        >
          <el-option v-for="item in factorOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="symbol">
        <el-select
          v-model="data.symbol"
          placeholder="符号"
          style="width: 80px"
          @change="change"
        >
          <el-option v-for="item in symbolOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="value">
        <el-input
          v-model="data.value"
          style="width: 100px"
          placeholder="数值"
          @input="change"
        />
      </el-form-item>
      <i class="icon-child oms-icon-addChild" :class="{'addChildVisible': !addChildVisible}" @click="addChild" />
      <i class="icon-remove el-icon-remove-outline" @click="deleteRow" />
      <i class="icon-add el-icon-circle-plus-outline" @click="addRow" />
    </el-form>
  </div>
</template>
<script>
export default {
  props: {
    data: { type: Object, default: _ => {} },
    addChildVisible: { type: Boolean, default: true },
    // 符号配置
    symbolOptions: { type: Array, default: _ => [] },
    // 类型配置
    factorOptions: { type: Array, default: _ => [] }
  },
  data() {
    const rules = {
      name: [
        { required: true, message: '请选择', trigger: 'change' }
      ],
      symbol: [
        { required: true, message: '请选择', trigger: 'change' }
      ],
      value: [
        { required: true, message: '请输入', trigger: ['blur', 'change'] }
      ]
    }
    return {
      rules
    }
  },
  methods: {
    validate() {
      // 内置校验方法
      let validRet = true
      this.$refs._form.validate((valid) => {
        if (!valid) {
          validRet = false
        }
      })
      return validRet
    },
    addRow() {
      this.$emit('add')
    },
    addChild() {
      this.$emit('addChild')
    },
    deleteRow() {
      this.$emit('delete')
    },
    getText(data) {
      const optionName = this.factorOptions.filter(item => item.value === data.name)[0].label
      return `${data.logicName}${optionName}${data.symbol}${data.value}`
    },
    change() {
      this.$emit('change')
    }
  }
}
</script>
<style scoped lang="less">
.ruleFields {
  padding: 5px 12px 9px;
  background: #f3f3f4;
  display: inline-block;
  border-radius: 4px;

  &/deep/ .el-form-item{
    margin-bottom: 0
  }
  &/deep/ .el-form-item__content{
    line-height: 40px;
  }
}
i {
  font-size: 30px;
  color: #999;
  vertical-align: middle;
  cursor: pointer;
  &.icon-child{
    color: #ccc;

    &.addChildVisible{
      visibility: hidden;
    }
  }
  &.icon-remove {
    color: #f56c6c;
  }
  &.icon-add {
    color: #67c23a;
  }
}
</style>
