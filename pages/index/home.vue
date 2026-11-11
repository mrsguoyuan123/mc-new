<template>
	<page-meta :root-font-size="fontsize + 'px'"></page-meta>
	<view class="page-content page-home	">


		<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between"
			@click="routeTo('profile')">

			<view class="u-flex ">
				<view class="view-icon no-border">
					<u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="view-text">
					<view class=" font-m">
						{{ archivePatient.name }}
					</view>
					<view class="font-s">
						{{ archivePatient.surgeryType }}
					</view>
				</view>

			</view>
			<view class="view-icon-circle">
				<u-icon name="arrow-right" color="#909399" size="20rpx"></u-icon>
			</view>

		</view>
		<view class="button-wrapper">
			<view class="radius-15 card-top card-bg card-blue" @click="routeTo('consultation')">
				<view class="view-icon bg-blue">
					<u-icon name="chat" color="white" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="text-white">
					<view class="white-text1">
						在线咨询


					</view>
					<view class="white-text2">
						专属医助服务
					</view>
				</view>
				<u-badge :value="userUnreadMessages" :max="99" type="error" class=""></u-badge>

			</view>
			<view class="radius-15 card-top card-bg  card-green" @click="routeTo('healthCenter')">
				<view class="view-icon">
					<u-icon name="heart" color="white" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="text-white">
					<view class="white-text1">
						健康管理中心
					</view>
					<view class="white-text2">
						全方位健康管理
					</view>
				</view>
				<u-badge :value="userHealthAlertCount" :max="99" type="error" class=""></u-badge>

			</view>

		</view>
		<medical-record @loaded="onArchiveLoaded"></medical-record>
		<view class="bg-chart bg-white radius-15 card-top card-border card-border-gray" style="display:block">
			<view class=" font-bold font-m margin-bottom-1">
				健康数据速览
			</view>
			<view class="stat-card-wrap">
				<view class="card-row">
					<!-- 最近营养记录 -->
					<view class="stat-card radius-15">
						<view class="card-head">
							<view class="icon-box blue">
								<u-icon name="heart" color="#3677ff" size="30rpx"></u-icon>
							</view>
							<view class="card-title">最近营养记录</view>
						</view>
						<view class="card-value">

							{{ nutrition && nutrition.todayCalories }}kcal
						</view>
						<view class="card-desc">蛋白质占比
							{{ nutrition && nutrition.todayProtein }}
						</view>
					</view>
					<!-- 体重记录 -->
					<view class="stat-card radius-15">
						<view class="card-head">
							<view class="icon-box pink">
								<text class="custom-icon custom-icon-trending-down icon-bold"
									style="font-size:30rpx;color:#f6339a;"></text>

							</view>
							<view class="card-title">体重记录</view>
						</view>

						<view class="card-value">{{ monitor && monitor.weight && monitor.weight.weightKg || '' }} kg
						</view>
						<view class="card-desc u-flex">
							<text>近7天变化</text>

							<view class="font-bold font-s"
								:class="monitor && monitor.weight && monitor.weight.changeKg > 0 ? 'font-yellow' : 'font-pink'"
								style="margin-left: 10px;">

								{{ monitor && monitor.weight && monitor.weight.changeKg !== undefined ?
									(monitor.weight.changeKg
										> 0 ? '+' : '') + monitor.weight.changeKg + 'kg' : '-' }}
							</view>
						</view>
					</view>
				</view>
				<view class="card-row">
					<!-- 血压血糖 -->
					<view class="stat-card radius-15">
						<view class="card-head">
							<view class="icon-box green">
								<text class="custom-icon custom-icon-activity icon-bold"
									style="font-size:30rpx;color:#155DFC;"></text>
							</view>
							<view class="card-title">血压</view>
						</view>
						<view class="card-value">{{ monitor && monitor.bloodPressure && monitor.bloodPressure.sbp !==
							undefined ?
							monitor.bloodPressure.sbp : '-' }}/{{ monitor && monitor.bloodPressure &&
								monitor.bloodPressure.dbp !== undefined ? monitor.bloodPressure.dbp : '-' }}</view>
						<view class="card-desc">
							{{ monitor && monitor.bloodPressure && monitor.bloodPressure.level || '' }}
						</view>

					</view>
					<view class="stat-card radius-15">
						<view class="card-head">
							<view class="icon-box green">
								<text class="custom-icon custom-icon-activity icon-bold"
									style="font-size:30rpx;color:#155DFC;"></text>
							</view>
							<view class="card-title">血糖</view>
						</view>
						<view class="card-value">{{ monitor && monitor.bloodGlucose && monitor.bloodGlucose.value !==
							undefined ?
							monitor.bloodGlucose.value : '-' }}</view>
						<view class="card-desc">
							{{ monitor && monitor.bloodGlucose &&
								monitor.bloodGlucose.unit || '' }}
						</view>

					</view>

				</view>
				<view class="stat-card radius-15">
					<view class="card-head">
						<view class="icon-box yellow">
							<u-icon name="file-text" color="#f7b538" size="30rpx"></u-icon>
						</view>
						<view class="card-title">用药提醒</view>
					</view>
					<view class="my-badge">
						<view class="badge-item" v-for="item in (monitor && monitor.medicationToday) || []"
							:key="item.name">
							<view class="badge-left">
								<u-tag :text="item.name" type="primary" size="mini" plain plainFill
									style="margin-right: 8rpx;"></u-tag>
								<text class="time-wrapper" v-for="it in item.remindTimes">{{ it }}</text>
							</view>
							<u-tag :text="getCheckInStatusText(item.status)"
								:type="item.status === 'TAKEN' ? 'success' : 'warning'" size="mini" plain plainFill
								style="margin-right: 8rpx;">
							</u-tag>
						</view>


						<!-- 没有用药时显示 -->
						<text
							v-if="!((monitor && monitor.medicationToday && monitor.medicationToday.length) || 0)">暂无用药</text>
					</view>
				</view>
			</view>
			<!-- 用药提醒 -->

			<!-- <view class="chart-content">
				<view class="chart-item">
					<view class="chart-title">
						<view class="header-icon ">
							<text class="custom-icon custom-icon-activity icon-bold"
								style="font-size:30rpx;color:#155DFC;"></text>

							<view class="header-name font-bold font-s">
								血压点位
							</view>
						</view>
					</view>

					<view class="progress-content">
						<view>
							<view class="font-info font-s">舒张压</view>
							<u-line-progress
								:percentage="monitor && monitor.bloodPressure && monitor.bloodPressure.dbp ? getDbpPercent(monitor.bloodPressure.dbp) : 0"
								height="8" activeColor="#2b7fff" :showText="false"></u-line-progress>
						</view>
						<view>
							<view class="font-info font-s">收缩压</view>
							<u-line-progress
								:percentage="monitor && monitor.bloodPressure && monitor.bloodPressure.sbp ? getSbpPercent(monitor.bloodPressure.sbp) : 0"
								height="8" activeColor="#fdc700" :showText="false"></u-line-progress>
						</view>
						<view>
							<view class="font-info font-s">综合率</view>
							<u-line-progress :percentage="monitor && monitor.compositeRate ? monitor.compositeRate : 0"
								height="8" activeColor="#00c950" :showText="false"></u-line-progress>
						</view>
					</view>

				</view>
				<view class="chart-item">
					<view class="chart-title">
						<view class="header-icon ">
							<text class="custom-icon custom-icon-activity icon-bold"
								style="font-size:30rpx;color:#00c950;"></text>

							<view class="header-name font-bold  font-s">
								血糖体征
							</view>

						</view>

					</view>


					<view class="space-between align-start">
						<view class="font-info font-s">血压</view>
						<view class="font-bold font-s">
							{{ monitor && monitor.bloodPressure && monitor.bloodPressure.sbp !== undefined ?
								monitor.bloodPressure.sbp : '-' }}/{{ monitor && monitor.bloodPressure &&
								monitor.bloodPressure.dbp !== undefined ? monitor.bloodPressure.dbp : '-' }}
							<text class="font-info" style="margin-left:8rpx;">{{ monitor && monitor.bloodPressure &&
								monitor.bloodPressure.level || '' }}</text>
						</view>
					</view>
					<view class="space-between align-start">
						<view class="font-info font-s">血糖</view>
						<view class="font-bold font-s">
							{{ monitor && monitor.bloodGlucose && monitor.bloodGlucose.value !== undefined ?
								monitor.bloodGlucose.value : '-' }}
							<text class="font-info" style="margin-left:8rpx;">{{ monitor && monitor.bloodGlucose &&
								monitor.bloodGlucose.unit || '' }}</text>
						</view>
					</view>

				</view>
			</view>
			<view class=" bg-pink radius-15">
				<view class="chart-title">
					<view class="header-icon ">
						<text class="custom-icon custom-icon-trending-down icon-bold"
							style="font-size:30rpx;color:#f6339a;"></text>

						<view class="header-name font-bold font-s">
							体重运动趋势
						</view>
					</view>
				</view>
				<view class="u-flex space-between align-center">
					<u-line-progress
						:percentage="monitor && monitor.weight ? getWeightPercent(monitor.weight.changeKg) : 0"
						height="8"
						:activeColor="getWeightColor(monitor && monitor.weight ? monitor.weight.changeKg : 0)"
						:inactiveColor="monitor && monitor.weight && monitor.weight.changeKg > 0 ? '#fff2cc' : '#fccee8'"
						:showText="false"></u-line-progress>
					<view class="font-bold font-s"
						:class="monitor && monitor.weight && monitor.weight.changeKg > 0 ? 'font-yellow' : 'font-pink'"
						style="margin-left: 10px;">

						{{ monitor && monitor.weight && monitor.weight.changeKg !== undefined ? (monitor.weight.changeKg
							> 0 ? '+' : '') + monitor.weight.changeKg + 'kg' : '-' }}
					</view>
				</view>


			</view>
			<view class=" bg-yellow radius-15">
				<view class="chart-title">
					<view class="header-icon ">
						<u-icon name="file-text" color="#e7c174" :bold="true" size="30rpx"></u-icon>
						<view class="header-name font-bold font-s">
							今日服用
						</view>
					</view>
				</view>
				<view class="my-badge">
					<u-tag v-for="item in (monitor && monitor.medicationToday) || []" :key="item.name" :text="item.name"
						type="primary" size="mini" plain plainFill style="margin-right: 8rpx;"></u-tag>
					
					<text
						v-if="!((monitor && monitor.medicationToday && monitor.medicationToday.length) || 0)">暂无用药</text>
				</view>
			</view> -->

		</view>

		<view
			v-if="!escort || !escort.activeBooking">
			<view class="header-text">
				<view class="header-icon ">
					<text class="custom-icon custom-icon-user-check icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
					<view class="header-name font-bold font-m">
						陪诊师申请
					</view>
				</view>
				<view class="u-flex align-center">
					<view class="badge-bg  badge-blue-bg margin-right-1">
						剩余次数：{{ escort.escortCount }}次
					</view>
					<view class="font-blue font-s font-bold">
						上门服务
					</view>
				</view>

			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between"
				@click="routeTo('caregiverApply')">
				<view class="view-icon bg-blue-dark margin-right-10">
					<text class="custom-icon custom-icon-shield icon-bold" style="font-size:40rpx;color:white;"></text>
				</view>
				<view>

					<view class="view-text">
						<view class=" font-m font-bold">
							陪诊师上门服务
						</view>
						<view class="font-xs margin-15 margin-right-10 ">

							术后康复专项指导 · 居家生活护理 · 24h全天候陪伴
						</view>
					</view>
					<view class="badge-bg  badge-blue-bg">
						已有 1000+ 患者选择
					</view>
				</view>
				<view class="">
					<u-icon name="arrow-right" color="#909399" size="20rpx"></u-icon>
				</view>

			</view>

		</view>
		<view v-else>
			<view class="header-text">
				<view class="header-icon ">
					<text class="custom-icon custom-icon-user-check icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
					<view class="header-name font-bold font-m">
						当前陪诊服务
					</view>

				</view>
				<view class="u-flex align-center">
					<view class="badge-bg  badge-blue-bg  margin-right-10">
						剩余次数：{{ escort.escortCount }}次
					</view>
					<view class="font-blue font-s font-bold">
						执行中
					</view>
				</view>
			</view>
			
			<view class="staff-card radius-15 card-top bg-white card-border card-border-gray "
				@click="routeTo('caregiverOrder')">
				<view v-if="escort.activeBooking.caregiverInfo.avatar" class="avatar-wrap">
  <image class="avatar" :src="escort.activeBooking.caregiverInfo.avatar" mode="aspectFill"></image>
