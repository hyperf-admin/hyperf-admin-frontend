import { asyncRoutes, constantRoutes } from '@/router'
import { getAuthMenu } from '@/api/user'
import Layout from '@/layout'
import store from '@/store'
import _ from 'lodash'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 后台查询的菜单数据拼装成路由格式的数据
 * @param routes
 * @param data
 */
export function generaMenu(routes, data) {
  data.forEach(item => {
    const menu = transRoute(item)
    if (item.children && item.children.length > 0) {
      generaMenu(menu.children, item.children)
      if (item.level === 1) {
        menu.redirect = menu.children[0].path
      }
      if (item.level === 2) {
        menu.children.forEach((each) => {
          routes.push(each)
        })
        menu.children = []
      }
    }
    routes.push(menu)
  })
}

function getPath(item) {
  let path = item.url
  // :id 默认转换为数字型匹配模式
  if (item.url.indexOf(':id') > -1 && (item.url.indexOf(':id') + 3) === item.url.length) {
    path = item.url.replace(':id', ':id(\\d+)')
  }
  return path === '#' ? item.menu_name + '_' + item.id + '_key' : path
}

function transRoute(item) {
  const module = store.getters.module
  return {
    id: item.id,
    pid: item.pid,
    path: getPath(item),
    component: item.url === '#' ? Layout : () => {
      // 脚手架渲染
      if (item.scaffold) {
        let type = item.url.split('/')[item.url.split('/').length - 1]

        if (type === ':id' || type === 'form') {
          type = 'form'
        }

        if (type === 'list') {
          type = 'tablist'
        }

        if (type === 'list2') {
          type = 'list2'
        }

        if (type.indexOf('conf_') > -1) {
          type = 'cconf'
        }
        if (type.indexOf('mock_') > -1) {
          type = 'mock'
        }
        if (type.indexOf('report_') > -1) {
          type = 'report'
        }

        return import(`@/components/scaffold/${type}`)
      }
      // 指定由那个vue组件渲染 需要前端有相应个vue组件
      // url 为正则时使用, 例如 url: /special/goods/:id, view: /special/goods
      if (item.view) {
        return import(`@/modules/${module}/views${item.view}`)
      }
      // 指定由那个vue组件渲染
      return import(`@/modules/${module}/views${item.url}`)
    },
    hidden: item.hidden !== undefined ? item.hidden : false,
    children: [],
    name: 'menu_' + item.menu_name + '_' + (item.id || 0),
    meta: { title: item.menu_name, icon: item.icon !== undefined ? item.icon : '', id: item.id }
  }
}

function generaTree(data) {
  return _.cloneDeep(data).map(item => {
    const menu = transRoute(item)
    if (item.children) {
      menu.children = generaTree(item.children)
      // if (item.level === 1) {
      //   menu.redirect = getPath(menu.children[0])
      // }
    }
    return menu
  })
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const loadMenuData = []
      // 先查询后台并返回左侧菜单数据并把数据添加到路由
      getAuthMenu(state.token).then(response => {
        if (response.code !== 0) {
          this.$message({
            message: '菜单数据加载异常',
            type: 0
          })
        } else {
          const data = response.payload.menuList
          Object.assign(loadMenuData, data)

          loadMenuData.map(item => {
            item.level = 1
            item.children = item.children || []
            item.children.map(item => {
              item.level = 2
              return item
            })
            return item
          })

          console.log(loadMenuData)

          const tree = generaTree(_.cloneDeep(loadMenuData))

          generaMenu(asyncRoutes, loadMenuData, tree)
          let accessedRoutes
          if (roles.includes('admin')) {
            accessedRoutes = asyncRoutes || []
          } else {
            accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
          }
          console.log(asyncRoutes)
          commit('SET_ROUTES', tree)
          resolve(accessedRoutes)
        }
        // generaMenu(asyncRoutes, data)
      }).catch(error => {
        console.log(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
