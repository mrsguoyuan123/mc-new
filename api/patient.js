// 患者管理 PC
import request from '@/api/request'
//患者列表
export function getPatients(params) {
  return request.get('/patients', params, { loading: false })
}
export function postPatients(data) {
  return request.post('/patients', data, { loading: true })
}
export function getPatientDetail(id) {
  return request.get(`/patients/${id}`, {}, { loading: false })
}
export function putPatient(id, data) {
  return request.put(`/patients/${id}`, data, { loading: true })
}
export function delPatient(id) {
  return request.delete(`/patients/${id}`, {}, { loading: true })
}

//患者病历
export function getPatientMedicalRecord(id) {
  return request.get(`/patients/${id}/medical-record`, {}, { loading: false })
}
export function putPatientMedicalRecord(id, data) {
  return request.put(`/patients/${id}/medical-record`, data, { loading: true })
}

//匹配客服驻点
export function putPatientMatch(id, data) {
  return request.put(`/patients/${id}/match`, data, { loading: true })
}
//患者标签
export function putPatientTags(id, data) {
  return request.put(`/patients/${id}/tags`, data, { loading: true })
}
//陪诊配额
export function putPatientEscortQuota(id, data) {
  return request.put(`/patients/${id}/escort-quota`, data, { loading: true })
}
//患者看板
export function getPatientHealthDashboard(id) {
  return request.get(`/patients/${id}/health-dashboard`, {}, { loading: false })
}
