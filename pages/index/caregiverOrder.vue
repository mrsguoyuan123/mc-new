<template>
	<view class="page-service-detail">


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
					<text>{{orderInfo.date}}</text>
				</view>
				<view class="info-item">
					<u-icon name="clock" color="#fff" size="30rpx"></u-icon>
					<text>{{orderInfo.timeSlot}}</text>
				</view>
			</view>
		</view>

		<!--照护师模块标题-->
		<view class="section-title">服务照护师</view>

		<!--照护师卡片-->
		<view class="staff-card">
			<view class="staff-head">
				<image class="avatar" :src="staff.avatar" mode="aspectFill"></image>
				<view class="staff-meta">
					<view class="name-line">
						<text class="name">{{staff.name}}</text>
						<view class="level-tag">专业级</view>
					</view>
					<view class="desc">{{staff.exp}}年从业经验 · 已认证</view>
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
		<main-tabbar :current="1"></main-tabbar>
	</view>
</template>

<script>
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'

	export default {
		components: {
			mainTabbar
		},
		data() {
			return {
				orderInfo: {
					date: "2026‑09‑01",
					timeSlot: "下午 (14:00‑18:00)"
				},
				staff: {
					id: "cg4",
					name: "陈美琳",
					age: 35,
					exp: 6,
					phone: 13800138000,
					rating: 5.0,
					tags: ["五星好评", "细致入微", "营养指导"],
					desc: "持有高级康复护理员证及公共营养师证。专注于术后功能性恢复训练与精准营养配餐。她以极度的耐心和温柔著称，能够有效缓解患者术后焦虑，陪护过程深受中老年患者及其家属的喜爱。",
					avatar: "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=200&q=80",
					count: 86,
					busySlots: ["2026-05-13", "2026-05-14"]
				}
			}
		},
		methods:{
			handleCall() {
				// #ifdef H5
				window.location.href = `tel:${this.staff.phone}`
				// #endif

				// #ifndef H5
				uni.makePhoneCall({
					phoneNumber: this.staff.phone,
					success() {
						console.log('成功唤起拨号')
					},
					fail(err) {
						console.error('唤起失败', err)
					}
				})
				// #endif

			},
		handleRemind() {
			console.log("一键催单");
		},
		handleRefund() {
			console.log("申请退单");
			// 请求接口 然后弹出提示  跳回home页面
			let data = {
				id: '1'
			}
			let routeUrl = "/pages/index/home"  + `?data=` + encodeURIComponent(JSON.stringify(data))
			uni.navigateTo({
				url: routeUrl,
				fail: (err) => {
					console.error('跳转失败', err) //打印失败原因
				}
			})
		},
		handleAfterSale() {
			console.log("售后处理");
			// #ifdef H5
			window.location.href = `tel:${this.staff.phone}`
			// #endif
			
			// #ifndef H5
			uni.makePhoneCall({
				phoneNumber: this.staff.phone,
				success() {
					console.log('成功唤起拨号')
				},
				fail(err) {
					console.error('唤起失败', err)
				}
			})
			// #endif
		},
		handleBack() {
			uni.navigateBack({
				delta: 1
			})
		},
		routeTo(res) {
			let data = {
				id: '1'
			}
			let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(data))
			uni.navigateTo({
				url: routeUrl,
				fail: (err) => {
					console.error('跳转失败', err) //打印失败原因
				}
			})

		},
	}
	}
</script>

<style scoped>
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
		font-size: 44rpx;
		font-weight: bold;
		margin-top: 16rpx;
	}

	.divider {
		border-bottom: 1rpx solid rgba(255, 255, 255, 0.25);
		margin: 24rpx 0;
	}

	.info-row {
		display: flex;
		gap: 60rpx;
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
		gap: 24rpx;
		margin-top: 36rpx;
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
		gap: 24rpx;
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