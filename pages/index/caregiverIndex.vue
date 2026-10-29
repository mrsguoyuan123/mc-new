<template>
	<view class="caregiver-page">
		<!-- 改动位置：顶部通知提示条 -->
		<view class="notice-bar">
			<view class="notice-icon">
				<u-icon name="bell-fill" color="#2563ff" size="18"></u-icon>
			</view>
			<text class="notice-text">{{ noticeText }}</text>
			<text class="notice-link" @click="switchTab(2)">去处理</text>
		</view>

		<view v-if="pageLoading" class="state-block">
			<u-loading-icon mode="circle" color="#2563ff" size="30"></u-loading-icon>
			<text class="state-text">工作台加载中...</text>
		</view>

		<template v-else>
			<!-- 改动位置：4个统计卡片，数字来自 getEscortStatsApi / getEscortProfileStatsApi -->
			<view class="stats-grid">
				<view
					v-for="item in statCards"
					:key="item.key"
					class="stat-card"
					@click="switchTab(item.tabIndex)"
				>
					<view class="stat-icon" :style="{ backgroundColor: item.bgColor }">
						<u-icon :name="item.icon" :color="item.color" size="23"></u-icon>
					</view>
					<view class="stat-info">
						<view class="stat-number">{{ item.value }}</view>
						<view class="stat-label">{{ item.label }}</view>
					</view>
				</view>
			</view>

			<!-- 改动位置：蓝色陪诊服务日历入口，排班数据来自 getEscortSchedulesApi -->
			<view class="calendar-card" @click="goCalendar">
				<view class="calendar-left">
					<view class="calendar-icon">
						<u-icon name="calendar-fill" color="#ffffff" size="25"></u-icon>
					</view>
					<view class="calendar-text">
						<view class="calendar-title">陪诊服务日历</view>
						<view class="calendar-desc">查看今日与未来排班动线</view>
						<view class="calendar-sub">本月排班 {{ scheduleCount }} 项 · 累计服务 {{ profileStats.totalCount || 0 }} 人</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#ffffff" size="19"></u-icon>
			</view>

			<!-- 改动位置：用户列表 / 待服务 / 待接单 / 已服务 tab -->
			<view class="tab-bar">
				<view
					v-for="(tab, index) in tabList"
					:key="tab.key"
					class="tab-item"
					:class="{ active: currentTab === index }"
					@click="switchTab(index)"
				>
					<text>{{ tab.label }}</text>
					<text class="tab-count">({{ tab.count }})</text>
				</view>
			</view>

			<!-- 改动位置：用户列表，数据来自 getEscortUsersApi -->
			<view v-if="currentTab === 0" class="list-panel">
				<view v-if="usersLoading" class="state-block compact">
					<u-loading-icon mode="circle" color="#2563ff" size="26"></u-loading-icon>
					<text class="state-text">用户列表加载中...</text>
				</view>

				<view v-else-if="users.length === 0" class="empty-block">
					<u-icon name="account" color="#b7c0d4" size="42"></u-icon>
					<text class="empty-text">暂无可服务用户</text>
					<u-button type="primary" size="mini" shape="circle" text="重新加载" @click="loadUsers"></u-button>
				</view>

				<view
					v-else
					v-for="user in users"
					:key="user.patientId"
					class="user-card"
					@click="openChat(user)"
				>
					<view v-if="user.unreadCount > 0" class="unread-badge">
						{{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
					</view>
					<view class="user-avatar">
						<image v-if="user.avatar" class="avatar-img" :src="user.avatar" mode="aspectFill"></image>
						<u-icon v-else name="account-fill" color="#2563ff" size="35"></u-icon>
					</view>
					<view class="user-main">
						<view class="user-title-row">
							<text class="user-name">{{ user.name }}</text>
							<text class="user-age">{{ user.ageText }}</text>
							<u-tag v-if="user.genderText" :text="user.genderText" type="primary" size="mini" plain></u-tag>
							<u-tag v-if="user.tagText" :text="user.tagText" :type="user.tagType" size="mini" plain></u-tag>
						</view>
						<view class="meta-row">
							<u-icon name="order" color="#96a0b5" size="14"></u-icon>
							<text class="meta-text">住院号：{{ user.inpatientNo }}</text>
						</view>
						<view class="meta-row">
							<u-icon name="map" color="#96a0b5" size="14"></u-icon>
							<text class="meta-text hospital">{{ user.hospital }}</text>
						</view>
						<view class="message-row">
							<u-icon name="chat" color="#96a0b5" size="14"></u-icon>
							<text class="message-text">{{ user.lastMessage }}</text>
							<text v-if="user.lastMsgAtText" class="message-time">{{ user.lastMsgAtText }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 改动位置：待服务 / 待接单 / 已服务订单分页列表 -->
			<view v-else class="list-panel">
				<view v-if="listLoading && orders.length === 0" class="state-block compact">
					<u-loading-icon mode="circle" color="#2563ff" size="26"></u-loading-icon>
					<text class="state-text">订单列表加载中...</text>
				</view>

				<view v-else-if="orders.length === 0" class="empty-block">
					<u-icon name="file-text" color="#b7c0d4" size="42"></u-icon>
					<text class="empty-text">{{ activeTab.emptyText }}</text>
					<u-button type="primary" size="mini" shape="circle" text="重新加载" @click="loadOrders(true)"></u-button>
				</view>

				<view v-else>
					<view v-for="order in orders" :key="order.id" class="order-card">
						<view class="order-header">
							<view class="order-avatar">
								<u-icon name="account-fill" color="#2563ff" size="35"></u-icon>
							</view>
							<view class="order-main">
								<view class="order-title-row">
									<text class="order-name">{{ order.patientName }}</text>
									<text class="order-age">{{ order.ageText }}</text>
									<u-tag
										:text="statusTextMap[order.status] || order.status"
										:type="statusTypeMap[order.status] || 'info'"
										size="mini"
									></u-tag>
								</view>
								<view class="service-time">
									<u-icon name="clock" color="#2563ff" size="14"></u-icon>
									<text>{{ order.serviceTime }}</text>
								</view>
							</view>
							<u-button
								type="primary"
								size="mini"
								plain
								shape="circle"
								text="查看详情"
								@click="openOrderDetail(order)"
							></u-button>
						</view>

						<view class="order-info-row">
							<u-icon name="phone" color="#96a0b5" size="15"></u-icon>
							<text class="order-info-text">{{ order.phone }}</text>
						</view>
						<view class="order-info-row">
							<u-icon name="map" color="#96a0b5" size="15"></u-icon>
							<text class="order-info-text">{{ order.address }}</text>
						</view>

						<view class="action-row">
							<u-button
								v-if="order.status === 'WAIT_ACCEPT'"
								type="warning"
								size="mini"
								shape="circle"
								text="接单"
								:loading="actionLoading"
								@click="acceptOrder(order)"
							></u-button>
							<u-button
								v-if="order.status === 'CONFIRMED'"
								type="primary"
								size="mini"
								shape="circle"
								text="开始服务"
								:loading="actionLoading"
								@click="startOrder(order)"
							></u-button>
							<u-button
								v-if="order.status === 'IN_SERVICE'"
								type="success"
								size="mini"
								shape="circle"
								text="到院签到"
								:loading="actionLoading"
								@click="checkinOrder(order)"
							></u-button>
							<u-button
								v-if="order.status === 'IN_SERVICE'"
								type="primary"
								size="mini"
								plain
								shape="circle"
								text="填写服务记录"
								:loading="actionLoading"
								@click="openServiceRecord(order)"
							></u-button>
							<u-button
								v-if="order.status === 'COMPLETED'"
								type="info"
								size="mini"
								plain
								shape="circle"
								text="查看服务记录"
								@click="openOrderDetail(order)"
							></u-button>
						</view>
					</view>

					<u-loadmore
						:status="loadmoreStatus"
						loadmore-text="上拉或点击加载更多"
						loading-text="正在加载..."
						nomore-text="没有更多了"
						@loadmore="loadMoreOrders"
					></u-loadmore>
				</view>
			</view>
		</template>

		<!-- 改动位置：服务记录弹窗，提交 postEscortOrdersByIdServiceRecordApi -->
		<u-popup :show="recordPopupVisible" mode="bottom" :round="24" :closeable="true" @close="closeRecordPopup">
			<view class="record-popup">
				<view class="popup-title">填写服务记录</view>
				<view class="form-label">身体恢复情况</view>
				<textarea
					v-model="recordForm.recoveryDescription"
					class="form-textarea"
					maxlength="1024"
					placeholder="请记录患者身体恢复情况、陪诊过程和完成情况"
				/>

				<view class="form-label">其他情况</view>
				<view class="selector-row">
					<view
						v-for="item in situationOptions"
						:key="item.value || 'NONE'"
						class="selector-item"
						:class="{ active: recordForm.otherSituation === item.value }"
						@click="recordForm.otherSituation = item.value"
					>{{ item.label }}</view>
				</view>

				<view class="form-label">特殊情况反馈</view>
				<textarea
					v-model="recordForm.specialFeedback"
					class="form-textarea small"
					maxlength="1024"
					placeholder="没有特殊情况可留空"
				/>

				<view class="form-label">任务完成情况</view>
				<view class="selector-row">
					<view
						v-for="item in completeOptions"
						:key="item.value"
						class="selector-item"
						:class="{ active: recordForm.taskCompleted === item.value }"
						@click="recordForm.taskCompleted = item.value"
					>{{ item.label }}</view>
				</view>

				<view class="popup-actions">
					<u-button class="popup-btn" plain shape="circle" text="取消" @click="closeRecordPopup"></u-button>
					<u-button
						class="popup-btn"
						type="primary"
						shape="circle"
						text="提交记录"
						:loading="actionLoading"
						@click="submitServiceRecord"
					></u-button>
				</view>
			</view>
		</u-popup>

		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>

<script>
import {
	getEscortStatsApi,
	getEscortOrdersApi,
	getEscortOrdersByIdApi,
	putEscortOrdersByIdAcceptApi,
	putEscortOrdersByIdStartApi,
	postEscortOrdersByIdCheckinApi,
	postEscortOrdersByIdServiceRecordApi,
	getEscortSchedulesApi,
	getEscortProfileStatsApi,
	getEscortUsersApi
} from '@/api/frontApikit.js'
import customTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

export default {
	components: {
		customTabbar
	},
	data() {
		return {
			pageLoading: false,
			usersLoading: false,
			listLoading: false,
			actionLoading: false,
			currentTab: 0,
			currentMonth: '',
			noticeText: '欢迎使用陪诊工作台',
			stats: {
				users: 0,
				pending: 0,
				waitAccept: 0,
				inService: 0,
				completed: 0
			},
			profileStats: {
				totalCount: 0,
				monthCount: 0,
				rating: '--'
			},
			users: [],
			orders: [],
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: false,
			scheduleMap: {},
			scheduleCount: 0,
			orderDetail: null,
			recordPopupVisible: false,
			currentRecordOrderId: '',
			recordForm: {
				recoveryDescription: '',
				otherSituation: '',
				specialFeedback: '',
				taskCompleted: 'COMPLETED'
			},
			situationOptions: [
				{ label: '无', value: '' },
				{ label: '空巢老人', value: 'EMPTY_NESTER' },
				{ label: '行动不便', value: 'MOBILITY_IMPAIRED' },
				{ label: '其他', value: 'OTHER' }
			],
			completeOptions: [
				{ label: '已完成', value: 'COMPLETED' },
				{ label: '未完成', value: 'INCOMPLETE' }
			],
			statusTextMap: {
				WAIT_ACCEPT: '待接单',
				CONFIRMED: '待服务',
				IN_SERVICE: '服务中',
				COMPLETED: '已服务',
				CANCELLED: '已取消'
			},
			statusTypeMap: {
				WAIT_ACCEPT: 'warning',
				CONFIRMED: 'primary',
				IN_SERVICE: 'primary',
				COMPLETED: 'success',
				CANCELLED: 'info'
			}
		}
	}
	,
	computed: {
		tabList() {
			const pendingCount = Number(this.stats.pending || 0) + Number(this.stats.inService || 0)
			return [
				{ key: 'users', label: '用户列表', count: this.stats.users || 0, statuses: [], emptyText: '暂无可服务用户' },
				{ key: 'pending', label: '待服务', count: pendingCount, statuses: ['CONFIRMED', 'IN_SERVICE'], emptyText: '暂无待服务订单' },
				{ key: 'waitAccept', label: '待接单', count: this.stats.waitAccept || 0, statuses: ['WAIT_ACCEPT'], emptyText: '暂无待接单订单' },
				{ key: 'completed', label: '已服务', count: this.stats.completed || 0, statuses: ['COMPLETED'], emptyText: '暂无已服务订单' }
			]
		},
		activeTab() {
			return this.tabList[this.currentTab] || this.tabList[0]
		},
		statCards() {
			const pendingCount = Number(this.stats.pending || 0) + Number(this.stats.inService || 0)
			return [
				{ key: 'users', label: '用户列表', value: this.stats.users || 0, icon: 'account-fill', color: '#2563ff', bgColor: '#e9f0ff', tabIndex: 0 },
				{ key: 'pending', label: '待服务', value: pendingCount, icon: 'clock', color: '#16a34a', bgColor: '#eafaf0', tabIndex: 1 },
				{ key: 'waitAccept', label: '待接单', value: this.stats.waitAccept || 0, icon: 'order', color: '#f59e0b', bgColor: '#fff4df', tabIndex: 2 },
				{ key: 'completed', label: '已服务', value: this.stats.completed || 0, icon: 'checkmark-circle', color: '#7c3aed', bgColor: '#f2eaff', tabIndex: 3 }
			]
		},
		loadmoreStatus() {
			if (this.listLoading) return 'loading'
			return this.hasMore ? 'loadmore' : 'nomore'
		}
	},
	onLoad() {
		this.currentMonth = this.formatMonth(new Date())
		this.bootstrap()
	},
	onShow() {
		if (this.currentMonth) this.loadStats()
	},
	onReachBottom() {
		this.loadMoreOrders()
	},
	onPullDownRefresh() {
		this.refreshAll()
	},
	methods: {
		async bootstrap() {
			this.pageLoading = true
			try {
				await Promise.all([
					this.loadStats(),
					this.loadProfileStats(),
					this.loadSchedules(),
					this.loadUsers(),
					this.loadOrders(true)
				])
			} finally {
				this.pageLoading = false
				uni.stopPullDownRefresh()
			}
		},
		async refreshAll() {
			await Promise.all([
				this.loadStats(),
				this.loadProfileStats(),
				this.loadSchedules(),
				this.currentTab === 0 ? this.loadUsers() : this.loadOrders(true)
			])
			uni.stopPullDownRefresh()
		},
		switchTab(index) {
			if (this.currentTab === index) return
			this.currentTab = index
			if (index === 0) {
				this.loadUsers()
			} else {
				this.loadOrders(true)
			}
		},
		async loadStats() {
			try {
				const data = await getEscortStatsApi() || {}
				this.stats = {
					users: this.toNumber(data.users ?? data.userCount ?? data.serviceUsers),
					pending: this.toNumber(data.pending ?? data.pendingCount),
					waitAccept: this.toNumber(data.waitAccept ?? data.waitAcceptCount),
					inService: this.toNumber(data.inService ?? data.inServiceCount),
					completed: this.toNumber(data.completed ?? data.completedCount)
				}
				this.updateNotice()
			} catch (error) {
				this.handleError(error, '统计信息加载失败')
			}
		},
		async loadProfileStats() {
			try {
				const data = await getEscortProfileStatsApi() || {}
				this.profileStats = {
					totalCount: this.toNumber(data.totalCount ?? data.total ?? data.totalServiceCount),
					monthCount: this.toNumber(data.monthCount ?? data.month ?? data.monthServiceCount),
					rating: data.rating === undefined || data.rating === null || data.rating === '' ? '--' : data.rating
				}
			} catch (error) {
				this.handleError(error, '个人统计加载失败')
			}
		},
		async loadSchedules() {
			try {
				const month = this.currentMonth || this.formatMonth(new Date())
				const data = await getEscortSchedulesApi({ month }) || {}
				this.scheduleMap = Array.isArray(data) ? this.listToScheduleMap(data) : data
				this.scheduleCount = this.countSchedules(this.scheduleMap)
			} catch (error) {
				this.handleError(error, '排班信息加载失败')
			}
		},
		async loadUsers() {
			this.usersLoading = true
			try {
				const data = await getEscortUsersApi()
				this.users = this.extractList(data)
					.map(item => this.normalizeUser(item))
					.sort((a, b) => new Date(b.lastMsgAt || 0).getTime() - new Date(a.lastMsgAt || 0).getTime())
			} catch (error) {
				this.handleError(error, '用户列表加载失败')
			} finally {
				this.usersLoading = false
			}
		},
		async loadOrders(reset = false) {
			if (this.currentTab === 0 || this.listLoading) return
			const statuses = this.activeTab.statuses || []
			if (!statuses.length) return

			if (reset) {
				this.page = 1
				this.orders = []
				this.total = 0
				this.hasMore = false
			}

			this.listLoading = true
			try {
				const results = await Promise.all(statuses.map(status => {
					return getEscortOrdersApi({
						status,
						page: this.page,
						pageSize: this.pageSize
					})
				}))

				let list = []
				let total = 0
				let hasMore = false
				results.forEach((result, index) => {
					const pageData = result && result.list !== undefined ? result : { list: this.extractList(result) }
					const rows = (pageData.list || []).map(item => this.normalizeOrder(item))
					list = list.concat(rows)
					const itemTotal = this.toNumber(pageData.total !== undefined ? pageData.total : rows.length)
					total += itemTotal
					if (this.page * this.pageSize < itemTotal || pageData.hasNext === true) hasMore = true
				})

				list.sort((a, b) => this.compareServiceTime(a, b))
				const incomingIds = {}
				list.forEach(item => {
					incomingIds[String(item.id)] = true
				})
				const oldList = reset ? [] : this.orders.filter(item => !incomingIds[String(item.id)])
				this.orders = oldList.concat(list)
				this.total = total
				this.hasMore = hasMore
			} catch (error) {
				this.handleError(error, '订单列表加载失败')
				this.hasMore = true
			} finally {
				this.listLoading = false
			}
		},
		loadMoreOrders() {
			if (this.currentTab === 0 || this.listLoading || !this.hasMore) return
			this.page += 1
			this.loadOrders(false)
		},
		async acceptOrder(order) {
			const confirmed = await this.confirmAction(`确认接单 ${order.patientName} 的陪诊服务吗？`)
			if (!confirmed) return
			await this.runOrderAction(order, putEscortOrdersByIdAcceptApi, '接单成功')
		},
		async startOrder(order) {
			const confirmed = await this.confirmAction(`确认为 ${order.patientName} 开始服务吗？`)
			if (!confirmed) return
			await this.runOrderAction(order, putEscortOrdersByIdStartApi, '服务已开始')
		},
		async checkinOrder(order) {
			const confirmed = await this.confirmAction(`确认到达 ${order.address || '服务地点'} 并签到吗？`)
			if (!confirmed) return

			let location
			try {
				location = await this.getCheckinLocation()
			} catch (error) {
				uni.showToast({ title: '未获取到签到位置，请检查定位权限', icon: 'none' })
				return
			}

			this.actionLoading = true
			try {
				await postEscortOrdersByIdCheckinApi({
					id: order.id,
					data: {
						latitude: Number(location.latitude),
						longitude: Number(location.longitude),
						address: location.address || order.address,
						photos: []
					}
				})
				uni.showToast({ title: '签到成功', icon: 'success' })
				await this.afterOrderChanged()
			} catch (error) {
				this.handleError(error, '签到失败')
			} finally {
				this.actionLoading = false
			}
		},
		openServiceRecord(order) {
			this.currentRecordOrderId = order.id
			this.recordForm = {
				recoveryDescription: '',
				otherSituation: '',
				specialFeedback: '',
				taskCompleted: 'COMPLETED'
			}
			this.recordPopupVisible = true
		},
		closeRecordPopup() {
			this.recordPopupVisible = false
		},
		async submitServiceRecord() {
			if (!this.recordForm.recoveryDescription.trim()) {
				uni.showToast({ title: '请填写身体恢复情况', icon: 'none' })
				return
			}
			this.actionLoading = true
			try {
				await postEscortOrdersByIdServiceRecordApi({
					id: this.currentRecordOrderId,
					data: {
						recoveryDescription: this.recordForm.recoveryDescription.trim(),
						otherSituation: this.recordForm.otherSituation || undefined,
						specialFeedback: this.recordForm.specialFeedback.trim() || undefined,
						taskCompleted: this.recordForm.taskCompleted
					}
				})
				uni.showToast({ title: '服务记录已提交', icon: 'success' })
				this.recordPopupVisible = false
				await this.afterOrderChanged()
			} catch (error) {
				this.handleError(error, '服务记录提交失败')
			} finally {
				this.actionLoading = false
			}
		},
		async openOrderDetail(order) {
			try {
				this.orderDetail = await getEscortOrdersByIdApi({ id: order.id })
			} catch (error) {
				this.handleError(error, '订单详情预加载失败')
			}
			const url = `/pages/index/patientDetail?id=${encodeURIComponent(order.id)}&orderStatus=${encodeURIComponent(order.status || '')}`
			this.$safeJump(url)
		},
		openChat(user) {
			const url = `/pages/index/chat?patientId=${encodeURIComponent(user.patientId)}&name=${encodeURIComponent(user.name || '')}`
			this.$safeJump(url)
		},
		async goCalendar() {
			await this.loadSchedules()
			uni.setStorageSync('escortSchedules', this.scheduleMap)
			this.$safeJump(`/pages/index/calendar?month=${encodeURIComponent(this.currentMonth)}`)
		},
		async runOrderAction(order, apiFn, successText) {
			this.actionLoading = true
			try {
				await apiFn({ id: order.id })
				uni.showToast({ title: successText, icon: 'success' })
				await this.afterOrderChanged()
			} catch (error) {
				this.handleError(error, `${successText}失败`)
			} finally {
				this.actionLoading = false
			}
		},
		async afterOrderChanged() {
			await Promise.all([
				this.loadStats(),
				this.loadProfileStats(),
				this.loadSchedules(),
				this.currentTab === 0 ? this.loadUsers() : this.loadOrders(true)
			])
		},
		confirmAction(content) {
			return new Promise(resolve => {
				uni.showModal({
					title: '操作确认',
					content,
					confirmText: '确认',
					cancelText: '取消',
					success: res => resolve(!!res.confirm),
					fail: () => resolve(false)
				})
			})
		},
		getCheckinLocation() {
			return new Promise((resolve, reject) => {
				uni.getLocation({
					type: 'gcj02',
					geocode: true,
					success: res => {
						const address = res.address
							? [res.address.province, res.address.city, res.address.district, res.address.street, res.address.streetNum].filter(Boolean).join('')
							: ''
						resolve({
							latitude: res.latitude,
							longitude: res.longitude,
							address
						})
					},
					fail: reject
				})
			})
		},
		handleError(error, fallback) {
			const message = (error && (error.message || error.errMsg)) || fallback || '请求失败'
			uni.showToast({
				title: fallback ? `${fallback}，请稍后重试` : message,
				icon: 'none',
				duration: 2200
			})
			console.warn('[caregiverIndex]', fallback || message, error)
		},
		updateNotice() {
			if (this.stats.waitAccept > 0) {
				this.noticeText = `您有 ${this.stats.waitAccept} 个订单待接单，请及时处理`
			} else if (this.stats.pending + this.stats.inService > 0) {
				this.noticeText = `您有 ${this.stats.pending + this.stats.inService} 个服务待处理，请注意服务时间`
			} else {
				this.noticeText = '今日暂无紧急待办，可查看陪诊服务日历'
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
		normalizeUser(raw) {
			const source = raw || {}
			const patient = source.patient || source.userInfo || source.user || {}
			const data = Object.assign({}, patient, source)
			const gender = data.gender || data.sex || data.genderText || ''
			const genderText = gender === 'MALE' || gender === '男' || gender === 1
				? '男'
				: gender === 'FEMALE' || gender === '女' || gender === 2
					? '女'
					: gender
			return {
				patientId: data.patientId || data.id || data.userId || '',
				name: data.name || data.patientName || data.nickname || '未命名患者',
				age: this.toNumber(data.age),
				ageText: this.toNumber(data.age) ? `${data.age}岁` : '年龄未填',
				gender,
				genderText,
				tagText: data.tag || data.label || data.riskLevelText || data.patientTag || '',
				tagType: data.tagType || 'success',
				inpatientNo: data.inpatientNo || data.hospitalNo || data.admissionNo || data.patientNo || '待补充',
				hospital: data.hospital || data.hospitalName || data.medicalInstitution || data.hospitalAddress || '暂无医院信息',
				lastMessage: data.lastMessage || data.latestMessage || data.messageContent || data.lastMsgContent || data.remark || '暂无最新消息',
				unreadCount: this.toNumber(data.unreadCount ?? data.unread ?? data.unreadNum),
				avatar: data.avatar || data.avatarUrl || data.headImg || '',
				lastMsgAt: data.lastMsgAt || data.lastMessageAt || data.lastInteractionAt || data.updateTime || '',
				lastMsgAtText: this.formatDateTime(data.lastMsgAt || data.lastMessageAt || data.lastInteractionAt || data.updateTime)
			}
		},
		normalizeOrder(raw) {
			const source = raw || {}
			const booking = source.booking || source.order || {}
			const patient = source.patient || booking.patient || {}
			const data = Object.assign({}, booking, patient, source)
			const serviceDate = data.serviceDate || data.serviceDay || data.appointmentDate || data.orderDate || data.date || ''
			const period = data.period || data.servicePeriod || data.timeSlot || ''
			return {
				id: data.id || data.orderId || '',
				patientId: data.patientId || patient.id || '',
				patientName: data.patientName || data.name || data.customerName || '未命名患者',
				age: this.toNumber(data.age),
				ageText: this.toNumber(data.age) ? `${data.age}岁` : '年龄未填',
				serviceDate,
				period,
				serviceTime: this.formatServiceTime(serviceDate, period, data.serviceTime || data.appointmentTime),
				phone: this.maskPhone(data.phone || data.mobile || data.contactPhone || patient.phone || ''),
				address: data.address || data.hospitalAddress || data.hospitalName || data.serviceAddress || '暂无地址信息',
				status: data.status || data.orderStatus || 'WAIT_ACCEPT',
				raw: data
			}
		},
		maskPhone(phone) {
			const value = String(phone || '').replace(/\s/g, '')
			if (!value) return '手机号待补充'
			if (/^1\d{10}$/.test(value)) return `${value.slice(0, 3)}****${value.slice(7)}`
			return value
		},
		toNumber(value) {
			const number = Number(value)
			return Number.isFinite(number) ? number : 0
		},
		formatMonth(date) {
			const current = date instanceof Date ? date : new Date(date)
			if (Number.isNaN(current.getTime())) return ''
			const month = String(current.getMonth() + 1).padStart(2, '0')
			return `${current.getFullYear()}-${month}`
		},
		formatDateTime(value) {
			if (!value) return ''
			const date = new Date(value)
			if (Number.isNaN(date.getTime())) return String(value)
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${month}-${day} ${hour}:${minute}`
		},
		formatServiceTime(dateText, period, timeText) {
			if (timeText) return timeText
			if (dateText && period) return `${dateText} ${period}`
			return dateText || period || '服务时间待确认'
		},
		compareServiceTime(a, b) {
			const aTime = new Date(`${a.serviceDate || ''} ${a.period || ''}`.trim()).getTime()
			const bTime = new Date(`${b.serviceDate || ''} ${b.period || ''}`.trim()).getTime()
			if (Number.isNaN(aTime) || Number.isNaN(bTime)) return String(b.serviceTime).localeCompare(String(a.serviceTime))
			return bTime - aTime
		},
		listToScheduleMap(list) {
			return list.reduce((map, item) => {
				const date = item.date || item.serviceDate || item.day
				if (!date) return map
				if (!map[date]) map[date] = []
				map[date].push(item)
				return map
			}, {})
		},
		countSchedules(map) {
			return Object.keys(map || {}).reduce((count, date) => count + (Array.isArray(map[date]) ? map[date].length : 0), 0)
		}
	}
}
</script>

<style scoped>
.caregiver-page {
	min-height: 100vh;
	padding: 20rpx 24rpx 150rpx;
	box-sizing: border-box;
	background: #f5f7fb;
}

.notice-bar {
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 0 22rpx;
	margin-bottom: 22rpx;
	border-radius: 18rpx;
	background: #edf4ff;
	box-sizing: border-box;
}

.notice-icon {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #ffffff;
	margin-right: 12rpx;
	flex-shrink: 0;
}

.notice-text {
	flex: 1;
	font-size: 25rpx;
	color: #2e3a52;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.notice-link {
	padding-left: 16rpx;
	font-size: 24rpx;
	color: #2563ff;
	flex-shrink: 0;
}

.state-block {
	min-height: 320rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #8b95a9;
}

.state-block.compact {
	min-height: 240rpx;
}

.state-text {
	margin-top: 16rpx;
	font-size: 26rpx;
}

.empty-block {
	min-height: 360rpx;
	padding: 40rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border-radius: 24rpx;
	box-sizing: border-box;
}

.empty-text {
	margin: 20rpx 0 24rpx;
	font-size: 27rpx;
	color: #8b95a9;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 18rpx;
}

.stat-card {
	display: flex;
	align-items: center;
	padding: 26rpx 22rpx;
	background: #ffffff;
	border-radius: 22rpx;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
	box-sizing: border-box;
}

.stat-icon {
	width: 70rpx;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 20rpx;
	margin-right: 18rpx;
	flex-shrink: 0;
}

.stat-info {
	flex: 1;
	min-width: 0;
}

.stat-number {
	font-size: 40rpx;
	line-height: 46rpx;
	font-weight: 700;
	color: #182338;
}

.stat-label {
	margin-top: 6rpx;
	font-size: 24rpx;
	color: #8b95a9;
}

.calendar-card {
	margin-top: 22rpx;
	padding: 28rpx 26rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 24rpx;
	background: linear-gradient(135deg, #2f73ff 0%, #1557e8 100%);
	box-shadow: 0 12rpx 28rpx rgba(37, 99, 255, 0.22);
	box-sizing: border-box;
}

.calendar-left {
	display: flex;
	align-items: center;
	min-width: 0;
}

.calendar-icon {
	width: 76rpx;
	height: 76rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.18);
	margin-right: 20rpx;
	flex-shrink: 0;
}

.calendar-text {
	flex: 1;
	min-width: 0;
}

.calendar-title {
	font-size: 31rpx;
	font-weight: 700;
	color: #ffffff;
}

.calendar-desc {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.82);
}

.calendar-sub {
	margin-top: 8rpx;
	font-size: 21rpx;
	color: rgba(255, 255, 255, 0.72);
}

.tab-bar {
	margin-top: 22rpx;
	padding: 8rpx;
	display: flex;
	background: #ffffff;
	border-radius: 22rpx;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
	box-sizing: border-box;
}

.tab-item {
	flex: 1;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 23rpx;
	color: #5e687c;
	border-radius: 16rpx;
	white-space: nowrap;
}

.tab-item.active {
	background: #2563ff;
	color: #ffffff;
	font-weight: 600;
}

.tab-count {
	margin-left: 2rpx;
}

.list-panel {
	margin-top: 20rpx;
}

.user-card,
.order-card {
	position: relative;
	margin-bottom: 18rpx;
	padding: 26rpx;
	background: #ffffff;
	border-radius: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
	box-sizing: border-box;
}

.unread-badge {
	position: absolute;
	top: 18rpx;
	right: 20rpx;
	min-width: 34rpx;
	height: 34rpx;
	padding: 0 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
	background: #ff3b30;
	color: #ffffff;
	font-size: 20rpx;
	box-sizing: border-box;
	z-index: 1;
}

.user-card {
	display: flex;
	align-items: flex-start;
}

.user-avatar,
.order-avatar {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 24rpx;
	background: #eef4ff;
	flex-shrink: 0;
	overflow: hidden;
}

.user-avatar {
	margin-right: 20rpx;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.user-main,
.order-main {
	flex: 1;
	min-width: 0;
}

.user-title-row,
.order-title-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.user-name,
.order-name {
	margin-right: 12rpx;
	font-size: 31rpx;
	font-weight: 700;
	color: #182338;
	max-width: 220rpx;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.user-age,
.order-age {
	margin-right: 10rpx;
	font-size: 24rpx;
	color: #8b95a9;
}

.user-title-row ::v-deep .u-tag,
.order-title-row ::v-deep .u-tag {
	margin-right: 8rpx;
	margin-top: 4rpx;
}

.meta-row,
.message-row,
.order-info-row,
.service-time {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-top: 12rpx;
}

.meta-text,
.message-text,
.order-info-text,
.service-time text {
	margin-left: 8rpx;
	font-size: 24rpx;
	color: #677085;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.message-row {
	justify-content: space-between;
}

.message-row .message-text {
	flex: 1;
	margin-right: 16rpx;
}

.message-time {
	font-size: 21rpx;
	color: #a1aabc;
	flex-shrink: 0;
}

.order-header {
	display: flex;
	align-items: flex-start;
}

.order-avatar {
	margin-right: 20rpx;
}

.order-title-row {
	padding-right: 10rpx;
}

.service-time {
	margin-top: 14rpx;
}

.service-time text {
	color: #2563ff;
	font-weight: 500;
}

.order-header ::v-deep .u-button {
	flex-shrink: 0;
	margin-left: 12rpx;
}

.order-info-row {
	margin-top: 18rpx;
}

.order-info-text {
	flex: 1;
}

.action-row {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 22rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f2f7;
}

.record-popup {
	padding: 32rpx 28rpx calc(36rpx + env(safe-area-inset-bottom));
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	box-sizing: border-box;
}

.popup-title {
	margin-bottom: 28rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: 700;
	color: #182338;
}

.form-label {
	margin: 20rpx 0 12rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: #384256;
}

.form-textarea {
	width: 100%;
	height: 168rpx;
	padding: 20rpx;
	font-size: 26rpx;
	color: #263247;
	background: #f7f9fc;
	border-radius: 18rpx;
	box-sizing: border-box;
}

.form-textarea.small {
	height: 120rpx;
}

.selector-row {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
}

.selector-item {
	padding: 12rpx 24rpx;
	font-size: 24rpx;
	color: #5e687c;
	border: 1rpx solid #dce2ee;
	border-radius: 999rpx;
	background: #ffffff;
}

.selector-item.active {
	color: #2563ff;
	border-color: #2563ff;
	background: #eef4ff;
}

.popup-actions {
	display: flex;
	gap: 20rpx;
	margin-top: 34rpx;
}

.popup-btn {
	flex: 1;
}
</style>
