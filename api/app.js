// 小程序内容 banner、资讯、模板、告知书
import request from '@/api/request'

//banner
export function getAppBanners(params) {
  return request.get('/app/banners', params, { loading: false })
}
export function postAppBanner(data) {
  return request.post('/app/banners', data, { loading: true })
}
export function getAppBannersAll(params) {
  return request.get('/app/banners/all', params, { loading: false })
}
export function putAppBanner(id, data) {
  return request.put(`/app/banners/${id}`, data, { loading: true })
}
export function delAppBanner(id) {
  return request.delete(`/app/banners/${id}`, {}, { loading: true })
}

//文章资讯
export function getAppArticles(params) {
  return request.get('/app/articles', params, { loading: false })
}
export function postAppArticle(data) {
  return request.post('/app/articles', data, { loading: true })
}
export function getAppArticlesAll(params) {
  return request.get('/app/articles/all', params, { loading: false })
}
export function putAppArticle(id, data) {
  return request.put(`/app/articles/${id}`, data, { loading: true })
}
export function delAppArticle(id) {
  return request.delete(`/app/articles/${id}`, {}, { loading: true })
}

//回复模板
export function getAppTemplatesAll(params) {
  return request.get('/app/templates/all', params, { loading: false })
}
export function postAppTemplate(data) {
  return request.post('/app/templates', data, { loading: true })
}
export function putAppTemplate(id, data) {
  return request.put(`/app/templates/${id}`, data, { loading: true })
}
export function delAppTemplate(id) {
  return request.delete(`/app/templates/${id}`, {}, { loading: true })
}
export function putAppTemplateStatus(id, data) {
  return request.put(`/app/templates/${id}/status`, data, { loading: true })
}

//告知书
export function getAppInformedConsents(params) {
  return request.get('/app/informed‑consents', params, { loading: false })
}
export function postAppInformedConsent(data) {
  return request.post('/app/informed‑consents', data, { loading: true })
}
export function putAppInformedConsent(id, data) {
  return request.put(`/app/informed‑consents/${id}`, data, { loading: true })
}
export function delAppInformedConsent(id) {
  return request.delete(`/app/informed‑consents/${id}`, {}, { loading: true })
}
export function putAppInformedConsentStatus(id, data) {
  return request.put(`/app/informed‑consents/${id}/status`, data, { loading: true })
}
