<template>
  <span class="chart-line-content">
    <div v-if="this.$props.data.length > 0" :id="uniqueId" />
    <div v-else>
      暂无数据
    </div>
  </span>
</template>
<script>
import { Chart } from '@antv/g2'
import { uniqueId } from '@form-create/utils'

export default {
  name: 'LineChart',
  props: {
    data: { type: Array, default: _ => [] },
    chart: {
      type: Object,
      default: _ => {}
    }
  },
  data() {
    return {
      uniqueId: 'LineChart' + uniqueId(),
      yAxisName: '',
      xAxisName: '',
      color: '#409EFF'
    }
  },
  mounted() {
    if (this.$props.data.length === 0) {
      return
    }
    const { xAxis, yAxis, padding, height } = this.chart.props || {}
    const keys = Object.keys(this.$props.data[0])
    this.xAxisName = xAxis || keys[0]
    this.yAxisName = yAxis
    const chart = new Chart({
      container: this.uniqueId,
      autoFit: true,
      height: height || 300,
      padding: padding || [20, 20, 60, 50]
    })

    chart.data(this.formatData(this.data))
    // 判断数据只有一条数据时候 渲染点 避免找不到数据
    if (this.$props.data.length === 1) {
      chart.point().position(`${this.xAxisName}*${this.yAxisName}`).color(this.color).shape('circle')
    }
    chart.line().position(`${this.xAxisName}*${this.yAxisName}`).color(this.color).shape('smooth')

    chart.tooltip({
      showCrosshairs: true,
      shared: true
    })

    chart.render()
  },
  methods: {
    getYAxisName(yAxis, xAxis = '') {
      if (this._.isString(yAxis) && yAxis !== '') {
        return [yAxis]
      } else if (this._.isArray(yAxis)) {
        return yAxis
      } else {
        return Object.keys(this.data[0] || {}).filter(key => key !== xAxis)
      }
    },
    formatData(data = []) {
      // 获取y轴主键名称
      const yAxisList = this.getYAxisName(this.yAxisName, this.xAxisName)
      // y轴只有一个  不需要数据转换
      if (yAxisList.length === 1) {
        // 如果没有指定y轴名称，指定默认y轴名称
        this.yAxisName = this.yAxisName || yAxisList[0]
        return this.data
      } else {
        // 需要把数据根据y轴名称扁平化处理
        const newData = []
        this.data.map(item => {
          yAxisList.map(key => {
            newData.push({
              type: key,
              value: item[key],
              [this.xAxisName]: item[this.xAxisName]
            })
          })
        })
        this.yAxisName = 'value'
        this.color = 'type'
        return newData
      }
    }
  }
}
</script>
<style lang="less" scoped>
.chart-line-content{
  // 清除外界css对组件内部的影响
  white-space: normal;
  line-height: initial;
}
</style>
