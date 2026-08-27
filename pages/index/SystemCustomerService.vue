<template>
	<view class="page-mine">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		<!-- 自定义导航栏 -->
		<view class="custom-nav">
			<!-- 返回按钮 -->
			<view class="nav-back" @click="handleBack">
				<u-icon name="arrow-left" color="#222" size="36rpx"></u-icon>
			</view>
			<!-- 中间标题 -->
			<view class="nav-title">个人中心</view>
			<!-- 右侧按钮区域，可放多个按钮 -->
			<view class="nav-right font-blue  " >
				<view class="edit-btn" v-if="!editMode" @click="editMode = true">
					编辑资料
				</view>
				<view class="save-btn" v-else @click="handleSave">
					保存
				</view>
			</view>
		</view>
		
		<!-- 顶部导航栏 -->
<!-- 		<view class="top-nav">
			<view class="back-icon" @click="$navigateBack()">
				<text>←</text>
			</view>
			<view class="title">个人中心</view>
			<view class="edit-btn" v-if="!editMode" @click="editMode = true">
				编辑资料
			</view>
			<view class="save-btn" v-else @click="handleSave">
				保存
			</view>
		</view> -->
		<!-- 头像昵称区域 -->
		<view class="user-header">
			<view class="avatar-box">
				<view class="avatar">
					<text class="avatar-icon">
						<u-icon name="account" color="#155dfc" bold="true" size="70rpx"></u-icon>
					</text>
				</view>
				<view class="camera" v-show="editMode">
					<u-icon name="camera" color="#155dfc" bold="true" size="40rpx"></u-icon>
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
					<u-icon name="phone" color="#155dfc" bold="true" size="40rpx"></u-icon>
					</view>
					<view class="item-text">
						<text class="label">联系电话</text>
						<input class="phone-input" v-if="editMode" v-model="userInfo.phone"  placeholder="请输入电话" />
						<text  v-else    class="value">{{ userInfo.phone }}</text>
					
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
						
						<text class="custom-icon custom-icon-money-credit-card " style="font-size:40rpx;color:#ff6900;"></text>
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
				<text class="grid-icon">
					<text class="custom-icon custom-icon-tongzhiNotice " style="font-size:45rpx;color:#155dfc;"></text>
				</text>
				<text class="grid-text">通知</text>
			</view>
			<view class="grid-item purple">
				<text class="grid-icon">
					<u-icon name="file-text" color="#4f39f6"  size="50rpx"></u-icon>
				</text>
				<text class="grid-text">隐私</text>
			</view>
			<view class="grid-item violet">
				<text class="grid-icon">
					<u-icon name="question-circle" color="#9810fa"  size="50rpx"></u-icon>
					
				</text>
				<text class="grid-text">帮助</text>
			</view>
		</view>
		<!-- 版本、缓存、注销账户 -->
		<view class="card-block">
			<view class="menu-item">
				<text class="item-title">版本更新</text>
				<view class="item-right">
					<text class="gray-text">V 2.1.0</text>
					<text class="arrow">
						<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
					</text>
				</view>
			</view>
			<view class="divider"></view>
			<view class="menu-item" @click="handleClearCache">
				<text class="item-title">清除缓存</text>
				<view class="item-right">
					<text class="gray-text">{{cacheSizeText}}</text>
					<text class="arrow">
						<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
					</text>
				</view>
			</view>
			<view class="divider"></view>
			<view class="menu-item" @click="handleLogoutAccount">
				<text class="item-title danger">注销账户</text>
				<text class="arrow">
					<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
				</text>
			</view>
		</view>
		<!-- 自定义底部tabbar -->
		<my-tabbar :current="1"></my-tabbar>
	</view>
</template>
<script>
import myTabbar from '@/components/my‑tabbar/my‑tabbar.vue'

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
  mounted() {
    this.getCacheSize()
  },
  methods: {
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
          uni.showLoading({ title: '处理中...' })
          try {
            // 此处替换为你的后端注销接口
            // await api.user.accountCancel()
            // 模拟请求，联调时删除
            await new Promise(resolve => setTimeout(resolve, 1200))
            uni.clearStorageSync()
            uni.showToast({ title: '账号已注销', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/login' // 修改为你的真实登录页路径
              })
            }, 800)
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
	/* 状态栏高度，自动适配各手机 */
	.status-bar {
		height: var(--status-bar-height);
		width: 100%;
		background-color: #ffffff;
	}
	.custom-nav {
		height: 50px;
		background-color: #ffffff;
		border-bottom: 1px solid #ddd;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		/* margin-bottom: 20rpx; */
	}
	.nav-back {
		/* width: 70rpx; */
	}
	.nav-title {
		flex: 1;
		font-size: 34rpx;
		color: #111;
		font-weight: 700;
		text-align: center;
	}
	.nav-right {
		/* width: 70rpx; */
		/* text-align: right; */
		/* color: #2979ff; */
		/* font-size: 32rpx; */
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
	.avatar-icon {
		font-size: 80rpx;
		color: #007aff;
	}
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
.phone-input{
	width: 100%;
	box-sizing: border-box;
	/* text-align: center; */
	font-size: 30rpx;
	font-weight: bold;
	border: 2rpx solid #007aff;
	border-radius: 12rpx;
	height: 60rpx;
	line-height: 60rpx;
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
		padding: 32rpx;
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
	.value {
		font-size: 34rpx;
		font-weight: 500;
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
		color: #aaa;
		font-size: 28rpx;
		margin-right: 12rpx;
	}
	.item-title {
		font-size: 32rpx;
	}
	.danger {
		color: #f53f3f;
	}
	/*三格网格 小程序不支持gap，改用margin*/
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
