// 钉钉login
// https://g.alicdn.com/dingding/dinglogin/0.0.5/ddLogin.js
export function DDLogin(a) {
  const c = document.createElement('iframe')
  let d = 'https://login.dingtalk.com/login/qrcode.htm?goto=' + a.goto
  d += a.style ? '&style=' + encodeURIComponent(a.style) : ''
  d += a.href ? '&href=' + a.href : ''
  c.src = d
  c.frameBorder = '0'
  c.allowTransparency = 'true'
  c.scrolling = 'no'
  c.width = a.width ? a.width + 'px' : '365px'
  c.height = a.height ? a.height + 'px' : '400px'
  const e = document.getElementById(a.id)
  e.innerHTML = ''
  e.appendChild(c)
}

// 企业微信登录
// http://rescdn.qqmail.com/node/ww/wwopenmng/js/sso/wwLogin-1.0.0.js
export function WwLogin(c) {
  const b = document
  const a = window
  var d = b.createElement('iframe')
  var e = 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=' + c.appid + '&agentid=' + c.agentid + '&redirect_uri=' + c.redirect_uri + '&state=' + c.state + '&login_type=jssdk'
  e += c.style ? '&style=' + c.style : ''
  e += c.href ? '&href=' + c.href : ''
  d.src = e
  d.frameBorder = '0'
  d.allowTransparency = 'true'
  d.scrolling = 'no'
  d.width = c.width ? c.width + 'px' : '300px'
  d.height = c.height ? c.height + 'px' : '400px'
  var f = b.getElementById(c.id); f.innerHTML = ''
  f.appendChild(d)
  d.onload = function() {
    d.contentWindow.postMessage && a.addEventListener && (a.addEventListener('message', function(b) {
      b.data && b.origin.indexOf('work.weixin.qq.com') > -1 && (a.location.href = b.data)
    }),
    d.contentWindow.postMessage('ask_usePostMessage', '*'))
  }
}
