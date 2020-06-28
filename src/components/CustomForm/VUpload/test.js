const demoImg = 'http://hyperf-admin.oss-cn-beijing.aliyuncs.com/1/202005/d88c70177909219c796d48f6271c16e5.jpg'
const demoFile = 'http://hyperf-admin.oss-cn-beijing.aliyuncs.com/1/202005/ea44833429be5fcfc09d3986a8a2d521.vue'
const demoLongImg = 'http://hyperf-admin.oss-cn-beijing.aliyuncs.com/1/202005/ccb89ff883f64059584bc2032a5a584a.png'
const demoHeightImg = 'http://hyperf-admin.oss-cn-beijing.aliyuncs.com/1/202005/195edb441ff6a44be058e2c68ea4ddd1.png'
export const uploadDefaultJson = {
  type: 'v-upload',
  field: 'testUpload',
  title: '测试图片上传',
  value: demoImg,
  props: {
    limit: 2,
    format: ['jpg', 'jpeg', 'png', 'gif'],
    maxSize: 100,
    beforeRemove() {
      console.warn('不能删除')
    }
  }
}

export const uploadDownload = {
  type: 'v-upload',
  field: 'testUploadDownload',
  title: '测试文件下载',
  value: [demoFile, demoImg, demoLongImg, demoHeightImg],
  props: {
    downloadable: true,
    limit: 5,
    width: 160,
    height: 100
  }
}
export const oldConfig = {
  'title': 'test',
  'field': 'config.popup_image',
  'type': 'image',
  'value': [demoImg, demoLongImg],
  'props': {
    'multiple': true,
    'limit': 5,
    width: 60,
    height: 100
  }
}
export const testSubForm = {
  'title': '测试subForm',
  'field': 'config.style_config',
  'type': 'sub-form',
  'value': [{
    'image': demoImg,
    'schema': '12'
  }, {
    'image': demoLongImg,
    'schema': '123'
  }, {
    'image': '',
    'schema': ''
  }],
  'props': {
    'max': 5,
    'min': 2,
    'rules': [{
      'title': '内嵌图片',
      'field': 'image',
      'type': 'v-upload',
      'value': '',
      'props': {
        'multiple': true,
        'limit': 1
      }
    }, {
      'title': '跳转链接',
      'field': 'schema',
      'type': 'input',
      'value': '',
      'props': {
        'maxlength': 255
      }
    }],
    'repeat': true
  },
  'info': '可添加2~5张图片'
}
export const allTest = [uploadDefaultJson, uploadDownload, oldConfig, testSubForm]
