import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from '@/App'
import store from '@/store'
import router from './router'
import '@/icons' // icon
import _ from 'lodash'
import settings from './settings'

Vue.prototype._ = _

Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

store.dispatch('app/setModule', settings.module).then(r => {
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
