module.exports = {
  title: 'HyperfAdmin',
  logo: 'https://gitee.com/daodao97/asset/raw/master/uPic/hyperf-admin.png',
  tokenKey: 'hyperf_amdin_token',
  fixedHeader: false,
  sidebarLogo: true,
  menuFilter: true,
  authType: 'local',
  baseAPI: process.env.VUE_APP_BASE_API,
  appid: process.env.VUE_APP_SSO_APPID,
  ssoType: process.env.VUE_APP_SSO_TYPE,
  sso: process.env.VUE_APP_SSO,
  ssoCallback: process.env.VUE_APP_SSO_CALLBACK,
  ssoLoginApi: process.env.VUE_APP_SSO_LOGIN_API,
  ssoLogoutApi: process.env.VUE_APP_SSO_LOGOUT_API,
  ssoRealLogoutApi: process.env.VUE_APP_SSO_REA_LOGOUT_API
}
