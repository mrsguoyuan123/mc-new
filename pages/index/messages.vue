<template>
	<view class="page-content page-message">
		<!-- <u-tabbar :value="activeTab" :placeholder="false" @change="id => activeTab = id" :fixed="true"
			activeColor="rgb(21, 93, 252)" inactiveColor="#d2d6dd" :safeAreaInsetBottom="false">
			<u-tabbar-item v-for="item in tabList" :key="item.id" :text="item.name" :icon="item.icon"
				:badge="item.badge" @click="routeTo(item.route)"></u-tabbar-item>
		</u-tabbar> -->
		<view class=" u-flex space-between align-center margin-bottom-1">
			<view>
				<view class="view-text1 font-l">
					沟通记录
				</view>
				<view class="view-text2">
					MESSAGES
				</view>
			</view>

			<view class="badge-bg  badge-blue-bg border-blue">
				术后康复专属通道
			</view>

		</view>
		<view class="margin-bottom-1">
			<u--input placeholder="搜索消息或通知" shape="circle" prefixIcon="search"
				prefixIconStyle="font-size: 22px;color: #909399"></u--input>
		</view>
		<view class="margin-bottom-1">
			<u-tabs @click="tabClick" :list="messageList" lineWidth="20" lineHeight="7" lineColor="#155DFC" :activeStyle="{
		        color: '#303133',
		        fontWeight: 'bold',
		        transform: 'scale(1.05)'
		    }" :inactiveStyle="{
		        color: '#606266',
		        transform: 'scale(1)'
		    }" itemStyle="padding-left: 15px; padding-right: 15px; padding-bottom:5px;height: 34px;">
			</u-tabs>

		</view>
		<view class="msg-item radius-15 card-top bg-white card-border card-border-gray"
			v-for="(item,index) in chatHistory" :key="index" @click="routeTo(item)">
			<!-- 左侧图标 -->
			<view class="msg-icon-wrap  badge-blue-bg  mr-16" :style="{backgroundColor:item.bgColor}"
				v-if="item.type=='human'">
				<view class="massage-icon-left ">
					<text class="custom-icon custom-icon-Headset1 icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
				</view>
				<!-- <text class="msg-icon">{{item.icon}}</text> -->
				<view v-if="item.showDot" class="online-dot"></view>
			</view>
			<view class="msg-icon-wrap badge-orange-bg  mr-16" :style="{backgroundColor:item.bgColor}"
				v-else-if="item.type=='system'">
				<view class="massage-icon-left  ">
					<text class="custom-icon custom-icon-order icon-bold" style="font-size:40rpx;color:#ff6900;"></text>
				</view>
				<!-- <text class="msg-icon">{{item.icon}}</text> -->
				<view v-if="item.showDot" class="online-dot"></view>
			</view>

			<!-- 中间主体内容 -->
			<view class="msg-content">
				<view class="msg-title-row">
					<text class="msg-title">{{item.name}}</text>
					<text class="msg-time">{{item.time}}</text>
				</view>

				<view class="msg-desc-row">
					<view class="msg-desc mr-16">{{item.lastMsg}}</view>
					<u-badge numberType="limit" max="99" :value="item.unreadCount"></u-badge>
					<!-- <view  class="red-badge">{{item.unreadCount}}</view> -->
				</view>

			</view>

			<!-- 最右侧箭头，独立列，垂直居中 -->
			<u-icon name="arrow-right" class="ml-16"></u-icon>
			
		</view>
		
		<main-tabbar :current="2" :totalUnread="totalUnread"></main-tabbar>
	</view>
