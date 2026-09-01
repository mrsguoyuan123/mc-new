import request, { baseURL } from '@/api/request'

/**
 * 获取我的个人基本信息
 */
export function getMeProfile() {
  return request.get('/me/profile', {}, { loading: false })
}

/**
 * 编辑我的个人信息
 * @param {Object} data 地区、医院、科室、手术名称、就诊医生等
 */
export function putMeProfile(data) {
  return request.put('/me/profile', data, { loading: true })
}

/**
 * 获取我的健康管家：主管医生+客服信息
 */
export function getMeHealthManager() {
  return request.get('/me/health-manager', {}, { loading: false })
}

/**
 * 获取我的病历
 */
export function getMeMedicalRecord() {
  return request.get('/me/medical-record', {}, { loading: false })
}

/**
 * 病历照片OCR识别，上传图片，返回taskId
 * @param {String} filePath 本地图片路径
 */
export function postMeMedicalRecordScan(filePath) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseURL}/me/medical-record/scan`,
      filePath,
      name: 'file',
      header: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        try {
          const result = JSON.parse(res.data)
          resolve(result)
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 查询OCR识别任务结果
 * @param {String} taskId ocr任务id
 */
export function getMeMedicalRecordScanResult(taskId) {
  return request.get(`/me/medical-record/scan/${taskId}`, {}, { loading: false })
}

/**
 * 确认OCR结果回填病历
 * @param {Object} data ocr返回的字段
 */
export function postMeMedicalRecordConfirm(data) {
  return request.post('/me/medical-record/confirm', data, { loading: true })
}
