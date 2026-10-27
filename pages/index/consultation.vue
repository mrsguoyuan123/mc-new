<template>
	<view class="chat-page">
		<view class="top-bar">
			<!-- 状态栏占位 -->
			<view class="status-bar" :style="{height:((statusBarHeight +menuButton.height)||0)+'px'}"></view>
			<!-- 自定义导航栏 -->
			<view class="custom-nav">
				<!-- 返回按钮 -->
				<view class="nav-back" @click="handleBack()">
					<u-icon name="arrow-left" color="#222" size="36rpx"></u-icon>
				</view>
				<!-- 中间标题 -->
				<!-- <view :style="{marginRight: menuButton.width + 'px'}"> -->
				<view class="nav-title">
					<view>{{ (currentConversation && currentConversation.name) || '我的私人医生团队' }}</view>
					<view class="u-flex flex-start align-center">
						<u-badge :isDot="true" type="success"></u-badge>
						<view class="font-s font-info margin-left-5">团队在线响应中</view>
					</view>
				</view>
				<!-- 点击星星打开评价弹窗 -->
				<view class="star-wrapper" @click="openEvaluation">
					<u-icon name="star-fill" color="#d08700" size="40rpx"></u-icon>
				</view>
				<!-- 右侧按钮区域，可放多个按钮 -->
				<view class="call-btn u-flex flex-start align-center" @click="requestManualService">
					<text class="custom-icon custom-icon-Headset1 margin-right-5"
						style="font-size:30rpx;color:#fff;"></text>
					<view>{{ manualLoading ? '转接中...' : '转人工服务' }}</view>
				</view>
			</view>
			<!-- <view :style="{ width: menuButton.width + 'px' }"></view> -->
			<!-- </view> -->
		</view>
		<!-- 聊天消息滚动区域 -->
		<scroll-view scroll-y class="chat-scroll" :scroll-top="scrollTop" @scrolltolower="onScrollToLower"
			@scroll="onScrollHandler">
			<!-- 频道标签 -->
			<view class="tag-wrapper">
				<u-tag size="mini" text="官方医疗咨询频道" shape="circle" color="#99a1af" bgColor="#eff1f3"
					borderColor="#eff1f3"></u-tag>
			</view>
			<view class="message-list">
				<view v-if="pageLoading" class="state-box">
					<u-loading-icon mode="circle" color="#155dfc" size="36"></u-loading-icon>
					<view class="state-text">正在加载会话...</view>
				</view>
				<view v-else-if="!conversationList.length" class="state-box">
					<u-icon name="chat" color="#9aa3af" size="72rpx"></u-icon>
					<view class="state-title">暂无可咨询的会话</view>
					<view class="state-text">请稍后返回消息列表重新进入</view>
					<view class="state-btn" @click="fetchConversations">重新加载</view>
				</view>
				<block v-else>
					<view v-if="messageLoading" class="state-box compact">
						<u-loading-icon mode="circle" color="#155dfc" size="28"></u-loading-icon>
						<view class="state-text">正在加载历史消息...</view>
					</view>
					<view v-else-if="!chatList.length" class="state-box compact">
						<u-icon name="edit-pen" color="#9aa3af" size="64rpx"></u-icon>
						<view class="state-title">暂无聊天记录</view>
						<view class="state-text">请输入您要咨询的问题</view>
					</view>
				<view v-for="(msg, idx) in chatList" :key="msg.id || idx" class="msg-item" :class="[msg.type]"
					@longpress="handleLongPress(msg, idx)">
					<!-- 长按弹出菜单 -->
					<!-- <view v-if="showLongMenuIndex === idx" class="longpress-menu">
						<view class="menu-item" @click="copyMsg(msg)">复制</view>
						<view class="menu-item" @click="deleteMsg(idx)">删除</view>
					</view> -->
					<!-- 头像 -->
					<view class="avatar">
						<text v-if="msg.type === 'other'" class="avatar-white">
							<text class="custom-icon custom-icon-message-circle "
								style="font-size:40rpx;color:#a1a8b5;"></text>
						</text>
						<text v-if="msg.type === 'mine'" class="avatar-blue">
							<text class="custom-icon custom-icon-user" style="font-size:40rpx;color:#fff;"></text>
						</text>
					</view>
					<view class="msg-content">
						<view class="msg-wrap">
							<!-- 对方才显示发送人昵称 -->
							<view v-if="msg.type === 'other'" class="sender-name">
								{{ msg.name }}
							</view>
							<!-- 文本气泡 -->
							<view v-if="msg.msgType === 'text'" class="bubble">{{ msg.content }}</view>
							<!-- 图片消息气泡 -->
							<view v-if="msg.msgType === 'image'" class="bubble bubble-img">
								<image :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)"></image>
							</view>

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
										{{ msg.description || '健康数据已加密同步，请等待健康管理团队查看。' }}
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
							<!-- <text v-if="msg.type==='mine'" class="read-tag">{{ msg.isRead ? '已读' : '未读' }}</text> -->
						</view>
					</view>
				</view>
				</block>
				<view class="scroll-safe-bottom"></view>
			</view>
		</scroll-view>
		<!-- ==========底部操作栏 ========== -->
		<view class="chat-footer">
			<view class="quick-btn-group">
				<scroll-view scroll-x class="quick-scroll" :show-scrollbar="false">
					<view class="quick-scroll-inner">
						<view class="quick-btn active">咨询我的私人医生团队</view>
						<view v-for="item in replyTemplates" :key="item.id || item.content" class="quick-btn"
							@click="useReplyTemplate(item)">
							{{ item.name || item.content }}
						</view>
					</view>
				</scroll-view>
				<view class="quick-btn" @click="showUploadPopup = true">上传照片</view>
			</view>
			<view class="input-row">
				<input v-model="inputText" class="chat-input mr-16" placeholder="描述您的不适..." confirm-type="send"
					@confirm="handleSend" :disabled="sendingMessage" />
				<view class="send-btn" :class="{ disabled: sendingMessage }" @click="handleSend">
					<text class="custom-icon custom-icon-navigation " style="font-size:40rpx;color:#fff;"></text>
				</view>
			</view>
			<view v-if="sendingMessage" class="sending-tip">发送中...</view>
		</view>

		<u-popup :show="showUploadPopup" :round="20" mode="bottom">
			<view class="upload-popup">
				<view class="popup-header">
					<view class="popup-title">上传照片</view>
					<view class="popup-close" @click="showUploadPopup=false">
						<u-icon name="close" color="#111" size="30rpx"></u-icon>
					</view>
				</view>
				<view class="popup-btn-row">
					<view class="popup-btn-item mr-40" @click="takeCamera">
						<view class="popup-icon">
							<u-icon name="camera" color="#155dfc" size="80rpx"></u-icon>
						</view>
						<view>拍照</view>
					</view>
					<view class="popup-btn-item" @click="openAlbum">
						<view class="popup-icon">
							<u-icon name="photo" color="#155dfc" size="80rpx"></u-icon>
						</view>
						<view>相册</view>
					</view>
				</view>
			</view>
		</u-popup>
		<!-- 服务评价弹窗 -->
		<u-popup :show="showEvaluatePopup" mode="bottom" :round="20">
			<view class="evaluate-popup">
				<view class="popup-header">
					<view class="popup-title">服务评价</view>
					<view class="popup-close" @click="resetEva ">
						<u-icon name="close" color="#111" size="30rpx"></u-icon>
					</view>
				</view>
				<view class="evaluate-desc">请为您收到的答复打分</view>
				<!-- 星星评分 -->
				<view class="star-rate">
					<u-icon v-for="n in 5" :key="n" :name="n <= rateScore ? 'star-fill' : 'star'"
						:class="{ 'mr-16': n !== 5 }" :color="n <= rateScore ? '#d08700' : '#ddd'" size="60rpx"
						@click="rateScore = n">
					</u-icon>
				</view>

				<view class="rate-tip">
					{{ rateScore>0 ? scoreText[rateScore] : '点击星星评分' }}
				</view>
				<!-- 标签选择 -->
				<view class="tag-group">
					<view v-for="(tag, idx) in tagList" :key="tag" class="tag-item" :class="{
									'active': selectTagList.includes(tag),
									'mr-16': idx !== tagList.length - 1
								}" @click="toggleTag(tag)">
						{{tag}}
					</view>
				</view>
				<!-- 文本域 -->
				<textarea class="eva-textarea" v-model="evaText" placeholder="还有什么想对我们说的吗？您的反馈对我们非常重要..."></textarea>
				<u-button class="submit-eva-btn" type="primary" @click="submitEvaluate" :loading="evaluating"
					:disabled="rateScore === 0 || evaluating">
					<u-icon name="thumb-up" color="#fff"></u-icon> 提交评价
				</u-button>
			</view>
		</u-popup>

		<main-tabbar :current="2"></main-tabbar>
	</view>
