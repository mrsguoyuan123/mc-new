// 字典模块（医院 / 院区 / 科室 / 医生 / 标签）

import request from '@/api/request'

//医院
export function getDictHospitals(params) {
  return request.get('/dict/hospitals', params, { loading: false })
}
export function postDictHospitals(data) {
  return request.post('/dict/hospitals', data, { loading: true })
}
export function putDictHospitals(id, data) {
  return request.put(`/dict/hospitals/${id}`, data, { loading: true })
}
export function delDictHospitals(id) {
  return request.delete(`/dict/hospitals/${id}`, {}, { loading: true })
}

//院区 areas
export function getDictAreas(params) {
  return request.get('/dict/areas', params, { loading: false })
}
export function postDictAreas(data) {
  return request.post('/dict/areas', data, { loading: true })
}
export function putDictAreas(id, data) {
  return request.put(`/dict/areas/${id}`, data, { loading: true })
}
export function delDictAreas(id) {
  return request.delete(`/dict/areas/${id}`, {}, { loading: true })
}

//科室 departments
export function getDictDepartments(params) {
  return request.get('/dict/departments', params, { loading: false })
}
export function postDictDepartments(data) {
  return request.post('/dict/departments', data, { loading: true })
}
export function putDictDepartments(id, data) {
  return request.put(`/dict/departments/${id}`, data, { loading: true })
}
export function delDictDepartments(id) {
  return request.delete(`/dict/departments/${id}`, {}, { loading: true })
}

//医生 doctors
export function getDictDoctors(params) {
  return request.get('/dict/doctors', params, { loading: false })
}
export function postDictDoctors(data) {
  return request.post('/dict/doctors', data, { loading: true })
}
export function putDictDoctors(id, data) {
  return request.put(`/dict/doctors/${id}`, data, { loading: true })
}
export function delDictDoctors(id) {
  return request.delete(`/dict/doctors/${id}`, {}, { loading: true })
}

//患者标签 tags
export function getDictTags(params) {
  return request.get('/dict/tags', params, { loading: false })
}
export function postDictTags(data) {
  return request.post('/dict/tags', data, { loading: true })
}
export function putDictTags(id, data) {
  return request.put(`/dict/tags/${id}`, data, { loading: true })
}
export function delDictTags(id) {
  return request.delete(`/dict/tags/${id}`, {}, { loading: true })
}

//级联下拉包
export function getDictOptions() {
  return request.get('/dict/options', {}, { loading: false })
}
