<template>
	<view class="container">
		<!--顶部提交成功提示-->
		<view v-if="showSubmitTip" class="tip-box">
			<u-icon name="checkmark-circle" color="#27ae60" size="36rpx"></u-icon>
			<text class="tip-text">陪诊记录已提交</text>
			<view class="close-tip" @click="showSubmitTip=false">✕</view>
		</view>

		<!--患者信息卡片-->
		<view class="patient-card">
			<view class="card-header">
				<view class="avatar">
					<u-icon name="account" color="#9c27b0" size="60rpx"></u-icon>
				</view>
				<view class="header-info">
					<view class="row-name">
						<text class="name">{{user.name}}</text>
						<text class="age">{{user.age}}岁</text>
					</view>
					<view class="row-status">
						<text class="status-text">{{user.status}}</text>
					</view>
				</view>
			</view>
			<view class="info-item">
				<u-icon name="phone" color="#9333ea" size="32rpx"></u-icon>
				<text class="info-val">{{user.phone}}</text>
			</view>
			<view class="info-item addr-row">
				<view class="addr-left">
					<u-icon name="map" size="32rpx" color="#666"></u-icon>
					<text class="info-val">{{user.hospital}}</text>
				</view>
				<view class="nav-btn" @click="goNav">
					<text class="custom-icon custom-icon-navigation icon-bold"
						style="font-size:28rpx;color:#9333ea;"></text>
					<text>导航</text>
				</view>
			</view>
		</view>

		<!--陪诊任务卡片-->
		<view class="task-card">
			<view class="card-title">陪诊任务</view>
			<view class="timeline">
				<!--任务1：到院签到-->
				<view class="timeline-item">
					<view class="dot" :class="getDotClass(1)"></view>
					<view class="timeline-body">
						<view class="task-title" :class="getTitleClass(1)">任务 1: 到院签到</view>
						<view v-if="task1Done" class="done-row">
							<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
							<text class="done-text">已完成</text>
						</view>
						<view class="btn-group" v-if="currentTask === 1&& !task1Done">
							<view>
								<view v-if="locDone"
									class="done-row border-green bg-green radius-15 padding-1 border-2">
									<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
									<text class="done-text font-bold text-center">定位打卡已完成</text>
								</view>
								<button v-else class="purple-btn radius-15" @click="locationCheck">
									<u-icon name="map" size="36rpx" color="#fff"></u-icon>
									<text>定位打卡</text>
								</button>
							</view>
							<view>
								<view v-if="photoDone"
									class="done-row border-green bg-green radius-15 padding-1 border-2">
									<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
									<text class="done-text font-bold text-center">拍照打卡已完成</text>
								</view>
								<button v-else class="purple-btn  radius-15" @click="photoCheck">
									<u-icon name="camera" size="36rpx" color="#fff"></u-icon>
									<text>拍照打卡</text>
								</button>
							</view>

							<button v-if="task1AllDone" class=" purple-btn  radius-15" @click="goTask2">下一步</button>
						</view>

					</view>
				</view>

				<!--任务2：诊疗进展记录-->
				<view class="timeline-item">
					<view class="dot" :class="getDotClass(2)"></view>
					<view class="timeline-body">
						<view class="task-title" :class="getTitleClass(2)">任务 2: 诊疗进展记录</view>
						<view v-if="task2Done" class="done-row">
							<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
							<text class="done-text">已完成</text>
						</view>
						<view v-if="currentTask===2 && !task2Done" class="task-form">
							<view class="form-label">当前进展描述</view>
							<textarea class="textarea" v-model="submitForm.progressDesc" placeholder=""></textarea>
							<view class="form-label">异常反馈</view>
					
							<picker mode="selector" :value="submitForm.abnormalIdx" :range="abnormalList"
								@change="onAbnormalChange">
								<view class="picker-box">{{abnormalList[submitForm.abnormalIdx]}}</view>
							</picker>
							<button :disabled="!btnDisabled1"  class="purple-btn  radius-15 margin-top-10" @click="submitTask2">下一步</button>
						</view>
					</view>
				</view>

				<!--任务3：最终陪诊反馈-->
				<view class="timeline-item">
					<view class="dot" :class="getDotClass(3)"></view>
					<view class="timeline-body">
						<view class="task-title" :class="getTitleClass(3)">任务 3: 最终陪诊反馈</view>
						<view v-if="task3Done" class="done-row">
							<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
							<text class="done-text">已完成</text>
						</view>
						<view v-if="currentTask===3 && !task3Done" class="task-form">
							<view class="form-label">陪诊总结</view>
							<textarea class="textarea" v-model="submitForm.summaryText" placeholder="请对本次陪诊服务进行总结..."></textarea>
							<view class="form-label">服务是否达成</view>
							<view class="radio-group">
								<view class="radio-item radius-15" :class="{active:submitForm.serviceResult===1}"
									@click="submitForm.serviceResult=1">
									已达成</view>
								<view class="radio-item radius-15" :class="{active:submitForm.serviceResult===0}"
									@click="submitForm.serviceResult=0">
									未达成</view>
							</view>
							<button  :disabled="!btnDisabled2"   class="submit-btn  radius-15 margin-top-10" @click="submitAllRecord">提交陪诊记录</button>
						</view>
					</view>
				</view>
			</view>
		</view>

		<custom-tabbar :current="1"></custom-tabbar>
	</view>
