<template>
	<view class="weight-page">


		<view class="weight-card current-card">
			<view class="card-head">
				<view class="head-left">
					<view class="head-icon scale-head-icon">
						<view class="svg-icon svg-scale"></view>
					</view>
					<text class="card-title">当前体重</text>
				</view>
			</view>

			<template v-if="latestRecord">
				<view class="current-body">
					<view class="weight-number-row">
						<text class="weight-number">{{ latestRecord.weightKg.toFixed(1) }}</text>
						<text class="weight-unit">kg</text>
					</view>
					<view class="record-meta">
						<text class="record-time">
							{{ formatDate(latestRecord.createTime, 'MM月DD日 HH:mm') }}</text>
						<text class="meta-dot">•</text>
						<text :class="['source-tag', latestRecord.source === 'MANUAL' ? 'manual' : 'scale']">
							{{ latestRecord.source === 'MANUAL' ? '手动记录' : '体脂秤同步' }}
						</text>
					</view>
				</view>
				<view class="button-wrapper-blue" @click="openWeightPopup">手动输入体重</view>
			</template>

			<template v-else>
				<view class="current-empty">
					<view class="empty-scale">
						<text class="custom-icon custom-icon-scale icon-bold"
							style="font-size:40rpx;color:#155DFC;"></text>

						<!-- <view class="svg-icon svg-scale large muted"></view> -->
					</view>
					<text class="empty-title">还没有体重记录</text>
					<text class="empty-desc">可以手动输入，也可以连接体脂秤自动同步。</text>
				</view>
				<view class="button-wrapper-blue" @click="openWeightPopup">
					<u-icon name="plus" color="#ffffff" size="16"></u-icon>
					<text>手动输入体重</text>
				</view>
			</template>
		</view>

		<view class="weight-card trend-card">
			<view class="card-head">
				<view class="head-left">
					<view class="head-icon trend-head-icon">
						<view class="svg-icon svg-trend"></view>
					</view>
					<text class="card-title">近期体重变化</text>
				</view>
				<view class="range-switch">
					<view v-for="item in rangeOptions" :key="item.value"
						:class="['range-tab', activeRange === item.value ? 'active' : '']"
						@click="changeRange(item.value)">{{ item.label }}</view>
				</view>
			</view>

			<template v-if="weightRecords.length === 0">
				<view class="trend-empty">
					<view class="trend-empty-icon">
						<view class="svg-icon svg-trend muted"></view>
					</view>
					<text class="empty-title">还没有体重变化数据</text>
					<text class="empty-desc">记录体重变化，了解近期趋势</text>
				</view>
				<view class="button-wrapper-blue " @click="openWeightPopup">
					<u-icon name="plus" color="#ffffff" size="16"></u-icon>
					<text>手动记录体重</text>
				</view>
			</template>

			<template v-else-if="weightRecords.length === 1">
				<view class="trend-empty one-record">
					<view class="trend-empty-icon warning">
						<text class="custom-icon custom-icon-trending-down icon-bold"
							style="font-size:40rpx;color:#fe9a00;"></text>

					</view>
					<text class="empty-title">再记录一次即可查看变化趋势</text>
					<text class="empty-desc">当前仅有 1 次记录，无法计算增减趋势。</text>
					<view class="single-record">
						<view>
							<text class="single-label">当前体重</text>
							<text class="single-weight">{{ latestRecord.weightKg.toFixed(1) }} kg</text>
						</view>
						<view class="single-time-box">
							<text class="single-label">记录时间</text>
							<text class="single-time">{{ formatDate(latestRecord.createTime, 'MM月DD日 HH:mm') }}</text>
						</view>
					</view>
				</view>
				<view class="soft-action" @click="openWeightPopup">
					<u-icon name="plus" color="#165cf5" size="16"></u-icon>
					<text>记录第二次体重以生成趋势</text>
				</view>
			</template>

			<template v-else>
				<view class="chart-wrap">
					<qiun-data-charts type="area" canvasId="weightTrendChart" :opts="weightChartOpts"
						:chartData="weightChartData" />
				</view>

				<view class="stat-grid">
					<view class="stat-card">
						<text class="stat-label">较上次</text>
						<view :class="['stat-value', changeFromLast.direction]">
							<text v-if="changeFromLast.direction == 'down'"
								class="custom-icon custom-icon-trending-down icon-bold"
								style="font-size:30rpx;color:#00a63e;"></text>
							<text v-else class="custom-icon custom-icon-trending-up icon-bold"
								style="font-size:30rpx;color:#e11d48;"></text>
							<text>{{ formatAbsChange(changeFromLast.value) }} kg</text>
						</view>
					</view>
					<view class="stat-card">
						<text class="stat-label">较30天前</text>
						<view :class="['stat-value', changeFromThirty.direction]">
							<text v-if="changeFromLast.direction == 'down'"
								class="custom-icon custom-icon-trending-down icon-bold"
								style="font-size:30rpx;color:#00a63e;"></text>
							<text v-else class="custom-icon custom-icon-trending-up icon-bold"
								style="font-size:30rpx;color:#e11d48;"></text>
							<text>{{ formatAbsChange(changeFromThirty.value) }} kg</text>
						</view>
					</view>
				</view>

				<view class="trend-footer">
					<text class="footer-muted">最近记录：{{ formatDate(latestRecord.time, 'MM月DD日') }}</text>
					<view class="footer-source">
						<text class="footer-muted">数据来源：</text>
						<text class="footer-blue">{{ latestRecord.source === 'MANUAL' ? '手动记录' : '体脂秤同步' }}</text>
					</view>
				</view>
			</template>
		</view>

		<view class="weight-card bluetooth-card">
			<view class="card-head">
				<view class="head-left">
					<view class="head-icon bluetooth-head-icon">
						<view class="svg-icon svg-bluetooth blue"></view>
					</view>
					<view class="card-title">蓝牙体脂秤</view>

				</view>

				<view class="help-link" @click="showConnectHelp">
					<u-icon name="question-circle" color="#9aa1af" size="17"></u-icon>
					<text>连接遇到问题？</text>
				</view>
			</view>
			<view class="page-desc">连接后，称重数据可同步到体重记录</view>

			<view v-if="bluetoothStatus === 'searching'" class="bluetooth-panel searching-panel">
				<view class="bluetooth-circle pulse">
					<view class="svg-icon svg-bluetooth white circle-icon"></view>
				</view>
				<text class="bluetooth-status-title">正在搜索附近设备…</text>
				<text class="bluetooth-status-desc">请确保体脂秤已通电并处于手机2米范围内</text>
			</view>

			<view v-else-if="bluetoothStatus === 'connected'" class="device-panel">
				<view class="device-main-row">
					<view class="device-name-row">
						<view class="connected-dot"></view>
						<text class="device-name">智能体脂秤S1</text>
					</view>
					<view class="device-meta">
						<view class="battery-box">
							<view class="battery-body">
								<view class="battery-level"></view>
							</view>
							<view class="battery-tip"></view>
							<text>88%</text>
						</view>
						<view class="signal-box">
							<view class="signal-bars">
								<view class="signal-bar bar-1"></view>
								<view class="signal-bar bar-2"></view>
								<view class="signal-bar bar-3"></view>
							</view>
							<text>信号极强</text>
						</view>
					</view>
				</view>
				<view class="device-bottom-row">
					<text class="sync-time">上次同步：{{ formatDate(lastSyncTime, 'MM月DD日 HH:mm') }}</text>
					<text class="auto-sync">站上体脂秤后自动同步</text>
				</view>
			</view>
			<view v-else-if="bluetoothStatus === 'idle'" class="bluetooth-panel idle-panel">


				<view class="center-icon-wrap">
					<view class="bluetooth-box">
						<view class="svg-icon svg-bluetooth gray"></view>
					</view>
					<view class="status-row">
						<view class="dot gray-dot"></view>
						<text class="status-text">未连接</text>
					</view>
					<text class="tip-text">请开启手机蓝牙，并将体脂秤放在手机附近。</text>
				</view>

				<view class="bottom-btn-wrap">
					<view class="button-wrapper-blue " @click="startSearch">
						<view class="svg-icon svg-bluetooth white"></view>
						<text>一键连接</text>
					</view>
				</view>
			</view>
			<view v-if="bluetoothStatus === 'connected'" class="bluetooth-actions two-actions">
				<view class="button-wrapper-blue " @click="syncWeight">
					<text>同步体重</text>
				</view>
				<view class=" button-wrapper-gray" @click="disconnectDevice">
					<text>断开连接</text>
				</view>
			</view>
		</view>

		<text class="disclaimer">体重变化仅用于日常健康管理，如有明显异常或持续不适，请咨询医护。</text>

		<u-popup :show="showWeightPopup" mode="bottom" :round="28" :safeAreaInsetBottom="true"
			@close="closeWeightPopup">
			<view class="weight-popup">
				<view class="popup-handle"></view>
				<view class="popup-head">
					<text class="popup-title">手动输入体重</text>
					<view class="popup-close" @click="closeWeightPopup">
						<u-icon name="close" color="#8e99aa" size="22"></u-icon>
					</view>
				</view>
				<text class="popup-desc">请输入本次测量的体重数据</text>

				<view class="input-label">体重（kg）</view>
				<view class="weight-input-box">
					<input v-model="inputWeight" class="weight-input" type="digit" maxlength="6" placeholder="请输入体重"
						placeholder-class="weight-placeholder" />
					<text class="input-unit">kg</text>
				</view>


				<view class="popup-actions">
					<view class="popup-cancel" @click="closeWeightPopup">取消</view>
					<view class="popup-confirm" @click="saveWeight">保存记录</view>
				</view>
			</view>
		</u-popup>
		<view class="mask" v-if="dialogShow">
			<view class="dialog">
				<view class="header">
					<view class="title">蓝牙体脂秤连接指引</view>
					<view class="close-btn" @click="handleClose">×</view>
				</view>
				<view class="content">
					<view class="item">
						<view class="item-title">1. 确认设备通电</view>
						<view class="item-desc">轻踩体脂秤屏幕亮起，确保电池有电且蓝牙信号发射正常。</view>
					</view>
					<view class="item">
						<view class="item-title">2. 保持靠近</view>
						<view class="item-desc">手机蓝牙请保持开启，并在 2 米无障碍范围内进行连接。</view>
					</view>
					<view class="item">
						<view class="item-title">3. 自动同步数据</view>
						<view class="item-desc">连接成功后，无需重复操作，每次赤足上秤将自动更新体重。</view>
					</view>
				</view>
				<view class="btn-wrap">
					<view class="button-wrapper-blue" @click="dialogShow = false">我知道了</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getMeWeightRecordsApi,
		postMeWeightRecordsApi,
		deleteMeWeightRecordsByIdApi,
		getMeDevicesApi,
		postMeDevicesApi,
		deleteMeDevicesByIdApi
	} from '@/api/frontApikit.js'

	export default {
		data() {
			const now = new Date()
			return {
				activeRange: '7d',
				rangeOptions: [{
						label: '7天',
						value: '7d'
					},
					{
						label: '30天',
						value: '30d'
					}
				],
				dialogShow: false,
				weightRecords: [],
				bluetoothStatus: 'idle',
				searchTimer: null,
				showWeightPopup: false,
				inputWeight: '',
				inputDate: this.formatDate(now, 'YYYY-MM-DD'),
				inputTime: this.formatDate(now, 'HH:mm'),
				inputSource: 'MANUAL',
				lastSyncTime: ''
			}
		},
		computed: {
			// 倒序：最新的排在数组最前面
			sortedRecords() {
				return this.weightRecords.slice().sort((a, b) => {
					const timeA = a.recordDate ? new Date(a.recordDate.replace(/-/g, '/')).getTime() : 0
					const timeB = b.recordDate ? new Date(b.recordDate.replace(/-/g, '/')).getTime() : 0
					return timeB - timeA
				})
			},
			// 最新一条 sortedRecords[0]
			latestRecord() {
				return this.sortedRecords[0] || null
			},
			todayDate() {
				return this.formatDate(new Date(), 'YYYY-MM-DD')
			},
			filteredRecords() {
				if (!this.latestRecord) return []
				const end = new Date(this.latestRecord.recordDate.replace(/-/g, '/')).getTime()
				const dayNum = Number(this.activeRange.replace('d', ''))
				const start = end - (dayNum - 1) * 24 * 60 * 60 * 1000
				return this.sortedRecords.filter(item => {
					const time = new Date(item.recordDate.replace(/-/g, '/')).getTime()
					return time >= start && time <= end
				})
			},
			weightChartData() {
				const records = [...this.filteredRecords].reverse()
				return {
					categories: records.map(item => this.formatDate(item.recordDate, 'MM/DD')),
					series: [{
						name: '体重',
						data: records.map(item => Number(item.weightKg.toFixed(1)))
					}]
				}
			},
			chartAxis() {
				const values = this.filteredRecords.map(item => item.weightKg)
				if (!values.length) {
					return {
						min: 0,
						max: 100,
						step: 20
					}
				}
				const minValue = Math.min.apply(null, values)
				const maxValue = Math.max.apply(null, values)
				if (this.activeRange === '7d' && minValue >= 68.4 && maxValue <= 68.8) {
					return {
						min: 68.4,
						max: 68.8,
						step: 0.2
					}
				}
				if (minValue >= 68 && maxValue <= 70.5) {
					return {
						min: 68,
						max: 71,
						step: 1
					}
				}
				const rawSpan = Math.max(maxValue - minValue, 1)
				const span = Math.max(rawSpan * 1.25, 1.5)
				const magnitude = Math.pow(10, Math.floor(Math.log(span / 4) / Math.LN10))
				const residual = span / 4 / magnitude
				let niceStep = magnitude
				if (residual > 5) niceStep = 10 * magnitude
				else if (residual > 2) niceStep = 5 * magnitude
				else if (residual > 1) niceStep = 2 * magnitude
				return {
					min: Math.floor((minValue - (span - rawSpan) / 2) / niceStep) * niceStep,
					max: Math.ceil((maxValue + (span - rawSpan) / 2) / niceStep) * niceStep,
					step: niceStep
				}
			},
			weightChartOpts() {
				const axis = this.chartAxis
				return {
					color: ['#165cf5'],
					padding: [12, 18, 0, 0],
					enableScroll: false,
					legend: {
						show: false
					},
					dataLabel: false,
					dataPointShape: true,
					xAxis: {
						disableGrid: true,
						axisLine: false,
						fontSize: 12,
						fontColor: '#8f98a8',
						lineHeight: 24,
						boundaryGap: 'justify',
						labelCount: this.activeRange === '30d' ? 5 : undefined
					},
					yAxis: {
						data: [{
							min: axis.min,
							max: axis.max,
							fontSize: 11,
							fontColor: '#98a2b3',
							tofix: 1,
							unit: 'kg'
						}],
						disabled: false,
						disableGrid: false,
						gridType: 'dash',
						dashLength: 4,
						gridColor: '#edf0f5',
						splitNumber: 2,
						min: axis.min,
						max: axis.max,
						tofix: 1,
						unit: 'kg'
					},
					extra: {
						area: {
							type: 'curve',
							width: 3,
							addLine: true,
							gradient: true,
							opacity: 0.14,
							activeType: 'none'
						},
						tooltip: {
							showCategory: true
						}
					}
				}
			},
			changeFromLast() {
				const records = this.sortedRecords
				if (records.length < 2) {
					return {
						value: 0,
						direction: 'flat',
						arrow: ''
					}
				}
				const diff = records[0].weightKg - records[1].weightKg
				return this.buildChange(diff)
			},
			changeFromThirty() {
				const records = this.sortedRecords
				if (records.length < 2) {
					return {
						value: 0,
						direction: 'flat',
						arrow: ''
					}
				}
				const diff = records[0].weightKg - records[records.length - 1].weightKg
				return this.buildChange(diff)
			}
		},
		created() {
			this.getMeWeightRecordsApi();
			// this.getDevicesList()
			// this.delWeightRecord('2113897401757065200')
			// const data = {
			//     bindDevice:'WEIGHT_SCALE',
			//     name:'11212'
			// }
			// this.bindDevice(data)
		},
		beforeDestroy() {
			this.clearSearchTimer()
		},
		methods: {
			openGuidePopup() {
				this.showGuide = true
			},
			startSearch() {
				this.bluetoothStatus = 'searching'
				// 这里放蓝牙搜索逻辑
			},
			// 获取体重列表
			async getMeWeightRecordsApi() {
				try {
					const res = await getMeWeightRecordsApi({
						range: this.activeRange
					})

					this.weightRecords = res || []
					this.lastSyncTime = this.weightRecords[0].recordDate
					console.log('获取体重列表', this.weightRecords[0])
				} catch (e) {
					console.error('获取体重报错：', e)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
			},
			// 新增体重记录
			async postMeWeightRecordsApi(payload) {
				try {
					const res = await postMeWeightRecordsApi(payload)
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					// 保存成功重新拉列表
					await this.getMeWeightRecordsApi()
				} catch (e) {
					console.error('新增体重报错', e)
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					})
				}
			},

			// 删除单条
			async delWeightRecord(id) {
				alert()
				try {
					const res = await deleteMeWeightRecordsByIdApi({
						id: id
					})
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					this.getMeWeightRecordsApi()

				} catch (e) {
					console.error('删除体重', e)
				}
			},
			// 本人已绑定设备列表
			async getDevicesList(payload) {
				try {

					await getMeDevicesApi(payload)

				} catch (e) {
					console.error('绑定设备', e)
				}
			},
			// 绑定设备
			async bindDevice(payload) {
				try {

					await postMeDevicesApi(payload)
					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					})
				} catch (e) {
					console.error('绑定设备', e)
				}
			},
			// 解绑设备
			async unbindDevice(id) {
				try {
					await deleteMeDevicesByIdApi({
						id
					})
					uni.showToast({
						title: '已解绑',
						icon: 'success'
					})
				} catch (e) {
					console.error('解绑设备', e)
				}
			},
			// 同步体脂秤
			async syncDeviceWeight() {
				// 如果你后端有这个接口在这里调用
				uni.showToast({
					title: '同步成功',
					icon: 'success'
				})
				this.getMeWeightRecordsApi()
			},
			changeRange(value) {
				this.activeRange = value
				this.getMeWeightRecordsApi()
			},
			openWeightPopup() {
				const baseTime = this.latestRecord ? new Date(this.latestRecord.recordDate.replace(/-/g, '/')) : new Date()
				this.inputWeight = this.latestRecord ? this.latestRecord.weightKg.toFixed(1) : ''
				this.inputDate = this.formatDate(baseTime, 'YYYY-MM-DD')
				this.inputTime = this.formatDate(baseTime, 'HH:mm')
				this.inputSource = 'MANUAL'
				this.showWeightPopup = true
			},
			closeWeightPopup() {
				this.showWeightPopup = false
			},
			saveWeight() {
				const weight = Number(this.inputWeight)
				if (!weight || weight <= 20 || weight > 300) {
					uni.showToast({
						title: '请输入 25-250kg 的体重',
						icon: 'none'
					})
					return
				}
				const recordDate = this.inputDate
				const source = this.inputSource
				const payload = {
					weightKg: weight,
					recordDate,
					source
				}
				console.log(payload)
				this.postMeWeightRecordsApi(payload)

				this.closeWeightPopup()
			},
			disconnectDevice() {
				this.clearSearchTimer()
				this.bluetoothStatus = 'searching'
				this.searchTimer = setTimeout(() => {
					this.bluetoothStatus = 'connected'
					this.searchTimer = null
					uni.showToast({
						title: '已重新连接智能体脂秤S1',
						icon: 'none'
					})
				}, 1800)
				uni.showToast({
					title: '正在重新搜索体脂秤',
					icon: 'none'
				})
			},
			syncWeight() {
				if (this.bluetoothStatus !== 'connected') return
				this.syncDeviceWeight()
				const now = new Date()
				this.lastSyncTime = this.formatDate(now, 'YYYY-MM-DD HH:mm')
			},
			isValidDate(date) {
				return date instanceof Date && !Number.isNaN(date.getTime())
			},
			sourceText(source) {
				return source === 'MANUAL' ? '手动记录' : '体脂秤同步'
			},
			formatAbsChange(value) {
				const number = Math.abs(value)
				const prefix = value < 0 ? '-' : value > 0 ? '+' : ''
				return prefix + (number < 0.05 ? '0.0' : number.toFixed(1))
			},
			showConnectHelp() {
				this.dialogShow = true
			},
			clearSearchTimer() {
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
			},
			buildChange(value) {
				if (Math.abs(value) < 0.05) {
					return {
						value: 0,
						direction: 'flat',
						arrow: '→'
					}
				}
				return {
					value,
					direction: value < 0 ? 'down' : 'up',
					arrow: value < 0 ? '↘' : '↗'
				}
			},
			formatDate(input, pattern) {
				if (!input) return ''
				let date
				if (input instanceof Date) {
					date = input
				} else {
					// 优先兼容 2026-10-24T07:36:29 这种iso字符串
					date = new Date(input)
					// 解析失败再走替换横杠兜底
					if (isNaN(date.getTime())) {
						date = new Date(String(input).replace(/-/g, '/'))
					}
				}
				if (!this.isValidDate(date)) return ''

				const year = date.getFullYear()
				const month = date.getMonth() + 1
				const day = date.getDate()
				const hours = date.getHours()
				const minutes = date.getMinutes()
				const seconds = date.getSeconds()
				const pad = num => String(num).padStart(2, '0')

				return pattern
					.replace('YYYY', year)
					.replace('MM', pad(month))
					.replace('DD', pad(day))
					.replace('HH', pad(hours))
					.replace('mm', pad(minutes))
					.replace('ss', pad(seconds))
			},

			isValidDate(date) {
				return date instanceof Date && !isNaN(date.getTime())
			}
		}
	}
