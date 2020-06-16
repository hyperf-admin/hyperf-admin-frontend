<template>
  <div :id="uniqueId" />
</template>
<script>
import { Chart } from '@antv/g2'
import { uniqueId } from '@form-create/utils'

export default {
  name: 'ColumnChart',
  props: {
    data: { type: Array, default: _ => [] },
    chart: { type: Object, default: _ => {} },
    typeName: { type: String, default: '' }
  },
  data() {
    return {
      uniqueId: 'columnChart' + uniqueId(),
      yAxisName: '',
      xAxisName: '',
      color: '#409EFF',
      multiple: false
    }
  },
  mounted() {
    const { xAxis, yAxis, padding, height, range } = this.chart.props || {}
    this.xAxisName = xAxis
    this.yAxisName = yAxis

    const chart = new Chart({
      container: this.uniqueId,
      autoFit: true,
      height: height || 300,
      padding: padding || [20, 20, 60, 50]
    })
    // Step 2: 载入数据源
    chart.data(this.formatData(this.data))
    chart.scale(this.yAxisName, {
      nice: true
    })
    // Step 3：创建图形语法，绘制柱状图
    if (this.multiple) {
      chart.interval().position(`${this.xAxisName}*${this.yAxisName}`).color(this.color)
        .adjust([
          {
            // https://www.yuque.com/antv/g2-docs/tutorial-geom-and-adjust#prlixw
            // stack jitter dodge symmetric
            type: 'dodge',
            marginRatio: 0
          }
        ])
    } else {
      chart.interval().position(`${this.xAxisName}*${this.yAxisName}`).color(this.color)
    }
    chart.tooltip({
      shared: true
    })
    chart.scale(this.xAxisName, {
      range: range || [0.01, 0.99],
      type: 'cat'
    })
    // Step 4: 渲染图表
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
        this.multiple = true
        return newData
      }
    }
  }
}
</script>
<style lang="less" scoped>
</style>
