<template>
	<view class="chat-page">
		<view class="top-bar">
			<!-- 状态栏占位 -->
			<view class="status-bar" :style="{height:((statusBarHeight +menuButton.height)||0)+'px'}"></view>
			<view class="custom-nav">
				<view class="nav-back" @click="handleBack()">
					<u-icon name="arrow-left" color="#222" size="36rpx"></u-icon>
				</view>
				<!-- 自定义导航栏 -->
				<view class="patient-preview-card">
					<!-- 头部信息 -->
					<view class="u-flex space-between">
						<view class="base-info">
							<text class="name mr-16">{{healthOption.name}}</text>
							<text class="tag-label mr-16">{{healthOption.gender}} | {{healthOption.age}}岁</text>
							<view class="city u-flex">
								<u-icon name="map" size="18rpx" color="#909399"></u-icon>
								<view class="margin-left-5">{{healthOption.region}}</view>
							</view>
						</view>
						<view class="intent-tag-wrapper">
							<text class="intent-tag"
								:class="'tag-' + healthOption.purchaseIntent">{{ healthOption.purchaseIntent === 'HIGH' ? '高意向' : healthOption.purchaseIntent === 'MEDIUM' ? '中等意向' : healthOption.purchaseIntent === 'LOW' ? '低意向' : '' }}</text>
						</view>
					</view>
					<view class="card-sub-info">
						<view class="info-item u-flex mr-30">
							<text class="custom-icon custom-icon-activity "
								style="font-size:30rpx;color:#009966;"></text>
							<view class="margin-left-5">
								{{healthOption.surgeryType}}
							</view>
						</view>
						<view class="info-item u-flex  mr-30">
							<text class="custom-icon custom-icon-hospital-line"
								style="font-size:30rpx;color:#009966;"></text>
							<view class="margin-left-5">
								{{healthOption.hospitalName}}
							</view>
						</view>
						<view class="info-item u-flex">
							<text class="custom-icon custom-icon-stethoscope1"
								style="font-size:30rpx;color:#009966;"></text>
							<view class="margin-left-5">
								{{healthOption.value}}·{{healthOption.surgeon}}
							</view>
						</view>

					</view>
				</view>
				<view class="intent-tag-wrapper">
					<text class="intent-tag" :class="healthOption.intentClass">{{ healthOption.intent }}</text>
				</view>
				<view class="nav-actions">
					<view class="nav-action" @click="openConversationPanel">会话</view>
					<view class="nav-action" @click="openInfoPanel">AI</view>
					<view class="nav-action" @click="openFaqPanel">FAQ</view>
				</view>
				<!-- <view class="badge-normal">{{healthOption.tag}}</view> -->

			</view>
			<!-- 沟通预判气泡 -->
			<view class="predict-block">
				<view class="block-title">
					<text class="custom-icon custom-icon-lightning1 icon-activity"
						style="font-size:36rpx;color:#009966;"></text>
					<text class="ml-">沟通初步预判</text>
					<view class="predict-actions">
						<text class="predict-action" @click="refreshAssistData">刷新</text>
						<text class="predict-status" v-if="aiPrediction.source">{{ aiPrediction.source === 'MOCK' ? '示例' : 'AI' }}</text>
					</view>
				</view>
				<view class="block-list">
					<view v-if="aiLoading" class="li-item state-line">
						<u-loading-icon mode="circle" color="#008855" size="18"></u-loading-icon>
						<text class="margin-left-5">AI预判加载中...</text>
					</view>
					<block v-else-if="predictionList.length">
						<view class="li-item" v-for="(item, pIdx) in predictionList" :key="pIdx">
							<text>{{ item }}</text>
						</view>
					</block>
					<view v-else-if="aiError" class="li-item predict-error" @click="fetchAiPrediction">
						<text>AI预判暂不可用，点击重试</text>
					</view>
					<view v-else class="li-item">
						<text>{{ healthOption.aiSummary == null ? '暂无预判信息' : healthOption.aiSummary.text }}</text>
					</view>

				</view>
				<view class="conversation-toolbar">
					<view class="tool-chip" @click="confirmToggleStatus">
						{{ currentConversation && currentConversation.status === 'CLOSED' ? '重新打开' : '关闭会话' }}
					</view>
					<view class="tool-chip" :class="{ urgent: currentConversation && currentConversation.priority === 'URGENT' }" @click="confirmTogglePriority">
						{{ currentConversation && currentConversation.priority === 'URGENT' ? '取消紧急' : '标记紧急' }}
					</view>
					<view class="tool-chip" @click="confirmAudit">会话审核</view>
					<view class="tool-chip" @click="chooseHealthCard">健康卡片</view>
				</view>
			</view>
		</view>
		<!-- 聊天消息滚动区域 -->
		<scroll-view scroll-y class="chat-scroll" :scroll-top="scrollTop" @scrolltolower="onScrollToLower"
			@scroll="onScrollHandler">
			<!-- 频道标签 -->
			<view class="tag-wrapper">
				<u-tag size="mini" text="全渠道沟通记录同步" shape="circle" color="#99a1af" bgColor="#eff1f3"
					borderColor="#eff1f3"></u-tag>
			</view>
			<view class="message-list">
				<view v-if="messageLoading" class="state-box compact">
					<u-loading-icon mode="circle" color="#008855" size="28"></u-loading-icon>
					<view class="state-text">正在加载消息...</view>
				</view>
				<view v-else-if="!chatList.length" class="state-box compact">
					<u-icon name="chat" color="#9aa3af" size="64rpx"></u-icon>
					<view class="state-title">暂无聊天记录</view>
					<view class="state-text">请输入回复内容或选择FAQ快速回复</view>
					<view class="state-btn" @click="refreshAll">重新加载</view>
				</view>
				<view v-for="(msg, idx) in chatList" :key="msg.id || idx" class="msg-item"
					:class="msg.type || 'other'" @longpress="handleLongPress(msg, idx)">

					<view v-if="showLongMenuIndex === idx" class="longpress-menu">
						<view class="menu-item" @click="copyMsg(msg)">复制</view>
						<view v-if="canEditMessage(msg)" class="menu-item" @click="startEditMessage(msg)">编辑</view>
					</view>
					<!-- 头像 -->
					<view class="avatar">
						<text v-if="msg.type !== 'mine'" class="avatar-white">
							<text class="custom-icon custom-icon-user " style="font-size:40rpx;color:#a1a8b5;"></text>
						</text>
						<text v-if="msg.type === 'mine'" class="avatar-blue">
							<text class="custom-icon custom-icon-briefcase-l"
								style="font-size:40rpx;color:#fff;"></text>
						</text>
					</view>
					<view class="msg-content">
						<view class="msg-wrap">
							<view v-if="msg.type !== 'mine'" class="sender-name">
								{{ msg.name }}
							</view>
							<view v-if="msg.type === 'mine'" class="sender-name text-right">
								{{ msg.name || '客服' }}
							</view>
							<!-- 文本气泡 -->
							<view v-if="msg.msgType === 'text'" class="bubble">{{ msg.content }}</view>
							<!-- 图片消息气泡 -->
							<view v-if="msg.msgType === 'image'" class="bubble bubble-img">
								<image :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)">
								</image>
							</view>
							<!-- 卡片 -->
							<view class="diet-report-card " v-if="msg.msgType === 'health'">
								<!-- 头部蓝色栏 -->
								<view class="card-header">
									<view class="header-left">
										<text class="header-title">{{ msg.healthLabel || msg.healthType || healthOption.healthType || '健康' }}报告</text>
									</view>
									<text class="header-right">加密同步</text>
								</view>
								<!-- 卡片内容区域 -->
								<view class="card-body ">
									<image v-if="msg.img" class="food-img" :src="msg.img" mode="aspectFill"></image>
									<view class="desc-text">
										{{ msg.description || msg.content || '健康数据已加密同步，请等待健康管理团队查看。' }}
									</view>
									<view class="tip-text">健康管理团队已接收</view>
								</view>
							</view>
						</view>
						<!-- =========时间已读移到气泡外面========= -->
						<view class="msg-footer">
							<text class="msg-time">{{ msg.time }}</text>
							<text v-if="msg.sending" class="read-tag">发送中</text>
							<text v-else-if="msg.failed" class="msg-fail">发送失败</text>
							<text v-else-if="msg.isEdited" class="read-tag">已编辑</text>
						</view>
					</view>
				</view>
				<view class="scroll-safe-bottom"></view>
			</view>
		</scroll-view>
		<!-- ==========底部操作栏 ========== -->
		<view class="chat-footer">
			<view class="quick-btn-group">
				<!-- 				<view class="quick-btn u-flex bg-blue border-blue font-blue">
					<text class="custom-icon custom-icon-briefcase-l" style="font-size:20rpx;color:#155dfc;"></text>
					<view class="margin-left-5">
						推送医助
					</view>
				</view> -->
				<view class="quick-btn u-flex bg-green border-green font-green" @click="answerList = !answerList">
					<text class="custom-icon custom-icon-message-circle" style="font-size:20rpx;color:#009966;"></text>
					<view class="margin-left-5">回复模板</view>
				</view>
				<view class="quick-btn u-flex bg-green border-green font-green" @click="openFaqPanel">
					<u-icon name="bookmark" size="18rpx" color="#009966"></u-icon>
					<view class="margin-left-5">FAQ</view>
				</view>
				<view class="quick-btn u-flex bg-green border-green font-green" @click="showUploadPopup = true">
					<u-icon name="photo" size="18rpx" color="#009966"></u-icon>
					<view class="margin-left-5">上传照片</view>
				</view>

			</view>
			<view class="answer-wrapper" v-show="answerList">
				<view class="answer-title font-s font-green">专业回复模板</view>
				<view class="answer-item" v-for="item in replyPool" @click="checkIt(item)">
					<u--text size="12" class="font-info font-s" :lines="1" :text="item"></u--text>
				</view>
				<!-- <text v-for="item in replyPool" class="answer-item">
					{{item}}
				</view> -->
			</view>
			<view class="input-row">
				<view class="phone-box" @click="openAlbum">
					<u-icon name="photo" color="#909399" size="50rpx"></u-icon>
				</view>
				<input v-model="inputText" class="chat-input  mr-16 ml-16" placeholder="输入回复消息..." confirm-type="send"
					@confirm="handleSend" :disabled="sendingMessage" />
				<view class="send-btn" @click="handleSend">
					<text class="custom-icon custom-icon-navigation " style="font-size:40rpx;color:#fff;"></text>
				</view>
			</view>
			<view v-if="sendingMessage" class="sending-tip">发送中...</view>
		</view>
		<u-popup :show="showUploadPopup" mode="bottom" :round="20">
			<view class="upload-popup">
				<view class="popup-header">
					<view class="popup-title">发送图片</view>
					<view class="popup-close" @click="showUploadPopup = false">
						<u-icon name="close" color="#111" size="30rpx"></u-icon>
					</view>
				</view>
				<view class="popup-btn-row">
					<view class="popup-btn-item" @click="takeCamera">
						<view class="popup-icon"><u-icon name="camera" color="#008855" size="72rpx"></u-icon></view>
						<view>拍照</view>
					</view>
					<view class="popup-btn-item" @click="openAlbum">
						<view class="popup-icon"><u-icon name="photo" color="#008855" size="72rpx"></u-icon></view>
						<view>相册</view>
					</view>
				</view>
			</view>
		</u-popup>
		<u-popup :show="showConversationPanel" mode="right" :customStyle="{width: '82%'}">
			<view class="side-panel">
				<view class="side-header">
					<view class="side-title">会话列表</view>
					<view class="side-actions">
						<view class="mini-btn" @click="fetchConversations">刷新</view>
						<view class="mini-btn" @click="showConversationPanel = false">关闭</view>
					</view>
				</view>
				<view v-if="conversationLoading" class="state-box compact">
					<u-loading-icon mode="circle" color="#008855" size="28"></u-loading-icon>
					<view class="state-text">加载会话...</view>
				</view>
				<view v-else-if="!conversationList.length" class="state-box compact">
					<view class="state-title">暂无可处理会话</view>
					<view class="state-text">接口异常时不会影响当前聊天</view>
				</view>
				<scroll-view v-else scroll-y class="side-scroll">
					<view v-for="item in conversationList" :key="item.id" class="conversation-card"
						:class="{active: String(item.id) === String(conversationId)}" @click="selectConversation(item)">
						<view class="conversation-card-title">
							<text>{{ getConversationTitle(item) }}</text>
							<text class="priority-dot" :class="item.priority === 'URGENT' ? 'urgent' : ''"></text>
						</view>
						<view class="conversation-meta">
							<text>{{ item.status === 'CLOSED' ? '已关闭' : '进行中' }}</text>
							<text>{{ item.priority === 'URGENT' ? '紧急' : '普通' }}</text>
							<text>{{ formatTime(item.lastMsgAt || item.updateTime || item.createTime) }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
		<u-popup :show="showInfoPanel" mode="right" :customStyle="{width: '84%'}">
			<view class="side-panel">
				<view class="side-header">
					<view class="side-title">AI预测与手机号状态</view>
					<view class="side-actions">
						<view class="mini-btn" @click="refreshAssistData">刷新</view>
						<view class="mini-btn" @click="showInfoPanel = false">关闭</view>
					</view>
				</view>
				<scroll-view scroll-y class="side-scroll">
					<view class="info-card">
						<view class="info-card-title">患者信息</view>
						<view class="info-row"><text>姓名</text><text>{{ healthOption.name || '-' }}</text></view>
						<view class="info-row"><text>手机号</text><text>{{ phoneStatus.phone || healthOption.phone || '-' }}</text></view>
						<view class="info-row"><text>拨打状态</text><text>{{ phoneStatus.called ? '已拨打' : '未拨打' }}</text></view>
						<view class="info-row" v-if="phoneStatus.latestCallTime"><text>最近通话</text><text>{{ formatTime(phoneStatus.latestCallTime) }}</text></view>
					</view>
					<view class="info-card">
						<view class="info-card-title">AI沟通预判</view>
						<view v-if="aiLoading" class="state-line"><u-loading-icon mode="circle" color="#008855" size="22"></u-loading-icon><text class="margin-left-5">加载中...</text></view>
						<view v-else-if="predictionList.length">
							<view class="suggestion-item" v-for="(item, idx) in predictionList" :key="idx">{{ item }}</view>
						</view>
						<view v-else class="empty-text">暂无可展示的AI预测</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
		<u-popup :show="showFaqPanel" mode="right" :customStyle="{width: '86%'}">
			<view class="side-panel">
				<view class="side-header">
					<view class="side-title">FAQ知识库</view>
					<view class="side-actions">
						<view class="mini-btn" @click="fetchFaqList">刷新</view>
						<view class="mini-btn" @click="showFaqPanel = false">关闭</view>
					</view>
				</view>
				<view class="faq-search">
					<input v-model="faqKeyword" class="faq-input" placeholder="输入关键词搜索FAQ" confirm-type="search" @confirm="fetchFaqList" />
					<view class="faq-search-btn" @click="fetchFaqList">搜索</view>
				</view>
				<view v-if="faqLoading" class="state-box compact">
					<u-loading-icon mode="circle" color="#008855" size="28"></u-loading-icon>
					<view class="state-text">加载FAQ...</view>
				</view>
				<scroll-view v-else scroll-y class="side-scroll">
					<view v-if="!faqList.length" class="state-box compact">
						<view class="state-title">暂无FAQ内容</view>
						<view class="state-text">可稍后刷新重试</view>
					</view>
					<view v-for="item in faqList" :key="item.id || item.question" class="faq-card">
						<view class="faq-question">{{ item.question }}</view>
						<view class="faq-answer">{{ item.answer }}</view>
						<view class="faq-footer">
							<text>{{ item.category || item.surgeryType || '通用' }}</text>
							<view class="faq-use" @click="useFaq(item)">填入输入框</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
		<u-popup :show="showEditPopup" mode="center" :round="20">
			<view class="edit-popup">
				<view class="popup-title">编辑消息</view>
				<textarea v-model="editText" class="edit-textarea" maxlength="2000" placeholder="请输入编辑后的内容"></textarea>
				<view class="popup-actions">
					<view class="popup-btn cancel" @click="cancelEditMessage">取消</view>
					<view class="popup-btn confirm" @click="submitEditMessage">保存</view>
				</view>
			</view>
		</u-popup>
	
	</view>
</template>

<script>
	import {
		getCsPatientsByIdApi,
		getCsPatientsByIdAiSummaryApi,
		getCsFaqApi,
		getCsPatientsByIdAiPredictionApi,
		getConversationsApi,
		getConversationsByIdApi,
		getConversationsByIdMessagesApi,
		postConversationsByIdMessagesApi,
		putConversationsByIdMessagesByMessageIdApi,
		putConversationsByIdStatusApi,
		putConversationsByIdPriorityApi,
		postConversationsByIdAuditApi,
		postConversationsByIdReadApi,
		postFilesUploadApi
	} from '@/api/frontApikit.js'

	import {
		mapState
	} from 'vuex'
	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
			
		},
		computed: {
			...mapState([
				'statusBarHeight',
				'menuButton',
				'navContentHeight',
				'navBarTotalHeight'
			]),
			predictionList() {
				const suggestions = this.aiPrediction && this.aiPrediction.suggestions
				if (Array.isArray(suggestions)) return suggestions.filter(Boolean)
				if (this.aiPrediction && typeof this.aiPrediction.summary === 'string') return [this.aiPrediction.summary]
				return []
			}
		},
		data() {
			return {
				id: '',
				initialized: false,
				conversationId: '',
				routeConversationId: '',
				conversationList: [],
				currentConversation: null,
				currentUser: {},
				currentSenderId: '',
				answerList: false,
				healthOption: {},
				pendingHealth: null,
				scrollTop: 0,
				realScrollTop: 0,
				inputText: '',
				isReplying: false,
				conversationLoading: false,
				messageLoading: false,
				sendingMessage: false,
				actionLoading: false,
				aiLoading: false,
				aiError: false,
				faqLoading: false,
				aiPrediction: {},
				phoneStatus: {},
				faqList: [],
				faqKeyword: '',
				showConversationPanel: false,
				showInfoPanel: false,
				showFaqPanel: false,
				showEditPopup: false,
				editingMessage: null,
				editText: '',
				showLongMenuIndex: -1,
				showUploadPopup: false,
				showEvaluatePopup: false,
				replyTimer: null,
				pollTimer: null,
				messagePollTimer: null,
				msgRefreshTimer: null,
				lastMessageSignature: '',
				rateScore: 0,
				evaText: '',
				tagList: ['专业度高', '回复及时', '态度亲切', '建议实用', '沟通顺畅'],
				selectTagList: [],
				chatList: [],
				replyPool: [
					'您好，收到您的问题，请不要过于担心，我们会为您跟进。',
					'您描述的情况属于术后较为常见现象，请保持伤口干燥清洁，密切观察。',
					'建议您多休息，如果出现发热、出血加重，请及时联系我们。',
					'已记录您反馈的情况，医生稍后会给出专业建议，请耐心等待。',
					'饮食建议清淡，忌辛辣刺激，按医嘱按时用药。'
				]
			}
		},
		onReady() {
			this.scrollToBottom()
		},
		onShow() {
			if (!this.initialized) return
			this.startMessagePolling()
			const conversationId = this.conversationId || this.routeConversationId
			if (conversationId) {
				this.markConversationRead(conversationId, true)
				if (this.currentConversation) {
					this.loadMessages(this.currentConversation, { silent: true })
				}
			}
		},
		onLoad(options) {
			console.log('onLoad options', options)
			this.currentUser = this.readCurrentUser()
			this.parseQuery(options)
			this.bootstrap()
		},
		onUnload() {
			this.clearPageTimers()
		},
		onHide() {
			this.clearPageTimers()
		},
		onPullDownRefresh() {
			this.refreshAll().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		methods: {
			readCurrentUser() {
				try {
					const raw = uni.getStorageSync('userInfo')
					if (!raw) return {}
					return typeof raw === 'string' ? JSON.parse(raw) : raw
				} catch (e) {
					return {}
				}
			},
			clearPageTimers() {
				if (this.pollTimer) {
					clearTimeout(this.pollTimer)
					this.pollTimer = null
				}
				if (this.replyTimer) {
					clearTimeout(this.replyTimer)
					this.replyTimer = null
				}
				if (this.messagePollTimer) {
					clearInterval(this.messagePollTimer)
					this.messagePollTimer = null
				}
				if (this.msgRefreshTimer) {
					clearTimeout(this.msgRefreshTimer)
					this.msgRefreshTimer = null
				}
			},
			async bootstrap() {
				if (this.initialized) return
				this.initialized = true
				uni.showLoading({ title: '加载中...', mask: true })
				try {
					await Promise.all([
						this.getCsPatientsById().catch(() => {}),
						this.getCsPatientsByIdAiSummary().catch(() => {}),
						this.fetchAiPrediction().catch(() => {}),
						this.fetchFaqList().catch(() => {}),
						this.fetchConversations().catch(() => {})
					])
					if (this.routeConversationId) {
						await this.openRouteConversation()
					} else if (this.conversationList.length) {
						const matched = this.conversationList.find(item =>
							String(item.patientId || item.patient_id || '') === String(this.id || '')
						)
						await this.selectConversation(matched || this.conversationList[0])
					} else if (this.healthOption.timeline && this.healthOption.timeline.length) {
						this.chatList = (this.healthOption.timeline || []).map((item, index) => this.normalizeMessage(item, index))
					}
					this.startMessagePolling()
				} finally {
					uni.hideLoading()
				}
			},
			async openRouteConversation() {
				let conversation = this.conversationList.find(item => String(item.id) === String(this.routeConversationId))
				if (!conversation) {
					try {
						const detail = await getConversationsByIdApi({ id: this.routeConversationId })
						conversation = detail || { id: this.routeConversationId, patientId: this.id }
					} catch (e) {
						conversation = { id: this.routeConversationId, patientId: this.id }
					}
				}
				await this.selectConversation(conversation)
			},
			async refreshAll() {
				await Promise.all([
					this.fetchAiPrediction().catch(() => {}),
					this.fetchFaqList().catch(() => {}),
					this.fetchConversations().catch(() => {})
				])
				if (this.currentConversation) await this.loadMessages(this.currentConversation).catch(() => {})
			},
			// 患者详情（手术档案+AI摘要缓存+时间线）
			async getCsPatientsById() {
				if (!this.id) return null
				try {
					const listData = await getCsPatientsByIdApi({
						id: this.id
					})
					const patientData = listData || {}
					this.healthOption = Object.assign({}, this.healthOption, patientData)
					this.phoneStatus = Object.assign({}, this.phoneStatus, {
						phone: patientData.phone || patientData.mobile || this.healthOption.phone || '',
						called: this.phoneStatus.called === true || !!patientData.lastCallAt || !!patientData.latestCallTime,
						latestCallTime: this.phoneStatus.latestCallTime || patientData.lastCallAt || patientData.latestCallTime || ''
					})
					if (!this.currentConversation && Array.isArray(patientData.timeline) && patientData.timeline.length) {
						this.chatList = patientData.timeline.map((item, index) => this.normalizeMessage(item, index))
					}
					console.log('healthOption', this.healthOption)
					console.log('chatList', this.chatList)
					return patientData
				} catch (e) {
					console.log('报错：', e)
					uni.showToast({ title: '患者信息加载失败', icon: 'none' })
					return null
				}
			},
			// AI 沟通关键点总结（30 分钟缓存，失败降级 mock）
			async getCsPatientsByIdAiSummary() {
				if (!this.id) return null
				try {
					const aiData = await getCsPatientsByIdAiSummaryApi({
						id: this.id
					})
					console.log('aiSummary：', aiData)
					if (aiData) this.$set(this.healthOption, 'aiSummary', aiData)
					return aiData
				} catch (e) {
					console.log('报错：', e)
					return null
				}
			},
			async fetchAiPrediction() {
				if (!this.id) {
					this.aiError = false
					this.aiPrediction = {}
					return null
				}
				this.aiLoading = true
				this.aiError = false
				try {
					const result = await getCsPatientsByIdAiPredictionApi({ id: this.id })
					this.aiPrediction = result || {}
					return result
				} catch (e) {
					this.aiError = true
					this.aiPrediction = {}
					console.log('AI预判加载失败', e)
					return null
				} finally {
					this.aiLoading = false
				}
			},
			async fetchFaqList() {
				this.faqLoading = true
				try {
					const result = await getCsFaqApi({
						keyword: this.faqKeyword,
						surgeryType: this.healthOption.surgeryType || ''
					})
					const list = Array.isArray(result) ? result :
						(result && (result.list || result.records || result.data)) || []
					this.faqList = list.filter(item => item && item.status !== 0 && (item.answer || item.question))
				} catch (e) {
					this.faqList = []
					console.log('FAQ加载失败', e)
					uni.showToast({ title: 'FAQ加载失败', icon: 'none' })
				} finally {
					this.faqLoading = false
				}
			},
			useFaq(item) {
				if (!item || !item.answer) return
				this.inputText = item.answer
				this.showFaqPanel = false
				this.answerList = false
			},
			async fetchConversations() {
				this.conversationLoading = true
				try {
					const result = await getConversationsApi({ page: 1, pageSize: 50 })
					const list = Array.isArray(result) ? result :
						(result && (result.list || result.records || result.conversations)) || []
					this.conversationList = list.map(item => this.normalizeConversation(item))
					return this.conversationList
				} catch (e) {
					console.log('会话列表加载失败', e)
					uni.showToast({ title: '会话列表加载失败', icon: 'none' })
					return []
				} finally {
					this.conversationLoading = false
				}
			},
			normalizeConversation(item) {
				const conversation = Object.assign({}, item)
				conversation.status = conversation.status || 'ACTIVE'
				conversation.priority = conversation.priority || 'NORMAL'
				if (!conversation.patientId) {
					conversation.patientId = conversation.patient_id || conversation.patientID ||
						(conversation.patient && conversation.patient.id) || ''
				}
				return conversation
			},
			getConversationTitle(item) {
				if (!item) return '健康咨询会话'
				return item.name || item.title || item.patientName ||
					this.healthOption.name || ('会话 ' + item.id)
			},
			async selectConversation(conversation) {
				if (!conversation) return
				const selected = this.normalizeConversation(conversation)
				let detail = null
				try {
					detail = await getConversationsByIdApi({ id: selected.id })
				} catch (e) {
					console.log('会话详情加载失败', e)
				}
				const mergedConversation = this.normalizeConversation(Object.assign({}, selected, detail || {}))
				this.currentConversation = mergedConversation
				this.conversationId = mergedConversation.id
				this.captureCurrentSenderId(mergedConversation)
				const patientId = this.currentConversation.patientId || this.currentConversation.patient_id ||
					this.currentConversation.patientID || (this.currentConversation.patient && this.currentConversation.patient.id)
				if (patientId) this.id = patientId
				this.inputText = ''
				await this.loadConversationContext()
			},
			async loadConversationContext() {
				await Promise.all([
					this.loadMessages(this.currentConversation).catch(() => {}),
					this.markConversationRead(this.conversationId, true).catch(() => {}),
					this.auditConversation(true).catch(() => {})
				])
				if (this.id) {
					await Promise.all([
						this.getCsPatientsById().catch(() => {}),
						this.fetchAiPrediction().catch(() => {})
					])
				}
				if (this.pendingHealth) {
					await this.sendHealthCard()
				}
			},
			async loadMessages(conversation, options) {
				options = options || {}
				if (!conversation || !conversation.id) return false
				if (!options.silent) this.messageLoading = true
				try {
					const result = await getConversationsByIdMessagesApi({ id: conversation.id, size: 50 })
					const serverMessages = Array.isArray(result) ? result :
						(result && (result.list || result.records || result.messages)) || []
					if (!serverMessages.length && options.silent) return true
					const normalized = serverMessages.map((item, index) => this.normalizeMessage(item, index))
					const signature = normalized.map(item =>
						item.id + '_' + item.isEdited + '_' + item.content + '_' + item.imageUrl
					).join('|')
					options.changed = signature !== this.lastMessageSignature
					if (signature !== this.lastMessageSignature) {
						this.chatList = normalized
						this.lastMessageSignature = signature
						this.scrollToBottom()
					}
					return true
				} catch (e) {
					console.log('历史消息加载失败', e)
					if (!options.silent) {
						const localMessages = this.currentConversation && this.extractMessages(this.currentConversation)
						if (localMessages.length) {
							this.chatList = localMessages.map((item, index) => this.normalizeMessage(item, index))
						}
						uni.showToast({ title: '消息加载失败', icon: 'none' })
					}
					return false
				} finally {
					if (!options.silent) this.messageLoading = false
				}
			},
			extractMessages(conversation) {
				if (!conversation) return []
				return conversation.messages || conversation.messageList || conversation.records ||
					conversation.chatList || conversation.list || []
			},
			startMessagePolling() {
				if (this.messagePollTimer) clearInterval(this.messagePollTimer)
				this.messagePollTimer = setInterval(() => {
					if (this.currentConversation && !this.sendingMessage) {
						const options = { silent: true }
						this.loadMessages(this.currentConversation, options).then(ok => {
							if (ok && options.changed) this.markConversationRead(this.conversationId, true).catch(() => {})
						})
					}
				}, 15000)
			},
			async markConversationRead(id, silent) {
				id = id || this.conversationId
				if (!id) return
				try {
					await postConversationsByIdReadApi({ id })
				} catch (e) {
					if (!silent) uni.showToast({ title: '标记已读失败', icon: 'none' })
				}
			},

			normalizeMessage(msg, index) {
				const raw = msg || {}
				const wireType = String(raw.type || raw.msgType || 'TEXT').toUpperCase()
				const senderType = String(raw.senderType || raw.senderRole || raw.role || '').toUpperCase()
				let extra = {}
				if (raw.extraJson) {
					try {
						extra = typeof raw.extraJson === 'string' ? JSON.parse(raw.extraJson) : raw.extraJson
					} catch (e) {
						extra = {}
					}
				}
				const isMine = this.isCurrentStaff(raw, senderType)
				let msgType = 'text'
				if (wireType === 'IMAGE' || raw.msgType === 'image') msgType = 'image'
				if (wireType === 'HEALTH_CARD' || raw.msgType === 'health') msgType = 'health'
				if (wireType === 'CALL_RECORD') msgType = 'text'
				const imageUrl = this.normalizeFileUrl(
					raw.imageUrl || raw.image || raw.url || raw.fileUrl || raw.fileId ||
					extra.imageUrl || extra.fileId || raw.img || ''
				)
				const healthType = this.normalizeHealthType(raw.healthType || extra.healthType || this.healthOption.healthType)
				return {
					id: raw.id || raw.messageId || raw.clientSeq || ('msg_' + index),
					messageId: raw.id || raw.messageId || '',
					clientSeq: raw.clientSeq || '',
					conversationId: raw.conversationId || this.conversationId,
					senderType,
					senderId: raw.senderId || '',
					senderName: raw.senderName,
					type: isMine ? 'mine' : 'other',
					name: raw.senderName || raw.staffName || raw.doctorName || raw.name ||
						(isMine ? (this.currentUser.name || this.currentUser.nickname || this.getSenderDefaultName(senderType)) : this.getSenderDefaultName(senderType)),
					actor: isMine ? (raw.actor || senderType || this.getCurrentSenderType()) : (raw.actor || senderType || 'other'),
					msgType,
					content: raw.content || raw.text || raw.message || raw.body || '',
					imageUrl,
					img: imageUrl,
					healthType,
					healthLabel: this.getHealthLabel(healthType),
					description: raw.description || extra.description || raw.desc || raw.content || '',
					time: this.formatTime(raw.createTime || raw.time || raw.sendTime || raw.updateTime),
					isRead: raw.isRead !== false && raw.readJson !== '[]',
					isEdited: Number(raw.isEdited || 0) === 1,
					editorName: raw.editorName || '',
					originalText: raw.originalText || '',
					extra,
					sending: raw.sending === true,
					failed: raw.failed === true,
					raw
				}
			},
			isCurrentStaff(raw, senderType) {
				if (['AI', 'SYSTEM'].indexOf(senderType) > -1) return false
				if (raw.type === 'mine' || raw.mine === true || raw.self === true ||
					raw.fromMe === true || raw.direction === 'outbound') return true
				const senderId = String(raw.senderId || raw.sender_id || raw.userId || raw.staffId || '').trim()
				if (senderId && this.getMySenderIds().some(id => String(id) === senderId)) return true
				return false
			},
			getMySenderIds() {
				const user = this.currentUser || {}
				const role = this.getCurrentSenderType()
				const ids = [
					this.currentSenderId,
					user.userId,
					user.id,
					user.memberId,
					user.staffId,
					user.csId,
					user.caregiverId,
					user.patientId
				]
				if (role === 'CS') ids.push(user.agentId, user.assigneeId)
				return ids.filter(value => value !== undefined && value !== null && String(value).trim() !== '').map(String)
			},
			captureCurrentSenderId(conversation) {
				if (!conversation) return
				const role = this.getCurrentSenderType()
				const directKeys = [
					'currentUserId', 'selfUserId', 'memberId',
					role.toLowerCase() + 'Id',
					'staffId', 'userId'
				]
				if (role === 'CS') directKeys.push('csId', 'agentId', 'assigneeId')
				if (role === 'CAREGIVER') directKeys.push('caregiverId')
				if (role === 'PATIENT') directKeys.push('patientId')
				for (let i = 0; i < directKeys.length; i++) {
					const value = conversation[directKeys[i]]
					if (value !== undefined && value !== null && String(value).trim() !== '') {
						this.currentSenderId = String(value)
						return
					}
				}
				const memberLists = [conversation.members, conversation.participants, conversation.users]
				for (let i = 0; i < memberLists.length; i++) {
					const list = memberLists[i]
					if (!Array.isArray(list)) continue
					const matchedMembers = []
					let explicitMember = null
					for (let j = 0; j < list.length; j++) {
						const member = this.unwrapMember(list[j])
						const memberRole = String(member.role || member.senderType || member.userType || member.type || '').toUpperCase()
						const isCurrent = member.current === true || member.isCurrent === true || member.self === true ||
							(memberRole && (memberRole === role || memberRole.indexOf(role) > -1))
						if (!isCurrent) continue
						if (member.current === true || member.isCurrent === true || member.self === true) explicitMember = member
						if (memberRole === role || memberRole.indexOf(role) > -1) matchedMembers.push(member)
					}
					const targetMember = explicitMember ||
						(matchedMembers.length === 1 && !list.some(item => {
							const itemRole = String(item.role || item.senderType || item.userType || item.type || '').toUpperCase()
							return itemRole && itemRole !== role && itemRole.indexOf(role) === -1 &&
								(item.current === true || item.isCurrent === true || item.self === true)
						}) ? matchedMembers[0] : null)
					if (!targetMember) continue
					const member = targetMember
						const memberId = member.id || member.userId || member.memberId || member.staffId ||
							(role === 'CS' ? member.csId || member.agentId : '') ||
							(role === 'CAREGIVER' ? member.caregiverId : '') ||
							(role === 'PATIENT' ? member.patientId : '')
						if (memberId !== undefined && memberId !== null && String(memberId).trim() !== '') {
							this.currentSenderId = String(memberId)
							return
						}
				}
			},
			unwrapMember(member) {
				if (!member) return {}
				if (member.user && typeof member.user === 'object') {
					return Object.assign({}, member, member.user)
				}
				if (member.member && typeof member.member === 'object') {
					return Object.assign({}, member, member.member)
				}
				return member
			},
			getCurrentSenderType() {
				const rawRole = this.currentUser.role || this.currentUser.userType || this.currentUser.identity || ''
				const role = String(
					Array.isArray(this.currentUser.roles) ? (this.currentUser.roles[0] || rawRole) :
					(rawRole || this.currentUser.roles || 'CS')
				).toUpperCase()
				if (role.indexOf('PATIENT') > -1) return 'PATIENT'
				if (role.indexOf('CAREGIVER') > -1) return 'CAREGIVER'
				return 'CS'
			},
			normalizeHealthType(value) {
				const text = String(value || '').toUpperCase()
				if (['DIET', 'EXERCISE', 'WEIGHT', 'BP_BG', 'SLEEP'].indexOf(text) > -1) return text
				if (text.indexOf('饮食') > -1) return 'DIET'
				if (text.indexOf('运动') > -1) return 'EXERCISE'
				if (text.indexOf('体重') > -1) return 'WEIGHT'
				if (text.indexOf('血压') > -1 || text.indexOf('血糖') > -1) return 'BP_BG'
				if (text.indexOf('睡眠') > -1) return 'SLEEP'
				return 'HEALTH'
			},
			getHealthLabel(type) {
				const labelMap = {
					DIET: '饮食',
					EXERCISE: '运动',
					WEIGHT: '体重',
					BP_BG: '血压血糖',
					SLEEP: '睡眠',
					HEALTH: '健康'
				}
				return labelMap[type] || '健康'
			},
			getSenderDefaultName(senderType) {
				const nameMap = {
					AI: 'AI健康助手',
					CS: '人工客服',
					CAREGIVER: '陪诊师',
					DOCTOR: '医生',
					PATIENT: '患者',
					SYSTEM: '系统通知'
				}
				return nameMap[senderType] || '健康管理团队'
			},
			formatTime(value) {
				if (!value) return this.getTimeStr()
				if (typeof value === 'string' && /^\d{1,2}:\d{1,2}$/.test(value)) return value
				const normalized = typeof value === 'string' ? value.replace('T', ' ').replace(/-/g, '/') : value
				const date = new Date(normalized)
				if (isNaN(date.getTime())) return value
				const pad = num => String(num).padStart(2, '0')
				const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`
				const now = new Date()
				const sameDay = date.getFullYear() === now.getFullYear() &&
					date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
				return sameDay ? hm : `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hm}`
			},
			buildLocalMessage(msgType, content, extra) {
				const clientSeq = 'local_' + Date.now() + '_' + Math.random().toString(16).slice(2)
				return Object.assign({
					id: clientSeq,
					clientSeq,
					messageId: '',
					conversationId: this.conversationId,
					senderType: this.getCurrentSenderType(),
					senderId: this.getMySenderIds()[0] || '',
					type: 'mine',
					actor: this.getCurrentSenderType(),
					name: this.currentUser.name || this.currentUser.nickname || this.getSenderDefaultName(this.getCurrentSenderType()),
					msgType,
					content,
					time: this.getTimeStr(),
					isRead: false,
					sending: true,
					failed: false
				}, extra || {})
			},
			refreshMessagesAfterSend(localMessage) {
				clearTimeout(this.msgRefreshTimer)
				this.msgRefreshTimer = setTimeout(async () => {
					const ok = await this.loadMessages(this.currentConversation, { silent: true })
					if (!ok) {
						localMessage.sending = false
						localMessage.failed = true
						return
					}
					let sameIndex = -1
					const exists = this.chatList.some((msg, index) => {
						const sameClientSeq = msg.clientSeq && localMessage.clientSeq &&
							msg.clientSeq === localMessage.clientSeq
						const sameId = msg.messageId && localMessage.messageId &&
							String(msg.messageId) === String(localMessage.messageId)
						let sameContent = false
						if (msg.type === 'mine' && msg.msgType === localMessage.msgType) {
							if (localMessage.msgType === 'image') {
								sameContent = (msg.imageUrl || msg.img) === (localMessage.imageUrl || localMessage.img)
							} else if (localMessage.msgType === 'health') {
								sameContent = msg.content === localMessage.content &&
									(msg.healthType || '') === (localMessage.healthType || '')
							} else {
								sameContent = !!msg.content && msg.content === localMessage.content
							}
						}
						const matched = sameClientSeq || sameId || sameContent
						if (matched) sameIndex = index
						return matched
					})
					if (sameIndex > -1) {
						const serverMessage = Object.assign({}, this.chatList[sameIndex], {
							sending: false,
							failed: false,
							isRead: true
						})
						this.$set(this.chatList, sameIndex, serverMessage)
					} else if (!exists) {
						this.chatList.push(Object.assign({}, localMessage, { sending: false, failed: false }))
					}
					localMessage.sending = false
					localMessage.failed = false
					this.markConversationRead(this.conversationId, true).catch(() => {})
					this.scrollToBottom()
				}, 1200)
			},
			checkIt(item) {
				this.inputText = item;
				this.answerList = false
			},
			normalizeFileUrl(url) {
				if (url === null || url === undefined) return ''
				let value = String(url).trim()
				if (!value || value.indexOf('{') === 0 || value.indexOf('[') === 0) return ''
				if (/^(https?:|wxfile:|blob:|data:|\.\/|file:|cloud:|static\/|@\/)/i.test(value)) return value
				if (/^[a-zA-Z]:[\\/]/.test(value)) return value
				if (/^[0-9a-zA-Z_-]{6,}(?:\.[a-zA-Z0-9]+)?$/.test(value)) {
					return 'http://followup.ijunyuan.cn/api/v1/files/' + encodeURIComponent(value)
				}
				if (value.indexOf('/files/') === 0) return 'http://followup.ijunyuan.cn/api/v1' + value
				if (value.indexOf('/') === 0) return 'http://followup.ijunyuan.cn/api/v1' + value
				return 'http://followup.ijunyuan.cn/api/v1/files/' + value.replace(/^\/+/, '')
			},
			extractUploadedFileUrl(result, options) {
				options = options || {}
				const formatUrl = value => options.raw ? value : this.normalizeFileUrl(value)
				if (!result) return ''
				if (typeof result === 'string') return formatUrl(result.trim())
				if (Array.isArray(result)) {
					for (let i = 0; i < result.length; i++) {
						const url = this.extractUploadedFileUrl(result[i], options)
						if (url) return url
					}
					return ''
				}
				const directKeys = ['url', 'fileUrl', 'imageUrl', 'accessUrl', 'downloadUrl', 'previewUrl',
					'fullUrl', 'filePath', 'path', 'src', 'fileId', 'id', 'fileName', 'filename',
					'urlPath', 'remoteUrl', 'fullPath'
				]
				for (let i = 0; i < directKeys.length; i++) {
					const url = formatUrl(result[directKeys[i]])
					if (url) return url
				}
				if (result.dir && result.filename) {
					return formatUrl(String(result.dir).replace(/\/$/, '') + '/' + result.filename)
				}
				const nestedKeys = ['data', 'file', 'image', 'attachment', 'result', 'record']
				for (let j = 0; j < nestedKeys.length; j++) {
					if (result[nestedKeys[j]] && typeof result[nestedKeys[j]] === 'object') {
						const nestedUrl = this.extractUploadedFileUrl(result[nestedKeys[j]], options)
						if (nestedUrl) return nestedUrl
					}
				}
				return ''
			},
			async sendMessage(contentOverride) {
				const text = String(contentOverride || this.inputText || '').trim()
				if (!text) {
					uni.showToast({ title: '请输入回复内容', icon: 'none' })
					return
				}
				if (!this.conversationId) {
					uni.showToast({ title: '会话尚未就绪', icon: 'none' })
					return
				}
				if (this.sendingMessage) return
				const clientSeq = 'send_' + Date.now() + '_' + Math.random().toString(16).slice(2)
				const localMessage = this.buildLocalMessage('text', text, { clientSeq })
				this.chatList.push(localMessage)
				this.inputText = ''
				this.sendingMessage = true
				this.showLongMenuIndex = -1
				this.scrollToBottom()
				try {
					await postConversationsByIdMessagesApi({
						id: this.conversationId,
						type: 'TEXT',
						content: text,
						clientSeq
					})
					this.refreshMessagesAfterSend(localMessage)
				} catch (e) {
					localMessage.sending = false
					localMessage.failed = true
					this.inputText = text
					console.log('发送消息失败', e)
				} finally {
					this.sendingMessage = false
					this.scrollToBottom()
				}
			},
			chooseHealthCard() {
				if (this.pendingHealth) {
					this.sendHealthCard(this.pendingHealth)
					return
				}
				const itemList = ['饮食记录', '运动记录', '体重记录', '血压血糖', '睡眠记录']
				const typeList = ['DIET', 'EXERCISE', 'WEIGHT', 'BP_BG', 'SLEEP']
				uni.showActionSheet({
					itemList,
					success: (res) => {
						const healthType = typeList[res.tapIndex]
						const label = itemList[res.tapIndex]
						this.sendHealthCard({
							healthType,
							description: label + '健康数据已加密同步，请等待健康管理团队查看。'
						})
					}
				})
			},
			async sendHealthCard(incomingData) {
				const healthData = incomingData || this.pendingHealth || null
				if (!this.conversationId) {
					uni.showToast({ title: '请先选择会话', icon: 'none' })
					return
				}
				if (!healthData) {
					uni.showToast({ title: '请选择健康卡片类型', icon: 'none' })
					return
				}
				if (this.sendingMessage) return
				const healthType = this.normalizeHealthType(healthData.healthType)
				const healthLabel = this.getHealthLabel(healthType)
				const imageRef = healthData.img || healthData.imageUrl || healthData.image || ''
				const image = this.normalizeFileUrl(imageRef)
				const description = healthData.description || healthData.content || healthData.message ||
					(healthLabel + '数据已加密同步，请等待健康管理团队查看。')
				const extra = Object.assign({}, healthData, { healthType, description })
				if (imageRef) extra.imageUrl = imageRef
				const clientSeq = 'health_' + Date.now() + '_' + Math.random().toString(16).slice(2)
				const localMessage = this.buildLocalMessage('health', description, {
					clientSeq,
					img: image,
					imageUrl: image,
					healthType,
					healthLabel,
					description
				})
				this.chatList.push(localMessage)
				this.pendingHealth = null
				this.sendingMessage = true
				this.scrollToBottom()
				try {
					await postConversationsByIdMessagesApi({
						id: this.conversationId,
						type: 'HEALTH_CARD',
						content: description,
						healthType: healthType === 'HEALTH' ? undefined : healthType,
						extraJson: JSON.stringify(extra),
						clientSeq
					})
					this.refreshMessagesAfterSend(localMessage)
				} catch (e) {
					localMessage.sending = false
					localMessage.failed = true
					this.pendingHealth = healthData
					console.log('发送健康卡片失败', e)
				} finally {
					this.sendingMessage = false
					this.scrollToBottom()
				}
			},
			async sendImageMessage(filePath) {
				if (!filePath) return
				if (!this.conversationId) {
					uni.showToast({ title: '会话尚未就绪', icon: 'none' })
					return
				}
				if (this.sendingMessage) return
				const clientSeq = 'image_' + Date.now() + '_' + Math.random().toString(16).slice(2)
				const localMessage = this.buildLocalMessage('image', '', {
					clientSeq,
					imageUrl: filePath,
					img: filePath
				})
				this.chatList.push(localMessage)
				this.sendingMessage = true
				this.showUploadPopup = false
				this.scrollToBottom()
				try {
					const uploadResult = await postFilesUploadApi({
						filePath,
						name: 'file',
						dir: 'chat'
					})
					const imageRef = this.extractUploadedFileUrl(uploadResult, { raw: true })
					const imageUrl = this.normalizeFileUrl(imageRef)
					if (!imageRef) throw new Error('图片地址解析失败')
					await postConversationsByIdMessagesApi({
						id: this.conversationId,
						type: 'IMAGE',
						content: '',
						imageUrl: imageRef,
						clientSeq
					})
					localMessage.imageUrl = imageUrl
					localMessage.img = imageUrl
					this.refreshMessagesAfterSend(localMessage)
				} catch (e) {
					localMessage.sending = false
					localMessage.failed = true
					console.log('发送图片失败', e)
					if (!e || !e.isApiError) {
						uni.showToast({ title: (e && e.message) || '图片发送失败', icon: 'none' })
					}
				} finally {
					this.sendingMessage = false
					this.scrollToBottom()
				}
			},
			parseQuery(options) {
				if (!options) return
				if (options.patientId || options.patient_id) {
					this.id = options.patientId || options.patient_id
				}
				if (options.conversationId) this.routeConversationId = options.conversationId
				if (options.id && !this.routeConversationId) {
					if (options.type === 'conversation' || options.scene === 'conversation') {
						this.routeConversationId = options.id
					} else if (!this.id) {
						this.id = options.id
					}
				}
				if (!options.data || options.data === 'undefined') return
				try {
					const data = JSON.parse(decodeURIComponent(options.data))
					if (!data || typeof data !== 'object') return
					if (data.patientId || data.patient_id || data.patientID) {
						this.id = data.patientId || data.patient_id || data.patientID
					}
					if (data.conversationId || data.conversation_id) {
						this.routeConversationId = data.conversationId || data.conversation_id
					}
					if (data.healthType || data.msgType === 'health' || data.messageType === 'HEALTH_CARD') {
						this.pendingHealth = data
						this.healthOption = Object.assign({}, this.healthOption, data)
					} else if (!this.routeConversationId && data.id && (data.type === 'conversation' || data.msgType || data.messageType)) {
						this.routeConversationId = data.id
					} else if (!this.routeConversationId && data.id) {
						this.id = data.id
						this.healthOption = Object.assign({}, this.healthOption, data)
					}
				} catch (e) {
					console.error('onLoad解析参数异常', e)
				}
			},
			//监听滚动，保存真实位置
			onScrollHandler(e) {
				this.realScrollTop = e.detail.scrollTop
			},
			// 滚动到顶部（修复版，解决赋值0无效）
			scrollToTop() {
				//先赋值当前真实位置，让变量和组件同步，nextTick再置0
				console.log('before', this.scrollTop, this.realScrollTop)
				this.scrollTop = this.realScrollTop
				this.$nextTick(() => {
					this.scrollTop = 0
					console.log('after set 0', this.scrollTop)
				})
			},
			scrollToBottom() {
				// console.log('滚动到底');
				this.scrollTop = 99998
				this.pollTimer = setTimeout(() => {
					this.scrollTop = 99999
				}, 60)
			},
			getTimeStr() {
				const now = new Date()
				return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
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
						url: '/pages/index/workBench'
					})
				}
			},
			openUpload() {
				console.log('点击上传', this.showUploadPopup)
				this.showUploadPopup = true
				console.log('赋值后', this.showUploadPopup)
			},
			handleSend() {
				this.sendMessage()
			},
			// 模拟回复
			mockRobotReply() {
				this.isReplying = true
				this.replyTimer = setTimeout(() => {
					const randomReply = this.replyPool[Math.floor(Math.random() * this.replyPool.length)]
					this.chatList.push({
						type: 'other',
						name: '健康助理王小翠',
						msgType: 'text',
						content: randomReply,
						time: this.getTimeStr(),
						isRead: true
					})
					this.chatList.forEach(item => {
						if (item.type === 'mine') item.isRead = true
					})
					this.scrollToBottom()
					this.isReplying = false
				}, 1300)
			},
			takeCamera() {
				uni.chooseImage({
					count: 1,
					sourceType: ['camera'],
					success: (res) => {
						if (res && res.tempFilePaths && res.tempFilePaths.length) {
							this.sendImageMessage(res.tempFilePaths[0])
						}
					}
				})
			},
			openAlbum() {
				uni.chooseImage({
					count: 1,
					sourceType: ['album'],
					success: (res) => {
						if (res && res.tempFilePaths && res.tempFilePaths.length) {
							this.sendImageMessage(res.tempFilePaths[0])
						}
					}
				})
			},
			previewImage(url) {
				const urls = this.chatList
					.filter(item => item.msgType === 'image' && (item.imageUrl || item.img))
					.map(item => item.imageUrl || item.img)
				const current = urls.indexOf(url)
				uni.previewImage({
					current: current > -1 ? current : 0,
					urls: urls.length ? urls : [url]
				})
			},
			handleLongPress(msg, index) {
				this.showLongMenuIndex = this.showLongMenuIndex === index ? -1 : index
			},
			copyMsg(msg) {
				if (msg.msgType === 'text' && msg.content) {
					uni.setClipboardData({
						data: msg.content
					})
				} else {
					uni.showToast({ title: '仅支持复制文本消息', icon: 'none' })
				}
				this.showLongMenuIndex = -1
			},
			deleteMsg(idx) {
				this.chatList.splice(idx, 1)
				this.showLongMenuIndex = -1
			},
			onReceivePushMsg(serverMsg) {
				if (!serverMsg) return
				const incomingId = serverMsg.conversationId || serverMsg.conversation_id
				if (this.conversationId && incomingId && String(incomingId) !== String(this.conversationId)) return
				const message = this.normalizeMessage(serverMsg, this.chatList.length)
				const exists = this.chatList.some(item =>
					String(item.id) === String(message.id) ||
					(item.clientSeq && message.clientSeq && item.clientSeq === message.clientSeq)
				)
				if (!exists) this.chatList.push(message)
				this.scrollToBottom()
				this.markConversationRead(this.conversationId, true).catch(() => {})
			},
			onScrollToLower() {
				//加载历史消息
			},
			openConversationPanel() {
				this.showConversationPanel = true
				this.showInfoPanel = false
				this.showFaqPanel = false
				this.fetchConversations()
			},
			openInfoPanel() {
				this.showInfoPanel = true
				this.showConversationPanel = false
				this.showFaqPanel = false
				if (!this.predictionList.length) this.fetchAiPrediction()
			},
			openFaqPanel() {
				this.showFaqPanel = true
				this.showConversationPanel = false
				this.showInfoPanel = false
				this.answerList = false
				if (!this.faqList.length) this.fetchFaqList()
			},
			async refreshAssistData() {
				const tasks = [
					this.fetchAiPrediction().catch(() => {}),
					this.fetchFaqList().catch(() => {}),
					this.fetchConversations().catch(() => {})
				]
				if (this.id) {
					tasks.push(this.getCsPatientsById().catch(() => {}))
					tasks.push(this.getCsPatientsByIdAiSummary().catch(() => {}))
				}
				if (this.currentConversation) {
					tasks.push(this.loadMessages(this.currentConversation, { silent: true }).catch(() => {}))
				}
				await Promise.all(tasks)
			},
			canEditMessage(msg) {
				if (!msg || !msg.messageId || msg.msgType !== 'text' || msg.type !== 'mine') return false
				if (['AI', 'SYSTEM'].indexOf((msg.senderType || '').toUpperCase()) > -1) return false
				if (msg.senderId && this.getMySenderIds().length) {
					return this.getMySenderIds().some(id => String(id) === String(msg.senderId))
				}
				return msg.type === 'mine'
			},
			startEditMessage(msg) {
				if (!this.canEditMessage(msg)) {
					uni.showToast({ title: '该消息不可编辑', icon: 'none' })
					return
				}
				this.editingMessage = msg
				this.editText = msg.content || ''
				this.showLongMenuIndex = -1
				this.showEditPopup = true
			},
			cancelEditMessage() {
				this.showEditPopup = false
				this.editingMessage = null
				this.editText = ''
			},
			async submitEditMessage() {
				const newText = String(this.editText || '').trim()
				if (!this.editingMessage || !this.conversationId) return
				if (!newText) {
					uni.showToast({ title: '消息内容不能为空', icon: 'none' })
					return
				}
				if (this.actionLoading) return
				this.actionLoading = true
				uni.showLoading({ title: '保存中...', mask: true })
				try {
					await putConversationsByIdMessagesByMessageIdApi({
						id: this.conversationId,
						messageId: this.editingMessage.messageId,
						content: newText,
						newText
					})
					uni.showToast({ title: '消息已更新', icon: 'success' })
					this.cancelEditMessage()
					await this.loadMessages(this.currentConversation, { silent: true })
				} catch (e) {
					console.log('编辑消息失败', e)
					uni.showToast({ title: (e && e.message) || '编辑消息失败', icon: 'none' })
				} finally {
					this.actionLoading = false
					uni.hideLoading()
				}
			},
			confirmToggleStatus() {
				if (!this.currentConversation || !this.conversationId) {
					uni.showToast({ title: '请先选择会话', icon: 'none' })
					return
				}
				if (this.actionLoading) return
				const willClose = this.currentConversation.status !== 'CLOSED'
				uni.showModal({
					title: '提示',
					content: willClose ? '确认关闭当前会话吗？' : '确认重新打开当前会话吗？',
					success: (res) => {
						if (res.confirm) {
							this.updateConversationStatus(willClose ? 'CLOSED' : 'ACTIVE')
						}
					}
				})
			},
			async updateConversationStatus(status) {
				this.actionLoading = true
				uni.showLoading({ title: '处理中...', mask: true })
				try {
					await putConversationsByIdStatusApi({ id: this.conversationId, data: status })
					this.currentConversation = Object.assign({}, this.currentConversation, { status })
					this.syncConversationListItem({ status })
					uni.showToast({ title: '会话状态已更新', icon: 'success' })
				} catch (e) {
					console.log('更新会话状态失败', e)
					uni.showToast({ title: (e && e.message) || '更新会话状态失败', icon: 'none' })
				} finally {
					this.actionLoading = false
					uni.hideLoading()
				}
			},
			confirmTogglePriority() {
				if (!this.currentConversation || !this.conversationId) {
					uni.showToast({ title: '请先选择会话', icon: 'none' })
					return
				}
				if (this.actionLoading) return
				const willUrgent = this.currentConversation.priority !== 'URGENT'
				uni.showModal({
					title: '提示',
					content: willUrgent ? '确认标记为紧急会话吗？' : '确认取消紧急标记吗？',
					success: (res) => {
						if (res.confirm) {
							this.updateConversationPriority(willUrgent ? 'URGENT' : 'NORMAL')
						}
					}
				})
			},
			async updateConversationPriority(priority) {
				this.actionLoading = true
				uni.showLoading({ title: '处理中...', mask: true })
				try {
					await putConversationsByIdPriorityApi({ id: this.conversationId, data: priority })
					this.currentConversation = Object.assign({}, this.currentConversation, { priority })
					this.syncConversationListItem({ priority })
					uni.showToast({ title: '会话优先级已更新', icon: 'success' })
				} catch (e) {
					console.log('更新会话优先级失败', e)
					uni.showToast({ title: (e && e.message) || '更新会话优先级失败', icon: 'none' })
				} finally {
					this.actionLoading = false
					uni.hideLoading()
				}
			},
			syncConversationListItem(patch) {
				const index = this.conversationList.findIndex(item =>
					String(item.id) === String(this.conversationId)
				)
				if (index > -1) {
					const item = Object.assign({}, this.conversationList[index], patch)
					this.$set(this.conversationList, index, item)
				}
			},
			confirmAudit() {
				if (!this.currentConversation || !this.conversationId) {
					uni.showToast({ title: '请先选择会话', icon: 'none' })
					return
				}
				if (this.actionLoading) return
				uni.showModal({
					title: '会话审核',
					content: '确认提交当前会话访问审核吗？',
					success: (res) => {
						if (res.confirm) this.auditConversation(false)
					}
				})
			},
			async auditConversation(silent) {
				if (!this.conversationId) return
				try {
					await postConversationsByIdAuditApi({
						id: this.conversationId,
						data: { entryPoint: 'conversation.view' }
					})
				} catch (e) {
					if (!silent) console.log('会话审核失败', e)
				}
			},
			toggleTag(tag) {
				const idx = this.selectTagList.indexOf(tag)
				if (idx > -1) {
					this.selectTagList.splice(idx, 1)
				} else {
					this.selectTagList.push(tag)
				}
			},
			resetEva() {
				this.rateScore = 0;
				this.selectTagList = [];
				this.evaText = '';
				this.showEvaluatePopup = false
			},
			submitEvaluate() {
				console.log('提交评价', this.rateScore, this.selectTagList, this.evaText)
				uni.showToast({
					title: '评价提交成功'
				})
				this.showEvaluatePopup = false
				//重置
				this.rateScore = 0
				this.selectTagList = []
				this.evaText = ''
			}
		}
	}
</script>

<style scoped>
	.intent-tag {
		font-size: 24rpx;
		padding: 4rpx 14rpx;
		border-radius: 12rpx;
	}

	.tag-HIGH {
		background: #ffe9e9;
		color: #e53935;
	}

	.tag-MEDIUM {
		background: #fff3e0;
		color: #f57c00;
	}

	.tag-LOW {
		background: #f0f1f3;
		color: #666;
	}

	.tag-wrapper ::v-deep .u-transition {
		width: fit-content;
		margin: 0 auto;
	}

	.chat-page {
		background-color: #f9fafb;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.chat-scroll {
		flex: 1;
		background-color: #f9fafb;
		height: calc(100vh - 330px);
	}

	.tag-wrapper {
		margin: 20rpx auto;
		text-align: center;
	}

	/* 头部 */
	.status-bar {
		height: var(--status-bar-height);
		width: 100%;
		background-color: #ffffff;
	}

	.custom-nav {
		background-color: #ffffff;
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
	}

	.nav-back {
		width: 50rpx;
	}

	.nav-title {
		flex: 1;
		font-size: 30rpx;
		color: #111;
		font-weight: 700;
	}

	.star-wrapper {
		border-radius: 100%;
		background-color: #fefce8;
		padding: 10rpx;
		margin: 0 10rpx;
	}

	.call-btn {
		background-color: #008855;
		color: #fff;
		padding: 12rpx 24rpx;
		border-radius: 40rpx;
		font-size: 20rpx;
	}



	.scroll-safe-bottom {
		height: calc(140rpx + env(safe-area-inset-bottom));
	}

	.message-list {
		padding: 0 24rpx;
		padding-bottom: 100rpx;
	}

	.msg-item {
		position: relative;
		display: flex;
		margin-bottom: 28rpx;
	}

	.msg-item.mine {
		flex-direction: row-reverse;
	}

	/* 长按菜单 */
	.longpress-menu {
		position: absolute;
		top: -60rpx;
		background: #333;
		color: #fff;
		border-radius: 12rpx;
		z-index: 99;
		display: flex;
		overflow: hidden;
	}

	.menu-item {
		padding: 12rpx 24rpx;
		font-size: 26rpx;
	}

	.avatar-white {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-size: 32rpx;
		box-shadow: 0 1rpx 4rpx #00000015;
		margin-right: 16rpx;
	}

	.avatar-blue {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #008855;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-size: 32rpx;
		box-shadow: 0 1rpx 4rpx #00000015;
		margin-left: 16rpx;
	}

	.msg-content {
		display: flex;
		flex-direction: column;
		max-width: 460rpx;
	}

	.msg-wrap {
		display: flex;
		flex-direction: column;
	}

	.sender-name {
		font-size: 26rpx;
		color: #008855;
		margin-bottom: 6rpx;
	}

	.bubble {
		padding: 24rpx 28rpx;
		border-radius: 20rpx;
		background: #ffffff;
		font-size: 30rpx;
		line-height: 1.6;
	}

	/* 22222222222222 */
	.diet-report-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
		/* margin: 20rpx; */
	}

	.card-header {
		background-color: #008855;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;


	}

	.header-left {
		display: flex;
		align-items: center;
	}


	.header-title {
		color: #fff;
		font-size: 25rpx;
		font-weight: bold;
		margin-left: 12rpx;
	}

	.header-right {
		color: #ffffff;
		font-size: 20rpx;
		opacity: 0.8;
	}

	.card-body {
		padding: 30rpx;
	}

	.food-img {
		width: 100%;
		height: 200rpx;
		border-radius: 16rpx;
	}

	.desc-text {
		font-size: 24rpx;
		color: #909399;
		line-height: 1.7;
		margin-top: 24rpx;
	}

	.tip-text {
		margin-top: 30rpx;
		font-size: 22rpx;
		color: #008855;
		font-weight: 700;
	}

	/*对方气泡：左上小圆角*/
	.msg-item.other .bubble {
		border-top-left-radius: 8rpx;
	}

	/*我方气泡：右上小圆角*/
	.msg-item.mine .bubble {
		background: #008855;
		color: #ffffff;
		border-top-right-radius: 8rpx;
	}

	/* 图片气泡 */
	.bubble-img {
		border-radius: 20rpx;
		overflow: hidden;
	}

	.bubble-img image {
		width: 320rpx;
		height: 320rpx;
	}

	.msg-item.other .bubble-img {
		border-top-left-radius: 8rpx;
	}

	.msg-item.mine .bubble-img {
		border-top-right-radius: 8rpx;
	}

	.msg-footer {
		display: flex;
		margin-top: 4rpx;
	}

	/*对方消息：时间居左，紧贴气泡 */
	.msg-item.other .msg-footer {
		justify-content: flex-start;
		padding-left: 8rpx;
	}

	/*我方消息：时间+已读居右，紧贴气泡 */
	.msg-item.mine .msg-footer {
		justify-content: flex-end;
		padding-right: 8rpx;
	}

	.msg-time {
		font-size: 24rpx;
		color: #999;
	}

	.read-tag {
		font-size: 24rpx;
		color: #999;
	}

	/* =========底部输入区域========= */
	.chat-footer {
		background: #fff;
		padding: 24rpx;
		border-top: 1rpx solid #eee;
		/* border-radius: 30rpx; */
		/* margin: 20rpx; */
		/* margin-bottom: 140rpx; */
		position: absolute;
		/* bottom: 60px; */
		left: 0;
		right: 0;
		bottom: 0;

		/* height: 200rpx; */
		/* margin-bottom: 30rpx; */
	}

	.quick-btn-group {
		display: flex;
		margin-bottom: 20rpx;
		font-size: 18rpx
	}

	.quick-btn {
		flex: 1;
		padding: 14rpx 32rpx;
		border-radius: 40rpx;
		/* background: #f3f4f6; */
		font-size: 20rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.quick-btn.active {
		background: #e8f0ff;
		color: #008855;
	}

	.input-row {
		display: flex;
		align-items: center;
	}

	.chat-input {
		flex: 1;
		background: #f4f5f7;
		border-radius: 44rpx;
		padding: 20rpx 28rpx;
		font-size: 30rpx;
	}

	.send-btn {
		width: 76rpx;
		height: 76rpx;
		border-radius: 20rpx;
		background: #008855;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
	}

	.phone-box {
		padding: 15rpx;
		background-color: #f4f5f7;
		border-radius: 25rpx;
	}

	.eva-textarea {
		width: calc(100% - 40rpx);
		min-height: 100rpx;
		background: #f7f8fa;
		border-radius: 16rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}

	.submit-eva-btn {
		width: 100%;
	}

	.patient-preview-card {
		flex: 1
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.base-info {
		display: flex;
		align-items: center;
	}

	.name {
		font-size: 30rpx;
		font-weight: bold;
	}

	.tag-label {
		background: #f2f3f5;
		padding: 10rpx;
		border-radius: 30rpx;
		font-size: 18rpx;

	}

	.city {
		font-size: 18rpx;
		color: #909399;
		display: flex;

	}

	.info-item {
		font-size: 18rpx;
		font-weight: bold;
	}

	.badge-normal {
		background: #f2f3f5;
		padding: 12rpx 28rpx;
		border-radius: 20rpx;
		font-size: 18rpx;
		color: #909399;
	}

	.card-sub-info {
		display: flex;
		font-size: 32rpx;
		color: #909399;
		margin: 20rpx 0;
	}

	.custom-nav {
		background-color: #ffffff;
		display: flex;
		align-items: center;
		padding: 10px 15px;
		justify-content: space-around;
	}

	.predict-block {
		background: #e8faf0;
		border-radius: 24rpx;
		padding: 30rpx;
		margin: 0 30rpx;
		border: 1px solid #d5fae8;
	}

	.block-title {
		display: flex;
		align-items: center;
		font-size: 25rpx;
		color: #008855;
		font-weight: bold;
		margin-bottom: 24rpx;
	}

	.li-item {
		display: flex;
		font-size: 20rpx;
		line-height: 1.4;
		color: #006644;
		margin-bottom: 16rpx;
	}

	.dot {
		font-size: 36rpx;
	}



	.intent-tag {
		font-size: 24rpx;
		padding: 4rpx 14rpx;
		border-radius: 12rpx;
	}

	.tag-high {
		background: #ffe9e9;
		color: #e53935;
	}

	.tag-mid {
		background: #fff3e0;
		color: #f57c00;
	}

	.tag-low {
		background: #f0f1f3;
		color: #666;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 10rpx;
		flex-shrink: 0;
		margin-left: 12rpx;
	}

	.nav-action {
		padding: 8rpx 16rpx;
		border-radius: 999rpx;
		background: #e8faf0;
		color: #008855;
		font-size: 20rpx;
		font-weight: 600;
	}

	.predict-actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.predict-action,
	.predict-status {
		font-size: 20rpx;
		color: #008855;
		padding: 4rpx 14rpx;
		border: 1rpx solid rgba(0, 136, 85, 0.25);
		border-radius: 999rpx;
		background: #fff;
	}

	.state-line {
		display: flex;
		align-items: center;
		color: #5f6b7a;
	}

	.predict-error {
		color: #d46b08;
	}

	.conversation-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 14rpx;
		margin-top: 8rpx;
		padding-top: 18rpx;
		border-top: 1rpx solid rgba(0, 136, 85, 0.12);
	}

	.tool-chip {
		padding: 10rpx 20rpx;
		border-radius: 999rpx;
		background: #fff;
		color: #008855;
		font-size: 22rpx;
		border: 1rpx solid rgba(0, 136, 85, 0.25);
	}

	.tool-chip.urgent {
		background: #fff1f0;
		color: #cf1322;
		border-color: #ffccc7;
	}

	.state-box {
		padding: 80rpx 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.state-box.compact {
		padding: 42rpx 28rpx;
	}

	.state-title {
		margin-top: 18rpx;
		font-size: 28rpx;
		color: #202939;
		font-weight: 600;
	}

	.state-text {
		margin-top: 10rpx;
		font-size: 24rpx;
		line-height: 1.6;
		color: #8a919f;
		text-align: center;
	}

	.state-btn {
		margin-top: 24rpx;
		padding: 14rpx 38rpx;
		border-radius: 999rpx;
		background: #008855;
		color: #fff;
		font-size: 24rpx;
	}

	.text-right {
		text-align: right;
	}

	.msg-fail {
		font-size: 22rpx;
		color: #e34d59;
		margin-left: 10rpx;
	}

	.sending-tip {
		padding-top: 10rpx;
		text-align: right;
		font-size: 22rpx;
		color: #8a919f;
	}

	.upload-popup,
	.edit-popup {
		padding: 38rpx;
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 34rpx;
	}

	.popup-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1f2937;
	}

	.popup-close {
		padding: 8rpx;
		color: #7b8794;
	}

	.popup-btn-row {
		display: flex;
		gap: 20rpx;
	}

	.popup-btn-item {
		flex: 1;
		padding: 38rpx 20rpx;
		background: #f7faf9;
		border-radius: 22rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #243042;
		font-size: 26rpx;
	}

	.popup-icon {
		background: #fff;
		border-radius: 18rpx;
		padding: 18rpx;
		margin-bottom: 14rpx;
	}

	.edit-textarea {
		width: 100%;
		box-sizing: border-box;
		min-height: 220rpx;
		padding: 22rpx;
		border-radius: 18rpx;
		background: #f6f8fa;
		font-size: 28rpx;
		line-height: 1.6;
	}

	.popup-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 30rpx;
	}

	.popup-btn {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		border-radius: 999rpx;
		font-size: 28rpx;
	}

	.popup-btn.cancel {
		background: #f1f3f5;
		color: #53606f;
	}

	.popup-btn.confirm {
		background: #008855;
		color: #fff;
	}

	.side-panel {
		height: 100%;
		background: #f7faf9;
		display: flex;
		flex-direction: column;
	}

	.side-header {
		padding: 34rpx 28rpx 24rpx;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #edf0f2;
	}

	.side-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1f2937;
	}

	.side-actions {
		display: flex;
		gap: 12rpx;
	}

	.mini-btn {
		padding: 8rpx 18rpx;
		border-radius: 999rpx;
		font-size: 22rpx;
		background: #e8faf0;
		color: #008855;
	}

	.side-scroll {
		flex: 1;
		min-height: 0;
		padding: 22rpx;
		box-sizing: border-box;
	}

	.conversation-card {
		background: #fff;
		border-radius: 18rpx;
		padding: 24rpx;
		margin-bottom: 18rpx;
		border: 2rpx solid transparent;
	}

	.conversation-card.active {
		border-color: #008855;
		background: #f1fbf6;
	}

	.conversation-card-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
		font-weight: 600;
		color: #202939;
	}

	.priority-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: #8a919f;
	}

	.priority-dot.urgent {
		background: #e34d59;
	}

	.conversation-meta {
		display: flex;
		gap: 18rpx;
		margin-top: 14rpx;
		font-size: 22rpx;
		color: #8a919f;
	}

	.info-card {
		background: #fff;
		border-radius: 18rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.info-card-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #202939;
		margin-bottom: 16rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		gap: 24rpx;
		padding: 12rpx 0;
		font-size: 24rpx;
		color: #53606f;
		border-bottom: 1rpx solid #f0f2f5;
	}

	.info-row text:last-child {
		text-align: right;
		color: #202939;
	}

	.suggestion-item,
	.empty-text {
		font-size: 24rpx;
		line-height: 1.7;
		color: #53606f;
		padding: 12rpx 0;
	}

	.faq-search {
		display: flex;
		gap: 14rpx;
		padding: 22rpx;
		background: #fff;
		border-bottom: 1rpx solid #edf0f2;
	}

	.faq-input {
		flex: 1;
		height: 68rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
		border-radius: 999rpx;
		background: #f3f6f5;
		font-size: 24rpx;
	}

	.faq-search-btn {
		padding: 0 24rpx;
		height: 68rpx;
		line-height: 68rpx;
		border-radius: 999rpx;
		background: #008855;
		color: #fff;
		font-size: 24rpx;
	}

	.faq-card {
		background: #fff;
		border-radius: 18rpx;
		padding: 22rpx;
		margin-bottom: 18rpx;
	}

	.faq-question {
		font-size: 27rpx;
		font-weight: 700;
		color: #202939;
		line-height: 1.5;
	}

	.faq-answer {
		margin-top: 12rpx;
		font-size: 24rpx;
		line-height: 1.7;
		color: #53606f;
	}

	.faq-footer {
		margin-top: 16rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 22rpx;
		color: #8a919f;
	}

	.faq-use {
		padding: 8rpx 18rpx;
		border-radius: 999rpx;
		background: #e8faf0;
		color: #008855;
	}

	.answer-wrapper {
		max-height: 260rpx;
		overflow: auto;
		background: #f7faf9;
		border-radius: 18rpx;
		padding: 18rpx;
		margin-bottom: 18rpx;
	}

	.answer-title {
		margin-bottom: 10rpx;
	}

	.answer-item {
		padding: 12rpx 0;
		font-size: 24rpx;
		line-height: 1.5;
		border-bottom: 1rpx solid #edf0f2;
	}
</style>
