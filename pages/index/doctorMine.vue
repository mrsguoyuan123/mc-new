<template>
    <view class="doctor-profile-page">
        <myTabbar :current="2"></myTabbar>

        <!-- 顶部操作栏 -->
        <view class="header-action">
            <view class="title">个人中心 <text class="tag">医生工作台</text></view>
            <view v-if="!isEdit" class="edit-btn" @click="isEdit = true">编辑资料</view>
            <view v-else class="action-group">
                <view class="cancel-btn" @click="cancelEdit">取消</view>
                <view class="save-btn" @click="saveProfile">保存</view>
            </view>
        </view>

        <!-- 头像+姓名区域 -->
        <view class="profile-head">
            <view class="avatar-wrap">
                <view class="avatar">👨‍⚕️</view>
                <view v-if="isEdit" class="camera">📷</view>
            </view>
            <view class="name">{{ form.name }} <text class="title-text">{{ form.title }}</text></view>
            <view class="hospital">{{ form.hospitalName }}</view>
        </view>

        <!-- 执业档案卡片 -->
        <view class="card">
            <view class="card-title">
                <text>医生临床执业档案</text>
                <view class="cert-tag" v-if="form.certified">院内已认证</view>
            </view>

            <view class="form-item">
                <view class="label">性别</view>
                <picker v-if="isEdit" mode="selector" :range="['男','女']" v-model="form.gender">
                    <view class="value">{{ form.gender || '请选择' }}</view>
                </picker>
                <view v-else class="value">{{ form.gender || '-' }}</view>
            </view>
            <view class="form-item">
                <view class="label">联系手机</view>
                <input v-if="isEdit" class="value" v-model="form.phone" type="number" placeholder="手机号"/>
                <view v-else class="value">{{ form.phone || '-' }}</view>
            </view>
            <view class="form-item">
                <view class="label">院内邮箱</view>
                <input v-if="isEdit" class="value" v-model="form.email" placeholder="院内邮箱"/>
                <view v-else class="value">{{ form.email || '-' }}</view>
            </view>
            <view class="form-item">
                <view class="label">所属医院</view>
                <input v-if="isEdit" class="value" v-model="form.hospitalName" placeholder="医院"/>
                <view v-else class="value">{{ form.hospitalName || '-' }}</view>
            </view>
            <view class="form-item">
                <view class="label">所属科室</view>
                <input v-if="isEdit" class="value" v-model="form.departmentName" placeholder="科室"/>
                <view v-else class="value">{{ form.departmentName || '-' }}</view>
            </view>
            <view class="form-item">
                <view class="label">职称 / 职务</view>
                <input v-if="isEdit" class="value" v-model="form.title" placeholder="职称"/>
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

        <!-- 底部功能按钮 -->
        <view class="btn-group">
            <view class="func-btn">科室通知</view>
            <view class="func-btn">安全设置</view>
            <view class="func-btn">使用指引</view>
        </view>

        <view class="info-line">
            <view class="left">切换当前身份</view>
            <view class="right">体验医助、陪诊师等视角 ></view>
        </view>
        <view class="info-line">
            <view class="left">电子处方签名权限</view>
            <view class="right">{{ form.prescriptionSignEnabled === 1 ? '已激活' : '未激活' }} ></view>
        </view>
        <view class="info-line">
            <view class="left">版本与环境</view>
            <view class="right">v2.4.0 (Prod)</view>
        </view>

        <view class="logout-btn" @click="logOut">退出医生工作台</view>
    </view>
</template>

<script>
import myTabbar from "@/components/myTabbar";
import { getDoctorProfileApi, putDoctorProfileApi, postDoctorPatientsByIdAttachmentsApi,postAuthLogoutApi} from '@/api/frontApikit.js'

export default {
    components: {
        myTabbar
    },
    data() {
        return {
			logoutLoading: false,
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
            }
        }
    },
    onLoad() {
        this.getDoctorProfile()
    },
    methods: {
        // 获取医生资料
        async getDoctorProfile() {
            const res = await getDoctorProfileApi({ id: 501 })
            console.log('医生信息', res)
              this.form = res
                this.originForm = JSON.parse(JSON.stringify(this.form))
        },
        // 保存
        async saveProfile() {

            const res = await putDoctorProfileApi(this.form)
            uni.showToast({ title: '保存成功' })
            this.isEdit = false
            this.originForm = JSON.parse(JSON.stringify(this.form))
        },
        // 取消编辑，回滚数据
        cancelEdit() {
            this.form = JSON.parse(JSON.stringify(this.originForm))
            this.isEdit = false
        },
        async postDoctorPatientsByIdAttachments(id) {
            const res = await postDoctorPatientsByIdAttachmentsApi({ id: 501 })
            console.log('附件上传接口', res)
        },
        toggle(key) {
            // 如果后续需要展开收起，在data增加 show:{}
            this.show[key] = !this.show[key]
        },
        viewFile(item) {
            uni.showToast({ title: '打开:' + item.name })
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
    
    }
}
</script>

<style scoped>
.doctor-profile-page {
    padding-bottom: 120rpx;
    background-color: #f7f8fa;
}
.header-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
}
.title {
    font-size: 36rpx;
    font-weight: bold;
}
.tag {
    color: #3678f2;
    font-size: 24rpx;
    margin-left: 12rpx;
}
.edit-btn, .save-btn {
    color: #3678f2;
}
.cancel-btn {
    color: #666;
    margin-right: 24rpx;
}
.action-group {
    display: flex;
}
.profile-head {
    text-align: center;
    padding: 32rpx;
}
.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #406eff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    font-size: 48rpx;
    position: relative;
}
.camera {
    position: absolute;
    bottom: 0;
    right: -10rpx;
    background: #fff;
    border-radius: 50%;
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
}
.name {
    font-size: 40rpx;
    font-weight: bold;
    margin-top: 16rpx;
}
.hospital {
    color: #888;
    font-size: 26rpx;
    margin-top: 8rpx;
}
.card {
    background: #fff;
    margin: 0 32rpx 24rpx;
    border-radius: 20rpx;
    padding: 32rpx;
}
.card-title {
    display: flex;
    justify-content: space-between;
    font-size: 30rpx;
    font-weight: 500;
    margin-bottom: 32rpx;
}
.cert-tag {
    color: #39b54a;
    font-size: 24rpx;
}
.form-item {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
}
.textarea-item {
    flex-direction: column;
}
.label {
    width: 180rpx;
    color: #666;
    font-size: 28rpx;
}
.value {
    flex: 1;
    font-size: 28rpx;
}
textarea.value {
    min-height: 120rpx;
}
.btn-group {
    display: flex;
    margin: 0 32rpx;
    gap: 20rpx;
}
.func-btn {
    flex: 1;
    text-align: center;
    background: #f0f5ff;
    color: #3678f2;
    padding: 32rpx 0;
    border-radius: 16rpx;
}
.info-line {
    display: flex;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #eee;
    background: #fff;
    margin: 16rpx 32rpx;
    border-radius: 12rpx;
}
.right {
    color: #888;
}
.logout-btn {
    margin: 40rpx 32rpx;
    text-align: center;
    color: #f53f3f;
    border: 1rpx solid #f53f3f;
    border-radius: 50rpx;
    padding: 24rpx 0;
}
</style>
