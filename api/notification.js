// 站内通知
import request from '@/api/request'

export function getNotifications(params) {
  return request.get('/notifications', params, { loading: false })
}
export function putNotificationsRead() {
  return request.put('/notifications/read', {}, { loading: true })
}
export function postNotificationWxSubscribe(data) {
  return request.post('/notifications/wx‑subscribe', data, { loading: true })
}
