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
				<view v-for="(msg, idx) in chatList" :key="idx" class="msg-item" :class="[msg.type]"
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
							<view v-if="msg.msgType === 'image'" class="bubble-img">
								<image :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)">
								</image>
							</view>

							<view class="diet-report-card " v-if="msg.msgType === 'health'">
								<!-- 头部蓝色栏 -->
								<view class="card-header">
									<view class="header-left">
										<text class="header-title">{{healthOption.healthType}}报告</text>
									</view>
									<text class="header-right">加密同步</text>
								</view>
								<!-- 卡片内容区域 -->
								<view class="card-body ">
									<image class="food-img" :src="msg.img" mode="aspectFill"></image>
									<view class="desc-text">
										今日摄入642kcal，蛋白质占比24.5%，膳食结构符合术后康复标准。
									</view>
									<view class="tip-text">健康管理团队已接收</view>
								</view>
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

		<u-popup :show="showUploadPopup" :round="20" mode="bottom">
			<view class="upload-popup">
				<view class="popup-header">
					<view class="popup-title">上传照片</view>
					<view class="popup-close" @click="showUploadPopup=false">
						<u-icon name="close" color="#111" size="30rpx"></u-icon>
					</view>
				</view>
				<view class="popup-btn-row">
					<view class="popup-btn-item" @click="takeCamera">
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
						:color="n <= rateScore ? '#d08700' : '#ddd'" size="60rpx" @click="rateScore = n">
					</u-icon>
				</view>

				<view class="rate-tip">
					{{ rateScore>0 ? scoreText[rateScore] : '点击星星评分' }}
				</view>
				<!-- 标签选择 -->
				<view class="tag-group">
					<view v-for="tag in tagList" :key="tag" class="tag-item"
						:class="{active: selectTagList.includes(tag)}" @click="toggleTag(tag)">
						{{tag}}
					</view>
				</view>
				<!-- 文本域 -->
				<textarea class="eva-textarea" v-model="evaText" placeholder="还有什么想对我们说的吗？您的反馈对我们非常重要..."></textarea>
				<u-button class="submit-eva-btn" type="primary" @click="submitEvaluate" :disabled="rateScore === 0">
					<u-icon name="thumb-up" color="#fff"></u-icon> 提交评价
				</u-button>
			</view>
		</u-popup>

		<main-tabbar :current="2"></main-tabbar>
	</view>
</template>

<script>
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
				healthOption: {},
				scrollTop: 0,
				realScrollTop: 0, //记录scroll-view真实内部滚动位置
				inputText: '',
				isReplying: false,
				showLongMenuIndex: -1,
				showUploadPopup: false,
				showEvaluatePopup: false,
				replyTimer: null, //机器人回复定时器
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
				chatList: [{
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
						msgType: 'health',
						content: '你好，我感觉伤口有点痒，是正常的吗？',
						img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80",
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
		onReady() {
			this.scrollToBottom()
		},
		onShow() {
			// # H5环境手动解析hash后的query
			// #ifdef H5
			const fullUrl = window.location.href
			// console.log('完整url：', fullUrl)
			const hashPart = fullUrl.split('#')[1]
			if (hashPart && hashPart.includes('?')) {
				const queryStr = hashPart.split('?')[1]
				const sp = new URLSearchParams(queryStr)
				const dataStr = sp.get('data')
				if (dataStr && dataStr !== 'undefined') {
					try {
						this.healthOption = JSON.parse(decodeURIComponent(dataStr))
						console.log('onShow H5解析参数成功', this.healthOption)
					} catch (err) {
						console.error('解析data失败', err)
					}
				}
			}
			// #endif
		},
		onLoad(options) {
			console.log('onLoad options', options)

			this.parseQuery(options)
		},
		onUnload() {
			if (this.pollTimer) {
				clearInterval(this.pollTimer)
				this.pollTimer = null
			}
			if (this.replyTimer) {
				clearInterval(this.replyTimer)
				this.replyTimer = null
			}


		},
		methods: {
			sendHealth() {
				console.log(this.healthOption);
				const data = {
					type: 'mine',
					msgType: 'health',
					content: '你好，我感觉伤口有点痒，是正常的吗？',
					img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80",
					time: '10:05',
					isRead: true
				}
				this.chatList.push(data)
				this.scrollToBottom()
				// this.mockRobotReply()


			},
			parseQuery(options) {
				if (!options || !options.data || options.data === 'undefined') return
				try {
					this.healthOption = JSON.parse(decodeURIComponent(options.data));
					this.sendHealth()
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
						url: '/pages/index/home'
					})
				}
			},
			openUpload() {
				console.log('点击上传', this.showUploadPopup)
				this.showUploadPopup = true
				console.log('赋值后', this.showUploadPopup)
			},
			// 发送消息
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
				this.scrollToBottom() //push之后调用
				this.mockRobotReply()
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
						// 增加防护：用户点取消的时候 res为undefined，直接return
						if (!res || !res.tempFilePaths || res.tempFilePaths.length === 0) {
							this.showUploadPopup = false
							return
						}
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
						// 同样增加防护判断
						if (!res || !res.tempFilePaths || res.tempFilePaths.length === 0) {
							this.showUploadPopup = false
							return
						}
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
				uni.previewImage({
					urls: [url]
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
</style>