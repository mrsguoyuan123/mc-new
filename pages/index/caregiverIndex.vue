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
					v-for="(item, statIndex) in statCards"
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
					v-for="(user, userIndex) in users"
					:key="'user-' + (user.conversationId || user.patientId || userIndex)"
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
							<!-- <text v-if="user.lastMsgAtText" class="message-time">{{ user.lastMsgAtText }}</text> -->
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
					<view v-for="(order, orderIndex) in orders" :key="'order-' + (order.id || orderIndex)" class="order-card">
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
								v-if="order.status === 'CONFIRMED' || order.status === 'PENDING'"
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

		<!-- 改动位置：用户列表点击后的全屏健康管理群聊天弹窗 -->
		<u-popup
			:show="chatPopupVisible"
			mode="bottom"
			:round="0"
			:zIndex="10060"
			:closeOnClickOverlay="false"
			@close="closeChatPopup"
		>
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
						<view v-if="msg.type === 'other'" class="full-msg-avatar">
							<image v-if="msg.avatar" :src="msg.avatar" mode="aspectFill" class="full-avatar-img"></image>
							<u-icon v-else name="account-fill" color="#2563ff" size="24"></u-icon>
						</view>
						<view class="full-msg-content">
							<view v-if="msg.type === 'other'" class="full-sender-row">
								<text class="full-sender-name">{{ msg.name }}</text>
								<text v-if="msg.roleText" class="full-sender-role">{{ msg.roleText }}</text>
								<text class="full-sender-time">{{ msg.time }}</text>
							</view>
							<view class="full-bubble" :class="{ fail: msg.failed }">
								<text>{{ msg.content }}</text>
							</view>
							<view v-if="msg.type === 'mine'" class="full-mine-meta">
								<text>{{ msg.time }}</text>
								<text v-if="msg.sending">发送中</text>
								<text v-else-if="msg.failed">发送失败</text>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="full-chat-footer">
					<input
						v-model="chatInput"
						class="full-chat-input"
						placeholder="在多学科群内沟通（客服、医助、客户全员可见）"
						confirm-type="send"
						:disabled="chatSending || !currentConversation"
						@confirm="sendChatMessage"
					/>
					<u-button
						type="primary"
						shape="circle"
						size="normal"
						text="发送"
						:loading="chatSending"
						:disabled="!currentConversation"
						@click="sendChatMessage"
					></u-button>
				</view>
			</view>
		</u-popup>

		<!-- 原群聊弹窗保留：历史内联面板结构，当前由上方全屏弹窗承接交互 -->
		<!-- 改动位置：用户列表群聊弹窗，包含消息区、群成员、患者档案 -->
		<u-popup :show="false" mode="bottom" :round="24" :closeable="true" @close="closeChatPopup">
			<view class="chat-popup">
				<view class="chat-popup-header">
					<view class="chat-popup-title-wrap">
						<view class="chat-popup-title">{{ chatPopupUser ? chatPopupUser.name : '健康管理群' }}</view>
						<view class="chat-popup-subtitle">多学科随诊群沟通</view>
					</view>
					<view class="chat-popup-close" @click="closeChatPopup">
						<u-icon name="close" color="#667085" size="22"></u-icon>
					</view>
				</view>

				<view class="chat-section-title">聊天消息区</view>
				<scroll-view scroll-y class="chat-message-scroll" :scroll-into-view="chatScrollIntoView" :scroll-with-animation="true">
					<view v-if="chatMessagesLoading" class="popup-state compact">
						<u-loading-icon mode="circle" color="#2563ff" size="24"></u-loading-icon>
						<text class="popup-state-text">消息加载中...</text>
					</view>
					<view v-else-if="!chatMessages.length" class="popup-state compact">
						<u-icon name="chat" color="#b7c0d4" size="38"></u-icon>
						<text class="popup-state-text">{{ chatError || '暂无聊天消息' }}</text>
					</view>
					<view
						v-for="(msg, index) in chatMessages"
						:id="'legacyChatMsg' + index"
						:key="'legacy-msg-' + (msg.id || index)"
						class="popup-msg-item"
						:class="msg.type"
					>
						<view class="popup-msg-avatar">
							<image v-if="msg.avatar" :src="msg.avatar" mode="aspectFill" class="popup-avatar-img"></image>
							<u-icon v-else name="account-fill" :color="msg.type === 'mine' ? '#ffffff' : '#2563ff'" size="22"></u-icon>
						</view>
						<view class="popup-msg-body">
							<view class="popup-sender">
								<text>{{ msg.name }}</text>
								<text v-if="msg.roleText" class="popup-role-tag">{{ msg.roleText }}</text>
							</view>
							<view class="popup-bubble" :class="{ fail: msg.failed }">
								<text>{{ msg.content }}</text>
							</view>
							<view class="popup-msg-meta">
								<text>{{ msg.time }}</text>
								<text v-if="msg.sending">发送中</text>
								<text v-else-if="msg.failed">发送失败</text>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="chat-input-row">
					<input
						v-model="chatInput"
						class="chat-popup-input"
						placeholder="输入文字消息..."
						confirm-type="send"
						:disabled="chatSending || !currentConversation"
						@confirm="sendChatMessage"
					/>
					<u-button
						type="primary"
						shape="circle"
						size="mini"
						text="发送"
						:loading="chatSending"
						@click="sendChatMessage"
					></u-button>
				</view>

				<view class="collapse-panel">
					<view class="collapse-header" @click="toggleMemberPanel">
						<view class="collapse-left">
							<u-icon name="account-fill" color="#2563ff" size="18"></u-icon>
							<text class="collapse-title">群成员列表</text>
							<text class="collapse-count">({{ conversationMembers.length }})</text>
						</view>
						<u-icon :name="memberPanelVisible ? 'arrow-up' : 'arrow-down'" color="#667085" size="16"></u-icon>
					</view>
					<view v-show="memberPanelVisible" class="collapse-content">
						<view v-if="membersLoading" class="popup-state mini">
							<u-loading-icon mode="circle" color="#2563ff" size="20"></u-loading-icon>
							<text class="popup-state-text">群成员加载中...</text>
						</view>
						<view v-else-if="!conversationMembers.length" class="popup-empty-inline">暂无群成员信息</view>
						<view v-for="(member, index) in conversationMembers" :key="'legacy-member-' + (member.id || index)" class="member-item">
							<view class="member-avatar">
								<image v-if="member.avatar" :src="member.avatar" mode="aspectFill" class="popup-avatar-img"></image>
								<u-icon v-else name="account-fill" color="#2563ff" size="22"></u-icon>
							</view>
							<view class="member-info">
								<view class="member-name-row">
									<text class="member-name">{{ member.name }}</text>
									<text v-if="member.roleText" class="member-role">{{ member.roleText }}</text>
								</view>
								<text class="member-remark">{{ member.remark || '暂无备注' }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="collapse-panel">
					<view class="collapse-header" @click="toggleProfilePanel">
						<view class="collapse-left">
							<u-icon name="file-text" color="#2563ff" size="18"></u-icon>
							<text class="collapse-title">患者基本信息档案</text>
						</view>
						<u-icon :name="profilePanelVisible ? 'arrow-up' : 'arrow-down'" color="#667085" size="16"></u-icon>
					</view>
					<view v-show="profilePanelVisible" class="collapse-content">
						<view v-if="profileLoading" class="popup-state mini">
							<u-loading-icon mode="circle" color="#2563ff" size="20"></u-loading-icon>
							<text class="popup-state-text">档案加载中...</text>
						</view>
						<view v-else-if="!patientProfile" class="popup-empty-inline">暂无患者档案</view>
						<view v-else class="profile-grid">
							<view class="profile-item">
								<text class="profile-label">姓名</text>
								<text class="profile-value">{{ patientProfile.name }}</text>
							</view>
							<view class="profile-item">
								<text class="profile-label">年龄</text>
								<text class="profile-value">{{ patientProfile.ageText }}</text>
							</view>
							<view class="profile-item">
								<text class="profile-label">住院号</text>
								<text class="profile-value strong">{{ patientProfile.inpatientNo }}</text>
							</view>
							<view class="profile-item">
								<text class="profile-label">医院</text>
								<text class="profile-value">{{ patientProfile.hospital }}</text>
							</view>
							<view class="profile-item wide">
								<text class="profile-label">诊断信息</text>
								<text class="profile-value">{{ patientProfile.diagnosis || '暂无诊断信息' }}</text>
							</view>
							<view class="profile-item wide">
								<text class="profile-label">手术信息</text>
								<text class="profile-value">{{ patientProfile.surgeryInfo || '暂无手术信息' }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 改动位置：患者档案独立弹窗，数据来自 getEscortUsersApi -->
		<u-popup
			:show="archivePopupVisible"
			mode="bottom"
			:round="0"
			:zIndex="10080"
			:closeOnClickOverlay="false"
			@close="closeArchivePopup"
		>
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
									<text>住院号 {{ patientProfile.inpatientNo }}</text>
									<u-tag text="数据源一致" type="success" size="mini" plain></u-tag>
								</view>
							</view>
						</view>

						<view class="archive-card">
							<view class="archive-card-title">患者身份档案</view>
							<view class="archive-grid">
								<view class="archive-field">
									<text class="archive-label">患者姓名</text>
									<text class="archive-value">{{ patientProfile.name }}</text>
								</view>
								<view class="archive-field">
									<text class="archive-label">性别</text>
									<text class="archive-value">{{ patientProfile.genderText || '待补充' }}</text>
								</view>
								<view class="archive-field">
									<text class="archive-label">年龄/出生日期</text>
									<text class="archive-value">{{ patientProfile.ageBirthText }}</text>
								</view>
								<view class="archive-field">
									<text class="archive-label">联系方式</text>
									<text class="archive-value">{{ patientProfile.phone }}</text>
								</view>
								<view class="archive-field">
									<text class="archive-label">住院号</text>
									<text class="archive-value strong">{{ patientProfile.inpatientNo }}</text>
								</view>
								<view class="archive-field">
									<text class="archive-label">就诊医院</text>
									<text class="archive-value">{{ patientProfile.hospital }}</text>
								</view>
							</view>
						</view>

						<view class="archive-card">
							<view class="archive-card-title">诊断与手术明细</view>
							<view class="diagnosis-row">
								<text class="archive-label">主要诊断</text>
								<text class="archive-value">{{ patientProfile.diagnosis || '暂无诊断信息' }}</text>
								<text v-if="patientProfile.diagnosisSource" class="source-text">{{ patientProfile.diagnosisSource }}</text>
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

		<!-- 改动位置：群成员独立弹窗，成员来自 getMeConversationsApi -->
		<u-popup
			:show="memberPopupVisible"
			mode="bottom"
			:round="0"
			:zIndex="10080"
			:closeOnClickOverlay="false"
			@close="closeMemberPopup"
		>
			<view class="member-popup">
				<view class="side-popup-header">
					<view class="side-title-wrap">
						<view class="side-title-icon blue">
							<u-icon name="account-fill" color="#2563ff" size="21"></u-icon>
						</view>
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
						v-for="(item, situationIndex) in situationOptions"
						:key="'situation-' + (item.value || situationIndex)"
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
						v-for="(item, completeIndex) in completeOptions"
						:key="'complete-' + (item.value || completeIndex)"
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
	getEscortUsersApi,
	getMeConversationsApi,
	getConversationsByIdMessagesApi,
	postConversationsByIdMessagesApi
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
			chatPopupVisible: false,
			archivePopupVisible: false,
			memberPopupVisible: false,
			memberPanelVisible: true,
			profilePanelVisible: false,
			chatMessagesLoading: false,
			membersLoading: false,
			profileLoading: false,
			chatSending: false,
			chatInput: '',
			chatError: '',
			chatPopupUser: null,
			currentConversation: null,
			conversationMembers: [],
			patientProfile: null,
			chatMessages: [],
			chatScrollIntoView: '',
			chatMessagesSignature: '',
			chatPollTimer: null,
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
				PENDING: '待服务',
				IN_SERVICE: '服务中',
				COMPLETED: '已服务',
				CANCELLED: '已取消'
			},
			statusTypeMap: {
				WAIT_ACCEPT: 'warning',
				CONFIRMED: 'primary',
				PENDING: 'primary',
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
				{ key: 'pending', label: '待服务', count: pendingCount, statuses: ['CONFIRMED', 'PENDING', 'IN_SERVICE'], emptyText: '暂无待服务订单' },
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
	onHide() {
		this.stopChatPolling()
	},
	onUnload() {
		this.stopChatPolling()
	},
	methods: {
		// 首次进入时并行加载工作台核心数据
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
		// 下拉刷新时重新拉取当前页面数据
		async refreshAll() {
			await Promise.all([
				this.loadStats(),
				this.loadProfileStats(),
				this.loadSchedules(),
				this.currentTab === 0 ? this.loadUsers() : this.loadOrders(true)
			])
			uni.stopPullDownRefresh()
		},
		// 切换业务 tab 并加载对应列表
		switchTab(index) {
			if (this.currentTab === index) return
			this.currentTab = index
			if (index === 0) {
				this.loadUsers()
			} else {
				this.loadOrders(true)
			}
		},
		// 获取工作台统计数字
		async loadStats() {
			try {
				const data = await getEscortStatsApi() || {}
				this.stats = {
					users: this.toNumber(data.users || data.userCount || data.serviceUsers),
					pending: this.toNumber(data.pending || data.pendingCount),
					waitAccept: this.toNumber(data.waitAccept || data.waitAcceptCount),
					inService: this.toNumber(data.inService || data.inServiceCount),
					completed: this.toNumber(data.completed || data.completedCount)
				}
				this.updateNotice()
			} catch (error) {
				this.handleError(error, '统计信息加载失败')
			}
		},
		// 获取陪诊师个人服务统计
		async loadProfileStats() {
			try {
				const data = await getEscortProfileStatsApi() || {}
				this.profileStats = {
					totalCount: this.toNumber(data.totalCount || data.total || data.totalServiceCount),
					monthCount: this.toNumber(data.monthCount || data.month || data.monthServiceCount),
					rating: data.rating === undefined || data.rating === null || data.rating === '' ? '--' : data.rating
				}
			} catch (error) {
				this.handleError(error, '个人统计加载失败')
			}
		},
		// 获取当月排班数据并同步日历角标
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
		// 获取我的健康管理群会话列表
		async loadUsers() {
			this.usersLoading = true
			try {
				const data = await getMeConversationsApi()
				this.users = this.extractList(data)
					.map(item => this.normalizeUser(item))
					.filter(item => item.name || item.conversationId)
					.sort((a, b) => new Date(b.lastMsgAt || 0).getTime() - new Date(a.lastMsgAt || 0).getTime())
			} catch (error) {
				this.handleError(error, '用户列表加载失败')
			} finally {
				this.usersLoading = false
			}
		},
		// 按当前 tab 状态分页获取订单
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
				// alert()
				console.log(1111111111,results)

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
		// 触底加载下一页订单
		loadMoreOrders() {
			if (this.currentTab === 0 || this.listLoading || !this.hasMore) return
			this.page += 1
			this.loadOrders(false)
		},
		// 确认后接单
		async acceptOrder(order) {
			const confirmed = await this.confirmAction(`确认接单 ${order.patientName} 的陪诊服务吗？`)
			if (!confirmed) return
			const success = await this.runOrderAction(order, putEscortOrdersByIdAcceptApi, '接单成功')
			if (success) this.switchToPendingTab()
		},
		// 确认后开始服务
		async startOrder(order) {
			const confirmed = await this.confirmAction(`确认为 ${order.patientName} 开始服务吗？`)
			if (!confirmed) return
			await this.runOrderAction(order, putEscortOrdersByIdStartApi, '服务已开始')
		},
		// 获取定位并提交到院签到
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
		// 打开服务记录填写弹窗
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
		// 关闭服务记录弹窗
		closeRecordPopup() {
			this.recordPopupVisible = false
		},
		// 校验并提交服务记录
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
		// 预加载订单详情后跳转患者详情
		async openOrderDetail(order) {
			try {
				this.orderDetail = await getEscortOrdersByIdApi({ id: order.id })
			} catch (error) {
				this.handleError(error, '订单详情预加载失败')
			}
			const url = `/pages/index/patientDetail?id=${encodeURIComponent(order.id)}&orderStatus=${encodeURIComponent(order.status || '')}`
			this.$safeJump(url)
		},
		// 打开用户群聊弹窗
		openChat(user) {
			this.chatPopupUser = user
			this.patientProfile = user
			this.currentConversation = user.conversationRaw || this.normalizeConversation(user.conversationData || user)
			this.conversationMembers = []
			this.chatMessages = []
			this.chatMessagesSignature = ''
			this.chatInput = ''
			this.chatError = ''
			this.archivePopupVisible = false
			this.memberPopupVisible = false
			this.memberPanelVisible = true
			this.profilePanelVisible = false
			this.chatPopupVisible = true
			this.loadChatMessages(true)
			this.conversationMembers = this.currentConversation ? this.extractMembers(this.currentConversation, user) : []
			this.startChatPolling()
		},
		// 关闭群聊弹窗并停止轮询
		closeChatPopup() {
			this.chatPopupVisible = false
			this.archivePopupVisible = false
			this.memberPopupVisible = false
			this.stopChatPolling()
		},
		// 打开患者档案弹窗
		openArchivePopup() {
			this.archivePopupVisible = true
			this.loadPatientProfile(this.chatPopupUser)
		},
		// 仅关闭患者档案弹窗
		closeArchivePopup() {
			this.archivePopupVisible = false
		},
		// 打开群成员弹窗
		openMemberPopup() {
			this.memberPopupVisible = true
			this.loadConversationMembers()
		},
		// 仅关闭群成员弹窗
		closeMemberPopup() {
			this.memberPopupVisible = false
		},
		// 展开或收起群成员面板
		toggleMemberPanel() {
			this.memberPanelVisible = !this.memberPanelVisible
		},
		// 展开或收起患者档案面板
		toggleProfilePanel() {
			this.profilePanelVisible = !this.profilePanelVisible
		},
		// 从我的会话中读取当前群成员
		async loadConversationMembers() {
			if (!this.chatPopupUser) return
			this.membersLoading = true
			try {
				const result = await getMeConversationsApi()
				const conversations = this.extractList(result).map(item => this.normalizeConversation(item))
				const conversation = this.matchConversation(conversations, this.chatPopupUser) || this.currentConversation
				this.currentConversation = conversation || this.currentConversation
				this.conversationMembers = conversation
					? this.extractMembers(conversation, this.chatPopupUser)
					: (this.conversationMembers.length ? this.conversationMembers : [])
				if (!conversation) uni.showToast({ title: '暂未找到群成员信息', icon: 'none' })
			} catch (error) {
				this.handleError(error, '群成员加载失败')
			} finally {
				this.membersLoading = false
			}
		},
		// 加载用户对应的群会话、成员和消息
		async loadConversationContext(user) {
			this.membersLoading = true
			this.chatMessagesLoading = true
			try {
				const result = await getMeConversationsApi()
				const conversations = this.extractList(result).map(item => this.normalizeConversation(item))
				const conversation = this.matchConversation(conversations, user)
				this.currentConversation = conversation
				this.conversationMembers = conversation ? this.extractMembers(conversation, user) : []
				if (!conversation) {
					this.chatError = '暂未找到该患者的群聊会话'
					this.chatMessages = []
					return
				}
				await this.loadChatMessages(true)
			} catch (error) {
				this.chatError = '群聊信息加载失败'
				this.handleError(error, '群聊信息加载失败')
			} finally {
				this.membersLoading = false
				this.chatMessagesLoading = false
			}
		},
		// 拉取群聊历史消息
		async loadChatMessages(manualLoading) {
			if (!this.currentConversation || !this.currentConversation.id) return
			if (manualLoading) this.chatMessagesLoading = true
			try {
				const result = await getConversationsByIdMessagesApi({
					id: this.currentConversation.id,
					size: 50
				})
				const list = this.extractList(result)
				const nextMessages = list.map((item, index) => this.normalizeChatMessage(item, index))
				const nextSignature = nextMessages.map(msg => [msg.id, msg.type, msg.name, msg.content, msg.time].join('~')).join('|')
				if (!manualLoading && nextSignature === this.chatMessagesSignature) return
				this.chatMessages = nextMessages
				this.chatMessagesSignature = nextSignature
				this.chatError = ''
				this.scrollChatToBottom()
			} catch (error) {
				if (manualLoading) this.chatError = '消息加载失败，可稍后重试'
				this.handleError(error, '消息加载失败')
			} finally {
				if (manualLoading) this.chatMessagesLoading = false
			}
		},
		// 从患者用户接口刷新弹窗档案
		async loadPatientProfile(user) {
			this.profileLoading = true
			try {
				const result = await getEscortUsersApi()
				const list = this.extractList(result)
				const raw = list.find(item => this.samePatient(item, user)) || user
				this.patientProfile = this.normalizePopupProfile(raw, user)
			} catch (error) {
				this.patientProfile = this.normalizePopupProfile(user || {})
				this.handleError(error, '患者档案加载失败')
			} finally {
				this.profileLoading = false
			}
		},
		// 发送文字消息并本地乐观渲染
		async sendChatMessage() {
			const text = String(this.chatInput || '').trim()
			if (!text) {
				uni.showToast({ title: '请输入消息内容', icon: 'none' })
				return
			}
			if (!this.currentConversation || !this.currentConversation.id) {
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
				content: text,
				time: this.formatDateTime(new Date()),
				sending: true,
				failed: false,
				clientSeq
			}
			this.chatMessages.push(localMessage)
			this.chatInput = ''
			this.chatSending = true
			this.scrollChatToBottom()
			try {
				await postConversationsByIdMessagesApi({
					id: this.currentConversation.id,
					type: 'TEXT',
					content: text,
					senderType: 'CAREGIVER',
					clientSeq
				})
				await this.loadChatMessages(false)
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
		// 开始弹窗消息轮询
		startChatPolling() {
			this.stopChatPolling()
			this.chatPollTimer = setInterval(() => {
				if (this.chatPopupVisible && !this.chatSending) this.loadChatMessages(false)
			}, 15000)
		},
		// 停止弹窗消息轮询
		stopChatPolling() {
			if (this.chatPollTimer) {
				clearInterval(this.chatPollTimer)
				this.chatPollTimer = null
			}
		},
		// 滚动到最新一条消息
		scrollChatToBottom() {
			this.$nextTick(() => {
				const index = this.chatMessages.length - 1
				if (index < 0) return
				setTimeout(() => {
					this.chatScrollIntoView = 'chatMsg' + index
				}, 60)
			})
		},
		// 标准化会话字段并补齐患者 ID
		normalizeConversation(item) {
			const source = item || {}
			const patient = source.patient || {}
			return Object.assign({}, source, {
				patientId: source.patientId || source.patient_id || source.patientID || patient.id || ''
			})
		},
		// 根据患者 ID、会话 ID 或姓名匹配群聊
		matchConversation(list, user) {
			const targetId = String((user && (user.patientId || user.id)) || '')
			const conversationId = String((user && (user.conversationId || user.chatId)) || '')
			return list.find(item => {
				if (conversationId && String(item.id) === conversationId) return true
				return targetId && String(item.patientId) === targetId
			}) || list.find(item => {
				const title = item.name || item.title || item.patientName || ''
				return user && user.name && title.indexOf(user.name) > -1
			}) || null
		},
		// 从会话对象中提取群成员
		extractMembers(conversation, user) {
			const rawList = []
			const membersSnapshot = this.parseMembersSnapshot(conversation)
			membersSnapshot.forEach(item => rawList.push(item))
			const containers = [
				conversation.members,
				conversation.participants,
				conversation.users,
				conversation.memberList,
				conversation.membersJson
			]
			containers.forEach(list => {
				if (Array.isArray(list)) list.forEach(item => rawList.push(item))
			})
			;[
				{ data: conversation.patient, role: 'PATIENT' },
				{ data: conversation.customer, role: 'PATIENT' },
				{ data: conversation.cs, role: 'CS' },
				{ data: conversation.customerService, role: 'CS' },
				{ data: conversation.assistant, role: 'DOCTOR_ASSISTANT' },
				{ data: conversation.doctorAssistant, role: 'DOCTOR_ASSISTANT' },
				{ data: conversation.caregiver, role: 'CAREGIVER' },
				{ data: conversation.escort, role: 'CAREGIVER' },
				{ data: conversation.ai, role: 'AI' },
				{ data: conversation.bot, role: 'AI' }
			].forEach(item => {
				if (item.data && typeof item.data === 'object') {
					rawList.push(Object.assign({ role: item.data.role || item.role }, item.data))
				}
			})
			if (!rawList.length && user) rawList.push(user)
			const exists = {}
			return rawList.map((item, index) => this.normalizeMember(item, index)).filter(item => {
				if (!item.name) return false
				const key = String(item.id || item.name)
				if (exists[key]) return false
				exists[key] = true
				return true
			})
		},
		// 解析 membersJson 中数组或按角色分组的成员快照
		parseMembersSnapshot(conversation) {
			if (!conversation) return []
			let payload = conversation.membersJson !== undefined
				? conversation.membersJson
				: conversation.members_json
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload)
				} catch (error) {
					return []
				}
			}
			return this.normalizeMembersPayload(payload)
		},
		// 将不同接口形态的成员数据整理成统一数组
		normalizeMembersPayload(payload) {
			if (!payload) return []
			if (Array.isArray(payload)) return payload.filter(item => item && typeof item === 'object')
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
			const listKeys = ['members', 'list', 'users', 'participants', 'memberList']
			listKeys.forEach(key => {
				if (Array.isArray(payload[key])) {
					payload[key].forEach(item => {
						if (item && typeof item === 'object') result.push(item)
					})
				}
			})
			Object.keys(roleMap).forEach(key => {
				const value = payload[key]
				if (Array.isArray(value)) {
					value.forEach(item => {
						if (item && typeof item === 'object') result.push(Object.assign({ role: item.role || roleMap[key] }, item))
					})
				} else if (value && typeof value === 'object') {
					result.push(Object.assign({ role: value.role || roleMap[key] }, value))
				}
			})
			return result
		},
		// 标准化群成员卡片字段
		normalizeMember(raw, index) {
			const source = raw || {}
			const nested = source.user || source.profile || source.member || {}
			const data = Object.assign({}, nested, source)
			const role = String(data.role || data.senderType || data.userType || data.memberRole || '').toUpperCase()
			const baseRemark = data.remark || data.description || data.title || data.department || data.hospitalName || ''
			const genderText = data.gender === 'FEMALE' || data.gender === '女' ? '女' : data.gender === 'MALE' || data.gender === '男' ? '男' : ''
			const ageText = this.toNumber(data.age) ? `${data.age}岁` : ''
			const patientText = [genderText, ageText, data.inpatientNo ? `住院号 ${data.inpatientNo}` : ''].filter(Boolean).join('·')
			const roleFallback = {
				PATIENT: patientText || '健康管理群客户',
				CUSTOMER: patientText || '健康管理群客户',
				CLIENT: patientText || '健康管理群客户',
				CS: '24小时专属就医客服管家',
				CUSTOMER_SERVICE: '24小时专属就医客服管家',
				DOCTOR_ASSISTANT: '临床助理，负责诊疗信息协同',
				MEDICAL_ASSISTANT: '临床助理，负责诊疗信息协同',
				CAREGIVER: '专属陪诊师，负责到院陪诊与随诊协同',
				ESCORT: '专属陪诊师，负责到院陪诊与随诊协同',
				AI: '智能用药打卡与体征异常预警机器人',
				ROBOT: '智能用药打卡与体征异常预警机器人'
			}
			return {
				id: data.id || data.userId || data.memberId || `member_${index}`,
				name: data.name || data.nickname || data.staffName || data.patientName || '',
				avatar: data.avatar || data.avatarUrl || data.headImg || '',
				role,
				roleText: this.getRoleText(role),
				remark: baseRemark || roleFallback[role] || '群成员'
			}
		},
		// 标准化弹窗中的患者档案
		normalizePopupProfile(raw, fallbackUser) {
			const source = raw || {}
			const patient = source.patient || source.patientInfo || source.userInfo || {}
			const data = Object.assign({}, patient, source, fallbackUser || {})
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
			const phone = this.maskPhone(data.phone || data.mobile || data.contactPhone || data.telephone || '')
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
				phone,
				inpatientNo: data.inpatientNo || data.hospitalNo || data.admissionNo || data.patientNo || '待补充',
				hospital: data.hospital || data.hospitalName || data.medicalInstitution || data.hospitalAddress || '暂无医院信息',
				department: data.department || data.deptName || '',
				diagnosis,
				diagnosisSource: data.diagnosisSource || data.sourceText || '',
				surgeryType: surgery,
				surgeryTime,
				surgeryInfo: surgery ? `${surgery}${surgeryTime ? `（${surgeryTime}）` : ''}` : ''
			}
		},
		// 标准化弹窗消息字段并区分发送者
		normalizeChatMessage(raw, index) {
			const source = raw || {}
			const senderType = String(source.senderType || source.senderRole || source.role || '').toUpperCase()
			const wireType = String(source.type || source.msgType || source.messageType || 'TEXT').toUpperCase()
			let content = source.content || source.text || source.message || source.body || ''
			if ((wireType === 'IMAGE' || source.msgType === 'image') && !content) content = '[图片消息]'
			if ((wireType === 'HEALTH_CARD' || source.msgType === 'health') && !content) content = '[健康卡片消息]'
			const mine = this.isMyChatMessage(source, senderType)
			return {
				id: source.id || source.messageId || source.clientSeq || `popup_msg_${index}`,
				type: mine ? 'mine' : 'other',
				name: source.senderName || source.staffName || source.name || this.getRoleText(senderType) || '群成员',
				avatar: source.avatar || source.senderAvatar || source.avatarUrl || '',
				roleText: this.getRoleText(senderType),
				content,
				time: this.formatDateTime(source.createTime || source.sendTime || source.time || source.updateTime),
				sending: source.sending === true,
				failed: source.failed === true
			}
		},
		// 判断消息是否由当前陪诊师发送
		isMyChatMessage(source, senderType) {
			if (source.mine === true || source.self === true || source.fromMe === true || source.direction === 'outbound') return true
			const senderId = String(source.senderId || source.userId || source.staffId || '').trim()
			if (senderId && this.getMySenderIds().some(id => String(id) === senderId)) return true
			if (!senderId && (senderType === 'CAREGIVER' || senderType === 'ESCORT')) return true
			return false
		},
		// 获取当前登录用户可能使用的 ID
		getMySenderIds() {
			const user = uni.getStorageSync('userInfo') || {}
			return [
				user.id,
				user.userId,
				user.staffId,
				user.caregiverId,
				user.escortId,
				this.currentConversation && this.currentConversation.caregiverId,
				this.currentConversation && this.currentConversation.escortId
			].filter(item => item !== undefined && item !== null && String(item).trim() !== '').map(String)
		},
		// 获取当前登录用户姓名
		getCurrentUserName() {
			const user = uni.getStorageSync('userInfo') || {}
			return user.name || user.nickname || user.realName || '陪诊师'
		},
		// 会话角色枚举转中文
		getRoleText(role) {
			const map = {
				PATIENT: '客户',
				CUSTOMER: '客户',
				CLIENT: '客户',
				CS: '客服',
				CUSTOMER_SERVICE: '客服',
				CAREGIVER: '陪诊师',
				ESCORT: '陪诊师',
				DOCTOR_ASSISTANT: '医生助理',
				MEDICAL_ASSISTANT: '医生助理',
				AI: '机器人',
				ROBOT: '机器人',
				SYSTEM: '系统'
			}
			return map[role] || ''
		},
		// 判断两个用户对象是否属于同一患者
		samePatient(raw, user) {
			const source = raw || {}
			const patient = source.patient || source.patientInfo || source.userInfo || {}
			const data = Object.assign({}, patient, source)
			const leftId = String(data.patientId || data.id || data.userId || '')
			const rightId = String((user && (user.patientId || user.id)) || '')
			if (leftId && rightId && leftId === rightId) return true
			return !!(user && user.name && (data.name === user.name || data.patientName === user.name))
		},
		// 刷新排班并进入服务日历
		async goCalendar() {
			await this.loadSchedules()
			uni.setStorageSync('escortSchedules', this.scheduleMap)
			this.$safeJump(`/pages/index/calendar?month=${encodeURIComponent(this.currentMonth)}`)
		},
		// 执行接单、开始服务等通用订单操作
		async runOrderAction(order, apiFn, successText) {
			this.actionLoading = true
			try {
				await apiFn({ id: order.id })
				uni.showToast({ title: successText, icon: 'success' })
				await this.afterOrderChanged()
				return true
			} catch (error) {
				this.handleError(error, `${successText}失败`)
				return false
			} finally {
				this.actionLoading = false
			}
		},
		// 接单成功后切换到待服务 tab
		switchToPendingTab() {
			this.currentTab = 1
			this.loadOrders(true)
		},
		// 订单操作成功后刷新统计和当前列表
		async afterOrderChanged() {
			await Promise.all([
				this.loadStats(),
				this.loadProfileStats(),
				this.loadSchedules(),
				this.currentTab === 0 ? this.loadUsers() : this.loadOrders(true)
			])
		},
		// 统一封装操作确认弹窗
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
		// 获取当前设备地理位置
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
		// 统一处理接口异常提示，避免页面中断
		handleError(error, fallback) {
			const message = (error && (error.message || error.errMsg)) || fallback || '请求失败'
			uni.showToast({
				title: fallback ? `${fallback}，请稍后重试` : message,
				icon: 'none',
				duration: 2200
			})
			console.warn('[caregiverIndex]', fallback || message, error)
		},
		// 根据待办数量更新顶部通知文案
		updateNotice() {
			if (this.stats.waitAccept > 0) {
				this.noticeText = `您有 ${this.stats.waitAccept} 个订单待接单，请及时处理`
			} else if (this.stats.pending + this.stats.inService > 0) {
				this.noticeText = `您有 ${this.stats.pending + this.stats.inService} 个服务待处理，请注意服务时间`
			} else {
				this.noticeText = '今日暂无紧急待办，可查看陪诊服务日历'
			}
		},
		// 兼容数组、分页对象和业务包装对象的列表提取
		extractList(data) {
			if (Array.isArray(data)) return data
			if (!data) return []
			if (Array.isArray(data.conversations)) return data.conversations
			if (Array.isArray(data.messages)) return data.messages
			if (Array.isArray(data.list)) return data.list
			if (Array.isArray(data.records)) return data.records
			if (Array.isArray(data.rows)) return data.rows
			if (Array.isArray(data.items)) return data.items
			if (Array.isArray(data.data)) return data.data
			return []
		},
		// 标准化用户会话卡片字段
		normalizeUser(raw) {
			const source = raw || {}
			const patient = source.patient || source.patientInfo || source.patientProfile || source.customer || source.userInfo || source.user || {}
			const data = Object.assign({}, patient, source)
			const lastMessage = this.extractMessageText(
				source.lastMessage || source.latestMessage || source.lastMessageVO || source.lastMessageInfo || source.recentMessage || source.message ||
				source.lastMsg || data.lastMessage || data.latestMessage || data.messageContent || data.lastMsgContent || data.remark
			)
			const lastMsgAt = this.extractMessageTime(source.lastMessage || source.latestMessage || source.lastMessageInfo) ||
				source.lastMsgAt || source.time || source.lastTime || data.lastMsgAt || data.lastMessageAt || data.lastInteractionAt || data.updateTime
			const gender = data.gender || data.sex || data.genderText || patient.gender || patient.sex || ''
			const genderText = gender === 'MALE' || gender === '男' || gender === 1
				? '男'
				: gender === 'FEMALE' || gender === '女' || gender === 2
					? '女'
					: gender
			const hospital = data.hospital || data.hospitalName || data.medicalInstitution || patient.hospital || patient.hospitalName || '暂无医院信息'
			const department = data.department || data.deptName || patient.department || patient.deptName || ''
			const surgeryType = data.surgeryType || data.surgeryName || data.operationType || data.operationName || patient.surgeryType || patient.surgeryName || ''
			const hospitalSurgery = [hospital === '暂无医院信息' ? '' : hospital, department, surgeryType].filter(Boolean).join(' · ')
			return {
				id: source.id || source.conversationId || source.chatId || data.id || '',
				conversationId: source.id || source.conversationId || source.chatId || '',
				patientId: data.patientId || patient.id || patient.patientId || data.userId || source.patientId || '',
				name: data.name || data.patientName || data.nickname || source.title || source.conversationTitle || '未命名患者',
				age: this.toNumber(data.age || patient.age),
				ageText: this.toNumber(data.age || patient.age) ? `${data.age || patient.age}岁` : '年龄未填',
				gender,
				genderText,
				tagText: data.tag || data.label || data.riskLevelText || data.patientTag || data.serviceTag || '',
				tagType: data.tagType || 'success',
				inpatientNo: data.inpatientNo || data.hospitalNo || data.admissionNo || data.patientNo || patient.inpatientNo || '待补充',
				hospital,
				department,
				surgeryType,
				diagnosis: data.diagnosis || data.diagnosisName || data.mainDiagnosis || patient.diagnosis || '',
				hospitalSurgery: hospitalSurgery || '多学科随诊群沟通',
				lastMessage: lastMessage || '暂无最新消息',
				unreadCount: this.toNumber(source.unread || data.unreadCount || data.unread || data.unreadNum || source.unreadMessageCount),
				avatar: data.avatar || data.avatarUrl || data.headImg || patient.avatar || patient.avatarUrl || '',
				lastMsgAt: lastMsgAt || '',
				lastMsgAtText: this.formatDateTime(lastMsgAt),
				conversationRaw: source,
				conversationData: data
			}
		},
		// 从会话最新消息对象中提取可展示文本
		extractMessageText(message) {
			if (!message) return ''
			if (typeof message === 'string') return message
			if (Array.isArray(message)) return message.map(item => this.extractMessageText(item)).filter(Boolean).join(' ')
			if (typeof message !== 'object') return String(message)
			return message.content || message.text || message.message || message.body || message.lastContent || message.summary || ''
		},
		// 从会话最新消息对象中提取发送时间
		extractMessageTime(message) {
			if (!message || typeof message !== 'object') return ''
			return message.createTime || message.sendTime || message.time || message.updateTime || message.createdAt || ''
		},
		// 标准化订单卡片字段
		normalizeOrder(raw) {
			const source = raw || {}
			const booking = source.booking || source.order || {}
			const patient = source.patient || booking.patient || {}
			const data = Object.assign({}, booking, patient, source)
			const serviceDate = data.serviceDate || data.serviceDay || data.appointmentDate || data.orderDate || data.date || ''
			const rawPeriod = data.period || data.servicePeriod || data.timeSlot || ''
			const period = this.formatPeriod(rawPeriod)
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
		// 对手机号做中间四位脱敏
		maskPhone(phone) {
			const value = String(phone || '').replace(/\s/g, '')
			if (!value) return '手机号待补充'
			if (/^1\d{10}$/.test(value)) return `${value.slice(0, 3)}****${value.slice(7)}`
			return value
		},
		// 将接口数字字段安全转换为数值
		toNumber(value) {
			const number = Number(value)
			return Number.isFinite(number) ? number : 0
		},
		// 格式化日历使用的月份
		formatMonth(date) {
			const current = date instanceof Date ? date : new Date(date)
			if (Number.isNaN(current.getTime())) return ''
			const month = String(current.getMonth() + 1).padStart(2, '0')
			return `${current.getFullYear()}-${month}`
		},
		// 格式化消息和服务时间展示
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
		// 合并服务日期、时段和具体时间
		formatServiceTime(dateText, period, timeText) {
			if (timeText) return timeText
			if (dateText && period) return `${dateText} ${period}`
			return dateText || period || '服务时间待确认'
		},
		// 转换服务时段枚举
		formatPeriod(period) {
			const map = {
				MORNING: '上午',
				AFTERNOON: '下午',
				FULLDAY: '全天'
			}
			return map[String(period || '').toUpperCase()] || period || ''
		},
		// 订单按服务时间倒序排列
		compareServiceTime(a, b) {
			const aTime = new Date(`${a.serviceDate || ''} ${a.period || ''}`.trim()).getTime()
			const bTime = new Date(`${b.serviceDate || ''} ${b.period || ''}`.trim()).getTime()
			if (Number.isNaN(aTime) || Number.isNaN(bTime)) return String(b.serviceTime).localeCompare(String(a.serviceTime))
			return bTime - aTime
		},
		// 将排班列表转换为按日期分组的映射
		listToScheduleMap(list) {
			return list.reduce((map, item) => {
				const date = item.date || item.serviceDate || item.day
				if (!date) return map
				if (!map[date]) map[date] = []
				map[date].push(item)
				return map
			}, {})
		},
		// 统计当前月份排班总数
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
	overflow: hidden;
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
	flex: 1 1 0;
}

.user-main {
	overflow: hidden;
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
	flex-wrap: nowrap;
	width: 100%;
	max-width: 100%;
	justify-content: space-between;
	overflow: hidden;
	box-sizing: border-box;
}

.message-row ::v-deep .u-icon {
	flex-shrink: 0;
}

.message-row .message-text {
	flex: 1 1 0;
	width: 0;
	min-width: 0;
	max-width: 100%;
	margin-right: 16rpx;
	display: block;
	box-sizing: border-box;
	height: 16px;
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

.chat-popup {
	max-height: 92vh;
	padding: 30rpx 26rpx calc(30rpx + env(safe-area-inset-bottom));
	background: #f5f7fb;
	border-radius: 24rpx 24rpx 0 0;
	box-sizing: border-box;
	overflow-y: auto;
}

.chat-popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 22rpx;
	margin-bottom: 18rpx;
	border-bottom: 1rpx solid #e8edf7;
}

.chat-popup-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #182338;
}