</view>
<view v-else class="avatar-wrap avatar-icon">
  <u-icon name="account" color="#fff" size="40rpx"></u-icon>
</view>
				<view class="info-wrap">
					<view class="font-m font-bold">照护师: {{ escort.activeBooking.caregiverInfo.name }}</view>
					<view class="time-row">
						<u-icon name="clock" color="#08b852" size="30rpx"></u-icon>
						<text>首日: {{ escort.activeBooking.caregiverInfo.date }}
							{{ getPeriodText(escort.activeBooking.caregiverInfo.period) }}</text>
					</view>
					<view class="tag">
						<u-icon name="checkmark-circle" color="#08b852" size="26rpx"></u-icon>
						<text>专业级保障中</text>
					</view>
				</view>
				<u-icon name="arrow-right" color="#999" size="34rpx"></u-icon>
			</view>

		</view>

		<view class="header-text">
			<view class="header-icon ">
				<u-icon name="heart" color="#fb2c36" :bold="true" size="40rpx"></u-icon>
				<view class="header-name font-bold font-m">
					术后健康知识库
				</view>
			</view>
			<view class="font-blue font-s font-bold" @click="showNotice = true">
				告知书
			</view>
		</view>
		<view v-for="item in articles" :key="item.id"
			class="my-article bg-white radius-15 card-border card-border-gray">
			<view class="u-flex align-center">
				<view class="img-wrapper">
					<image class="img-inner"
						:src="item.coverUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect fill=\'%23f5f5f5\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' fill=\'%23999\' font-size=\'18\' text-anchor=\'middle\' dy=\'.3em\'%3E暂无图片%3C/text%3E%3C/svg%3E'"
						:mode="item.coverUrl ? 'aspectFit' : 'aspectFill'"></image>
				</view>

				<view class="img-text" style="flex: 1; min-width: 0; margin-left:20rpx;">
					<view>
						<u-tag v-if="item.surgeryType" bgColor="#fef2f2" color="#fb2c36" borderColor="#fef2f2"
							:text="item.surgeryType" size="mini" plain-fill></u-tag>
					</view>
					<view class="font-bold font-s" style="margin: 10rpx 0;">
						{{ item.title || '-' }}
					</view>
					<view class="font-info font-s"
						style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
						{{ item.content || '' }}
					</view>
				</view>
			</view>
		</view>



		<!-- 告知书弹窗 -->
		<view class="notice-mask" v-if="showNotice" @click.self="showNotice = false">
			<view class="notice-card">
				<!-- 头部 -->
				<view class="notice-header">
					<view class="header-left">
						<view class="header-title-wrap">
							<view class="main-title">{{ getMeInformedConsent.title }}</view>
							<view class="sub-title">针对【{{ getMeInformedConsent.surgeryType }}】定制·临床康复指导</view>
						</view>
					</view>
					<view class="close-btn" @click="showNotice = false">×</view>
				</view>

				<!-- 顶部提示 -->
				<view class="tip-block">
					<text class="tip-icon">!</text>
					<text class="tip-text">重要提示：术后康复期请务必遵循主管医生与康复团队指导。如出现突发急性症状，请立即就近就医或联系在线医生。</text>
				</view>

				<!-- 章节1 -->
				<view class="section-block">
					<view class="section-title">
						<view class="blue-line"></view>
						<text>注意事项</text>
					</view>
					<view class="section-list">
						<view>
							{{ getMeInformedConsent.content }}
						</view>
					</view>
				</view>

				<!-- 底部来源 -->

				<!-- 确认按钮 -->
				<view class="confirm-btn" @click="MeInformedConsentByIdConfirm()">
					<text>我已阅读并知晓</text>
				</view>
			</view>
		</view>
		<myTabbar :current="0"></myTabbar>


	</view>

