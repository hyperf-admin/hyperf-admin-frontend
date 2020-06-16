import store from '@/store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { getUrlKey, flattenChildren } from '@/utils/index'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist
// 根据叶子节点的id, 查找出他在树形结构中的全路径
const getPathListById = (list, pageId, parents = []) => {
  let arr = ''
  list.forEach(item => {
    if (item.id === parseInt(pageId)) {
      arr = [...parents, item.meta.title].join('/')
    } else {
      if (item.children && item.children.length > 0) {
        const result = getPathListById(item.children, pageId, [...parents, item.meta.title])
        result ? arr = result : ''
      }
    }
  })
  return arr
}

export function addRouterHooks(router) {
  router.beforeEach(async(to, from, next) => {
    NProgress.start()
    document.title = getPageTitle(to.meta.title)
    const hasToken = getToken()
    if (hasToken) {
      if (to.path === '/login') {
        next({ path: '/' })
        NProgress.done()
      } else {
        const hasRoles = store.getters.roles && store.getters.roles.length > 0
        if (hasRoles) {
          const pageId = (to.name || '').match(/\d+/)
          if (pageId && pageId.length > 0) {
            const pageName = getPathListById(store.getters.permission_routes, pageId[pageId.length - 1])
            console.warn('page_name：', pageName)
            store.dispatch('app/setCurrentPageName', pageName).then(_ => { next() })
          } else {
            store.dispatch('app/setCurrentPageName', to.name || '').then(_ => { next() })
          }
        } else {
          try {
            const { roles } = await store.dispatch('user/getInfo')
            const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
            await store.dispatch('settings/loadSyncConfig')
            accessRoutes.map(menu => {
              if (menu.children && menu.children.length > 0) {
                menu.children = flattenChildren(menu.children)
              }
              return menu
            })
            router.addRoutes(accessRoutes)
            next({ ...to, replace: true })
          } catch (error) {
            console.error(error)
            await store.dispatch('user/resetToken')
            Message.error(error || 'Has Error')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        }
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        const ticket = getUrlKey('ticket')
        console.log({ ticket })
        if (ticket) {
          await store.dispatch('user/ssoLogin', ticket)
          next(`${to.path}`)
        } else {
          next(`/login?redirect=${to.path}`)
        }
        NProgress.done()
      }
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
