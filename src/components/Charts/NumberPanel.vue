<template>
  <span class="number-panel-title">
    <div
      v-for="(item, index) in dataList"
      :key="index"
      class="title-inner"
      :style="`width: ${100/dataList.length}%`"
    >
      <p class="number">{{ item.number }}</p>
      <p class="name">{{ item.label }}</p>
    </div>
  </span>
</template>

<script>
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
    }
  },
  data() {
    return {
      dataList: this.$props.data,
      interval: undefined
    }
  },
  created() {},
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
  .number-panel-title {
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
