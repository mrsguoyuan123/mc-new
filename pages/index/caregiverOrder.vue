<template>
	<view class="page-content">


		<!--顶部蓝色状态卡片-->
		<view class="status-card">
			<view class="status-tag">
				<text class="custom-icon custom-icon-shield-check  margin-right-5"
					style="font-size:25rpx;color:#fff;"></text>
				<text>服务执行中</text>
			</view>
			<view class="main-title">首日上门预约成功</view>
			<view class="divider"></view>
			<view class="info-row">
				<view class="info-item">
					<text class="custom-icon custom-icon-calendar1  margin-right-5"
						style="font-size:30rpx;color:#fff;"></text>
					<text>{{caregiverOption.date}}</text>
				</view>
				<view class="info-item">
					<u-icon name="clock" color="#fff" size="30rpx"></u-icon>
					<text>{{caregiverOption.timeSlot}}</text>
				</view>
			</view>
		</view>

		<!--照护师模块标题-->
		<view class="section-title">服务照护师</view>

		<!--照护师卡片-->
		<view class="staff-card">
			<view class="staff-head">
				<image class="avatar" :src="caregiverOption.avatar" mode="aspectFill"></image>
				<view class="staff-meta">
					<view class="name-line">
						<text class="name">{{caregiverOption.name}}</text>
						<view class="level-tag">专业级</view>
					</view>
					<view class="desc">{{caregiverOption.exp}}年从业经验 · 已认证</view>
				</view>
				<u-icon name="star-fill" color="#ff8800" size="30rpx"></u-icon>
			</view>

			<view class="btn-row">

				<view class="btn-phone" @click="handleCall">
					<u-icon name="phone" color="#fff" size="40rpx"></u-icon>
					<text>电话联系</text>
				</view>
				<view class="btn-remind" @click="handleRemind">
					<u-icon name="clock" color="#ff7800" size="40rpx"></u-icon>
					<text>一键催单</text>
				</view>
			</view>
		</view>

		<!--操作按钮组：退单、售后-->
		<view class="action-row">
			<view class="btn-refund" @click="handleRefund">申请退单</view>
			<view class="btn-aftersale" @click="handleAfterSale">售后处理</view>
		</view>
		<u-tabbar :value="0" :placeholder="false" @change="name => activeTab = name" :fixed="true"
			activeColor="rgb(21, 93, 252)" inactiveColor="#d2d6dd">
			<u-tabbar-item v-for="item in tabList" :key="item.id" :text="item.text" :icon="item.icon"
				:badge="item.badge" @click="routeTo(item.route)"></u-tabbar-item>

		</u-tabbar>
		
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>

	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
		
		},
		data() {
			return {
				caregiverOption: {},
				color: "#c0c4cc",
				selectedColor: "rgb(21, 93, 252)",
				tabList: [{
					id: 1,
					text: "首页",
					icon: "home",
					badge: "",
					route: "home"
				}, {
					id: 2,
					text: "健康",
					icon: "heart",
					badge: "",
					route: "healthCenter"
				}, {
					id: 3,
					text: "消息",
					icon: "chat",
					badge: "3",
					route: "messages"
				}, {
					id: 4,
					text: "我的",
					icon: "account",
					badge: "",
					route: "profile"
				}],

			}
		},
		onLoad(options) {
			if (options.data && options.data !== "undefined") {
				try {
					const raw = decodeURIComponent(options.data)
					const obj = JSON.parse(raw)
					this.caregiverOption = obj
				} catch (e) {
					console.error('JSON解析失败', e)
				}
			}
		},
		methods: {
			routeTo(res) {
				// uni.setStorageSync('tempOrderInfo', this.caregiverOption)
				console.log(res)
				let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(this
					.caregiverOption))

				this.$safeJump(routeUrl)
			},
			handleCall() {
				// #ifdef H5
				window.location.href = `tel:${this.staff.phone}`
				// #endif
				// #ifndef H5
				wx.makePhoneCall({
					phoneNumber: this.staff.phone,
					success: (res) => {
						console.log('成功唤起拨号', res?.errMsg)
					},
					fail: (err) => {
						console.error('唤起失败', err?.errMsg)
					}
				})
				// #endif


			},
			handleRemind() {
				this.$refs.uToast.show({
					message: `已发送催单提醒，照护师将尽快与您联系`,
					type: "success",
				});
			},
			handleRefund() {
				console.log("申请退单");
				this.caregiverOption.applyforRefund = true
				let routeUrl = "/pages/index/home" + `?data=` + encodeURIComponent(JSON.stringify(this.caregiverOption))
				this.$refs.uToast.show({
					message: `退单申请已提交，照护关系已解绑`,
					type: "success",
					duration: 1500,
					complete() {
						uni.redirectTo({
							url: routeUrl,
							fail: (err) => {
								console.error('跳转失败', err) //打印失败原因
							}
						});
					},

				});

				console.log(JSON.stringify(this.caregiverOption))

			},
			handleAfterSale() {
				console.log("售后处理");
				// #ifdef H5
				window.location.href = `tel:${this.staff.phone}`
				// #endif

				// #ifndef H5
				wx.makePhoneCall({
					phoneNumber: this.staff.phone,
					success: (res) => {
						console.log('成功唤起拨号', res?.errMsg)
					},
					fail: (err) => {
						console.error('唤起失败', err?.errMsg)
					}
				})
				// #endif

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
						url: '/pages/index/home'
					})
				}
			},

		}
	}
