<template>
	<view class="page-doctor-index">
		<view class="top-panel">
			<view class="header">
				<view class="header-info">
					<view class="title-wrap">
						<view class="icon-doc"></view>
						<view class="title">医生工作台</view>
					</view>
					<view class="sub-title">术后患者全流程管理</view>
				</view>
				<!-- <view class="patient-count">
          <text class="count-num">{{ total }}</text>
          <text class="count-label">位患者</text>
        </view> -->
			</view>
			<view class="patient-count">
				<text class="count-label">当前医生账号仅展示绑定到该医生的用户与健康管理群，已显示 </text>
				<text class="count-num">{{ total }}</text>
				<text class="count-label">位患者</text>
			</view>
			<view class="search-wrap">
				<u-icon name="search" color="#98a2b3" size="21"></u-icon>
				<input v-model="keyword" class="search-input" placeholder="搜索患者姓名、手机号、手术名称"
					placeholder-class="search-placeholder" confirm-type="search" @input="onSearchInput"
					@confirm="resetAndLoad" />
				<view v-if="keyword" class="search-clear" @click="clearKeyword">
					<u-icon name="close-circle-fill" color="#c0c6d2" size="18"></u-icon>
				</view>
			</view>

			<view class="filter-row">
				<picker mode="selector" :range="sortNames" :value="sortIndex" @change="onSortChange">
					<view class="filter-item">
						<u-icon :name="sort === 'desc' ? 'arrow-down' : 'arrow-up'" color="#2563eb" size="16"></u-icon>
						<text class="filter-text">{{ sort === 'desc' ? '手术日期倒序' : '手术日期正序' }}</text>
					</view>
				</picker>
				<picker mode="selector" :range="departmentNames" :value="departmentIndex" @change="onDepartmentChange">
					<view class="filter-item">
						<u-icon name="home" color="#2563eb" size="16"></u-icon>
						<text class="filter-text">{{ currentDepartmentName }}</text>
						<u-icon name="arrow-down" color="#667085" size="13"></u-icon>
					</view>
				</picker>

			</view>

			<view class="date-row">
				<view class="quick-date-list">
					<view v-for="item in quickDateOptions" :key="item.value" class="time-tab-item"
						:class="{ active: timeType === item.value }" @click="selectQuickDate(item.value)">
						{{ item.label }}
					</view>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="patient-scroll" refresher-enabled :refresher-triggered="refreshing"
			@refresherrefresh="handlePatientRefresh" @scrolltolower="loadMorePatients">
			<view class="list-tip">
				<text>共 {{ total }} 位患者记录</text>
				<!-- <text class="right">按 surgery_date {{ sort === 'desc' ? '倒序' : '正序' }}</text> -->
			</view>

			<view v-if="listLoading && page === 1" class="state-card">
				<u-loading-icon mode="circle" color="#2563eb" size="28"></u-loading-icon>
				<text>患者列表加载中...</text>
			</view>

			<view v-else-if="!patientList.length" class="state-card empty-card">
				<u-icon name="account" color="#cbd5e1" size="48"></u-icon>
				<text class="empty-title">暂无符合条件的患者</text>
				<text class="empty-desc">可调整搜索词、科室或手术日期后重试</text>
			</view>

			<template v-else>
				<view class="patient-item" v-for="item in patientList" :key="item.id">
					<view class="patient-card-head">
						<view class="left-avatar">
							<image v-if="item.avatar" :src="item.avatar" mode="aspectFill" class="avatar-img"></image>
							<text v-else class="avatar-text">{{ item.avatarText }}</text>
						</view>
						<view class="patient-base">
							<view class="name-row">
								<text class="name">{{ item.name }}</text>
								<text v-if="item.genderText" class="gender">{{ item.genderText }}</text>
								<text v-if="item.ageText" class="age">{{ item.ageText }}</text>
							</view>
							<view class="patient-meta">
								<text v-if="item.departmentName">{{ item.departmentName }}</text>
								<text v-if="item.inpatientNo">住院号：{{ item.inpatientNo }}</text>
							</view>
						</view>
						<button class="btn-chat" @click="showMessage(item)">查看沟通记录</button>
						<button class="btn-chat" @click="showNote(item)">客服留言</button>

					</view>

					<view class="surgery-name">{{ item.surgeryType || '手术方式待补充' }}</view>
					<view v-if="item.diagnosis" class="diagnosis">诊断：{{ item.diagnosis }}</view>

					<view class="card-footer">
						<view class="time-row">
							<u-icon name="clock" color="#667085" size="15"></u-icon>
							<text>手术时间：{{ item.surgeryDate || '待补充' }}</text>
						</view>
						<view class="btn-archive" @click="routeTo(item.id)">
							<text>查看详情报告</text>
							<u-icon name="arrow-right" color="#2563eb" size="14"></u-icon>
						</view>
					</view>
				</view>

				<u-loadmore :status="loadmoreStatus" loadmore-text="上拉加载更多" loading-text="正在加载..." nomore-text="没有更多患者了"
					@loadmore="loadMorePatients"></u-loadmore>
			</template>
		</scroll-view>

		<message-pop v-if="messagePopupVisible" role="DOCTOR" :patient-id="activePatientId"
			:conversation-id="activePatientId" :current-user-id="currentUserId" :show-input="false"
			@close="closeMessagePopup"></message-pop>

		<u-popup :show="customDateVisible" mode="center" :round="32" :zIndex="10090"
			:overlayStyle="{ zIndex: 10080, backgroundColor: 'rgba(15, 23, 42, 0.45)' }" :safeAreaInsetBottom="false"
			:closeOnClickOverlay="true" @close="closeCustomDatePopup">
			<view class="custom-date-modal" @click.stop>
				<view class="custom-date-header">
					<text class="custom-date-title">自定义手术时间范围</text>
					<view class="custom-date-close" @click="closeCustomDatePopup">
						<u-icon name="close" color="#98a2b3" size="20"></u-icon>
					</view>
				</view>

				<view class="custom-date-field">
					<text class="custom-date-label">起始日期</text>
					<picker mode="date" :value="customFrom" :end="customTo || today" @change="onCustomFromChange">
						<view class="custom-date-input">
							<text>{{ formatDateDisplay(customFrom) }}</text>
							<u-icon name="calendar" color="#1f2937" size="25"></u-icon>
						</view>
					</picker>
				</view>

				<view class="custom-date-field">
					<text class="custom-date-label">截止日期</text>
					<picker mode="date" :value="customTo" :start="customFrom" :end="today" @change="onCustomToChange">
						<view class="custom-date-input">
							<text>{{ formatDateDisplay(customTo) }}</text>
							<u-icon name="calendar" color="#1f2937" size="25"></u-icon>
						</view>
					</picker>
				</view>

				<view class="custom-date-actions">
					<view class="custom-date-cancel" @click="closeCustomDatePopup">取消</view>
					<view class="custom-date-confirm" @click="confirmCustomDate">确认筛选</view>
				</view>
			</view>
		</u-popup>
		<u-popup :show="showPopup" mode="center" border-radius="24rpx" width="90%" closeable @close="showPopup = false">
			<view class="msg-popup-wrap">
				<!-- 标题区域 -->
				<view class="popup-header">
					<view class="header-left">
						<u-icon name="file-text" color="#ff9500" size="40rpx"></u-icon>
						<view class="header-title">
							<view class="main-title">客服给医生的关键问题留言</view>
							<view class="popup-sub-title">{{patientName}} · PC 端客服沟通同步</view>
						</view>
					</view>
					<u-icon name="close" size="30rpx" @click="showPopup = false"></u-icon>
				</view>

				<!-- 留言列表 -->
				<scroll-view scroll-y class="msg-list">
					<view v-if="doctorMessage && doctorMessage.length > 0">
						<view class="msg-item" :class="{ 'item-warning': item.priority === 'IMPORTANT' }"
							v-for="(item,idx) in doctorMessage" :key="idx">
							<view class="item-top">
								<view class="sender-wrapper">
									<view class="sender">{{item.noteBy}}</view>
									<view class="tag tag-mini" :class="{ 'tag-warn': item.priority === 'IMPORTANT' }">
										{{ priorityMap[item.priority] || item.priority }}
									</view>
								</view>
								<view class="time">{{ formatDate(item.noteTime) }}</view>
							</view>
							<view class="item-content">{{ item.question }}</view>
							<view class="item-bottom">


								<view class="note-btn" @click="handleMarkReply(idx)">
									标记已回复
								</view>
							</view>
						</view>
					</view>
					<!-- 空状态 -->
					<view v-else class="empty-wrap">
						<u-icon name="chat" color="#ccc" size="80rpx"></u-icon>
						<view class="empty-text">暂无医生留言</view>
					</view>

				</scroll-view>

				<!-- 底部提示 + 知道了按钮 -->
				<view class="popup-footer">
					<view class="tip-text">留言仅用于医生团队内部处理，不影响群聊公开记录</view>
					<view class="button-blue" @click="showPopup = false">
            知道了
          </view>       
				</view>
			</view>
		</u-popup>


		<myTabbar :current="1"></myTabbar>
	</view>
