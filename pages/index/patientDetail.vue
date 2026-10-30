<template>
	<view class="detail-page">
		<!-- 改动位置：自定义顶部导航 -->
		<view class="nav-bar">
			<view class="back-btn" @click="goBack">
				<u-icon name="arrow-left" color="#1f2937" size="22"></u-icon>
			</view>
			<text class="nav-title">患者详情</text>
		</view>

		<view v-if="loading" class="state-block">
			<u-loading-icon mode="circle" color="#2563ff" size="30"></u-loading-icon>
			<text class="state-text">患者详情加载中...</text>
		</view>

		<view v-else-if="loadError" class="error-card">
			<u-icon name="info-circle" color="#f59e0b" size="42"></u-icon>
			<text class="error-title">详情加载失败</text>
			<text class="error-desc">{{ loadError }}</text>
			<u-button type="primary" shape="circle" size="mini" text="重新加载" @click="loadDetail"></u-button>
		</view>

		<template v-else>
			<!-- 改动位置：患者基础信息 -->
			<view class="patient-card">
				<view class="patient-avatar">
					<image v-if="patient.avatar" class="avatar-img" :src="patient.avatar" mode="aspectFill"></image>
					<u-icon v-else name="account-fill" color="#2563ff" size="43"></u-icon>
				</view>
				<view class="patient-main">
					<view class="patient-title-row">
						<text class="patient-name">{{ patient.name }}</text>
						<text class="patient-age">{{ patient.ageText }}</text>
						<!-- <u-tag
							v-if="patient.riskText"
							:text="patient.riskText"
							:type="patient.riskType"
							size="mini"
							:plain="!patient.isHighRisk"
						></u-tag> -->
					</view>
					<view v-if="isHistory" class="patient-sub">
						<u-icon name="clock" color="#9aa3b2" size="16"></u-icon>
						<text class="sub-text">上次服务：{{ patient.lastServiceTime }}</text>
					</view>
                  
                    
					<view v-else-if="patient.surgeryType" class="patient-sub">
						<u-icon name="order" color="#9aa3b2" size="16"></u-icon>
						<text class="sub-text">{{ patient.surgeryType }}</text>
					</view>
                      <view class="patient-sub">
						<u-icon name="clock" color="#9aa3b2" size="16"></u-icon>
						<text class="sub-text">服务时间：{{ patient.serviceDate }}</text>
					</view>
				</view>
			</view>

			<!-- 改动位置：待接单/待服务/服务中订单信息 -->
			<view v-if="!isHistory" class="section-card">
				<view class="section-title">当前服务</view>
				<!-- <view class="info-row">
					<view class="info-icon blue">
						<u-icon name="clock" color="#2563ff" size="17"></u-icon>
					</view>
					<view class="info-content">
						<text class="info-label">服务时间</text>
						<text class="info-value strong">{{ patient.serviceTime }}</text>
					</view>
					<u-tag :text="statusText" type="primary" size="mini"></u-tag>
			
                </view> -->

				<view class="info-row">
					<view class="info-icon green">
						<u-icon name="phone" color="#16a34a" size="17"></u-icon>
					</view>
					<view class="info-content">
						<text class="info-label">联系电话</text>
						<text class="info-value">{{ patient.phone }}</text>
					</view>
					<!-- <u-button type="primary" plain shape="circle" size="mini" text="拨打" @click="callPhone"></u-button> -->
				</view>

				<view class="info-row align-start">
					<view class="info-icon orange">
						<u-icon name="map-fill" color="#f59e0b" size="17"></u-icon>
					</view>
					<view class="info-content">
						<text class="info-label">服务地址</text>
						<text class="info-value address">{{ patient.address }}</text>
					</view>
				</view>

				<u-button
					class="nav-btn"
					type="primary"
					shape="circle"
					text="导航前往"
					@click="navigateAddress"
				></u-button>
			</view>

			<!-- 改动位置：待服务订单的风险和照护注意事项 -->
			<view v-if="!isHistory" class="section-card">
				<view class="notice-header">
					<view>
						<view class="section-title no-margin">照护注意事项</view>
						<view class="notice-sub">请服务前再次核对患者状态</view>
					</view>
					<u-tag
						v-if="patient.riskText"
						:text="patient.riskText"
						:type="patient.riskType"
						size="mini"
						:plain="!patient.isHighRisk"
					></u-tag>
				</view>

				<view v-if="careNotices.length" class="notice-list">
					<view v-for="(item, index) in careNotices" :key="index" class="notice-item" :class="{ danger: patient.isHighRisk }">
						<view class="notice-dot"></view>
						<view class="notice-body">
							<text v-if="item.title" class="notice-title">{{ item.title }}</text>
							<text class="notice-content">{{ item.content }}</text>
						</view>
					</view>
				</view>
				<view v-else class="empty-inline">暂无额外照护注意事项</view>
			</view>

			<!-- 改动位置：已完成订单的服务历史 -->
			<view v-else class="section-card">
				<view class="section-title">服务历史</view>
				<view v-if="historyRecords.length" class="history-list">
					<view v-for="item in historyRecords" :key="item.id" class="history-item">
						<view class="history-left">
							<u-icon name="clock" color="#9aa3b2" size="17"></u-icon>
							<view class="history-info">
								<text class="history-time">{{ item.serviceTime }}</text>
								<text v-if="item.content" class="history-content">{{ item.content }}</text>
							</view>
						</view>
						<u-tag :text="item.statusText" :type="item.statusType" size="mini"></u-tag>
					</view>
				</view>
				<view v-else class="empty-inline">暂无服务历史记录</view>
			</view>
		</template>
	</view>
