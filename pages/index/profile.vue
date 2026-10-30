<template>
	<view class="page-profile">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{height:(statusBarHeight||0)+'px'}"></view>
		<!-- 自定义导航栏 -->
		<view class="custom-nav">
			<!-- 返回按钮 -->
			<view class="nav-back" @click="handleBack()">
				<u-icon name="arrow-left" color="#222" size="36rpx"></u-icon>
			</view>
			<!-- 中间标题 -->
			<view class="nav-title" :style="{marginRight: safeMenuWidth + 'px'}">个人中心</view>
			<view class="nav-right font-blue font-bold navbar-right" @click="handleSave">
				保存
			</view>
			<view :style="{ width: menuButton.width + 'px' }"></view>

		</view>
		<view class="page-content page-profile">
			<view class="radius-15 card-top bg-white card-border card-border-gray u-flex space-between"
				@click="routeTo('records')">
				<view class="u-flex">
					<view class="view-icon bg-orange margin-right-5">
						<u-icon name="order" color="#ff6900" :bold="true" size="60rpx"></u-icon>
					</view>
					<view class="view-text">
						<view class="view-text1 font-l">
							术后病历查询
						</view>
						<view class="view-text2">
							Medical Records
						</view>
					</view>
				</view>
				<view class="">
					<u-icon name="arrow-right" color="#909399" size="20rpx"></u-icon>
				</view>
			</view>

			<view class="radius-15 bg-white card-border card-border-gray card-group">
				<view class="group-label">基本信息</view>
				<view>
					<u--form :labelStyle="{
							width:'100px',
							color:'#909399',
							fontSize:'24rpx',
							marginBottom:'15rpx'
						}" labelPosition="left" :model="model1" :rules="rules" ref="uForm">
						<u-form-item label="姓名" prop="userInfo.name" labelWidth="100%" labelPosition="top">
							<u--input prefixIcon="account" prefixIconStyle="font-size: 50rpx;color: #155DFC"
								v-model="model1.userInfo.name"></u--input>
						</u-form-item>
						<u-form-item label="性别" labelWidth="100%" prop="userInfo.gender" labelPosition="top"
							@click="showSex = true; hideKeyboard()">
							<view class="input-wrap gender-picker">
								<text class="custom-icon custom-icon-activity icon-activity"
									style="font-size:50rpx;color:#155DFC;"></text>
								<view class="input-inner">
									<u--input v-model="model1.userInfo.gender" disabled disabledColor="#ffffff"
										placeholder="请选择性别"></u--input>
								</view>
								<u-icon class="arrow-icon" name="arrow-right" color="#909399"></u-icon>
							</view>
						</u-form-item>
						<u-form-item label="年龄" labelWidth="100%" prop="userInfo.age" labelPosition="top">
							<u--input type="number" placeholder="请输入年龄" prefixIcon="order"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.age"></u--input>
						</u-form-item>
						<u-form-item label="地区" labelWidth="100%" prop="userInfo.region" labelPosition="top">
							<u--input placeholder="请输入地区" prefixIcon="map"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.region"></u--input>
						</u-form-item>
						<u-form-item label="标签" labelWidth="100%" labelPosition="top">
							<view class="profile-tags">
								<text v-for="(tag, index) in tagList" :key="index" class="profile-tag">{{ tag }}</text>
								<text v-if="!tagList.length" class="profile-empty-tag">暂无标签</text>
							</view>
						</u-form-item>
					</u--form>
					<u-action-sheet :show="showSex" :actions="actions" title="请选择性别" @close="showSex = false"
						@select="sexSelect">
					</u-action-sheet>
				</view>
			</view>

			<view class="radius-15 bg-white card-border card-border-gray card-group">
				<view class="group-label">手术信息</view>
				<view>
					<u--form :labelStyle="{
							width:'100px',
							color:'#909399',
							fontSize:'24rpx',
							marginBottom:'15rpx'
						}" labelPosition="left" :model="model1" :rules="rules" ref="uForm">
						<!-- 删掉第二个u--form，直接写form-item，form-item可以放在form外部，model/rules/ref继承上层form -->
						<u-form-item label="就诊医院" labelWidth="100%" prop="userInfo.hospitalName" labelPosition="top">
							<u--input placeholder="请输入就诊医院" prefixIcon="coupon"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.hospitalName"></u--input>
						</u-form-item>
						<u-form-item label="科室" labelWidth="100%" prop="userInfo.departmentName" labelPosition="top">
							<u--input placeholder="请输入科室" prefixIcon="home"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.departmentName"></u--input>
						</u-form-item>
						<u-form-item label="手术名称" labelWidth="100%" prop="userInfo.surgeryType" labelPosition="top">
							<u--input placeholder="请输入手术名称" prefixIcon="gift"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.surgeryType"></u--input>
						</u-form-item>
						<u-form-item label="主刀医生" labelWidth="100%" prop="userInfo.doctorName" labelPosition="top">
							<u--input placeholder="请输入主刀医生" prefixIcon="man-delete"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.doctorName"></u--input>
						</u-form-item>
					</u--form>
				</view>
			</view>

			<u-button class="width-100 margin-top-8" shape="circle" :hairline="false" @click="logOut()" type="error"
				text="退出当前账号"></u-button>
			<myTabbar :current="3"></myTabbar>
		</view>
	</view>
