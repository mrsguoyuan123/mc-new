
// 医院管理端
import request from '@/api/request'

export function getHospitalPatients(params) {
  return request.get('/hospital/patients', params, { loading: false })
}
export function getHospitalPatientHealthDetail(patientId) {
  return request.get(`/hospital/patients/${patientId}/health-detail`, {}, { loading: false })
}
export function getHospitalSummary() {
  return request.get('/hospital/summary', {}, { loading: false })
}
