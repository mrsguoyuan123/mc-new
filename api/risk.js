
// 风险提示
import request from '@/api/request'

export function getRiskAlerts(params) {
  return request.get('/risk-alerts', params, { loading: false })
}
export function postRiskAlert(data) {
  return request.post('/risk-alerts', data, { loading: true })
}
export function getRiskAlertSummary() {
  return request.get('/risk-alerts/summary', {}, { loading: false })
}
export function putRiskAlertHandle(id, data) {
  return request.put(`/risk-alerts/${id}`, data, { loading: true })
}
