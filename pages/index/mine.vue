<template>
	<view class="page-my">
		<view class="content-wrap">
			<!-- 顶部渐变区域 -->
			<view class="top-wrap">
				<view class="user-info">
					<view class="avatar" v-if="caregiverInfo && caregiverInfo.avatar == null"
						:class="caregiverInfo.gender === '女' ? 'avatar-female' : 'avatar-male'"></view>

					<view v-else class="avatar-wrap">
						<image class="avatar-img" :src="caregiverInfo.avatar" mode="aspectFill"></image>
					</view>
					<view class="user-right">
						<view class="name-row">
							<text class="username">{{ caregiverInfo.name }}</text>

						</view>
						<view class="meta font-info">{{ caregiverInfo.description }}</view>

					</view>
				</view>

				<!-- 统计行 -->
				<view class="stat-row">
					<view class="stat-item">
						<view class="num">{{ stat.totalCount }}</view>
						<view class="label">累计服务</view>
					</view>
					<view class="stat-item">
						<view class="num">{{ stat.monthCount }}</view>
						<view class="label">本月服务</view>
					</view>
					<view class="stat-item">
						<view class="num">{{ stat.rating }}</view>
						<view class="label">服务评分</view>
					</view>

				</view>
			</view>
			<view class="contact-card">
				<view class="title">联系方式</view>
				<view class="u-flex align-items-center">
					<u-icon name="phone" color="#666" size="36rpx"></u-icon>
					<text class="ml-2">{{ maskPhone(caregiverInfo.phone) }}</text>
				</view>
			</view>

			<!-- 功能菜单卡片 -->
			<view class="menu-card">
				<view class="menu-item" v-for="(item, key) in routeList" @click="routeTo(item.routeTo)">
					<u-icon :name="item.icon" color="#231f32" size="40rpx"></u-icon>
					<text class="menu-label">{{ item.name }}</text>
					<u-icon class="arrow" name="arrow-right" color="#ddd" size="22rpx"></u-icon>
				</view>

			</view>
			<!-- 退出登录按钮 -->
			<view class="logout-btn" @click="logOut()">退出登录 </view>
		</view>
		<myTabbar :current="2"></myTabbar>
	</view>
</template>
<script>
import myTabbar from "@/components/myTabbar.vue";
import {
	postAuthLogoutApi,
	getEscortProfileStatsApi,
	getEscortUsersApi
} from '@/api/frontApikit.js'
export default {
	components: {
		myTabbar
	},
	data() {

		return {
			logoutLoading: false,

			userInfo: {

			},
			caregiverInfo: {},
			stat: {
				monthCount: 0,
				rating: 0,
				totalCount: 0,

			},
			routeList: [{
				name: '我的排班',
				routeTo: 'calendar',
				icon: 'calendar'
			},
			{
				name: '服务记录',
				routeTo: '',
				icon: 'file-text'
			},
			{
				name: '消息通知',
				routeTo: '',
				icon: 'bell'
			},
			{
				name: '账号设置',
				routeTo: '',
				icon: 'setting'
			},
			{
				name: '帮助中心',
				routeTo: '',
				icon: 'question-circle'
			},
			]
		}
	},
	onLoad() {
		this.userInfo = this.readCurrentUser()
		this.loadData()
	},
	methods: {
		maskPhone(phone) {
			if (!phone || phone.length !== 11) return phone
			return phone.slice(0, 3) + '****' + phone.slice(7)
		},
		// 读取本地登录信息，兼容字符串和对象两种缓存格式
		readCurrentUser() {
			try {
				const raw = uni.getStorageSync('userInfo')
				if (!raw) return {}
				return typeof raw === 'string' ? JSON.parse(raw) : raw
			} catch (error) {
				return {}
			}
		},

		async loadData() {
			// console.log(this.userInfo)
			const res = await getEscortProfileStatsApi()
			// console.log(3333, res)
			this.caregiverInfo = res;
			// this.caregiverInfo.avatar = "https://picsum.photos/id/65/200/200"
			const res1 = await getEscortUsersApi({
				id: this.userInfo.userId
			})


			this.stat = res
			console.log(res1)


		},
		routeTo(res) {
			let routeUrl = `../index/` + res
			this.$safeJump(routeUrl)
		},
		logOut() {
			uni.showModal({
				title: '提示',
				content: '确认退出登录？',
				success: async (res) => {
					if (res.confirm) {
						await this.requestLogout()
					}
				}
			})
		},
		async requestLogout() {
			if (this.logoutLoading) return
			this.logoutLoading = true
			let logoutFailed = false
			uni.showLoading({
				title: '退出中...',
				mask: true
			})
			try {
				const refreshToken = uni.getStorageSync('refreshToken')
				await postAuthLogoutApi(refreshToken ? {
					refreshToken
				} : {})
			} catch (error) {
				logoutFailed = true
				uni.showToast({
					title: '退出失败，已清空登录状态',
					icon: 'none',
					duration: 800
				})
			} finally {
				uni.removeStorageSync('accessToken')
				uni.removeStorageSync('refreshToken')
				uni.removeStorageSync('userInfo')
				this.logoutLoading = false
				uni.hideLoading()
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/login'
					})
				}, logoutFailed ? 600 : 0)
			}
		}
	}
}
</script>
<style scoped>
.page-my {
	background-color: #eef0f6;
	padding-bottom: calc(120rpx + var(--safe-area-inset-bottom));
	max-width: 500px;
	margin: 0 auto;
	padding: 0 30rpx;
	min-height: 100vh;
	box-sizing: border-box;

	padding-top: calc(60rpx + var(--status-bar-height));
	/* padding-bottom: calc(60px + var(--safe-area-inset-bottom)); */
}