.chat-popup-subtitle {
	margin-top: 6rpx;
	font-size: 23rpx;
	color: #96a0b5;
}

.chat-popup-close {
	width: 62rpx;
	height: 62rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #ffffff;
	flex-shrink: 0;
}

.chat-section-title {
	margin: 4rpx 0 14rpx;
	font-size: 26rpx;
	font-weight: 700;
	color: #344054;
}

.chat-message-scroll {
	height: 560rpx;
	padding: 22rpx;
	background: #ffffff;
	border-radius: 22rpx;
	box-sizing: border-box;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
}

.popup-state {
	min-height: 220rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #96a0b5;
}

.popup-state.mini {
	min-height: 150rpx;
}

.popup-state-text {
	margin-top: 12rpx;
	font-size: 24rpx;
}

.popup-msg-item {
	display: flex;
	margin-bottom: 24rpx;
}

.popup-msg-item.mine {
	flex-direction: row-reverse;
}

.popup-msg-avatar,
.member-avatar {
	width: 68rpx;
	height: 68rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #edf4ff;
	flex-shrink: 0;
	overflow: hidden;
}

.popup-msg-avatar {
	margin-right: 14rpx;
}

.popup-msg-item.mine .popup-msg-avatar {
	margin-right: 0;
	margin-left: 14rpx;
	background: #2563ff;
}

