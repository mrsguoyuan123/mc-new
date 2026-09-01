
import request, { baseURL } from '@/api/request'

/**
 * 单文件上传
 * @param {String} filePath 本地临时路径
 */
export function postFilesUpload(filePath) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseURL}/files/upload`,
      filePath,
      name: 'file',
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => {
        try { resolve(JSON.parse(res.data)) } catch (e) { reject(e) }
      },
      fail: err => reject(err)
    })
  })
}

/**
 * 批量上传
 * @param {Array} filePaths 本地路径数组
 */
export function postFilesUploads(filePaths) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseURL}/files/uploads`,
      files: filePaths.map(p => ({ name:'files', filePath:p })),
      header: { Authorization: token ? `Bearer ${token}` : '' },
      success: (res) => {
        try { resolve(JSON.parse(res.data)) } catch (e) { reject(e) }
      },
      fail: err => reject(err)
    })
  })
}
