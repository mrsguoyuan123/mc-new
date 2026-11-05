<template>
	<view class="page-doctorMine">
		<view class="content-wrap">
			<!-- 顶部渐变区域 -->
			<view class="top-wrap">
				<view class="user-info">
					<view v-if="userList.gender === '女'" class="avatar avatar-female"></view>
					<view v-else class="avatar avatar-male"></view>


					<view class="user-right">
						<view class="name-row">
							<text class="username">{{ userList.name || '医生' }}</text>

						</view>
						<view class="u-flex align-center flex-start">
							<view v-if="userList.title" class="badge badge-blue">{{ userList.title }}</view>
							<view class="meta font-info">{{ userList.hospitalName || '医院信息待补充' }}</view>
						</view>

					</view>
				</view>

			 <view v-if="!isEdit" class="edit-btn" @click="isEdit = true">编辑资料</view>
            <view v-else class="action-group">
                <view class="cancel-btn" @click="cancelEdit">取消</view>
                <view class="save-btn" @click="saveProfile">保存</view>
            </view>
			</view>
			<view class="card-row">
					<view class="card-title">
						<text>医生临床执业档案</text>
						<view class="cert-tag" v-if="form.certified">院内已认证</view>
					</view>

					<view class="form-item">
						<view class="label">性别</view>
						<picker v-if="isEdit" mode="selector" :range="['男','女']" :value="form.gender === '女' ? 1 : 0" @change="onGenderChange">
							<view class="value">{{ form.gender || '请选择' }}</view>
						</picker>
						<view v-else class="value">{{ form.gender || '-' }}</view>
					</view>
					<view class="form-item">
						<view class="label">联系手机</view>
						<input v-if="isEdit" class="value" v-model="form.phone" type="number" placeholder="手机号" />
						<view v-else class="value">{{ form.phone || '-' }}</view>
					</view>
					<view class="form-item">
						<view class="label">院内邮箱</view>
						<input v-if="isEdit" class="value" v-model="form.email" placeholder="院内邮箱" />
						<view v-else class="value">{{ form.email || '-' }}</view>
					</view>
					<view class="form-item">
						<view class="label">所属医院</view>
						<input v-if="isEdit" class="value" v-model="form.hospitalName" placeholder="医院" />
						<view v-else class="value">{{ form.hospitalName || '-' }}</view>
					</view>
					<view class="form-item">
						<view class="label">所属科室</view>
						<input v-if="isEdit" class="value" v-model="form.departmentName" placeholder="科室" />
						<view v-else class="value">{{ form.departmentName || '-' }}</view>
					</view>
					<view class="form-item">
						<view class="label">职称 / 职务</view>
						<input v-if="isEdit" class="value" v-model="form.title" placeholder="职称" />
						<view v-else class="value">{{ form.title || '-' }}</view>
					</view>

					<view class="form-item textarea-item">
						<view class="label">专业方向 / 擅长领域</view>
						<textarea v-if="isEdit" class="value" v-model="form.specialty" placeholder="擅长领域"></textarea>
						<view v-else class="value">{{ form.specialty || '-' }}</view>
					</view>
					<view class="form-item textarea-item">
						<view class="label">医生简介（展示给患者与团队）</view>
						<textarea v-if="isEdit" class="value" v-model="form.bio" placeholder="简介"></textarea>
						<view v-else class="value">{{ form.bio || '-' }}</view>
					</view>
				</view>
			<view class="btn-group">
				<view class="func-btn" @click="showComingSoon('科室通知')">科室通知</view>
				<view class="func-btn" @click="showComingSoon('安全设置')">安全设置</view>
				<view class="func-btn" @click="showComingSoon('使用指引')">使用指引</view>
			</view>

			<view class="info-wrapper">
				<view class="info-line">
				<view class="left">切换当前身份</view>
				<view class="right" @click="showComingSoon('身份切换')">体验医助、陪诊师等视角 ></view>
			</view>
			<view class="info-line">
				<view class="left">电子处方签名权限</view>
				<view class="right">{{ form.prescriptionSignEnabled === 1 ? '已激活' : '未激活' }} ></view>
			</view>
			<view class="info-line">
				<view class="left">版本与环境</view>
				<view class="right">v2.4.0 (Prod)</view>
			</view>

			</view>
			<!-- 退出登录按钮 -->
			<view class="logout-btn" @click="logOut()">退出登录 </view>
		</view>
		<myTabbar :current="2"></myTabbar>
	</view>
