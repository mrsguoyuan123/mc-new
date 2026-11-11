<template>
	<view class="page-caregiver">
		<!-- 加载态 -->
		<view v-if="pageLoading" class="state-box">
			<u-loading-icon mode="circle" color="#2563ff" size="48rpx"></u-loading-icon>
			<text class="state-text">正在加载预约信息...</text>
		</view>

		<!-- 无绑定驻点/异常态 -->
		<view v-else-if="!station" class="state-box">
			<u-icon name="account" color="#c0c4cc" size="72rpx"></u-icon>
			<text class="state-title">{{ pageError || '暂无可预约的专属驻点陪诊师' }}</text>
			<text class="state-desc">请联系客服确认陪诊权益后重试</text>
			<button class="state-btn" @click="loadPageData">刷新重试</button>
		</view>

		<template v-else>
			<view class="page-content">
				<!-- 专属驻点蓝色横幅 -->
				<view class="exclusive-banner">
					<view class="banner-head">
						<text class="custom-icon custom-icon-shield-check banner-icon"></text>
						<view class="banner-titles">
							<text class="banner-title">1对1专属驻点 · 已为您锁定</text>
							<text class="banner-sub">当前绑定驻点：{{ station.name }}</text>
						</view>
					</view>
					<view class="banner-chip">无需选择陪诊人员，仅需预约时间</view>
				</view>

				<!-- 选择就诊日期 -->
				<view class="section-card bg-white card-border-gray radius-15">
					<view class="section-head">
						<u-icon name="calendar" color="#2563ff" size="34rpx"></u-icon>
						<text class="section-title">选择就诊日期</text>
					</view>
					<text class="section-hint">支持预约未来10天（明天起）</text>
					<scroll-view scroll-x class="date-scroll" :show-scrollbar="false">
						<view class="date-list">
							<view v-for="(d, idx) in dateList" :key="d.date"
								class="date-cell"
								:class="[
									idx !== dateList.length - 1 ? 'mr-16' : '',
									selectedDateIndex === idx ? 'active' : '',
									isDateFull(d) ? 'full' : ''
								]"
								@click="onSelectDate(idx)">
								<text class="date-week">{{ d.week }}</text>
								<text class="date-day">{{ d.day }}</text>
								<text class="date-state">{{ isDateFull(d) ? '约满' : '可选' }}</text>
							</view>
						</view>
					</scroll-view>
				</view>

				<!-- 常规陪诊时间段 -->
				<view class="section-card bg-white card-border-gray radius-15">
					<view class="section-head">
						<u-icon name="clock" color="#2563ff" size="34rpx"></u-icon>
						<text class="section-title">常规陪诊时间段</text>
					</view>
					<text class="section-hint orange" v-if="selectedDateIndex === null">请先选定上方日期</text>

					<view v-for="(period, pIdx) in periodList" :key="period.value"
						class="period-card"
						:class="[
							pIdx !== periodList.length - 1 ? 'mr-bottom-20' : '',
							selectedPeriod === period.value ? 'active' : '',
							isPeriodDisabled(period.value) ? 'disabled' : ''
						]"
						@click="onSelectPeriod(period.value)">
						<view class="period-main">
							<text class="period-name">{{ period.name }}</text>
							<text class="period-time">{{ period.time }}</text>
							<text class="period-desc">{{ period.desc }}</text>
						</view>
						<view class="period-side">
							<text v-if="isPeriodDisabled(period.value)" class="period-tag tag-disabled">已约满</text>
							<u-icon v-else-if="selectedPeriod === period.value" name="checkmark-circle" color="#2563ff" size="40rpx"></u-icon>
							<text v-else class="period-tag tag-avail">可预约</text>
						</view>
					</view>

					<view class="info-tip">
						<u-icon name="info-circle" color="#447dfd" size="28rpx"></u-icon>
						<text class="info-tip-text">预约成功后由当前绑定的专属驻点提供服务，不开放其他陪诊人员选择。</text>
					</view>
				</view>

				<!-- 就诊信息确认 -->
				<view class="section-card bg-white card-border-gray radius-15">
					<view class="section-head">
						<u-icon name="file-text" color="#2563ff" size="34rpx"></u-icon>
						<text class="section-title">就诊信息确认</text>
					</view>
					<view class="info-row">
						<text class="info-label">就诊医院</text>
						<text class="info-value">{{ visitInfo.hospital || '—' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">就诊科室</text>
						<text class="info-value">{{ visitInfo.department || '—' }}</text>
					</view>
					<view class="info-row last">
						<text class="info-label">陪诊说明</text>
						<text class="info-value remark">{{ visitInfo.remark || '—' }}</text>
					</view>
				</view>

				<!-- 本次服务扣减 -->
				<view class="section-card bg-white card-border-gray radius-15">
					<view class="section-head">
						<u-icon name="rmb" color="#2563ff" size="34rpx"></u-icon>
						<text class="section-title">本次服务扣减</text>
					</view>
					<view class="quota-row">
						<view class="quota-left">
							<text class="quota-minus">-1</text>
							<text class="quota-unit">次</text>
						</view>
						<view class="quota-right">
							<text class="quota-remain">剩余 {{ escortCount === null ? '—' : escortCount }} 次</text>
							<text class="quota-source">来自随访包专属术后陪诊权益，免现金支付</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部确认按钮 -->
			<view class="bottom-action">
				<button class="submit-btn" :disabled="submitting" @click="onSubmitBooking">
					{{ submitting ? '提交中...' : '确认预约陪诊' }}
				</button>
				<text class="bottom-hint">服务前1天陪诊师将与您电话沟通就诊安排</text>
			</view>
		</template>

		<myTabbar :current="0"></myTabbar>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>


<script>
	import myTabbar from '@/components/myTabbar.vue'
	import {
		getMeEscortApi,
		getMeEscortCaregiversApi,
		getMeEscortBookingsApi,
		postMeEscortBookingsApi
	} from '@/api/frontApikit.js'

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
				submitting: false,
				pageError: '',
				station: null,
				escortCount: null,
				bookingList: [],
				dateList: [],
				selectedDateIndex: null,
				selectedPeriod: '',
				periodList: [
					{ value: 'MORNING', name: '上午门诊陪诊', time: '08:00-12:00', desc: '晨间就医常规' },
					{ value: 'AFTERNOON', name: '下午门诊/检查', time: '13:30-17:30', desc: '下午就诊首选' },
					{ value: 'FULLDAY', name: '全天深度陪诊', time: '08:00-17:00', desc: '全流程陪同' }
				]
			}
		},
		computed: {
			// 就诊信息取最近一条预约（无则展示占位）
			visitInfo() {
				const latest = this.pickLatestBooking()
				return {
					hospital: (latest && latest.hospital) || '',
					department: (latest && latest.department) || '',
					remark: (latest && latest.remark) || ''
				}
			}
		},
		created() {
			this.loadPageData()
		},
		methods: {
			// 页面初始化：剩余次数 + 绑定驻点（陪诊师数组第0项）+ 历史预约
			async loadPageData() {
				this.pageLoading = true
				this.pageError = ''
				uni.showLoading({ title: '加载中...', mask: true })
				try {
					const [escortRes, caregiverRes, bookingRes] = await Promise.all([
						getMeEscortApi().catch(error => { console.warn('获取陪诊权益失败', error); return null }),
						getMeEscortCaregiversApi().catch(error => { console.warn('获取陪诊师列表失败', error); return [] }),
						getMeEscortBookingsApi().catch(error => { console.warn('获取预约记录失败', error); return [] })
					])
					const caregivers = this.extractList(caregiverRes)
					if (!caregivers.length) {
						this.station = null
						this.pageError = '暂无可预约的专属驻点陪诊师'
					} else {
						// 专属驻点模式：取数组第 0 项为绑定驻点
						this.station = caregivers[0]
						this.buildDateList()
					}
					this.escortCount = escortRes && escortRes.escortCount !== undefined ? escortRes.escortCount : null
					this.bookingList = this.extractList(bookingRes)
					this.selectedDateIndex = null
					this.selectedPeriod = ''
				} catch (error) {
					console.error('预约页初始化失败', error)
					this.pageError = (error && error.message) || '加载失败，请稍后重试'
					uni.showToast({ title: this.pageError, icon: 'none' })
				} finally {
					this.pageLoading = false
					uni.hideLoading()
				}
			},
			// 构建明天起 10 天的日期窗口
			buildDateList() {
				const weekText = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				const list = []
				const now = new Date()
				const tomorrow = new Date(now)
				tomorrow.setDate(now.getDate() + 1)
				for (let i = 0; i < 10; i += 1) {
					const d = new Date(tomorrow)
					d.setDate(tomorrow.getDate() + i)
					list.push({
						date: this.formatDate(d),
						week: weekText[d.getDay()],
						day: `${d.getMonth() + 1}/${d.getDate()}`
					})
				}
				this.dateList = list
			},
			formatDate(date) {
				const month = `${date.getMonth() + 1}`.padStart(2, '0')
				const day = `${date.getDate()}`.padStart(2, '0')
				return `${date.getFullYear()}-${month}-${day}`
			},
			// 取指定日期的忙碌时段数组
			getBusyPeriods(date) {
				if (!this.station || !this.station.busySlots || !date) return []
				return this.station.busySlots[date] || []
			},
			// 该日期三个时段是否全部约满
			isDateFull(cell) {
				const periods = this.getBusyPeriods(cell.date)
				return this.periodList.every(item => periods.indexOf(item.value) !== -1)
			},
			// 时段是否不可选：未选日期 / 已约满（FULLDAY 占用全部时段）
			isPeriodDisabled(period) {
				if (this.selectedDateIndex === null) return true
				const cell = this.dateList[this.selectedDateIndex]
				if (!cell) return true
				const periods = this.getBusyPeriods(cell.date)
				return periods.indexOf(period) !== -1 || periods.indexOf('FULLDAY') !== -1
			},
			onSelectDate(index) {
				const cell = this.dateList[index]
				if (!cell || this.isDateFull(cell)) {
					uni.showToast({ title: '该日期已约满，请选择其他日期', icon: 'none' })
					return
				}
				this.selectedDateIndex = index
				this.selectedPeriod = ''
			},
			onSelectPeriod(period) {
				if (this.selectedDateIndex === null) {
					uni.showToast({ title: '请先选定就诊日期', icon: 'none' })
					return
				}
				if (this.isPeriodDisabled(period)) {
					uni.showToast({ title: '该时段已约满，请选择其他时段', icon: 'none' })
					return
				}
				this.selectedPeriod = period
			},
			// 最近一条历史预约，用于回填就诊信息
			pickLatestBooking() {
				if (!this.bookingList.length) return null
				return this.bookingList.slice().sort((a, b) => {
					const ta = new Date(String(a.createTime || a.serviceDate || '').replace(/-/g, '/')).getTime() || 0
					const tb = new Date(String(b.createTime || b.serviceDate || '').replace(/-/g, '/')).getTime() || 0
					return tb - ta
				})[0]
			},
			// 提交预约
			async onSubmitBooking() {
				if (this.submitting || !this.station) return
				if (this.selectedDateIndex === null) {
					this.showToast('请选择就诊日期')
					return
				}
				if (!this.selectedPeriod) {
					this.showToast('请选择陪诊时间段')
					return
				}
				if (this.escortCount !== null && Number(this.escortCount) <= 0) {
					this.showToast('剩余陪诊次数不足，请联系客服')
					return
				}
				const cell = this.dateList[this.selectedDateIndex]
				const payload = {
					caregiverId: this.station.caregiverId,
					serviceDate: cell.date,
					period: this.selectedPeriod
				}
				this.submitting = true
				uni.showLoading({ title: '提交预约中...', mask: true })
				try {
					await postMeEscortBookingsApi(payload)
					uni.showToast({ title: '预约成功', icon: 'success' })
					this.selectedDateIndex = null
					this.selectedPeriod = ''
					await this.loadPageData()
				} catch (error) {
					console.error('提交预约失败', error)
					if (!error || !error.isApiError) {
						uni.showToast({ title: (error && error.message) || '预约提交失败，请稍后重试', icon: 'none' })
					}
				} finally {
					this.submitting = false
					uni.hideLoading()
				}
			},
			showToast(message) {
				this.$refs.uToast.show({ message, type: 'error' })
			},
			// 兼容数组、分页对象和业务包裹对象
			extractList(data) {
				if (Array.isArray(data)) return data
				if (!data) return []
				if (Array.isArray(data.list)) return data.list
				if (Array.isArray(data.records)) return data.records
				if (Array.isArray(data.rows)) return data.rows
				if (Array.isArray(data.items)) return data.items
				if (Array.isArray(data.data)) return data.data
				return []
			}
		}
	}
