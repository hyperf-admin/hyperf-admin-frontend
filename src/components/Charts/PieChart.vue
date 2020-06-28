<template>
  <div :id="uniqueId" />
</template>

<script>
import { Chart, Util } from '@antv/g2'
import { uniqueId } from '@form-create/utils'
export default {
  name: 'PieChart',
  props: {
    data: { type: Array, default: _ => [] },
    chart: {
      type: Object,
      default: _ => {}
    }
  },
  data() {
    return {
      uniqueId: 'PieChart' + uniqueId()
    }
  },
  mounted() {
    const data = this.data
    // 设置图表信息
    const chart = new Chart({
      container: this.uniqueId,
      autoFit: true,
      height: 300
    })
    chart.data(data)
    // 设置饼图尺寸
    chart.coordinate('theta', {
      radius: 0.7,
      innerRadius: 0.58
    }).rotate(360)
    // 设置提示
    chart.tooltip({})

    let total = 0
    data.forEach(item => {
      total += item.number
    })
    chart
      .interval()
      .adjust('stack')
      .position('number')
      .color('label')
      .style({ opacity: 0.4 })
      .state({
        active: {
          style: (element) => {
            const shape = element.shape
            return {
              matrix: Util.zoom(shape, 1.1)
            }
          }
        }
      })
      .label('label', (val) => {
        return {
          offset: 20,
          rotate: 90,
          autoRotate: true,
          content: (obj) => {
            return obj.label + '：' + ((obj.number / total) * 100).toFixed(2) + '%'
          }
        }
      })

    chart.interaction('legend-active')

    chart.render()
  }
}
</script>

<style scoped>

</style>