</template>
<script>
	import myTabbar from "@/components/myTabbar.vue";
	import {
		getDoctorProfileApi,
		putDoctorProfileApi,
		postAuthLogoutApi
	} from '@/api/frontApikit.js'

	export default {
		components: {
			myTabbar
		},
		data() {

			return {
				userList: {},
				logoutLoading: false,
				saveLoading: false,
				profileLoading: false,
				isEdit: false, // 是否编辑模式
				originForm: {}, // 原始数据，取消编辑用来回滚
				form: {
					name: '',
					gender: '',
					phone: '',
					email: '',
					hospitalId: null,
					hospitalName: '',
					departmentId: null,
					departmentName: '',
					title: '',
					specialty: '',
					bio: '',
					certified: false,
					prescriptionSignEnabled: 0
				},

			}
		},
		onLoad() {
			this.loadProfile()
		},
		methods: {
			// 读取本地登录信息，兼容字符串和对象两种缓存格式
			readCurrentUser() {
				try {
					const raw = uni.getStorageSync('userInfo')
					if (!raw) return {}
					return typeof raw === 'string' ? JSON.parse(raw) : raw
				} catch (error) {
					return {}
				}
			},

			onGenderChange(e) {
				const options = ['男', '女']
				this.form.gender = options[Number(e.detail.value)] || ''
				this.userList.gender = this.form.gender
			},

			// 保存
			async saveProfile() {
				if (this.saveLoading) return
				const message = this.validateProfile()
				if (message) {
					uni.showToast({ title: message, icon: 'none' })
					return
				}
				this.saveLoading = true
				uni.showLoading({ title: '保存中...', mask: true })
				try {
					const payload = this.buildProfilePayload()
					const res = await putDoctorProfileApi(payload)
					const baseProfile = Object.assign({}, this.form, payload)
					const profile = this.normalizeProfile(res, baseProfile)
					this.form = profile
					this.userList = Object.assign({}, this.userList, profile)
					this.originForm = JSON.parse(JSON.stringify(this.form))
					this.syncStoredProfile(profile)
					this.isEdit = false
					uni.showToast({ title: '保存成功' })
				} catch (error) {
					uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
				} finally {
					this.saveLoading = false
					uni.hideLoading()
				}
			},
			// 取消编辑，回滚数据
			cancelEdit() {
				this.form = JSON.parse(JSON.stringify(this.originForm || this.form))
				this.userList = Object.assign({}, this.userList, this.form)
				this.isEdit = false
			},

			async loadProfile() {
				if (this.profileLoading) return
				this.profileLoading = true
				const localProfile = this.normalizeProfile(this.readCurrentUser())
				this.form = localProfile
				this.userList = localProfile
				try {
					const res = await getDoctorProfileApi()
					const profile = this.normalizeProfile(res)
					this.form = profile
					this.userList = profile
					this.originForm = JSON.parse(JSON.stringify(profile))
					this.syncStoredProfile(profile)
				} catch (error) {
					this.originForm = JSON.parse(JSON.stringify(localProfile))
				} finally {
					this.profileLoading = false
				}
			},

			normalizeProfile(source, fallback) {
				const raw = source || {}
				const profile = raw.profile || raw.doctor || raw.userInfo || raw.user || raw
				const form = Object.assign(this.createEmptyProfile(), fallback || {})
				const keys = Object.keys(form)
				keys.forEach(key => {
					const value = profile[key]
					if (value !== undefined && value !== null) form[key] = value
				})
				form.name = profile.name || profile.doctorName || profile.realName || profile.nickname || profile.username || form.name
				form.phone = profile.phone || profile.mobile || profile.contactPhone || form.phone
				form.email = profile.email || profile.hospitalEmail || form.email
				form.hospitalId = profile.hospitalId || profile.hospital_id || form.hospitalId
				form.hospitalName = profile.hospitalName || profile.hospital || form.hospitalName
				form.departmentId = profile.departmentId || profile.department_id || form.departmentId
				form.departmentName = profile.departmentName || profile.department || profile.deptName || form.departmentName
				form.title = profile.title || profile.jobTitle || profile.position || form.title
				form.gender = this.normalizeGender(profile.gender || profile.sex)
				form.certified = profile.certified === true || profile.certified === 1 || profile.certified === '1' || profile.status === 'ENABLED'
				form.prescriptionSignEnabled = this.toNumber(profile.prescriptionSignEnabled || profile.prescriptionSign)
				return form
			},

			createEmptyProfile() {
				return {
					name: '',
					gender: '',
					phone: '',
					email: '',
					hospitalId: null,
					hospitalName: '',
					departmentId: null,
					departmentName: '',
					title: '',
					specialty: '',
					bio: '',
					certified: false,
					prescriptionSignEnabled: 0
				}
			},

			normalizeGender(value) {
				if (value === '男' || value === 'MALE' || value === 1 || value === '1') return '男'
				if (value === '女' || value === 'FEMALE' || value === 2 || value === '2') return '女'
				return ''
			},

			toNumber(value) {
				const number = Number(value)
				return Number.isFinite(number) ? number : 0
			},

			validateProfile() {
				if (!this.form.name || !this.form.name.trim()) return '请填写医生姓名'
				if (!this.form.gender) return '请选择性别'
				if (this.form.phone && !/^1\d{10}$/.test(this.form.phone)) return '请输入正确的手机号'
				if (this.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) return '请输入正确的邮箱'
				return ''
			},

			buildProfilePayload() {
				const payload = Object.assign({}, this.form)
				delete payload.certified
				delete payload.prescriptionSignEnabled
				payload.name = payload.name.trim()
				payload.phone = payload.phone.trim()
				payload.email = payload.email.trim()
				payload.hospitalName = payload.hospitalName.trim()
				payload.departmentName = payload.departmentName.trim()
				payload.title = payload.title.trim()
				payload.specialty = payload.specialty.trim()
				payload.bio = payload.bio.trim()
				return payload
			},

			syncStoredProfile(profile) {
				const stored = this.readCurrentUser()
				uni.setStorageSync('userInfo', Object.assign({}, stored, profile))
			},

			showComingSoon(name) {
				uni.showToast({ title: `${name}功能暂未开放`, icon: 'none' })
			},
			logOut() {
				uni.showModal({
					title: '提示',
					content: '确认退出登录？',
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
		}
	}
</script>
<style scoped>
	.page-doctorMine {
		background-color: #eef0f6;
		max-width: 500px;
		margin: 0 auto;
		padding: 0 30rpx;
		min-height: 100vh;
		box-sizing: border-box;
		padding-bottom: calc(120rpx + var(--safe-area-inset-bottom));
		padding-bottom: 80px;
		padding-top: calc(60rpx + var(--status-bar-height));
	}

	.page-my>.content-wrap {
		flex: 1;
	}

	.avatar {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		margin-right: 22rpx;
		border: 4rpx solid #fff;
		overflow: hidden;
		flex-shrink: 0;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
		top: 0;
		box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.12);
	}

	.avatar-male {

		background-image: url("@/static/img/maleAvatar.png");

	}

	.avatar-female {
		background-image: url("@/static/img/femaleAvatar.png");
	}

	.user-info {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.user-info .username {
		font-size: 36rpx;
		font-weight: 700;
		display: block;
		margin-bottom: 14rpx;
		color: #172033;
	}

	.user-right {
		flex: 1;
		min-width: 0;
	}

	.meta {
		font-size: 22rpx;
		color: #667085;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.badge {
		flex-shrink: 0;
		padding: 4rpx 12rpx;
		margin-right: 10rpx;
		border-radius: 8rpx;
		font-size: 20rpx;
		font-weight: 600;
		line-height: 28rpx;
		transform: none;
		box-sizing: border-box;
	}

	.name-row {
		display: flex;
		align-items: center;
	}

	.username {
		font-size: 38rpx;
		font-weight: 600;
	}


	.top-wrap {
		position: relative;
		padding: 30rpx;
		border: 1rpx solid #edf1f7;
		border-radius: 24rpx;
		background: radial-gradient(circle at top right, #eef4ff, #ffffff 68%);
		box-shadow: 0 10rpx 28rpx rgba(31, 41, 55, 0.05);
		box-sizing: border-box;
	}

	.edit-btn,
	.cancel-btn,
	.save-btn {
		height: 60rpx;
		line-height: 60rpx;
		padding: 0 26rpx;
		border-radius: 999rpx;
		font-size: 24rpx;
		font-weight: 600;
		text-align: center;
		box-sizing: border-box;
	}

	.edit-btn,
	.save-btn {
		color: #2563eb;
		background: #eaf2ff;
	}

	.cancel-btn {
		color: #667085;
		background: #f5f7fb;
		margin-right: 14rpx;
	}

	.edit-btn {
		position: absolute;
		top: 28rpx;
		right: 28rpx;
	}

	.action-group {
		position: absolute;
		top: 28rpx;
		right: 28rpx;
		display: flex;
		align-items: center;
	}

	/* 退出登录 */
	.logout-btn {
		text-align: center;
		font-size: 26rpx;
		height: 70rpx;
		margin-top: 30rpx;
		line-height: 70rpx;
		background-color: #fff;
		border-radius: 20rpx;
	}


	.card-row {
		background: #fff;
		margin: 22rpx 0 0;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 10rpx 28rpx rgba(31, 41, 55, 0.04);
		box-sizing: border-box;
	}

	.card-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 32rpx;
		font-weight: 700;
		color: #172033;
		margin-bottom: 12rpx;
	}

	.cert-tag {
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		background: #ecfdf3;
		color: #16a34a;
		font-size: 22rpx;
		font-weight: 600;
	}

	.form-item {
		display: flex;
		align-items: flex-start;
		padding: 14rpx 0;
		border-bottom: 1rpx solid #edf1f7;
	}

	.form-item:last-child {
		border-bottom: 0;
	}

	.textarea-item {
		flex-direction: column;
	}

	.label {
		width: 190rpx;
		flex-shrink: 0;
		color: #909399;
		font-size: 24rpx;
		line-height: 48rpx;
	}

	.textarea-item .label {
		width: auto;
		margin-bottom: 14rpx;
	}

	.value {
		flex: 1;
		min-width: 0;
		font-size: 26rpx;
		height: 48rpx;
		line-height: 48rpx;
		color: #172033;
	}

	input.value {
	min-width: 0;
		font-size: 26rpx;
		height: 48rpx;
		line-height: 48rpx;
		color: #172033;
	}

	textarea.value {
			font-size: 26rpx;
		width: 100%;
		min-height: 110rpx;
		padding: 12rpx 16rpx;
		background: #f8fafc;
		border-radius: 12rpx;
		box-sizing: border-box;
	}

	.btn-group {
		display: flex;
		margin: 22rpx 0 ;
		gap: 18rpx;
	}

	.func-btn {
		flex: 1;
		text-align: center;
		background: #fff;
		color: #2563eb;
		padding: 26rpx 0;
		border-radius: 18rpx;
		font-size: 25rpx;
		font-weight: 600;
		box-shadow: 0 10rpx 28rpx rgba(31, 41, 55, 0.04);
	}
.info-wrapper{
	border-radius: 18rpx;
		background: #fff;


}
	.info-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 28rpx 30rpx;
		border-bottom: 1rpx solid #edf1f7;


		box-sizing: border-box;
		font-size: 26rpx;
	}

	.left {
		flex-shrink: 0;
		color: #344054;
	}

	.right {
		min-width: 0;
		color: #98a2b3;
		text-align: right;
	}
</style>
<style>
	uni-page-body {
		overflow-x: hidden !important;
	}
</style>
