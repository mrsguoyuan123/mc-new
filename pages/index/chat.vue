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
					<view class="">
						<view class="base-info">
							<text class="name">{{healthOption.name}}</text>
							<text class="tag-label">{{healthOption.sex}} | {{healthOption.age}}岁</text>
							<view class="city u-flex">
								<u-icon name="map" size="18rpx" color="#909399"></u-icon>
								<view class="margin-left-5">{{healthOption.area}}</view>
							</view>
						</view>
					</view>
					<view class="card-sub-info">
						<view class="info-item u-flex">
							<text class="custom-icon custom-icon-activity "
								style="font-size:30rpx;color:#009966;"></text>
							<view class="margin-left-5">
								{{healthOption.operation}}
							</view>
						</view>
						<view class="info-item u-flex">
							<text class="custom-icon custom-icon-hospital-line"
								style="font-size:30rpx;color:#009966;"></text>
							<view class="margin-left-5">
								{{healthOption.hospital}}
							</view>
						</view>
						<view class="info-item u-flex">
							<text class="custom-icon custom-icon-stethoscope1"
								style="font-size:30rpx;color:#009966;"></text>
							<view class="margin-left-5">
								{{healthOption.value}}·{{healthOption.doctor}}
							</view>
						</view>

					</view>
				</view>
				<view class="intent-tag-wrapper">
					<text class="intent-tag" :class="healthOption.intentClass">{{ healthOption.intent }}</text>
				</view>
				<!-- <view class="badge-normal">{{healthOption.tag}}</view> -->

			</view>
			<!-- 沟通预判气泡 -->
			<view class="predict-block">
				<view class="block-title">

					<text class="custom-icon custom-icon-lightning1 icon-activity"
						style="font-size:36rpx;color:#009966;"></text>
					<text>沟通初步预判</text>
				</view>
				<view class="block-list">
					<view class="li-item">
						<text class="dot">•</text>
						<text>患者主诉术后切口处有阵发性瘙痒，伴随轻微发热感，需排查炎症。</text>
					</view>
					<view class="li-item">
						<text class="dot">•</text>
						<text>询问前期用药是否合规，特别是抗血小板类药物的服用频率与剂量。</text>
					</view>
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
							<text class="custom-icon custom-icon-user " style="font-size:40rpx;color:#a1a8b5;"></text>
						</text>
						<text v-if="msg.type === 'mine'" class="avatar-blue">
							<text class="custom-icon custom-icon-briefcase-l"
								style="font-size:40rpx;color:#fff;"></text>
						</text>
					</view>
					<view class="msg-content">
						<view class="msg-wrap">
							<!-- 对方才显示发送人昵称 -->
							<!-- {{msg.type}} -->
							<!-- <view v-if="msg.type === 'other'" class="sender-name">
								{{ msg.name }}
							</view> -->
							<view v-if="msg.type === 'mine'" class="sender-name text-right">
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
				<view class="quick-btn u-flex bg-blue border-blue font-blue">
					<text class="custom-icon custom-icon-briefcase-l" style="font-size:20rpx;color:#155dfc;"></text>
					<view class="margin-left-5">
						推送医助
					</view>
				</view>
				<view class="quick-btn u-flex bg-green border-green font-green" @click="answerList = !answerList">
					<text class="custom-icon custom-icon-message-circle" style="font-size:20rpx;color:#009966;"></text>
					<view class="margin-left-5">回复模板</view>
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
				<input v-model="inputText" class="chat-input" placeholder="输入回复消息..." confirm-type="send"
					@confirm="handleSend" :disabled="isReplying" />
				<view class="send-btn" @click="handleSend">
					<text class="custom-icon custom-icon-navigation " style="font-size:40rpx;color:#fff;"></text>
				</view>
			</view>
		</view>
		<!-- <main-tabbar :current="2"></main-tabbar> -->
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
				answerList: false,
				healthOption: {},
				scrollTop: 0,
				realScrollTop: 0,
				inputText: '',
				isReplying: false,
				showLongMenuIndex: -1,
				showUploadPopup: false,
				showEvaluatePopup: false,
				replyTimer: null,
				pollTimer: null,
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
						name: '健康助理孙小芳',
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
			checkIt(item) {
				this.inputText = item;
				this.answerList = false
			},
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
						url: '/pages/index/workBench'
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
		background: #008855;
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
		/* border-radius: 30rpx; */
		/* margin: 20rpx; */
		/* margin-bottom: 140rpx; */
		position: absolute;
		/* bottom: 60px; */
		left: 0;
		right: 0;
		bottom: 0;
		/* bottom: calc(0 + constant(safe-area-inset-bottom));
		bottom: calc(0 + env(safe-area-inset-bottom)); */

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
		gap: 20rpx;
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
		gap: 30rpx;
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
		gap: 12rpx;
		font-size: 25rpx;
		color: #008855;
		font-weight: bold;
		margin-bottom: 24rpx;
	}

	.li-item {
		display: flex;
		gap: 12rpx;
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
</style>