</template>

<script>
import { getEscortOrdersByIdApi } from '@/api/frontApikit.js'

export default {
	data() {
		return {
			loading: false,
			loadError: '',
			orderId: '',
			orderStatus: '',
			detail: {},
			patient: {
				name: '',
				ageText: '年龄未填',
				phone: '手机号待补充',
				address: '暂无服务地址',
				serviceTime: '服务时间待确认',
				lastServiceTime: '--',
				riskText: '',
				riskType: 'info',
				isHighRisk: false,
				surgeryType: '',
				avatar: ''
			},
			careNotices: [],
			historyRecords: []
		}
	},
	computed: {
		// 已完成订单按历史详情形态展示
		isHistory() {
			const bookingStatus = this.detail.booking ? this.detail.booking.status : ''
			const status = this.orderStatus || bookingStatus || this.detail.status || ''
			return status === 'COMPLETED'
		},
		// 统一订单状态文案
		statusText() {
			const bookingStatus = this.detail.booking ? this.detail.booking.status : ''
			const map = {
				WAIT_ACCEPT: '待接单',
				CONFIRMED: '待服务',
				IN_SERVICE: '服务中',
				COMPLETED: '已完成',
				CANCELLED: '已取消'
			}
			return map[this.orderStatus] || map[bookingStatus] || '待服务'
		}
	},
	onLoad(options) {
		this.orderId = options.id || options.orderId || ''
		this.orderStatus = options.orderStatus || options.status || ''
		this.loadDetail()
	},
	methods: {
		// 获取订单详情并按状态归一化页面数据
		async loadDetail() {
			if (!this.orderId) {
				this.loadError = '缺少订单ID，无法加载患者详情'
				return
			}
			this.loading = true
			this.loadError = ''
			try {
				const data = await getEscortOrdersByIdApi({ id: this.orderId }) || {}
				this.detail = data
				const booking = data.booking || {}
				const patient = data.patient || {}
				const serviceRecord = data.serviceRecord || {}
				const checkins = Array.isArray(data.checkins) ? data.checkins : []
				this.orderStatus = this.orderStatus || booking.status || data.status || ''
				this.patient = this.normalizePatient(data, booking, patient, serviceRecord, checkins)
				this.careNotices = this.buildCareNotices(data, booking, patient)
				this.historyRecords = this.buildHistory(data, serviceRecord, checkins)
			} catch (error) {
				this.loadError = this.errorMessage(error, '患者详情加载失败，请稍后重试')
				console.warn('[patientDetail]', this.loadError, error)
			} finally {
				this.loading = false
			}
		},
		// 合并订单、患者和服务记录字段
		normalizePatient(data, booking, patient, serviceRecord, checkins) {
			const merged = Object.assign({}, booking, patient, data.patientInfo || {}, data)
			const finishTime = serviceRecord.createTime || booking.finishTime || this.latestCheckinTime(checkins) || ''
			const risk = this.normalizeRisk(merged.riskLevel || merged.risk)
			return {
				id: patient.id || merged.patientId || '',
				name: merged.patientName || merged.name || '未命名患者',
				age: this.toNumber(merged.age),
				ageText: this.toNumber(merged.age) ? `${merged.age}岁` : '年龄未填',
				phone: this.maskPhone(merged.phone || merged.mobile || merged.contactPhone),
				rawPhone: merged.phone || merged.mobile || merged.contactPhone || '',
				address: merged.address || merged.hospitalAddress || this.joinHospital(booking) || '暂无服务地址',
				serviceTime: this.formatServiceTime(merged.serviceDate || booking.serviceDate, merged.period || booking.timeSlot, merged.serviceTime),
				lastServiceTime: this.formatDateTime(finishTime) || '--',
				riskText: risk.text,
				riskType: risk.type,
				isHighRisk: risk.high,
				serviceDate: merged.serviceDate ,

				surgeryType: merged.surgeryType || merged.serviceType || '',
				avatar: merged.avatar || merged.avatarUrl || '',
				latitude: this.toFiniteNumber(merged.latitude),
				longitude: this.toFiniteNumber(merged.longitude)
			}
		},
		// 构建待服务订单的照护注意事项
		buildCareNotices(data, booking, patient) {
			const list = []
			const notices = patient.notices || data.notices || []
			if (Array.isArray(notices)) {
				notices.forEach(item => {
					if (typeof item === 'string') {
						list.push({ title: '', content: item })
					} else if (item && (item.title || item.content)) {
						list.push({ title: item.title || '', content: item.content || '' })
					}
				})
			}
			const careNotice = data.careNotice || patient.careNotice || booking.careNotice
			if (careNotice) list.push({ title: '照护提醒', content: careNotice })
			// if (booking.remark) list.push({ title: '订单备注', content: booking.remark })
			return list
		},
		// 构建已完成订单的服务历史列表
		buildHistory(data, serviceRecord, checkins) {
			const rawList = this.extractList(data.historyRecords || data.serviceRecords || data.history || data.records)
			let records = rawList.map((item, index) => {
				const taskStatus = item.taskCompleted || item.status || 'COMPLETED'
				return {
					id: item.id || `${item.serviceTime || index}`,
					serviceTime: this.formatDateTime(item.serviceTime || item.createTime || item.finishTime) || '--',
					content: item.recoveryDescription || item.specialFeedback || item.remark || '',
					statusText: taskStatus === 'INCOMPLETE' ? '未完成' : '已完成',
					statusType: taskStatus === 'INCOMPLETE' ? 'warning' : 'success'
				}
			})
			if (!records.length && serviceRecord && Object.keys(serviceRecord).length) {
				const taskStatus = serviceRecord.taskCompleted || 'COMPLETED'
				records.push({
					id: serviceRecord.id || 'current',
					serviceTime: this.formatDateTime(serviceRecord.createTime || (data.booking ? data.booking.finishTime : '')) || this.patient.lastServiceTime,
					content: serviceRecord.recoveryDescription || serviceRecord.specialFeedback || '',
					statusText: taskStatus === 'INCOMPLETE' ? '未完成' : '已完成',
					statusType: taskStatus === 'INCOMPLETE' ? 'warning' : 'success'
				})
			}
			if (!records.length && checkins.length) {
				records = checkins.map(item => ({
					id: item.id || item.createTime,
					serviceTime: this.formatDateTime(item.createTime) || '--',
					content: item.type === 'ARRIVE' ? '到院签到' : item.type === 'FINISH' ? '完成签到' : item.address || '服务签到',
					statusText: '已完成',
					statusType: 'success'
				}))
			}
			return records
		},
		// 拨打患者联系电话
		callPhone() {
			if (!this.patient.rawPhone) {
				uni.showToast({ title: '暂无联系电话', icon: 'none' })
				return
			}
			uni.makePhoneCall({ phoneNumber: this.patient.rawPhone })
		},
		// 打开地图导航，缺少经纬度时复制地址兜底
		navigateAddress() {
			if (this.patient.latitude !== null && this.patient.longitude !== null) {
				uni.openLocation({
					latitude: this.patient.latitude,
					longitude: this.patient.longitude,
					name: this.patient.name,
					address: this.patient.address
				})
				return
			}
			uni.setClipboardData({
				data: this.patient.address,
				success: () => uni.showToast({ title: '暂无定位，地址已复制', icon: 'none' })
			})
		},
		// 返回上一页或回到陪诊工作台
		goBack() {
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack({ delta: 1 })
			} else {
				uni.reLaunch({ url: '/pages/index/caregiverIndex' })
			}
		},
		// 解析风险等级和标签样式
		normalizeRisk(value) {
			const text = String(value || '').toUpperCase()
			if (text === 'HIGH' || value === '高风险' || value === '高' || text.includes('HIGH')) {
				return { text: value || '高风险', type: 'error', high: true }
			}
			if (text === 'MEDIUM' || value === '中风险' || value === '中' || text.includes('MEDIUM')) {
				return { text: value || '中风险', type: 'warning', high: false }
			}
			if (text === 'LOW' || value === '低风险' || value === '低' || text.includes('LOW')) {
				return { text: value || '低风险', type: 'success', high: false }
			}
			return { text: value || '', type: 'info', high: false }
		},
		// 从多种分页/数组结构中取出列表
		extractList(data) {
			if (Array.isArray(data)) return data
			if (!data) return []
			if (Array.isArray(data.list)) return data.list
			if (Array.isArray(data.records)) return data.records
			if (Array.isArray(data.items)) return data.items
			return []
		},
		// 获取最近一次签到时间
		latestCheckinTime(checkins) {
			if (!checkins.length) return ''
			const arrive = checkins.find(item => item.type === 'ARRIVE') || checkins[0]
			return arrive.createTime || ''
		},
		// 拼接医院和科室作为地址兜底
		joinHospital(booking) {
			return [booking.hospital, booking.department].filter(Boolean).join(' · ')
		},
		// 手机号脱敏展示
		maskPhone(phone) {
			const value = String(phone || '').replace(/\s/g, '')
			if (!value) return '手机号待补充'
			if (/^1\d{10}$/.test(value)) return `${value.slice(0, 3)}****${value.slice(7)}`
			return value
		},
		// 转成有限数字
		toFiniteNumber(value) {
			const number = Number(value)
			return Number.isFinite(number) ? number : null
		},
		// 安全转数字
		toNumber(value) {
			const number = Number(value)
			return Number.isFinite(number) ? number : 0
		},
		// 拼接服务日期和时段
		formatServiceTime(date, period, timeText) {
			if (timeText) return timeText
			if (date && period) return `${date} ${period}`
			return date || period || '服务时间待确认'
		},
		// 格式化日期时间
		formatDateTime(value) {
			if (!value) return ''
			const date = new Date(value)
			if (Number.isNaN(date.getTime())) return String(value)
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const d = String(date.getDate()).padStart(2, '0')
			const h = String(date.getHours()).padStart(2, '0')
			const min = String(date.getMinutes()).padStart(2, '0')
			return `${y}-${m}-${d} ${h}:${min}`
		},
		// 提取接口异常文案
		errorMessage(error, fallback) {
			return (error && (error.message || error.errMsg)) || fallback
		}
	}
}
</script>

