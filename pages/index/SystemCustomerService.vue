<template>
	<view class="page-mine">

		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{height:(statusBarHeight||0)+'px'}"></view>
		<!-- 自定义导航栏 -->
		<view class="custom-nav">
			<!-- 返回按钮 -->
			<view class="nav-back" @click="handleBack()">
				<u-icon name="arrow-left" color="#222" size="36rpx"></u-icon>
			</view>
			<!-- 中间标题 -->
			<view class="nav-title" :style="{marginRight: safeMenuWidth + 'px'}">个人中心</view>
			<view class="nav-right font-blue  ">
				<view class="edit-btn" v-if="!editMode" @click="editMode = true">
					编辑资料
				</view>
				<view class="save-btn" v-else @click="handleSave">
					保存
				</view>
			</view>
			<view :style="{ width: menuButton.width + 'px' }"></view>
		</view>
		<!-- 头像昵称区域 -->
		<view class="user-header">
			<view class="avatar-box">
				<view class="avatar">
					<view class="avatar-icon">
						<u-icon name="account" color="#155dfc" :bold="true" size="70rpx"></u-icon>
					</view>
				</view>
				<view class="camera" v-show="editMode">
					<u-icon name="camera" color="#155dfc" :bold="true" size="40rpx"></u-icon>
				</view>
			</view>
			<view class="nickname-box">
				<input v-if="editMode" v-model="userInfo.name" class="nickname-input" placeholder="请输入昵称" />
				<text v-else class="nickname-text">{{ userInfo.name }}</text>
			</view>
			<view class="user-tag">
				<u-tag class="margin-right-5" plain plainFill size="mini" text="服务客服"></u-tag>
				<view>CS‑9527</view>
			</view>
		</view>
		<!-- 联系电话、实名状态 -->
		<view class="card-block card-relative">
			<view class="menu-item" @click="goPhone">
				<view class="item-left">
					<view class="item-icon blue">
						<u-icon name="phone" color="#155dfc" :bold="true" size="40rpx"></u-icon>
					</view>
					<view class="item-text">
						<text class="label">联系电话</text>
						<input class="phone-input" type="number" v-if="editMode" v-model="userInfo.phone"
							placeholder="请输入电话" />
						<text v-else class="value">{{ userInfo.phone }}</text>

					</view>
				</view>
				<text class="arrow">
					<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
				</text>
			</view>
			<view class="divider"></view>
			<view class="menu-item" @click="goAuth">
				<view class="item-left">
					<view class="item-icon orange">

						<text class="custom-icon custom-icon-money-credit-card "
							style="font-size:40rpx;color:#ff6900;"></text>
					</view>
					<view class="item-text">
						<text class="label">实名状态</text>
						<text class="value">已认证</text>
					</view>
				</view>
				<text class="arrow">
					<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
				</text>
			</view>
		</view>
		<!-- 通知、隐私、帮助 方块入口 -->
		<view class="grid-row">
			<view class="grid-item blue">
				<view class="grid-icon">
					<text class="custom-icon custom-icon-tongzhiNotice " style="font-size:46rpx;color:#155dfc;"></text>
				</view>
				<text class="grid-text">通知</text>
			</view>
			<view class="grid-item purple">
				<view class="grid-icon">
					<u-icon name="file-text" color="#4f39f6" size="50rpx"></u-icon>
				</view>
				<text class="grid-text">隐私</text>
			</view>
			<view class="grid-item violet">
				<view class="grid-icon">
					<u-icon name="question-circle" color="#9810fa" size="50rpx"></u-icon>
				</view>
				<text class="grid-text">帮助</text>
			</view>
		</view>
		<!-- 版本、缓存、注销账户 -->
		<view class="card-block card-block1">
			<view class="menu-item">
				<text class="item-title">版本更新</text>
				<view class="item-right">
					<text class="gray-text">V 2.1.0</text>
					<text class="arrow">
						<u-icon class="arrow" name="arrow-right" color="#ddd" size="26rpx"></u-icon>
					</text>
				</view>
			</view>
			<view class="divider"></view>
			<view class="menu-item" @click="handleClearCache">
				<text class="item-title">清除缓存</text>
				<view class="item-right">
					<text class="gray-text">{{cacheSizeText}}</text>
					<text class="arrow">
						<u-icon class="arrow" name="arrow-right" color="#ddd" size="26rpx"></u-icon>
					</text>
				</view>
			</view>
			<view class="divider"></view>
			<view class="menu-item" @click="handleLogoutAccount">
				<text class="item-title danger">退出登录</text>
				<text class="arrow">
					<u-icon class="arrow" name="arrow-right" color="#ddd" size="26rpx"></u-icon>
				</text>
			</view>
		</view>
		<!-- 自定义底部tabbar -->
		<my-tabbar :current="1"></my-tabbar>
	</view>
