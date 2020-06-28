<template>
  <div>
    <el-input
      ref="iconSelect"
      v-model="name"
      v-popover:popover
      placeholder="请选择图标"
      :clearable="true"
      size="small"
      @focus="popoverShowFun"
      @change="onChange"
    >
      <template slot="prepend">
        <i v-if="prefixIcon.indexOf('oms-icon') > -1" :class="prefixIcon" />
        <icon v-else :icon="prefixIcon" />
      </template>
    </el-input>
    <el-popover
      ref="popover"
      trigger="click"
      placement="bottom-start"
      :width="popoverWidth || 300"
      style="padding: 0"
    >
      <el-scrollbar>
        <div class="icon-content">
          <div v-for="(item, index) in icons" :key="index" :class="{active: name === item, 'icon-item': true}" :title="item" @click="choseOne(item)">
            <i v-if="item.indexOf('oms-icon') > -1" :class="item" />
            <icon v-else :icon="item" />
          </div>
        </div>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<script>
import Icon from '@/components/Common/icon'
import { elIconList, omsIconList } from './iconList'
export default {
  name: 'IconSelect',
  components: { Icon },
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
    const icons = [
      'example', 'dashboard', 'eye', 'eye-open', 'form', 'link', 'nested', 'password', 'table', 'tree', 'user',
      ...elIconList,
      ...omsIconList
    ]
    return {
      name: '',
      data: undefined,
      popoverWidth: '',
      popoverShow: false,
      prefixIcon: '',
      icons
    }
  },
  watch: {
    value: {
      handler: function(now, old) {
        this.name = now
        this.prefixIcon = now
      },
      immediate: true
    }
  },
  methods: {
    onChange: function() {
      if (this.icons.indexOf(this.name) === -1 && this.name !== '') {
        this.$message({
          message: '不存在的icon名 ' + this.name,
          type: 'warning'
        })
        this.name = this.value
        this.prefixIcon = this.value
        return
      }
      const newValue = this.name
      this.$emit('input', newValue)
      this.$emit('change', newValue)
    },
    popoverShowFun: function() {
      this.popoverWidth = this.$refs.iconSelect.$el.clientWidth < 300 ? 300 : this.$refs.iconSelect.$el.clientWidth
      this.popoverShow = !this.popoverShow
    },
    choseOne(item) {
      console.log(item)
      this.prefixIcon = item
      this.name = item
      this.onChange()
    }
  }
}
</script>

<style scoped lang="less">
.icon-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-height: 300px;
  padding: 12px;
}
.icon-item {
  text-align: center;
  float: left;
  padding: 5px 10px;
  font-size: 18px;
  cursor: pointer;
}
.active {
  background: #f5f7fa;
  color: #409eff;
}
</style>
