<template>
	<view class="page-content page-register">
		<view class="bg-absolute bg-blue-top"></view>
		<view class="bg-relative">
			<view class="p1">{{message1}}</view>
			<view class="p2 margin-bottom-1">{{message2}}</view>
			<view class="bg-white" v-show="isShow">
				<u--form :labelStyle="{width:'100px',color:'#909399',fontSize:'20rpx'}" labelPosition="left"
					:model="model1" :rules="rules" ref="uForm">
					<u-form-item label="手机号" prop="userInfo.phone" labelPosition="top" ref="itemPhone">
						<u--input v-model="model1.userInfo.phone" type="number" maxlength="11" placeholder="请输入手机号" prefixIcon="phone"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="验证码" prop="userInfo.code" labelPosition="top" ref="itemCode">
						<u--input v-model="model1.userInfo.code" type="number" maxlength="6" placeholder="请输入验证码" prefixIcon="checkmark-circle"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="身份证号" prop="userInfo.idCard" labelPosition="top" ref="itemIdCard">
						<u--input v-model="model1.userInfo.idCard" maxlength="18" placeholder="请输入身份证号" prefixIcon="account"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<view class="view-between">
						<u-form-item class="mr-16" label="患者姓名" prop="userInfo.name" labelPosition="top"
							:labelStyle="{color:'#606266',fontWeight:'bold'}" ref="itemName">
							<u--input v-model="model1.userInfo.name" placeholder="请输入患者姓名"></u--input>
						</u-form-item>
						<u-form-item label="性别" prop="userInfo.sex" labelPosition="top"
							:labelStyle="{color:'#606266',fontWeight:'bold'}" ref="itemSex">
							<view @click="sexclick">
								<u--input v-model="model1.userInfo.sex" disabled disabledColor="#ffffff" placeholder="请选择性别">
									<u-icon slot="right" name="arrow-right"></u-icon>
								</u--input>
							</view>
						</u-form-item>
					</view>
					<u-form-item label="年龄" prop="userInfo.age" labelPosition="top" ref="itemAge">
						<u--input v-model="model1.userInfo.age" type="number" placeholder="请输入年龄" prefixIcon="order"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="手术地区" prop="userInfo.area" labelPosition="top" ref="itemArea">
						<u--input v-model="model1.userInfo.area" placeholder="请输入手术地区" prefixIcon="map"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="手术医院" prop="userInfo.hospital" labelPosition="top" ref="itemHospital">
						<u--input v-model="model1.userInfo.hospital" placeholder="请输入手术医院" prefixIcon="coupon"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="科室" prop="userInfo.department" labelPosition="top" ref="itemDept">
						<u--input v-model="model1.userInfo.department" placeholder="请输入就诊科室" prefixIcon="home"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="手术类别" prop="userInfo.operateType" labelPosition="top" ref="itemOperate">
						<u--input v-model="model1.userInfo.operateType" placeholder="请输入手术类别" prefixIcon="gift"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
					<u-form-item label="主刀医生" prop="userInfo.doctor" labelPosition="top" ref="itemDoctor">
						<u--input v-model="model1.userInfo.doctor" placeholder="请输入主刀医生姓名" prefixIcon="man-delete"
							prefixIconStyle="font-size: 22px;color: #909399"></u--input>
					</u-form-item>
				</u--form>
				<u-button class="margin-top-2" type="primary" text="完成注册" @click="handleClick"></u-button>
				<u-action-sheet :show="showSex" :actions="actions" title="请选择性别" @close="showSex = false"
					@select="sexSelect">
				</u-action-sheet>
			</view>
			<view class="bg-white" v-show="!isShow">
				<view class="icon-wrapper">
					<u-icon name="checkmark-circle" color="#19be6b" :bold="true" size="80rpx"></u-icon>
				</view>
				<view class="view-h1">
					认证完成
				</view>
				<view class="view-h5">
					欢迎加入，您的术后康复助手已准备就绪，我们将为您建立专属康复计划。
				</view>
				<view class="view-card">
					<view class="view-icon bg-white1 margin-right-10">
						<text class="custom-icon custom-icon-stethoscope icon-bold"
							style="font-size:40rpx;color:#155DFC;"></text>
					</view>
					<view class="view-text">
						<view class="view-text1">
							专属服务
						</view>
						<view class="view-text2">
							最专业医学服务已开启
						</view>
					</view>
				</view>
				<u-button type="primary" text="进入首页" @click="routeTo"></u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		postAuthRegisterApi,
		getPatientsByIdApi,
		postAuthWxLoginApi
	} from '@/api/frontApikit.js'

	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		data() {
			return {
				isShow: true,
				showSex: false,
				message1: "完善专业档案",
				message2: "您好，患者。请填写以下信息以提供精准服务",
				model1: {
					userInfo: {
						name: '',
						sex: '',
						age: '',
						area: '',
						hospital: '',
						department: '',
						operateType: '',
						doctor: '',
						phone: '',
						code: '',
						idCard: '',
						hospitalId: '',
						departmentId: '',
						doctorId: '',
						diseaseIntro: '',
						bindToken: ''
					},
				},
				submitting: false,
				patientId: '',
				detailLoading: false,
				actions: [{
						name: '男',
					},
					{
						name: '女',
					},
				],
				rules: {
					'userInfo.name': {
						type: 'string',
						required: true,
						message: '请填写姓名',
						trigger: ['blur', 'change']
					},
					'userInfo.sex': {
						type: 'string',
						required: true,
						message: '请选择性别',
						trigger: ['blur', 'change']
					},
					'userInfo.age': {
						type: 'string',
						required: true,
						message: '请填写年龄',
						trigger: ['blur', 'change']
					},
					'userInfo.area': {
						type: 'string',
						required: true,
						message: '请填写手术地区',
						trigger: ['blur', 'change']
					},
					'userInfo.hospital': {
						type: 'string',
						required: true,
						message: '请填写手术医院',
						trigger: ['blur', 'change']
					},
					'userInfo.department': {
						type: 'string',
						required: true,
						message: '请填写科室',
						trigger: ['blur', 'change']
					},
					'userInfo.operateType': {
						type: 'string',
						required: true,
						message: '请填写手术类别',
						trigger: ['blur', 'change']
					},
					'userInfo.doctor': {
						type: 'string',
						required: true,
						message: '请填写主刀医生',
						trigger: ['blur', 'change']
					}
				},
				radio: '',
				switchVal: false
			};
		},
		async onLoad(options) {
			this.patientId = uni.getStorageSync('userInfo').userId;
			
			
				// await this.loadPatientDetail(this.patientId)

		},
		methods: {
			resetRegisterForm() {
				const userInfo = this.model1.userInfo
				userInfo.name = ''
				userInfo.sex = ''
				userInfo.age = ''
				userInfo.area = ''
				userInfo.hospital = ''
				userInfo.department = ''
				userInfo.operateType = ''
				userInfo.doctor = ''
				userInfo.phone = ''
				userInfo.code = ''
				userInfo.idCard = ''
				userInfo.hospitalId = ''
				userInfo.departmentId = ''
				userInfo.doctorId = ''
				userInfo.diseaseIntro = ''
				userInfo.bindToken = ''
			},
			async loadPatientDetail(id) {
				console.log(uni.getStorageSync('userInfo').userId)
				console.log(id)
				this.detailLoading = true
				uni.showLoading({
					title: '加载中...',
					mask: true
				})
				try {
					const res = await getPatientsByIdApi({
						id
					})
					const patient = res && res.data ? res.data : res
					this.fillPatientForm(patient || {})
				} catch (err) {
					console.log('患者详情加载失败', err)
					uni.showToast({
						title: (err && err.message) || '患者信息加载失败',
						icon: 'none'
					})
				} finally {
					this.detailLoading = false
					uni.hideLoading()
				}
			},
			fillPatientForm(data) {
				const userInfo = this.model1.userInfo
				const fields = ['phone', 'name', 'idCard', 'hospitalId', 'departmentId', 'doctorId', 'diseaseIntro']
				fields.forEach(field => {
					const value = data[field]
					userInfo[field] = value === null || value === undefined ? '' : value
				})
				userInfo.sex = data.gender === '男' || data.gender === '女' ? data.gender : ''
				userInfo.code = ''
				userInfo.bindToken = ''
			},
			async ensureBindToken() {
				if (this.model1.userInfo.bindToken) return
				// #ifdef MP-WEIXIN
				try {
					const loginRes = await new Promise((resolve, reject) => {
						uni.login({
							provider: 'weixin',
							success: resolve,
							fail: reject
						})
					})
					const loginResult = await postAuthWxLoginApi({
						code: loginRes.code
					})
					if (loginResult && loginResult.bindToken) {
						this.model1.userInfo.bindToken = loginResult.bindToken
					}
				} catch (err) {
					console.log('微信登录凭证获取失败', err)
				}
				// #endif
			},
			sexclick(){
				console.log(11111111111)
				this.showSex=true
			},
			sexSelect(e) {
				this.model1.userInfo.sex = e.name
				this.$refs.uForm.validateField('userInfo.sex')
			},
			async handleClick() {
				if (this.submitting) return
				const userInfo = this.model1.userInfo
				let requestStarted = false
				if (!userInfo.phone || !String(userInfo.phone).trim()) {
					return uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
				}
				if (!/^1[3-9]\d{9}$/.test(String(userInfo.phone).trim())) {
					return uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
				}
				if (!userInfo.code || !String(userInfo.code).trim()) {
					return uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					})
				}
				if (!userInfo.name || !String(userInfo.name).trim()) {
					return uni.showToast({
						title: '请输入姓名',
						icon: 'none'
					})
				}
				if (!userInfo.idCard || !String(userInfo.idCard).trim()) {
					return uni.showToast({
						title: '请输入身份证号',
						icon: 'none'
					})
				}
				try {
					await this.$refs.uForm.validate()
					this.submitting = true
					requestStarted = true
					uni.showLoading({
						title: '提交中...',
						mask: true
					})
					await this.ensureBindToken()
					const registerData = {
						phone: String(userInfo.phone).trim(),
						code: String(userInfo.code).trim(),
						name: String(userInfo.name).trim(),
						gender: userInfo.sex || '',
						idCard: String(userInfo.idCard).trim(),
						hospitalId: this.normalizeId(userInfo.hospitalId),
						departmentId: this.normalizeId(userInfo.departmentId),
						doctorId: this.normalizeId(userInfo.doctorId),
						diseaseIntro: userInfo.diseaseIntro || '',
						bindToken: userInfo.bindToken || '',
						age: userInfo.age === '' || userInfo.age === null || userInfo.age === undefined ? null : Number(userInfo.age),
						surgeryRegion: userInfo.area || '',
						surgeryType: userInfo.operateType || ''
					}
					const result = await postAuthRegisterApi(registerData)
					if (result && result.token) {
						uni.setStorageSync('token', result.token)
						uni.setStorageSync('accessToken', result.token)
						if (result.refreshToken) {
							uni.setStorageSync('refreshToken', result.refreshToken)
						}
						if (result.user) {
							uni.setStorageSync('userInfo', result.user)
						}
						uni.removeStorageSync('pendingPatientRegister')
					}
					setTimeout(() => {
						uni.showToast({
							title: '注册成功',
							icon: 'success'
						})
						uni.reLaunch({
							url: result && result.token ? '/pages/index/home' : '/pages/index/login'
						})
					}, 300)
				} catch (err) {
					console.log('表单校验失败', err)
				} finally {
					this.submitting = false
					if (requestStarted) uni.hideLoading()
				}
			},
			normalizeId(value) {
				if (value === '' || value === undefined || value === null) return null
				if (typeof value === 'number') {
					return Number.isSafeInteger(value) ? value : String(value)
				}
				return String(value)
			},
			routeTo() {
				uni.reLaunch({
					url: '/pages/index/home'
				})
			}

		},
		onReady() {},
	};
</script>

<style scoped>
	.view-between {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	::v-deep .u-form-item__body__right__message {
		margin-left: 0 !important;
	}

	.view-between>.u-form-item {
		flex: 1;
	}

	.page-register .bg-blue-top {
		height: 300rpx;
		border-bottom-right-radius: 40px;
		border-bottom-left-radius: 40px;
		background-color: #155DFC;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}

	.u-form-item {
		/* padding-bottom: 30rpx; */
	}

	/* 	::v-deep .u-form-item {
		position: relative !important;
	}

	::v-deep .u-form-item__error {
		position: static !important;
		width: 100% !important;
		white-space: normal !important;
		word-break: break-all !important;
		text-align: left !important;
		right: auto !important;
		margin-top: 8rpx;
	} */
</style>
