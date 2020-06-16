export default [
  {
    url: '/upload/image',
    type: 'post',
    response: (a, b) => {
      return {
        code: 0,
        data: {
          'file_path': 'http://img1.touxiang.cn/uploads/20131030/30-075657_191.jpg'
        }
      }
    }
  }
]
