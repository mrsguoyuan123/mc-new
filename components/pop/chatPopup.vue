<template>
		<view class="full-chat-popup">
				<view class="full-chat-header">
					<view class="full-header-back" @click="closeChatPopup">
						<u-icon name="arrow-left" color="#1f2937" size="22"></u-icon>
					</view>
					<view class="full-header-main">
						<view class="full-title-row">
							<text class="full-chat-title">{{ chatPopupUser ? chatPopupUser.name : '健康管理群' }} · 健康管理群</text>
							<view class="full-group-chip">
								<u-icon name="account-fill" color="#2563ff" size="13"></u-icon>
								<text>多学科</text>
							</view>
						</view>
						<view class="full-chat-subtitle">{{ chatPopupUser ? chatPopupUser.hospitalSurgery : '多学科随诊群沟通' }}</view>
					</view>
					<view class="full-header-actions">
						<view class="full-archive-btn" @click="openArchivePopup">
							<u-icon name="file-text" color="#2563ff" size="15"></u-icon>
							<text>档案</text>
						</view>
						<view class="full-member-btn" @click="openMemberPopup">
							<u-icon name="account-fill" color="#2563ff" size="22"></u-icon>
						</view>
					</view>
				</view>

				<scroll-view
					scroll-y
					class="full-message-scroll"
					:scroll-into-view="chatScrollIntoView"
					:scroll-with-animation="true"
				>
					<view v-if="chatMessagesLoading" class="full-chat-state">
						<u-loading-icon mode="circle" color="#2563ff" size="26"></u-loading-icon>
						<text class="full-state-text">历史消息加载中...</text>
					</view>
					<view v-else-if="!chatMessages.length" class="full-chat-state">
						<u-icon name="chat" color="#b7c0d4" size="42"></u-icon>
						<text class="full-state-text">{{ chatError || '暂无聊天消息，欢迎发起沟通' }}</text>
					</view>
					<view
						v-for="(msg, index) in chatMessages"
						:id="'chatMsg' + index"
						:key="'full-msg-' + (msg.id || index)"
						class="full-msg-row"
						:class="msg.type"
					>
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

				<view class="full-chat-footer">
					<input
						v-model="chatInput"
						class="full-chat-input"
						placeholder="在多学科群内沟通（客服、医助、客户全员可见）"
						confirm-type="send"
						cursor-spacing="18"
						:adjust-position="true"
						:hold-keyboard="true"
						:disabled="chatSending || !currentConversation"
						@confirm="sendChatMessage"
					/>
					<view class="send-btn"  :class="{ disabled: chatSending || !currentConversation || !chatInput.trim() }" @click="sendChatMessage">
					<text class="custom-icon custom-icon-navigation " style="font-size:40rpx;color:#fff;"></text>
				</view>
					
				</view>
			</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

/* 新增：全屏健康管理群聊天弹窗 */
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
	background: #ffffff;
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

.full-group-chip text {
	margin-left: 4rpx;
}

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

.full-archive-btn text {
	margin-left: 4rpx;
}

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

.full-msg-row.mine {
	justify-content: flex-end;
}

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

.full-avatar-img {
	width: 100%;
	height: 100%;
}

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

.full-sender-row.mine {
	justify-content: flex-end;
}

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

.full-sender-time {
	margin-left: 10rpx;
}

.full-bubble {
	padding: 18rpx 20rpx;
	border-radius: 8rpx 22rpx 22rpx 22rpx;
	background: #ffffff;
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
	color: #ffffff;
}

.edited-mark {
	margin-left: 6rpx;
	font-size: 21rpx;
	color: #8a94a8;
}

.full-msg-row.mine .edited-mark {
	color: rgba(255, 255, 255, 0.82);
}

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

.full-mine-meta text + text {
	margin-left: 10rpx;
}

.edit-message-btn {
	display: flex;
	align-items: center;
	margin-left: 14rpx;
	font-size: 21rpx;
	color: #2563ff;
}

.edit-message-btn text {
	margin-left: 3rpx;
}

.full-chat-footer {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	position: relative;
	z-index: 2;
	min-height: 104rpx;
	padding: 16rpx 20rpx calc(18rpx + env(safe-area-inset-bottom));
	background: #ffffff;
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
.full-send-btn text {
	margin-left: 4rpx;
	font-size: 25rpx;
	color: #ffffff;
	font-weight: 600;
}

.full-send-btn.disabled {
	background: #b8d3ff;
	box-shadow: none;
}
	

/* 新增：编辑群聊消息弹窗 */
.edit-chat-popup {
	width: 640rpx;
	padding: 34rpx 30rpx 30rpx;
	background: #ffffff;
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
	background: #ffffff;
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
</style>