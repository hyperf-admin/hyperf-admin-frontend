import Mock from 'mockjs'
const MockData = Mock.mock({
  // 单个y轴模拟数据
  'singleData|200-300': [{
    '北京': '@float(10, 40, 0, 2)',
    date: '@date("2020-MM-dd")'
  }],
  // 多个y轴模拟数据
  'multipleData|200-300': [{
    '北京': '@float(10, 40, 0, 2)',
    '深圳': '@float(10, 40, 0, 2)',
    '上海': '@float(10, 40, 0, 2)',
    '杭州': '@float(10, 40, 0, 2)',
    date: '@date("2020-MM-dd")'
  }]
})

const { singleData, multipleData } = MockData

// LineChart ColumnChart 切换图表类型
const testChartType = 'LineChart'

// 用例：单个y轴，指定x,y轴名称
export const test1 = {
  col: { span: 24 },
  chart: {
    type: testChartType,
    props: {
      xAxis: 'date',
      yAxis: '北京'
    }
  },
  data: singleData,
  id: '单个y轴，指定x,y轴名称'
}
// 用例：单个y轴，不指定y轴名称
export const test2 = {
  col: { span: 24 },
  chart: {
    type: testChartType,
    props: {
      xAxis: 'date'
    }
  },
  data: singleData,
  id: '单个y轴，不指定y轴名称'
}
// 用例：多个y轴，指定y轴名称
export const test3 = {
  col: { span: 24 },
  chart: {
    type: testChartType,
    props: {
      xAxis: 'date',
      yAxis: ['北京', '上海']
    }
  },
  data: multipleData,
  id: '多个y轴，指定y轴名称'
}
// 用例：多个y轴，不指定y轴名称
export const test4 = {
  col: { span: 24 },
  chart: {
    type: testChartType,
    props: {
      xAxis: 'date'
    }
  },
  data: multipleData,
  id: '多个y轴，不指定y轴名称'
}

export const allTest = [test1, test2, test3, test4]
