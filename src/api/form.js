import request from '@/utils/request'

export function formRule(data) {
  return request({
    url: '/form',
    method: 'get',
    data
  })
}
