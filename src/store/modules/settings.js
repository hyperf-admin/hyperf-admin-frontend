import defaultSettings from '@/settings'
import request from '@/utils/request'

const state = Object.assign(defaultSettings, {
  open_export: false,
  close_navbar_notice: false
})

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  LOAD_SYNC_CONFIG: (state, syncConfig) => {
    state = Object.assign(state, syncConfig)
  },
  CHANGE_NAVBAR_NOTICE_STATUS(state, status) {
    state.close_navbar_notice = status
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  loadSyncConfig({ commit }) {
    return new Promise((resolve, reject) => {
      request({
        url: '/system/config'
      }).then(res => {
        commit('LOAD_SYNC_CONFIG', res.payload)
        resolve()
      })
    })
  },
  closeNavBarNotice({ commit }) {
    commit('CHANGE_NAVBAR_NOTICE_STATUS', true)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

