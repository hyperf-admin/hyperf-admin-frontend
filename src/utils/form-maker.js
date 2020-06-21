import customComponent from '@/components/CustomForm'
import _ from 'lodash'
import { getToken } from '@/utils/auth'

function gen(obj, key, def) {
  if (obj === undefined) {
    return obj
  }
  return obj[key] ? obj[key] : def
}

function merge(objA, objB) {
  return _.merge(objA, objB)
}
const uploadImageDefault = {
  'type': 'select',
  'uploadType': 'image',
  'action': process.env.VUE_APP_BASE_API + '/upload/image',
  'multiple': true,
  'headers': {
    'X-Token': getToken()
  },
  'accept': 'image\/*',
  'format': ['jpg', 'jpeg', 'png', 'gif'],
  'autoUpload': true,
  'maxSize': 2048
}

const uploadFileDefault = {
  'headers': {
    'X-Token': getToken()
  },
  'action': process.env.VUE_APP_BASE_API + '/upload/image',
  'uploadType': 'file',
  'multiple': true,
  'limit': 1,
  'autoUpload': true
}

function rangeDate(time, after, before) {
  if (after && !before) {
    return time.getTime() < (new Date(after.replace(/-/g, '/'))).getTime()
  }
  if (!after && before) {
    return time.getTime() > (new Date(before.replace(/-/g, '/'))).getTime()
  }
  return time.getTime() < (new Date(after.replace(/-/g, '/'))).getTime() || time.getTime() > (new Date(before.replace(/-/g, '/'))).getTime()
}

const shortcut = {
  afterToday(time) {
    return time.getTime() < (Date.now() - 8.64e7)
  },
  beforeToday(time) {
    return time.getTime() > (Date.now() - 8.64e7)
  }
}

// rule afterToday beforeToday
// rule {after: '2020-01-01', before: '2020-01-02'}
const disabledDate = function(rule) {
  if (typeof rule === 'string') {
    return (time) => shortcut[rule](time)
  }
  const { after, before } = rule
  return (time) => rangeDate(time, after, before)
}

