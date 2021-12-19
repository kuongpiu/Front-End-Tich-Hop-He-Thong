const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  gender: state => state.user.gender,
  phoneNumber: state => state.user.phoneNumber,
  telegramUsername: state => state.user.telegramUsername,
  telegramUid: state => state.user.telegramUid,
  dob: state => state.user.dob,
  checkInHistory: state => state.user.checkInHistory,
  address: state => state.user.address,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs
}
export default getters
