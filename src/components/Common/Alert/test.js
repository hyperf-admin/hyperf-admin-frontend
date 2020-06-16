const testOptions = [
  {
    // 提示的类型：success、info、warning、error, 不传就是info
    type: 'info',
    message: '这是一段测试信息',
    description: '',
    // 是否可关闭
    closable: false,
    // 是否展示icon
    showIcon: true,
    // 动作按钮, 配置同superBtn
    actions: [
      {
        // 配置superBtn的rule
        props: { icon: '', circle: false, size: 'mini', type: 'warning' },
        rules: { form_ui: [] },
        form_ui: [],
        target: '/activity/goods/{id}/list',
        text: '管理活动商品',
        type: 'jump'
      },
      {
        // 配置superBtn的rule
        props: { icon: '', circle: false, size: 'mini', type: 'primary' },
        rules: { form_ui: [] },
        form_ui: [],
        target: '/activity/goods/{id}/list',
        text: '管理活动商品',
        type: 'jump'
      }
    ]
  }, {
    // 提示的类型：success、info、warning、error, 不传就是info
    type: 'warning',
    message: '按钮放在右边',
    description: '',
    // 是否可关闭
    closable: true,
    // 是否展示icon
    showIcon: false,
    actionsPlacement: 'right',
    // 动作按钮, 配置同superBtn
    actions: [
      {
        // 配置superBtn的rule
        props: { icon: '', circle: false, size: 'mini', type: 'warning' },
        rules: { form_ui: [] },
        form_ui: [],
        target: '/activity/goods/{id}/list',
        text: '管理活动商品',
        type: 'jump'
      },
      {
        // 配置superBtn的rule
        props: { icon: '', circle: false, size: 'mini', type: 'primary' },
        rules: { form_ui: [] },
        form_ui: [],
        target: '/activity/goods/{id}/list',
        text: '管理活动商品',
        type: 'jump'
      }
    ]
  }, {
    // 提示的类型：success、info、warning、error, 不传就是info
    type: 'success',
    description: '这是一段测试信<br>息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息这是一段测试信息',
    message: '无按钮<b>成功</b>',
    // 是否可关闭
    closable: false,
    // 是否展示icon
    showIcon: true,
    actionsPlacement: 'right'
  }, {
    // 提示的类型：success、info、warning、error, 不传就是info
    type: 'error',
    message: '无按钮错误',
    // 是否可关闭
    closable: true,
    // 是否展示icon
    showIcon: false,
    actionsPlacement: 'right'
  }
]
export default testOptions
