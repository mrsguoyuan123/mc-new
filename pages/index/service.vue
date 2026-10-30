<template>
	<view class="page-content">
		<!-- 改动位置：新增页面加载态 -->
		<view v-if="pageLoading" class="state-box">
			<u-loading-icon mode="circle" color="#2563ff" size="48rpx"></u-loading-icon>
			<text class="state-text">正在加载陪诊任务...</text>
		</view>

		<!-- 改动位置：新增空状态/异常状态 -->
		<view v-else-if="!hasOrder" class="state-box">
			<u-icon name="order" color="#c0c4cc" size="72rpx"></u-icon>
			<text class="state-title">{{ pageError || '暂无可执行的陪诊服务' }}</text>
			<text class="state-desc">请在陪诊首页确认订单状态后重试</text>
			<button class="state-btn" @click="retryLoad">刷新重试</button>
		</view>

		<template v-else>
		<!-- 改动位置：待开始订单增加开始服务入口 -->
		<view v-if="orderStatus === 'CONFIRMED'" class="start-banner">
			<view class="start-info">
				<text class="start-title">患者已确认，等待开始服务</text>
				<text class="start-desc">开始后可进行到院签到和服务记录</text>
			</view>
			<button class="start-btn" :disabled="actionLoading" @click="startService">开始服务</button>
		</view>

		<view v-if="orderStatus === 'WAIT_ACCEPT' || orderStatus === 'CANCELLED'" class="state-box inline-state">
			<text class="state-title">{{ orderStatus === 'CANCELLED' ? '该服务已取消' : '该订单尚未接单' }}</text>
			<text class="state-desc">请返回陪诊首页处理订单</text>
		</view>

		<!--患者信息卡片-->
		<view v-if="canService" class="patient-card card-border-gray">
			<view class="card-header">
				<view class="avatar">
					<u-icon name="account" color="#9c27b0" size="60rpx"></u-icon>
				</view>
				<view class="header-info">
					<view class="row-name">
						<text class="name">{{user.name}}</text>
						<text class="age">{{user.age === '--' ? '年龄未填' : user.age + '岁'}}</text>
					</view>
					<view class="row-status">
						<text class="status-text">{{user.status}}</text>
					</view>
				</view>
			</view>
			<view class="info-item">
				<u-icon name="phone" color="#2563ff" size="32rpx"></u-icon>
				<text class="info-val">{{user.phone}}</text>
			</view>
			<view class="info-item" v-if="user.serviceTime">
				<u-icon name="clock" color="#2563ff" size="32rpx"></u-icon>
				<text class="info-val">{{user.serviceTime}}</text>
			</view>
			<view class="info-item addr-row">
				<view class="addr-left">
					<u-icon name="map" size="32rpx" color="#666"></u-icon>
					<text class="info-val">{{user.hospital}}</text>
				</view>
				<view class="nav-btn" @click="goNav">
					<text class="custom-icon custom-icon-navigation icon-bold mr-10"
						style="font-size:28rpx;color:#2563ff;"></text>
					<text>导航</text>
				</view>
			</view>
		</view>

		<!--陪诊任务卡片-->
		<view v-if="canService" class="task-card card-border-gray">
			<view class="card-title">陪诊任务</view>
			<view class="timeline">
				<!--任务1：到院签到-->
				<view class="timeline-item timeline-line">
					<view class="dot" :class="getDotClass(1)"></view>
					<view class="timeline-body">
						<view class="task-title" :class="getTitleClass(1)">任务 1: 到院签到</view>
						<view v-if="task1Done" class="done-row">
							<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
							<text class="done-text">已完成</text>
						</view>
						<view class="btn-group" v-if="currentTask === 1 && !task1Done && orderStatus === 'IN_SERVICE'">
							<view class="margin-bottom-1">
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
									<text>{{checkinData.photos.length ? '继续拍照' : '拍照打卡'}}</text>
								</button>
							</view>
							<scroll-view v-if="checkinData.photos.length" scroll-x class="photo-scroll">
								<view class="photo-list">
									<image v-for="(photo, index) in checkinData.photos" :key="index" class="photo-thumb"
										:src="photo" mode="aspectFill"></image>
								</view>
							</scroll-view>

							<button v-if="task1AllDone" class=" purple-btn  radius-15 margin-top-10" :disabled="actionLoading" @click="goTask2">提交到院签到</button>
						</view>

					</view>
				</view>

				<!--任务2：诊疗进展记录-->
				<view class="timeline-item timeline-line">
					<view class="dot" :class="getDotClass(2)"></view>
					<view class="timeline-body">
						<view class="task-title" :class="getTitleClass(2)">任务 2: 诊疗进展记录</view>
						<view v-if="task2Done" class="done-row">
							<u-icon name="checkmark-circle" color="#27ae60" size="34rpx"></u-icon>
							<text class="done-text">已完成</text>
						</view>
						<view v-if="currentTask===2 && !task2Done && orderStatus === 'IN_SERVICE'" class="task-form">
							<view class="form-label">当前进展描述</view>
							<textarea class="textarea" v-model="submitForm.progressDesc" placeholder=""></textarea>
							<view class="form-label">异常反馈</view>

							<picker mode="selector" :value="submitForm.abnormalIdx" :range="abnormalList"
								@change="onAbnormalChange">
								<view class="picker-box">{{abnormalList[submitForm.abnormalIdx]}}</view>
							</picker>
							<button :disabled="!btnDisabled1" class="purple-btn  radius-15 margin-top-10"
								:loading="actionLoading" @click="submitTask2">下一步</button>
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
						<view v-if="currentTask===3 && !task3Done && orderStatus === 'IN_SERVICE'" class="task-form">
							<view class="form-label">陪诊总结</view>
							<textarea class="textarea" v-model="submitForm.summaryText"
								placeholder="请对本次陪诊服务进行总结..."></textarea>
							<view class="form-label">服务是否达成</view>
							<view class="radio-group">
								<view class="radio-item radius-15 mr-24" :class="{active:submitForm.serviceResult===1}"
									@click="submitForm.serviceResult=1">
									已达成</view>
								<view class="radio-item radius-15" :class="{active:submitForm.serviceResult===0}"
									@click="submitForm.serviceResult=0">
									未达成</view>
							</view>
							<button :disabled="!btnDisabled2" class="submit-btn  radius-15 margin-top-10"
								:loading="actionLoading" @click="submitAllRecord">提交陪诊记录</button>
						</view>
					</view>
				</view>
			</view>
		</view>
		</template>

		<myTabbar :current="1"></myTabbar>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import myTabbar from "@/components/myTabbar.vue";
	import {
		getEscortOrdersApi,
		getEscortOrdersByIdApi,
		putEscortOrdersByIdStartApi,
		postEscortOrdersByIdCheckinApi,
		postEscortOrdersByIdServiceRecordApi,
		postFilesUploadApi
	} from "@/api/frontApikit.js";
	// import { AMapWX } from "@/static/amap‑wx.130.js"

	export default {
		components: {
			myTabbar
		},

		data() {
			return {
				pageLoading: false, // 页面加载状态
				pageError: '', // 页面空状态文案
				actionLoading: false, // 按钮提交状态
				currentOrderId: '', // 当前订单ID
				orderStatus: '', // 当前订单状态
				orderDetail: null, // 订单详情原始数据
				checkinData: {
					latitude: null,
					longitude: null,
					address: '',
					photos: []
				}, // 到院签到数据
				hasCheckin: false, // 是否已到院签到
				hasServiceRecord: false, // 是否已提交服务记录
				abnormalOptions: [
					{ label: '空巢老人', value: 'EMPTY_NESTER' },
					{ label: '行动不便', value: 'MOBILITY_IMPAIRED' },
					{ label: '其他异常', value: 'OTHER' }
				], // 异常反馈选项

				user: {
					name: "孙患者",
					age: 45,
					status: "陪诊进行中",
					phone: "138****5678",
					hospital: "杭州市第一人民医院",
					serviceTime: ""
				},
				address: "杭州市西湖区西湖景区",
				destLat: "", //目的地纬度 latitude
				destLng: "", //目的地经度 longitude
				locDone: false, //是否完成定位打卡
				photoDone: false, //是否完成拍照打卡
				currentTask: 1,
				task1Done: false,
				task2Done: false,
				submitForm: {
					progressDesc: "",
					abnormalIdx: '',
					summaryText: "",
					serviceResult: '',
				},
				pollTimer: null,

				abnormalList: ["空巢老人", "行动不便", "其他异常"],
				task3Done: false,

				task1Finished: false,

			}
		},
		onLoad(options) {
			this.initServicePage(options || {});
		},
		onUnload() {
			if (this.pollTimer) {
				clearInterval(this.pollTimer)
				this.pollTimer = null
			}
		},
		computed: {
			// 是否存在当前订单
			hasOrder() {
				return !!this.currentOrderId;
			},
			// 可执行服务流程的订单状态
			canService() {
				return this.orderStatus === 'CONFIRMED' ||
					this.orderStatus === 'IN_SERVICE' ||
					this.orderStatus === 'COMPLETED';
			},
			task1AllDone() {
				return this.hasCheckin || (this.locDone && this.photoDone && this.checkinData.latitude !== null)
			},
			btnDisabled1() {
				// console.log(this.submitForm.progressDesc!= '',this.submitForm.abnormalIdx!== '')
				return this.submitForm.progressDesc.trim() !== '' && this.submitForm.abnormalIdx !== ''
			},
			btnDisabled2() {
				return this.submitForm.summaryText.trim() !== '' && this.submitForm.serviceResult !== ''
			},
		},
		methods: {
			// 初始化服务页，优先读取路由订单
			async initServicePage(options) {
				const id = options.id || options.orderId || '';
				const status = options.orderStatus || options.status || '';
				this.pageLoading = true;
				this.pageError = '';
				try {
					if (id) {
						await this.loadOrderDetail(id, status);
					} else {
						await this.loadCurrentServiceOrder();
					}
				} catch (error) {
					this.handleError(error, '陪诊任务加载失败');
					this.pageError = '陪诊任务加载失败';
				} finally {
					this.pageLoading = false;
				}
			},
			// 未带订单ID时自动寻找当前服务/待开始订单
			async loadCurrentServiceOrder() {
				const statuses = ['IN_SERVICE', 'CONFIRMED'];
				for (let i = 0; i < statuses.length; i += 1) {
					const result = await getEscortOrdersApi({
						status: statuses[i],
						page: 1,
						pageSize: 1
					});
					const list = this.extractList(result);
					if (list.length) {
						const order = list[0] || {};
						await this.loadOrderDetail(order.id, order.status || statuses[i]);
						return;
					}
				}
				this.resetOrderState('暂无可执行的陪诊服务');
			},
			// 获取订单详情并归一化页面字段
			async loadOrderDetail(id, status) {
				if (!id) {
					this.resetOrderState('缺少订单ID');
					return;
				}
				const data = await getEscortOrdersByIdApi({ id }) || {};
				this.orderDetail = data;
				this.normalizeOrderDetail(data, id, status);
			},
			// 重置无订单状态
			resetOrderState(message) {
				this.currentOrderId = '';
				this.orderStatus = '';
				this.orderDetail = null;
				this.pageError = message || '';
			},
			// 解析订单详情并填充患者卡片和任务进度
			normalizeOrderDetail(data, fallbackId, fallbackStatus) {
				const booking = data.booking || {};
				const patient = data.patient || {};
				const serviceRecord = data.serviceRecord || {};
				const checkins = Array.isArray(data.checkins) ? data.checkins : [];
				const arriveCheckin = this.findArriveCheckin(checkins);
				const merged = Object.assign({}, booking, patient, data.patientInfo || {}, data);
				const address = this.buildServiceAddress(booking, patient, merged);
				const rawPhone = merged.phone || merged.mobile || merged.contactPhone || patient.phone || '';
				const photos = arriveCheckin ? this.normalizePhotos(arriveCheckin.photos) : [];

				this.currentOrderId = booking.id || data.id || merged.orderId || fallbackId;
				this.orderStatus = booking.status || data.status || merged.status || fallbackStatus || '';
				this.address = address;
				this.destLat = this.toFiniteNumber(merged.latitude || patient.latitude || booking.latitude);
				this.destLng = this.toFiniteNumber(merged.longitude || patient.longitude || booking.longitude);
				this.hasCheckin = !!arriveCheckin;
				this.hasServiceRecord = !!(serviceRecord && Object.keys(serviceRecord).length);
				this.checkinData = {
					latitude: arriveCheckin ? this.toFiniteNumber(arriveCheckin.latitude) : null,
					longitude: arriveCheckin ? this.toFiniteNumber(arriveCheckin.longitude) : null,
					address: arriveCheckin ? (arriveCheckin.address || address) : '',
					photos
				};
				this.user = {
					name: patient.name || merged.patientName || merged.name || '未命名患者',
					age: this.toNumber(merged.age) ? merged.age : '--',
					status: this.getStatusText(this.orderStatus),
					phone: this.maskPhone(rawPhone),
					hospital: address,
					serviceTime: this.formatServiceTime(merged.serviceDate || booking.serviceDate, merged.period || booking.timeSlot)
				};
				this.fillServiceForm(serviceRecord);
				this.syncTaskState(serviceRecord, arriveCheckin);
			},
			// 根据签到和服务记录恢复任务进度
			syncTaskState(serviceRecord, arriveCheckin) {
				this.locDone = !!arriveCheckin;
				this.photoDone = !!(arriveCheckin && this.checkinData.photos.length);
				this.task1Done = !!arriveCheckin;
				if (this.hasServiceRecord) {
					this.task1Done = true;
					this.task2Done = true;
					this.task3Done = true;
					this.currentTask = 3;
					return;
				}
				this.task2Done = false;
				this.task3Done = false;
				this.currentTask = arriveCheckin ? 2 : 1;
			},
			// 回填历史服务记录
			fillServiceForm(serviceRecord) {
				const abnormalValue = serviceRecord.otherSituation || '';
				const abnormalIdx = this.abnormalOptions.findIndex(item => item.value === abnormalValue);
				this.submitForm = {
					progressDesc: serviceRecord.recoveryDescription || '',
					abnormalIdx: abnormalIdx > -1 ? abnormalIdx : '',
					summaryText: serviceRecord.specialFeedback || '',
					serviceResult: serviceRecord.taskCompleted === 'INCOMPLETE' ? 0 : (serviceRecord.taskCompleted ? 1 : '')
				};
			},
			// 查找到院签到记录
			findArriveCheckin(checkins) {
				for (let i = 0; i < checkins.length; i += 1) {
					const type = String(checkins[i].type || '').toUpperCase();
					if (type === 'ARRIVE' || type === 'CHECK_IN' || type === 'ARRIVAL') return checkins[i];
				}
				return null;
			},
			// 拼接服务地址
			buildServiceAddress(booking, patient, merged) {
				if (merged.address || patient.address) return merged.address || patient.address;
				const hospitalPart = [booking.hospital, booking.department].filter(Boolean).join(' ');
				return hospitalPart || booking.address || merged.hospitalName || '暂无服务地址';
			},
			// 状态码转中文
			getStatusText(status) {
				const map = {
					WAIT_ACCEPT: '待接单',
					CONFIRMED: '待开始服务',
					IN_SERVICE: '陪诊进行中',
					COMPLETED: '服务已完成',
					CANCELLED: '服务已取消'
				};
				return map[status] || '陪诊服务';
			},
			// 开始服务
			async startService() {
				if (this.actionLoading || !this.currentOrderId) return;
				const confirmed = await this.confirmAction('确认现在开始本次陪诊服务吗？');
				if (!confirmed) return;
				this.actionLoading = true;
				try {
					await putEscortOrdersByIdStartApi({ id: this.currentOrderId });
					uni.showToast({ title: '服务已开始', icon: 'success' });
					await this.loadOrderDetail(this.currentOrderId, 'IN_SERVICE');
				} catch (error) {
					this.handleError(error, '开始服务失败');
				} finally {
					this.actionLoading = false;
				}
			},
			// 手动刷新页面
			retryLoad() {
				this.initServicePage({
					id: this.currentOrderId,
					orderStatus: this.orderStatus
				});
			},
			// 导航
			// 原有高德App导航备用方法（保留旧逻辑，页面导航统一使用上方 goNav）
			async legacyGoNav() {
				if (this.destLat !== '' && this.destLng !== '') {
					uni.openLocation({
						latitude: Number(this.destLat),
						longitude: Number(this.destLng),
						name: this.user.name,
						address: this.address,
						fail: () => uni.showToast({ title: '打开地图失败', icon: 'none' })
					});
					return;
				}
				try {
					uni.showLoading({ title: '解析地址中...' });
					const geo = await this.getGeoByAddress(this.address);
					this.destLat = geo.latitude;
					this.destLng = geo.longitude;
					uni.openLocation({
						latitude: geo.latitude,
						longitude: geo.longitude,
						name: this.user.name,
						address: geo.formattedAddress || this.address,
						fail: () => uni.showToast({ title: '打开地图失败', icon: 'none' })
					});
				} catch (error) {
					uni.setClipboardData({
						data: this.address,
						success: () => uni.showToast({ title: '地址已复制', icon: 'none' })
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 定位打卡
			async locationCheck() {
				if (this.actionLoading || this.hasCheckin) return;
				this.actionLoading = true;
				try {
					const location = await this.getCurrentLocation();
					this.checkinData.latitude = Number(location.latitude);
					this.checkinData.longitude = Number(location.longitude);
					this.checkinData.address = location.address || this.address;
					this.task1Finished = true;
					this.locDone = true;
					uni.showToast({ title: '定位成功', icon: 'success' });
				} catch (error) {
					this.handleLocationError(error);
				} finally {
					this.actionLoading = false;
				}
				// 		uni.chooseLocation({
				// 			success: (res) => {
				// 				console.log('选点结果', res)
				// 				uni.showModal({
				// 					title: "定位打卡成功",
				// 					content: `地址：${res.name}\n经纬度：${res.latitude},${res.longitude}`,
				// 					showCancel: false,
				// 					success: () => {
				// 						this.task1Finished = true;
				// 						this.locDone = true;
				// 					}
				// 				})
				// 			},
				// 			fail: (err) => {
				// 				console.error(err)
				// 				if (err.errMsg && err.errMsg.includes("auth")) {
				// 					uni.showModal({
				// 						title: "需要位置权限",
				// 						content: "请开启位置权限才能定位打卡",
				// 						confirmText: "去设置",
				// 						success: (res) => {
				// 							if (res.confirm) uni.openSetting()
				// 						}
				// 					})
				// 				} else if (err.errMsg && err.errMsg.includes('cancel')) {
				// 					uni.showToast({
				// 						title: "已取消定位打卡",
				// 						icon: "none"
				// 					})
				// 				} else {
				// 					uni.showToast({
				// 						title: "打开地图失败",
				// 						icon: "none"
				// 					})
				// 				}
				// 			}
				// 		})


			},
			// 拍照打卡
			photoCheck() {
				if (this.actionLoading || this.hasCheckin) return;
				uni.chooseImage({
					count: Math.max(1, 9 - this.checkinData.photos.length),
					sizeType: ['compressed'],
					sourceType: ['camera', 'album'],
					success: res => {
						const files = res.tempFilePaths || [];
						if (files.length) this.uploadCheckinPhotos(files);
					},
					fail: error => {
						if (error && /cancel/i.test(String(error.errMsg || ''))) return;
						uni.showToast({ title: '选择照片失败，请检查权限', icon: 'none' });
					}
				});
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
			// 上传签到照片
			async uploadCheckinPhotos(files) {
				this.actionLoading = true;
				uni.showLoading({ title: '照片上传中...', mask: true });
				try {
					for (let i = 0; i < files.length; i += 1) {
						const result = await postFilesUploadApi({
							filePath: files[i],
							name: 'file',
							dir: 'checkin'
						});
						const url = this.extractUploadedFileUrl(result);
						if (url) this.checkinData.photos.push(url);
					}
					this.task1Finished = true;
					this.photoDone = this.checkinData.photos.length > 0;
					uni.showToast({ title: '照片上传成功', icon: 'success' });
				} catch (error) {
					this.handleError(error, '照片上传失败');
				} finally {
					this.actionLoading = false;
					uni.hideLoading();
				}
			},
			// 获取设备当前定位
			getCurrentLocation() {
				return new Promise((resolve, reject) => {
					uni.getLocation({
						type: 'gcj02',
						geocode: true,
						success: res => {
							let address = '';
							if (res.address) {
								address = [res.address.province, res.address.city, res.address.district, res.address.street, res.address.streetNum]
									.filter(Boolean)
									.join('');
							}
							resolve({
								latitude: res.latitude,
								longitude: res.longitude,
								address
							});
						},
						fail: reject
					});
				});
			},
			// 处理定位权限/取消等异常
			handleLocationError(error) {
				const message = String((error && error.errMsg) || (error && error.message) || '');
				if (/cancel/i.test(message)) return;
				if (/auth|deny|permission/i.test(message)) {
					uni.showModal({
						title: '需要位置权限',
						content: '请开启位置权限后再进行到院签到',
						confirmText: '去设置',
						success: res => {
							if (res.confirm && uni.openSetting) uni.openSetting();
						}
					});
					return;
				}
				uni.showToast({ title: '未获取到签到位置', icon: 'none' });
			},
			// 确认操作弹窗
			confirmAction(content) {
				return new Promise(resolve => {
					uni.showModal({
						title: '操作确认',
						content,
						confirmText: '确认',
						cancelText: '取消',
						success: res => resolve(!!res.confirm),
						fail: () => resolve(false)
					});
				});
			},
			// 统一异常提示，接口封装已提示的错误不重复打断流程
			handleError(error, fallback) {
				const message = (error && (error.message || error.errMsg)) || fallback || '请求失败';
				console.warn('[service]', fallback || message, error);
				if (!error || !error.isApiError) {
					uni.showToast({ title: fallback || message, icon: 'none', duration: 2200 });
				}
			},
			// 兼容数组、分页对象和业务包裹对象
			extractList(data) {
				if (Array.isArray(data)) return data;
				if (!data) return [];
				if (Array.isArray(data.list)) return data.list;
				if (Array.isArray(data.records)) return data.records;
				if (Array.isArray(data.rows)) return data.rows;
				if (Array.isArray(data.items)) return data.items;
				if (Array.isArray(data.data)) return data.data;
				return [];
			},
			// 转有限数字，失败返回null
			toFiniteNumber(value) {
				const num = Number(value);
				return Number.isFinite(num) ? num : '';
			},
			// 判断数字字段是否有效
			toNumber(value) {
				const num = Number(value);
				return Number.isFinite(num) && num > 0 ? num : 0;
			},
			// 手机号脱敏
			maskPhone(phone) {
				const value = String(phone || '').trim();
				if (!value) return '暂无联系电话';
				if (value.indexOf('*') > -1) return value;
				if (/^1\d{10}$/.test(value)) return value.slice(0, 3) + '****' + value.slice(7);
				if (value.length >= 7) return value.slice(0, 3) + '****' + value.slice(-4);
				return value;
			},
			// 格式化服务日期和时段
			formatServiceTime(date, period) {
				if (!date) return period || '';
				let dateText = String(date);
				const time = new Date(dateText.replace(/-/g, '/'));
				if (!Number.isNaN(time.getTime())) {
					const month = String(time.getMonth() + 1).padStart(2, '0');
					const day = String(time.getDate()).padStart(2, '0');
					dateText = `${time.getFullYear()}-${month}-${day}`;
				}
				const periodMap = {
					MORNING: '上午',
					AFTERNOON: '下午',
					FULLDAY: '全天'
				};
				const periodText = periodMap[String(period || '').toUpperCase()] || period || '';
				return periodText ? `${dateText} ${periodText}` : dateText;
			},
			// 兼容字符串、JSON字符串、对象数组等照片结构
			normalizePhotos(photos) {
				let list = [];
				if (!photos) return list;
				if (typeof photos === 'string') {
					const text = photos.trim();
					if (text.indexOf('[') === 0) {
						try {
							list = JSON.parse(text);
						} catch (error) {
							list = text.split(',');
						}
					} else {
						list = text.split(',');
					}
				} else if (Array.isArray(photos)) {
					list = photos;
				}
				return list.map(item => {
					if (typeof item === 'string') return this.normalizeFileUrl(item);
					return this.extractUploadedFileUrl(item || {});
				}).filter(Boolean);
			},
			// 拼接文件访问地址
			normalizeFileUrl(url) {
				if (url === null || url === undefined) return '';
				let value = String(url).trim();
				if (!value || value.indexOf('{') === 0 || value.indexOf('[') === 0) return '';
				if (/^(https?:|wxfile:|blob:|data:|\.\/|file:|cloud:|static\/|@\/)/i.test(value)) return value;
				if (/^[a-zA-Z]:[\\/]/.test(value)) return value;
				if (value.indexOf('/files/') === 0) return 'http://followup.ijunyuan.cn/api/v1' + value;
				if (value.indexOf('/') === 0) return 'http://followup.ijunyuan.cn/api/v1' + value;
				return 'http://followup.ijunyuan.cn/api/v1/files/' + value.replace(/^\/+/, '');
			},
			// 从上传响应中提取图片地址
			extractUploadedFileUrl(result) {
				if (!result) return '';
				if (typeof result === 'string') return this.normalizeFileUrl(result.trim());
				if (Array.isArray(result)) {
					for (let i = 0; i < result.length; i += 1) {
						const url = this.extractUploadedFileUrl(result[i]);
						if (url) return url;
					}
					return '';
				}
				const keys = ['url', 'fileUrl', 'imageUrl', 'accessUrl', 'downloadUrl', 'previewUrl',
					'fullUrl', 'filePath', 'path', 'src', 'fileId', 'id', 'fileName', 'filename',
					'urlPath', 'remoteUrl', 'fullPath'];
				for (let i = 0; i < keys.length; i += 1) {
					if (result[keys[i]] !== undefined && result[keys[i]] !== null) {
						const url = this.normalizeFileUrl(result[keys[i]]);
						if (url) return url;
					}
				}
				if (result.dir && result.filename) {
					return this.normalizeFileUrl(String(result.dir).replace(/\/$/, '') + '/' + result.filename);
				}
				const nestedKeys = ['data', 'file', 'image', 'attachment', 'result', 'record'];
				for (let j = 0; j < nestedKeys.length; j += 1) {
					if (result[nestedKeys[j]] && typeof result[nestedKeys[j]] === 'object') {
						const url = this.extractUploadedFileUrl(result[nestedKeys[j]]);
						if (url) return url;
					}
				}
				return '';
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
			// 校验服务是否已开始
			ensureServiceStarted() {
				if (this.orderStatus !== 'IN_SERVICE') {
					uni.showToast({ title: '请先点击开始服务', icon: 'none' });
					return false;
				}
				return true;
			},
			// 提交定位和照片，完成到院签到
			async goTask2() {
				if (!this.ensureServiceStarted() || this.actionLoading || this.hasCheckin) return;
				if (this.checkinData.latitude === null || this.checkinData.longitude === null) {
					uni.showToast({ title: '请先完成定位打卡', icon: 'none' });
					return;
				}
				if (!this.checkinData.photos.length) {
					uni.showToast({ title: '请先上传签到照片', icon: 'none' });
					return;
				}
				this.actionLoading = true;
				uni.showLoading({ title: '签到提交中...', mask: true });
				try {
					await postEscortOrdersByIdCheckinApi({
						id: this.currentOrderId,
						data: {
							latitude: Number(this.checkinData.latitude),
							longitude: Number(this.checkinData.longitude),
							address: this.checkinData.address || this.address,
							photos: this.checkinData.photos
						}
					});
					this.hasCheckin = true;
					this.task1Done = true;
					this.locDone = true;
					this.photoDone = true;
					this.currentTask = 2;
					uni.showToast({ title: '到院签到成功', icon: 'success' });
				} catch (error) {
					this.handleError(error, '到院签到失败');
				} finally {
					this.actionLoading = false;
					uni.hideLoading();
				}
			},
			// 选择异常反馈类型
			onAbnormalChange(e) {
				this.submitForm.abnormalIdx = Number(e.detail.value)
			},
			// 校验第二步并进入最终反馈
			submitTask2() {
				if (!this.ensureServiceStarted() || this.hasServiceRecord) return;
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
			// 提交最终陪诊服务记录
			async submitAllRecord() {
				if (!this.ensureServiceStarted() || this.actionLoading || this.hasServiceRecord) return;
				if (!this.submitForm.summaryText.trim()) {
					uni.showToast({
						title: "请填写陪诊总结",
						icon: "none"
					})
					return
				}
				const option = this.abnormalOptions[this.submitForm.abnormalIdx] || {};
				this.actionLoading = true;
				uni.showLoading({ title: '提交中...', mask: true });
				try {
					await postEscortOrdersByIdServiceRecordApi({
						id: this.currentOrderId,
						data: {
							recoveryDescription: this.submitForm.progressDesc.trim(),
							otherSituation: option.value || 'OTHER',
							specialFeedback: this.submitForm.summaryText.trim(),
							taskCompleted: this.submitForm.serviceResult === 0 ? 'INCOMPLETE' : 'COMPLETED'
						}
					});
					this.hasServiceRecord = true;
					this.task2Done = true;
					this.task3Done = true;
					this.currentTask = 3;
					uni.showToast({ title: '陪诊记录已提交', icon: 'success' });
					await this.loadOrderDetail(this.currentOrderId, 'COMPLETED');
				} catch (error) {
					this.handleError(error, '陪诊记录提交失败');
				} finally {
					this.actionLoading = false;
					uni.hideLoading();
				}
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
	/* page {
		background: #f4f6fa;
	} */

	/* .container {
		padding: 30rpx;
	} */
	.page-content {
		position: relative;
		padding: 24rpx 24rpx 140rpx;
		box-sizing: border-box;
		min-height: 100vh;
	}

	.state-box {
		min-height: 480rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
		box-sizing: border-box;
		text-align: center;
	}

	.inline-state {
		min-height: 260rpx;
		background: #fff;
		border-radius: 24rpx;
		margin-bottom: 30rpx;
	}

	.state-text,
	.state-title,
	.state-desc {
		margin-top: 20rpx;
	}

	.state-text,
	.state-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 600;
	}

	.state-desc {
		font-size: 26rpx;
		color: #909399;
	}

	.state-btn,
	.start-btn {
		background: #2563ff;
		color: #fff;
		border-radius: 42rpx;
		font-size: 28rpx;
		padding: 0 48rpx;
		margin-top: 30rpx;
		border: none;
	}

	.start-banner {
		background: #f3e8fc;
		border: 1rpx solid #d8b4fe;
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.start-info {
		flex: 1;
		padding-right: 20rpx;
	}

	.start-title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #581c87;
	}

	.start-desc {
		display: block;
		font-size: 24rpx;
		color: #7e3af2;
		margin-top: 8rpx;
	}

	.start-btn {
		width: 180rpx;
		height: 72rpx;
		line-height: 72rpx;
		padding: 0;
		margin: 0;
	}

	.photo-scroll {
		width: 100%;
		margin-top: 20rpx;
		white-space: nowrap;
	}

	.photo-list {
		display: flex;
	}

	.photo-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		margin-right: 14rpx;
		background: #f2f3f5;
	}

	.tip-box {
		display: flex;
		align-items: center;
		background: #e8f9ee;
		padding: 24rpx 30rpx;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		border: 1rpx solid #b2e8c4;
		position: absolute;
		top: 20rpx;
		left: 60rpx;
		right: 60rpx;
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
		color: #2563ff;
		font-size: 30rpx;
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
		background: #2563ff;
	}

	.dot-wait {
		background: #ffffff;
		border: 2rpx #cccccc solid;
	}



/* 只有不是最后一条，才渲染竖线 */
.timeline-line::before {
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
		font-size: 30rpx;
		font-weight: 600;
		color: #111;
		margin-bottom: 16rpx;
	}

	.text-gray {
		color: #909399;
	}

	.btn-group {
		display: flex;
		flex-direction: column;
	}
	

	.action-btn {
		background: #2563ff;
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
		padding: 0 24rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
		border: 2rpx solid #ddd;
	}

	.radio-group {
		display: flex;
		margin: 20rpx 0;
	}

	.radio-item {
		flex: 1;
		text-align: center;
		padding: 18rpx 0;
		border: 2rpx solid #ddd;
		font-size: 25rpx;
		font-weight: bold;
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
		font-size: 25rpx;
		border: none;
		font-weight: bold;
		height: 80rpx;
		line-height: 80rpx;
		/* border: 2px solid #27ae60; */
		/* margin-top: 20rpx; */
	}

	.purple-btn {
		background: #2563ff;
		color: #fff;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 25rpx;
		border: none;
		font-weight: bold;
		height: 80rpx;
		line-height: 80rpx;
		/* border: 2px solid #2563ff; */
	}

	.done-row {
		display: flex;
		align-items: center;
		height: calc(80rpx - 4px);
		line-height: 80rpx;
		padding: 0 10px;
	}

	.done-text {
		color: #27ae60;
		font-size: 25rpx;
		margin-left: 10rpx;
	}

	.purple-btn[disabled] {
		background-color: #d4a0ff !important; //禁用浅紫色
		color: #fff !important;
		border: 0 !important;
	}

	.submit-btn[disabled] {
		background-color: #7fe2a7 !important; //禁用浅紫色
		color: #fff !important;
		border: 0 !important;
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
		color: #2563ff;
	}





	.purple-btn .u-icon {
		margin-right: 5px;
	}
</style>
