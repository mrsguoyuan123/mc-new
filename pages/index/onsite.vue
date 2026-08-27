<template>
	<view class="page-content page-onsite">
		<view class="u-grid">
			<view class="radius-15 card-border-gray text-center ">
				<view class="font-bold font-l font-green">6</view>
				<view class="font-s font-info">已服务</view>
			</view>
			<view class="radius-15 card-border-gray text-center ">
				<view class="font-bold font-l font-purple">3</view>
				<view class="font-s font-info">待服务</view>
			</view>
			<view class="radius-15 card-border-gray text-center ">
				<view class="font-bold font-l font-red">6</view>
				<view class="font-s font-info">待接单</view>
			</view>
		</view>

		<view
			class="radius-15 card-top  card-border   u-flex space-between bg-linear-purple-dark  font-white  margin-30"
			@click="routeTo('calendar')">

			<view class="u-flex ">
				<view class="view-icon no-border">
					<text class="custom-icon custom-icon-calendar1 icon-bold"
						style="font-size:40rpx;color:white;"></text>
				</view>
				<view class="view-text">
					<view class="view-text1 font-m font-white">
						服务日历
					</view>
					<view class="view-text2">
						查看我的排班
					</view>
				</view>

			</view>
			<view class="view-icon-circle">
				<u-icon name="arrow-right" color="white" size="20rpx"></u-icon>
			</view>

		</view>
		<view class="my-subsection">
			<view v-for="(item,idx) in tabList" :key="idx" class="sub-item" :class="{active: currentIndex === idx}"
				:style="{
		      backgroundColor: currentIndex === idx ? item.activeBg : 'transparent'
		    }" @click="currentIndex = idx">
				{{item.label}}
			</view>
		</view>
		<!-- 已服务 -->
		<view class="list-wrap list-wrap-green" v-if="currentIndex == 0">
			<view v-for="(item,idx) in userList" :key="idx" class="patient-card">
				<view class="card-header" style="margin-bottom: 0;">
					<view class="card-avatar">
						<u-icon name="account" color="#00c950" size="60rpx"></u-icon>
					</view>
					<view class="header-info">
						<view class="row-name">
							<text class="name">{{item.name}}</text>
							<text class="age">{{item.age}}岁</text>
						</view>
						<view class="row-time">
							<u-icon name="clock" color="#00c950" size="32rpx"></u-icon>
							<text class="time-text font-info ">{{item.lastServiceTime}}</text>
						</view>
					</view>
					<view class="card-right">
						<text class="detail-text" @click="routeTo('patient')">查看详情</text>
					</view>
				</view>


			</view>
		</view>
		<!-- 待服务-->
		<view class="list-wrap list-wrap-purole" v-else-if="currentIndex == 1">
			<view v-for="(item,idx) in patientList" :key="idx" class="patient-card">
				<!-- 头部行：头像 + 姓名年龄时间 + 查看详情 -->
				<view class="card-header">
					<view class="card-avatar">
						<u-icon name="account" color="#9c27b0" size="60rpx"></u-icon>
					</view>
					<view class="header-info">
						<view class="row-name">
							<text class="name">{{item.name}}</text>
							<text class="age">{{item.age}}岁</text>
						</view>
						<view class="row-time">
							<u-icon name="clock" color="#9c27b0" size="32rpx"></u-icon>
							<text class="time-text">{{item.time}}</text>
						</view>
					</view>
					<view class="card-right">
						<text class="detail-text" @click="routeTo('patient')">查看详情</text>
					</view>
				</view>

				<view class="bottom-item">
					<u-icon name="phone" color="#666" size="32rpx"></u-icon>
					<text class="bottom-text">{{item.phone}}</text>
				</view>
				<view class="bottom-item" style="margin-bottom: 0;">
					<u-icon name="map" color="#666" size="32rpx"></u-icon>
					<text class="bottom-text">{{item.hospital}}</text>
				</view>
			</view>
		</view>
		<!-- 待接单 -->
		<view class="list-wrap list-wrap-orange" v-else-if="currentIndex == 2">
			<view v-for="(item,idx) in useState" :key="idx" class="patient-card">
				<!-- 头部行：头像 + 姓名年龄时间 + 查看详情 -->
				<view class="card-header">
					<view class="card-avatar">
						<u-icon name="account" color="#ff6900" size="60rpx"></u-icon>
					</view>
					<view class="header-info">
						<view class="row-name">
							<text class="name">{{item.name}}</text>
							<text class="age">{{item.age}}岁</text>
						</view>
						<view class="row-time">
							<u-icon name="clock" color="#ff6900" size="32rpx"></u-icon>
							<text class="time-text">{{item.serviceTime}}</text>
						</view>
					</view>

				</view>

				<view class="bottom-item">
					<u-icon name="phone" color="#909399" size="32rpx"></u-icon>
					<text class="bottom-text">{{item.phone}}</text>
				</view>
				<view class="bottom-item" style="margin-bottom: 0;">
					<u-icon name="map" color="#909399" size="32rpx"></u-icon>
					<text class="bottom-text">{{item.address}}</text>
				</view>

				<u-button class="width-100 margin-top-1" color="#ff6900" hairline="false" text="接单"></u-button>

			</view>
		</view>
		<custom-tabbar :current="0"></custom-tabbar>
	</view>
</template>