</script>

<style scoped>
	::v-deep .u-toast__content__text {
		line-height: 1.4 !important;
	}

	.page-service-detail {
		background: #f7f8fa;
		min-height: 100vh;
		padding: 30rpx 32rpx;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.back-icon {
		width: 60rpx;
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 36rpx;
		font-weight: bold;
	}

	.placeholder {
		width: 60rpx;
	}

	/*顶部蓝色卡片*/
	.status-card {
		background: #0066ff;
		border-radius: 32rpx;
		padding: 44rpx 36rpx;
		color: #ffffff;
	}

	.status-tag {
		display: flex;
		align-items: center;
		font-size: 25rpx;
		opacity: 0.8;
	}

	.status-tag text {
		margin-left: 8rpx;
	}

	.main-title {
		font-size: 40rpx;
		font-weight: bold;
		margin-top: 16rpx;
	}

	.divider {
		border-bottom: 1rpx solid rgba(255, 255, 255, 0.25);
		margin: 24rpx 0;
	}

	.info-row {
		display: flex;
	}

	.info-row ::v-deep .info-item:first-child {
		margin-right: 60rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		font-size: 30rpx;
		font-weight: 700;
	}

	.info-item text {
		margin-left: 10rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		margin: 40rpx 0 24rpx;
	}

	/*照护师卡片*/
	.staff-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 36rpx 32rpx;
	}

	.staff-head {
		display: flex;
		align-items: flex-start;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 16rpx;
	}

	.staff-meta {
		flex: 1;
		margin-left: 24rpx;
	}

	.name-line {
		display: flex;
		align-items: center;
	}

	.name {
		font-size: 40rpx;
		font-weight: bold;
	}

	.level-tag {
		background: #e8f0ff;
		color: #0066ff;
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		margin-left: 12rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #888;
		margin-top: 10rpx;
	}

	.btn-row {
		display: flex;
		margin-top: 36rpx;
	}
	.btn-phone,.btn-refund{
		margin-right: 24rpx;
	}

	.btn-phone {
		flex: 1;
		background: #0066ff;
		color: #fff;
		border-radius: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 700;
	}

	.btn-phone text {
		margin-left: 8rpx;
	}

	.btn-remind {
		flex: 1;
		background: #fff6e8;
		color: #ff7800;
		border-radius: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		border: 1px solid #ffedd4;
	}

	.btn-remind text {
		margin-left: 8rpx;
	}

	.action-row {
		display: flex;
		margin-top: 40rpx;
	}

	.btn-refund {
		flex: 1;
		background: #ffffff;
		color: #e53935;
		border: 1px solid #eee;
		border-radius: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 25rpx;
		font-weight: 700;
		text-align: center;
	}

	.btn-aftersale {
		flex: 1;
		background: #ffffff;
		color: #666666;
		border: 1px solid #eee;
		border-radius: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 25rpx;
		font-weight: 700;
		text-align: center;
	}

	/* 状态栏高度，自动适配各手机 */
	.status-bar {
		height: var(--status-bar-height);
		width: 100%;
		background-color: #ffffff;
	}

	.custom-nav {
		/* height: 44px; */
		background-color: #ffffff;
		display: flex;
		align-items: center;
		padding: 30rpx;
	}

	.nav-back {
		width: 70rpx;
	}

	.nav-title {
		flex: 1;
		font-size: 34rpx;
		color: #111;
		font-weight: 700;
		text-align: left;
	}

	.nav-right {
		width: 70rpx;
		text-align: right;
		color: #2979ff;
		font-size: 32rpx;
	}
</style>