<style scoped>
.detail-page {
	min-height: 100vh;
	padding: 24rpx 28rpx 48rpx;
	box-sizing: border-box;
	background: #f5f7fb;
}

.nav-bar {
	position: relative;
	display: flex;
	align-items: center;
	height: 88rpx;
	margin: 8rpx 0 24rpx;
}

.back-btn {
	width: 76rpx;
	height: 76rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #ffffff;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.06);
}

.nav-title {
	position: absolute;
	left: 0;
	right: 0;
	text-align: center;
	font-size: 36rpx;
	font-weight: 700;
	color: #111827;
	pointer-events: none;
}

.state-block,
.error-card {
	min-height: 360rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border-radius: 28rpx;
	padding: 40rpx;
	box-sizing: border-box;
}

.state-text {
	margin-top: 18rpx;
	font-size: 27rpx;
	color: #8b95a9;
}

.error-title {
	margin: 20rpx 0 8rpx;
	font-size: 31rpx;
	font-weight: 700;
	color: #1f2937;
}

.error-desc {
	margin-bottom: 24rpx;
	font-size: 25rpx;
	line-height: 1.6;
	color: #8b95a9;
	text-align: center;
}

.patient-card,
.section-card {
	background: #ffffff;
	border-radius: 28rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
	box-sizing: border-box;
}

