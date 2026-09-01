import request from '@/api/request'

//员工账号密码登录
export function authLogin(data) {
  return request.post('/auth/login', data, { loading: true })
}

//患者注册
export function authRegister(data) {
  return request.post('/auth/register', data, { loading: true })
}

//获取短信验证码
export function authSmsCode(data) {
  return request.post('/auth/sms-code', data, { loading: true })
}

//患者短信验证码登录
export function authSmsLogin(data) {
  return request.post('/auth/sms-login', data, { loading: true })
}

//微信一键登录（患者，小程序）
export function authWxLogin(data) {
  return request.post('/auth/wx-login', data, { loading: true })
}

//刷新token
export function authRefresh(data) {
  return request.post('/auth/refresh', data, { repeatCancel: false })
}

//登出
export function authLogout() {
  return request.post('/auth/logout', {}, { loading: true })
}

//获取当前登录用户信息（角色、数据权限）
export function getAuthMe() {
  return request.get('/auth/me', {}, { loading: false })
}

//修改自己密码
export function putAuthPassword(data) {
  return request.put('/auth/password', data, { loading: true })
}

//获取个人系统设置
export function getMeSettings() {
  return request.get('/auth/me/settings', {}, { loading: false })
}

//更新个人系统设置
export function putMeSettings(data) {
  return request.put('/auth/me/settings', data, { loading: true })
}

//登录日志
export function getAccountsLoginLogs(params) {
  return request.get('/auth/accounts/login-logs', params, { loading: false })
}

//操作日志
export function getAccountsOperationLogs(params) {
  return request.get('/auth/accounts/operation-logs', params, { loading: false })
}

//更新账号安全策略
export function putAccountsSecurity(data) {
  return request.put('/auth/accounts/security', data, { loading: true })
}
