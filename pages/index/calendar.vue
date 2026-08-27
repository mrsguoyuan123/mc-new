<template>
	<view class="page">
		<view class="nav">
			<u-icon name="arrow-left" @click="handleBack"></u-icon>
			<view class="nav-title">服务日历</view>
			<view></view>
		</view>

		<view class="calendar-card">
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
					:class="{active: d.isSelect, empty:!d.show}" @click="selectDay1(d)">
					<text v-if="d.show">{{d.day}}</text>
					<view v-if="d.dotColor" class="dot" :style="{backgroundColor:d.dotColor}"></view>
				</view>
			</view>
		</view>

		<view class="section">
			<view class="section-title">{{selectMonth}}月{{selectDay}}日 安排</view>

			<!--有日程列表-->
			<view v-if="currentSchedule.length > 0">
				<view class="schedule-card" v-for="item in currentSchedule" :key="item.id">
					<view class="schedule-left">
						<view class="name">{{item.title}}</view>
						<view class="desc">地点: {{item.address}}</view>
					</view>
					<u-tag :text="item.statusText" :type="item.tagType" size="mini"></u-tag>
				</view>
			</view>

			<!--无日程提示-->
			<view v-else class="empty-tip">当日暂无安排</view>
		</view>
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
	import customTabbar from "@/components/custom-tabbar/custom-tabbar.vue";
	export default {
		components: {
			customTabbar
		},
		data() {
			return {
				year: 2026,
				month: 4,
				selectMonth: 4,
				selectDay: 21,
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
				currentSchedule: [] // 当前选中日期的日程
			}
		},
		mounted() {
			this.buildCalendar()
			this.filterSchedule()
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
			handleBack() {
				uni.navigateBack({
					delta: 1
				})
			},
			prevMonth() {
				let m = this.month - 1
				if (m < 1) {
					this.year -= 1
					this.month = 12
				} else {
					this.month = m
				}
			},
			nextMonth() {
				let m = this.month + 1
				if (m > 12) {
					this.year += 1
					this.month = 1
				} else {
					this.month = m
				}
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
						dotColor: this.dotMap[key] || ''
					})
				}
				this.dayList = arr
			},
			// 根据选中年月日过滤当天日程
			filterSchedule() {
				const dateStr =
					`${this.year}-${String(this.selectMonth).padStart(2,'0')}-${String(this.selectDay).padStart(2,'0')}`
				this.currentSchedule = this.allSchedule.filter(item => item.date === dateStr)
			}
		}
	}
</script>

<style scoped>
	.page {
		padding: 20rpx;
		background: #f7f8fa;
		min-height: 100vh;
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
		gap: 16rpx;
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
		border-radius:20rpx;
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

	.name {
		font-size: 30rpx;
		font-weight: 500;
		margin-bottom: 8rpx;
	}

	.desc {
		font-size: 24rpx;
		color: #888;
	}

	.empty-tip {
		text-align: center;
		color: #999;
		padding: 40rpx 0;
		font-size: 28rpx;
	}
</style>