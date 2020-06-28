const testOptions = [
  { value: 11, label: '第 _ num11 _ 个' },
  { value: '1', label: '第 _ yi _ 个' },
  { value: '2', label: '第 _ er _ 个' },
  { value: '3', label: '第 _ 3 _ 个' },
  { value: '123', label: '第 _ 123 _ 个' },
  { value: '13', label: '第 _ 13 _ 个' },
  { value: '12', label: '第 _ 12 _ 个' },
  { value: '23', label: '第 _ 23 _ 个' },
  { value: '21', label: '第 _ 21 _ 个' },
  { value: '22', label: '第 _ 22 _ 个' },
  { value: 'a', label: '第 _ a _ 个' },
  { value: 'b', label: '第 _ b _ 个' },
  { value: 'ab', label: '第 _ ab _ 个' },
  { value: 'ac', label: '第 _ ac _ 个' },
  { value: 'bc', label: '第 _ bc _ 个' },
  { value: 'abc', label: '第 _ abc _ 个' }
]
// 一般场景
export const test1 = {
  type: 'select2',
  field: 'testSelect2',
  title: '测试Select2',
  value: ['1', '2', '3'],
  props: {
    options: testOptions
  }
}
// 一般场景 合并tag
export const test2 = {
  type: 'select2',
  field: 'test2',
  title: '合并tag',
  value: ['1', '2', '3'],
  props: {
    options: testOptions,
    collapseTags: true
  },
  validate: [
    { message: '测试表单校验', required: true, trigger: 'change' }
  ]
}
// 远程搜索
export const test3 = {
  type: 'select2',
  field: 'test3',
  title: '远程搜索',
  value: ['1', '2', '3'],
  props: {
    options: testOptions,
    collapseTags: true,
    remote: true,
    selectApi: '/search/saleattr'
  }
}
// allow-create
export const test4 = {
  type: 'select2',
  field: 'test4',
  title: 'allowCreate',
  value: ['1', '2', '我是自定义的'],
  props: {
    options: testOptions,
    allowCreate: true
  }
}

// defaultFirstOption
export const test5 = {
  type: 'select2',
  field: 'test5',
  title: 'defaultFirstOption',
  value: ['1', '2', '3'],
  props: {
    options: testOptions,
    defaultFirstOption: true
  }
}
// allow-create defaultFirstOption
export const test6 = {
  type: 'select2',
  field: 'test6',
  title: 'defaultFirst&allow',
  value: ['我是自定义的', '2', '3'],
  props: {
    options: testOptions,
    allowCreate: true,
    defaultFirstOption: true
  }
}

export const allTest = [test1, test2, test3, test4, test5, test6]
