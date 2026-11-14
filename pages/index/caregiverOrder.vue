<template>
	<view class="page-order">
		<!-- 自定义导航栏 -->
		<view class="top-bar">
			<view class="status-bar" :style="{ height: ((statusBarHeight || 0) + (menuButton.height || 0)) + 'px' }"></view>
			<view class="custom-nav">
				<view class="nav-back" @click="handleBack">
					<u-icon name="arrow-left" color="#1f2d3d" size="38rpx"></u-icon>
				</view>
				<view class="nav-titles">
					<text class="nav-title">陪诊服务详情</text>
					<text class="nav-sub">门诊全程跟进 · 专属一对一</text>
				</view>
				<view class="nav-right">
					<text class="nav-right-label">剩余可用权益</text>
					<text class="nav-right-value">{{ escortCount === null ? '--' : escortCount }} 次</text>
				</view>
			</view>
		</view>

		<!-- 加载态 -->
		<view v-if="pageLoading" class="state-box">
			<u-loading-icon mode="circle" color="#2563ff" size="48rpx"></u-loading-icon>
			<text class="state-text">正在加载预约信息...</text>
		</view>

		<!-- 无有效预约态 -->
		<view v-else-if="!booking" class="state-box">
			<u-icon name="file-text" color="#c0c4cc" size="80rpx"></u-icon>
			<text class="state-title">{{ pageError || '暂无进行中的陪诊预约' }}</text>
			<text class="state-desc">您可前往预约页提交新的陪诊预约</text>
			<button class="state-btn" @click="goApply">去预约</button>
		</view>

		<template v-else>
			<scroll-view scroll-y class="page-scroll">
				<!-- 蓝色预约状态卡片 -->
				<view class="booking-card">
					<view class="booking-tag">
						<u-icon name="checkmark-circle-fill" color="#ffffff" size="30rpx"></u-icon>
						<text class="booking-tag-text">{{ statusText }}生效中</text>
					</view>
					<view class="booking-name">{{ periodName }}</view>
					<view class="booking-divider"></view>
					<view class="booking-info-row">
						<view class="booking-info-item">
							<u-icon name="calendar" color="#ffffff" size="34rpx"></u-icon>
							<view class="booking-info-text">
								<text class="booking-info-label">陪诊日期</text>
								<text class="booking-info-value">{{ booking.serviceDate || '--' }}</text>
							</view>
						</view>
						<view class="booking-info-item">
							<u-icon name="clock" color="#ffffff" size="34rpx"></u-icon>
							<view class="booking-info-text">
								<text class="booking-info-label">常规陪诊时段</text>
								<text class="booking-info-value">{{ periodName }} ({{ periodTime }})</text>
							</view>
						</view>
					</view>
					<view v-if="destination" class="booking-destination">
						<u-icon name="map-fill" color="#ffffff" size="30rpx"></u-icon>
						<text class="booking-destination-text">目的地：{{ destination }}</text>
					</view>
				</view>

				<!-- 对接驻点 -->
				<view class="section-title">对接驻点</view>
				<view class="station-card">
					<view class="station-head">
						<image v-if="caregiverAvatar" class="station-avatar" :src="caregiverAvatar" mode="aspectFill"></image>
						<view v-else class="station-avatar station-avatar-empty">
							<u-icon name="account" color="#ffffff" size="56rpx"></u-icon>
						</view>
						<view class="station-meta">
							<view class="station-name-line">
								<text class="station-name">{{ caregiver.name || '专属驻点' }}</text>
								<view class="station-cert">已实名认证</view>
							</view>
							<text class="station-desc">{{ stationDesc }}</text>
							<view v-if="stationTags.length" class="station-tags">
								<text v-for="(tag, idx) in stationTags" :key="idx" class="station-tag">{{ tag }}</text>
							</view>
						</view>
						<view class="station-rating">
							<u-icon name="star-fill" color="#ff8800" size="30rpx"></u-icon>
							<text class="station-rating-text">{{ formatRating(caregiver.rating) }}</text>
						</view>
					</view>
					<view class="station-btn-row">
						<view class="station-btn station-btn-primary" @click="handleCall">
							<u-icon name="phone" color="#ffffff" size="36rpx"></u-icon>
							<text>电话沟通</text>
						</view>
						<view class="station-btn station-btn-plain" @click="handleMeetingPoint">
							<u-icon name="map" color="#2563ff" size="36rpx"></u-icon>
							<text>确认集合点</text>
						</view>
					</view>
				</view>

				<!-- 就诊当日服务指引 -->
				<view class="guide-card">
					<view class="guide-head">
						<u-icon name="file-text" color="#2563ff" size="36rpx"></u-icon>
						<text class="guide-title">就诊当日服务指引</text>
					</view>
					<view v-for="(item, idx) in guideList" :key="idx" class="guide-item">
						<text class="guide-index">{{ idx + 1 }}.</text>
						<text class="guide-content"><text class="guide-keyword">{{ item.keyword }}</text>：{{ item.content }}</text>
					</view>
				</view>

				<!-- 取消预约 -->
				<view class="cancel-card" @click="handleCancel">
					<u-icon name="reload" color="#606266" size="34rpx"></u-icon>
					<text class="cancel-text">取消预约 (权益全额返还)</text>
				</view>
				<text class="cancel-tip">如需更换驻点或调整预约时间，可取消后重新提交预约</text>
				<view class="bottom-placeholder"></view>
			</scroll-view>
		</template>

		<myTabbar></myTabbar>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import myTabbar from '@/components/myTabbar.vue'
	import {
		getMeHomeApi,
		getMeEscortCaregiversApi,
		getMeEscortBookingsApi,
		postMeEscortBookingsByIdCancelApi,
		buildFileAccessUrl
	} from '@/api/frontApikit.js'

	const PERIOD_NAME_MAP = {
		MORNING: '上午门诊陪诊',
		AFTERNOON: '下午门诊/检查',
		FULLDAY: '全天深度陪诊'
	}
	const PERIOD_TIME_MAP = {
		MORNING: '08:00 - 12:00',
		AFTERNOON: '13:30 - 17:30',
		FULLDAY: '08:00 - 17:00'
	}
	const STATUS_TEXT_MAP = {
		WAIT_ACCEPT: '专属陪诊预约',
		CONFIRMED: '专属陪诊预约',
		IN_SERVICE: '专属陪诊服务'
	}

	export default {
		options: {
			styleIsolation: 'shared'
		},
		components: {
			myTabbar
		},
		data() {
			return {
				pageLoading: true,
				pageError: '',
				cancelling: false,
				escortCount: null,
				booking: null,
				caregiver: {},
				guideList: [
					{ keyword: '集合接洽', content: '驻点将在就诊前30分钟在医院正门或门诊大厅导医台等候。' },
					{ keyword: '证件携带', content: '请随身携带用户身份证、医保卡及既往出院小结、手术记录等资料。' },
					{ keyword: '全程陪同', content: '涵盖挂号、排队取号、轮椅借用、辅助问诊、检查陪护、缴费及取药代办。' },
					{ keyword: '就诊小结', content: '就诊结束后驻点将整理专科医嘱及复诊检查清单同步至系统。' }
				]
			}
		},
		computed: {
			...mapState(['statusBarHeight', 'menuButton']),
			periodName() {
				return PERIOD_NAME_MAP[this.booking && this.booking.period] || '门诊陪诊'
			},
			periodTime() {
				return PERIOD_TIME_MAP[this.booking && this.booking.period] || ''
			},
			statusText() {
				return STATUS_TEXT_MAP[this.booking && this.booking.status] || '专属陪诊预约'
			},
			caregiverInfo() {
				return (this.booking && this.booking.caregiverInfo) || {}
			},
			caregiverAvatar() {
				const avatar = this.caregiver.avatar || this.caregiverInfo.avatar || ''
				return avatar ? buildFileAccessUrl(avatar) : ''
			},
			caregiverPhone() {
				return this.caregiverInfo.phone || this.caregiver.phone || ''
			},
			destination() {
				const hospital = this.caregiverInfo.hospital || ''
				const department = this.caregiverInfo.department || ''
				const remark = this.caregiverInfo.remark || this.booking.remark || ''
				const main = [hospital, department].filter(Boolean).join(' · ')
				return [main, remark].filter(Boolean).join(' / ')
			},
			stationDesc() {
				if (this.caregiver.desc) return this.caregiver.desc
				if (this.caregiver.expYears) return `从业${this.caregiver.expYears}年 · 已实名认证`
				return '资深三甲驻点 · 已实名认证'
			},
			stationTags() {
				const tags = Array.isArray(this.caregiver.tags) ? this.caregiver.tags.slice(0, 3) : []
				return tags
			}
		},
		created() {
			this.loadPageData()
		},
		methods: {
			// 页面初始化：首页聚合(剩余权益/有效预约) + 绑定驻点 + 预约明细(联系方式/医院科室)
			async loadPageData() {
				this.pageLoading = true
				this.pageError = ''
				uni.showLoading({ title: '加载中...', mask: true })
				try {
					const [homeRes, caregiverRes, bookingRes] = await Promise.all([
						getMeHomeApi().catch(error => { console.warn('获取首页聚合失败', error); return null }),
						getMeEscortCaregiversApi().catch(error => { console.warn('获取陪诊师列表失败', error); return [] }),
						getMeEscortBookingsApi().catch(error => { console.warn('获取预约列表失败', error); return [] })
					])

					const home = homeRes || {}
					const escort = home.escort || {}
					this.escortCount = escort.escortCount !== undefined && escort.escortCount !== null
						? escort.escortCount
						: null

					const caregivers = this.extractList(caregiverRes)
					// 专属驻点模式：取数组第 0 项为绑定驻点
					this.caregiver = caregivers[0] || {}

					const bookingList = this.extractList(bookingRes)
					const activeBooking = this.pickActiveBooking(escort.activeBooking, bookingList)
					this.booking = activeBooking
					if (!activeBooking) {
						this.pageError = '暂无进行中的陪诊预约'
					}
				} catch (error) {
					console.error('陪诊服务详情加载失败', error)
					this.pageError = (error && error.message) || '加载失败，请稍后重试'
					uni.showToast({ title: this.pageError, icon: 'none' })
				} finally {
					this.pageLoading = false
					uni.hideLoading()
				}
			},
			// 优先取首页聚合的有效预约，缺失时从预约列表挑最近一条未结束预约
			pickActiveBooking(homeActive, bookingList) {
				if (homeActive && homeActive.id) return homeActive
				const activeStatus = ['WAIT_ACCEPT', 'CONFIRMED', 'IN_SERVICE']
				const list = bookingList
					.filter(item => activeStatus.indexOf(item.status) !== -1)
					.sort((a, b) => {
						const ta = new Date(String(a.serviceDate || a.createTime || '').replace(/-/g, '/')).getTime() || 0
						const tb = new Date(String(b.serviceDate || b.createTime || '').replace(/-/g, '/')).getTime() || 0
						return tb - ta
					})
				if (!list.length) return null
				const latest = list[0]
				// EscortBookingView 字段映射为 ActiveBooking 结构，统一模板取值
				return {
					id: latest.id,
					status: latest.status,
					serviceDate: latest.serviceDate,
					period: latest.period,
					remark: latest.remark,
					caregiverInfo: {
						id: latest.caregiverId,
						name: latest.caregiverName,
						avatar: latest.caregiverAvatar,
						phone: latest.caregiverPhone,
						hospital: latest.hospital,
						department: latest.department,
						remark: latest.remark
					}
				}
			},
			extractList(data) {
				if (Array.isArray(data)) return data
				if (!data) return []
				if (Array.isArray(data.list)) return data.list
				if (Array.isArray(data.records)) return data.records
				if (Array.isArray(data.rows)) return data.rows
				if (Array.isArray(data.items)) return data.items
				if (Array.isArray(data.data)) return data.data
				return []
			},
			formatRating(rating) {
				const num = Number(rating)
				return Number.isFinite(num) && num > 0 ? num.toFixed(1) : '5.0'
			},
			handleCall() {
				const phone = this.caregiverPhone
				if (!phone) {
					uni.showToast({ title: '暂无陪诊师联系电话', icon: 'none' })
					return
				}
				uni.makePhoneCall({
					phoneNumber: String(phone),
					fail: error => console.warn('拨号取消或失败', error)
				})
			},
			handleMeetingPoint() {
				const hospital = this.caregiverInfo.hospital
				if (!hospital) {
					uni.showToast({ title: '就诊医院信息待确认，请先电话沟通', icon: 'none' })
					return
				}
				uni.showModal({
					title: '确认集合点',
					content: '就诊前30分钟，驻点将在「' + hospital + '」正门或门诊大厅导医台等候，请提前到达并保持电话畅通。',
					showCancel: false,
					confirmText: '我知道了',
					confirmColor: '#2563ff'
				})
			},
			handleCancel() {
				if (this.cancelling || !this.booking || !this.booking.id) return
				uni.showModal({
					title: '取消预约',
					content: '确认取消当前陪诊预约吗？取消后权益次数将全额返还。',
					confirmText: '确认取消',
					cancelText: '再想想',
					confirmColor: '#f56c6c',
					success: res => {
						if (res.confirm) this.confirmCancel()
					}
				})
			},
			async confirmCancel() {
				this.cancelling = true
				uni.showLoading({ title: '取消中...', mask: true })
				try {
					await postMeEscortBookingsByIdCancelApi({ id: this.booking.id })
					uni.showToast({ title: '预约已取消，权益已返还', icon: 'success' })
					await this.loadPageData()
				} catch (error) {
					console.error('取消预约失败', error)
					if (!error || !error.isApiError) {
						uni.showToast({ title: (error && error.message) || '取消失败，请稍后重试', icon: 'none' })
					}
				} finally {
					this.cancelling = false
					uni.hideLoading()
				}
			},
			goApply() {
				uni.navigateTo({ url: '/pages/index/caregiverApply' })
			},
			handleBack() {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 })
				} else {
					uni.reLaunch({ url: '/pages/index/home' })
				}
			}
		}
	}