</template>

<script>
	import customTabbar from "@/components/custom-tabbar/custom-tabbar.vue";
	// import { AMapWX } from "@/static/amap‑wx.130.js"

	export default {
		components: {
			customTabbar
		},
		// onReady() {
		//   // 动态require，不要写在顶部import，解决vite找不到模块
		//   const AMapWX = require("@/static/amap‑wx.130.js").AMapWX;
		//   this.amap = new AMapWX({
		//     key: "73bfdddf9bc61ffba8add1e4afdb1247"
		//   });
		// },
		data() {
			return {
				
				showSubmitTip: false,
				user: {
					name: "孙患者",
					age: 45,
					status: "陪诊进行中",
					phone: "138****5678",
					hospital: "杭州市第一人民医院"
				},
				address: "杭州市西湖区西湖景区",
				destLat: "", //目的地纬度 latitude
				destLng: "", //目的地经度 longitude
				locDone: false, //是否完成定位打卡
				photoDone: false, //是否完成拍照打卡
				currentTask: 1,
				task1Done: false,
				task2Done: false,
				submitForm:{
					progressDesc: "",
					abnormalIdx: '',
					summaryText: "",
					serviceResult: '',
				},
				
			
				abnormalList: ["突发状况", "排队过久", "其他"],
				task3Done: false,
			
				task1Finished: false,

			}
		},
		computed: {
			task1AllDone() {
				return this.locDone && this.photoDone
			},
			btnDisabled1(){
				// console.log(this.submitForm.progressDesc!= '',this.submitForm.abnormalIdx!== '')
				return this.submitForm.progressDesc!== '' && this.submitForm.abnormalIdx!== ''
			},
			btnDisabled2(){
				return this.submitForm.summaryText!== '' && this.submitForm.serviceResult!== ''
			},
		},
		methods: {
			// 导航
			goNav() {
				
				uni.openLocation({
					latitude: 30.2741,
					longitude: 120.1550,
					name: "杭州市第一人民医院",
					address: "杭州市第一人民医院",
					fail: () => {
						uni.showToast({
							title: "打开地图失败",
							icon: "none"
						})
					}
				})
			},
			// 定位打卡
			locationCheck() {
				uni.chooseLocation({
					success: (res) => {
						console.log('选点结果', res)
						uni.showModal({
							title: "定位打卡成功",
							content: `地址：${res.name}\n经纬度：${res.latitude},${res.longitude}`,
							showCancel: false,
							success: () => {
								this.task1Finished = true;
								this.locDone = true;
							}
						})
					},
					fail: (err) => {
						console.error(err)
						if (err.errMsg.includes("auth")) {
							uni.showModal({
								title: "需要位置权限",
								content: "请开启位置权限才能定位打卡",
								confirmText: "去设置",
								success: (res) => {
									if (res.confirm) uni.openSetting()
								}
							})
						} else if (err.errMsg.includes('cancel')) {
							uni.showToast({
								title: "已取消定位打卡",
								icon: "none"
							})
						} else {
							uni.showToast({
								title: "打开地图失败",
								icon: "none"
							})
						}
					}
				})
			},
			// 拍照打卡
			photoCheck() {
				this.task1Finished = true;
				this.photoDone = true
				// uni.chooseMedia({
				// 	count: 1,
				// 	mediaType: ['image'],
				// 	sourceType: ['camera'],
				// 	success: (res) => {
				// 		const tempPath = res.tempFiles[0].tempFilePath
				// 		console.log("拍照路径", tempPath)
				// 		// this.photoDone = true;
				// 		uni.showModal({
				// 			title: "拍照打卡成功",
				// 			content: "拍照签到完成",
				// 			showCancel: false,
				// 			success: () => {
				// 				this.task1Finished = true;
				// 				this.photoDone = true

				// 			}
				// 		})
				// 	}
				// })
			},



			//获取圆点样式
			getDotClass(taskNo) {
				if (taskNo === 1 && this.task1AllDone) return "dot-finish";
				if (taskNo === 2 && this.task2Done) return "dot-finish";
				if (taskNo === 3 && this.task3Done) return "dot-finish";

				if (this.currentTask === taskNo) return "dot-active";
				return "dot-wait";
			},
			getTitleClass(taskNo) {
				if (taskNo === 1 && this.task1AllDone) return "text-gray";
				if (taskNo === 2 && this.task2Done) return "text-gray";
				if (taskNo === 3 && this.task3Done) return "text-gray";
				if (this.currentTask > taskNo) return "text-gray";
				return "";
			},
			// 进入第二步
			goTask2() {
				this.currentTask = 2;
				this.task1Done = true
			},
			onAbnormalChange(e) {
				this.submitForm.abnormalIdx = Number(e.detail.value)
			},
			submitTask2() {
				if (!this.submitForm.progressDesc.trim()) {
					uni.showToast({
						title: "请填写就诊进展",
						icon: "none"
					})
					return
				}
				this.task2Done = true
				this.currentTask = 3
			},
			submitAllRecord() {
				if (!this.submitForm.summaryText.trim()) {
					uni.showToast({
						title: "请填写陪诊总结",
						icon: "none"
					})
					return
				}
				this.task3Done = true
				this.showSubmitTip = true;
				console.log(this.submitForm)
				setTimeout(() => {
					this.showSubmitTip = false
				}, 3000)
			},
			/**
			 * 1、地址转经纬度 高德http地理编码
			 */
			async getGeoByAddress(address) {
				const AMAP_SERVER_KEY = 'e205ec9278f20ba483a3d7b01ebddd43'
				return new Promise((resolve, reject) => {
					uni.request({
						url: "https://restapi.amap.com/v3/geocode/geo",
						method: "GET",
						data: {
							address: address,
							key: AMAP_SERVER_KEY
						},
						success: (res) => {
							const data = res.data;
							if (data.status === "1" && data.geocodes.length > 0) {
								const item = data.geocodes[0];
								const [lng, lat] = item.location.split(",");
								resolve({
									longitude: Number(lng),
									latitude: Number(lat),
									formattedAddress: item.formatted_address
								})
							} else {
								reject("地址解析失败")
							}
						},
						fail: (err) => {
							reject(err)
						}
					})
				})
			},
			
			/**
			 * 2、唤起高德导航App 【App端】
			 * mode: 0驾车，1公交，2步行，3骑行
			 */
			openAmapNav(lat, lng, destName) {
				// 高德Uri协议文档：https://lbs.amap.com/api/amap-mobile/guide/android/navigation
				const url = `amapuri://route/plan/?dlat=${lat}&dlon=${lng}&dname=${encodeURIComponent(destName)}&dev=0&t=0`
				plus.runtime.openURL(url, (err) => {
					// 如果没有安装高德App，打开网页版导航
					uni.showModal({
						title: "提示",
						content: "未检测到高德地图App，是否打开网页导航？",
						success: (res) => {
							if (res.confirm) {
								const webUrl =
									`https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(destName)}&mode=car`
								plus.runtime.openURL(webUrl)
							}
						}
					})
				})
			},
			
			async goNav() {
				try {
					uni.showLoading({
						title: "解析地址中..."
					})
					const geo = await this.getGeoByAddress(this.address);
					console.log("得到经纬度：", geo)
					this.destLat = geo.latitude;
					this.destLng = geo.longitude;
					uni.hideLoading();
					this.openAmapNav(geo.latitude, geo.longitude, geo.formattedAddress)
				} catch (e) {
					uni.hideLoading();
					uni.showToast({
						title: e || "解析地址失败",
						icon: "none"
					})
				}
			}
					

		}
	}