</template>


<script>
import {
	getMeHomeApi,
	getMeInformedConsentApi,
	getAppArticlesApi,
	postMeInformedConsentByIdConfirmApi,
	getNotificationsUnreadSummaryApi,
	getMeEscortCaregiversApi,
} from '@/api/frontApikit.js'

import myTabbar from '@/components/myTabbar.vue'
import medicalRecord from '@/components/medicalRecord.vue'



export default {
	options: {
		styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
	},
	components: {
		myTabbar,
		medicalRecord
	},
	data() {
		return {
			pendingReply: 0, // 待回复数量
			doctorMentionCount: 0, // 医生提及数
			doctorNoteCount: 0, // 医生备注数
			systemUnreadCount: 0, // 系统未读数
			userHealthAlertCount: 0, // 用户健康预警数
			userUnreadMessages: 0, // 用户未读消息数
			id: '',
			archivePatient: {},
			showNotice: false,
			caregiverOption: {},
			bgTextStyle: 'dark',
			scrollTop: '200rpx',
			bgColor: '#ff0000',
			bgColorTop: '#00ff00',
			bgColorBottom: '#0000ff',
			nbTitle: '标题',
			nbLoading: false,
			nbFrontColor: '#000000',
			nbBackgroundColor: '#ffffff',
			fontsize: 12,
			activeTab: 0,
			advisorCard: {},
			consentPending: {},
			escort: {},
			monitor: {},
			postopDays: {},
			articles: [],
			nutrition: {},
			getMeInformedConsent: {}
		};
	},

	onShow() {


	},
	onLoad(options) {
		const userInfo = this.readCurrentUser()
		this.id = userInfo.userId
		this.getData()
		this.getMeInformedConsentApi()
		this.getAppArticlesApi()
		this.getNotificationsUnreadSummary()

		// 1.先判断 data 是否存在，并且不是字符串"undefined"
		if (options.data && options.data !== "undefined") {
			try {
				const raw = decodeURIComponent(options.data)
				const obj = JSON.parse(raw);

				if (obj.dataName) {
					this.caregiverOption = obj
				}
			} catch (e) {
				console.error('JSON解析失败', e)
			}
		}



	},

	methods: {
		onArchiveLoaded(basic) {
			this.archivePatient = basic || {}
		},
		getCheckInStatusText(status) {
			const map = {
				PENDING: '今日提醒待完成',
				TAKEN: '今日已打卡完成'
			}
			return map[status] || status
		},

		async getNotificationsUnreadSummary() {
			try {
				const result = await getNotificationsUnreadSummaryApi({})
				console.log('未读消息', result)
				this.doctorMentionCount = result.doctorMentionCount //医生提及数
				this.doctorNoteCount = result.doctorNoteCount //医生备注数
				this.systemUnreadCount = result.systemUnreadCount //系统未读数
				this.userHealthAlertCount = result.userHealthAlertCount //用户健康预警数
				this.userUnreadMessages = result.userUnreadMessages //用户未读消息数

			} catch (e) {
				console.log('getList报错：', e)
			}
		},
		readCurrentUser() {
			try {
				const raw = uni.getStorageSync('userInfo')
				if (!raw) return {}
				return typeof raw === 'string' ? JSON.parse(raw) : raw
			} catch (error) {
				console.error('读取userInfo失败', error)
				return {}
			}
		},
		getPeriodText(val) {
			const map = {
				MORNING: '上午',
				AFTERNOON: '下午'
			}
			return map[val] || val
		},

		// 舒张压 60~90 → 0~100
		getDbpPercent(val) {
			let pct = (val - 60) / 30 * 100
			// 限制 0-100，防止超标
			return Math.max(0, Math.min(100, pct))
		},
		// 收缩压 90~140 → 0~100
		getSbpPercent(val) {
			let pct = (val - 90) / 50 * 100
			return Math.max(0, Math.min(100, pct))
		},
		getWeightPercent(changeVal) {
			// 区间：-5 ~ +5
			const min = -5
			const max = 5
			let pct = ((changeVal - min) / (max - min)) * 100
			return Math.max(0, Math.min(100, pct))
		},
		getWeightColor(val) {
			if (val > 0) {
				return '#fdc700' // 上涨黄色
			} else {
				return '#f6339a' // 下降粉色
			}
		},
		// 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书）
		async getData() {
			try {
				if (!this.id) {
					console.warn('id为空，跳过请求')
					return
				}
				const data = await getMeHomeApi({
					id: this.id
				})
				// console.log(' 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书）', data)

				// console.log('待确认告知书', data.consentPending)

				// console.log('术后天数', data.postopDays)
				this.postopDays = data.postopDays ?? null
				this.advisorCard = data.advisorCard || {}
				this.consentPending = data.consentPending || {}
				this.escort = data.escort || {}
				this.monitor = data.monitor || {}
				this.nutrition = this.monitor.nutrition || {}
				console.log('nutrition', this.nutrition)
			} catch (e) {
				console.log('报错：', e)
			}
		},
		// 我的告知书列表（按术式匹配，含已确认标记）
		async getMeInformedConsentApi() {
			try {
				if (!this.id) {
					console.warn('id为空，跳过请求')
					return
				}
				const getMeInformedConsent = await getMeInformedConsentApi({
					id: this.id
				})
				this.getMeInformedConsent = getMeInformedConsent[0]
				// console.log('getMeInformedConsent：', this.getMeInformedConsent)
			} catch (e) {
				console.log('报错：', e)
			}
		},
		// 确认告知书
		async MeInformedConsentByIdConfirm() {
			console.log(this.consentPending.id)
			try {
				if (!this.consentPending.id) {
					console.warn('id为空，跳过请求')
					return
				}
				await postMeInformedConsentByIdConfirmApi({
					id: this.consentPending.id
				})
				this.showNotice = false
			} catch (e) {
				console.log('报错：', e)
			}
		},
		// 资讯/健康文章/心理健康内容（C端公开，按科室+术式）
		async getAppArticlesApi() {

			try {

				const getAppArticles = await getAppArticlesApi()
				this.articles = getAppArticles.list
				// console.log('文章', this.articles)
			} catch (e) {
				console.log('报错：', e)
			}
		},


		// 个人健康档案 我的健康档案（基本信息+肿瘤标志物/血常规/肝功能 records+historyTrend）

		routeTo(res) {
			console.log(res)
			const data = {
				id: this.escort.dedicatedCaregiverId
			}
			console.log(this.escort)
			let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(data))
			this.$safeJump(routeUrl)
		},





	},


};
</script>