.popup-avatar-img {
	width: 100%;
	height: 100%;
}

.popup-msg-body {
	max-width: 78%;
	min-width: 0;
}

.popup-sender {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
	font-size: 23rpx;
	color: #5e687c;
}

.popup-msg-item.mine .popup-sender {
	justify-content: flex-end;
}

.popup-role-tag,
.member-role {
	margin-left: 8rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	background: #eef4ff;
	color: #2563ff;
	font-size: 20rpx;
}

.popup-bubble {
	padding: 18rpx 22rpx;
	border-radius: 8rpx 20rpx 20rpx 20rpx;
	background: #f4f6fa;
	font-size: 26rpx;
	line-height: 1.55;
	color: #263247;
	word-break: break-all;
}

.popup-msg-item.mine .popup-bubble {
	border-radius: 20rpx 8rpx 20rpx 20rpx;
	background: #2563ff;
	color: #ffffff;
}

.popup-bubble.fail {
	background: #fff1f0;
	color: #cf1322;
}

.popup-msg-meta {
	display: flex;
	gap: 12rpx;
	margin-top: 6rpx;
	font-size: 20rpx;
	color: #a1aabc;
}

.popup-msg-item.mine .popup-msg-meta {
	justify-content: flex-end;
}

.chat-input-row {
	display: flex;
	align-items: center;
	gap: 14rpx;
	margin: 18rpx 0 20rpx;
}

