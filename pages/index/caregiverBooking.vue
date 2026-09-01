<template>
	<view class="page-booking-time">


		<view class="page-content">
			<!--支付成功提示卡片-->
			<view class="success-card bg-green border-green radius-15">
				<view class="icon-wrap">
					<text class="custom-icon custom-icon-shield-check " style="font-size:45rpx;color:#fff;"></text>
				</view>
				<view class="success-title">支付成功</view>
				<view class="success-desc">请选择您的首日上门时间</view>
			</view>

			<!--时间选择卡片-->
			<view class="time-card">
				<view class="card-title">
					<u-icon name="clock" color="#111" :bold="true" size="30rpx"></u-icon>
					<text>首日上门时间</text>
				</view>

				<!--日期横向选择-->
				<scroll-view scroll-x class="date-scroll">
					<view class="date-list">
						<view class="date-item" :class="{active: idx === selectDateIndex}" v-for="(d, idx) in dateList"
							:key="idx" @click="selectDateIndex = idx">
							<text class="week">{{d.week}}</text>
							<text class="day">{{d.day}}</text>
						</view>
					</view>
				</scroll-view>

				<view class="label-text">选择时段</view>
				<!--时段选择-->
				<view class="time-slot-wrap">
					<view class="slot-item" :class="{active: slotIndex === idx}" v-for="(slot, idx) in slotList"
						:key="idx" @click="slotIndex = idx">
						{{slot.text}}
					</view>
				</view>

				<!--提示说明文字-->
				<view class="tip-row">
					<u-icon name="clock" color="#909399" size="26rpx"></u-icon>
					<text class="tip-text">预约上门时间仅作为照护师首日介入的参考，后续服务时间将根据康复计划由照护师与您协商确定。</text>
				</view>
			</view>

			<!--底部按钮-->
			<view class="bottom-btn-wrap">
				<button class="submit-btn" @click="onComplete()">完成预约</button>
			</view>
		</view>
		<main-tabbar :current="0"></main-tabbar>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>
<script>
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'
	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
			mainTabbar
		},
		data() {
			return {
				caregiverName: 'xxx',
				selectDateIndex: null,
				slotIndex: null,
				caregiverOption: {},
				dateList: [],
				slotList: [{
						text: "上午 09:00‑12:00"
					},
					{
						text: "下午 14:00‑18:00"
					}
				]
			};
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
		created() {
			this.getNext7DaysFromTomorrow();
		},
		methods: {
			getNext7DaysFromTomorrow() {
				const weekText = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
				const list = [];
				const now = new Date();
				const tomorrow = new Date(now);
				tomorrow.setDate(now.getDate() + 1);
				for (let i = 0; i < 7; i++) {
					const d = new Date(tomorrow);
					d.setDate(tomorrow.getDate() + i);
					const m = d.getMonth() + 1;
					const day = d.getDate();
					const week = weekText[d.getDay()];
					list.push({
						week,
						day: `${m}/${day}`
					})
				}
				this.dateList = list
			},
			onComplete() {
				if (this.selectDateIndex === null) {
					this.$refs.uToast.show({
						message: `请选择日期`,
						type: "error",
					});
					return
				}
				if (this.slotIndex === null) {
					this.$refs.uToast.show({
						message: `请选择时段`,
						type: "error",
					});
					return
				}
				this.caregiverOption.date = this.dateList[this.selectDateIndex].day
				this.caregiverOption.timeSlot = this.slotList[this.slotIndex].text
				console.log(this.caregiverOption)
				let routeUrl = "/pages/index/caregiverOrder" + `?data=` + encodeURIComponent(JSON.stringify(this
					.caregiverOption))

				this.$refs.uToast.show({
					message: `已选定：${this.caregiverOption.name},预约上门：${this.caregiverOption.date} ${this.caregiverOption.timeSlot}成功`,
					type: "success",
					duration: 1500,
					complete: () => {
					this.$safeJump(routeUrl)
					}
				})
			},

		}
	};
</script>

<style scoped>
	::v-deep .u-toast__content__text {
		line-height: 1.4 !important;
	}

	/*成功卡片*/
	.success-card {
		/* 	background-color: #ecfcf0;
		border-radius: 24rpx; */
		padding: 48rpx 32rpx;
		text-align: center;
		border: 1rpx solid #c8f2d4;
		margin-bottom: 32rpx;
	}

	.icon-wrap {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background-color: #08b852;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24rpx;
	}

	.success-title {
		font-size: 35rpx;
		font-weight: bold;
		color: #087d38;
	}

	.success-desc {
		font-size: 25rpx;
		color: #089944;
		margin-top: 12rpx;
	}

	.time-card {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
	}

	.card-title {
		display: flex;
		align-items: center;
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 32rpx;
		color: #111;
	}

	.card-title text {
		margin-left: 10rpx;
	}

	/*横向日期选择*/
	.date-scroll {
		width: 100%;
	}

	.date-list {
		display: flex;
		gap: 20rpx;
	}

	.date-item {
		min-width: 160rpx;
		padding: 24rpx 12rpx;
		border-radius: 20rpx;
		background: #f7f8fa;
		text-align: center;
	}

	.date-item.active {
		background-color: #0066ff;
	}

	.date-item.active text {
		color: #fff;
	}

	.week {
		display: block;
		font-size: 25rpx;
		color: #666;
	}

	.day {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		margin-top: 8rpx;
	}

	.label-text {
		font-size: 30rpx;
		color: #666;
		margin: 36rpx 0 24rpx;
	}

	.time-slot-wrap {
		display: flex;
		gap: 24rpx;
	}

	.slot-item {
		flex: 1;
		background: #f7f8fa;
		text-align: center;
		padding: 28rpx 10rpx;
		border-radius: 20rpx;
		font-size: 30rpx;
		font-weight: bold;
		color: #909399;
	}

	.slot-item.active {
		background: #eff6ff;
		color: #155dfc;
		border: 1px solid #155dfc;
	}

	.tip-row {
		margin-top: 40rpx;
		display: flex;
		align-items: start;
	}

	.tip-text {
		flex: 1;
		margin-left: 10rpx;
		font-size: 26rpx;
		color: #909399;
		line-height: 1.6;
	}

	.bottom-btn-wrap {
		margin-top: 60rpx;
	}

	.submit-btn {
		width: 100%;
		background: #0066ff;
		color: #fff;
		border-radius: 48rpx;
		height: 96rpx;
		font-size: 34rpx;
		font-weight: 700;
	}
</style>