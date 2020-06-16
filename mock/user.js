
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

export default [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 0,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 0,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 0,
        data: 'success'
      }
    }
  },

  {
    url: '/user/menu',
    type: 'get',
    response: _ => {
      return {
        'code': 0,
        'data': {
          'menuList': [
            {
              'menu_name': '系统管理1',
              'icon': 'example',
              'url': '#',
              'children': [
                {
                  'scaffold': true,
                  'menu_name': '系统用户',
                  'url': '/user/list'
                },
                {
                  'scaffold': true,
                  'menu_name': '新建系统用户',
                  'url': '/user/form',
                  'hidden': true
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    url: '/user/list',
    type: 'get',
    response: (a, b) => {
      const data = [
        { 'name': '赵伟', 'tel': '156*****1987', 'hobby': '钢琴、书法、唱歌', 'address': '上海市黄浦区金陵东路569号17楼' },
        { 'name': '李伟', 'tel': '182*****1538', 'hobby': '钢琴、书法、唱歌', 'address': '上海市奉贤区南桥镇立新路12号2楼' },
        { 'name': '孙伟', 'tel': '161*****0097', 'hobby': '钢琴、书法、唱歌', 'address': '上海市崇明县城桥镇八一路739号' },
        { 'name': '周伟', 'tel': '197*****1123', 'hobby': '钢琴、书法、唱歌', 'address': '上海市青浦区青浦镇章浜路24号' },
        { 'name': '吴伟', 'tel': '183*****6678', 'hobby': '钢琴、书法、唱歌', 'address': '上海市松江区乐都西路867-871号' },
        { 'name': '赵伟', 'tel': '156*****1987', 'hobby': '钢琴、书法、唱歌', 'address': '上海市黄浦区金陵东路569号17楼' },
        { 'name': '李伟', 'tel': '182*****1538', 'hobby': '钢琴、书法、唱歌', 'address': '上海市奉贤区南桥镇立新路12号2楼' },
        { 'name': '孙伟', 'tel': '161*****0097', 'hobby': '钢琴、书法、唱歌', 'address': '上海市崇明县城桥镇八一路739号' },
        { 'name': '周伟', 'tel': '197*****1123', 'hobby': '钢琴、书法、唱歌', 'address': '上海市青浦区青浦镇章浜路24号' },
        { 'name': '吴伟', 'tel': '183*****6678', 'hobby': '钢琴、书法、唱歌', 'address': '上海市松江区乐都西路867-871号' }
      ]

      for (let i = 0; i < 10; i++) {
        data.push(data[Math.round(Math.random() * 10)])
      }
      return {
        code: 0,
        data: {
          list: data,
          total: 100
        }
      }
    }
  },
  {
    url: '/user/test',
    type: 'post',
    response: (a, b) => {
      return {
        code: 0,
        data: []
      }
    }
  },
  {
    url: '/user/act',
    type: 'get',
    response: (a, b) => {
      return {
        code: 0,
        data: [
          { 'value': '104', 'label': '生态蔬菜', 'disabled': false },
          { 'value': '105', 'label': '新鲜水果', 'disabled': false }
        ]
      }
    }
  },
  {
    url: '/user/form',
    type: 'post',
    response: (a, b) => {
      return {
        code: 0,
        data: []
      }
    }
  },
  {
    url: '/user/form',
    type: 'get',
    response: _ => {
      return {
        code: 0,
        data: [
          // {
          //   type: 'hidden',
          //   field: 'id',
          //   value: '14'
          // },
          {
            type: 'input',
            title: '商品简介',
            field: 'goods_info',
            value: '',
            validate: [
              { required: true, message: '请输入商品简介', trigger: 'blur' }
            ]
          },
          // {
          //   type: 'textarea',
          //   title: '商品描述',
          //   field: 'goods_desc'
          // },
          // {
          //   type: 'number',
          //   field: 'price',
          //   title: '价格',
          //   value: 1
          // },
          // {
          //   type: 'float',
          //   field: 'money',
          //   title: '价格1',
          //   value: 1
          // },
          // {
          //   type: 'select',
          //   field: 'cate_id',
          //   title: '用户',
          //   value: [],
          //   props: {
          //     selectApi: '/user/act',
          //     multiple: true
          //   }
          // },
          // {
          //   type: 'switch',
          //   title: '是否上架',
          //   field: 'is_show'
          // },
          // {
          //   type: 'datetime',
          //   field: 'section_day',
          //   title: '活动日期时间'
          // },
          // {
          //   type: 'datetime_range',
          //   field: 'section_day_range',
          //   title: '活动日期区间'
          // },
          // {
          //   type: 'date',
          //   field: 'section_date',
          //   title: '活动日期'
          // },
          // {
          //   type: 'date_range',
          //   field: 'section_date_range',
          //   title: '活动日期区间'
          // },
          // {
          //   type: 'image',
          //   field: 'pic',
          //   title: '轮播图',
          //   value: 'http://img1.touxiang.cn/uploads/20131030/30-075657_191.jpg'
          // },
          {
            type: 'test',
            field: 'custom_key',
            title: '自定义组件',
            value: 1,
            custom: true,
            validate: [
              { required: true, message: '自定义组件校验', trigger: 'blur' }
            ]
          }
        ]
      }
    }
  }

]