.patient-card {
	display: flex;
	align-items: center;
}

.patient-avatar {
	width: 128rpx;
	height: 128rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 28rpx;
	border-radius: 28rpx;
	background: #edf4ff;
	overflow: hidden;
	flex-shrink: 0;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.patient-main {
	flex: 1;
	min-width: 0;
}

.patient-title-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.patient-name {
	margin-right: 14rpx;
	font-size: 38rpx;
	line-height: 1.25;
	font-weight: 800;
	color: #111827;
}

.patient-age {
	margin-right: 12rpx;
	font-size: 27rpx;
	color: #6b7280;
}

.patient-title-row ::v-deep .u-tag {
	margin-top: 4rpx;
}

.patient-sub {
	display: flex;
	align-items: center;
	margin-top: 22rpx;
	min-width: 0;
}

.sub-text {
	margin-left: 10rpx;
	font-size: 25rpx;
	color: #7b8496;
}

.section-title {
	margin-bottom: 24rpx;
	font-size: 31rpx;
	font-weight: 700;
	color: #182338;
}

.section-title.no-margin {
	margin-bottom: 0;
}

.info-row {
	display: flex;
	align-items: center;
	padding: 22rpx 0;
	border-bottom: 1rpx solid #f0f2f7;
}

.info-row.align-start {
	align-items: flex-start;
}

.info-row:last-of-type {
	border-bottom: 0;
}

.info-icon {
	width: 62rpx;
	height: 62rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 18rpx;
	border-radius: 18rpx;
	flex-shrink: 0;
}

.info-icon.blue {
	background: #eaf2ff;
}

.info-icon.green {
	background: #eafaf0;
}

.info-icon.orange {
	background: #fff4df;
}

.info-content {
	flex: 1;
	/* min-width: 0; */
	display: flex;
	flex-direction: column;
	margin-right: 16rpx;
}

.info-label {
	margin-bottom: 8rpx;
	font-size: 23rpx;
	color: #9aa3b2;
}

.info-value {
	font-size: 27rpx;
	color: #344054;
	line-height: 1.5;
}

.info-value.strong {
	color: #2563ff;
	font-weight: 600;
}

.info-value.address {
	padding-right: 8rpx;
}

.nav-btn {
	margin-top: 24rpx;
}

.notice-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 22rpx;
}

