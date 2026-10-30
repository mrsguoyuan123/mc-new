<template>
	<view class="calendar-page">
		<view class="top-header">
			<view class="title-wrap">
				<view class="page-title">日历</view>
				<view class="page-subtitle">查看排期，掌控每日安排</view>
			</view>
			<view class="header-tools">
				<picker
					class="month-picker-wrap"
					mode="date"
					fields="month"
					:value="selectedYearMonth"
					@change="onMonthPickerChange"
				>
					<view class="month-picker">
						<text>{{ year }}年{{ month }}月</text>
						<u-icon name="arrow-down" color="#1f2937" size="16"></u-icon>
					</view>
				</picker>
				<picker
					class="calendar-icon-picker"
					mode="date"
					fields="month"
					:value="selectedYearMonth"
					@change="onMonthPickerChange"
				>
					<view class="calendar-tool-btn">
						<u-icon name="calendar" color="#1f2937" size="25"></u-icon>
					</view>
				</picker>
			</view>
		</view>

		<view class="stats-grid">
			<view v-for="card in statsCards" :key="card.key" class="stat-card">
				<!-- <view class="stat-icon" :style="{ backgroundColor: card.bgColor }">
					<u-icon :name="card.icon" :color="card.color" size="22"></u-icon>
				</view> -->
				<view class="stat-label">{{ card.label }}</view>
				<view class="stat-value">{{ card.value }}</view>
				<view class="stat-trend" :class="card.direction">
					<view class="font-info">较上月</view>
					<u-icon
						v-if="card.direction === 'up' || card.direction === 'down'"
						:name="card.direction === 'up' ? 'arrow-upward' : 'arrow-downward'"
						:color="card.direction === 'up' ? '#ef4444' : '#16a34a'"
						size="13"
					></u-icon>
					<text> {{ card.trendText }}</text>
				</view>
			</view>
		</view>

		<view class="schedule-calendar-card">
			<view class="calendar-nav">
				<view class="nav-circle" @click="prevMonth">
					<u-icon name="arrow-left" color="#667085" size="20"></u-icon>
				</view>
				<view class="calendar-month-title">{{ year }}年{{ month }}月</view>
				<view class="nav-circle" @click="nextMonth">
					<u-icon name="arrow-right" color="#667085" size="20"></u-icon>
				</view>
			</view>

			<view class="week-row-new">
				<view class="week-item-new" v-for="w in ['一','二','三','四','五','六','日']" :key="w">{{ w }}</view>
			</view>

			<view v-if="scheduleLoading" class="calendar-loading">
				<u-loading-icon mode="circle" color="#2563ff" size="24"></u-loading-icon>
				<text class="loading-text">日程加载中...</text>
			</view>

			<view v-else class="days-grid-new">
				<view
					v-for="day in dayList"
					:key="day.date"
					class="day-cell"
					:class="{
						outside: !day.inMonth,
						today: day.isToday,
						selected: day.isSelect,
						scheduled: day.events.length > 0
					}"
					@click="selectDay1(day)"
				>
					<text class="day-number">{{ day.day }}</text>
					<view v-if="day.events.length" class="day-tag" :class="day.events[0].statusClass">
						{{ day.label }}
					</view>
					<!-- <view v-if="day.events.length" class="day-dots">
						<text
							v-for="(dot, dotIndex) in day.dotColors"
							:key="day.date + '-dot-' + dotIndex"
							class="day-dot"
							:style="{ backgroundColor: dot }"
						></text>
					</view> -->
				</view>
			</view>
		</view>

		<view class="day-schedule-panel">
			<view class="day-panel-header">
				<view class="day-panel-title-row">
					<text class="day-panel-title">当日安排</text>
					<text class="day-panel-date">{{ selectMonth }}月{{ selectDay }}日 {{ selectedWeekday }}</text>
				</view>
				<text class="day-panel-count">共 {{ currentSchedule.length }} 项安排</text>
			</view>

			<view v-if="scheduleLoading" class="panel-state">
				<u-loading-icon mode="circle" color="#2563ff" size="24"></u-loading-icon>
				<text class="panel-state-text">日程加载中...</text>
			</view>

			<view v-else-if="scheduleError" class="panel-state">
				<u-icon name="reload" color="#f59e0b" size="38"></u-icon>
				<text class="panel-state-text">{{ scheduleError }}</text>
			</view>

			<view v-else-if="currentSchedule.length === 0" class="panel-state">
				<u-icon name="calendar" color="#c4ccd9" size="42"></u-icon>
				<text class="panel-state-text">当日暂无安排</text>
			</view>

			<view v-else>
				<view
					v-for="(item, index) in currentSchedule"
					:key="item.id || ('schedule-' + index)"
					class="schedule-item"
				>
					<view class="schedule-time-col">
						<text class="schedule-start">{{ item.startTime }}</text>
						<text v-if="item.endTime" class="schedule-end">{{ item.endTime }}</text>
					</view>
					<view class="schedule-content">
						<view class="schedule-name-row">
							<text class="schedule-name">{{ item.patientName }}</text>
						</view>
						<view class="schedule-location">
							<u-icon name="map" color="#98a2b3" size="15"></u-icon>
							<text>{{ item.address }}</text>
						</view>
					</view>
					<view class="schedule-right">
						<view class="schedule-status" :class="item.statusClass">{{ item.statusText }}</view>
						<!-- <u-icon name="arrow-right" color="#c4ccd9" size="17"></u-icon> -->
					</view>
				</view>
			</view>
		</view>

		<myTabbar :current="0"></myTabbar>
	</view>
