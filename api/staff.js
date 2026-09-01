
// 人员管理排班绩效
import request from '@/api/request'

export function getStaffList(params) {
  return request.get('/staff', params, { loading: false })
}
export function postStaff(data) {
  return request.post('/staff', data, { loading: true })
}
export function getStaffDetail(id) {
  return request.get(`/staff/${id}`, {}, { loading: false })
}
export function putStaff(id, data) {
  return request.put(`/staff/${id}`, data, { loading: true })
}
export function putStaffStatus(id, data) {
  return request.put(`/staff/${id}/status`, data, { loading: true })
}
export function putStaffResetPwd(id, data) {
  return request.put(`/staff/${id}/password`, data, { loading: true })
}

//排班
export function getStaffSchedules(params) {
  return request.get('/staff/schedules', params, { loading: false })
}
export function postStaffSchedule(data) {
  return request.post('/staff/schedules', data, { loading: true })
}
export function delStaffSchedule(id) {
  return request.delete(`/staff/schedules/${id}`, {}, { loading: true })
}

//绩效
export function getStaffPerformance(params) {
  return request.get('/staff/performance', params, { loading: false })
}
//医院效能看板
export function getAssessmentHospitalDashboard(params) {
  return request.get('/assessment/hospital-dashboard', params, { loading: false })
}
