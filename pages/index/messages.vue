<template>
	<view class="page-content page-message">
		<u-tabbar :value="activeTab" :placeholder="false" @change="id => activeTab = id" :fixed="true"
			activeColor="rgb(21, 93, 252)" inactiveColor="#d2d6dd" :safeAreaInsetBottom="false">
			<u-tabbar-item v-for="item in tabList" :key="item.id" :text="item.name" :icon="item.icon"
				:badge="item.badge" @click="routeTo(item.route)"></u-tabbar-item>
		</u-tabbar>
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
			<u-tabs @click="tabClick" :list="list1" lineWidth="20" lineHeight="7" lineColor="#155DFC" :activeStyle="{
		        color: '#303133',
		        fontWeight: 'bold',
		        transform: 'scale(1.05)'
		    }" :inactiveStyle="{
		        color: '#606266',
		        transform: 'scale(1)'
		    }" itemStyle="padding-left: 15px; padding-right: 15px; padding-bottom:5px;height: 34px;">
			</u-tabs>

		</view>
		<view class="msg-item radius-15 card-top bg-white card-border card-border-gray" v-for="(item,index) in chatHistory" :key="index" @click="routeTo(item)">
			<!-- 左侧图标 -->
			<view class="msg-icon-wrap  badge-blue-bg" :style="{backgroundColor:item.bgColor}"  v-if="item.type=='human'">
				<view class="massage-icon-left ">
					<text class="custom-icon custom-icon-Headset1 icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
				</view>
				<!-- <text class="msg-icon">{{item.icon}}</text> -->
				<view v-if="item.showDot" class="online-dot"></view>
			</view>
			<view class="msg-icon-wrap badge-orange-bg" :style="{backgroundColor:item.bgColor}"  v-else-if="item.type=='system'">		
				<view class="massage-icon-left  " >
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
					<view class="msg-desc">{{item.lastMsg}}</view>
					<u-badge numberType="limit" max="99" :value="item.unreadCount"></u-badge>
					<!-- <view  class="red-badge">{{item.unreadCount}}</view> -->
				</view>

			</view>

			<!-- ✅最右侧箭头，独立列，垂直居中 -->
			<u-icon name="arrow-right"></u-icon>
		</view>
	<!-- 	<view v-for="(item,index) in chatHistory" class="radius-15 card-top bg-white card-border card-border-gray"
			@click="routeTo('consultation')">
			<view class=" massage-list">
				<view class="massage-icon-left view-icon badge-blue-bg" v-if="item.type=='human'">
					<text class="custom-icon custom-icon-Headset1 icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
				</view>
				<view class="massage-icon-left view-icon badge-orange-bg" v-else-if="item.type=='system'">

					<text class="custom-icon custom-icon-order icon-bold" style="font-size:40rpx;color:#ff6900;"></text>
				</view>
				<view class="massage-content">
					<view class="view-text">
						<view class="view-text1 font-l">
							{{item.name}}
						</view>
						<u--text size="12" class="font-info font-s" :lines="1" :text="item.lastMsg"></u--text>
					</view>
					<view class="massage-time u-flex align-center space-between  u-flex-column">
						<view class="font-info font-s">{{item.time}}</view>
						<view>
							<u-badge numberType="limit" max="99" :value="item.unreadCount"></u-badge>
						</view>
					</view>
				</view>
				<view class="massage-icon-right">
					<u-icon name="arrow-right" color="#909399" size="30rpx"></u-icon>
				</view>

			</view>

		</view> -->
		<main-tabbar :current="2"></main-tabbar>
	</view>
</template>
<script>
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'
	// import { toRaw } from 'vue'
	export default {
		components: {
			mainTabbar
		},
		data() {
			return {
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
					badge: "3",
					route: "messages"
				}, {
					id: 4,
					name: "我的",
					icon: "account",
					badge: "",
					route: "profile"
				}],
				activeTab: 2,
				list1: [{
					name: '全部',

					badge: {
						value: 5,
					}
				}, {
					name: '健康管理团队',
					type: "human",

				}, {
					name: '系统通知',
					type: "system",

				}],
				chatHistory: [{
						id: "group-1",
						name: "健康管理团队",
						lastMsg: "张先生，您的手术切口照片已收到，主刀团队正在审核，稍后给您回复。",
						time: "10:05",
						unread: true,
						unreadCount: 1,
						type: "human",
						status: "在线",
						showDot:true
					},
					{
						id: "sys-1",
						name: "服务到期续费",
						lastMsg: "您的术后康复尊享包还有3天到期，为避免服务中断，请及时续费。",
						time: "昨天",
						unread: true,
						unreadCount: 1,
						type: "system",
						status: ""
					},
					{
						id: "sys-2",
						name: "宣教资料更新",
						lastMsg: "《心血管术后饮食与活动指南》已下发，请您查收并按要求执行。",
						time: "09:30",
						unread: true,
						unreadCount: 1,
						type: "system",
						status: ""
					},
					{
						id: "sys-3",
						name: "系统更新公告",
						lastMsg: "V2.4.0版本已上线，优化了多端响应速度及专家团队回复效率。",
						time: "周一",
						unread: false,
						unreadCount: 0,
						type: "system",
						status: ""
					}
				]


			};
		},
		methods: {

			tabClick(item) {
				console.log('item', item);
			},
			getIconName(baseName, index) {
				// console.log((baseName,index))
				// console.log((baseName,index))
				// 如果当前选中，使用 fill 结尾的实心图标，否则使用空心图标
				if (this.current === index) {
					console.log(baseName)
					return `${baseName}-fill`;
				}
				return baseName;
			},
			routeTo(res) {
				// console.log(toRaw(res))
				uni.showLoading()
				uni.hideLoading()

				let data = {
					title: 'hello',
					id: res.id
				}

				console.log(data)
				uni.navigateTo({
					url: `../index/consultation`  + `?data=` + encodeURIComponent(JSON.stringify(data))
				})

			}
		},
		onReady() {
			//如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则。

		},
	};
</script>

<style>
	.msg-desc-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		min-width: 0;
	}

	.msg-desc {
		flex: 1;
		min-width: 0;
		/* ✅子元素必须加这个！flex:1的盒子允许被压缩 */
		font-size: 28rpx;
		color: #666;
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
		/* ✅全部垂直居中 */
		gap: 24rpx;
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
		font-size: 34rpx;
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

	/* ✅最右侧箭头 */
	.icon-arrow {
		font-size: 36rpx;
		color: #cccccc;
		flex-shrink: 0;
		/* 如果你用uview，替换成 <u-icon name="arrow-right"></u-icon> */
		content: ">";
	}
</style>