// 存储进行中的请求，用于去重
const pendingRequest = new Map()

// 生成请求唯一key
function generateReqKey(config) {
	const {
		url,
		method,
		data
	} = config
	return [method, url, JSON.stringify(data)].join('&')
}

// 添加请求到pending
function addPendingRequest(config) {
	const key = generateReqKey(config)
	config.cancelToken = key
	pendingRequest.set(key, config)
}

// 移除pending
function removePendingRequest(config) {
	const key = config.cancelToken || generateReqKey(config)
	if (pendingRequest.has(key)) {
		pendingRequest.delete(key)
	}
}

// 环境baseURL
let baseURL = 'http://47.100.61.248:3002'
// #ifdef DEV
baseURL = 'http://47.100.61.248:3002'
// #endif
// #ifdef PROD
baseURL = 'http://47.100.61.248:3002'
// #endif


/**
 * @param {Object} options
 * @param {String} options.url
 * @param {String} options.method GET POST PUT DELETE
 * @param {Object} options.data
 * @param {Boolean} options.loading 是否显示loading
 * @param {String} options.loadingText
 * @param {Boolean} options.repeatCancel 是否取消重复请求，默认true
 * @param {Number} options.timeout 超时毫秒，默认10000
 */
const request = (options) => {
	console.log('baseURL====', baseURL)
	console.log('请求完整url：', baseURL + options.url)
	const {
		url,
		method = 'GET',
		data = {},
		loading = false,
		loadingText = '加载中...',
		repeatCancel = true,
		timeout = 10000,
		contentType = 'application/json',
		header = {}
	} = options

	const token = uni.getStorageSync('token')

	return new Promise((resolve, reject) => {
		const config = {
			url,
			method,
			data
		}
		// 取消重复请求
		if (repeatCancel) {
			addPendingRequest(config)
		}

		if (loading) {
			uni.showLoading({
				title: loadingText,
				mask: true
			})
		}

		const requestTask = uni.request({
			url: baseURL + url,
			method,
			data,
			timeout,
			header: {
				'Content-Type': contentType,
				...(token ? {
					Authorization: `Bearer ${token}`
				} : {}),
				...header
			},
			success: (res) => {
				removePendingRequest(config)
				loading && uni.hideLoading()
				const {
					code,
					data,
					msg
				} = res.data
				// 根据你们后端业务码修改
				if (code === 200) {
					resolve(res.data)
				} else if (code === 401) {
					const refreshToken = uni.getStorageSync('refreshToken')
					if (!refreshToken) {
						uni.removeStorageSync('token')
						uni.removeStorageSync('refreshToken')
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none'
						})
						uni.navigateTo({
							url: '/pages/index/login'
						})
						reject(res.data)
						return
					}

					if (isRefreshing) {
						return new Promise(resolve => {
							pendingQueue.push({
								config,
								resolve
							})
						}).then(() => request(config)).then(resolve).catch(reject)
					}

					isRefreshing = true
					import('@/api/auth').then(({
						authRefresh
					}) => {
						authRefresh({
								refreshToken
							})
							.then(refreshRes => {
								uni.setStorageSync('token', refreshRes.data.token)
								uni.setStorageSync('refreshToken', refreshRes.data
									.refreshToken)
								pendingQueue.forEach(item => item.resolve())
								pendingQueue = []
								return request(config)
							})
							.then(resolve)
							.catch(() => {
								uni.removeStorageSync('token')
								uni.removeStorageSync('refreshToken')
								pendingQueue = []
								uni.showToast({
									title: '登录已过期，请重新登录',
									icon: 'none'
								})
								uni.navigateTo({
									url: '/pages/index/login'
								})
								reject(res.data)
							})
							.finally(() => {
								isRefreshing = false
							})
					})
				}

			},
			fail: (err) => {
				removePendingRequest(config)
				loading && uni.hideLoading()
				if (err?.errMsg?.includes('timeout')) {
					uni.showToast({
						title: '请求超时，请检查网络',
						icon: 'none'
					})
				} else {
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'none'
					})
				}
				reject(err)
			}
		})

		// 手动取消请求示例：requestTask.abort()
		config.requestTask = requestTask
	})
}
export function uploadFile(filePath, formData = {}) {
	const token = uni.getStorageSync('token')
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: baseURL + '/upload',
			filePath,
			name: 'file',
			formData,
			header: {
				...(token ? {
					Authorization: `Bearer ${token}`
				} : {})
			},
			success: (res) => {
				const data = JSON.parse(res.data)
				resolve(data)
			},
			fail: (err) => reject(err)
		})
	})
}
export { baseURL }
export default {
	get(url, data = {}, opts = {}) {
		return request({
			url,
			method: 'GET',
			data,
			...opts
		})
	},
	post(url, data = {}, opts = {}) {
		return request({
			url,
			method: 'POST',
			data,
			...opts
		})
	},
	put(url, data = {}, opts = {}) {
		return request({
			url,
			method: 'PUT',
			data,
			...opts
		})
	},
	delete(url, data = {}, opts = {}) {
		return request({
			url,
			method: 'DELETE',
			data,
			...opts
		})
	}
}