const map = {
  input: function(row) {
    row.type = 'v-input'
    row.props.showCopy = !!row.copy_show
    row.props.clearable = true
    row.props.placeholder = gen(row.props, 'placeholder', '请输入' + row.title)
    row.props.maxlength = gen(row.props, 'maxlength', 100)
    row.props.showWordLimit = gen(row.props, 'showWordLimit', true)
    return row
  },
  textarea: function(row) {
    row.type = 'v-input'
    row.props.type = 'textarea'
    row.props.placeholder = gen(row.props, 'placeholder', '请输入' + row.title)
    row.props.showWordLimit = gen(row.props, 'showWordLimit', true)
    return row
  },
  number: function(row) {
    row.type = 'InputNumber'
    row.props = Object.assign({ max: 99999999999, precision: 0 }, row.props)
    return row
  },
  float: function(row) {
    row.type = 'InputNumber'
    row.props = Object.assign({ max: 99999999999 }, row.props)
    return row
  },
  select: function(row) {
    row.props.clearable = true
    row.props.style = gen(row.props, 'style', 'width:100%')
    row.props.placeholder = gen(row.props, 'placeholder', '请选择' + row.title)
    row.props.filterable = gen(row.props, 'filterable', true)
    row.props.defaultFirstOption = gen(row.props, 'defaultFirstOption', true)
    row.props.automaticDropdown = gen(row.props, 'automaticDropdown', true)
    if (row.props.selectApi !== undefined) {
      row.props.remote = true
    }
    if (row.props.multiple) {
      row.type = 'select2'
      row.props.options = row.options
    }
    return row
  },
  switch: function(row) {
    row.props.activeValue = gen(row.props, 'activeValue', 1)
    row.props.inactiveValue = gen(row.props, 'inactiveValue', 0)
    return row
  },
  datetime: function(row) {
    row.type = 'DatePicker'
    row.props.placeholder = gen(row.props, 'placeholder', '请选择' + row.title)
    row.props.type = 'datetime'
    row.props.format = gen(row.props, 'format', 'yyyy-MM-dd HH:mm:ss')
    row.props.valueFormat = gen(row.props, 'valueFormat', 'yyyy-MM-dd HH:mm:ss')
    return row
  },
  datetime_range: function(row) {
    row.type = 'DatePicker'
    row.props = Object.assign({ startPlaceholder: '开始时间', endPlaceholder: '结束时间' }, row.props)
    row.props.type = 'datetimerange'
    row.props.unlinkPanels = true
    row.props.format = gen(row.props, 'format', 'yyyy-MM-dd HH:mm:ss')
    row.props.valueFormat = gen(row.props, 'valueFormat', 'yyyy-MM-dd HH:mm:ss')
    if (row.props.range) {
      row.props.pickerOptions = row.props.pickerOptions || {}
      row.props.pickerOptions.disabledDate = disabledDate(row.props.range)
      console.log(row.props.pickerOptions.disabledDate)
    }
    return row
  },
  date: function(row) {
    row.type = 'DatePicker'
    row.props.placeholder = gen(row.props, 'placeholder', '请选择' + row.title)
    row.props.type = 'date'
    row.props.format = gen(row.props, 'format', 'yyyy-MM-dd')
    row.props.valueFormat = gen(row.props, 'valueFormat', 'yyyy-MM-dd')
    return row
  },
  date_range: function(row) {
    row.type = 'DatePicker'
    row.props = Object.assign({ startPlaceholder: '开始时间', endPlaceholder: '结束时间' }, row.props)
    row.props.type = 'daterange'
    row.props.unlinkPanels = true
    row.props.format = gen(row.props, 'format', 'yyyy-MM-dd')
    row.props.valueFormat = gen(row.props, 'valueFormat', 'yyyy-MM-dd')
    return row
  },
  image: function(row) {
    row.type = 'v-upload'
    row.props = Object.assign({}, uploadImageDefault, row.props)
    if (row.props.bucket !== undefined) {
      row.props.action = row.props.action + '?bucket=' + row.props.bucket
    }
    if (row.props.private !== undefined) {
      row.props.action = row.props.action + '&private=' + row.props.bucket
    }
    return row
  },
  file: function(row) {
    row.type = 'v-upload'
    row.props = Object.assign({}, uploadFileDefault, row.props)
    return row
  },
  cascader: function(row) {
    row.props.placeholder = gen(row.props, 'placeholder', '请选择' + row.title)
    row.props.changeOnSelect = gen(row.props, 'changeOnSelect', true)
    row.props.filterable = gen(row.props, 'filterable', true)
    row.props.options = gen(row, 'options', [])
    return row
  },
  json: function(row) {
    row.type = 'v-jsoneditor'
    row.props = {}
    return row
  },
  html: function(row) {
    row.type = 'vue-editor'
    return row
  },
  inputRange: (row) => {
    row.type = 'input-range'
    return row
  },
  code: (row) => {
    row.type = 'code-mirror'
    return row
  },
  json2: (row) => {
    row.type = 'code-mirror'
    row.props.mode = 'application/json'
    row.props.type = 'json'
    return row
  },
  'sub-form': (row) => {
    row.props.field = row.field
    return row
  }
}

export function maker(row) {
  if (row.native) {
    return row
  }
  // 处理正则类型转换
  if (row.validate && row.validate.length > 0) {
    row.validate.forEach(item => {
      // eslint-disable-next-line no-eval
      item.pattern ? item.pattern = new RegExp(eval(item.pattern)) : ''
    })
  }

  if (row.field.indexOf('-') > -1) {
    console.error('字段名中有保留字符"-"')
  }
  row.field = row.field.split('.').join('-')

  if (row.type === undefined) {
    row.type = 'input'
  }

  row.props = row.props ? row.props : {}

  row.props.size = 'small'

  if (map[row.type] !== undefined) {
    return map[row.type](row)
  }

  if (row.custom) {
    const custom = merge(row, customComponent(row.type))
    console.log(require.cache)
    custom.type = 'template'
    custom.props.field = row.field
    return custom
  }

  return row
}