</template>
<script>
	import { putAuthPasswordApi,getMeSettingsApi,putMeSettingsApi,putAccountsSecurityApi,postAuthLogoutApi } from '@/api/frontApikit.js'

	import myTabbar from '@/components/my‑tabbar/my‑tabbar.vue'
	import {
		mapState
	} from 'vuex'

	export default {
		components: {
			myTabbar
		},
		data() {
			return {
				editMode: false,
				userInfo: {
					name: '系统客服',
					phone: '13800000000'
				},
				cacheSizeText: '0 MB'
			}
		},

		computed: {
			...mapState([
				'statusBarHeight',
				'menuButton',
				'navContentHeight',
				'navBarTotalHeight'
			])
		},
		
		onLoad() {
			this.getCacheSize()
			this.getMeSettings()
		},
		methods: {
			// 退出登录
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
			},
			// 修改自己的密码（员工/患者共用）
				async putAuthPassword() {
		
				try {
				
					await putAuthPasswordApi()
				} catch (error) {
					
					
				} 
			},
			// 系统设定（骨架占位）
			async getMeSettings() {
		
				try {
				
				const setting = 	await getMeSettingsApi()
				console.log(setting)
				} catch (error) {
					
					
				} 
			},
			// 更新系统设定（骨架占位）
			async putMeSettings() {
		
				try {
				
					await putMeSettingsApi()
				} catch (error) {
					
					
				} 
			},
			// 安全选项
			async putAccountsSecurity() {
		
				try {
				
					await putAccountsSecurityApi()
				} catch (error) {
					
					
				} 
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
			// 保存编辑
			handleSave() {
				this.editMode = false
				console.log('保存', this.userInfo)
			},
			goPhone() {},
			goAuth() {},
			// 获取缓存大小
			getCacheSize() {
				try {
					const info = uni.getStorageInfoSync()
					const mb = (info.currentSize / 1024).toFixed(1)
					this.cacheSizeText = `${mb} MB`
				} catch (e) {
					this.cacheSizeText = '0 MB'
				}
			},
			// 清除缓存
			handleClearCache() {
				uni.showModal({
					title: '清除缓存',
					content: '确定清除本地缓存？登录信息不会被删除',
					success: (res) => {
						if (!res.confirm) return
						const info = uni.getStorageInfoSync()
						const keepKeys = ['token', 'userInfo']
						info.keys.forEach(key => {
							if (!keepKeys.includes(key)) {
								uni.removeStorageSync(key)
							}
						})
						// #ifdef APP-PLUS
						uni.clearImageCache()
						// #endif
						uni.showToast({
							title: '清除成功',
							icon: 'success'
						})
						this.getCacheSize()
					}
				})
			},
			// 注销账户
			handleLogoutAccount() {
				uni.showModal({
					title: '注销账户',
					content: '注销账号将清空账号所有数据，此操作不可恢复，确定继续吗？',
					confirmText: '确认注销',
					confirmColor: '#f53f3f',
					cancelText: '取消',
					success: async (res) => {
						if (!res.confirm) return
						uni.showLoading({
							title: '处理中...'
						})
						try {
							// 此处替换为你的后端注销接口
							// await api.user.accountCancel()
							// 模拟请求，联调时删除
							uni.clearStorageSync()
							uni.showToast({
								title: '账号已注销',
								icon: 'success'
							})
							uni.reLaunch({
								url: '/pages/index/login' // 修改为你的真实登录页路径
							})
						} catch (err) {
							uni.showToast({
								title: '注销失败，请稍后重试',
								icon: 'none'
							})
						} finally {
							uni.hideLoading()
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.custom-nav {
		height: 44px;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
	}

	.nav-back {
		width: 70rpx;
	}

	.nav-title {
		flex: 1;
		font-size: 34rpx;
		color: #111;
		font-weight: 500;
	}

	.nav-right {
		/* width: 70rpx; */
		text-align: right;
		color: #2979ff;
		font-size: 32rpx;
	}

	.page-mine {
		/* padding: 30rpx; */
		background-color: #f7f8fa;
		min-height: 100vh;
	}

	.title {
		font-size: 40rpx;
		font-weight: bold;
	}

	.edit-btn {
		padding: 12rpx 24rpx;
		background-color: #e8f0ff;
		color: #007aff;
		border-radius: 50rpx;
		font-size: 28rpx;
	}

	.save-btn {
		padding: 12rpx 24rpx;
		background-color: #007aff;
		color: #fff;
		border-radius: 50rpx;
		font-size: 28rpx;
	}

	/*用户头部头像昵称*/
	.user-header {
		padding-top: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* margin-bottom: 40rpx; */
		border-bottom-left-radius: 60rpx;
		border-bottom-right-radius: 60rpx;
		border: 2px solid #ddd;
		border-top: 0;
		position: relative;
		left: -2px;
		right: -2px;
		width: calc(100% + 4px);
		padding-bottom: 80rpx;
		background-color: #ffff;
	}

	.avatar-box {
		position: relative;
	}

	.avatar {
		width: 180rpx;
		height: 180rpx;
		background-color: #e1ebff;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	/* 	.avatar-icon {
		font-size: 80rpx;
		color: #007aff;
	} */

	.camera {
		position: absolute;
		right: -10rpx;
		bottom: -10rpx;
		width: 64rpx;
		height: 64rpx;
		background: #fff;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		/* box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15); */
	}

	.nickname-box {
		margin-top: 40rpx;
		width: 440rpx;
	}

	.nickname-text {
		display: block;
		text-align: center;
		font-size: 30rpx;
		font-weight: bold;
		height: 60rpx;
		line-height: 60rpx;
	}

	.nickname-input {
		width: 100%;
		box-sizing: border-box;
		text-align: center;
		font-size: 30rpx;
		font-weight: bold;
		border: 2rpx solid #007aff;
		border-radius: 12rpx;
		height: 60rpx;
		line-height: 60rpx;
		/* padding: 12rpx 20rpx; */
	}

	.phone-input {
		width: 100%;
		box-sizing: border-box;
		/* text-align: center; */
		font-size: 30rpx;
		font-weight: bold;
		border: 2rpx solid #007aff;
		border-radius: 12rpx;
		padding: 0 20rpx;
		height: 60rpx;
		line-height: 60rpx;
	}

	.value {
		font-size: 30rpx;
		font-weight: 500;
		height: 60rpx;
		line-height: 60rpx;
		/* border: 2rpx solid #007aff; */
	}

	.user-tag {
		margin-top: 16rpx;
		font-size: 28rpx;
		display: flex;
		color: #888;
	}

	.view-content {
		border-radius: 40rpx;
		border: 2px solid #ddd;
		margin: 40rpx;
	}

	/*卡片容器*/
	.card-block {
		background-color: #ffffff;
		border-radius: 28rpx;
		overflow: hidden;
		margin-bottom: 30rpx;
		margin: 0 40rpx;
		border: 1px solid #ddd;
	}

	.card-relative {
		position: relative;
		top: -50rpx;
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
	}

	.card-block1 .menu-item {
		padding: 30rpx;
	}

	.item-left {
		display: flex;
		align-items: center;
	}

	.item-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		margin-right: 24rpx;
	}

	.item-icon.blue {
		background-color: #e8f0ff;
	}

	.item-icon.orange {
		background-color: #fff3e8;
	}

	.item-text {
		display: flex;
		flex-direction: column;
	}

	.label {
		font-size: 26rpx;
		color: #888;
		margin-bottom: 8rpx;
	}

	.arrow {
		font-size: 32rpx;
		color: #bbb;
	}

	.divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 0 32rpx;
	}

	.item-right {
		display: flex;
		align-items: center;
	}

	.gray-text {
		color: #909399;
		font-size: 26rpx;
		margin-right: 12rpx;
	}

	.item-title {
		font-size: 26rpx;
	}

	.danger {
		color: #f53f3f;
	}

	.grid-row {
		display: flex;
		margin: 0 30rpx;
		margin-bottom: 30rpx;
		/* 		margin-left: -10rpx;
		margin-right: -10rpx; */
	}

	.grid-item {
		flex: 1;
		margin: 0 10rpx;
		padding: 36rpx 10rpx;
		border-radius: 28rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.grid-item.blue {
		background-color: #e8f0ff;
	}

	.grid-item.purple {
		background-color: #f0f2ff;
	}

	.grid-item.violet {
		background-color: #f8efff;
	}

	.grid-icon {
		font-size: 48rpx;
		margin-bottom: 12rpx;
	}

	.grid-text {
		font-size: 28rpx;
		font-weight: 500;
	}
</style>
<style>
	page {
		background-color: #f7f8fa;
	}
</style>