</template>
<script>
	import {
		getMeProfileApi,
		putMeProfileApi,
		getDictOptionsApi,
		postAuthLogoutApi
	} from '@/api/frontApikit.js'
	import myTabbar from '@/components/myTabbar.vue'
	import {
		mapState
	} from 'vuex'

	function createEmptyProfile() {
		return {
			id: null,
			createTime: '',
			updateTime: '',
			deleted: 0,
			name: '',
			gender: '',
			age: '',
			idCard: '',
			phone: '',
			openid: null,
			username: '',
			region: '',
			surgeryRegion: '',
			hospitalId: null,
			areaId: null,
			departmentId: null,
			doctorId: null,
			attendingDoctorId: null,
			surgeryType: '',
			surgeryDate: '',
			diseaseIntro: '',
			heightCm: null,
			weightKg: null,
			tagsJson: '',
			hospitalName: '',
			departmentName: '',
			doctorName: '',
			attendingDoctorName: '',
			matchedCsId: null,
			matchedStationId: null,
			escortQuota: 0,
			healthStatus: '',
			communicateStatus: '',
			servicePackage: '',
			purchaseIntent: '',
			registerDate: ''
		}
	}

	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
			myTabbar
		},
		computed: {
			...mapState([
				'statusBarHeight',
				'menuButton',
				'navContentHeight',
				'navBarTotalHeight'
			])
		},
		data() {
			return {

				
				isShow: true,
				showSex: false,
				saving: false,
				logoutLoading: false,
				message1: "完善专业档案",
				message2: "您好，患者。请填写以下信息以提供精准服务",
				meProfile: null,
				tagList: [],
				dictOptions: {
					hospitals: [],
					areas: [],
					departments: [],
					doctors: [],
					tags: []
				},
				model1: {
					userInfo: createEmptyProfile()
				},
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
					'userInfo.gender': {
						type: 'string',
						required: true,
						message: '请选择性别',
						trigger: ['blur', 'change']
					},
					'userInfo.age': {
						validator: function(rule, value, callback) {
							const hasAge = value !== undefined && value !== null && String(value).trim() !== ''
							callback(hasAge ? undefined : new Error('请输入年龄'))
						},
						trigger: ['blur', 'change']
					},
					'userInfo.region': {
						type: 'string',
						required: true,
						message: '请输入地区',
						trigger: ['blur', 'change']
					},
					'userInfo.hospitalName': {
						type: 'string',
						required: true,
						message: '请输入就诊医院',
						trigger: ['blur', 'change']
					},
					'userInfo.departmentName': {
						type: 'string',
						required: true,
						message: '请输入科室',
						trigger: ['blur', 'change']
					},
					'userInfo.surgeryType': {
						type: 'string',
						required: true,
						message: '请输入手术名称',
						trigger: ['blur', 'change']
					},
					'userInfo.doctorName': {
						type: 'string',
						required: true,
						message: '请输入主刀医生',
						trigger: ['blur', 'change']
					}
				},
				radio: '',
				switchVal: false
			};
		},

		onLoad() {
			this.fetchProfile()
		},
		methods: {
			parseTags(tagsJson) {
				if (!tagsJson) return []
				try {
					const tags = typeof tagsJson === 'string' ? JSON.parse(tagsJson) : tagsJson
					return Array.isArray(tags) ? tags.map(function(tag) {
						return tag === null || tag === undefined ? '' : String(tag)
					}).filter(Boolean) : []
				} catch (e) {
					return []
				}
			},
			findDictName(list, id) {
				if (id === null || id === undefined || id === '') return ''
				const item = (list || []).find(function(option) {
					return String(option.id) === String(id)
				})
				return item ? item.name : ''
			},
			normalizeProfile(profile) {
				const data = Object.assign(createEmptyProfile(), profile || {})
				data.hospitalName = this.findDictName(this.dictOptions.hospitals, data.hospitalId)
				data.departmentName = this.findDictName(this.dictOptions.departments, data.departmentId)
				data.doctorName = this.findDictName(this.dictOptions.doctors, data.doctorId)
				data.attendingDoctorName = this.findDictName(this.dictOptions.doctors, data.attendingDoctorId)
				return data
			},
			async fetchProfile() {
				try {
					const result = await Promise.all([
						getMeProfileApi(),
						getDictOptionsApi().catch(function() {
							return {}
						})
					])
					const profileResponse = result[0] || {}
					const profile = profileResponse.data || profileResponse
					this.dictOptions = Object.assign({
						hospitals: [],
						areas: [],
						departments: [],
						doctors: [],
						tags: []
					}, result[1] || {})
					this.meProfile = profile
					this.model1.userInfo = this.normalizeProfile(profile)
					this.tagList = this.parseTags(this.model1.userInfo.tagsJson)
				} catch (e) {
					uni.showModal({
						title: '获取失败',
						content: e.message || '患者信息加载失败，请稍后重试',
						showCancel: false
					})
				}
			},
			getFormRefs() {
				if (!this.$refs.uForm) return []
				return Array.isArray(this.$refs.uForm) ? this.$refs.uForm : [this.$refs.uForm]
			},
			validateForms() {
				return Promise.all(this.getFormRefs().map(function(form) {
					return form.validate()
				}))
			},
			toNullableNumber(value) {
				if (value === null || value === undefined || value === '') return null
				const numberValue = Number(value)
				return isNaN(numberValue) ? null : numberValue
			},
			findHospitalId(name) {
				const hospital = (this.dictOptions.hospitals || []).find(function(item) {
					return item.name === name
				})
				return hospital ? hospital.id : null
			},
			findDepartmentId(name, hospitalId) {
				const departments = this.dictOptions.departments || []
				const department = departments.find(function(item) {
					return item.name === name && String(item.hospitalId) === String(hospitalId)
				})
				return department ? department.id : null
			},
			findDoctorId(name, hospitalId, departmentId) {
				const doctors = this.dictOptions.doctors || []
				const doctor = doctors.find(function(item) {
					return item.name === name &&
						String(item.hospitalId) === String(hospitalId) &&
						String(item.departmentId) === String(departmentId)
				})
				return doctor ? doctor.id : null
			},
			async submitProfile() {
				if (this.saving) return
				const userInfo = this.model1.userInfo
				try {
					await this.validateForms()
				} catch (e) {
					return
				}
				try {
					const name = (userInfo.name || '').trim()
					const gender = (userInfo.gender || '').trim()
					const age = this.toNullableNumber(userInfo.age)
					const region = (userInfo.region || '').trim()
					const hospitalName = (userInfo.hospitalName || '').trim()
					const departmentName = (userInfo.departmentName || '').trim()
					const surgeryType = (userInfo.surgeryType || '').trim()
					const doctorName = (userInfo.doctorName || '').trim()
					if (!name || !gender || age === null || !region || !hospitalName || !departmentName || !surgeryType || !doctorName) {
						uni.showToast({
							title: '请完善必填信息',
							icon: 'none'
						})
						return
					}
					if (!Number.isInteger(age) || age <= 0 || age > 150) {
						uni.showToast({
							title: '请输入正确年龄',
							icon: 'none'
						})
						return
					}
					const hospitalId = this.findHospitalId(hospitalName)
					const departmentId = this.findDepartmentId(departmentName, hospitalId)
					const doctorId = this.findDoctorId(doctorName, hospitalId, departmentId)
					if (!hospitalId || !departmentId || !doctorId) {
						uni.showToast({
							title: '医院、科室或医生信息无效',
							icon: 'none'
						})
						return
					}
					this.saving = true
					const payload = {
						id: userInfo.id,
						name: name,
						gender: gender,
						age: age,
						phone: userInfo.phone || '',
						region: region,
						surgeryRegion: (userInfo.surgeryRegion || '').trim(),
						hospitalId: hospitalId,
						departmentId: departmentId,
						doctorId: doctorId,
						surgeryType: surgeryType,
						surgeryDate: userInfo.surgeryDate || null,
						diseaseIntro: userInfo.diseaseIntro || '',
						heightCm: this.toNullableNumber(userInfo.heightCm),
						weightKg: this.toNullableNumber(userInfo.weightKg)
					}
					await putMeProfileApi(payload)
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
					await this.fetchProfile()
				} catch (e) {
					uni.showModal({
						title: '保存失败',
						content: e.message || '请稍后重试',
						showCancel: false
					})
				} finally {
					this.saving = false
				}
			},
			hideKeyboard() {
				uni.hideKeyboard()
			},
			// 返回上一页
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
			// 右侧按钮点击事件
			submit() {
				return this.submitProfile()
			},
			handleSave() {
				return this.submitProfile()
			},
			sexSelect(e) {
				this.model1.userInfo.gender = e.name
				const firstForm = this.getFormRefs()[0]
				if (firstForm) firstForm.validateField('userInfo.gender')
			},
			routeTo(res) {
				let data = {
					title: 'hello',
					id: 1
				}
				let routeUrl = `/pages/index/` + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				this.$safeJump(routeUrl)
			},

			logOut() {
				uni.showModal({
					title: '提示',
					content: '确定退出当前账号？',
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
		},
		// 删除 onReady setRules，uview2不需要手动设置
	};
</script>

<style scoped>
	page {
		background-color: #f9fafb;
	}

	.page-profile {
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
	}

	/* 状态栏高度，自动适配各手机 */
	.status-bar {
		height: var(--status-bar-height);
		width: 100%;
		background-color: #ffffff;
	}

	.custom-nav {
		height: 44px;
		background-color: #ffffff;
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
		color: #111;
		font-weight: 500;
	}

	.nav-right {
		width: 70rpx;
		text-align: right;
		color: #2979ff;
		font-size: 32rpx;
	}

	/* 	.page-content {
		padding: 30rpx;
	} */

	.card-top {
		margin-bottom: 30rpx;
		padding: 36rpx 30rpx;
	}

	.view-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.view-text1 {
		font-size: 34rpx;
		font-weight: bold;
		color: #111;
	}

	.view-text2 {
		font-size: 24rpx;
		color: #999;
		margin-top: 6rpx;
	}

	.card-group {
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.group-label {
		font-size: 28rpx;
		color: #999;
		padding: 24rpx 30rpx 10rpx;
	}

	/* 	.input-wrap :deep(.u-input__content) {
	  padding-left: 60rpx !important;
	} */

	.input-wrap {
		position: relative;
		width: 100%;
	}

	.gender-picker {
		min-height: 80rpx;
	}

	.gender-picker .icon-activity {
		top: 50%;
		transform: translateY(-50%);
	}

	.page-profile .u-input {
		padding: 20rpx 20rpx !important;
	}

	.page-profile .gender-picker ::v-deep .u-input {
		padding: 20rpx 56rpx 20rpx 76rpx !important;
		background-color: #ffffff;
	}

	::v-deep .u-form-item__body__right__message {
		display: block;
		width: 100%;
		margin-left: 0 !important;
		margin-top: 8rpx;
		line-height: 32rpx;
		text-align: left;
		white-space: normal;
	}

	.icon-activity {
		position: absolute;
		left: 20rpx;
		top: 20rpx;
		font-size: 50rpx;
	}

	.arrow-icon {
		position: absolute;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.input-inner {
		width: 100%;
	}

	.navbar-right {
		/* width: 60rpx; */
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.profile-tags {
		display: flex;
		flex-wrap: wrap;
		min-height: 64rpx;
		align-items: center;
		padding: 8rpx 0;
	}

	.profile-tag {
		padding: 8rpx 20rpx;
		margin: 0 16rpx 12rpx 0;
		font-size: 24rpx;
		color: #165DFF;
		background-color: #EDF3FF;
		border: 1rpx solid #C7D8FF;
		border-radius: 999rpx;
	}

	.profile-empty-tag {
		font-size: 26rpx;
		color: #b0b3bb;
	}
</style>
