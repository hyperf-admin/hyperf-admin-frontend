<template>
  <el-col v-bind="{...col}">
    <el-card v-loading="loading" class="data-card" shadow="never">
      <span class="card-actions">
        <i v-if="refreshable" class="el-icon-refresh" @click="() => handleRefresh()" />
      </span>
      <div v-if="title" class="title">{{ title }}
        <el-tooltip v-if="tips.length > 0" effect="dark" :content="tips" placement="top-start">
          <i class="el-icon-question" />
        </el-tooltip>
      </div>
      <slot :newData="newData" />
    </el-card>
  </el-col>
</template>
<script>
import request from '@/utils/request'

export default {
  props: {
    id: { type: [Number, String], default: '' },
    // card title
    title: { type: [String, Number], default: '' },
    // title的解释
    tips: { type: String, default: '' },
    // 布局规则
    col: { type: Object, default: _ => {} },
    // 卡片内的数据
    cardData: { type: Array, default: _ => [] },
    // 是否可刷新卡片数据
    refreshable: { type: Boolean, default: false },
    // 获取数据的接口
    dataApi: { type: String, default: '' }
  },
  provide() {
    return {
      dataCard: this
    }
  },
  data() {
    return {
      loading: false,
      newData: {}
    }
  },
  watch: {
    cardData: {
      handler(value = []) {
        this.newData = value
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 可被子组件截获 追加刷新的附加参数或自定义刷新函数
    handleRefresh() {
      this.refresh({})
    },
    // 刷新card内的数据
    refresh(params = {}) {
      console.warn('refresh:', JSON.stringify(params))
      if (!this.dataApi) {
        return false
      }
      request({
        url: this.dataApi,
        data: params
      }).then(res => {
        const payload = res.payload
        this.newData = payload
      })
    }
  }
}
</script>
<style lang="less" scoped>
.data-card{
  margin-bottom: 20px;
  position: relative;

  .card-actions {
    position: absolute;
    z-index: 2;
    right: 10px;
    top: 10px;
    color: #666;

    i{
      cursor: pointer;
    }
  }
  .title{
    margin-bottom: 15px;
   i{
      color: rgba(0,0,0,.45);
    }
  }
}
</style>
