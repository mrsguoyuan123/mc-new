<template>
	<view class="chat-page">
		<view class="top-bar">
			<!-- 状态栏占位 -->
			<view class="status-bar"></view>
			<!-- 自定义导航栏 -->
			<view class="custom-nav">
				<!-- 返回按钮 -->
				<view class="nav-back" @click="handleBack()">
					<u-icon name="arrow-left" color="#222" size="36rpx"></u-icon>
				</view>
				<!-- 中间标题 -->
				<view class="nav-title">
					<view>我的私人医生团队</view>
					<view class="u-flex flex-start align-center">
						<u-badge :isDot="true" type="success"></u-badge>
						<view class="font-s font-info margin-left-5">团队在线响应中</view>
					</view>
				</view>
				<!-- 点击星星打开评价弹窗 -->
				<view class="star-wrapper" @click="showEvaluatePopup = true">
					<u-icon name="star-fill" color="#d08700" size="40rpx"></u-icon>
				</view>
				<!-- 右侧按钮区域，可放多个按钮 -->
				<view class="call-btn u-flex flex-start align-center">
					<text class="custom-icon custom-icon-Headset1 margin-right-5"
						style="font-size:30rpx;color:#fff;"></text>
					<view>呼叫我的私人医生团队</view>
				</view>
			</view>
		</view>
		<!-- 聊天消息滚动区域 -->
		<scroll-view scroll-y class="chat-scroll" :scroll-top="scrollTop" @scrolltolower="onScrollToLower">
			<!-- 频道标签 -->
			<view class="tag-wrapper">
				<u-tag size="mini" text="官方医疗咨询频道" shape="circle" color="#99a1af" bgColor="#eff1f3"
					borderColor="#eff1f3"></u-tag>
			</view>
			<view class="message-list">
				<view v-for="(msg, idx) in chatList" :key="idx" class="msg-item" :class="[msg.type]"
					@longpress="handleLongPress(msg, idx)">
					<!-- 长按弹出菜单 -->
					<view v-if="showLongMenuIndex === idx" class="longpress-menu">
						<view class="menu-item" @click="copyMsg(msg)">复制</view>
						<view class="menu-item" @click="deleteMsg(idx)">删除</view>
					</view>
					<!-- 头像 -->
					<view class="avatar">
						<text v-if="msg.type === 'other'" class="avatar-white">
							<text class="custom-icon custom-icon-message-circle "
								style="font-size:40rpx;color:#a1a8b5;"></text>
						</text>
						<text v-if="msg.type === 'mine'" class="avatar-blue">
							<u-icon name="account" color="#fff" size="40rpx"></u-icon>
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
							<view v-if="msg.msgType === 'image'" class="bubble-img">
								<image :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)">
								</image>
							</view>
						</view>
						<!-- =========时间已读移到气泡外面========= -->
						<view class="msg-footer">
							<text class="msg-time">{{ msg.time }}</text>
							<!-- <text v-if="msg.type==='mine'" class="read-tag">{{ msg.isRead ? '已读' : '未读' }}</text> -->
						</view>
					</view>
				</view>
				<view class="scroll-safe-bottom"></view>
			</view>
		</scroll-view>
		<!-- ==========底部操作栏 ========== -->
		<view class="chat-footer">
			<view class="quick-btn-group">
				<view class="quick-btn active">咨询我的私人医生团队</view>
				<view class="quick-btn" @click="showUploadPopup = true">上传照片</view>
			</view>
			<view class="input-row">
				<input v-model="inputText" class="chat-input" placeholder="描述您的不适..." confirm-type="send"
					@confirm="handleSend" :disabled="isReplying" />
				<view class="send-btn" @click="handleSend">
					<text class="custom-icon custom-icon-navigation " style="font-size:40rpx;color:#fff;"></text>
				</view>
			</view>
		</view>
		<main-tabbar :current="2"></main-tabbar>
	</view>
</template>

<script>
import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'

