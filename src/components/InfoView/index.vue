<!--
  查看详情组件
  props: confirmTitle 操作命名
  props: cancelTitle 操作命名
  props: infoData 数据
  props: isShowBtn 是否线上按钮
  $emit: handle-confirm 确认操作
  $emit: handle-cancel 取消操作
-->
<template>
  <div>
    <el-row :gutter="100" type="flex" style="flex-wrap: wrap">
      <el-col v-for="(item,index) in infoData" :key="index" :span="getSpan(item)">
        <InfoCard :card-data="item" />
      </el-col>
    </el-row>
    <el-button v-if="isShowBtn" type="primary" @click="$emit('handle-confirm')">{{ confirmTitle }}</el-button>
    <el-button v-if="isShowBtn" type="default" @click="$emit('handle-cancel')">{{ cancelTitle }}</el-button>
  </div>
</template>

<script>
import InfoCard from './item'

export default {
  name: 'App',
  components: { InfoCard },
  props: {
    infoData: {
      type: Array,
      default: () => []
    },
    confirmTitle: {
      type: String,
      default: () => '通过'
    },
    cancelTitle: {
      type: String,
      default: () => '取消'
    },
    isShowBtn: {
      type: Boolean,
      default: () => true
    }
  },
  data() {
    return {
      list: []
    }
  },
  created: function() {
  },
  methods: {
    getSpan(data) {
      if (data.column && data.column === 2) {
        return 12
      } else {
        return 24
      }
    }
  }
}
</script>

<style scoped>

</style>
