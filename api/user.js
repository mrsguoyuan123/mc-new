import { get, post } from '../utils/request.js'

// 一键登录：提交access_token、openid，后端换取手机号并登录
// 微信小程序一键登录（传code给后端解密手机号）
export function wxPhoneLogin(data) {
  return post('/user/wxPhoneLogin', data)
}

// 发送短信验证码
export function sendSmsCode(data) {
  return post('/user/sendCode', data, { showLoading: true })
}

// 短信验证码登录
export function smsLogin(data) {
  return post('/user/smsLogin', data)
}