.chat-popup-input {
	flex: 1;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: #ffffff;
	font-size: 26rpx;
	box-sizing: border-box;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
}

.chat-input-row ::v-deep .u-button {
	flex-shrink: 0;
}

.collapse-panel {
	margin-bottom: 16rpx;
	background: #ffffff;
	border-radius: 22rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 24rpx rgba(28, 45, 85, 0.04);
}

.collapse-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 22rpx;
}

.collapse-left {
	display: flex;
	align-items: center;
	min-width: 0;
}

.collapse-title {
	margin-left: 10rpx;
	font-size: 27rpx;
	font-weight: 700;
	color: #263247;
}

.collapse-count {
	margin-left: 8rpx;
	font-size: 24rpx;
	color: #96a0b5;
}

.collapse-content {
	padding: 0 22rpx 22rpx;
}

.popup-empty-inline {
	padding: 28rpx 20rpx;
	text-align: center;
	font-size: 24rpx;
	color: #96a0b5;
	background: #f7f9fc;
	border-radius: 18rpx;
}

.member-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	margin-bottom: 14rpx;
	border-radius: 18rpx;
	background: #f7f9fc;
}

.member-info {
	flex: 1;
	min-width: 0;
	margin-left: 16rpx;
}

.member-name-row {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.member-name {
	font-size: 27rpx;
	font-weight: 700;
	color: #263247;
}

.member-remark {
	font-size: 23rpx;
	color: #8b95a9;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.profile-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
}

.profile-item {
	width: calc(50% - 7rpx);
	padding: 18rpx;
	background: #f7f9fc;
	border-radius: 18rpx;
	box-sizing: border-box;
}

.profile-item.wide {
	width: 100%;
}

.profile-label {
	display: block;
	margin-bottom: 8rpx;
	font-size: 22rpx;
	color: #96a0b5;
}

.profile-value {
	display: block;
	font-size: 26rpx;
	line-height: 1.45;
	color: #344054;
	word-break: break-all;
}

.profile-value.strong {
	color: #2563ff;
	font-weight: 600;
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

.full-bubble.fail {
	background: #fff1f0;
	color: #cf1322;
}

.full-mine-meta {
	display: flex;
	margin-top: 8rpx;
}

.full-mine-meta text + text {
	margin-left: 10rpx;
}

.full-chat-footer {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx calc(18rpx + env(safe-area-inset-bottom));
	background: #ffffff;
	border-top: 1rpx solid #edf1f7;
}

.full-chat-input {
	flex: 1;
	height: 72rpx;
	padding: 0 24rpx;
	margin-right: 16rpx;
	background: #f3f6fb;
	border-radius: 999rpx;
	font-size: 25rpx;
	color: #263247;
	box-sizing: border-box;
}

.full-chat-footer ::v-deep .u-button {
	flex-shrink: 0;
	margin: 0;
}

/* 新增：患者档案与群成员独立弹窗 */
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
	background: #ffffff;
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

.side-title-icon.blue {
	background: #eef4ff;
}

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
	background: #ffffff;
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
}

.archive-value.strong {
	color: #2563ff;
	font-weight: 600;
}

.diagnosis-row {
	padding: 18rpx 0;
	border-top: 1rpx solid #f0f2f7;
}

.diagnosis-row .archive-value {
	margin-top: 8rpx;
}

.source-text {
	display: block;
	margin-top: 8rpx;
	font-size: 21rpx;
	color: #16a34a;
}

.archive-footer {
	flex-shrink: 0;
	padding: 16rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
	background: #ffffff;
	border-top: 1rpx solid #edf1f7;
}

.member-desc {
	flex-shrink: 0;
	padding: 18rpx 24rpx 0;
	font-size: 23rpx;
	line-height: 1.5;
	color: #96a0b5;
}

.member-body {
	padding-top: 18rpx;
}

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