</script>

<style scoped>
	page {
		background: #f4f6fa;
	}

	.container {
		padding: 30rpx;
	}

	.tip-box {
		display: flex;
		align-items: center;
		background: #e8f9ee;
		padding: 24rpx 30rpx;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		border: 1rpx solid #b2e8c4;
	}

	.tip-text {
		font-size: 30rpx;
		color: #208943;
		margin-left: 12rpx;
		flex: 1;
	}

	.close-tip {
		font-size: 32rpx;
		color: #666;
		padding: 0 10rpx;
	}

	.patient-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
	}

	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.avatar {
		width: 110rpx;
		height: 110rpx;
		background: #f3e8fc;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}

	.row-name {
		display: flex;
		align-items: center;
	}

	.name {
		font-size: 36rpx;
		font-weight: bold;
		color: #111;
	}

	.age {
		font-size: 32rpx;
		color: #444;
		margin-left: 12rpx;
	}

	.status-text {
		font-size: 28rpx;
		color: #888;
		margin-top: 8rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		margin: 20rpx 0;
		font-size: 32rpx;
	}

	.info-val {
		margin-left: 14rpx;
		color: #333;
	}

	.addr-row {
		justify-content: space-between;
	}

	.addr-left {
		display: flex;
		align-items: center;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		color: #9333ea;
		font-size: 30rpx;
		gap: 8rpx;
	}

	.task-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
	}

	.card-title {
		font-size: 38rpx;
		font-weight: bold;
		color: #111;
		margin-bottom: 40rpx;
	}

	.timeline-item {
		display: flex;
		margin-bottom: 48rpx;
		position: relative;
	}

	.dot {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		flex-shrink: 0;
		margin-right: 26rpx;
		margin-top: 6rpx;
	}

	.dot-finish {
		background: #27ae60;
	}

	.dot-active {
		background: #9333ea;
	}

	.dot-wait {
		background: #ffffff;
		border: 2rpx #cccccc solid;
	}

	/*未开始：空心灰色圆圈*/

	.timeline-item:not(:last-child)::before {
		content: "";
		position: absolute;
		left: 17rpx;
		top: 42rpx;
		width: 2rpx;
		height: calc(100% + 12rpx);
		background: #ddd;
	}

	.timeline-body {
		flex: 1;
	}

	.task-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #111;
		margin-bottom: 16rpx;
	}

	.text-gray {
		color: #999;
	}

	.done-row {
		display: flex;
		align-items: center;
	}

	.done-text {
		color: #27ae60;
		font-size: 30rpx;
		margin-left: 10rpx;
	}

	.btn-group {
		display: flex;
		gap: 20rpx;
		flex-wrap: wrap;
	}

	.action-btn {
		background: #9333ea;
		color: #fff;
		border-radius: 16rpx;
		padding: 16rpx 32rpx;
		font-size: 30rpx;
		border: none;
	}



	.form-label {
		font-size: 30rpx;
		color: #333;
		margin: 24rpx 0 12rpx;
	}

	.textarea {
		width: 100%;
		min-height: 160rpx;
		background: #f7f8fa;
		border-radius: 20rpx;
		padding: 24rpx;
		font-size: 30rpx;
		box-sizing: border-box;
	}

	.picker-box {
		background: #f7f8fa;
		border-radius: 20rpx;
		padding:0 24rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
		border: 2rpx solid #ddd;
	}

	.radio-group {
		display: flex;
		gap: 24rpx;
		margin: 20rpx 0;
	}

	.radio-item {
		flex: 1;
		text-align: center;
		padding: 18rpx 0;
		border: 2rpx solid #ddd;
		font-size: 32rpx;
	}

	.radio-item.active {
		background: #27ae60;
		color: #fff;
		border-color: #27ae60;
	}

	.submit-btn {
		width: 100%;
		background: #27ae60;
		color: #fff;
		/* border-radius: 20rpx; */
		/* padding: 22rpx 0; */
		font-size: 34rpx;
		border: none;
		/* margin-top: 20rpx; */
	}

	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		display: flex;
		padding: 16rpx 0;
		border-top: 1rpx #eee solid;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		font-size: 24rpx;
		color: #999;
	}

	.tab-active {
		color: #9333ea;
	}

	.btn-group {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.purple-btn {
		background: #9333ea;
		color: #fff;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		border: none;
	}

	.purple-btn .u-icon {
		margin-right: 5px;
	}
</style>