<script>
	import customTabbar from "@/components/custom-tabbar/custom-tabbar.vue";
	export default {
		components: {
			customTabbar
		},
		data() {
			return {
				record: {
					id: "p1",
					name: "张三",
					gender: "男",
					age: 45,
					surgeryRegion: "杭州",
					hospital: "浙一医院",
					department: "肛肠科",
					surgeryType: "痔疮手术",
					surgeon: "李医生",
					time: '2026-03-06',
					urgency: "high",
					status: "未沟通",
					servicePackage: "198术后康复手册",
					purchaseIntent: "高"
				},
				currentIndex: 0,
				tabList: [{
						label: "已服务",
						activeBg: '#00c950'
					},
					{
						label: "待服务",
						activeBg: '#ad46ff'
					},
					{
						label: "待结单",
						activeBg: '#ff6900'
					}
				],
				patientList: [{
						name: "孙患者",
						age: 45,
						time: "今日 09:00",
						phone: "138****5678",
						hospital: "杭州市第一人民医院"
					},
					{
						name: "吴老先生",
						age: 80,
						time: "今日 13:30",
						phone: "137****9988",
						hospital: "浙医二院 (解放路院区)"
					},
					{
						name: "郑女士",
						age: 35,
						time: "明日 08:30",
						phone: "136****1122",
						hospital: "浙江省人民医院"
					}
				],
				userList: [{
						name: "赵医生",
						age: 55,
						lastServiceTime: "2026-04-19 14:30"
					},
					{
						name: "钱老师",
						age: 62,
						lastServiceTime: "2026-04-18 10:00"
					},
					{
						name: "孙大爷",
						age: 74,
						lastServiceTime: "2026-04-17 15:00"
					},
					{
						name: "周女士",
						age: 48,
						lastServiceTime: "2026-04-16 09:30"
					}
				],

				useState: [{
						id: 601,
						name: "李患者",
						age: 52,
						serviceTime: "04-23 10:00",
						address: "浙江大学医学院附属第一医院",
						phone: "132****9901"
					},
					{
						id: 602,
						name: "王阿姨",
						age: 67,
						serviceTime: "04-23 14:00",
						address: "邵逸夫医院 (庆春院区)",
						phone: "132****9902"
					},
					{
						id: 603,
						name: "冯先生",
						age: 41,
						serviceTime: "04-24 09:00",
						address: "杭州市中医院",
						phone: "132****9903"
					}
				]
			}
		},
		methods: {
			sexSelect(e) {
				this.model1.userInfo.sex = e.name
				this.$refs.uForm.validateField('userInfo.sex')
			},

			routeTo(res) {

				let data = {
					title: 'hello',
					id: 1
				}
				uni.navigateTo({
					url: `../index/` + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				})




			},

		},
		onReady() {},
	};
</script>


<style scoped>
	.page-onsite .button-orange {
		border-radius: 20rpx;
		background-color: #ff6900;
		color: white;
	}

	.list-wrap-orange .card-avatar {
		background-color: #fff7ed
	}

	.list-wrap-green .time-text {
		color: #ff6900;
		/* font-size: 18rpx; */
	}

	.list-wrap-green .card-avatar {
		background-color: #f0fdf4;
	}

	.list-wrap-green .time-text {
		color: #00c950;
		/* font-size: 18rpx; */
	}

	.page-onsite .u-grid {
		border-radius: 10rpx;
		overflow: hidden;
		position: relative;
		display: grid;
		gap: 15rpx;
		grid-template-columns: repeat(3, 1fr);
	}

	.page-onsite .u-grid>view {
		padding: 30rpx;
		background: white;
		/* border: 1px solid red; */
	}

	.page-onsite .view-icon {
		background: #af4afd;
		border-radius: 20rpx;
		margin-right: 10rpx;
	}

	.my-subsection {
		display: flex;
		background: white;
		border-radius: 16rpx;
		padding: 6rpx;
	}

	.sub-item {
		flex: 1;
		text-align: center;
		height: 64rpx;
		line-height: 64rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
	}

	.sub-item.active {
		color: #ffffff;
		/* box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08); */
	}

	.list-wrap {
		margin-top: 30rpx;
	}

	.patient-card {
		background: #fff;
		border-radius: 32rpx;
		border: 2rpx solid #e9e4f8;
		padding: 32rpx;
		margin-bottom: 24rpx;
	}

	/* 头部flex：头像｜姓名时间｜查看详情 */
	.card-header {
		display: flex;
		gap: 24rpx;
		align-items: flex-start;
		margin-bottom: 32rpx;
	}

	.card-avatar {
		width: 100rpx;
		height: 100rpx;
		flex-shrink: 0;
		border-radius: 24rpx;
		background: #f8f0fc;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-info {
		flex: 1;
	}

	.row-name {
		display: flex;
		align-items: baseline;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.name {
		font-size: 40rpx;
		font-weight: bold;
		color: #111;
	}

	.age {
		font-size: 30rpx;
		color: #888;
	}

	.row-time {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.time-text {
		font-size: 30rpx;
		color: #9810fa;
	}

	.card-right {
		flex-shrink: 0;
	}

	.detail-text {
		font-size: 30rpx;
		color: #9810fa;
		font-weight: bold;
	}

	/* ---------------- */
	.bottom-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
		/* 左边距离 = 头像宽度 + gap(24rpx) */
		margin-left: 0rpx;
	}

	.bottom-text {
		font-size: 30rpx;
		color: #444;
	}
</style>