<style scoped>
.font-pink {
	color: #f6339a;
}

.font-yellow {
	color: #fdc700;
}


.staff-card {
	display: flex;
	align-items: center;
	padding: 36rpx 32rpx;
	background: #ffffff;
	border-radius: 40rpx;
	background-image: radial-gradient(circle at 95% 10%, #ecfcf0 0%, transparent 40%);

}

.staff-card .avatar {
	width: 140rpx;
	height: 140rpx;
	border-radius: 28rpx;
	margin-right: 28rpx;
}

.staff-card .info-wrap {
	flex: 1;
}

.staff-card .name-row {
	font-size: 42rpx;
	font-weight: bold;
	color: #111;
	margin-bottom: 12rpx;
}

.staff-card .time-row {
	display: flex;
	align-items: center;
	font-size: 25rpx;
	color: #089944;
	margin: 16rpx 0;
}

.staff-card .tag {
	display: flex;
	align-items: center;
	background: #ecfcf0;
	color: #089944;
	font-size: 28rpx;
	padding: 12rpx 20rpx;
	border-radius: 16rpx;
	width: fit-content;
}

.page-home {}

.page-home .view-icon {
	padding: 10px;
	border-radius: 15px;
	float: left;
}

.bg-chart .font-info {
	margin: 6px auto;
}

.my-article {
	padding: 20rpx;
	margin: 20rpx auto;
}

.bg-chart .bg-pink,
.bg-chart .bg-yellow {
	padding: 20rpx;
	margin: 20rpx auto;
}

.chart-title .header-icon {
	justify-content: start;
	margin: 10rpx auto;
}

.chart-content {
	display: flex;
	justify-content: space-between;
	flex-wrap: nowrap;
	align-items: start;
	margin: 10px 0;


}

.chart-content .chart-item {
	width: calc(50% - 10px);
}

.chart-content .space-between {
	margin: 10px auto;
}

.bg-chart {
	margin: 30rpx auto;
	padding: 30rpx;
}

.my-badge-center {
	display: flex;
	justify-content: center;
	flex-wrap: nowrap;
	align-items: center;
	margin: 10px 0;


}

.my-badge-center ::v-deep .u-transition {
	margin-right: 6px !important;
}

.my-badge {

	margin: 10px 0;


}

.badge-item {
	display: flex;
	justify-content: space-between;
	flex-wrap: nowrap;
	align-items: center;
	margin-bottom: 20rpx;
}

.my-badge ::v-deep .u-transition {
	margin-right: 6px !important;
}

.team-content {
	margin-top: 60rpx;
	width: 100%;
}

.my-team {
	position: relative;
	margin-top: 90rpx;
	background-color: white;
}

.team-icon.view-icon {
	background-color: #155dfc;
	border: 3px solid white;
	position: absolute;
	left: 50%;
	top: 0;
	transform: translate(-50%, -50%);
}

.card-green .view-icon {
	background-color: #33b865;
}

.card-blue .view-icon {
	background-color: #447dfd;
}

.card-green {
	background-color: #00a63e;
}

.card-blue {
	background-color: #155dfc;
	margin-right: 10px;
}

.button-wrapper {
	margin: 30rpx 0;
	display: flex;
	justify-content: space-between;
	flex-wrap: nowrap;
	align-items: center;
}

.view-icon-circle {
	border-radius: 100%;
	background-color: #f9fafb;
	width: 20rpx;
	height: 20rpx;
	padding: 16rpx;
}

.my-article {
	padding: 24rpx;
}

.img-wrapper {
	overflow: hidden;
	width: 150rpx;
	height: 150rpx;
	border-radius: 20rpx;
	margin-right: 10px;
	position: relative;
	flex-shrink: 0;


}

.img-wrapper .img-inner {
	width: 100%;
	height: 100%;
	max-height: 100%;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}

.img-text {
	width: calc(100% - 160rpx);
	flex: 1;
}

.img-text ::v-deep .u-tag--mini {
	width: fit-content;
}

.health-archive {
	position: relative;
	margin: 20rpx 0 30rpx;
}








































































.card-top {
	/* display: block; */
}

.notice-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	padding: 30rpx;
}