</script>

<style scoped>
	::v-deep .u-toast__content__text {
		line-height: 1.4 !important;
	}

	.page-order {
		min-height: 100vh;
		background-color: #f5f6fa;
	}

	/* 自定义导航栏 */
	.top-bar {
		background-color: #ffffff;
	}

	.status-bar {
		width: 100%;
		background-color: #ffffff;
	}

	.custom-nav {
		display: flex;
		align-items: center;
		padding: 16rpx 28rpx 24rpx;
		background-color: #ffffff;
	}

	.nav-back {
		width: 64rpx;
		height: 64rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.nav-titles {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.nav-title {
		font-size: 38rpx;
		font-weight: 700;
		color: #1f2d3d;
		line-height: 1.3;
	}

	.nav-sub {
		margin-top: 6rpx;
		font-size: 24rpx;
		color: #909399;
		line-height: 1.2;
	}

	.nav-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		margin-left: 16rpx;
	}

	.nav-right-label {
		font-size: 22rpx;
		color: #909399;
	}

	.nav-right-value {
		margin-top: 6rpx;
		font-size: 34rpx;
		font-weight: 700;
		color: #2563ff;
	}

	/* 加载/空态 */
	.state-box {
		padding: 180rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.state-text {
		margin-top: 24rpx;
		font-size: 28rpx;
		color: #909399;
	}

	.state-title {
		margin-top: 32rpx;
		font-size: 32rpx;
		font-weight: 700;
		color: #303133;
		text-align: center;
	}

	.state-desc {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #909399;
		text-align: center;
	}

	.state-btn {
		margin-top: 48rpx;
		width: 320rpx;
		height: 84rpx;
		line-height: 84rpx;
		background-color: #2563ff;
		color: #ffffff;
		font-size: 30rpx;
		border-radius: 42rpx;
	}

	.page-scroll {
		height: calc(100vh - 180rpx);
		box-sizing: border-box;
	}

	/* 蓝色预约卡片 */
	.booking-card {
		margin: 24rpx;
		padding: 40rpx 36rpx;
		border-radius: 32rpx;
		background: linear-gradient(135deg, #2f6bff 0%, #5148f0 100%);
		color: #ffffff;
		box-shadow: 0 16rpx 40rpx rgba(47, 107, 255, 0.28);
	}

	.booking-tag {
		display: flex;
		align-items: center;
	}

	.booking-tag-text {
		margin-left: 10rpx;
		font-size: 26rpx;
		opacity: 0.92;
	}

	.booking-name {
		margin-top: 20rpx;
		font-size: 52rpx;
		font-weight: 800;
		letter-spacing: 2rpx;
	}

	.booking-divider {
		margin: 32rpx 0;
		border-bottom: 1rpx solid rgba(255, 255, 255, 0.22);
	}

	.booking-info-row {
		display: flex;
		align-items: flex-start;
	}

	.booking-info-item {
		flex: 1;
		display: flex;
		align-items: flex-start;
		min-width: 0;
	}

	.booking-info-text {
		margin-left: 14rpx;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.booking-info-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.78);
	}

	.booking-info-value {
		margin-top: 10rpx;
		font-size: 32rpx;
		font-weight: 700;
		line-height: 1.35;
	}

	.booking-destination {
		margin-top: 30rpx;
		padding-top: 28rpx;
		border-top: 1rpx solid rgba(255, 255, 255, 0.18);
		display: flex;
		align-items: center;
	}

	.booking-destination-text {
		margin-left: 12rpx;
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.95);
	}

	/* 区块标题 */
	.section-title {
		margin: 36rpx 28rpx 20rpx;
		font-size: 36rpx;
		font-weight: 700;
		color: #1f2d3d;
	}

	/* 对接驻点卡 */
	.station-card {
		margin: 0 24rpx;
		padding: 32rpx 28rpx;
		background-color: #ffffff;
		border-radius: 28rpx;
	}

	.station-head {
		display: flex;
		align-items: flex-start;
	}

	.station-avatar {
		width: 132rpx;
		height: 132rpx;
		border-radius: 24rpx;
		flex-shrink: 0;
		background-color: #eef2ff;
	}

	.station-avatar-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #5b8cff, #3a63e8);
	}

	.station-meta {
		flex: 1;
		min-width: 0;
		margin-left: 24rpx;
	}

	.station-name-line {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.station-name {
		font-size: 38rpx;
		font-weight: 800;
		color: #1f2d3d;
	}

	.station-cert {
		margin-left: 16rpx;
		padding: 4rpx 14rpx;
		border-radius: 10rpx;
		background-color: #eaf1ff;
		color: #2563ff;
		font-size: 22rpx;
	}

	.station-desc {
		margin-top: 12rpx;
		font-size: 26rpx;
		color: #909399;
	}

	.station-tags {
		margin-top: 18rpx;
		display: flex;
		flex-wrap: wrap;
	}

	.station-tag {
		margin: 0 14rpx 12rpx 0;
		padding: 8rpx 20rpx;
		border-radius: 999rpx;
		background-color: #f2f3f5;
		color: #5a5f6b;
		font-size: 24rpx;
	}

	.station-rating {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-left: 12rpx;
	}

	.station-rating-text {
		margin-left: 6rpx;
		font-size: 32rpx;
		font-weight: 800;
		color: #ff8800;
	}

	.station-btn-row {
		margin-top: 28rpx;
		display: flex;
	}

	.station-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 700;
	}

	.station-btn text {
		margin-left: 10rpx;
	}

	.station-btn-primary {
		margin-right: 20rpx;
		background-color: #2563ff;
		color: #ffffff;
	}

	.station-btn-plain {
		background-color: #eaf1ff;
		color: #2563ff;
	}

	/* 服务指引 */
	.guide-card {
		margin: 24rpx;
		padding: 32rpx 28rpx;
		background-color: #ffffff;
		border-radius: 28rpx;
	}

	.guide-head {
		display: flex;
		align-items: center;
	}

	.guide-title {
		margin-left: 12rpx;
		font-size: 32rpx;
		font-weight: 700;
		color: #1f2d3d;
	}

	.guide-item {
		margin-top: 24rpx;
		display: flex;
		align-items: flex-start;
	}

	.guide-index {
		font-size: 28rpx;
		font-weight: 700;
		color: #1f2d3d;
		line-height: 1.5;
	}

	.guide-content {
		flex: 1;
		margin-left: 8rpx;
		font-size: 28rpx;
		color: #4a4f59;
		line-height: 1.6;
	}

	.guide-keyword {
		color: #1f2d3d;
		font-weight: 700;
	}

	/* 取消预约 */
	.cancel-card {
		margin: 8rpx 24rpx 0;
		height: 96rpx;
		border-radius: 24rpx;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cancel-text {
		margin-left: 12rpx;
		font-size: 30rpx;
		color: #606266;
		font-weight: 600;
	}

	.cancel-tip {
		display: block;
		margin: 24rpx 24rpx 0;
		font-size: 24rpx;
		color: #a0a3ab;
		text-align: center;
	}

	.bottom-placeholder {
		height: calc(160rpx + env(safe-area-inset-bottom));
	}
</style>