</script>

<style scoped>
	::v-deep .u-toast__content__text {
		line-height: 1.4 !important;
	}

	.page-caregiver {
		min-height: 100vh;
		background-color: #f7f8fa;
	}

	/* 加载态 / 无驻点态 */
	.state-box {
		padding: 200rpx 48rpx;
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
		font-weight: bold;
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
		height: 80rpx;
		line-height: 80rpx;
		background-color: #2563ff;
		color: #ffffff;
		font-size: 30rpx;
		border-radius: 40rpx;
	}

	.page-content {
		padding: 24rpx 24rpx 220rpx;
	}

	/* 专属驻点横幅 */
	.exclusive-banner {
		background: linear-gradient(135deg, #2563ff 0%, #447dfd 100%);
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		color: #ffffff;
	}

	.banner-head {
		display: flex;
		align-items: center;
	}

	.banner-icon {
		font-size: 48rpx;
		color: #ffffff;
		margin-right: 20rpx;
	}

	.banner-titles {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.banner-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
	}

	.banner-sub {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	.banner-chip {
		margin-top: 24rpx;
		display: inline-block;
		align-self: flex-start;
		padding: 8rpx 24rpx;
		background-color: rgba(255, 255, 255, 0.18);
		border-radius: 28rpx;
		font-size: 24rpx;
		color: #ffffff;
	}

	/* 通用卡片 */
	.section-card {
		padding: 32rpx 28rpx;
		margin-bottom: 24rpx;
	}

	.section-head {
		display: flex;
		align-items: center;
	}

	.section-title {
		margin-left: 12rpx;
		font-size: 31rpx;
		font-weight: bold;
		color: #1f2329;
	}

	.section-hint {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #909399;
	}

	.section-hint.orange {
		color: #ff7800;
	}

	/* 日期横滚 */
	.date-scroll {
		margin-top: 28rpx;
		white-space: nowrap;
	}

	.date-list {
		display: flex;
		align-items: stretch;
	}

	.date-cell {
		flex-shrink: 0;
		width: 120rpx;
		padding: 20rpx 0;
		border-radius: 16rpx;
		background-color: #f5f7fa;
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1rpx solid transparent;
	}

	.date-cell.active {
		background-color: rgba(37, 99, 255, 0.08);
		border-color: #2563ff;
	}

	.date-cell.full {
		background-color: #f4f4f5;
	}

	.date-week {
		font-size: 24rpx;
		color: #606266;
	}

	.date-cell.active .date-week {
		color: #2563ff;
		font-weight: bold;
	}

	.date-cell.full .date-week {
		color: #c0c4cc;
	}

	.date-day {
		margin-top: 10rpx;
		font-size: 30rpx;
		font-weight: bold;
		color: #1f2329;
	}

	.date-cell.active .date-day {
		color: #2563ff;
	}

	.date-cell.full .date-day {
		color: #c0c4cc;
	}

	.date-state {
		margin-top: 10rpx;
		font-size: 22rpx;
		color: #08b852;
	}

	.date-cell.active .date-state {
		color: #2563ff;
	}

	.date-cell.full .date-state {
		color: #c0c4cc;
	}

	/* 时段卡片 */
	.mr-bottom-20 {
		margin-bottom: 20rpx;
	}

	.period-card {
		margin-top: 24rpx;
		padding: 28rpx 24rpx;
		border-radius: 16rpx;
		background-color: #f5f7fa;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1rpx solid transparent;
	}

	.period-card.active {
		background-color: rgba(37, 99, 255, 0.08);
		border-color: #2563ff;
	}

	.period-card.disabled {
		background-color: #f4f4f5;
	}

	.period-main {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.period-name {
		font-size: 29rpx;
		font-weight: bold;
		color: #1f2329;
	}

	.period-card.disabled .period-name {
		color: #c0c4cc;
	}

	.period-time {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: #606266;
	}

	.period-desc {
		margin-top: 8rpx;
		font-size: 23rpx;
		color: #909399;
	}

	.period-side {
		margin-left: 20rpx;
		display: flex;
		align-items: center;
	}

	.period-tag {
		font-size: 24rpx;
		padding: 6rpx 20rpx;
		border-radius: 24rpx;
	}

	.tag-avail {
		color: #08b852;
		background-color: rgba(8, 184, 82, 0.1);
	}

	.tag-disabled {
		color: #c0c4cc;
		background-color: #ebeef5;
	}

	.info-tip {
		margin-top: 28rpx;
		display: flex;
		align-items: flex-start;
		background-color: rgba(68, 125, 253, 0.06);
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.info-tip-text {
		margin-left: 10rpx;
		flex: 1;
		font-size: 24rpx;
		color: #447dfd;
		line-height: 1.5;
	}

	/* 就诊信息 */
	.info-row {
		display: flex;
		align-items: flex-start;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f1f5;
	}

	.info-row.last {
		border-bottom: none;
		padding-bottom: 0;
	}

	.info-label {
		width: 160rpx;
		flex-shrink: 0;
		font-size: 27rpx;
		color: #909399;
	}

	.info-value {
		flex: 1;
		font-size: 27rpx;
		color: #1f2329;
		word-break: break-all;
	}

	.info-value.remark {
		color: #606266;
	}

	/* 服务扣减 */
	.quota-row {
		margin-top: 24rpx;
		display: flex;
		align-items: center;
	}

	.quota-left {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #ff9a3d 0%, #ff7800 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.quota-minus {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
		line-height: 1;
	}

	.quota-unit {
		margin-top: 6rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.9);
	}

	.quota-right {
		margin-left: 28rpx;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.quota-remain {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff7800;
	}

	.quota-source {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #909399;
		line-height: 1.5;
	}

	/* 底部按钮（避让 fixed tabbar：50px + 安全区） */
	.bottom-action {
		position: fixed;
		left: 0;
		right: 0;
		bottom: calc(50px + constant(safe-area-inset-bottom));
		bottom: calc(50px + env(safe-area-inset-bottom));
		padding: 16rpx 32rpx 20rpx;
		background-color: #ffffff;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
		z-index: 99;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(135deg, #2563ff 0%, #447dfd 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
	}

	.submit-btn[disabled] {
		opacity: 0.6;
	}

	.bottom-hint {
		display: block;
		margin-top: 12rpx;
		text-align: center;
		font-size: 22rpx;
		color: #b0b3bb;
	}
</style>