.notice-card {
	width: 100%;
	max-width: 680rpx;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-sizing: border-box;
	max-height: 90vh;
	overflow-y: auto;
}

.notice-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.header-left {
	display: flex;
	align-items: center;
}

.doc-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 16rpx;
	background-color: #1677ff;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-right: 20rpx;
}

.main-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #111;
}

.sub-title {
	font-size: 24rpx;
	color: #666;
	margin-top: 20rpx;
}

.close-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: #f5f7fa;
	text-align: center;
	line-height: 56rpx;
	font-size: 32rpx;
	color: #666;
}

.tip-block {
	background-color: #e8f3ff;
	border-radius: 12rpx;
	padding: 20rpx;
	display: flex;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.tip-icon {
	color: #1677ff;
	font-weight: bold;
}

.tip-text {
	font-size: 26rpx;
	color: #1677ff;
	line-height: 1.6;
}

.section-block {
	background-color: #fbfcfe;
	border-radius: 14rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
}

.section-title {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	font-weight: 600;
	color: #222;
	margin-bottom: 16rpx;
}

.blue-line {
	width: 8rpx;
	height: 30rpx;
	background-color: #1677ff;
	border-radius: 4rpx;
	margin-right: 12rpx;
}

.section-list {
	font-size: 26rpx;
	color: #333;
	line-height: 1.7;
}

.list-item {
	margin-bottom: 10rpx;
}

.warning-block {
	background-color: #fff2f2;
}

.warning-title {
	color: #d93025;
}

.red-line {
	width: 8rpx;
	height: 30rpx;
	background-color: #d93025;
	border-radius: 4rpx;
	margin-right: 12rpx;
}

.warning-text {
	color: #d93025;
	font-weight: 500;
}

.source-text {
	text-align: center;
	font-size: 24rpx;
	color: #888;
	margin: 16rpx 0 32rpx;
}

.confirm-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background-color: #1677ff;
	color: #fff;
	text-align: center;
	border-radius: 44rpx;
	font-size: 30rpx;
	font-weight: 500;
}

































