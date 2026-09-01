// 陪诊模块
import request from '@/api/request'

export function getMeEscort() {
  return request.get('/me/escort', {}, { loading: false })
}
export function getMeEscortSlots(params) {
  return request.get('/me/escort/slots', params, { loading: false })
}
export function postMeEscortBookings(data) {
  return request.post('/me/escort/bookings', data, { loading: true })
}
export function getMeEscortBookings(params) {
  return request.get('/me/escort/bookings', params, { loading: false })
}
export function postMeEscortBookingCancel(id) {
  return request.post(`/me/escort/bookings/${id}/cancel`, {}, { loading: true })
}

export function getEscortTasks(params) {
  return request.get('/escort/tasks', params, { loading: false })
}
export function getEscortTaskDetail(id) {
  return request.get(`/escort/tasks/${id}`, {}, { loading: false })
}
export function putEscortBookingAccept(bookingId, data) {
  return request.put(`/escort/bookings/${bookingId}/accept`, data, { loading: true })
}
export function putEscortTaskStart(id, data) {
  return request.put(`/escort/tasks/${id}/start`, data, { loading: true })
}
export function postEscortTaskCheckin(id, data) {
  return request.post(`/escort/tasks/${id}/checkins`, data, { loading: true })
}
export function postEscortTaskProgress(id, data) {
  return request.post(`/escort/tasks/${id}/progress`, data, { loading: true })
}
export function putEscortTaskFinish(id, data) {
  return request.put(`/escort/tasks/${id}/finish`, data, { loading: true })
}
export function getEscortStats() {
  return request.get('/escort/stats', {}, { loading: false })
}
export function getEscortBookingsManage(params) {
  return request.get('/escort/bookings', params, { loading: false })
}
export function putEscortConfig(data) {
  return request.put('/escort/config', data, { loading: true })
}