</script>


<style scoped>
	.btn-100 {
		width: 100%;
	}

	.two-actions {
		display: flex;
		gap: 20rpx;
		align-items: center;
		justify-content: space-between;
	}

	.button-wrapper-blue {
		flex: 1;
		background-color: #155DFC;
		border-radius: 10px;
		padding: 10px;
		color: white;

		display: flex;
		text-align: center;
		justify-content: center;
	}

	.button-wrapper-blue .u-icon {
		margin-right: 10rpx;
		position: relative;
		top: 2px;
	}

	.button-wrapper-gray {

		background-color: #f2f3f6;
		border-radius: 10px;
		padding: 10px;
		/* color: white; */

		text-align: center;
	}

	.weight-page {
		/* min-height: 100vh;
		padding: 18rpx 24rpx 28rpx;
		box-sizing: border-box;
		background: #f6f7f9; */
	}

	.weight-header {
		padding: 8rpx 6rpx 22rpx;
	}

	.header-kicker {
		display: block;
		color: #8b95a7;
		font-size: 22rpx;
		line-height: 1.4;
	}

	.header-title {
		display: block;
		margin-top: 4rpx;
		color: #172033;
		font-size: 38rpx;
		font-weight: 800;
		line-height: 1.3;
	}

	.weight-card {
		margin-bottom: 26rpx;
		padding: 28rpx 28rpx 30rpx;
		border-radius: 40rpx;
		background: #ffffff;
		box-shadow: 0 4rpx 18rpx rgba(20, 32, 55, 0.025);
		box-sizing: border-box;
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.head-left {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.head-icon {
		width: 64rpx;
		height: 64rpx;
		margin-right: 16rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.scale-head-icon {
		background: #eaf2ff;
	}

	.trend-head-icon {
		background: #e8f8f3;
	}

	.bluetooth-head-icon {
		background: #f0efff;
	}

	.card-title {
		color: #111827;
		font-size: 30rpx;
		font-weight: 800;
		line-height: 1.25;
	}

	.svg-icon {
		display: inline-block;
		background-repeat: no-repeat;
		background-position: center;
		background-size: contain;
		flex: 0 0 auto;
	}

	.svg-scale {
		width: 38rpx;
		height: 38rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23165cf5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='7' width='16' height='13' rx='3'/%3E%3Cpath d='M8.5 16a3.5 3.5 0 0 1 7 0'/%3E%3Cpath d='M12 16v-2.5'/%3E%3C/svg%3E");
	}

	.svg-scale.large {
		width: 72rpx;
		height: 72rpx;
	}

	.svg-trend {
		width: 36rpx;
		height: 36rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 18V7'/%3E%3Cpath d='M4 18h16'/%3E%3Cpath d='M7 15l4-4 3 2 5-6'/%3E%3Ccircle cx='7' cy='15' r='.8'/%3E%3Ccircle cx='11' cy='11' r='.8'/%3E%3Ccircle cx='14' cy='13' r='.8'/%3E%3Ccircle cx='19' cy='7' r='.8'/%3E%3C/svg%3E");
	}

	.svg-trend.muted {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238f98a8' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='7' y1='17' x2='17' y2='7'/%3E%3Cpolyline points='7 7 17 7 17 17'/%3E%3C/svg%3E");
	}

	.svg-trend.warning-icon {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='7' y1='17' x2='17' y2='7'/%3E%3Cpolyline points='7 7 17 7 17 17'/%3E%3C/svg%3E");
	}

	.button-wrapper-blue .svg-bluetooth {
		width: 26rpx;
		height: 26rpx;
		margin-right: 10rpx;
		position: relative;
		top: 2px;
	}

	.svg-bluetooth {
		width: 38rpx;
		height: 38rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5'/%3E%3C/svg%3E");
	}

	.svg-bluetooth.gray {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa1af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5'/%3E%3C/svg%3E");
	}

	.svg-bluetooth.white {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5'/%3E%3C/svg%3E");
	}

	.svg-bluetooth.circle-icon {
		width: 48rpx;
		height: 48rpx;
	}

	.svg-bluetooth.button-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 10rpx;
	}

	.svg-bluetooth.placeholder-icon {
		width: 58rpx;
		height: 58rpx;
	}

	.svg-change {
		width: 34rpx;
		height: 34rpx;
		margin-right: 4rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238f98a8' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='7' y1='17' x2='17' y2='7'/%3E%3Cpolyline points='7 7 17 7 17 17'/%3E%3C/svg%3E");
	}

	.svg-change.down {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='7' y1='7' x2='17' y2='17'/%3E%3Cpolyline points='17 7 17 17 7 17'/%3E%3C/svg%3E");
	}

	.svg-change.up {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='7' y1='17' x2='17' y2='7'/%3E%3Cpolyline points='7 7 17 7 17 17'/%3E%3C/svg%3E");
	}

	.edit-entry {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.current-body {
		padding: 28rpx 0 30rpx;
		text-align: center;
	}

	.weight-number-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.weight-number {
		color: #111827;
		font-size: 70rpx;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -2rpx;
	}

	.weight-unit {
		margin-left: 10rpx;
		color: #7c879b;
		font-size: 36rpx;
		font-weight: 700;
	}

	.record-meta {
		margin-top: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.record-time {
		color: #8b95a7;
		font-size: 24rpx;
	}

	.meta-dot {
		margin: 0 14rpx;
		color: #c8ceda;
		font-size: 22rpx;
	}

	.source-tag {
		padding: 7rpx 18rpx;
		border-radius: 22rpx;
		font-size: 22rpx;
		font-weight: 700;
		line-height: 1.2;
	}

	.source-tag.scale {
		color: #165cf5;
		background: #edf4ff;
		border: 1rpx solid #cfe0ff;
	}

	.source-tag.manual {
		color: #687386;
		background: #f3f5f8;
		border: 1rpx solid #e1e5ec;
	}

	.primary-action {
		width: 100%;
		height: 92rpx;
		border-radius: 24rpx;
		background: #165cf5;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		box-shadow: 0 12rpx 22rpx rgba(22, 92, 245, 0.2);
	}

	.primary-action text {
		margin-left: 10rpx;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: 800;
	}

	.weight-action {
		margin-top: 2rpx;
	}

	.current-empty {
		padding: 34rpx 0 34rpx;
		text-align: center;
	}



	.range-switch {
		height: 50rpx;
		padding: 5rpx;
		border-radius: 20rpx;
		background: #f2f4f8;
		display: flex;
		align-items: center;
	}

	.range-tab {
		min-width: 82rpx;
		height: 40rpx;
		padding: 0 14rpx;
		border-radius: 20rpx;
		color: #687386;
		font-size: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.range-tab.active {
		color: #165cf5;
		background: #ffffff;
		font-weight: 800;
		box-shadow: 0 4rpx 12rpx rgba(24, 39, 75, 0.06);
	}

	.trend-empty {
		padding: 46rpx 0 34rpx;
		text-align: center;
	}



	.soft-action {

		background: #edf5ff;
		color: #165cf5;
		display: flex;

		border-radius: 10px;
		padding: 10px;

		display: flex;
		text-align: center;
		justify-content: center;

	}

	.soft-action text {
		margin-left: 10rpx;
		color: #165cf5;
		font-size: 25rpx;
		font-weight: 800;
	}

	.chart-wrap {
		width: 100%;
		height: 248rpx;
		margin-top: 18rpx;
	}

	.stat-grid {
		margin-top: 18rpx;
		display: flex;
		justify-content: space-between;
	}

	.stat-card {
		width: 48.2%;
		min-height: 134rpx;
		padding: 22rpx 20rpx;
		border-radius: 24rpx;
		border: 1rpx solid #edf0f5;
		background: #fbfcfe;
		box-sizing: border-box;
	}

	.stat-label {
		display: block;
		color: #9aa3b2;
		font-size: 22rpx;
	}

	.stat-value {
		margin-top: 14rpx;
		display: flex;
		align-items: center;
		color: #00a63e;
		font-size: 30rpx;
		font-weight: 900;
	}

	.stat-value.up {
		color: #e11d48;
	}

	.stat-value.flat {
		color: #7f8a9d;
	}

	.trend-footer {
		margin-top: 22rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.footer-muted {
		color: #9aa3b2;
		font-size: 22rpx;
	}

	.footer-source {
		display: flex;
		align-items: center;
	}

	.footer-source .footer-muted {
		margin-right: 8rpx;
	}

	.footer-blue {
		color: #165cf5;
		font-size: 22rpx;
		font-weight: 800;
	}

	.help-link {
		display: flex;
		align-items: center;
	}

	.help-link text {
		margin-left: 6rpx;
		color: #8d96a6;
		font-size: 23rpx;
	}

	.bluetooth-subtitle {
		display: block;
		margin-top: 14rpx;
		color: #9aa3b2;
		font-size: 24rpx;
	}

	.bluetooth-panel {
		margin-top: 24rpx;
		padding: 30rpx 0;
		text-align: center;
	}

	.bluetooth-placeholder {
		width: 112rpx;
		height: 112rpx;
		margin: 0 auto 20rpx;
		border-radius: 32rpx;
		background: #f8f9fb;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.disconnected-title-row {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.offline-dot {
		width: 14rpx;
		height: 14rpx;
		margin-right: 10rpx;
		border-radius: 50%;
		background: #c4cbd6;
	}

	.bluetooth-status-title {
		color: #2a3242;
		font-size: 28rpx;
		font-weight: 900;

	}

	.bluetooth-status-desc {
		display: block;
		margin-top: 10rpx;
		color: #9aa3b2;
		font-size: 23rpx;
		line-height: 1.5;
	}

	.searching-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
	}

	.bluetooth-circle {
		position: relative;
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background-color: #1677ff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
	}

	.circle-icon {
		font-size: 72rpx;
		color: #ffffff;
	}

	/* 两层波纹 */
	.pulse::before,
	.pulse::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		border-radius: 50%;
		background-color: rgba(22, 119, 255, 0.25);
		animation: ripple 2s ease-out infinite;
	}

	.pulse::after {
		animation-delay: 0.7s;
	}

	@keyframes ripple {
		0% {
			transform: scale(1);
			opacity: 0.6;
		}

		100% {
			transform: scale(1.8);
			opacity: 0;
		}
	}

	.bluetooth-status-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #222;
		margin-bottom: 20rpx;
	}

	.bluetooth-status-desc {
		font-size: 20rpx;
		color: #888;
		text-align: center;
	}

	.device-panel {
		margin-top: 24rpx;
		padding: 24rpx 22rpx;
		border: 1rpx solid #bde9cd;
		border-radius: 24rpx;
		background: #ecfdf3;
	}

	.device-main-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.device-name-row {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.connected-dot {
		width: 18rpx;
		height: 18rpx;
		margin-right: 12rpx;
		border-radius: 50%;
		background: #18b86b;
		box-shadow: 0 0 0 6rpx rgba(24, 184, 107, 0.12);
	}

	.connected-text {
		margin-right: 18rpx;
		color: #087a48;
		font-size: 27rpx;
		font-weight: 900;
	}

	.device-name {
		color: #182235;
		font-size: 27rpx;
		font-weight: 900;
	}

	.device-meta {
		display: flex;
		align-items: center;
		flex: 0 0 auto;
	}

	.battery-box {
		display: flex;
		align-items: center;
		margin-left: 14rpx;
		color: #315c43;
		font-size: 22rpx;
		font-weight: 700;
	}

	.battery-body {
		width: 30rpx;
		height: 17rpx;
		margin-right: 4rpx;
		padding: 2rpx;
		border: 2rpx solid #315c43;
		border-radius: 4rpx;
		box-sizing: border-box;
	}

	.battery-level {
		width: 78%;
		height: 100%;
		border-radius: 2rpx;
		background: #22a866;
	}

	.battery-tip {
		width: 3rpx;
		height: 8rpx;
		margin-right: 5rpx;
		border-radius: 0 2rpx 2rpx 0;
		background: #315c43;
	}

	.signal-box {
		margin-left: 18rpx;
		display: flex;
		align-items: center;
		color: #315c43;
		font-size: 22rpx;
		font-weight: 700;
	}

	.signal-bars {
		width: 24rpx;
		height: 20rpx;
		margin-right: 4rpx;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	.signal-bar {
		width: 5rpx;
		border-radius: 4rpx 4rpx 1rpx 1rpx;
		background: #25895b;
	}

	.signal-bar.bar-1 {
		height: 8rpx;
	}

	.signal-bar.bar-2 {
		height: 13rpx;
	}

	.signal-bar.bar-3 {
		height: 18rpx;
	}

	.signal-box text:last-child {
		margin-left: 4rpx;
	}

	.device-bottom-row {
		margin-top: 22rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sync-time {
		color: #77857e;
		font-size: 22rpx;
	}

	.auto-sync {
		padding: 9rpx 16rpx;
		border-radius: 16rpx;
		background: #dcfce9;
		color: #148050;
		font-size: 21rpx;
		font-weight: 700;
	}

	.bluetooth-actions {
		margin-top: 22rpx;
	}



	.connect-action {
		margin-top: 0;
	}

	.two-actions .connect-action {
		width: 72%;
	}

	.two-actions .connect-action.searching {
		width: 100%;
	}

	.secondary-action {
		width: 25%;
		height: 92rpx;
		border-radius: 24rpx;
		background: #f2f3f6;
		color: #2f3948;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 27rpx;
		font-weight: 800;
	}

	.disclaimer {
		display: block;
		padding: 2rpx 8rpx 36rpx;
		color: #a5adb9;
		font-size: 20rpx;
		line-height: 1.6;
		text-align: center;
	}

	.weight-popup {
		padding: 18rpx 30rpx 36rpx;
		background: #ffffff;
		box-sizing: border-box;
	}

	.popup-handle {
		width: 68rpx;
		height: 7rpx;
		margin: 0 auto 24rpx;
		border-radius: 8rpx;
		background: #dfe4ec;
	}

	.popup-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.popup-title {
		color: #172033;
		font-size: 34rpx;
		font-weight: 900;
	}

	.popup-close {
		width: 58rpx;
		height: 58rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.popup-desc {
		display: block;
		margin: 12rpx 0 26rpx;
		color: #8a94a5;
		font-size: 23rpx;
	}

	.input-label {
		margin: 18rpx 0 12rpx;
		color: #344054;
		font-size: 24rpx;
		font-weight: 800;
	}

	.weight-input-box {
		height: 92rpx;
		padding: 0 24rpx;
		border: 2rpx solid #e3e8f0;
		border-radius: 22rpx;
		background: #f8fafc;
		display: flex;
		align-items: center;
	}

	.weight-input {
		flex: 1;
		min-width: 0;
		height: 100%;
		color: #172033;
		font-size: 30rpx;
		font-weight: 800;
	}

	.weight-placeholder {
		color: #a6afbe;
		font-weight: 400;
	}

	.input-unit {
		color: #7f8a9d;
		font-size: 24rpx;
		font-weight: 700;
	}

	.time-picker-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.date-picker {
		width: 48%;
	}

	.time-picker {
		width: 28%;
	}

	.picker-field {
		height: 86rpx;
		padding: 0 20rpx;
		border: 1rpx solid #e3e8f0;
		border-radius: 18rpx;
		background: #f8fafc;
		color: #344054;
		font-size: 23rpx;
		line-height: 86rpx;
		box-sizing: border-box;
	}

	.source-selector {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.source-option {
		width: 48%;
		height: 76rpx;
		border: 1rpx solid #dfe4ee;
		border-radius: 20rpx;
		background: #ffffff;
		color: #697589;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 700;
	}

	.source-option.selected {
		border: 2rpx solid #165cf5;
		background: #edf4ff;
		color: #165cf5;
		font-weight: 900;
	}

	.popup-actions {
		margin-top: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.popup-cancel,
	.popup-confirm {
		width: 48%;
		height: 88rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 27rpx;
		font-weight: 900;
	}

	.popup-cancel {
		background: #f2f4f8;
		color: #536073;
	}

	.popup-confirm {
		background: #165cf5;
		color: #ffffff;
		box-shadow: 0 12rpx 22rpx rgba(22, 92, 245, 0.2);
	}

	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.dialog {
		width: 85%;
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		box-sizing: border-box;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		/* border-bottom: 1rpx solid #eee; */
	}

	.title {
		font-size: 30rpx;
		font-weight: bold;
		color: #222;
	}

	.close-btn {
		font-size: 36rpx;
		color: #888;
		line-height: 1;
	}

	.content {
		margin-bottom: 40rpx;
	}

	.item {
		background: #f5f8ff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.item:last-child {
		margin-bottom: 0;
	}

	.item-title {
		font-size: 24rpx;
		color: #2b68cc;
		font-weight: bold;
		margin-bottom: 12rpx;
	}

	.item-desc {
		font-size: 20rpx;
		color: #555;
		line-height: 1.6;
	}

	.confirm-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #1677ff;
		color: #fff;
		border-radius: 44rpx;
		font-size: 30rpx;
		border: none;
		margin: 0;
		padding: 0;
	}

	.idle-panel {
		/* padding: 32rpx; */
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.title-wrap {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #222;
	}

	.help-row {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.help-text {
		font-size: 26rpx;
		color: #666;
	}

	.page-desc {
		font-size: 20rpx;
		color: #888;
		display: block;
		margin-top: 20rpx;

	}

	.center-icon-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.bluetooth-box {
		width: 100rpx;
		height: 100rpx;
		background: #f5f5f5;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
	}

	.empty-scale {
		width: 100rpx;
		height: 100rpx;
		margin: 0 auto 28rpx;
		border-radius: 38rpx;
		background: #f0f5ff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.empty-title {
		display: block;
		color: #1f2937;
		font-size: 30rpx;
		font-weight: 800;
		line-height: 1.4;
	}

	.empty-desc {
		display: block;
		margin-top: 12rpx;
		color: #7d8799;
		font-size: 25rpx;
		line-height: 1.55;
	}

	.trend-empty-icon {
		width: 100rpx;
		height: 100rpx;
		margin: 0 auto 26rpx;
		border-radius: 24rpx;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.trend-empty-icon.warning {
		background: #fffbeb;
	}

	.trend-empty.one-record {
		padding-bottom: 22rpx;
	}

	.single-record {
		margin-top: 28rpx;
		padding: 22rpx 24rpx;
		border-radius: 24rpx;
		background: #f8f9fc;
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: left;
	}

	.single-label {
		display: block;
		color: #9aa3b2;
		font-size: 22rpx;
	}

	.single-weight {
		display: block;
		margin-top: 8rpx;
		color: #111827;
		font-size: 36rpx;
		font-weight: 800;
	}

	.single-time-box {
		text-align: right;
	}

	.single-time {
		display: block;
		margin-top: 8rpx;
		color: #4b5568;
		font-size: 26rpx;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 16rpx;
	}

	.gray-dot {
		width: 14rpx;
		height: 14rpx;
		background: #ccc;
		border-radius: 50%;
	}

	.status-text {
		font-size: 28rpx;
		color: #444;
	}

	.tip-text {
		font-size: 20rpx;
		color: #888;
	}

	.bottom-btn-wrap {
		margin-top: 50rpx;
	}

	.connect-btn {
		width: 100%;
		height: 96rpx;
		background: #1677ff;
		color: #fff;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		border: none;
	}
</style>