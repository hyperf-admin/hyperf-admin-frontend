const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  module: state => state.app.moduleName,
  currentPageName: state => state.app.currentPageName,
  has_new_message: state => state.user.hasNewMessage
}
export default getters
