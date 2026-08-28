<template>
	<view class=" page-records">
		<!-- 状态栏占位 -->
		<view class="status-bar"></view>
		<!-- 自定义导航栏 -->
		<view class="custom-nav">
			<!-- 返回按钮 -->
			<view class="nav-back" @click="handleBack()">
				<u-icon name="arrow-left" color="" size="36rpx"></u-icon>
			</view>
			<!-- 中间标题 -->
			<view class="nav-title">术后病历详情</view>
		</view>
		<view class="page-content1">
			<view
				class="radius-15 card-top margin-bottom-2 card-border card-border-gray  u-flex space-between border-blue bg-blue">

				<view class="u-flex flex-center align-center">
					<view class="view-icon no-border">
						<view class="short-avatar">{{ record.name.charAt(0) }}</view>
					</view>
					<view class="">
						<view class="margin-bottom-5 u-flex align-center">
							<view class="font-l font-bold margin-right-5">{{record.name}}</view>
							<u-badge style="padding: 10rpx 20rpx;" type="primary" :value="record.status"></u-badge>
						</view>
						<view class="view-text2 u-flex flex-start">
							<view>登记证号</view>
							<view> **** **** 1234</view>
						</view>
					</view>

				</view>

			</view>

			<view class="radius-15  bg-white card-border card-border-gray ">
				<view class="header-text">
					<view class="header-icon ">
						<u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
						<view class="header-name font-bold font-m">
							手术基本信息
						</view>
					</view>

				</view>
				<view>
					<view class="records-wrapper u-flex space-between">
						<view class="u-flex flex-start">
							<text class="custom-icon custom-icon-activity icon-bold margin-right-5"
								style="font-size:30rpx;color:#155DFC;"></text>
							<view class="font-s font-info">手术项目</view>
						</view>
						<view class="font-bold font-s">{{record.surgeryType}}</view>
					</view>
					<view class="records-wrapper u-flex space-between">
						<view class="u-flex flex-start">
							<u-icon name="map" color="#155DFC" :bold="true" size="30rpx"
								class="margin-right-5"></u-icon>

							<view class="font-s font-info">手术地区</view>
						</view>
						<view class="font-bold font-s">{{record.surgeryRegion}}</view>
					</view>
					<view class="records-wrapper u-flex space-between">
						<view class="u-flex flex-start">
							<text class="custom-icon custom-icon-hospital1 icon-bold margin-right-5"
								style="font-size:30rpx;color:#155DFC;"></text>
							<view class="font-s font-info">就诊医院</view>
						</view>
						<view class="font-bold font-s">{{record.hospital}}</view>
					</view>
					<view class="records-wrapper u-flex space-between">
						<view class="u-flex flex-start">
							<u-icon name="info-circle" color="#155DFC" :bold="true" size="30rpx"
								class="margin-right-5"></u-icon>
							<view class="font-s font-info">所属科室</view>
						</view>
						<view class="font-bold font-s">{{record.department}}</view>
					</view>
					<view class="records-wrapper u-flex space-between">
						<view class="u-flex flex-start">
							<text class="custom-icon custom-icon-stethoscope1 icon-bold margin-right-5"
								style="font-size:30rpx;color:#155DFC;"></text>
							<view class="font-s font-info">主刀医生</view>
						</view>
						<view class="font-bold font-s">{{record.surgeon}}</view>
					</view>
					<view class="records-wrapper u-flex space-between">
						<view class="u-flex flex-start">
							<text class="custom-icon custom-icon-calendar icon-bold margin-right-5"
								style="font-size:30rpx;color:#155DFC;"></text>
							<view class="font-s font-info">手术日期</view>
						</view>
						<view class="font-bold font-s">{{record.time}}</view>
					</view>
				</view>

			</view>


			<view class="radius-15  bg-white card-border card-border-gray ">
				<view class="header-text">
					<view class="header-icon ">

						<text class="custom-icon custom-icon-shield-check1 icon-bold margin-right-5"
							style="font-size:40rpx;color:#00a63e;"></text>
						<view class="header-name font-bold font-m">
							保障情况
						</view>
					</view>

				</view>
				<view
					class="radius-15 card-top margin-bottom-2 card-border card-border-gray  u-flex space-between border-green bg-green">

					<view class="u-flex space-between column-center width-100">


						<view class="view-text2 font-green">
							<view class="font-m font-bold margin-bottom-5">手术意外保险</view>
							<view class="font-s font-green">Surgery Protection Active</view>
						</view>
						<view class="badge badge-green-fill">已生效</view>

					</view>

				</view>
				<view class="u-flex space-between column-center width-100 margin-bottom-5">
					<view class="font-m  font-info ">保障金额</view>
					<view class="font-s font-bold ">¥10,000.00</view>


				</view>
				<view class="u-flex space-between column-center width-100">
					<view class="font-m   font-info ">保单编号</view>
					<view class="font-s font-bold ">1234565600</view>


				</view>
			</view>

			<view class="my-btn" @click="routeTo('consultation')">对此病历有疑问？立即咨询</view>
			<!-- <u-button class="width-100 margin-top-2 my-btn" shape="circle" :hairline="false" @click="routeTo('consultation')"
				text="对此病历有疑问？立即咨询"></u-button> -->
		</view>
	</view>
</template>



<script>
	export default {
		data() {
			return {
				record: {
					id: "p1",
					name: "张三",
					status: "已实名",
					gender: "男",
					age: 45,
					surgeryRegion: "杭州",
					hospital: "浙一医院",
					department: "肛肠科",
					surgeryType: "痔疮手术",
					surgeon: "李医生",
					time: '2026-03-06',
					urgency: "high",
					// status: "未沟通",
					servicePackage: "198术后康复手册",
					purchaseIntent: "高"
				},
			};
		},
		methods: {
			sexSelect(e) {
				this.model1.userInfo.sex = e.name
				this.$refs.uForm.validateField('userInfo.sex')
			},
			handleBack(e) {
				uni.navigateBack({
					delta: 1
				})
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

<style scoped lang="scss">
	.page-records {
		overflow: hidden;
		// padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
	}
	.page-content1{
		padding: 30rpx 60rpx;
	}

	.page-records .records-wrapper {
		padding: 20rpx 0;
	}

	.page-records button {
		background: black;
		color: white;
	}

	.my-btn {
		width: 100%;
		background: #000;
		color: #fff;
		text-align: center;
		line-height: 88rpx;
		border-radius: 100rpx;
		margin-top: 50rpx;
	}

	/* 状态栏高度，自动适配各手机 */
	.status-bar {
		height: var(--status-bar-height);
		width: 100%;
		/* background-color: #9c27b0; */
	}

	.custom-nav {
		height: 44px;
		/* background-color: #9c27b0; */
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
	}

	.nav-right {
		width: 70rpx;
		text-align: right;

	}

	.short-avatar {
		width: 100rpx;
		height: 100rpx;
		background: #fff;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		color: #447dfd;
		margin-right: 24rpx;
		font-weight: bold;

	}
</style>