.page-my>.content-wrap {
	flex: 1;
}

.avatar {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	margin-right: 24rpx;
	border: 2px solid #fff;
	overflow: hidden;
	background-size: 100% auto;
	background-repeat: no-repeat;
	position: relative;
	top: -60rpx;
}

.avatar-male {
	background-image: url("@/static/img/maleAvatar.png");
}

.avatar-female {
	background-image: url("@/static/img/femaleAvatar.png");
}

.avatar-wrap {
	width: 200rpx;
	height: 200rpx;
	flex-shrink: 0;
	border-radius: 50%;
	margin-right: 24rpx;
	border: 2px solid #ffffff;
	overflow: hidden;
	position: relative;
	top: -60rpx;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.user-info {
	display: flex;
	/* align-items: center; */
	/* margin-bottom: 40rpx; */
}

.user-info .username {
	font-size: 38rpx;
	/* color: #fff; */
	font-weight: bold;
	display: block;
	margin-bottom: 16rpx;
}


.meta {
	font-size: 22rpx;
}

.name-row {
	display: flex;
	align-items: center;
}

.username {
	font-size: 38rpx;
	font-weight: 600;
}

.online-tag {
	display: flex;
	align-items: center;
	background: #e6f9e9;
	color: #36b346;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-left: 16rpx;
	font-size: 24rpx;
}

.green-dot {
	width: 12rpx;
	height: 12rpx;
	background-color: #36b346;
	border-radius: 50%;
	margin-right: 6rpx;
}

.stat-row {
	display: flex;
	justify-content: space-between;
	position: relative;
	top: -30rpx;
}

.stat-item {
	text-align: center;
	flex: 1;
}

.stat-item .num {
	font-size: 38rpx;
	font-weight: bold;
}

.stat-item .label {
	font-size: 26rpx;
	color: #666;
	margin-top: 6rpx;
}

.top-wrap {
	/* background: linear-gradient(180deg, #fff1dd, #ffffff); */
	padding: 20rpx 30rpx;
	border: 1px solid #fff;
	border-radius: 10px;
	background: radial-gradient(circle at top right, #fff1dd, #ffffff 70%);
}

.tag {
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 99rpx;
	padding: 8rpx 20rpx;
}

.tag-dot {
	width: 12rpx;
	height: 12rpx;
	background: #4cd964;
	border-radius: 50%;
	margin-right: 12rpx;
}

.tag-text {
	color: #fff;
	font-size: 24rpx;
	opacity: 0.8;
}

/* 菜单卡片 */
.menu-card {
	/* margin: -30rpx 30rpx 40rpx; */
	background: #fff;
	border-radius: 20rpx;
	/* border: 1px solid #fff; */
	overflow: hidden;
	margin: 30rpx 0;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 28rpx 32rpx;
	color: #231f32;

}


.menu-icon {
	font-size: 44rpx;
	width: 70rpx;
	margin-right: 24rpx;
}

.menu-label {
	flex: 1;
	font-size: 26rpx;
	margin-left: 5px;
	line-height: 45rpx;
}

/* 退出登录 */
.logout-btn {
	/* border: 1px solid #ddd; */
	text-align: center;
	font-size: 26rpx;
	height: 70rpx;
	line-height: 70rpx;
	background-color: #fff;
	border-radius: 15rpx;
}

.logout-icon,
.logout-text {
	/* color: #e53935; */
	font-size: 34rpx;
}

.logout-icon {
	margin-right: 12rpx;
}

.contact-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 32rpx;
	margin: 30rpx 0;
}

.title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 24rpx;
}
</style>
<style>
uni-page-body {
	/* overflow: hidden !important; */
}
</style>