export default {
	components: {
		mainTabbar
	},
	data() {
		return {
			scrollTop: 0,
			inputText: '',
			isReplying: false,
			showLongMenuIndex: -1,
			showUploadPopup: false,
			showEvaluatePopup: false,
			rateScore: 0,
			evaText: '',
			tagList: ['专业度高', '回复及时', '态度亲切', '建议实用', '沟通顺畅'],
			selectTagList: [],
			chatList: [
				{
					type: 'other',
					name: '健康助理孙小芳',
					msgType: 'text',
					content: '您好，我是您的健康管理团队助理。\n已收到您的术前病历，医生团队正在评估中。',
					time: '09:30',
					isRead: true
				},
				{
					type: 'mine',
					msgType: 'text',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					time: '10:05',
					isRead: true
				},
				{
					type: 'other',
					name: '健康助理王小翠',
					msgType: 'text',
					content: '您好，术后伤口轻微瘙痒通常是组织愈合的正常表现，请保持局部干燥。\n如有红肿请拍照上传。',
					time: '10:08',
					isRead: true
				},
				{
					type: 'mine',
					msgType: 'text',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					time: '10:05',
					isRead: true
				},
				{
					type: 'mine',
					msgType: 'text',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					time: '10:05',
					isRead: true
				},
				{
					type: 'mine',
					msgType: 'text',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					time: '10:05',
					isRead: true
				},
				{
					type: 'mine',
					msgType: 'text',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					time: '10:05',
					isRead: true
				},
				{
					type: 'mine',
					msgType: 'text',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					time: '10:05',
					isRead: true
				}
			],
			replyPool: [
				'您好，收到您的问题，请不要过于担心，我们会为您跟进。',
				'您描述的情况属于术后较为常见现象，请保持伤口干燥清洁，密切观察。',
				'建议您多休息，如果出现发热、出血加重，请及时联系我们。',
				'已记录您反馈的情况，医生稍后会给出专业建议，请耐心等待。',
				'饮食建议清淡，忌辛辣刺激，按医嘱按时用药。'
			]
		}
	},
	mounted() {
		this.scrollToBottom()
	},
	methods: {
		getTimeStr() {
			const now = new Date()
			return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
		},
		handleBack() {
			uni.navigateBack({ delta: 1 })
		},
		openUpload() {
			console.log('点击上传', this.showUploadPopup)
			this.showUploadPopup = true
			console.log('赋值后', this.showUploadPopup)
		},
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = 99999
			})
		},
		handleSend() {
			const text = this.inputText.trim()
			if (!text || this.isReplying) return
			this.chatList.push({
				type: 'mine',
				msgType: 'text',
				content: text,
				time: this.getTimeStr(),
				isRead: false
			})
			this.inputText = ''
			this.scrollToBottom()
			this.mockRobotReply()
		},
		mockRobotReply() {
			this.isReplying = true
			setTimeout(() => {
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
					this.showUploadPopup = false
					const tempPath = res.tempFilePaths[0]
					this.chatList.push({
						type: 'mine',
						msgType: 'image',
						imageUrl: tempPath,
						time: this.getTimeStr(),
						isRead: false
					})
					this.scrollToBottom()
					this.mockRobotReply()
				}
			})
		},
		openAlbum() {
			uni.chooseImage({
				count: 1,
				sourceType: ['album'],
				success: (res) => {
					this.showUploadPopup = false
					const tempPath = res.tempFilePaths[0]
					this.chatList.push({
						type: 'mine',
						msgType: 'image',
						imageUrl: tempPath,
						time: this.getTimeStr(),
						isRead: false
					})
					this.scrollToBottom()
					this.mockRobotReply()
				}
			})
		},
		previewImage(url) {
			uni.previewImage({ urls: [url] })
		},
		handleLongPress(msg, index) {
			this.showLongMenuIndex = this.showLongMenuIndex === index ? -1 : index
		},
		copyMsg(msg) {
			if (msg.msgType === 'text') {
				uni.setClipboardData({ data: msg.content })
			}
			this.showLongMenuIndex = -1
		},
		deleteMsg(idx) {
			this.chatList.splice(idx, 1)
			this.showLongMenuIndex = -1
		},
		onReceivePushMsg(serverMsg) {
			this.chatList.push(serverMsg)
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
		submitEvaluate() {
			console.log('提交评价', this.rateScore, this.selectTagList, this.evaText)
			uni.showToast({ title: '评价提交成功' })
			this.showEvaluatePopup = false
			this.rateScore = 0
			this.selectTagList = []
			this.evaText = ''
		}
	}
}
</script>

<style scoped>
	.chat-page {
		background-color: #f9fafb;
		height: 100vh;
		display: flex;
		flex-direction: column;
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
	.chat-scroll {
		flex: 1;
		background-color: #f9fafb;
		height: calc(100vh - 250px);
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
		gap: 16rpx;
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
		font-size: 30rpx;
		line-height: 1.6;
	}
	/*对方气泡：左上小圆角*/
	.msg-item.other .bubble {
		border-top-left-radius: 8rpx;
	}
	/*我方气泡：右上小圆角*/
	.msg-item.mine .bubble {
		background: #2563eb;
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
	/*====重点修改：时间紧贴气泡，不要拉开大距离====*/
	.msg-footer {
		display: flex;
		gap: 10rpx;
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
		margin-bottom: 140rpx;
		/* height: 200rpx; */
		/* margin-bottom: 30rpx; */
	}
	.quick-btn-group {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
		font-size: 18rpx
	}
	.quick-btn {
		padding: 14rpx 32rpx;
		border-radius: 40rpx;
		background: #f3f4f6;
		font-size: 20rpx;
		font-weight: bold;
	}
	.quick-btn.active {
		background: #e8f0ff;
		color: #2563eb;
	}
	.input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
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
		gap: 30rpx;
	}
	.popup-btn-item {
		flex: 1;
		text-align: center;
		padding: 40rpx 20rpx;
		background: #f7f8fa;
		border-radius: 24rpx;
	}
	.popup-icon {
		font-size: 60rpx;
		margin-bottom: 16rpx;
	}
	/*评价弹窗*/
	.evaluate-popup {
		width: 620rpx;
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
		gap: 16rpx;
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
		gap: 20rpx;
		margin-bottom: 40rpx;
	}
	.tag-item {
		padding: 12rpx 24rpx;
		border-radius: 40rpx;
		background: #f3f4f6;
		font-size: 26rpx;
	}
	.tag-item.active {
		background: #e8f0ff;
		color: #2563eb;
	}
	.eva-textarea {
		width: 100%;
		min-height: 140rpx;
		background: #f7f8fa;
		border-radius: 16rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}
	.submit-eva-btn {
		width: 100%;
	}
</style>
