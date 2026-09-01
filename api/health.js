import request from '@/api/request'

//我的健康记录
export function getMeHealthRecords(params) {
  return request.get('/me/health-records', params, { loading: false })
}
export function postMeHealthRecords(data) {
  return request.post('/me/health-records', data, { loading: true })
}

//后台查看患者健康记录
export function getPatientHealthRecords(patientId, params) {
  return request.get(`/patients/${patientId}/health-records`, params, { loading: false })
}
export function postPatientHealthRecords(patientId, data) {
  return request.post(`/patients/${patientId}/health-records`, data, { loading: true })
}

//健康记录写建议
export function putHealthRecordAdvice(recordId, data) {
  return request.put(`/health-records/${recordId}/advice`, data, { loading: true })
}

//我的健康看板
export function getMeHealthDashboard() {
  return request.get('/me/health-dashboard', {}, { loading: false })
}

//PSQI睡眠评估
export function getMeScalesPsqi() {
  return request.get('/me/scales/psqi', {}, { loading: false })
}
export function postMeScalesPsqiSubmit(data) {
  return request.post('/me/scales/psqi/submissions', data, { loading: true })
}
export function getMeScalesPsqiHistory(params) {
  return request.get('/me/scales/psqi/submissions', params, { loading: false })
}
export function getPatientScalesPsqi(patientId) {
  return request.get(`/patients/${patientId}/scales`, {}, { loading: false })
}

//用药模块
export function getMeMedicationToday() {
  return request.get('/me/medication/today', {}, { loading: false })
}
export function postMeMedication(data) {
  return request.post('/me/medication', data, { loading: true })
}
export function postMeMedicationTake(id, data) {
  return request.post(`/me/medication/${id}/take`, data, { loading: true })
}
export function putMeMedicationReminder(id, data) {
  return request.put(`/me/medication/${id}/reminder`, data, { loading: true })
}
