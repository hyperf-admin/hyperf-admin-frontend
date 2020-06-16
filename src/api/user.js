import request from '@/utils/request'
import defaultSetting from '@/settings'
import store from '@/store'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function ssoLogin(ticket) {
  return request({
    url: defaultSetting.ssoLoginApi,
    method: 'get',
    params: { code: ticket }
  })
}

export function ssoGetInfo(token) {
  return request({
    url: defaultSetting.ssoLoginApi,
    method: 'get',
    params: { code: token }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  if (defaultSetting.authType === 'sso') {
    return request({
      url: defaultSetting.ssoLogoutApi,
      method: 'post'
    })
  }
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getAuthMenu(token) {
  return request({
    url: '/user/menu',
    method: 'get',
    params: { token, module: store.getters.module }
  })
}