.notice-sub {
	margin-top: 8rpx;
	font-size: 23rpx;
	color: #9aa3b2;
}

.notice-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.notice-item {
	display: flex;
	padding: 22rpx;
	border-radius: 20rpx;
	background: rgba(234, 250, 240, 0.4);
	/* border-left: 6rpx solid #2563ff; */
	box-sizing: border-box;
	
	color: #009689;
}

.notice-item.danger {
	background: #fff5f5;
	background: rgba(234, 250, 240, 0.4);

	/* border-left-color: #ef4444; */
}

.notice-dot {
	width: 12rpx;
	height: 12rpx;
	margin-top: 12rpx;
	margin-right: 16rpx;
	border-radius: 50%;
	background: #2563ff;
	flex-shrink: 0;
}

.notice-item.danger .notice-dot {
	background: #ef4444;
}

.notice-body {
	flex: 1;
	min-width: 0;
}

.notice-title {
	display: block;
	margin-bottom: 6rpx;
	font-size: 25rpx;
	font-weight: 700;
	color: #263247;
}

.notice-content {
	font-size: 25rpx;
	line-height: 1.6;
	color: #5e687c;
}

.empty-inline {
	padding: 36rpx 20rpx;
	text-align: center;
	font-size: 25rpx;
	color: #9aa3b2;
	background: #f7f9fc;
	border-radius: 20rpx;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.history-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 22rpx;
	border-radius: 20rpx;
	background: #f7f9fc;
	box-sizing: border-box;
}

.history-left {
	display: flex;
	align-items: flex-start;
	min-width: 0;
	margin-right: 20rpx;
}

.history-info {
	min-width: 0;
	margin-left: 14rpx;
}

.history-time {
	display: block;
	font-size: 27rpx;
	color: #4b5563;
}

.history-content {
	display: block;
	margin-top: 8rpx;
	font-size: 23rpx;
	line-height: 1.5;
	color: #8b95a9;
}
</style>