</template>
<script>
    import {
        getMeConversationsApi,
        getConversationsByIdMessagesApi,
        postMeConversationsByIdEvaluationApi,
        postMeConversationsByIdManualServiceApi,
        postConversationsByIdMessagesApi,
        postFilesUploadApi,
        getReplyTemplatesApi
    } from '@/api/frontApikit.js'
    import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'
    import {
        mapState
    } from 'vuex'
    export default {
        options: {
            styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
        },
        components: {
            mainTabbar
        },
        computed: {
            ...mapState([
                'statusBarHeight',
                'menuButton',
                'navContentHeight',
                'navBarTotalHeight'
            ])
        },
        data() {
            return {
                id: '',
                conversationId: '',
                routeConversationId: '',
                conversationList: [],
                currentConversation: null,
                healthOption: {},
                pendingHealth: null,
                scrollTop: 0,
                realScrollTop: 0, //记录scroll-view真实内部滚动位置
                inputText: '',
                pageLoading: false,
                messageLoading: false,
                sendingMessage: false,
                manualLoading: false,
                evaluating: false,
                showLongMenuIndex: -1,
                showUploadPopup: false,
                showEvaluatePopup: false,
                scrollTimer: null,
                msgRefreshTimer: null, // 消息刷新定时器
                scoreText: {
                    1: '非常差',
                    2: '较差',
                    3: '一般',
                    4: '满意',
                    5: '非常满意'
                },
                rateScore: 0,
                evaText: '',
                tagList: ['专业度高', '回复及时', '态度亲切', '建议实用', '沟通顺畅'],
                selectTagList: [],
                chatList: [],
                replyTemplates: [],
                templateLoading: false
            }
        },
        onReady() {
            this.scrollToBottom()
        },
        onLoad(options) {
          
            this.parseQuery(options)
            this.fetchConversations()
            // this.fetchReplyTemplates()
        },
        onUnload() {
            if (this.scrollTimer) {
                clearTimeout(this.scrollTimer)
                this.scrollTimer = null
            }
            // 清理消息刷新定时器
            if (this.msgRefreshTimer) {
                clearTimeout(this.msgRefreshTimer)
                this.msgRefreshTimer = null
            }
        },
        methods: {
            async fetchConversations() {
                this.pageLoading = true
                try {
                    const result = await getMeConversationsApi()
                    const sourceList = Array.isArray(result) ? result :
                        (result && (result.conversations || result.list || result.records)) || []
                    this.conversationList = sourceList
                        .filter(item => item && item.type !== 'system')
                        .map(item => this.normalizeConversation(item))
                    const targetId = this.routeConversationId ||
                        (this.pendingHealth && this.pendingHealth.conversationId) || ''
                    const target = this.conversationList.find(item => String(item.id) === String(targetId))
                    await this.selectConversation(target || this.conversationList[0] || null)
                } catch (e) {
                    console.log('获取会话列表失败：', e)
                } finally {
                    this.pageLoading = false
                }
            },
            normalizeConversation(item) {
                const conversation = Object.assign({}, item)
                conversation.timeText = this.formatTime(item.time || item.lastMsgAt || item.updateTime || item.createTime)
                conversation.unread = Number(item.unread || 0)
                return conversation
            },
            async selectConversation(conversation) {
                console.log(conversation)
                if (!conversation) {
                    this.currentConversation = null
                    this.conversationId = ''
                    this.id = ''
                    this.chatList = []
                    return
                }
                this.currentConversation = conversation
                this.conversationId = conversation.id
                this.id = conversation.id
                conversation.unread = 0
                this.inputText = ''
                await this.loadMessages(conversation)
                if (this.pendingHealth) {
                    this.sendHealthCard()
                }
            },
            async loadMessages(conversation, options) {
                console.log(this.routeConversationId)
                console.log('id',conversation.id)
                options = options || {}
                if (!options.silent) this.messageLoading = true
                try {
                    const localMessages = this.extractMessages(conversation)
                    let serverMessages = []
                    try {
                        const result = await getConversationsByIdMessagesApi({
                            id: conversation.id,
                            size: 50
                        })
                        serverMessages = Array.isArray(result) ? result :
                            (result && (result.list || result.records || result.messages)) || []
                    } catch (msgError) {
                        console.log('获取历史消息失败：', msgError)
                        if (options.silent) return false
                    }
                    const sourceMessages = serverMessages.length ? serverMessages : localMessages
                    this.chatList = (sourceMessages || []).map((item, index) => this.normalizeMessage(item, index))
                    if (!this.chatList.length && conversation.lastMsg) {
                        this.chatList = [{
                            id: 'welcome_' + conversation.id,
                            type: 'other',
                            name: conversation.name || '私人健康顾问',
                            msgType: 'text',
                            content: conversation.lastMsg,
                            time: conversation.timeText,
                            isRead: true
                        }]
                    }
                    this.scrollToBottom()
                    return true
                } finally {
                    if (!options.silent) this.messageLoading = false
                }
            },
            extractMessages(conversation) {
                if (!conversation) return []
                return conversation.messages || conversation.messageList || conversation.records ||
                    conversation.chatList || conversation.list || []
            },
            normalizeMessage(msg, index) {
                const raw = msg || {}
                const wireType = String(raw.type || raw.msgType || 'TEXT').toUpperCase()
                const senderType = String(raw.senderType || raw.senderRole || raw.role || '').toUpperCase()
                const isMine = raw.type === 'mine' || raw.mine === true || raw.self === true ||
                    raw.fromMe === true || raw.direction === 'outbound' || senderType === 'PATIENT'
                let extra = {}
                if (raw.extraJson) {
                    try {
                        extra = typeof raw.extraJson === 'string' ? JSON.parse(raw.extraJson) : raw.extraJson
                    } catch (e) {
                        extra = {}
                    }
                }
                const senderName = raw.senderName || raw.staffName || raw.doctorName || raw.name ||
                    (isMine ? '我' : this.getSenderDefaultName(raw.senderType))
                let msgType = 'text'
                if (wireType === 'IMAGE' || raw.msgType === 'image') msgType = 'image'
                if (wireType === 'HEALTH_CARD' || raw.msgType === 'health') msgType = 'health'
                const imageUrl = raw.imageUrl || raw.image || raw.url || raw.fileUrl || extra.imageUrl || raw.img || ''
                const healthType = this.normalizeHealthType(
                    raw.healthType || extra.healthType || this.healthOption.healthType || ''
                )
                const healthLabel = this.getHealthLabel(healthType)
                const description = raw.description || extra.description || raw.desc ||
                    (wireType === 'HEALTH_CARD' ? (raw.content || '') : '')
                return {
                    id: raw.id || raw.messageId || raw.clientSeq || ('msg_' + index),
                    clientSeq: raw.clientSeq || '',
                    type: isMine ? 'mine' : 'other',
                    name: senderName,
                    msgType,
                    content: raw.content || raw.text || raw.message || raw.body ||
                        (wireType === 'CALL_RECORD' ? '康复进度同步通话记录' : ''),
                    imageUrl,
                    img: imageUrl,
                    healthType,
                    healthLabel,
                    description,
                    time: this.formatTime(raw.createTime || raw.time || raw.sendTime || raw.updateTime),
                    isRead: raw.isRead !== false,
                    sending: raw.sending === true,
                    failed: raw.failed === true,
                    raw
                }
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
                    AI: '私人健康顾问',
                    CS: '人工客服',
                    CAREGIVER: '陪诊师',
                    DOCTOR: '医生',
                    SYSTEM: '系统通知'
                }
                return nameMap[senderType] || '健康管理团队'
            },
            openEvaluation() {
                if (!this.conversationId) {
                    uni.showToast({ title: '暂无可评价的会话', icon: 'none' })
                    return
                }
                this.showEvaluatePopup = true
            },
            async fetchReplyTemplates() {
                if (this.templateLoading) return
                this.templateLoading = true
                try {
                    const result = await getReplyTemplatesApi()
                    const list = Array.isArray(result) ? result :
                        (result && (result.list || result.records || result.data)) || []
                    this.replyTemplates = list
                        .filter(item => item && item.status !== 0 && (item.content || item.name))
                        .map(item => ({
                            id: item.id,
                            name: item.name || item.title || item.content,
                            content: item.content || item.name || item.title || '',
                            type: item.type,
                            surgeryType: item.surgeryType
                        }))
                } catch (e) {
                    console.log('获取快捷回复模板失败：', e)
                } finally {
                    this.templateLoading = false
                }
            },
            useReplyTemplate(item) {
                const content = item && item.content ? item.content : ''
                if (!content) return
                this.inputText = content
                this.sendMessage(content)
            },
            async requestManualService() {
                if (!this.conversationId || this.manualLoading) return
                this.manualLoading = true
                try {
                    await postMeConversationsByIdManualServiceApi({
                        id: this.conversationId
                    })
                    uni.showToast({ title: '已为您转接人工客服', icon: 'success' })
                } catch (e) {
                    console.log('转人工失败：', e)
                } finally {
                    this.manualLoading = false
                }
            },
            buildLocalMessage(type, content, extra) {
                const clientSeq = 'local_' + Date.now() + '_' + Math.random().toString(16).slice(2)
                return Object.assign({
                    id: clientSeq,
                    clientSeq,
                    type: 'mine',
                    msgType: type,
                    content,
                    time: this.getTimeStr(),
                    isRead: false,
                    sending: true,
                    failed: false
                }, extra || {})
            },
            normalizeFileUrl(url) {
                if (url === null || url === undefined) return ''
                let value = String(url).trim()
                if (!value) return ''
                if (value.indexOf('{') === 0 || value.indexOf('[') === 0) return ''
                if (/^(https?:|wxfile:|blob:|data:|\.\/|file:|cloud:|static\/|@\/)/i.test(value)) return value
                if (/^[a-zA-Z]:[\\/]/.test(value)) return value
                if (value.indexOf('/files/') === 0) {
                    return 'http://followup.ijunyuan.cn/api/v1' + value
                }
                if (value.indexOf('/') === 0) return value
                if (value.indexOf('/') === -1) return value
                return 'http://followup.ijunyuan.cn/api/v1/files/' + value.replace(/^\/+/, '')
            },
            extractUploadedFileUrl(result) {
                if (!result) return ''
                if (typeof result === 'string') return this.normalizeFileUrl(result)
                if (Array.isArray(result)) {
                    for (let i = 0; i < result.length; i++) {
                        const url = this.extractUploadedFileUrl(result[i])
                        if (url) return url
                    }
                    return ''
                }
                const directKeys = ['url', 'fileUrl', 'imageUrl', 'accessUrl', 'downloadUrl', 'previewUrl',
                    'fullUrl', 'filePath', 'path', 'src', 'fileName', 'urlPath', 'remoteUrl', 'fullPath'
                ]
                for (let i = 0; i < directKeys.length; i++) {
                    const url = this.normalizeFileUrl(result[directKeys[i]])
                    if (url) return url
                }
                if (result.dir && result.filename) {
                    return this.normalizeFileUrl(String(result.dir).replace(/\/$/, '') + '/' + result.filename)
                }
                if (result.data && result.data !== result) {
                    const nestedUrl = this.extractUploadedFileUrl(result.data)
                    if (nestedUrl) return nestedUrl
                }
                const nestedKeys = ['file', 'image', 'attachment', 'result', 'record']
                for (let j = 0; j < nestedKeys.length; j++) {
                    if (result[nestedKeys[j]] && typeof result[nestedKeys[j]] === 'object') {
                        const nestedUrl = this.extractUploadedFileUrl(result[nestedKeys[j]])
                        if (nestedUrl) return nestedUrl
                    }
                }
                return ''
            },
            async refreshMessagesAfterSend(localMessage) {
                const previousList = this.chatList.slice()
                const refreshed = await this.loadMessages(this.currentConversation, {
                    silent: true
                })
                if (!refreshed) {
                    this.chatList = previousList
                } else {
                    let sameIndex = -1
                    const exists = this.chatList.some((msg, index) => {
                        const sameId = msg.id && localMessage.id && String(msg.id) === String(localMessage.id)
                        const sameClientSeq = msg.clientSeq && localMessage.clientSeq &&
                            msg.clientSeq === localMessage.clientSeq
                        let sameContent = false
                        if (msg.type === 'mine' && msg.msgType === localMessage.msgType) {
                            if (localMessage.msgType === 'image') {
                                const localImage = localMessage.imageUrl || localMessage.img || ''
                                const serverImage = msg.imageUrl || msg.img || ''
                                sameContent = (localImage && serverImage === localImage) || msg.time === localMessage.time
                            } else if (localMessage.msgType === 'health') {
                                sameContent = msg.content === localMessage.content &&
                                    (msg.healthType || '') === (localMessage.healthType || '')
                            } else {
                                sameContent = !!msg.content && msg.content === localMessage.content
                            }
                        }
                        const matched = sameId || sameClientSeq || sameContent
                        if (matched) sameIndex = index
                        return matched
                    })
                    if (sameIndex > -1) {
                        const serverMessage = this.chatList[sameIndex]
                        serverMessage.sending = false
                        serverMessage.failed = false
                        serverMessage.isRead = true
                        this.$set(this.chatList, sameIndex, serverMessage)
                        localMessage.sending = false
                        localMessage.failed = false
                        localMessage.isRead = true
                        this.scrollToBottom()
                        return
                    }
                    if (!exists) this.chatList.push(localMessage)
                }
                localMessage.sending = false
                localMessage.failed = false
                localMessage.isRead = true
                this.scrollToBottom()
            },
            async sendMessage(contentOverride) {
                const text = String(contentOverride || this.inputText || '').trim()
                if (!text) {
                    uni.showToast({ title: '请输入咨询内容', icon: 'none' })
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
                this.scrollToBottom()
                try {
                    await postConversationsByIdMessagesApi({
                        id: this.conversationId,
                        type: 'TEXT',
                        content: text,
                        clientSeq
                    })
                    // 清除上一次刷新定时器
                    clearTimeout(this.msgRefreshTimer)
                    const that = this
                    this.msgRefreshTimer = setTimeout(async () => {
                        await that.refreshMessagesAfterSend(localMessage)
                        that.scrollToBottom()
                    }, 1500)
                } catch (e) {
                    localMessage.sending = false
                    localMessage.failed = true
                    this.inputText = text
                    console.log('发送消息失败：', e)
                } finally {
                    this.sendingMessage = false
                    this.scrollToBottom()
                }
            },
            async sendHealthCard() {
                const healthData = this.pendingHealth
                if (!healthData || !this.conversationId) return
                this.healthOption = healthData
                const healthType = this.normalizeHealthType(healthData.healthType)
                const healthLabel = this.getHealthLabel(healthType)
                const image = healthData.img || healthData.imageUrl || healthData.image || ''
                const description = healthData.description || healthData.content ||
                    healthData.message || healthLabel + '数据已加密同步，请等待健康管理团队查看。'
                const extraJson = Object.assign({}, healthData, {
                    healthType,
                    description
                })
                if (image) extraJson.imageUrl = image
                const clientSeq = 'health_' + Date.now() + '_' + Math.random().toString(16).slice(2)
                const localMessage = this.buildLocalMessage('health', description, {
                    clientSeq,
                    img: image,
                    imageUrl: image,
                    healthType,
                    healthLabel,
                    description,
                    isRead: false
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
                        extraJson: JSON.stringify(extraJson),
                        clientSeq
                    })
                    clearTimeout(this.msgRefreshTimer)
                    const that = this
                    this.msgRefreshTimer = setTimeout(async () => {
                        await that.refreshMessagesAfterSend(localMessage)
                        that.scrollToBottom()
                    }, 1500)
                } catch (e) {
                    localMessage.sending = false
                    localMessage.failed = true
                    this.pendingHealth = healthData
                    console.log('发送健康卡片失败：', e)
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
                this.scrollToBottom()
                try {
                    const uploadResult = await postFilesUploadApi({
                        filePath,
                        name: 'file',
                        dir: 'chat'
                    })
                    const imageUrl = this.extractUploadedFileUrl(uploadResult)
                    if (!imageUrl) throw new Error('图片地址解析失败')
                    await postConversationsByIdMessagesApi({
                        id: this.conversationId,
                        type: 'IMAGE',
                        content: '',
                        imageUrl,
                        clientSeq
                    })
                    localMessage.imageUrl = imageUrl
                    localMessage.img = imageUrl

                    clearTimeout(this.msgRefreshTimer)
                    const that = this
                    this.msgRefreshTimer = setTimeout(async () => {
                        await that.refreshMessagesAfterSend(localMessage)
                        that.scrollToBottom()
                    }, 1500)
                } catch (e) {
                    localMessage.sending = false
                    localMessage.failed = true
                    console.log('发送图片失败：', e)
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
                if (options.conversationId) this.routeConversationId = options.conversationId
                if (options.id && !this.routeConversationId) this.routeConversationId = options.id
                if (!options.data || options.data === 'undefined') return
                 

                try {
                    const data = JSON.parse(decodeURIComponent(options.data))
                    if (data && (data.healthType || data.msgType === 'health' || data.messageType === 'HEALTH_CARD')) {
                        this.pendingHealth = data
                        this.healthOption = data
                        if (data.conversationId) this.routeConversationId = data.conversationId
                    } else if (data && data.id) {
                        this.routeConversationId = data.id
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
                this.$nextTick(() => {
                    if (this.scrollTimer) clearTimeout(this.scrollTimer)
                    this.scrollTop = 99998
                    this.scrollTimer = setTimeout(() => {
                        this.scrollTop = 99999
                    }, 60)
                })
            },
            getTimeStr() {
                const now = new Date()
                return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
            },
            formatTime(value) {
                if (!value) return ''
                if (typeof value === 'string' && /^\d{1,2}:\d{1,2}$/.test(value)) return value
                const normalized = typeof value === 'string' ? value.replace('T', ' ').replace(/-/g, '/') : value
                const date = new Date(normalized)
                if (isNaN(date.getTime())) return value
                const now = new Date()
                const pad = num => String(num).padStart(2, '0')
                const hm = `${pad(date.getHours())}:${pad(date.getMinutes())}`
                const sameDay = date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
                return sameDay ? hm : `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hm}`
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
                        url: '/pages/index/home'
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

            takeCamera() {
                uni.chooseImage({
                    count: 1,
                    sourceType: ['camera'],
                    success: (res) => {
                        this.showUploadPopup = false
                        if (!res || !res.tempFilePaths || res.tempFilePaths.length === 0) {
                            return
                        }
                        this.sendImageMessage(res.tempFilePaths[0])
                    }
                })
            },
            openAlbum() {
                uni.chooseImage({
                    count: 1,
                    sourceType: ['album'],
                    success: (res) => {
                        this.showUploadPopup = false
                        if (!res || !res.tempFilePaths || res.tempFilePaths.length === 0) {
                            return
                        }
                        this.sendImageMessage(res.tempFilePaths[0])
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
                if (msg.msgType === 'text') {
                    uni.setClipboardData({
                        data: msg.content
                    })
                }
                this.showLongMenuIndex = -1
            },
            deleteMsg(idx) {
                this.chatList.splice(idx, 1)
                this.showLongMenuIndex = -1
            },
            onReceivePushMsg(serverMsg) {
                const message = this.normalizeMessage(serverMsg, this.chatList.length)
                const exists = this.chatList.some(item => String(item.id) === String(message.id))
                if (!exists) this.chatList.push(message)
                this.scrollToBottom()
            },
            onScrollToLower() {
                //加载历史消息
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
            async submitEvaluate() {
                if (!this.conversationId || this.rateScore === 0 || this.evaluating) return
                this.evaluating = true
                try {
                    await postMeConversationsByIdEvaluationApi({
                        id: this.conversationId,
                        targetRole: 'CS',
                        rating: this.rateScore,
                        tags: this.selectTagList,
                        comment: this.evaText
                    })
                    uni.showToast({ title: '评价提交成功', icon: 'success' })
                    this.showEvaluatePopup = false
                    this.rateScore = 0
                    this.selectTagList = []
                    this.evaText = ''
                } catch (e) {
                    console.log('提交评价失败：', e)
                } finally {
                    this.evaluating = false
                }
            }
        }
    }
</script>

<style scoped>
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
		height: calc(100vh - 250px);
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
		background-color: #2b69e8;
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
		background: #155dfc;
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
		color: #2b69e8;
		margin-bottom: 6rpx;
	}

	.bubble {
		padding: 24rpx 28rpx;
		border-radius: 20rpx;
		background: #ffffff;
		font-size: 24rpx;
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
		background-color: #2169f3;
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
		color: #2169f3;
		font-weight: 700;
	}

	/*对方气泡：左上小圆角*/
	.msg-item.other .bubble {
		border-top-left-radius: 0;
	}

	/*我方气泡：右上小圆角*/
	.msg-item.mine .bubble {
		background: #2563eb;
		color: #ffffff;
		border-top-right-radius: 0;
	}

	/* 图片气泡 */
	.bubble-img {
		background: #2563eb;
		border-top-right-radius: 0;
		overflow: hidden;
	}

	.bubble-img image {
		width: 320rpx;
		height: 320rpx;
	}

	.msg-item.other .bubble-img {
		border-top-left-radius: 0;
	}

	.msg-item.mine .bubble-img {
		border-top-right-radius: 0;
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
		border-radius: 30rpx;
		margin: 20rpx;
		/* margin-bottom: 140rpx; */
		position: absolute;
		/* bottom: 60px; */
		left: 20rpx;
		right: 20rpx;
		bottom: 120rpx;
		bottom: calc(120rpx + constant(safe-area-inset-bottom));
		bottom: calc(120rpx + env(safe-area-inset-bottom));

		/* height: 200rpx; */
		/* margin-bottom: 30rpx; */
	}

	.quick-btn-group {
		display: flex;
		margin-bottom: 20rpx;
		font-size: 18rpx;
		align-items: center;
	}

	.quick-scroll {
		flex: 1;
		min-width: 0;
	}

	.quick-scroll-inner {
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	.quick-scroll-inner .quick-btn {
		margin-right: 14rpx;
	}

	.quick-btn {
		padding: 14rpx 32rpx;
		border-radius: 40rpx;
		background: #f3f4f6;
		font-size: 20rpx;
		font-weight: bold;
		flex-shrink: 0;
	}

	.quick-btn.active {
		background: #e8f0ff;
		color: #2563eb;
	}

	.quick-btn-group > .quick-btn {
		margin-left: 14rpx;
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
		background: #2563eb;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
	}

	/* 上传照片弹窗样式 */
	.upload-popup {
		padding: 40rpx;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.popup-title {
		font-size: 34rpx;
		font-weight: bold;
	}

	.popup-close {
		font-size: 40rpx;
		color: #888;
		padding: 10rpx;
	}

	.popup-btn-row {
		display: flex;
	}

	.popup-btn-item {
		flex: 1;
		text-align: center;
		padding: 40rpx 20rpx;
		background: #f7f8fa;
		border-radius: 24rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.popup-icon {
		/* font-size: 60rpx; */
		background-color: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		width: fit-content;
		;
		margin-bottom: 16rpx;

	}

	/*评价弹窗*/
	.evaluate-popup {
		/* width: 620rpx; */
		padding: 40rpx;
	}

	.evaluate-desc {
		text-align: center;
		color: #666;
		font-size: 28rpx;
		margin-bottom: 30rpx;
	}

	.star-rate {
		display: flex;
		justify-content: center;
		margin-bottom: 20rpx;
	}

	.rate-tip {
		text-align: center;
		font-size: 28rpx;
		color: #444;
		margin-bottom: 40rpx;
	}

	.tag-group {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 40rpx;
	}

	.tag-item {
		padding: 12rpx 20rpx;
		border-radius: 40rpx;
		background: #f3f4f6;
		font-size: 18rpx;
		margin-bottom: 16rpx;
	}

	.tag-item.active {
		background: #e8f0ff;
		color: #2563eb;
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

	.state-box {
		padding: 90rpx 32rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.state-box.compact {
		padding: 44rpx 32rpx;
	}

	.state-title {
		margin-top: 20rpx;
		font-size: 30rpx;
		color: #222;
		font-weight: 600;
	}

	.state-text {
		margin-top: 12rpx;
		font-size: 26rpx;
		color: #8a919f;
		text-align: center;
	}

	.state-btn {
		margin-top: 28rpx;
		padding: 16rpx 40rpx;
		border-radius: 999rpx;
		background: #155dfc;
		color: #fff;
		font-size: 26rpx;
	}

	.msg-fail {
		font-size: 24rpx;
		color: #e34d59;
		margin-left: 12rpx;
	}

	.send-btn.disabled {
		opacity: 0.55;
	}

	.sending-tip {
		padding-top: 12rpx;
		font-size: 22rpx;
		color: #8a919f;
		text-align: right;
	}
</style>