</template>
<script>
import {
		getMeConversationsApi as fetchConversationsApi,
	} from '@/api/frontApikit.js'
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'
	// import { toRaw } from 'vue'
	export default {
		components: {
			mainTabbar
		},
		data() {
			const userInfo = JSON.parse(uni.getStorageSync('userInfo')) || {}
			return {
				totalUnread: 0,
				id: userInfo.userId || '',
				current: 0,
				tabList: [{
					id: 1,
					name: "首页",
					icon: "home",
					badge: "",
					route: "home"
				}, {
					id: 2,
					name: "健康",
					icon: "heart",
					badge: "",
					route: "healthCenter"
				}, {
					id: 3,
					name: "消息",
					icon: "chat",
					badge: "",
					route: "messages"
				}, {
					id: 4,
					name: "我的",
					icon: "account",
					badge: "",
					route: "profile"
				}],
				activeTab: 2,
				messageList: [{
					name: '全部',
					badge: {
						value: 0,
					}
				}, {
					name: '健康管理团队',
					type: "human",

				}, {
					name: '系统通知',
					type: "system",

				}],
				loading: false,
				activeCategory: '',
				keyword: '',
				conversationList: [],
				systemNotificationList: [],
				allMessageList: [],
				chatHistory: []
			};
		},
		onLoad() {
			this.loadConversations()
		},
		mounted() {
			this.$nextTick(() => {
				this.bindSearchInput(this.$children)
			})
		},
		methods: {
			// 新增：计算全部未读总和，赋值给消息tab badge
			calcTotalUnread() {
		let total = 0
		this.allMessageList.forEach(item=>{
			total += Number(item.unreadCount || 0)
		})
		this.totalUnread = total
		
	},
			
			async loadConversations() {
				this.loading = true
				uni.showLoading({
					title: '加载中...',
					mask: true
				})
				try {
					const result = await fetchConversationsApi()
					
					const data = result || {}
					this.conversationList = this.normalizeConversations(data.conversations || [])
					this.systemNotificationList = this.normalizeNotifications(data.systemNotifications || [])
					this.allMessageList = this.conversationList.concat(this.systemNotificationList)
					this.applyFilters()
					this.messageList[0].badge.value = this.allMessageList.length;

					// 计算未读总数，更新tab红点
					this.calcTotalUnread()
					
					if (!this.allMessageList.length) {
						uni.showToast({
							title: '暂无消息',
							icon: 'none'
						})
					}
				} catch (e) {
					console.log('获取消息列表失败：', e)
					this.conversationList = []
					this.systemNotificationList = []
					this.allMessageList = []
					this.chatHistory = []
					// 清空角标
					this.tabList[2].badge = ''
					uni.showToast({
						title: (e && e.message) || '消息加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
					uni.hideLoading()
				}
			},
			normalizeConversations(list) {
				return (list || []).map(item => {
					const unreadCount = Number(item.unread || 0)
					return {
						id: item.id,
						name: item.name || '私人健康顾问',
						type: item.type || 'human',
						lastMsg: item.lastMsg || '',
						rawTime: item.time || '',
						time: this.formatTime(item.time),
						unreadCount: unreadCount,
						showDot: unreadCount > 0,
						bgColor: '#E8F0FF'
					}
					
				})
			
			},
			normalizeNotifications(list) {
				return (list || []).map(item => {
					const unreadCount = item.isRead ? 0 : 1
					return {
						id: item.id,
						name: item.title || '系统通知',
						type: 'system',
						title: item.title || '系统通知',
						content: item.content || '',
						lastMsg: item.content || '',
						rawTime: item.time || '',
						time: this.formatTime(item.time),
						unreadCount: unreadCount,
						showDot: false,
						isRead: !!item.isRead,
						bgColor: '#FFF3E8'
					}
				})
			},
			applyFilters() {
				let sourceList = this.allMessageList
				if (this.activeCategory === 'human') {
					sourceList = this.conversationList
				} else if (this.activeCategory === 'system') {
					sourceList = this.systemNotificationList
				}
				const keyword = (this.keyword || '').trim().toLowerCase()
				if (!keyword) {
					this.chatHistory = sourceList
					return
				}
				this.chatHistory = sourceList.filter(item => {
					const name = item.name || ''
					const lastMsg = item.lastMsg || ''
					const title = item.title || ''
					return name.toLowerCase().indexOf(keyword) > -1 ||
						lastMsg.toLowerCase().indexOf(keyword) > -1 ||
						title.toLowerCase().indexOf(keyword) > -1
				})
			},

			tabClick(item) {
				const tab = item && item.index !== undefined ? this.messageList[item.index] : item
				this.activeCategory = tab && tab.type ? tab.type : ''
				this.applyFilters()
			},
			bindSearchInput(children) {
				;(children || []).forEach(child => {
					if (!child) return
					if (child.$options && child.$options.name === 'u--input' && !child.__searchInputBound) {
						child.__searchInputBound = true
						const originalEmit = child.$emit.bind(child)
						child.$emit = (eventName, value) => {
							if (eventName === 'input' || eventName === 'change') {
								this.keyword = value === undefined || value === null ? '' : String(value)
								this.applyFilters()
							}
							return originalEmit(eventName, value)
						}
					}
					if (child.$children && child.$children.length) {
						this.bindSearchInput(child.$children)
					}
				})
			},
			getIconName(baseName, index) {
			
				// 如果当前选中，使用 fill 结尾的实心图标，否则使用空心图标
				if (this.current === index) {
					console.log(baseName)
					return `${baseName}-fill`;
				}
				return baseName;
			},
			routeTo(res) {
			
				if (typeof res === 'string') {
					this.$safeJump(res)
					return
				}
				if (!res) return
				if (res.type === 'system') {
					uni.showModal({
						title: res.title || res.name || '系统通知',
						content: res.content || res.lastMsg || '暂无通知内容',
						showCancel: false,
						confirmText: '我知道了'
					})
					return
				}
				uni.navigateTo({
					url: '/pages/index/consultation?conversationId=' + encodeURIComponent(res.id)
				})
			},
			
			formatTime(value) {
  if (!value) return ''
  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? '' : this.formatDate(date)
  }
  let text = String(value)
  // 专门兼容 ISO 2026-10-27T18:38:06 格式，优先处理T分隔
  if (text.includes('T')) {
    text = text.replace('T', ' ')
  } else {
    text = text.replace(/-/g, '/')
  }
  const date = new Date(text)
  if (isNaN(date.getTime())) return String(value)
  return this.formatDate(date)
},
formatDate(date) {
  const now = new Date()
  const pad = num => (Number(num) < 10 ? '0' + num : '' + num)
  const timeText = pad(date.getHours()) + ':' + pad(date.getMinutes())
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayDiff = Math.round((startOfToday - startOfDate) / 86400000)
  if (dayDiff === 0) return timeText
  if (dayDiff === 1) return '昨天 ' + timeText
  if (date.getFullYear() === now.getFullYear()) {
    return pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + timeText
  }
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + timeText
}


		},
		onReady() {

		},
	};
</script>

<style>
	

	.msg-desc {
		flex: 1;
		min-width: 0;
		font-size: 24rpx;
		color: #909399;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}



	.msg-item {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		display: flex;
		align-items: center;
	}

	.msg-icon-wrap {
		width: 96rpx;
		height: 96rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
	}

	.msg-icon {
		font-size: 44rpx;
	}

	.online-dot {
		width: 20rpx;
		height: 20rpx;
		background: #28c76f;
		border: 4rpx solid #fff;
		border-radius: 50%;
		position: absolute;
		right: -4rpx;
		bottom: -4rpx;
	}

	.msg-content {
		flex: 1;
		min-width: 0;
	}

	.msg-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.msg-title {
		font-size: 26rpx;
		font-weight: bold;
		color: #111;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.msg-time {
		font-size: 26rpx;
		color: #999;
	}

	.msg-desc-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-width: 0;
	}

	.msg-desc {
		font-size: 28rpx;
		color: #666;
	}

	/* 红色角标 数字1 */
	.red-badge {
		min-width: 40rpx;
		height: 40rpx;
		padding: 0 10rpx;
		background: #f53f3f;
		border-radius: 50rpx;
		color: #fff;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 最右侧箭头 */
	.icon-arrow {
		font-size: 30rpx;
		color: #cccccc;
		flex-shrink: 0;
		margin-left: 20rpx;
	}
</style>
