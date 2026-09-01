import request from '@/api/request'

export function getConversations(params) {
  return request.get('/conversations', params, { loading: false })
}
export function getConversationDetail(id) {
  return request.get(`/conversations/${id}`, {}, { loading: false })
}
export function putConversationStatus(id, data) {
  return request.put(`/conversations/${id}/status`, data, { loading: true })
}
export function putConversationPriority(id, data) {
  return request.put(`/conversations/${id}/priority`, data, { loading: true })
}
export function getConversationMessages(id, params) {
  return request.get(`/conversations/${id}/messages`, params, { loading: false })
}
export function postConversationMessage(id, data) {
  return request.post(`/conversations/${id}/messages`, data, { loading: true })
}
export function postConversationRead(id) {
  return request.post(`/conversations/${id}/read`, {}, { loading: true })
}
export function getConversationStats() {
  return request.get('/conversations/stats', {}, { loading: false })
}
export function getMeConversations(params) {
  return request.get('/me/conversations', params, { loading: false })
}
export function postConversationManualService(id) {
  return request.post(`/conversations/${id}/manual-service`, {}, { loading: true })
}
export function getManualServiceRequests(params) {
  return request.get('/manual-service-requests', params, { loading: false })
}
export function putManualServiceRequest(id, data) {
  return request.put(`/manual-service-requests/${id}`, data, { loading: true })
}
export function postConversationEvaluation(id, data) {
  return request.post(`/conversations/${id}/evaluation`, data, { loading: true })
}
export function getReplyTemplates(params) {
  return request.get('/reply-templates', params, { loading: false })
}

//知识库 kb
export function getKbEntries(params) {
  return request.get('/kb/entries', params, { loading: false })
}
export function postKbEntry(data) {
  return request.post('/kb/entries', data, { loading: true })
}
export function putKbEntry(id, data) {
  return request.put(`/kb/entries/${id}`, data, { loading: true })
}
export function delKbEntry(id) {
  return request.delete(`/kb/entries/${id}`, {}, { loading: true })
}
export function putKbEntryStatus(id, data) {
  return request.put(`/kb/entries/${id}/status`, data, { loading: true })
}
