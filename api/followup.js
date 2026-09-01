// 随访任务
import request from '@/common/request'

export function getFollowupTasks(params) {
  return request.get('/follow-up/tasks', params, { loading: false })
}
export function postFollowupTask(data) {
  return request.post('/follow-up/tasks', data, { loading: true })
}
export function putFollowupTask(id, data) {
  return request.put(`/follow-up/tasks/${id}`, data, { loading: true })
}
export function postFollowupTaskCall(id, data) {
  return request.post(`/follow-up/tasks/${id}/calls`, data, { loading: true })
}
export function getFollowupTaskCalls(id, params) {
  return request.get(`/follow-up/tasks/${id}/calls`, params, { loading: false })
}
export function getFollowupPhoneStatus(id) {
  return request.get(`/follow-up/tasks/${id}/phone-status`, {}, { loading: false })
}
export function getFollowupSummary() {
  return request.get('/follow-up/summary', {}, { loading: false })
}