</template>

<script>
	import myTabbar from '@/components/myTabbar.vue'
	import MessagePop from '@/components/pop/messagePop.vue'
	import {
		getDoctorPatientsApi,
		getDictDepartmentsApi,
		getPatientsByIdDoctorNotesApi
	} from '@/api/frontApikit.js'

	export default {
		components: {
			myTabbar,
			MessagePop
		},
		data() {
			return {
        patientName:"",
				showPopup: false,
				doctorMessage: [],
				userInfo: {},
				keyword: '',
				departmentId: '',
				departmentList: [{
					id: '',
					name: '全部科室'
				}],
				departmentIndex: 0,
				from: '',
				to: '',
				customFrom: '',
				customTo: '',
				customDateVisible: false,
				today: '',
				sort: 'desc',
				sortIndex: 0,
				sortNames: ['手术日期倒序', '手术日期正序'],
				quickDateOptions: [{
						value: 'all',
						label: '全部'
					},
					{
						value: '7d',
						label: '近7天'
					},
					{
						value: '30d',
						label: '近30天'
					},
					{
						value: 'custom',
						label: '自定义'
					}
				],
				timeType: 'all',
				page: 1,
				pageSize: 20,
				patientList: [],
				total: 0,
				hasMore: false,
				listLoading: false,
				refreshing: false,
				searchTimer: null,
				messagePopupVisible: false,
				activePatientId: ''
			}
		},
		computed: {
			priorityMap() {
				return {
					NORMAL: '普通留言',
					IMPORTANT: '需重点关注'
				}
			},
			departmentNames() {
				return this.departmentList.map(item => item.name || item.departmentName || '未命名科室')
			},
			currentDepartmentName() {
				return this.departmentNames[this.departmentIndex] || '全部科室'
			},
			currentUserId() {
				return this.userInfo.id || this.userInfo.userId || this.userInfo.doctorId || ''
			},
			loadmoreStatus() {
				if (this.listLoading) return 'loading'
				return this.hasMore ? 'loadmore' : 'nomore'
			}
		},
		onLoad() {
			this.userInfo = this.readCurrentUser()
			this.today = this.formatDate(new Date())
			this.bootstrap()
		},
		onReachBottom() {
			this.loadMorePatients()
		},
		onPullDownRefresh() {
			this.handlePatientRefresh()
		},
		beforeDestroy() {
			this.clearSearchTimer()
		},
		methods: {
			showNote(item) {
				console.log(item)
				this.showPopup = true;
				this.getPatientsByIdDoctorNotes(item)
			},
			async bootstrap() {
				await Promise.all([
					this.loadDepartments(),
					this.loadPatients(true)
				])
			},
			handleMarkReply(index) {
				// 标记已回复逻辑
				console.log('标记回复：', index)
			},
			async getPatientsByIdDoctorNotes(item) {
				try {
					// console.log(item)
          this.patientName = item.name
					const result = await getPatientsByIdDoctorNotesApi({
						patientId: item.id
					})
         
					this.doctorMessage = result.list;
					console.log(22222222222, this.doctorMessage )

				} catch (error) {
					console.log(error)
				}
			},

			readCurrentUser() {
				try {
					const raw = uni.getStorageSync('userInfo')
					if (!raw) return {}
					return typeof raw === 'string' ? JSON.parse(raw) : raw
				} catch (error) {
					return {}
				}
			},

			async loadDepartments() {
				try {
					const result = await getDictDepartmentsApi({})
					const list = this.extractList(result)
					const options = [{
						id: '',
						name: '全部科室'
					}].concat(
						list.map((item, index) => this.normalizeDepartment(item, index)).filter(item => item.name)
					)
					this.departmentList = this.uniqueById(options)
					this.syncDepartmentIndex()
				} catch (error) {
					this.departmentList = [{
						id: '',
						name: '全部科室'
					}]
					this.departmentIndex = 0
				}
			},

			normalizeDepartment(item, index) {
				const source = item || {}
				return {
					id: source.id || source.departmentId || source.value || '',
					name: source.name || source.departmentName || source.title || `科室${index + 1}`
				}
			},

			uniqueById(list) {
				const exists = {}
				return list.filter(item => {
					const key = item.id === undefined || item.id === null || item.id === '' ?
						`name_${item.name}` :
						String(item.id)
					if (exists[key]) return false
					exists[key] = true
					return true
				})
			},

			syncDepartmentIndex() {
				const index = this.departmentList.findIndex(item => String(item.id) === String(this.departmentId || ''))
				this.departmentIndex = index > -1 ? index : 0
			},

			async loadPatients(reset) {
				if (this.listLoading) return
				if (reset) {
					this.page = 1
					this.hasMore = false
				}
				this.listLoading = true
				try {
					const result = await getDoctorPatientsApi(this.buildQuery())
					const pageData = this.normalizePageResult(result)
					const nextList = pageData.list.map((item, index) => this.normalizePatient(item, index))
					this.patientList = this.page === 1 ? nextList : this.patientList.concat(nextList)
					this.total = pageData.total
					this.hasMore = nextList.length > 0 && this.patientList.length < this.total
				} catch (error) {
					if (this.page > 1) this.page -= 1
					this.hasMore = false
					uni.showToast({
						title: '患者列表加载失败',
						icon: 'none'
					})
				} finally {
					this.listLoading = false
					this.refreshing = false
					uni.stopPullDownRefresh()
				}
			},

			buildQuery() {
				return {
					keyword: this.keyword.trim(),
					departmentId: this.departmentId || '',
					from: this.from || '',
					to: this.to || '',
					sort: this.sort || 'desc',
					page: this.page,
					pageSize: this.pageSize
				}
			},

			normalizePageResult(result) {
				const data = result || {}
				if (Array.isArray(data)) return {
					list: data,
					total: data.length
				}
				const list = this.extractList(data)
				let total = this.toNumber(
					data.total !== undefined ? data.total :
					data.totalCount !== undefined ? data.totalCount :
					data.count !== undefined ? data.count :
					data.pagination && data.pagination.total
				)
				if (!total && list.length) {
					const pageSize = Math.max(
						this.toNumber(data.pageSize || (data.pagination && data.pagination.pageSize)),
						this.pageSize
					)
					const currentPage = Math.max(
						this.toNumber(data.page || (data.pagination && data.pagination.page) || this.page),
						1
					)
					total = list.length < pageSize ?
						(currentPage - 1) * pageSize + list.length :
						currentPage * pageSize + 1
				}
				return {
					list,
					total
				}
			},

			extractList(data) {
				if (Array.isArray(data)) return data
				if (!data) return []
				const keys = ['list', 'records', 'rows', 'items', 'patients', 'data', 'content']
				for (let i = 0; i < keys.length; i += 1) {
					if (Array.isArray(data[keys[i]])) return data[keys[i]]
				}
				if (data.page && Array.isArray(data.page.list)) return data.page.list
				return []
			},

			normalizePatient(item, index) {
				const source = item || {}
				const gender = source.gender || source.sex || source.genderText || ''
				const genderText = gender === 'MALE' || gender === 1 || gender === '男' ?
					'男' :
					gender === 'FEMALE' || gender === 2 || gender === '女' ?
					'女' :
					gender
				const age = this.toNumber(source.age)
				const name = source.name || source.patientName || source.nickname || `患者${index + 1}`
				return Object.assign({}, source, {
					id: source.id || source.patientId || source.userId || '',
					name,
					avatarText: name.charAt(0),
					avatar: source.avatar || source.avatarUrl || source.headImg || '',
					genderText,
					age,
					ageText: age ? `${age}岁` : '',
					departmentName: source.departmentName || source.deptName || source.department || '',
					inpatientNo: source.inpatientNo || source.hospitalNo || source.admissionNo || source
						.patientNo || '',
					surgeryType: source.surgeryType || source.surgeryName || source.operationType || source
						.operationName || '',
					surgeryDate: this.formatDate(source.surgeryDate || source.surgeryTime || source.operationDate),
					diagnosis: source.diagnosis || source.diagnosisName || source.mainDiagnosis || ''
				})
			},

			resetAndLoad() {
				this.loadPatients(true)
			},

			onSearchInput() {
				this.clearSearchTimer()
				this.searchTimer = setTimeout(() => {
					this.resetAndLoad()
				}, 350)
			},

			clearKeyword() {
				this.keyword = ''
				this.resetAndLoad()
			},

			clearSearchTimer() {
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
			},

			onSortChange(e) {
				this.sortIndex = Number(e.detail.value)
				this.sort = this.sortIndex === 0 ? 'desc' : 'asc'
				this.resetAndLoad()
			},

			onDepartmentChange(e) {
				this.departmentIndex = Number(e.detail.value)
				const department = this.departmentList[this.departmentIndex] || {}
				this.departmentId = department.id || ''
				this.resetAndLoad()
			},

			selectQuickDate(value) {
				if (value === 'custom') {
					this.openCustomDatePopup()
					return
				}
				this.timeType = value
				const range = this.getQuickDateRange(value)
				this.from = range.from
				this.to = range.to
				this.resetAndLoad()
			},

			openCustomDatePopup() {
				this.customFrom = this.from || this.getMonthStartDate()
				this.customTo = this.to || this.today
				this.customDateVisible = true
			},

			closeCustomDatePopup() {
				this.customDateVisible = false
			},

			onCustomFromChange(e) {
				this.customFrom = e.detail.value
				if (this.customTo && this.customFrom > this.customTo) {
					this.customTo = this.customFrom
				}
			},

			onCustomToChange(e) {
				this.customTo = e.detail.value
				if (this.customFrom && this.customTo < this.customFrom) {
					this.customFrom = this.customTo
				}
			},

			confirmCustomDate() {
				if (!this.customFrom || !this.customTo) {
					uni.showToast({
						title: '请选择完整日期范围',
						icon: 'none'
					})
					return
				}
				if (this.customFrom > this.customTo) {
					uni.showToast({
						title: '起始日期不能晚于截止日期',
						icon: 'none'
					})
					return
				}
				this.timeType = 'custom'
				this.from = this.customFrom
				this.to = this.customTo
				this.customDateVisible = false
				this.resetAndLoad()
			},

			getQuickDateRange(value) {
				if (value === 'all') return {
					from: '',
					to: ''
				}
				const days = value === '7d' ? 7 : 30
				const start = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
				return {
					from: this.formatDate(start),
					to: this.formatDate(new Date())
				}
			},

			handlePatientRefresh() {
				this.refreshing = true
				this.page = 1
				this.loadPatients(true)
			},

			loadMorePatients() {
				if (this.listLoading || !this.hasMore || this.messagePopupVisible) return
				this.page += 1
				this.loadPatients(false)
			},

			showMessage(patient) {
				const item = patient || {}
				this.activePatientId = item.id || item.patientId || ''
				if (!this.activePatientId) {
					uni.showToast({
						title: '患者ID缺失，无法查看沟通记录',
						icon: 'none'
					})
					return
				}
				this.messagePopupVisible = true
			},

			closeMessagePopup() {
				this.messagePopupVisible = false
				this.activePatientId = ''
			},

			toNumber(value) {
				const number = Number(value)
				return Number.isFinite(number) ? number : 0
			},

			formatDate(value) {
				if (!value) return ''
				if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
				const date = new Date(value)
				if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				return `${year}-${month}-${day}`
			},

			getMonthStartDate() {
				const date = new Date()
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
			},

			formatDateDisplay(value) {
				return value ? value.replace(/-/g, '/') : ''
			},

			routeTo(patientId) {
				uni.navigateTo({
					url: `/pages/index/myHealthRecord?id=${patientId}`
				})
			}
		}
	}
