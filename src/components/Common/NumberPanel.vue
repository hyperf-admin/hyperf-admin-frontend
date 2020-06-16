<template>
  <span>
    <div class="number-panel-title">
      <div v-for="(item, index) in dataList" :key="index" class="title-inner">
        <p class="number">{{ item.number }}</p>
        <p class="name">{{ item.label }}</p>
      </div>
    </div>
  </span>
</template>

<script>
import request from '@/utils/request'
import { type } from '@/utils/index'
export default {
  name: 'NumberPanel',
  props: {
    data: {
      type: Array,
      default: _ => []
    },
    dataApi: {
      type: String,
      default: ''
    },
    reload: {
      type: Number,
      default: 0
    },
    getDataListCallback: {
      type: Function,
      default: function(res) {

      }
    },
    injectData: {
      type: [Array, Function],
      default: _ => {}
    }
  },
  data() {
    return {
      dataList: this.$props.data,
      interval: undefined
    }
  },
  created() {
    if (this.$props.dataApi.length > 0) {
      this.getData()
      this.$props.reload > 0 && this.reloadData()
    }
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    getData() {
      request({ url: this.$props.dataApi }).then(res => {
        this.dataList = res.payload || []
        this.dataList = this.dataList.concat(type(this.$props.injectData) === 'array' ? this.$props.injectData : this.$props.injectData())
        this.getDataListCallback(this.dataList)
      })
    },
    reloadData() {
      this.interval = setInterval(() => this.getData(), this.$props.reload * 1000)
    }
  }
}
</script>

<style lang="less" scoped>
  .number-panel-title {
    padding: 20px;
    text-align: center;

    .title-inner {
      display: inline-block;
      width: 20%;
      position: relative;
      text-align: center;
      border-right: 1px solid #e8e8e8;

      &:last-child {
        border: none;
      }
    }

    .el-divider {
      position: absolute;
      right: 0;
      top: 10px;
    }

    .name {
      font-size: 12px;
      color: #666;
    }

    .number {
      font-size: 20px;
      line-height: 30px;
    }
  }
</style>
