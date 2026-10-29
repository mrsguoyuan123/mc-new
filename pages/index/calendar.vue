<template>
	<view class="page">


		<view class="calendar-card">
			<view v-if="scheduleLoading" class="schedule-loading">
				<u-loading-icon mode="circle" color="#2563ff" size="22"></u-loading-icon>
				<text class="schedule-loading-text">陪诊日程加载中...</text>
			</view>
			<view class="cal-header">
				<view class="cal-year-month">{{ year }}年{{ month }}月</view>
				<view class="cal-btns">
					<u-button size="mini" shape="circle" @click="prevMonth">
						<u-icon name="arrow-left"></u-icon>
					</u-button>
					<u-button size="mini" shape="circle" @click="nextMonth">
						<u-icon name="arrow-right"></u-icon>
					</u-button>
				</view>
			</view>
			<!--星期头-->
			<view class="week-row">
				<view class="week-item" v-for="w in ['日','一','二','三','四','五','六']" :key="w">{{w}}</view>
			</view>
			<!--日期格子-->
			<view class="days-wrap">
				<view class="day-item" v-for="(d,idx) in dayList" :key="idx"
					:class="{active: d.isSelect, empty:!d.show, scheduled:d.show && d.hasSchedule}" @click="selectDay1(d)">
					<text v-if="d.show">{{d.day}}</text>
					<view v-if="d.dotColor" class="dot" :style="{backgroundColor:d.dotColor}"></view>
				</view>
			</view>
		</view>

		<view class="section">
			<view class="section-title">{{selectMonth}}月{{selectDay}}日 安排</view>

			<view v-if="scheduleLoading" class="state-tip">
				<u-loading-icon mode="circle" color="#2563ff" size="24"></u-loading-icon>
				<text class="state-text">日程加载中...</text>
			</view>

			<!--有日程列表-->
			<view v-else-if="currentSchedule.length > 0">
				<view class="schedule-card" v-for="(item, index) in currentSchedule" :key="item.id || ('schedule-' + index)">
					<view class="schedule-left">
						<view class="name">{{item.patientName || item.title}}</view>
						<view class="service-time">服务时间: {{item.serviceTime}}</view>
						<view class="desc">地点: {{item.address}}</view>
					</view>
					<u-tag :text="item.statusText" :type="item.tagType" size="mini"></u-tag>
				</view>
			</view>

			<!--无日程提示-->
			<view v-else-if="scheduleError" class="empty-tip">{{scheduleError}}</view>
			<view v-else class="empty-tip">当日暂无安排</view>
		</view>
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
	import customTabbar from "@/components/custom-tabbar/custom-tabbar.vue";
	import { getEscortSchedulesApi } from '@/api/frontApikit.js'
	export default {
		components: {
			customTabbar
		},
		data() {
			const today = new Date()
			return {
				year: today.getFullYear(),
				month: today.getMonth() + 1,
				selectMonth: today.getMonth() + 1,
				selectDay: today.getDate(),
				// 标记哪些日期有圆点
				dotMap: {
					"2026-04-21": "#8b3ff2",
					"2026-04-22": "#2b78e4",
					"2026-04-25": "#28bc47"
				},
				dayList: [],

				// 全部日程数据源，可后续替换接口返回数据
				allSchedule: [{
						id: 1,
						date: "2026-04-21",
						title: "陪诊服务 - 孙患者",
						address: "杭州市第一人民医院",
						statusText: "进行中",
						tagType: "primary"
					},
					{
						id: 2,
						date: "2026-04-22",
						title: "复诊陪同",
						address: "市二医院",
						statusText: "待开始",
						tagType: "warning"
					},
					{
						id: 3,
						date: "2026-04-25",
						title: "取药代办",
						address: "中医医院",
						statusText: "已完成",
						tagType: "success"
					}
				],
				currentSchedule: [], // 当前选中日期的日程
				// 新增：接口排班数据和加载状态，本地 allSchedule 保留为原始示例数据
				scheduleLoading: false,
				scheduleError: '',
				apiLoaded: false,
				apiSchedules: [],
				apiDotMap: {}
			}
		},
		onLoad(options) {
			this.initCalendarPage(options)
		},
		mounted() {
			this.buildCalendar()
			this.filterSchedule()
			this.loadMonthSchedules()
		},
		watch: {
			year() {
				this.buildCalendar()
			},
			month() {
				this.buildCalendar()
			},
			selectDay() {
				this.filterSchedule()
			},
			selectMonth() {
				this.filterSchedule()
			}
		},
		methods: {
			// 初始化日历月份并读取页面入参
			initCalendarPage(options) {
				const today = new Date()
				this.year = today.getFullYear()
				this.month = today.getMonth() + 1
				this.selectMonth = this.month
				this.selectDay = today.getDate()
				const monthText = options && options.month ? String(options.month) : ''
				const matched = monthText.match(/^(\d{4})-(\d{1,2})$/)
				if (matched) {
					this.year = Number(matched[1])
					this.month = Number(matched[2])
					this.selectMonth = this.month
					this.selectDay = today.getFullYear() === this.year && today.getMonth() + 1 === this.month
						? today.getDate()
						: 1
				}
			},
			handleBack() {
				const pages = getCurrentPages()
				console.log('页面栈长度', pages.length)
				if (pages.length > 1) {
					uni.navigateBack({
						delta: 1
					})
				} else {
					// 栈只有1，不能回退，改成跳首页
					uni.reLaunch({
						url: '/pages/index/caregiverIndex'
					})
				}
			},
			prevMonth() {
				let m = this.month - 1
				if (m < 1) {
					this.year -= 1
					this.month = 12
				} else {
					this.month = m
				}
				this.handleVisibleMonthChange()
			},
			nextMonth() {
				let m = this.month + 1
				if (m > 12) {
					this.year += 1
					this.month = 1
				} else {
					this.month = m
				}
				this.handleVisibleMonthChange()
			},
			// 月份切换后重置选中日并拉取当月排班
			handleVisibleMonthChange() {
				this.selectMonth = this.month
				this.selectDay = this.clampDayToMonth(this.year, this.month, this.selectDay)
				this.loadMonthSchedules()
			},
			// 避免从 31 日切到短月份后选中无效日期
			clampDayToMonth(year, month, day) {
				const maxDay = new Date(year, month, 0).getDate()
				const currentDay = Number(day)
				if (!currentDay || currentDay < 1) return 1
				return currentDay > maxDay ? maxDay : currentDay
			},
			// 点击日期
			selectDay1(d) {
				if (!d.show) return
				this.selectMonth = this.month
				this.selectDay = d.day
				this.buildCalendar()
			},
			// 生成日历格子
			buildCalendar() {
				const activeDotMap = this.apiLoaded ? this.apiDotMap : this.dotMap
				const first = new Date(this.year, this.month - 1, 1)
				const last = new Date(this.year, this.month, 0)
				const firstWeek = first.getDay()
				const totalDays = last.getDate()
				const arr = []

				for (let i = 0; i < firstWeek; i++) {
					arr.push({
						show: false
					})
				}
				for (let d = 1; d <= totalDays; d++) {
					const key = `${this.year}-${String(this.month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
					arr.push({
						show: true,
						day: d,
						isSelect: d === this.selectDay,
						dotColor: activeDotMap[key] || '',
						hasSchedule: !!activeDotMap[key]
					})
				}
				this.dayList = arr
			},
			// 根据选中年月日过滤当天日程
			filterSchedule() {
				const dateStr =
					`${this.year}-${String(this.selectMonth).padStart(2,'0')}-${String(this.selectDay).padStart(2,'0')}`
				const source = this.apiLoaded ? this.apiSchedules : this.allSchedule
				this.currentSchedule = source.filter(item => item.date === dateStr)
			},
			// 获取当前显示月份，格式为 YYYY-MM
			getCurrentMonthKey() {
				return `${this.year}-${String(this.month).padStart(2, '0')}`
			},
			// 拉取当月陪诊排班
			async loadMonthSchedules() {
				this.scheduleLoading = true
				this.scheduleError = ''
				try {
					const result = await getEscortSchedulesApi({
						month: this.getCurrentMonthKey()
					})
					this.apiSchedules = this.extractScheduleList(result).map((item, index) => this.normalizeSchedule(item, index))
					this.apiDotMap = this.buildScheduleDotMap(this.apiSchedules)
					this.apiLoaded = true
					this.buildCalendar()
					this.filterSchedule()
				} catch (error) {
					this.apiLoaded = true
					this.apiSchedules = []
					this.apiDotMap = {}
					this.scheduleError = '日程加载失败，请稍后重试'
					this.buildCalendar()
					this.filterSchedule()
					uni.showToast({ title: '陪诊日程加载失败', icon: 'none' })
					console.warn('[calendar] load schedules failed', error)
				} finally {
					this.scheduleLoading = false
				}
			},
			// 兼容数组、分页对象和包装对象中的排班列表
			extractScheduleList(data) {
				if (Array.isArray(data)) return data
				if (!data) return []
				if (data.data && typeof data.data === 'object') return this.extractScheduleList(data.data)
				if (Array.isArray(data.schedules)) return data.schedules
				if (Array.isArray(data.list)) return data.list
				if (Array.isArray(data.records)) return data.records
				if (Array.isArray(data.rows)) return data.rows
				if (Array.isArray(data.items)) return data.items
				const dateKeyList = []
				Object.keys(data).forEach(key => {
					if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(key)) return
					const date = this.normalizeScheduleDate(key)
					const value = data[key]
					if (Array.isArray(value)) {
						value.forEach(item => {
							if (item && typeof item === 'object') dateKeyList.push(Object.assign({ date }, item))
						})
					} else if (value && typeof value === 'object') {
						dateKeyList.push(Object.assign({ date }, value))
					}
				})
				if (dateKeyList.length) return dateKeyList
				return []
			},
			// 标准化接口排班字段
			normalizeSchedule(raw, index) {
				const source = raw || {}
				const order = source.order || source.booking || {}
				const patient = source.patient || order.patient || {}
				const data = Object.assign({}, order, patient, source)
				const date = this.normalizeScheduleDate(data.date || data.serviceDate || data.scheduleDate || data.appointmentDate || data.orderDate || data.day)
				const period = this.formatPeriod(data.period || data.servicePeriod || data.timeSlot)
				const status = data.status || data.orderStatus || data.statusText || ''
				return {
					id: data.id || data.orderId || data.scheduleId || `schedule_${date}_${index}`,
					date,
					patientName: data.patientName || data.customerName || data.userName || data.name || data.title || '未命名患者',
					address: data.address || data.hospitalName || data.serviceAddress || data.hospitalAddress || '暂无服务地点',
					status,
					statusText: this.getScheduleStatusText(status),
					tagType: this.getScheduleTagType(status),
					serviceTime: data.serviceTime || data.appointmentTime || data.time || [date, period].filter(Boolean).join(' ') || '服务时间待确认'
				}
			},
			// 生成有排班日期的圆点标记
			buildScheduleDotMap(list) {
				const map = {}
				list.forEach(item => {
					if (item.date && !map[item.date]) map[item.date] = this.getScheduleDotColor(item.status)
				})
				return map
			},
			// 将接口日期统一为 YYYY-MM-DD
			normalizeScheduleDate(value) {
				if (!value) return ''
				if (typeof value === 'number') return this.formatDateOnly(new Date(value))
				const text = String(value).replace(/\//g, '-')
				const matched = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
				if (matched) {
					return `${matched[1]}-${String(matched[2]).padStart(2, '0')}-${String(matched[3]).padStart(2, '0')}`
				}
				return this.formatDateOnly(new Date(value))
			},
			// 格式化 Date 对象日期
			formatDateOnly(date) {
				if (!date || Number.isNaN(date.getTime())) return ''
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				return `${date.getFullYear()}-${month}-${day}`
			},
			// 转换服务时段枚举
			formatPeriod(period) {
				const map = {
					MORNING: '上午',
					AFTERNOON: '下午',
					FULLDAY: '全天'
				}
				return map[String(period || '').toUpperCase()] || period || ''
			},
			// 转换订单状态文案
			getScheduleStatusText(status) {
				const map = {
					WAIT_ACCEPT: '待接单',
					CONFIRMED: '待服务',
					IN_SERVICE: '服务中',
					COMPLETED: '已服务',
					CANCELLED: '已取消'
				}
				const key = String(status || '').toUpperCase()
				return map[key] || status || '待确认'
			},
			// 转换订单状态标签类型
			getScheduleTagType(status) {
				const map = {
					WAIT_ACCEPT: 'warning',
					CONFIRMED: 'primary',
					IN_SERVICE: 'primary',
					COMPLETED: 'success',
					CANCELLED: 'info'
				}
				return map[String(status || '').toUpperCase()] || 'primary'
			},
			// 根据订单状态获取日历圆点颜色
			getScheduleDotColor(status) {
				const map = {
					WAIT_ACCEPT: '#f59e0b',
					CONFIRMED: '#2563ff',
					IN_SERVICE: '#2563ff',
					COMPLETED: '#16a34a',
					CANCELLED: '#98a2b3'
				}
				return map[String(status || '').toUpperCase()] || '#2563ff'
			}
		}
	}
</script>

<style scoped>
	.page {
		padding: 20rpx;
		background: #f7f8fa;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: bold;
	}

	.calendar-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 30rpx;
	}

	.cal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.cal-year-month {
		font-size: 36rpx;
		font-weight: bold;
	}

	.cal-btns {
		display: flex;
	}

	.cal-btns ::v-deep .u-button:first-child {
		margin-right: 16rpx;
	}

	.week-row {
		display: flex;
		margin-bottom: 10rpx;
	}

	.week-item {
		flex: 1;
		text-align: center;
		font-size: 26rpx;
		color: #666;
	}

	.days-wrap {
		display: flex;
		flex-wrap: wrap;
	}

	.day-item {
		width: 14.28%;
		height: 80rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		font-size: 30rpx;
	}

	.day-item.active {
		background: #8b3ff2;
		color: #fff;
		border-radius: 20rpx;
	}

	.day-item.empty {
		opacity: 0;
		pointer-events: none;
	}

	.dot {
		position: absolute;
		bottom: 6rpx;
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
	}

	.day-item.scheduled text {
		color: #2563ff;
		font-weight: 600;
	}

	.day-item.active.scheduled text {
		color: #fff;
	}

	.section {
		margin-top: 40rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.schedule-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-left: 8rpx solid #8b3ff2;
		margin-bottom: 16rpx;
	}

	.schedule-loading,
	.state-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 18rpx 0;
	}

	.schedule-loading-text,
	.state-text {
		margin-left: 10rpx;
		font-size: 24rpx;
		color: #667085;
	}

	.state-tip {
		padding: 50rpx 0;
	}

	.name {
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 8rpx;
	}

	.desc {
		font-size: 24rpx;
		color: #888;
	}

	.service-time {
		font-size: 25rpx;
		color: #2563ff;
		margin-bottom: 8rpx;
	}

	.empty-tip {
		text-align: center;
		color: #999;
		padding: 40rpx 0;
		font-size: 28rpx;
	}
</style>
