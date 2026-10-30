<template>
	<view class="page-my">
		 <!-- 顶部渐变区域 -->
    <view class="top-wrap">
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
        <view class="user-right">
          <view class="name-row">
            <text class="username">{{ userInfo.username }}</text>
           
          </view>
          <!-- <view class="meta">{{ userInfo.city }} | {{ userInfo.age }}岁 | {{ userInfo.height }}</view> -->
          
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

		<!-- 功能菜单卡片 -->
		<view class="menu-card">
			<view class="menu-item"  v-for="(item,key) in routeList"  @click="routeTo(item.routeTo)">
				<u-icon :name="item.icon" color="#909399" size="45rpx"></u-icon>
				<text class="menu-label">{{ item.name }}</text>
				<u-icon class="arrow" name="arrow-right" color="#ddd" size="32rpx"></u-icon>
			</view>
			
		</view>
		<!-- 退出登录按钮 -->
		<view class="logout-btn">
			<u-button  :hairline="false" @click="logOut()"  text="退出登录"></u-button>
		</view>
		<myTabbar :current="2"></myTabbar>
	</view>
</template>
<script>
	import myTabbar from "@/components/myTabbar.vue";
	import { postAuthLogoutApi,getEscortProfileStatsApi } from '@/api/frontApikit.js'
	export default {
		components: {
			myTabbar
		},
		data() {
			
			return {
				logoutLoading: false,
						userInfo:{} ,
      stat: {
        monthCount: 0,
        rating: 0,
        totalCount: 0,
        
      },
	  routeList:[
		{
			name:'我的排班',
			routeTo:'',
			icon:'calendar'
		},
		{
			name:'服务记录',
			routeTo:'',
			icon:'file-text'
		},
		{
			name:'消息通知',
			routeTo:'',
			icon:'bell'
		},
		{
			name:'账号设置',
			routeTo:'',
			icon:'setting'
		},
		{
			name:'帮助中心',
			routeTo:'',
			icon:'question-circle'
		},
	  ]
			}
		},
		onLoad() {
			this.userInfo = this.readCurrentUser()
			this.loadData()
		},
		methods: {
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
      const res = await getEscortProfileStatsApi()
	  console.log(res)
        this.stat = res

      if (res.code === 200) {
        this.userInfo = res.data.userInfo
      }
    },
			routeTo(res) {
				let data = {
					title: 'hello',
					id: 1
				}

				let routeUrl = `../index/` + res + `?data=` + encodeURIComponent(JSON.stringify(data))
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
		background-color: #f9fafb;
		padding-bottom: calc(120rpx + var(--safe-area-inset-bottom));
		max-width: 500px;
		margin: 0 auto;
	}

	/* 紫色头部 */
	.header {
		padding: 80rpx 40rpx 60rpx;
		display: flex;
		align-items: center;
		border-bottom-left-radius: 60rpx;
		border-bottom-right-radius: 60rpx;
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
		/* color: #fff; */
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
		/* margin: -30rpx 30rpx 40rpx; */
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		margin: 30rpx;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 28rpx 32rpx;
		color:#909399;
	
	}


	.menu-icon {
		font-size: 44rpx;
		width: 70rpx;
		margin-right: 24rpx;
	}

	.menu-label {
		flex: 1;
		font-size: 28rpx;
		margin-left: 5px;
		line-height: 45rpx;
	}

	/* 退出登录 */
	.logout-btn {
		padding: 0 30rpx;
	}

	.logout-icon,
	.logout-text {
		/* color: #e53935; */
		font-size: 34rpx;
	}

	.logout-icon {
		margin-right: 12rpx;
	}
	.top-wrap {
  background: linear-gradient(180deg, #fff1dd, #ffffff);
  padding: 40rpx 30rpx 20rpx;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}
.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  margin-right: 24rpx;
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
}
.stat-item {
  text-align: center;
  flex: 1;
}
.stat-item .num {
  font-size: 44rpx;
  font-weight: bold;
}
.stat-item .label {
  font-size: 26rpx;
  color: #666;
  margin-top: 6rpx;
}
</style>