</template>

<script>
	import myTabbar from "@/components/myTabbar.vue";
	import { getEscortSchedulesApi, getEscortOrdersApi } from '@/api/frontApikit.js'
	export default {
		components: {
			myTabbar
		},
		data() {
			const today = new Date()
			return {
				year: today.getFullYear(),
				month: today.getMonth() + 1,
				selectMonth: today.getMonth() + 1,
				selectDay: today.getDate(),
				dayList: [],
				currentSchedule: [],
				scheduleLoading: false,
				scheduleError: '',
				statsLoading: false,
				scheduleRequestId: 0,
				apiSchedules: [],
				scheduleMap: {},
				orderStats: {
					pending: 0,
					waitAccept: 0,
					completed: 0
				},
				previousStats: {
					total: null,
					pending: null,
					waitAccept: null,
					completed: null
				}
			}
		},
		computed: {
			// 原生月份选择器值
			selectedYearMonth() {
				return `${this.year}-${String(this.month).padStart(2, '0')}`
			},
			// 当前选中日期的星期
			selectedWeekday() {
				const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				return map[new Date(this.year, this.selectMonth - 1, this.selectDay).getDay()] || ''
			},
			// 顶部统计卡片
			statsCards() {
				const totalTrend = this.calculateTrend(this.apiSchedules.length, this.previousStats.total)
				const pendingTrend = this.calculateTrend(this.orderStats.pending, this.previousStats.pending)
				const completedTrend = this.calculateTrend(this.orderStats.completed, this.previousStats.completed)
				return [
					{ key: 'month', label: '本月排期', value: this.apiSchedules.length, icon: 'calendar', color: '#2563ff', bgColor: '#e9f0ff', trendText: totalTrend.text, direction: totalTrend.direction },
					{ key: 'pending', label: '待服务', value: this.orderStats.pending, icon: 'clock', color: '#f59e0b', bgColor: '#fff4df', trendText: pendingTrend.text, direction: pendingTrend.direction },
					{ key: 'waitAccept', label: '待接单', value: this.orderStats.waitAccept, icon: 'order', color: '#2563ff', bgColor: '#e9f0ff', trendText: '--', direction: 'none' },
					{ key: 'completed', label: '已服务', value: this.orderStats.completed, icon: 'checkmark-circle', color: '#16a34a', bgColor: '#eafaf0', trendText: completedTrend.text, direction: completedTrend.direction }
				]
			}
		},
		onLoad(options) {
			this.initCalendarPage(options)
		},
		mounted() {
			this.buildCalendar()
			this.loadMonthSchedules()
			this.loadOrderStats()
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
			// 月份下拉选择后切换日历
			onMonthPickerChange(event) {
				const value = event && event.detail ? String(event.detail.value || '') : ''
				const matched = value.match(/^(\d{4})-(\d{1,2})/)
				if (!matched) return
				this.changeMonth(Number(matched[1]), Number(matched[2]))
			},
			// 切换到指定年月并重新加载日程
			changeMonth(year, month) {
				if (this.year === year && this.month === month) return
				this.year = year
				this.month = month
				this.handleVisibleMonthChange()
			},
			// 切换到上一个月
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
			// 切换到下一个月
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
				const today = new Date()
				this.selectMonth = this.month
				this.selectDay = today.getFullYear() === this.year && today.getMonth() + 1 === this.month
					? today.getDate()
					: 1
				this.loadMonthSchedules()
			},
			// 判断两个日期是否为同一天
			isSameDate(year, month, day, target) {
				return target
					&& target.getFullYear() === year
					&& target.getMonth() + 1 === month
					&& target.getDate() === day
			},
			// 点击日历日期，相邻月日期则连带切换月份
			selectDay1(day) {
				if (!day.inMonth) {
					this.year = day.year
					this.month = day.month
					this.selectMonth = day.month
					this.selectDay = day.day
					this.loadMonthSchedules()
					return
				}
				this.selectMonth = this.month
				this.selectDay = day.day
				this.buildCalendar()
				this.filterSchedule()
			},
			// 生成周一起始的 42 格日历
			buildCalendar() {
				const today = new Date()
				const firstDay = new Date(this.year, this.month - 1, 1)
				const offset = (firstDay.getDay() + 6) % 7
				const gridStart = new Date(this.year, this.month - 1, 1 - offset)
				const list = []

				for (let index = 0; index < 42; index++) {
					const current = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
					const year = current.getFullYear()
					const month = current.getMonth() + 1
					const day = current.getDate()
					const date = this.formatDateOnly(current)
					const events = this.scheduleMap[date] || []
					list.push({
						date,
						year,
						month,
						day,
						inMonth: month === this.month,
						isToday: this.isSameDate(year, month, day, today),
						isSelect: year === this.year && month === this.selectMonth && day === this.selectDay,
						events,
						label: events.length ? events[0].label : '',
						dotColors: this.getDayDotColors(events)
					})
				}
				this.dayList = list
			},
			// 获取同一天内不同状态的打点颜色
			getDayDotColors(events) {
				const colors = []
				;(events || []).forEach(item => {
					const color = this.getScheduleDotColor(item.status)
					if (colors.indexOf(color) === -1) colors.push(color)
				})
				return colors.slice(0, 3)
			},
			// 根据选中日期更新当日安排
			filterSchedule() {
				const dateStr =
					`${this.year}-${String(this.selectMonth).padStart(2,'0')}-${String(this.selectDay).padStart(2,'0')}`
				this.currentSchedule = (this.scheduleMap[dateStr] || []).slice()
			},
			// 按日期归组日程，供日格和下方列表复用
			groupSchedulesByDate(list) {
				const map = {}
				;(list || []).forEach(item => {
					if (!item.date) return
					if (!map[item.date]) map[item.date] = []
					map[item.date].push(item)
				})
				Object.keys(map).forEach(date => {
					map[date].sort((a, b) => this.compareScheduleTime(a, b))
				})
				return map
			},
			// 获取当前显示月份，格式为 YYYY-MM
			getCurrentMonthKey() {
				return `${this.year}-${String(this.month).padStart(2, '0')}`
			},
			// 获取上一个月份键
			getPreviousMonthKey() {
				const date = new Date(this.year, this.month - 2, 1)
				return this.formatDateOnly(date).slice(0, 7)
			},
			// 拉取当月陪诊排班
			async loadMonthSchedules() {
				const requestId = ++this.scheduleRequestId
				const month = this.getCurrentMonthKey()
				this.scheduleLoading = true
				this.scheduleError = ''
				try {
					const result = await getEscortSchedulesApi({
						month
					})
					if (requestId !== this.scheduleRequestId) return
					this.apiSchedules = this.extractScheduleList(result)
						.map((item, index) => this.normalizeSchedule(item, index))
						.sort((a, b) => this.compareScheduleTime(a, b))
					this.scheduleMap = this.groupSchedulesByDate(this.apiSchedules)
					this.buildCalendar()
					this.filterSchedule()
					this.loadPreviousSchedules(requestId)
				} catch (error) {
					if (requestId !== this.scheduleRequestId) return
					this.apiSchedules = []
					this.scheduleMap = {}
					this.scheduleError = '日程加载失败，请稍后重试'
					this.buildCalendar()
					this.filterSchedule()
					uni.showToast({ title: '陪诊日程加载失败', icon: 'none' })
					console.warn('[calendar] load schedules failed', error)
				} finally {
					if (requestId === this.scheduleRequestId) this.scheduleLoading = false
				}
			},
			// 拉取上月排期，用于本月排期真实环比
			async loadPreviousSchedules(requestId) {
				try {
					const result = await getEscortSchedulesApi({ month: this.getPreviousMonthKey() })
					if (requestId !== this.scheduleRequestId) return
					this.previousStats.total = this.extractScheduleList(result).length
				} catch (error) {
					if (requestId !== this.scheduleRequestId) return
					this.previousStats.total = null
					console.warn('[calendar] load previous schedules failed', error)
				}
			},
			// 拉取订单数量统计
			async loadOrderStats() {
				this.statsLoading = true
				try {
					const pendingStatuses = ['PENDING', 'CONFIRMED', 'IN_SERVICE']
					const statusList = pendingStatuses.concat(['WAIT_ACCEPT', 'COMPLETED'])
					const results = await Promise.all(statusList.map(status => {
						return this.requestOrderTotal(status).catch(error => {
							console.warn('[calendar] load status total failed', status, error)
							return 0
						})
					}))
					const pendingResults = results.slice(0, pendingStatuses.length)
					const waitAcceptTotal = results[pendingStatuses.length]
					const completedTotal = results[pendingStatuses.length + 1]
					this.orderStats = {
						pending: pendingResults.reduce((sum, value) => sum + value, 0),
						waitAccept: waitAcceptTotal,
						completed: completedTotal
					}
					this.updatePreviousTrend()
				} catch (error) {
					this.orderStats = { pending: 0, waitAccept: 0, completed: 0 }
					uni.showToast({ title: '订单统计加载失败', icon: 'none' })
					console.warn('[calendar] load order stats failed', error)
				} finally {
					this.statsLoading = false
				}
			},
			// 请求单个订单状态总数
			async requestOrderTotal(status) {
				const result = await getEscortOrdersApi({ status, page: 1, pageSize: 1 })
				return this.extractOrderTotal(result)
			},
			// 从分页结构中读取订单总数
			extractOrderTotal(data) {
				if (!data) return 0
				if (Array.isArray(data)) return data.length
				if (data.data && typeof data.data === 'object') return this.extractOrderTotal(data.data)
				if (this.isFiniteNumber(data.total)) return this.toNumber(data.total)
				if (Array.isArray(data.list)) return data.list.length
				if (Array.isArray(data.records)) return data.records.length
				if (Array.isArray(data.rows)) return data.rows.length
				if (Array.isArray(data.items)) return data.items.length
				return 0
			},
			// 订单接口暂不支持月份筛选，环比无真实来源时展示横线
			updatePreviousTrend() {
				this.previousStats.pending = null
				this.previousStats.waitAccept = null
				this.previousStats.completed = null
			},
			// 计算环比文案和涨跌方向
			calculateTrend(current, previous) {
				const currentValue = Number(current)
				const previousValue = Number(previous)
				if (!this.isFiniteNumber(previous) || !this.isFiniteNumber(currentValue)) {
					return { text: '--', direction: 'none' }
				}
				if (previousValue === 0) {
					return currentValue === 0
						? { text: '0%', direction: 'none' }
						: { text: '100%', direction: 'up' }
				}
				const percent = Math.round(((currentValue - previousValue) / previousValue) * 100)
				return {
					text: Math.abs(percent) + '%',
					direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'none'
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
				const periodRaw = data.period || data.servicePeriod || data.timeSlot || ''
				const periodText = this.formatPeriod(periodRaw)
				const rawTime = data.time || data.serviceTime || data.appointmentTime || data.timeRange || ''
				const timeParts = String(rawTime || '').split(/[-~—–]/).map(text => String(text || '').trim()).filter(Boolean)
				const status = data.status || data.orderStatus || data.statusText || ''
				const startTime = data.startTime || (timeParts[0] ? timeParts[0] : periodText)
				const endTime = data.endTime || (timeParts[1] ? timeParts[1] : '')
				const patientName = data.patientName || data.customerName || data.userName || data.name || data.title || '未命名患者'
				const label = [periodText, patientName].filter(Boolean).join(' ')
				return {
					id: data.id || data.orderId || data.scheduleId || `schedule_${date}_${index}`,
					date,
					period: String(periodRaw || '').toUpperCase(),
					periodText,
					time: rawTime,
					startTime,
					endTime,
					patientName,
					address: data.address || data.hospitalName || data.serviceAddress || data.hospitalAddress || '暂无服务地点',
					status,
					statusText: this.getScheduleStatusText(status),
					statusClass: this.getScheduleStatusClass(status),
					tagType: this.getScheduleTagType(status),
					label,
					serviceTime: [startTime, endTime].filter(Boolean).join(' - ') || periodText || '服务时间待确认',
					sortTime: startTime || periodText
				}
			},
			// 日程按开始时间排序
			compareScheduleTime(a, b) {
				const left = a && a.sortTime ? String(a.sortTime) : ''
				const right = b && b.sortTime ? String(b.sortTime) : ''
				return left.localeCompare(right, 'zh-Hans-CN')
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
					PENDING: '待服务',
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
					PENDING: 'primary',
					IN_SERVICE: 'primary',
					COMPLETED: 'success',
					CANCELLED: 'info'
				}
				return map[String(status || '').toUpperCase()] || 'primary'
			},
			// 转换日程状态样式类
			getScheduleStatusClass(status) {
				const map = {
					WAIT_ACCEPT: 'status-wait',
					PENDING: 'status-pending',
					CONFIRMED: 'status-confirmed',
					IN_SERVICE: 'status-service',
					COMPLETED: 'status-completed',
					CANCELLED: 'status-cancelled'
				}
				return map[String(status || '').toUpperCase()] || 'status-pending'
			},
			// 判断是否为有限数字
			isFiniteNumber(value) {
				return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value))
			},
			// 安全转换数字
			toNumber(value) {
				return this.isFiniteNumber(value) ? Number(value) : 0
			},
			// 根据订单状态获取日历圆点颜色
			getScheduleDotColor(status) {
				const map = {
					WAIT_ACCEPT: '#f59e0b',
					PENDING: '#2563ff',
					CONFIRMED: '#7c3aed',
					IN_SERVICE: '#06b6d4',
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

	/* ===== 新版日历页样式（增量保留旧样式） ===== */
	.calendar-page {
		min-height: 100vh;
		padding: 28rpx 24rpx 180rpx;
		background: #f5f7fb;
		box-sizing: border-box;
	}

	.top-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.page-title {
		font-size: 34rpx;
		line-height: 58rpx;
		font-weight: 700;
		color: #111827;
	}

	.page-subtitle {
		margin-top: 6rpx;
		font-size: 24rpx;
		color: #909399;
	}

	.header-tools {
		display: flex;
		align-items: center;
	}

	.month-picker {
		height: 60rpx;
		padding: 0 18rpx;
		border-radius: 10rpx;
		background: #ffffff;
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #1f2937;
		box-shadow: 0 8rpx 24rpx rgba(16, 24, 40, 0.06);
	}

	.calendar-tool-btn {
		width: 60rpx;
		height: 60rpx;
		margin-left: 14rpx;
		border-radius: 10rpx;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(16, 24, 40, 0.06);
	}

	.stats-grid {
		display: flex;
		margin-bottom: 22rpx;
	}

	.stat-card {
		flex: 1;
		margin-left: 12rpx;
		min-width: 0;
		padding: 18rpx 12rpx;
		border-radius: 20rpx;
		background: #ffffff;
		box-shadow: 0 10rpx 30rpx rgba(16, 24, 40, 0.05);
		box-sizing: border-box;
	}

	.stat-card:first-child {
		margin-left: 0;
	}

	.stat-icon {
		width: 54rpx;
		height: 54rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 10rpx;
	}

	.stat-label {
		font-size: 19rpx;
		line-height: 28rpx;
		color: #909399;
		white-space: nowrap;
		text-align: center;
	}

	.stat-value {
		margin: 10rpx 0;
		font-size: 36rpx;
		line-height: 44rpx;
		font-weight: 700;
		color: #101828;
		text-align: center;

	}

	.stat-trend {
		display: flex;
		align-items: center;
		font-size: 18rpx;
		line-height: 24rpx;
		transform: scale(0.8);
		white-space: nowrap;
	}

	.stat-trend.up {
		color: #ef4444;
	}

	.stat-trend.down {
		color: #16a34a;
	}

	.schedule-calendar-card,
	.day-schedule-panel {
		background: #ffffff;
		border-radius: 26rpx;
		box-shadow: 0 12rpx 36rpx rgba(16, 24, 40, 0.05);
	}

	.schedule-calendar-card {
		padding: 22rpx 18rpx 18rpx;
	}

	.calendar-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8rpx 18rpx;
	}

	.nav-circle {
		width: 58rpx;
		height: 58rpx;
		border-radius: 50%;
		/* background: #f5f7fb; */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.calendar-month-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #101828;
	}

	.week-row-new,
	.days-grid-new {
		display: flex;
		flex-wrap: wrap;
	}

	.week-item-new {
		width: 14.2857%;
		height: 54rpx;
		line-height: 54rpx;
		text-align: center;
		font-size: 23rpx;
		color: #98a2b3;
		font-weight: 600;
	}

	.day-cell {
		width: 14.2857%;
		min-height: 100rpx;
		padding: 8rpx 3rpx 7rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 18rpx;
	}

	.day-cell.outside {
		opacity: 0.35;
	}

	.day-number {
		width: 38rpx;
		height: 38rpx;
		line-height: 38rpx;
		text-align: center;
		font-size: 25rpx;
		color: #344054;
		border-radius: 50%;
	}

	.day-cell.today .day-number {
		color: #2563ff;
		font-weight: 700;
	}

	.day-cell.selected {
		background: #2563ff;
	}

	.day-cell.selected .day-number,
	.day-cell.selected.today .day-number {
		color: #ffffff;
	}

	.day-tag {
		width: 100%;
		margin-top: 5rpx;
		padding: 10rpx 5rpx;
		border-radius: 8rpx;
		font-size: 18rpx;
		line-height: 24rpx;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;
		transform: scale(0.8);
		min-width: 130rpx;
	}

	.day-cell.selected .day-tag {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.22);
	}

	.day-dots {
		min-height: 14rpx;
		margin-top: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.day-dot {
		width: 8rpx;
		height: 8rpx;
		margin: 0 2rpx;
		border-radius: 50%;
	}

	.status-wait {
		color: #b45309;
		background: rgba(245, 158, 11, 0.12);
	}

	.status-pending {
		color: #1d4ed8;
		background: rgba(37, 99, 255, 0.12);
	}

	.status-confirmed {
		color: #6d28d9;
		background: rgba(124, 58, 237, 0.12);
	}

	.status-service {
		color: #0e7490;
		background: rgba(6, 182, 212, 0.12);
	}

	.status-completed {
		color: #15803d;
		background: rgba(22, 163, 74, 0.12);
	}

	.status-cancelled {
		color: #667085;
		background: rgba(152, 162, 179, 0.14);
	}

	.calendar-loading,
	.panel-state {
		min-height: 220rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #667085;
	}

	.loading-text,
	.panel-state-text {
		margin-top: 14rpx;
		font-size: 24rpx;
		color: #667085;
	}

	.day-schedule-panel {
		margin-top: 22rpx;
		padding: 26rpx 24rpx 12rpx;
	}

	.day-panel-header {
		padding-bottom: 18rpx;
		border-bottom: 1rpx solid #eef1f6;
	display: flex;
    justify-content: space-between;
	}

	.day-panel-title-row {
		display: flex;
		align-items: baseline;
	}

	.day-panel-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #101828;
	}

	.day-panel-date {
		margin-left: 14rpx;
		font-size: 22rpx;
		color: #909399;
	}

	.day-panel-count {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #909399;
	}

	.schedule-item {
		display: flex;
		align-items: center;
		padding: 22rpx 0;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.schedule-item:last-child {
		border-bottom: none;
	}

	.schedule-time-col {
		width: 112rpx;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
	}

	.schedule-start {
		font-size: 30rpx;
		line-height: 32rpx;
		font-weight: 600;
		/* text-align: center; */
		/* color: #2563ff; */
	}

	.schedule-end {
		margin-top: 4rpx;
		font-size: 20rpx;
		color: #98a2b3;
		/* text-align: center; */

	}

	.schedule-content {
		flex: 1;
		min-width: 0;
		padding: 0 16rpx;
	}

	.schedule-name-row {
		display: flex;
		align-items: center;
	}

	.schedule-name {
		font-size: 28rpx;
		line-height: 38rpx;
		font-weight: 600;
		color: #101828;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.schedule-location {
		margin-top: 6rpx;
		display: flex;
		align-items: center;
		min-width: 0;
		font-size: 22rpx;
		line-height: 30rpx;
		color: #98a2b3;
	}

	.schedule-location text {
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.schedule-right {
		width: 104rpx;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.schedule-status {
		padding: 5rpx 12rpx;
		border-radius: 999rpx;
		font-size: 20rpx;
		line-height: 26rpx;
		white-space: nowrap;
	}

	.schedule-right .u-icon {
		margin-top: 8rpx;
	}
</style>
