import { login, logout, getInfo, ssoLogin, ssoGetInfo } from '@/api/user'
import { getToken, setToken, setSSOToken, removeToken, getSSOToken, removeSSOToken, getUserInfo, setUserInfo } from '@/utils/auth'
import defaultSetting from '@/settings'
const state = {
  token: getToken(),
  name: '',
  avatar: '',
  roles: [],
  hasNewMessage: false
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_HAS_NEW_MESSAGE: (state, has) => {
    state.hasNewMessage = has
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const data = response.payload
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        const userInfo = {
          roles: ['editor'],
          introduction: 'I am an editor',
          avatar: response.payload.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          name: response.payload.name
        }
        setUserInfo(userInfo)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  ssoLogin({ commit }, ticket) {
    return new Promise((resolve, reject) => {
      ssoLogin(ticket).then(response => {
        setSSOToken(ticket)
        const data = {
          token: response.payload.token
        }
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        const userInfo = {
          roles: [response.payload.auth.is_admin ? 'admin' : 'editor'],
          introduction: 'I am an editor',
          avatar: response.payload.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          name: response.payload.name
        }
        setUserInfo(userInfo)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    const userInfo = getUserInfo()
    if (userInfo) {
      return new Promise((resolve, reject) => {
        const { roles, name, avatar } = userInfo
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(userInfo)
      })
    }
    if (defaultSetting.authType === 'sso') {
      return new Promise((resolve, reject) => {
        const token = getSSOToken()
        ssoGetInfo(token).then(response => {
          const data = {
            roles: [response.payload.auth.is_admin ? 'admin' : 'editor'],
            introduction: 'I am an editor',
            avatar: response.payload.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            name: response.payload.name
          }
          setUserInfo(data)
          if (!data) {
            reject('Verification failed, please Login again.')
          }

          const { roles, name, avatar } = data

          // roles must be a non-empty array
          if (!roles || roles.length <= 0) {
            reject('getInfo: roles must be a non-null array!')
          }

          commit('SET_ROLES', roles)
          commit('SET_NAME', name)
          commit('SET_AVATAR', avatar)
          setToken(response.payload.token)
          resolve(data)
        }).catch(error => {
          console.log({ getInfoToken: error })
          // reject(error)
        })
      })
    }
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        setUserInfo(data)
        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, name, avatar } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      removeSSOToken()
      resolve()
    })
  },

  hasNewMessage({ commit }, has) {
    commit('SET_HAS_NEW_MESSAGE', has)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

