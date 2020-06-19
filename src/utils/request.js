import store from '@/store'
import { getToken } from '@/utils/auth'
import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { showEleByClassName } from '@/utils'

const config = {
  retry: 60, // 重试次数
  retryDelay: 5000, // 重试延时，5秒重试一次
  shouldRetry: (error) => {
    return [500].indexOf(error.response.status) > -1
  }, // 重试条件，默认只要是错误都需要重试
  baseURL: process.env.VUE_APP_BASE_API,
  // withCredentials: true,
  timeout: 10000,
  headers: {
  },
  transformRequest: [
    // function(data) {
    //   if (!data) return data
    //   data = Object.assign(data, { _repeat: true })
    //   return data
    // }
  ],
  responseType: 'json' // 返回数据类型
}

// create an axios instance
const service = axios.create(config)

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Page-Name'] = encodeURIComponent(store.getters.currentPageName)
      config.headers['Page-Url'] = location.href
      config.headers['X-Token'] = getToken()
      config.headers['X-Module'] = store.state.app.moduleName
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 0) {
      if (res.code === 50012 || res.code === 50014 || res.code === 401100) {
        MessageBox.confirm('登录信息已过期或登录失败', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      } else if (res.code === 40012) {
        MessageBox.confirm(res.message, '提示', {
          confirmButtonText: '确认提交',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const backoff = new Promise(function(resolve) {
            setTimeout(function() {
              resolve()
            }, 1)
          })
          const config = response.config
          config.url = config.url.replace(process.env.VUE_APP_BASE_API, '')
          config.data = JSON.stringify(Object.assign(JSON.parse(config.data), { _repeat: true }))
          return backoff.then(() => {
            console.log('retry', config)
            return service(config).then(res => {
              if (res.code === 0) {
                Message({
                  message: (res.message || res.msg || '成功').replace(/\n/g, '<br/>'),
                  type: 'success',
                  duration: 3 * 1000
                })
                setTimeout(function() {
                  history.go(-1)
                }, 500)
              }
            })
          })
        })
      } else {
        Message({
          message: (res.message || res.error || res.msg || '接口请求异常').replace(/\n/g, '<br/>'),
          type: 'error',
          duration: 5 * 1000,
          dangerouslyUseHTMLString: true
        })
        showEleByClassName('el-message__content')
      }

      console.log({ request: res })
      return Promise.reject(new Error(res.message || res.error || res.msg || '接口请求异常'))
    } else {
      return res
    }
  },
  err => {
    (err.config.url.indexOf('newversion') === -1) && Message({
      message: err.message,
      type: 'error',
      duration: 5 * 1000
    })
    const config = err.config
    console.log(err, config)

    // 判断是否配置了重试
    if (!config || !config.retry) return Promise.reject(err)
    if (!config.shouldRetry || typeof config.shouldRetry !== 'function') return Promise.reject(err)

    // 判断是否满足重试条件
    if (!config.shouldRetry(err)) return Promise.reject(err)

    // 设置重试次数
    config.__retryCount = config.__retryCount || 0
    if (config.__retryCount >= config.retry) return Promise.reject(err)

    // 重试次数自增
    config.__retryCount += 1

    // 延时处理
    var backoff = new Promise(function(resolve) {
      setTimeout(function() {
        resolve()
      }, config.retryDelay || 1)
    })
    // config.data = Qs.parse(config.data)
    // 重新发起axios请求
    return backoff.then(() => {
      return service(config)
    })
  }
)

export default service