</script>

<style scoped>
	.page-doctor-index {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f5f7fb;
		overflow: hidden;
	}

	.top-panel {
		flex-shrink: 0;
		padding: calc(20rpx + env(safe-area-inset-top)) 24rpx 18rpx;
		background: #f5f7fb;
		box-sizing: border-box;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18rpx;
	}

	.header-info {
		flex: 1;
		min-width: 0;
	}

	.title-wrap {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.icon-doc {
		width: 12rpx;
		height: 36rpx;
		border-radius: 8rpx;
		background: #2563eb;
	}

	.title {
		font-size: 38rpx;
		font-weight: 700;
		color: #172033;
	}

	.sub-title {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #909399;
	}

	.patient-count {
		/* width: 104rpx;
  height: 82rpx; */
		padding: 20rpx;
		border-radius: 18rpx;
		background: #eaf2ff;
		/* display: flex;
  flex-direction: column; */
		/* align-items: center;
  justify-content: center;
  flex-shrink: 0; */
		margin-bottom: 20rpx;

	}

	.count-num {
		font-size: 32rpx;
		line-height: 36rpx;
		font-weight: 700;
		color: #2563eb;
	}

	.count-label {
		margin-top: 2rpx;
		font-size: 20rpx;
		color: #2563eb;
	}

	.search-wrap {
		height: 76rpx;
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 10rpx;
		padding: 0 24rpx;
		margin-bottom: 16rpx;
		box-sizing: border-box;
	}

	.search-input {
		flex: 1;
		height: 76rpx;
		margin: 0 12rpx;
		font-size: 27rpx;
		color: #172033;
	}

	.search-placeholder {
		color: #98a2b3;
	}

	.search-clear {
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-row {
		display: flex;
		gap: 16rpx;
		margin-bottom: 14rpx;
	}

	.filter-item {
		flex: 1;
		min-width: 0;
		height: 64rpx;
		background: #fff;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: start;
		padding: 0 14rpx;
		box-sizing: border-box;
	}

	.filter-text {
		max-width: 210rpx;
		margin: 0 6rpx;
		font-size: 24rpx;
		color: #344054;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.date-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.quick-date-list {
		display: flex;
		flex: 1;
		gap: 10rpx;
	}

	.time-tab-item {
		flex: 1;
		height: 52rpx;
		line-height: 52rpx;
		text-align: center;
		background: #fff;
		border-radius: 10rpx;
		font-size: 23rpx;
		color: #667085;
		box-sizing: border-box;
	}

	.time-tab-item.active {
		background: #2563eb;
		color: #fff;
	}

	.patient-scroll {
		flex: 1;
		/* min-height: 0; */
		padding: 0 24rpx 150rpx;
		box-sizing: border-box;
	}

	.custom-date-modal {
		width: 650rpx;
		padding: 40rpx 30rpx;
		background: #fff;
		border-radius: 32rpx;
		box-sizing: border-box;
	}

	.custom-date-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 38rpx;
	}

	.custom-date-title {
		font-size: 30rpx;
		line-height: 44rpx;
		font-weight: 700;
		color: #111827;
	}

	.custom-date-close {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.custom-date-field {
		margin-bottom: 28rpx;
	}

	.custom-date-label {
		display: block;
		margin-bottom: 12rpx;
		font-size: 24rpx;
		line-height: 36rpx;
		/* font-weight: 600; */
		color: #667085;
	}

	.custom-date-input {
		height: 80rpx;
		padding: 0 30rpx;
		border-radius: 20rpx;
		background: #f8fafc;
		border: 1rpx solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		font-size: 24rpx;
		color: #111827;
	}

	.custom-date-actions {
		display: flex;
		gap: 24rpx;
		margin-top: 44rpx;
	}

	.custom-date-cancel,
	.custom-date-confirm {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 20rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: 600;
		box-sizing: border-box;
	}

	.custom-date-cancel {
		color: #4b5563;
		background: #fff;
		border: 1rpx solid #e5e7eb;
	}

	.custom-date-confirm {
		color: #fff;
		background: #2563eb;
		box-shadow: 0 10rpx 22rpx rgba(37, 99, 235, 0.18);
	}

	.list-tip {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4rpx 4rpx 16rpx;
		font-size: 23rpx;
		color: #98a2b3;
	}

	.list-tip .right {
		color: #b0b8c8;
	}

	.state-card {
		margin-top: 40rpx;
		padding: 60rpx 30rpx;
		background: #fff;
		border-radius: 18rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #667085;
		font-size: 26rpx;
	}

	.empty-title {
		margin-top: 20rpx;
		font-size: 30rpx;
		color: #344054;
	}

	.empty-desc {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #98a2b3;
	}

	.patient-item {
		background: #fff;
		border-radius: 18rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		margin-bottom: 18rpx;
		box-shadow: 0 8rpx 24rpx rgba(31, 41, 55, 0.04);
	}

	.patient-card-head {
		display: flex;
		align-items: center;
	}

	.left-avatar {
		width: 84rpx;
		height: 84rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #eaf2ff, #dfeaff);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.avatar-img {
		width: 84rpx;
		height: 84rpx;
	}

	.avatar-text {
		font-size: 34rpx;
		color: #2563eb;
		font-weight: 600;
	}

	.patient-base {
		flex: 1;
		min-width: 0;
		margin-left: 18rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.name {
		max-width: 220rpx;
		font-size: 31rpx;
		font-weight: 700;
		color: #172033;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.gender {
		font-size: 22rpx;
		color: #667085;
	}

	.age {
		font-size: 22rpx;
		color: #667085;
	}

	.patient-meta {
		margin-top: 8rpx;
		display: flex;
		align-items: center;
		gap: 14rpx;
		font-size: 22rpx;
		color: #98a2b3;
		overflow: hidden;
		white-space: nowrap;
	}

	.btn-chat {
		flex-shrink: 0;
		margin-left: 12rpx;
		height: 56rpx;
		line-height: 56rpx;
		padding: 0 18rpx;
		font-size: 18rpx;
		color: #fff;
		background: #2563eb;
		border-radius: 10rpx;
		border: 0;
	}

	.btn-chat::after {
		border: 0;
	}

	.surgery-name {
		margin-top: 18rpx;
		font-size: 27rpx;
		color: #344054;
		line-height: 1.5;
	}

	.diagnosis {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #667085;
		line-height: 1.5;
	}

	.card-footer {
		margin-top: 18rpx;
		padding-top: 18rpx;
		border-top: 1rpx solid #edf1f7;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
	}

	.time-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
		min-width: 0;
		font-size: 23rpx;
		color: #666;
		white-space: nowrap;
	}

	.btn-archive {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 23rpx;
		color: #2563eb;
	}

	.filter-row uni-picker {
		flex: 1;
	}

	.msg-popup-wrap {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		max-height: 80vh;
		width: 90vw;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 32rpx;
		padding-bottom: 20rpx;
	}

	.header-left {
		display: flex;
		gap: 16rpx;
	}

.popup-header	.main-title {
		font-size: 30rpx;
   
		font-weight: 600;
		color: #222;
	}

	.popup-sub-title {
		font-size: 22rpx;
		color: #909399;
		margin-top: 12rpx;
    text-align: left;
	}

	.msg-list {

		padding: 0 30rpx;
		width: calc(100% - 60rpx);
		flex: 1;
		max-height: 50vh;
	}

	.msg-item {
		background-color: #f8f8f8;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.item-warning {
		background-color: #fff9e6;
		border: 1rpx solid #ffe6a0;
	}

	.item-top {
		display: flex;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.sender {
		font-size: 30rpx;
		font-weight: 500;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.item-content {
		font-size: 28rpx;
		line-height: 1.6;
		color: #333;
		margin-bottom: 20rpx;
	}

	.item-bottom {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.tag {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		background: #eee;
		color: #666;
	}

	.tag-warn {
		background: #ffd266;
		color: #994b00;
	}

	.popup-footer {
		padding: 24rpx 32rpx 32rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #888;
		margin-bottom: 24rpx;
	}

	.note-btn {
		color: #155DFC;
		font-size: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		padding: 10rpx 20rpx;
    border: 1px solid #155DFC;
	}

	.empty-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;

	}

	.empty-text {
		margin-top: 16rpx;
		color: #999;
		font-size: 28rpx;
	}
  .sender-wrapper{
    display: flex;
    justify-content: flex-start;
    gap:10rpx
  }
</style>