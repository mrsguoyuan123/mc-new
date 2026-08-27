<template>
	<view class="page-my">
		<!-- 紫色头部 -->
		<view class="header bg-linear-purple-dark">
			<view class="avatar-wrap">
				<u-icon name="account" color="white" :bold="true" size="80rpx"></u-icon>
			</view>
			<view class="user-info">
				<text class="username">陈驻点</text>
				<view class="tag">
					<text class="tag-dot"></text>
					<text class="tag-text">驻点陪诊员 (在岗)</text>
				</view>
			</view>
		</view>
		<!-- 功能菜单卡片 -->
		<view class="menu-card">
			<view class="menu-item" @click="routeTo('calendar')">
				<u-icon name="calendar" color="#9333ea" size="45rpx"></u-icon>
				<text class="menu-label">服务日历</text>
				<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
			</view>
			<view class="menu-item" @click="routeTo('records')">
				<u-icon name="file-text" color="#9333ea" size="45rpx"></u-icon>
				<text class="menu-label">陪诊记录查询</text>
				<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
			</view>
			<view class="menu-item" @click="routeTo('auth')">
				<text class="custom-icon custom-icon-shield-check " style="font-size:45rpx;color:#9333ea;"></text>
				<text class="menu-label">资质认证</text>
				<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
			</view>
			<view class="menu-item" @click="routeTo('setting')">
				<u-icon name="setting" color="#99a1af" size="45rpx"></u-icon>
				<text class="menu-label">系统设置</text>
				<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
			</view>
		</view>
		<!-- 退出登录按钮 -->
		<view class="logout-btn">
			<u-button shape="circle" :hairline="false" @click="logOut()" type="error" text="退出登录"></u-button>
		</view>
		<custom-tabbar :current="2"></custom-tabbar>
	</view>
</template>
<script>
	import customTabbar from "@/components/custom-tabbar/custom-tabbar.vue";
	export default {
		components: {
			customTabbar
		},
		data() {
			return {}
		},
		methods: {
			routeTo(res) {
				let data = {
					title: 'hello',
					id: 1
				}
				uni.navigateTo({
					url: `../index/` + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				})
			},
			logOut() {
				uni.showModal({
					title: '提示',
					content: '确认退出登录？',
					success(res) {
						if (res.confirm) {
							uni.clearStorageSync()
							uni.reLaunch({
								url: '/pages/index/login'
							})
						}
					}
				})
			}
		}
	}
</script>
<style scoped>
	.page-my {
		background-color: #f9fafb;
		padding-bottom: calc(120rpx + var(--safe-area-inset-bottom));
		min-height: calc(100vh - 100px);
		max-width: 500px;
		margin: 0 auto;
	}
	/* 紫色头部 */
	.header {
		padding: 80rpx 40rpx 60rpx;
		display: flex;
		align-items: center;
		border-bottom-left-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
	}
	.avatar-wrap {
		width: 140rpx;
		height: 140rpx;
		background: #a84fef;
		border-radius: 32rpx;
		border: 1px solid #c284f4;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}
	.user-info .username {
		font-size: 48rpx;
		color: #fff;
		font-weight: bold;
		display: block;
		margin-bottom: 16rpx;
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
		margin: -30rpx 30rpx 40rpx;
		background: #fff;
		border-radius: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}
	.menu-item {
		display: flex;
		align-items: center;
		padding: 36rpx 32rpx;
	}
	.menu-item:last-child {
		border-bottom: none;
	}
	.menu-icon {
		font-size: 44rpx;
		width: 70rpx;
		margin-right: 24rpx;
	}
	.menu-label {
		flex: 1;
		font-size: 30rpx;
		margin-left: 5px;
		line-height: 45rpx;
	}
	/* 退出登录 */
	.logout-btn {
		padding: 0 30rpx;
	}
	.logout-icon,
	.logout-text {
		color: #e53935;
		font-size: 34rpx;
	}
	.logout-icon {
		margin-right: 12rpx;
	}
</style>