.staff-card {
	display: flex;
	align-items: center;
	padding: 24rpx;
	gap: 20rpx;
	position: relative;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #f4f4f4;
}

.info-wrap {
	flex: 1;
}

.time-row {
	display: flex;
	align-items: center;
	margin: 10rpx 0;
	font-size: 26rpx;
	color: #666;
	gap: 6rpx;
}

.tag {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #08b852;
	gap: 4rpx;
}

.stat-card-wrap {
	/* padding: 24rpx; */
}

.card-row {
	display: flex;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

.stat-card {
	flex: 1;
	background: #fff;

	padding: 20rpx;
	border: 1px solid #dddd;

}

.card-head {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 24rpx;
}

.icon-box {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;

}

.icon-box.blue {
	background: #e8f0ff;
}

.icon-box.pink {
	background: #ffe8f2;
}

.icon-box.green {
	background: #e6f9f0;
}

.icon-box.yellow {
	background: #fff7e6;
}

.card-title {
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
}

.card-value {
	font-size: 28rpx;
	font-weight: bold;
	color: #111;
	margin-bottom: 12rpx;
}

.card-desc {
	font-size: 26rpx;
	color: #999;
}

.badge-left {
	display: flex;
	justify-content: flex-start;
	align-items: center;
}

.time-wrapper {
	margin-right: 10rpx;
}

.avatar-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar {
  width: 100%;
  height: 100%;
}
.avatar-icon {
  background-color: #155DFC;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>