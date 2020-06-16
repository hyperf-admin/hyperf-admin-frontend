import Cookies from 'js-cookie'
import Base64 from '@/utils/base64'
import defaultSetting from '@/settings'

const TokenKey = defaultSetting.tokenKey

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token, { expires: 7 })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setSSOToken(token) {
  return Cookies.set('sso_' + TokenKey, token)
}

export function getSSOToken(token) {
  return Cookies.get('sso_' + TokenKey, token)
}

export function removeSSOToken() {
  return Cookies.remove('sso_' + TokenKey)
}

export function setUserInfo(userInfo) {
  return Cookies.set(TokenKey + '_user_info', JSON.stringify(userInfo), { expires: 7 })
}

export function getUserInfo() {
  const infoStr = Cookies.get(TokenKey + '_user_info')
  if (!infoStr) {
    return false
  }
  return JSON.parse(infoStr)
}

export function removeUserInfo() {
  return Cookies.remove(TokenKey + '_user_info')
}

export function getUid() {
  const reg = /id":"?(\d+)"?,/
  const token = getToken()
  return reg.exec(Base64.decode(token))[1]
}
