<template>
	<view class="page-content ">

		<!-- 照护师信息卡片 -->
		<view class="staff-card">
			<image class="avatar" :src="caregiverOption.avatar" mode="aspectFill"></image>
			<view class="staff-info">
				<view class="name-row">
					<text class="name">{{caregiverOption.name}}</text>
					<text class="tip-text">为您服务</text>
				</view>
				<view class="cert-row">

					<u-icon name="checkbox-mark" color="#0066ff" size="25rpx"></u-icon>
					<text class="cert-text">已通过术后康复专项技能考核</text>
				</view>
			</view>
		</view>

		<!-- 套餐列表 -->
		<view class="package-list">
			<view class="package-item" :class="{active:item.selected}" v-for="(item,idx) in packageList" :key="idx"
				@click="selectPackage(idx)">
				<view v-if="item.recommend" class="recommend-tag">超值推荐</view>
				<view class="package-header">
					<text class="period">{{item.period}}</text>
					<view class="radio-wrap">
						<view v-if="item.selected" class="radio-checked">
							<u-icon name="checkbox-mark" color="#fff" size="36rpx"></u-icon>
						</view>
						<view v-else class="radio-normal"></view>
					</view>
				</view>
				<view class="price-row">
					<text class="price">¥{{item.price}}</text>
					<text class="origin-price">¥{{item.originPrice}}</text>
				</view>
				<view class="divider-line"></view>
				<view class="feature-row">
					<view class="feature-item mr-40">
						<u-icon name="clock" color="#909399" size="26rpx"></u-icon>
						<text>{{item.desc1}}</text>
					</view>
					<view class="feature-item">
						<u-icon name="medal" color="#909399" size="26rpx"></u-icon>
						<text>{{item.desc2}}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部结算区域 -->
		<view class="bottom-panel">
			<view class="total-row">
				<text class="total-label">应付总额</text>
				<text class="total-price">¥{{currentSelect.price}}</text>
			</view>
			<button class="pay-btn" @click="routeTo('caregiverBooking')">
				<text>确认支付并预约时间</text>
			</button>
			<view class="bottom-desc">支付成功后即可预约首日上门时间</view>
		</view>
		<myTabbar :current="0"></myTabbar>

	</view>
</template>

<script>
	import myTabbar from '@/components/myTabbar.vue'

	export default {
		components: {
			myTabbar
		},
		data() {
			return {
				caregiverOption: {},

				packageList: [{
						period: '1个礼拜',
						price: 1800,
						originPrice: 2100,
						desc1: '服务时长: 7天',
						desc2: '尊享优先响应',
						recommend: false,
						selected: false
					},
					{
						period: '1个月',
						price: 6800,
						originPrice: 8000,
						desc1: '服务时长: 30天',
						desc2: '尊享优先响应',
						recommend: true,
						selected: true
					},
					{
						period: '2个月',
						price: 12800,
						originPrice: 16000,
						desc1: '服务时长: 60天',
						desc2: '尊享优先响应',
						recommend: false,
						selected: false
					}
				]
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
		computed: {
			currentSelect() {
				return this.packageList.find(item => item.selected)
			}
		},
		methods: {
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
			routeTo(res) {

				let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(this.caregiverOption))
				
				this.$safeJump(routeUrl)

			},
			selectPackage(index) {
				this.packageList.forEach((item, i) => {
					item.selected = i === index
				})
			},

		}
	}
</script>

<style scoped>
	.page-package {
	/* 	background-color: #f7f8fa;
		min-height: 100vh;
		padding: 30rpx 32rpx; */
	}

	.nav-bar {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.back {
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

	/*照护师卡片*/
	.staff-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 16rpx;
	}

	.staff-info {
		margin-left: 24rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
	}

	.name {
		font-size: 36rpx;
		font-weight: bold;
	}

	.tip-text {
		font-size: 25rpx;
		color: #909399;
		margin-left: 12rpx;
	}

	.cert-row {
		display: flex;
		align-items: center;
		margin-top: 12rpx;
	}

	.cert-text {
		font-size: 25rpx;
		color: #0066ff;
		margin-left: 8rpx;
	}

	/*套餐列表*/
	.package-list {}

	.package-item {
		position: relative;
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		border: 2rpx solid transparent;
	}

	.package-item.active {
		background: #f0f6ff;
		border-color: #0066ff;
	}

	.recommend-tag {
		position: absolute;
		top: -12rpx;
		left: 24rpx;
		background: #ff6900;
		color: #fff;
		font-size: 24rpx;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
	}

	.package-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.period {
		font-size: 36rpx;
		font-weight: bold;
	}

	.radio-normal {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 2rpx solid #ddd;
	}

	.radio-checked {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: #0066ff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		margin: 16rpx 0;
	}

	.price {
		font-size: 52rpx;
		color: #0066ff;
		font-weight: bold;
	}

	.origin-price {
		font-size: 28rpx;
		color: #909399;
		text-decoration: line-through;
		margin-left: 12rpx;
	}

	.divider-line {
		border-bottom: 1rpx dashed #dddddd;
		margin: 20rpx 0;
	}

	.feature-row {
		display: flex;
	}
	

	.feature-item {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #909399;
	}

	.feature-item text {
		margin-left: 8rpx;
	}

	/*底部结算*/
	.bottom-panel {
		margin-top: 40rpx;
		background: #ffffff;
		border-radius: 24rpx;
		padding: 36rpx 32rpx;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 32rpx;
	}

	.total-label {
		font-size: 32rpx;
		color: #909399;
	}

	.total-price {
		font-size: 64rpx;
		color: #0066ff;
		font-weight: bold;
	}

	.pay-btn {
		background: #0066ff;
		color: #fff;
		border-radius: 48rpx;
		height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
	}

	.pay-btn text {
		margin-left: 10rpx;
	}

	.bottom-desc {
		text-align: center;
		font-size: 26rpx;
		color: #909399;
		margin-top: 20rpx;
	}

	
</style>