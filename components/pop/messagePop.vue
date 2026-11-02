<template>
	<view>
	<u-popup :show="true" mode="right" :round="0" :zIndex="10080" :safeAreaInsetBottom="false"
		:closeOnClickOverlay="false" :mask-click="false" @close="close">
		<view class="full-chat-popup">
			<view class="full-chat-header">
				<view class="full-header-back" @click="close">
					<u-icon name="arrow-left" color="#1f2937" size="22"></u-icon>
				</view>
				<view class="full-header-main">
					<view class="full-title-row">
						<text class="full-chat-title">{{ chatTitle }} · 健康管理群</text>
						<view class="full-group-chip">
							<u-icon name="account-fill" color="#2563ff" size="13"></u-icon>
							<text>多学科</text>
						</view>
					</view>
					<view class="full-chat-subtitle">{{ chatSubtitle }}</view>
				</view>
				<view class="full-header-actions">
					<view class="full-archive-btn" @click="openArchivePopup">
						<u-icon name="file-text" color="#2563ff" size="15"></u-icon>
						<text>患者档案</text>
					</view>
					<view class="full-member-btn" @click="openMemberPopup">
						<u-icon name="account-fill" color="#2563ff" size="22"></u-icon>
					</view>
				</view>
			</view>

			<scroll-view scroll-y class="full-message-scroll" :scroll-into-view="chatScrollIntoView"
				:scroll-with-animation="true">
				<view v-if="chatMessagesLoading" class="full-chat-state">
					<u-loading-icon mode="circle" color="#2563ff" size="26"></u-loading-icon>
					<text class="full-state-text">历史消息加载中...</text>
				</view>
				<view v-else-if="!chatMessages.length" class="full-chat-state">
					<u-icon name="chat" color="#b7c0d4" size="42"></u-icon>
					<text class="full-state-text">{{ chatError || '暂无聊天消息，欢迎发起沟通' }}</text>
				</view>
				<view v-for="(msg, index) in chatMessages" :id="'chatMsg' + index"
					:key="'full-msg-' + (msg.id || index)" class="full-msg-row" :class="msg.type">
					<view v-if="msg.type === 'other'" class="full-msg-avatar other">
						<image v-if="msg.avatar" :src="msg.avatar" mode="aspectFill" class="full-avatar-img"></image>
						<u-icon v-else name="account-fill" color="#2563ff" size="24"></u-icon>
					</view>
					<view class="full-msg-content">
						<view class="full-sender-row" :class="msg.type">
							<text class="full-sender-name">{{ msg.name }}</text>
							<text v-if="msg.roleText" class="full-sender-role">{{ msg.roleText }}</text>
							<text class="full-sender-time">{{ msg.time }}</text>
						</view>
						<view class="full-bubble" :class="{ fail: msg.failed }">
							<text>{{ msg.content }}<text v-if="msg.isEdited" class="edited-mark">（已编辑）</text></text>
						</view>
						<view v-if="msg.type === 'mine'" class="full-mine-meta">
							<text v-if="msg.sending">发送中</text>
							<text v-else-if="msg.failed">发送失败</text>
							<view v-if="canEditChatMessage(msg)" class="edit-message-btn" @click="openEditMessage(msg)">
								<u-icon name="edit-pen" color="#2563ff" size="14"></u-icon>
								<text>编辑</text>
							</view>
						</view>
					</view>
					<view v-if="msg.type === 'mine'" class="full-msg-avatar mine">
						<image v-if="msg.avatar" :src="msg.avatar" mode="aspectFill" class="full-avatar-img"></image>
						<u-icon v-else name="account-fill" color="#ffffff" size="26"></u-icon>
					</view>
				</view>
			</scroll-view>

			<view v-if="showInput && canWrite" class="full-chat-footer">
				<input v-model="chatInput" class="full-chat-input" :placeholder="inputPlaceholder" confirm-type="send"
					cursor-spacing="18" :adjust-position="true" :hold-keyboard="true"
					:disabled="!canWrite || chatSending || !activeConversationId" @confirm="sendChatMessage" />
				<view class="send-btn"
					:class="{ disabled: !canWrite || chatSending || !activeConversationId || !chatInput.trim() }"
					@click="sendChatMessage">
					<text class="custom-icon custom-icon-navigation" style="font-size:40rpx;color:#fff;"></text>
				</view>
			</view>
		</view>
	</u-popup>

		<u-popup :show="editMessagePopupVisible" mode="center" :round="24" :zIndex="10120"
			:closeOnClickOverlay="false" :mask-click="false" @close="closeEditMessage">
			<view class="edit-chat-popup">
				<view class="edit-chat-title">编辑群聊消息</view>
				<view class="edit-original-box">
					<text class="edit-original-label">原消息内容</text>
					<text class="edit-original-text">{{ editForm.originalText }}</text>
				</view>
				<textarea v-model="editForm.newText" class="edit-chat-textarea" maxlength="2000" auto-height
					placeholder="请输入修改后的内容" cursor-spacing="20" :adjust-position="true" />
				<view class="edit-tip">保存后将在群内标记“已编辑”，并记录修改人与时间留痕</view>
				<view class="edit-actions">
					<u-button class="edit-action-btn" plain shape="circle" text="取消" @click="closeEditMessage"></u-button>
					<u-button class="edit-action-btn" type="primary" shape="circle" text="保存修改"
						:loading="editSaving" @click="submitEditMessage"></u-button>
				</view>
			</view>
		</u-popup>

		<u-popup :show="archivePopupVisible" mode="right" :round="0" :zIndex="10100"
			:closeOnClickOverlay="false" :mask-click="false" @close="closeArchivePopup">
			<view class="archive-popup">
				<view class="side-popup-header">
					<view class="side-title-wrap">
						<view class="side-title-icon blue">
							<u-icon name="file-text" color="#2563ff" size="21"></u-icon>
						</view>
						<text class="side-popup-title">患者基本信息（临床权威一致）</text>
					</view>
					<view class="side-close" @click="closeArchivePopup">
						<u-icon name="close" color="#667085" size="23"></u-icon>
					</view>
				</view>
				<scroll-view scroll-y class="side-body-scroll">
					<view v-if="profileLoading" class="full-chat-state">
						<u-loading-icon mode="circle" color="#2563ff" size="26"></u-loading-icon>
						<text class="full-state-text">患者档案加载中...</text>
					</view>
					<view v-else-if="!patientProfile" class="full-chat-state">
						<u-icon name="file-text" color="#b7c0d4" size="42"></u-icon>
						<text class="full-state-text">暂无患者档案</text>
					</view>
					<template v-else>
						<view class="archive-hero-card">
							<view class="archive-hero-avatar">
								<image v-if="patientProfile.avatar" :src="patientProfile.avatar" mode="aspectFill" class="full-avatar-img"></image>
								<u-icon v-else name="account-fill" color="#2563ff" size="38"></u-icon>
							</view>
							<view class="archive-hero-info">
								<view class="archive-name-row">
									<text class="archive-name">{{ patientProfile.name }}</text>
									<text class="archive-gender-age">{{ patientProfile.genderAgeText }}</text>
								</view>
								<view class="archive-sub-row">
									<text>住院号：{{ patientProfile.inpatientNo }}</text>
									<u-tag text="数据来源一致" type="success" size="mini" plain></u-tag>
								</view>
							</view>
						</view>
						<view class="archive-card">
							<view class="archive-card-title">患者身份档案</view>
							<view class="archive-grid">
								<view class="archive-field"><text class="archive-label">患者姓名</text><text class="archive-value">{{ patientProfile.name }}</text></view>
								<view class="archive-field"><text class="archive-label">性别</text><text class="archive-value">{{ patientProfile.genderText || '待补充' }}</text></view>
								<view class="archive-field"><text class="archive-label">年龄/出生日期</text><text class="archive-value">{{ patientProfile.ageBirthText }}</text></view>
								<view class="archive-field"><text class="archive-label">联系方式</text><text class="archive-value">{{ patientProfile.phone }}</text></view>
								<view class="archive-field"><text class="archive-label">住院号</text><text class="archive-value strong">{{ patientProfile.inpatientNo }}</text></view>
								<view class="archive-field"><text class="archive-label">就诊医院</text><text class="archive-value">{{ patientProfile.hospital }}</text></view>
							</view>
						</view>
						<view class="archive-card">
							<view class="archive-card-title">诊断与手术明细</view>
							<view class="diagnosis-row">
								<text class="archive-label">主要诊断</text>
								<text class="archive-value">{{ patientProfile.diagnosis || '暂无诊断信息' }}</text>
							</view>
							<view class="diagnosis-row">
								<text class="archive-label">手术方式</text>
								<text class="archive-value">{{ patientProfile.surgeryType || '暂无手术信息' }}</text>
							</view>
							<view class="diagnosis-row">
								<text class="archive-label">手术时间</text>
								<text class="archive-value">{{ patientProfile.surgeryTime || '待补充' }}</text>
							</view>
						</view>
					</template>
				</scroll-view>
				<view class="archive-footer">
					<u-button type="primary" shape="circle" text="返回健康管理群" @click="closeArchivePopup"></u-button>
				</view>
			</view>
		</u-popup>

		<u-popup :show="memberPopupVisible" mode="right" :round="0" :zIndex="10100"
			:closeOnClickOverlay="false" :mask-click="false" @close="closeMemberPopup">
			<view class="member-popup">
				<view class="side-popup-header">
					<view class="side-title-wrap">
						<view class="side-title-icon blue"><u-icon name="account-fill" color="#2563ff" size="21"></u-icon></view>
						<text class="side-popup-title">群成员列表 ({{ conversationMembers.length }}人)</text>
					</view>
					<view class="side-close" @click="closeMemberPopup">
						<u-icon name="close" color="#667085" size="23"></u-icon>
					</view>
				</view>
				<view class="member-desc">由客服、医生助理、客户、陪诊师与康复随访 AI 组成的多学科随诊群</view>
				<scroll-view scroll-y class="side-body-scroll member-body">
					<view v-if="membersLoading" class="full-chat-state">
						<u-loading-icon mode="circle" color="#2563ff" size="26"></u-loading-icon>
						<text class="full-state-text">群成员加载中...</text>
					</view>
					<view v-else-if="!conversationMembers.length" class="full-chat-state">
						<u-icon name="account" color="#b7c0d4" size="42"></u-icon>
						<text class="full-state-text">暂无群成员信息</text>
					</view>
					<view v-else>
						<view v-for="(member, index) in conversationMembers" :key="'member-' + (member.id || index)" class="member-list-card">
							<view class="member-list-avatar">
								<image v-if="member.avatar" :src="member.avatar" mode="aspectFill" class="full-avatar-img"></image>
								<u-icon v-else name="account-fill" color="#2563ff" size="28"></u-icon>
							</view>
							<view class="member-list-info">
								<view class="member-list-title-row">
									<text class="member-list-name">{{ member.name }}</text>
									<text v-if="member.roleText" class="member-list-role">{{ member.roleText }}</text>
								</view>
								<text class="member-list-remark">{{ member.remark || '暂无角色备注' }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import {
	getConversationsByIdApi,
	getConversationsByIdMessagesApi,
	postConversationsByIdMessagesApi,
	putConversationsByIdMessagesByMessageIdApi,
	getDoctorPatientsByIdConversationApi,
	getEscortUsersApi
} from '@/api/frontApikit.js'

export default {
	name: 'MessagePop',
	props: {
		showInput: {
			type: Boolean,
			default: true
		},
		role: {
			type: String,
			default: 'CAREGIVER'
		},
		patientId: {
			type: [Number, String],
			default: ''
		},
		conversationId: {
			type: [Number, String],
			default: ''
		},
		currentUserId: {
			type: [Number, String],
			default: ''
		}
	},
	data() {
		return {
			archivePopupVisible: false,
			memberPopupVisible: false,
			chatMessagesLoading: false,
			membersLoading: false,
			profileLoading: false,
			chatSending: false,
			editSaving: false,
			chatInput: '',
			chatError: '',
			currentConversation: null,
			conversationMembers: [],
			patientProfile: null,
			chatMessages: [],
			chatScrollIntoView: '',
			chatMessagesSignature: '',
			chatPollTimer: null,
			chatScrollTimer: null,
			currentUser: {},
			editMessagePopupVisible: false,
			editingMessage: null,
			editForm: {
				originalText: '',
				newText: ''
			}
		}
	},
	computed: {
		normalizedRole() {
			return String(this.role || 'CAREGIVER').toUpperCase() === 'DOCTOR' ? 'DOCTOR' : 'CAREGIVER'
		},
		canWrite() {
			return this.normalizedRole === 'CAREGIVER'
		},
		activeConversationId() {
			return this.normalizedRole === 'DOCTOR'
				? (this.patientId || this.conversationId || '')
				: (this.conversationId || this.patientId || '')
		},
		inputPlaceholder() {
			return this.canWrite ? '在多学科群内沟通（客服、医助、客户全员可见）' : '医生端仅可查看群聊消息'
		},
		chatTitle() {
			return (this.patientProfile && this.patientProfile.name) ||
				(this.currentConversation && (this.currentConversation.name || this.currentConversation.patientName)) ||
				'健康管理群'
		},
		chatSubtitle() {
			return (this.currentConversation && (this.currentConversation.hospitalSurgery || this.currentConversation.subtitle)) ||
				'多学科随诊群沟通'
		}
	},
	watch: {
		activeConversationId: {
			immediate: true,
			handler() {
				this.resetChatState()
				this.$nextTick(() => this.loadConversation(true))
			}
		}
	},
	created() {
		this.currentUser = this.readCurrentUser()
	},
	mounted() {
		this.startChatPolling()
	},
	beforeDestroy() {
		this.stopChatPolling()
		if (this.chatScrollTimer) {
			clearTimeout(this.chatScrollTimer)
			this.chatScrollTimer = null
		}
	},
	methods: {
		close() {
			this.$emit('close')
		},
		resetChatState() {
			this.archivePopupVisible = false
			this.memberPopupVisible = false
			this.closeEditMessage()
			this.currentConversation = null
			this.conversationMembers = []
			this.patientProfile = null
			this.chatMessages = []
			this.chatMessagesSignature = ''
			this.chatInput = ''
			this.chatError = ''
			this.chatScrollIntoView = ''
		},
		async loadConversation(manualLoading) {
			if (!this.activeConversationId) {
				this.chatError = '群聊会话尚未就绪'
				return
			}
			if (manualLoading) this.chatMessagesLoading = true
			try {
				if (this.normalizedRole === 'DOCTOR') {
					await this.loadDoctorConversation()
				} else {
					await Promise.all([
						this.loadCaregiverConversationDetail(),
						this.loadChatMessages(false)
					])
				}
				this.chatError = ''
				this.scrollChatToBottom()
			} catch (error) {
				this.chatError = '消息加载失败，可稍后重试'
				this.handleError(error, '消息加载失败')
			} finally {
				if (manualLoading) this.chatMessagesLoading = false
			}
		},
		async loadDoctorConversation() {
			const result = await getDoctorPatientsByIdConversationApi({ id: this.activeConversationId })
			const data = result || {}
			const conversation = this.normalizeConversation(
				Object.assign({}, data.groupMeta || {}, data.conversation || {})
			)
			conversation.id = conversation.id || this.activeConversationId
			conversation.patientId = conversation.patientId || this.activeConversationId
			this.currentConversation = conversation
			this.conversationMembers = this.extractMembers(conversation, {
				members: data.members,
				groupMeta: data.groupMeta
			})
			const profileSource = data.patient || data.archive || data.profile || data.groupMeta || conversation
			this.patientProfile = this.normalizePopupProfile(profileSource)
			this.applyMessages(data.messages || [])
		},
		async loadCaregiverConversationDetail() {
			try {
				const detail = await getConversationsByIdApi({ id: this.activeConversationId })
				const conversation = this.normalizeConversation(detail || {})
				conversation.id = conversation.id || this.activeConversationId
				this.currentConversation = conversation
				this.conversationMembers = this.extractMembers(conversation)
				this.patientProfile = this.normalizePopupProfile(conversation.patient || conversation.patientInfo || conversation)
			} catch (error) {
				this.currentConversation = Object.assign({ id: this.activeConversationId }, this.currentConversation || {})
			}
		},
		async loadChatMessages(manualLoading) {
			if (!this.activeConversationId) return
			if (manualLoading) this.chatMessagesLoading = true
			try {
				if (this.normalizedRole === 'DOCTOR') {
					await this.loadDoctorConversation()
				} else {
					const result = await getConversationsByIdMessagesApi({ id: this.activeConversationId, size: 50 })
					this.applyMessages(this.extractList(result))
				}
			} catch (error) {
				if (manualLoading) this.chatError = '消息加载失败，可稍后重试'
				this.handleError(error, '消息加载失败')
			} finally {
				if (manualLoading) this.chatMessagesLoading = false
			}
		},
		applyMessages(list) {
			const nextMessages = (list || []).map((item, index) => this.normalizeChatMessage(item, index))
			const nextSignature = nextMessages.map(msg =>
				[msg.id, msg.type, msg.name, msg.content, msg.isEdited ? 1 : 0, msg.time].join('~')
			).join('|')
			if (nextSignature === this.chatMessagesSignature) return
			this.chatMessages = nextMessages
			this.chatMessagesSignature = nextSignature
			this.scrollChatToBottom()
		},
		startChatPolling() {
			this.stopChatPolling()
			this.chatPollTimer = setInterval(() => {
				if (!this.archivePopupVisible && !this.memberPopupVisible && !this.editMessagePopupVisible && !this.chatSending) {
					this.loadChatMessages(false)
				}
			}, 15000)
		},
		stopChatPolling() {
			if (this.chatPollTimer) {
				clearInterval(this.chatPollTimer)
				this.chatPollTimer = null
			}
		},
		scrollChatToBottom() {
			this.$nextTick(() => {
				const index = this.chatMessages.length - 1
				if (index < 0) return
				if (this.chatScrollTimer) clearTimeout(this.chatScrollTimer)
				this.chatScrollTimer = setTimeout(() => {
					this.chatScrollIntoView = 'chatMsg' + index
				}, 60)
			})
		},
		openArchivePopup() {
			this.archivePopupVisible = true
			this.loadPatientProfile()
		},
		closeArchivePopup() {
			this.archivePopupVisible = false
		},
		openMemberPopup() {
			this.memberPopupVisible = true
			this.loadConversationMembers()
		},
		closeMemberPopup() {
			this.memberPopupVisible = false
		},
		async loadConversationMembers() {
			this.membersLoading = true
			try {
				if (this.normalizedRole === 'DOCTOR') {
					await this.loadDoctorConversation()
				} else {
					await this.loadCaregiverConversationDetail()
				}
			} catch (error) {
				this.handleError(error, '群成员加载失败')
			} finally {
				this.membersLoading = false
			}
		},
		async loadPatientProfile() {
			this.profileLoading = true
			try {
				if (this.normalizedRole === 'DOCTOR') {
					await this.loadDoctorConversation()
				} else {
					let fallback = this.currentConversation || {}
					try {
						const result = await getEscortUsersApi()
						const list = this.extractList(result)
						const raw = list.find(item => this.samePatient(item, fallback)) || fallback
						fallback = raw
					} catch (error) {
						// 会话详情里已有基础档案时，不因为补充接口失败阻断查看
					}
					this.patientProfile = this.normalizePopupProfile(fallback)
				}
			} catch (error) {
				this.patientProfile = this.patientProfile || this.normalizePopupProfile(this.currentConversation || {})
				this.handleError(error, '患者档案加载失败')
			} finally {
				this.profileLoading = false
			}
		},
		async sendChatMessage() {
			if (!this.showInput || !this.canWrite) return
			const text = String(this.chatInput || '').trim()
			if (!text) {
				uni.showToast({ title: '请输入消息内容', icon: 'none' })
				return
			}
			if (!this.activeConversationId) {
				uni.showToast({ title: '群聊会话尚未就绪', icon: 'none' })
				return
			}
			if (this.chatSending) return
			const clientSeq = 'caregiver_' + Date.now() + '_' + Math.random().toString(16).slice(2)
			const localMessage = {
				id: clientSeq,
				type: 'mine',
				name: this.getCurrentUserName(),
				roleText: '陪诊师',
				avatar: this.getCurrentUserAvatar(),
				senderType: 'CAREGIVER',
				senderId: this.resolveCurrentUserId(),
				messageId: '',
				clientSeq,
				msgType: 'text',
				isEdited: false,
				content: text,
				time: this.formatDateTime(new Date()),
				sending: true,
				failed: false,
				raw: {}
			}
			this.chatMessages.push(localMessage)
			this.chatInput = ''
			this.chatSending = true
			this.chatMessagesSignature = ''
			this.scrollChatToBottom()
			try {
				await postConversationsByIdMessagesApi({
					id: this.activeConversationId,
					type: 'TEXT',
					content: text,
					senderType: 'CAREGIVER',
					clientSeq
				})
				await this.loadChatMessages(false)
				this.$emit('refresh')
			} catch (error) {
				localMessage.sending = false
				localMessage.failed = true
				this.chatInput = text
				this.handleError(error, '消息发送失败')
			} finally {
				this.chatSending = false
				this.scrollChatToBottom()
			}
		},
		canEditChatMessage(msg) {
			if (!this.canWrite || !msg || msg.type !== 'mine' || msg.msgType !== 'text' || msg.sending || msg.failed) return false
			if (['AI', 'SYSTEM'].indexOf(String(msg.senderType || '').toUpperCase()) > -1) return false
			if (!msg.messageId) return false
			const senderId = String(msg.senderId || '').trim()
			const currentId = String(this.resolveCurrentUserId() || '').trim()
			if (senderId && currentId) return senderId === currentId
			if (!senderId && !currentId && msg.senderType === 'CAREGIVER') return true
			return false
		},
		openEditMessage(msg) {
			if (!this.canEditChatMessage(msg)) {
				uni.showToast({ title: '仅可编辑本人发送的文本消息', icon: 'none' })
				return
			}
			this.editingMessage = msg
			this.editForm = {
				originalText: msg.content || '',
				newText: msg.content || ''
			}
			this.editMessagePopupVisible = true
		},
		closeEditMessage() {
			this.editMessagePopupVisible = false
			this.editingMessage = null
			this.editForm = {
				originalText: '',
				newText: ''
			}
		},
		async submitEditMessage() {
			const newText = String(this.editForm.newText || '').trim()
			if (!this.editingMessage || !this.activeConversationId) return
			if (!newText) {
				uni.showToast({ title: '消息内容不能为空', icon: 'none' })
				return
			}
			if (newText === this.editingMessage.content) {
				uni.showToast({ title: '消息内容未修改', icon: 'none' })
				return
			}
			if (this.editSaving) return
			this.editSaving = true
			uni.showLoading({ title: '保存中...', mask: true })
			try {
				await putConversationsByIdMessagesByMessageIdApi({
					id: this.activeConversationId,
					messageId: this.editingMessage.messageId,
					content: newText,
					newText
				})
				const target = this.editingMessage
				uni.showToast({ title: '消息已更新', icon: 'success' })
				this.closeEditMessage()
				await this.loadChatMessages(false)
				const targetId = target.messageId || target.id
				const index = this.chatMessages.findIndex(item => String(item.messageId || item.id) === String(targetId))
				if (index > -1) {
					this.$set(this.chatMessages, index, Object.assign({}, this.chatMessages[index], {
						messageId: this.chatMessages[index].messageId || targetId,
						content: newText,
						isEdited: true,
						editedAt: this.formatDateTime(new Date())
					}))
				}
				this.$emit('refresh')
			} catch (error) {
				this.handleError(error, '编辑消息失败')
			} finally {
				this.editSaving = false
				uni.hideLoading()
			}
		},
		extractList(data) {
			if (Array.isArray(data)) return data
			if (!data) return []
			if (Array.isArray(data.messages)) return data.messages
			if (Array.isArray(data.conversations)) return data.conversations
			if (Array.isArray(data.list)) return data.list
			if (Array.isArray(data.records)) return data.records
			if (Array.isArray(data.rows)) return data.rows
			if (Array.isArray(data.items)) return data.items
			if (Array.isArray(data.data)) return data.data
			return []
		},
		normalizeConversation(item) {
			const source = item || {}
			const patient = source.patient || {}
			const hospital = source.hospital || source.hospitalName || patient.hospitalName || ''
			const department = source.department || source.deptName || patient.department || ''
			const surgeryType = source.surgeryType || source.surgeryName || patient.surgeryType || ''
			return Object.assign({}, source, {
				id: source.id || source.conversationId || source.chatId || this.activeConversationId,
				patientId: source.patientId || source.patient_id || source.patientID || patient.id || '',
				name: source.name || source.title || source.patientName || patient.name || '',
				hospitalSurgery: [hospital, department, surgeryType].filter(Boolean).join(' · ')
			})
		},
		extractMembers(conversation, extra) {
			const rawList = []
			const context = conversation || {}
			const snapshot = this.parseMembersSnapshot(context)
			snapshot.forEach(item => rawList.push(item))
			const containers = [
				context.members,
				context.participants,
				context.users,
				context.memberList,
				context.membersJson,
				extra && extra.members,
				extra && extra.groupMeta && extra.groupMeta.members
			]
			containers.forEach(list => {
				if (Array.isArray(list)) list.forEach(item => rawList.push(item))
			})
			;[
				{ data: context.patient, role: 'PATIENT' },
				{ data: context.customer, role: 'PATIENT' },
				{ data: context.cs, role: 'CS' },
				{ data: context.customerService, role: 'CS' },
				{ data: context.assistant, role: 'DOCTOR_ASSISTANT' },
				{ data: context.doctorAssistant, role: 'DOCTOR_ASSISTANT' },
				{ data: context.caregiver, role: 'CAREGIVER' },
				{ data: context.escort, role: 'CAREGIVER' },
				{ data: context.ai, role: 'AI' },
				{ data: context.bot, role: 'AI' }
			].forEach(item => {
				if (item.data && typeof item.data === 'object') {
					rawList.push(Object.assign({ role: item.data.role || item.role }, item.data))
				}
			})
			const exists = {}
			return rawList.map((item, index) => this.normalizeMember(item, index)).filter(item => {
				if (!item.name) return false
				const key = String(item.id || item.name)
				if (exists[key]) return false
				exists[key] = true
				return true
			})
		},
		parseMembersSnapshot(conversation) {
			if (!conversation) return []
			let payload = conversation.membersJson !== undefined ? conversation.membersJson : conversation.members_json
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload)
				} catch (error) {
					return []
				}
			}
			return this.normalizeMembersPayload(payload)
		},
		normalizeMembersPayload(payload) {
			if (!payload) return []
			if (Array.isArray(payload)) return payload
			if (typeof payload !== 'object') return []
			const result = []
			const roleMap = {
				patient: 'PATIENT',
				customer: 'PATIENT',
				client: 'PATIENT',
				cs: 'CS',
				customerService: 'CS',
				assistant: 'DOCTOR_ASSISTANT',
				doctorAssistant: 'DOCTOR_ASSISTANT',
				caregiver: 'CAREGIVER',
				escort: 'CAREGIVER',
				ai: 'AI',
				bot: 'AI'
			}
			['members', 'list', 'users', 'participants', 'memberList'].forEach(key => {
				if (Array.isArray(payload[key])) result.push(...payload[key])
			})
			Object.keys(roleMap).forEach(key => {
				const value = payload[key]
				if (Array.isArray(value)) {
					value.forEach(item => result.push(typeof item === 'object' ? Object.assign({ role: item.role || roleMap[key] }, item) : item))
				} else if (value && typeof value === 'object') {
					result.push(Object.assign({ role: value.role || roleMap[key] }, value))
				}
			})
			return result
		},
		normalizeMember(raw, index) {
			if (typeof raw === 'string' || typeof raw === 'number') {
				return {
					id: `member_${index}`,
					name: String(raw),
					avatar: '',
					role: '',
					roleText: '',
					remark: '群成员'
				}
			}
			const source = raw || {}
			const nested = source.user || source.profile || source.member || {}
			const data = Object.assign({}, nested, source)
			const role = String(data.role || data.senderType || data.userType || data.memberRole || '').toUpperCase()
			const baseRemark = data.remark || data.description || data.title || data.department || data.hospitalName || ''
			return {
				id: data.id || data.userId || data.memberId || `member_${index}`,
				name: data.name || data.nickname || data.staffName || data.patientName || '',
				avatar: data.avatar || data.avatarUrl || data.headImg || '',
				role,
				roleText: this.getRoleText(role),
				remark: baseRemark || '群成员'
			}
		},
		normalizePopupProfile(raw) {
			const source = raw || {}
			const patient = source.patient || source.patientInfo || source.userInfo || source.profile || {}
			const data = Object.assign({}, patient, source)
			const diagnosis = data.diagnosis || data.diagnosisName || data.mainDiagnosis || data.disease || ''
			const surgery = data.surgeryType || data.surgeryName || data.operationType || data.operationName || ''
			const surgeryTime = data.surgeryTime || data.operationTime || data.surgeryDate || ''
			const gender = data.gender || data.sex || data.genderText || ''
			const genderText = gender === 'MALE' || gender === '男' || gender === 1
				? '男'
				: gender === 'FEMALE' || gender === '女' || gender === 2
					? '女'
					: gender
			const age = this.toNumber(data.age)
			const birthDate = data.birthDate || data.birthday || data.dateOfBirth || ''
			return {
				name: data.name || data.patientName || data.nickname || '未命名患者',
				avatar: data.avatar || data.avatarUrl || data.headImg || '',
				age,
				ageText: age ? `${age}岁` : '年龄未填',
				gender,
				genderText,
				birthDate,
				genderAgeText: [genderText, age ? `${age}岁` : ''].filter(Boolean).join(' · ') || '性别年龄待补充',
				ageBirthText: [age ? `${age}岁` : '', birthDate].filter(Boolean).join(' / ') || '待补充',
				phone: this.maskPhone(data.phone || data.mobile || data.contactPhone || data.telephone || ''),
				inpatientNo: data.inpatientNo || data.hospitalNo || data.admissionNo || data.patientNo || '待补充',
				hospital: data.hospital || data.hospitalName || data.medicalInstitution || data.hospitalAddress || '暂无医院信息',
				diagnosis,
				diagnosisSource: data.diagnosisSource || data.sourceText || '',
				surgeryType: surgery,
				surgeryTime,
				surgeryInfo: surgery ? `${surgery}${surgeryTime ? `（${surgeryTime}）` : ''}` : ''
			}
		},
		normalizeChatMessage(raw, index) {
			const source = raw || {}
			const senderType = this.normalizeSenderRole(
				source.senderType || source.senderRole || source.role || source.actor || ''
			)
			const wireType = String(source.type || source.msgType || source.messageType || 'TEXT').toUpperCase()
			let content = source.content || source.text || source.message || source.body || ''
			if ((wireType === 'IMAGE' || source.msgType === 'image') && !content) content = '[图片消息]'
			if ((wireType === 'HEALTH_CARD' || wireType === 'HEALTH' || source.msgType === 'health') && !content) content = '[健康卡片消息]'
			const mine = this.isMyChatMessage(source, senderType)
			let msgType = 'text'
			if (wireType === 'IMAGE' || wireType === 'IMAGE_MESSAGE' || source.msgType === 'image') msgType = 'image'
			if (wireType === 'HEALTH_CARD' || wireType === 'HEALTH' || source.msgType === 'health') msgType = 'health'
			const messageId = source.messageId || source.id || source.message_id || ''
			const senderId = source.senderId || source.sender_id || source.userId || source.staffId || ''
			return {
				id: messageId || source.clientSeq || `popup_msg_${index}`,
				messageId,
				clientSeq: source.clientSeq || '',
				senderType,
				senderId,
				type: mine ? 'mine' : 'other',
				name: source.senderName || source.staffName || source.name ||
					(mine ? this.getCurrentUserName() : (this.getRoleText(senderType) || '群成员')),
				avatar: source.avatar || source.senderAvatar || source.avatarUrl || (mine ? this.getCurrentUserAvatar() : ''),
				roleText: this.getRoleText(senderType),
				msgType,
				content,
				time: this.formatDateTime(source.createTime || source.sendTime || source.time || source.updateTime),
				isEdited: source.isEdited === true || Number(source.isEdited || source.edited || 0) === 1 || !!source.editedAt,
				editedAt: source.editedAt || source.updateTime || '',
				sending: source.sending === true,
				failed: source.failed === true,
				raw: source
			}
		},
		isMyChatMessage(source, senderType) {
			if (['AI', 'SYSTEM'].indexOf(senderType) > -1) return false
			if (source.mine === true || source.self === true || source.fromMe === true || source.direction === 'outbound') return true
			const senderId = String(
				source.senderId ||
				source.sender_id ||
				source.userId ||
				source.staffId ||
				source.accountId ||
				''
			).trim()
			const currentId = String(this.resolveCurrentUserId() || '').trim()
			if (senderId && currentId) return senderId === currentId
			if (!senderId && !currentId && this.canWrite && senderType === 'CAREGIVER') return true
			return false
		},
		resolveCurrentUserId() {
			const user = this.currentUser || {}
			return this.currentUserId ||
				user.id ||
				user.userId ||
				user.staffId ||
				user.memberId ||
				user.caregiverId ||
				user.escortId ||
				user.doctorId ||
				user.accountId ||
				user.uid ||
				''
		},
		normalizeSenderRole(role) {
			const text = String(role || '').toUpperCase()
			if (!text) return ''
			if (text.indexOf('CUSTOMER_SERVICE') > -1 || text === 'CS') return 'CS'
			if (text.indexOf('PATIENT') > -1 || text === 'CUSTOMER' || text.indexOf('CLIENT') > -1) return 'PATIENT'
			if (text.indexOf('CARE') > -1 || text.indexOf('ESCORT') > -1 || text.indexOf('STATION') > -1) return 'CAREGIVER'
			if (text.indexOf('DOCTOR') > -1) return 'DOCTOR'
			if (text.indexOf('ASSISTANT') > -1) return 'DOCTOR_ASSISTANT'
			if (text.indexOf('SYSTEM') > -1) return 'SYSTEM'
			if (text.indexOf('AI') > -1 || text.indexOf('ROBOT') > -1) return 'AI'
			return text
		},
		getRoleText(role) {
			const map = {
				PATIENT: '客户',
				CUSTOMER: '客户',
				CLIENT: '客户',
				CS: '客服',
				CUSTOMER_SERVICE: '客服',
				CAREGIVER: '陪诊师',
				ESCORT: '陪诊师',
				DOCTOR: '医生',
				DOCTOR_ASSISTANT: '医生助理',
				MEDICAL_ASSISTANT: '医生助理',
				AI: '机器人',
				ROBOT: '机器人',
				SYSTEM: '系统'
			}
			return map[role] || ''
		},
		getCurrentUserName() {
			const user = this.currentUser || {}
			return user.name || user.nickname || user.realName || user.userName || user.username ||
				(this.canWrite ? '陪诊师' : '医生')
		},
		getCurrentUserAvatar() {
			const user = this.currentUser || {}
			return user.avatar || user.avatarUrl || user.headImg || user.headImage || ''
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
		samePatient(raw, fallback) {
			const source = raw || {}
			const patient = source.patient || source.patientInfo || source.userInfo || {}
			const data = Object.assign({}, patient, source)
			const leftId = String(data.patientId || data.id || data.userId || '')
			const rightId = String((fallback && (fallback.patientId || fallback.id)) || this.currentConversation && this.currentConversation.patientId || '')
			if (leftId && rightId && leftId === rightId) return true
			const name = (fallback && fallback.name) || (this.currentConversation && this.currentConversation.name) || ''
			return !!(name && (data.name === name || data.patientName === name))
		},
		handleError(error, fallback) {
			const message = (error && (error.message || error.errMsg)) || fallback || '请求失败'
			uni.showToast({
				title: fallback ? `${fallback}，请稍后重试` : message,
				icon: 'none',
				duration: 2200
			})
			console.warn('[messagePop]', fallback || message, error)
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
		formatDateTime(value) {
			if (!value) return ''
			const date = new Date(value)
			if (Number.isNaN(date.getTime())) return String(value)
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${month}-${day} ${hour}:${minute}`
		}
	}
}
</script>
<style scoped>
.full-chat-popup {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f7fb;
	overflow: hidden;
}
.full-chat-header {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	padding: calc(20rpx + env(safe-area-inset-top)) 22rpx 18rpx;
	background: #fff;
	border-bottom: 1rpx solid #edf1f7;
}
.full-header-back,
.full-member-btn,
.full-archive-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.full-header-back {
	width: 58rpx;
	height: 58rpx;
	margin-right: 8rpx;
}
.full-header-main {
	flex: 1;
	min-width: 0;
}
.full-title-row {
	display: flex;
	align-items: center;
	min-width: 0;
}
.full-chat-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #172033;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.full-group-chip {
	margin-left: 10rpx;
	padding: 4rpx 10rpx;
	display: flex;
	align-items: center;
	border-radius: 999rpx;
	background: #eaf2ff;
	color: #2563ff;
	font-size: 19rpx;
	flex-shrink: 0;
}
.full-group-chip text { margin-left: 4rpx; }
.full-chat-subtitle {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #96a0b5;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.full-header-actions {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-left: 12rpx;
}
.full-archive-btn {
	height: 52rpx;
	padding: 0 16rpx;
	margin-right: 12rpx;
	border: 1rpx solid #b9d0ff;
	border-radius: 999rpx;
	color: #2563ff;
	font-size: 22rpx;
	box-sizing: border-box;
}
.full-archive-btn text { margin-left: 4rpx; }
.full-member-btn {
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #eef4ff;
}
.full-message-scroll {
	flex: 1;
	min-height: 0;
	padding: 24rpx 24rpx 18rpx;
	box-sizing: border-box;
}
.full-chat-state {
	min-height: 420rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #96a0b5;
}
.full-state-text {
	margin-top: 16rpx;
	font-size: 25rpx;
}
.full-msg-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 24rpx;
}
.full-msg-row.mine { justify-content: flex-end; }
.full-msg-avatar,
.archive-hero-avatar,
.member-list-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #eef4ff;
	overflow: hidden;
	flex-shrink: 0;
}
.full-msg-avatar {
	width: 70rpx;
	height: 70rpx;
	margin-right: 14rpx;
	border-radius: 22rpx;
}
.full-msg-avatar.mine {
	margin-right: 0;
	margin-left: 14rpx;
	background: #2f73ff;
}
.full-avatar-img { width: 100%; height: 100%; }
.full-msg-content {
	max-width: 76%;
	min-width: 0;
}
.full-msg-row.mine .full-msg-content {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}
.full-sender-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 8rpx;
}
.full-sender-row.mine { justify-content: flex-end; }
.full-sender-name {
	font-size: 23rpx;
	font-weight: 600;
	color: #344054;
}
.full-sender-role {
	margin-left: 8rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	background: #eef4ff;
	color: #2563ff;
	font-size: 19rpx;
}
.full-sender-time,
.full-mine-meta {
	font-size: 20rpx;
	color: #a1aabc;
}
.full-sender-time { margin-left: 10rpx; }
.full-bubble {
	padding: 18rpx 20rpx;
	border-radius: 8rpx 22rpx 22rpx 22rpx;
	background: #fff;
	box-shadow: 0 6rpx 18rpx rgba(28, 45, 85, 0.04);
	font-size: 27rpx;
	line-height: 1.55;
	color: #263247;
	word-break: break-word;
	box-sizing: border-box;
}
.full-msg-row.mine .full-bubble {
	border-radius: 22rpx 8rpx 22rpx 22rpx;
	background: #2f73ff;
	color: #fff;
}
.edited-mark {
	margin-left: 6rpx;
	font-size: 21rpx;
	color: #8a94a8;
}
.full-msg-row.mine .edited-mark { color: rgba(255, 255, 255, 0.82); }
.full-bubble.fail {
	background: #fff1f0;
	color: #cf1322;
}
.full-mine-meta {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-top: 8rpx;
}
.edit-message-btn {
	display: flex;
	align-items: center;
	margin-left: 14rpx;
	font-size: 21rpx;
	color: #2563ff;
}
.edit-message-btn text { margin-left: 3rpx; }
.full-chat-footer {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	position: relative;
	z-index: 2;
	min-height: 104rpx;
	padding: 16rpx 20rpx calc(18rpx + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1rpx solid #edf1f7;
	box-sizing: border-box;
}
.full-chat-input {
	flex: 1;
	height: 72rpx;
	line-height: 72rpx;
	padding: 0 24rpx;
	margin-right: 12rpx;
	background: #f3f6fb;
	border: 1rpx solid #e4e9f2;
	border-radius: 999rpx;
	font-size: 25rpx;
	color: #263247;
	box-sizing: border-box;
}
.send-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 20rpx;
	background: #2563eb;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
}
.send-btn.disabled {
	background: #b8d3ff;
	box-shadow: none;
}
.edit-chat-popup {
	width: 640rpx;
	padding: 34rpx 30rpx 30rpx;
	background: #fff;
	border-radius: 24rpx;
	box-sizing: border-box;
}
.edit-chat-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #172033;
	text-align: center;
}
.edit-original-box {
	margin-top: 28rpx;
	padding: 20rpx;
	background: #f5f7fb;
	border-radius: 16rpx;
}
.edit-original-label {
	display: block;
	margin-bottom: 10rpx;
	font-size: 22rpx;
	color: #8a94a8;
}
.edit-original-text {
	font-size: 26rpx;
	line-height: 1.5;
	color: #344054;
	word-break: break-word;
}
.edit-chat-textarea {
	width: 100%;
	height: 180rpx;
	margin-top: 22rpx;
	padding: 20rpx;
	background: #fff;
	border: 1rpx solid #dce3f0;
	border-radius: 16rpx;
	font-size: 26rpx;
	line-height: 1.5;
	color: #263247;
	box-sizing: border-box;
}
.edit-tip {
	margin-top: 16rpx;
	font-size: 21rpx;
	line-height: 1.5;
	color: #96a0b5;
}
.edit-actions {
	display: flex;
	margin-top: 28rpx;
}
.edit-action-btn {
	flex: 1;
	margin: 0 8rpx;
}
.archive-popup,
.member-popup {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f7fb;
	overflow: hidden;
}
.side-popup-header {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: calc(22rpx + env(safe-area-inset-top)) 24rpx 20rpx;
	background: #fff;
	border-bottom: 1rpx solid #edf1f7;
}
.side-title-wrap {
	display: flex;
	align-items: center;
	min-width: 0;
}
.side-title-icon {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 14rpx;
	border-radius: 18rpx;
}
.side-title-icon.blue { background: #eef4ff; }
.side-popup-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #172033;
}
.side-close {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.side-body-scroll {
	flex: 1;
	min-height: 0;
	padding: 22rpx 24rpx;
	box-sizing: border-box;
}
.archive-hero-card,
.archive-card,
.member-list-card {
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
	box-sizing: border-box;
}
.archive-hero-card {
	display: flex;
	align-items: center;
	padding: 28rpx;
}
.archive-hero-avatar {
	width: 96rpx;
	height: 96rpx;
	margin-right: 22rpx;
	border-radius: 28rpx;
}
.archive-hero-info {
	flex: 1;
	min-width: 0;
}
.archive-name-row,
.archive-sub-row,
.member-list-title-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}
.archive-name {
	margin-right: 14rpx;
	font-size: 34rpx;
	font-weight: 700;
	color: #182338;
}
.archive-gender-age {
	font-size: 25rpx;
	color: #677085;
}
.archive-sub-row {
	margin-top: 12rpx;
	justify-content: space-between;
	font-size: 24rpx;
	color: #677085;
}
.archive-card {
	margin-top: 20rpx;
	padding: 26rpx;
}
.archive-card-title {
	margin-bottom: 20rpx;
	font-size: 29rpx;
	font-weight: 700;
	color: #182338;
}
.archive-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 18rpx 0;
}
.archive-field {
	width: 50%;
	display: flex;
	flex-direction: column;
	padding-right: 16rpx;
	box-sizing: border-box;
}
.archive-label {
	margin-bottom: 8rpx;
	font-size: 22rpx;
	color: #96a0b5;
}
.archive-value {
	font-size: 26rpx;
	line-height: 1.45;
	color: #344054;
	word-break: break-all;
	margin-left: 12rpx;
}
.archive-value.strong {
	color: #2563ff;
	font-weight: 600;
}
.diagnosis-row {
	padding: 18rpx 0;
	border-top: 1rpx solid #f0f2f7;
}
.diagnosis-row .archive-value { margin-top: 8rpx; }
.archive-footer {
	flex-shrink: 0;
	padding: 16rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1rpx solid #edf1f7;
}
.member-desc {
	flex-shrink: 0;
	padding: 18rpx 24rpx 0;
	font-size: 23rpx;
	line-height: 1.5;
	color: #96a0b5;
}
.member-body { padding-top: 18rpx; }
.member-list-card {
	display: flex;
	align-items: center;
	padding: 24rpx;
	margin-bottom: 18rpx;
}
.member-list-avatar {
	width: 82rpx;
	height: 82rpx;
	margin-right: 18rpx;
	border-radius: 24rpx;
}
.member-list-info {
	flex: 1;
	min-width: 0;
}
.member-list-name {
	margin-right: 10rpx;
	font-size: 28rpx;
	font-weight: 700;
	color: #182338;
}
.member-list-role {
	padding: 3rpx 12rpx;
	border-radius: 999rpx;
	background: #eef4ff;
	color: #2563ff;
	font-size: 20rpx;
}
.member-list-remark {
	display: block;
	margin-top: 10rpx;
	font-size: 23rpx;
	color: #8b95a9;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
