<template>
    <view class="login-page">
        <view v-if="stage === 'oneKey'" class="one-key-page">
            <view class="one-key-card">
                <view class="app-logo"><u-icon name="phone-fill" color="#fff" size="46"></u-icon></view>
                <view class="app-name">术后康复管理</view>
                <button class="primary-btn" :disabled="loginLoading" @click="handleOneKeyLogin">本机号码一键登录</button>
                <view class="code-login" @click="enterSmsLogin">验证码登录</view>
            </view>
            <view class="agreement bottom-agreement">
                <view class="check-box" :class="{ checked: agreed }" @click.stop="toggleAgreement">
                    <u-icon v-if="agreed" name="checkmark" color="#fff" size="12"></u-icon>
                </view>
                <view class="agreement-text" @click="openAgreementOnly">
                    <text>我已阅读并同意</text><text class="agreement-link">《用户协议》</text><text>和</text><text class="agreement-link">《隐私政策》</text>
                </view>
            </view>
        </view>

        <view v-else class="form-page">
            <view class="login-card">
                <view class="tabs">
                    <view class="tab-item" :class="{ active: loginMode === 'sms' }" @click="switchMode('sms')">短信登录</view>
                    <view class="tab-item" :class="{ active: loginMode === 'password' }" @click="switchMode('password')">密码登录</view>
                </view>
                <view v-if="loginMode === 'sms'" class="form-panel">
                    <view class="field-row"><u-icon name="phone" color="#20a464" size="22"></u-icon><u-input v-model="phone" type="number" maxlength="11" border="none" placeholder="请输入手机号" placeholderStyle="color:#a8abb2" :customStyle="{ paddingLeft: '12rpx' }"></u-input></view>
                    <view class="field-row code-field"><u-icon name="lock" color="#20a464" size="22"></u-icon>
                        <u-input v-model="code" type="number" maxlength="6" border="none" placeholder="请输入验证码" placeholderStyle="color:#a8abb2" :customStyle="{ paddingLeft: '12rpx' }"></u-input><view class="send-code" :class="{ disabled: codeCountDown > 0 || smsSending }" @click="getCode">{{ codeCountDown > 0 ? codeCountDown + 's后重发' : '获取验证码' }}</view></view>
                    <button class="primary-btn login-btn" :disabled="loginLoading" @click="submitLogin">登录</button>
                    <view class="forgot-password" @click="forgotPassword">返回一键登录</view>
                </view>
                <view v-else class="form-panel">
                    <view class="field-row"><u-icon name="account" color="#20a464" size="22"></u-icon><u-input v-model="username" border="none" placeholder="请输入账号" placeholderStyle="color:#a8abb2" :customStyle="{ paddingLeft: '12rpx' }"></u-input></view>
                    <view class="field-row"><u-icon name="lock" color="#20a464" size="22"></u-icon><u-input v-model="password" password border="none" placeholder="请输入密码" placeholderStyle="color:#a8abb2" :customStyle="{ paddingLeft: '12rpx' }"></u-input></view>
                    <button class="primary-btn login-btn" :disabled="loginLoading" @click="submitLogin">登录</button>
                    <view class="forgot-password" @click="forgotPassword">返回一键登录</view>
                </view>
            </view>
            <view class="agreement form-agreement">
                <view class="check-box" :class="{ checked: agreed }" @click.stop="toggleAgreement"><u-icon v-if="agreed" name="checkmark" color="#fff" size="12"></u-icon></view>
                <view class="agreement-text" @click="openAgreementOnly"><text>已阅读并同意</text><text class="agreement-link">《用户协议》</text><text>和</text><text class="agreement-link">《隐私政策》</text></view>
            </view>
        </view>

        <view v-if="showAgreement" class="modal-mask">
            <view class="agreement-modal">
                <view class="modal-title">服务协议及隐私保护</view>
                <scroll-view scroll-y class="modal-body">
                    <view class="modal-section-title">一、用户协议</view>
                    <view class="modal-paragraph">欢迎使用术后康复管理服务。请您在注册和登录前仔细阅读<text class="modal-link">《用户协议》</text>。您点击“同意并注册”后，即可使用手机号验证码或账号密码登录平台。</view>
                    <view class="modal-paragraph">1. 平台为患者、医生、客服、驻点及医院管理人员提供康复随访、病历查看、复诊预约、在线沟通等服务，具体功能以您实际开通的角色权限为准。</view>
                    <view class="modal-paragraph">2. 您应保证注册、登录及使用服务时提交的信息真实、准确、完整，不得冒用他人手机号、账号或身份信息。</view>
                    <view class="modal-paragraph">3. 您应妥善保管账号、密码、短信验证码及登录设备，不应将验证码、账号密码提供给他人使用。因主动泄露或保管不当造成的损失，由您自行承担。</view>
                    <view class="modal-paragraph">4. 使用平台服务时，您应遵守法律法规和医疗服务秩序，不得发布违法违规内容，不得侵犯他人隐私，不得干扰系统正常运行。</view>
                    <view class="modal-paragraph">5. 平台会根据服务需要对登录状态、操作记录、访问权限进行安全校验和留痕管理，以保障账号与医疗数据安全。</view>
                    <view class="modal-section-title">二、隐私政策</view>
                    <view class="modal-paragraph">请您同时仔细阅读<text class="modal-link">《隐私政策》</text>。我们重视您的个人信息和敏感个人信息保护。</view>
                    <view class="modal-paragraph">1. 为完成注册登录、身份识别、康复管理、服务沟通和安全验证，我们会收集您的手机号码、账号信息、姓名、病历资料、康复记录、预约信息以及必要的设备和网络信息。</view>
                    <view class="modal-paragraph">2. 病历、诊断、手术、康复情况等信息属于敏感个人信息。我们仅在提供医疗健康服务所必需的最小范围内收集和使用，并采取权限控制、身份校验、安全传输、操作留痕等措施进行保护。</view>
                    <view class="modal-paragraph">3. 未经您的同意，我们不会向无关第三方共享您的个人信息；但法律法规另有规定、医疗服务所必需，或为保护生命健康安全所必需的情形除外。</view>
                    <view class="modal-paragraph">4. 您可以依法查询、更正、补充、删除自己的个人信息，也可以申请注销账号或撤回授权。账号注销后，我们将按照法律法规要求处理或删除相关信息。</view>
                    <view class="modal-paragraph">5. 如您不同意相关内容，将无法完成注册、登录及使用相关服务；您点击“不同意”将停留在当前页面。</view>
                </scroll-view>
                <view class="modal-actions">
                    <button class="modal-btn disagree-btn" @click="disagreeAgreement">不同意</button>
                    <button class="modal-btn agree-btn" @click="agreeAgreement">同意并注册</button>
                </view>
            </view>
        </view>
    </view>
</template>
<script>
import { postAuthSmsCodeApi, postAuthSmsLoginApi, postAuthLoginApi, postAuthWxLoginApi } from '@/api/frontApikit.js'
export default {
    data() {
        return { stage: 'oneKey', loginMode: 'sms', phone: '', code: '', username: '', password: '', agreed: false, showAgreement: false, pendingAction: '', codeCountDown: 0, timer: null, loginLoading: false, smsSending: false }
    },
    computed: {
        validPhone() { return /^1[3-9]\d{9}$/.test(String(this.phone).trim()) }
    },
    beforeDestroy() { this.clearTimer() },
    onUnload() { this.clearTimer() },
    methods: {
        switchMode(mode) {
            this.loginMode = mode
        },
        enterSmsLogin() {
            this.stage = 'form'
            this.loginMode = 'sms'
        },
        toggleAgreement() {
            this.agreed = !this.agreed
        },
        openAgreementOnly() {
            this.pendingAction = ''
            this.showAgreement = true
        },
        disagreeAgreement() {
            this.showAgreement = false
            this.pendingAction = ''
        },
        agreeAgreement() {
            this.agreed = true
            this.showAgreement = false
            const action = this.pendingAction
            this.pendingAction = ''
            this.$nextTick(() => {
                if (action === 'oneKey') {
                    this.wxLogin()
                } else if (action === 'login') {
                    this.submitLogin()
                }
            })
        },
        handleOneKeyLogin() {
            if (this.loginLoading) return
            if (!this.agreed) {
                this.pendingAction = 'oneKey'
                this.showAgreement = true
                return
            }
            // 一键登录直接走wxLogin，不执行表单校验validateForm
            this.wxLogin()
        },
        wxLogin() {
            if (this.loginLoading) return
            this.loginLoading = true
            uni.showLoading({ title: '登录中...', mask: true })
            uni.login({
                provider: 'weixin',
                success: async (res) => {
                    try {
                        const result = await postAuthWxLoginApi({ code: res.code })
                        this.saveLoginResult(result)
                        uni.showToast({ title: '登录成功', icon: 'success' })
                        setTimeout(() => {
                            this.redirectByRole(result)
                        }, 300)
                    } catch (err) {
                        console.log('微信登录失败：', err)
                    } finally {
                        this.loginLoading = false
                        uni.hideLoading()
                    }
                },
                fail: (err) => {
                    console.log('uni.login失败', err)
                    this.loginLoading = false
                    uni.hideLoading()
                }
            })
        },
        forgotPassword() {
            this.stage = 'oneKey'
        },
        showTip(title) {
            uni.showToast({ title, icon: 'none' })
        },
        validateForm() {
            if (this.loginMode === 'password') {
                if (!String(this.username).trim()) {
                    this.showTip('请输入账号')
                    return false
                }
                if (!String(this.password).trim()) {
                    this.showTip('请输入密码')
                    return false
                }
                return true
            }
            if (!String(this.phone).trim()) {
                this.showTip('请输入手机号')
                return false
            }
            if (!this.validPhone) {
                this.showTip('请输入正确手机号')
                return false
            }
            if (!String(this.code).trim()) {
                this.showTip('请输入验证码')
                return false
            }
            if (!/^\d{6}$/.test(String(this.code).trim())) {
                this.showTip('请输入6位数字验证码')
                return false
            }
            return true
        },
        async getCode() {
            if (this.smsSending || this.codeCountDown > 0) return
            if (!String(this.phone).trim()) {
                this.showTip('请输入手机号')
                return
            }
            if (!this.validPhone) {
                this.showTip('请输入正确手机号')
                return
            }
            // 获取验证码不校验协议，不弹窗
            this.smsSending = true
            try {
                await postAuthSmsCodeApi({ phone: String(this.phone).trim() })
                this.showTip('验证码已发送')
                this.startCountDown()
            } catch (err) {
                console.log('获取验证码失败：', err)
                this.showTip('验证码发送失败，请稍后重试')
            } finally {
                this.smsSending = false
            }
        },
        startCountDown() {
            this.clearTimer()
            this.codeCountDown = 60
            this.timer = setInterval(() => {
                this.codeCountDown -= 1
                if (this.codeCountDown <= 0) this.clearTimer()
            }, 1000)
        },
        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
            this.codeCountDown = Math.max(this.codeCountDown, 0)
        },
        submitLogin() {
            if (this.loginLoading) return
            if (!this.validateForm()) return
            if (!this.agreed) {
                this.pendingAction = 'login'
                this.showAgreement = true
                return
            }
            this.handleLogin()
        },
        async handleLogin() {
            let result
            this.loginLoading = true
            uni.showLoading({ title: '登录中...', mask: true })
            try {
                if (this.loginMode === 'password') {
                    result = await postAuthLoginApi({
                        username: String(this.username).trim(),
                        password: String(this.password).trim()
                    })
                } else {
                    result = await postAuthSmsLoginApi({
                        phone: String(this.phone).trim(),
                        code: String(this.code).trim()
                    })
                }
                this.saveLoginResult(result)
                uni.showToast({ title: '登录成功', icon: 'success' })
                setTimeout(() => {
                    this.redirectByRole(result)
                }, 300)
            } catch (err) {
                console.log('登录失败：', err)
            } finally {
                this.loginLoading = false
                uni.hideLoading()
            }
        },
        saveLoginResult(result) {
            const data = result || {}
            const token = data.accessToken || data.token || ''
            const refreshToken = data.refreshToken || ''
            const user = data.user || data.userInfo || {}
            if (token) uni.setStorageSync('accessToken', token)
            if (refreshToken) uni.setStorageSync('refreshToken', refreshToken)
            uni.setStorageSync('userInfo', JSON.stringify(user))
        },
        redirectByRole(result) {
            const data = result || {}
            const user = data.user || data.userInfo || {}
            const role = data.role || user.role
            const roleUrlMap = {
                PATIENT: '/pages/index/home',
                CS: '/pages/index/workBench',
                CAREGIVER: '/pages/index/caregiverIndex',
                DOCTOR: '/pages/index/doctorIndex', 
            }
            const url = roleUrlMap[role];
            console.log(url)
            if (!url) {
                this.showTip('当前角色暂未配置入口')
                return
            }
            uni.reLaunch({ url })
        }
    }
}
</script>
<style scoped>
.login-page {
    min-height: 100vh;
    background-image: url("/static/img/login.jpeg");
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    box-sizing: border-box;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
}

.one-key-page,
.form-page {
    position: relative;
    min-height: 100vh;
    box-sizing: border-box;
    padding: 400rpx 40rpx ;
}

.page-title {
    color: #ffffff;
    font-size: 44rpx;
    font-weight: 700;
    line-height: 64rpx;
}

.one-key-card {
    margin: 0 36rpx;
    padding: 58rpx 50rpx 78rpx;
    border-radius: 22rpx;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}

.app-logo {
    width: 112rpx;
    height: 112rpx;
    margin: 0 auto 12rpx;
    border-radius: 26rpx;
    background: #18b98c;
    display: flex;
    align-items: center;
    justify-content: center;
}

.app-name {
    text-align: center;
    color: #19a87c;
    font-size: 26rpx;
    line-height: 38rpx;
}

.mask-phone {
    margin-top: 56rpx;
    text-align: center;
    color: #111827;
    font-size: 44rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
}

.carrier-name {
    margin-top: 16rpx;
    text-align: center;
    color: #8b8f99;
    font-size: 26rpx;
}

.primary-btn {
    width: 100%;
    height: 88rpx;
    margin: 48rpx 0 0;
    padding: 0;
    border: 0;
    border-radius: 20rpx;
    background: #18bd95;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 88rpx;
}

.primary-btn::after,
.modal-btn::after {
    border: none;
}

.primary-btn[disabled] {
    background: #76d4ba;
    color: rgba(255, 255, 255, 0.88);
}

.code-login {
    margin-top: 38rpx;
    text-align: right;
    color: #5f9d88;
    font-size: 28rpx;
}

.agreement {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    line-height: 38rpx;
}

.bottom-agreement {
    position: absolute;
    left: 44rpx;
    right: 44rpx;
    bottom: calc(48rpx + constant(safe-area-inset-bottom));
    bottom: calc(48rpx + env(safe-area-inset-bottom));
    align-items: flex-start;
}

.form-agreement {
    margin: 34rpx 40rpx 0;
    color: #60646b;
}

.check-box {
    width: 30rpx;
    height: 30rpx;
    margin: 4rpx 12rpx 0 0;
    border: 2rpx solid rgba(0, 0, 0, 0.9);
    border-radius: 6rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.form-agreement .check-box {
    border-color: #9ca3af;
}

.check-box.checked {
    border-color: #18bd95;
    background: #18bd95;
}

.agreement-text {
    flex: 1;
}

.agreement-link {
    color: #73f0c8;
}

.form-agreement .agreement-link,
.modal-link {
    color: #14b992;
}

.form-page {
    padding: 400rpx 40rpx ;
}

.login-card {
    padding: 40rpx 30rpx ;
    border-radius: 24rpx;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.10);
    box-sizing: border-box;
}

.tabs {
    height: 82rpx;
    margin-bottom: 36rpx;
    border-radius: 18rpx;
    background: #eef2f5;
    display: flex;
    overflow: hidden;
}

.tab-item {
    flex: 1;
    height: 82rpx;
    border-radius: 18rpx;
    color: #777e88;
    font-size: 28rpx;
    line-height: 82rpx;
    text-align: center;
}

.tab-item.active {
    background: #18bd95;
    color: #ffffff;
    font-weight: 600;
}

.form-panel {
    padding-top: 8rpx;
}

.field-row {
    height: 86rpx;
    margin-bottom: 28rpx;
    padding: 0 24rpx;
    border-radius: 18rpx;
    background: #f3f6f8;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

.field-row ::v-deep .u-input {
    flex: 1;
}

.code-field {
    padding-right: 18rpx;
}

.send-code {
    padding-left: 20rpx;
    border-left: 2rpx solid #d8dee5;
    color: #17aa82;
    font-size: 26rpx;
    white-space: nowrap;
}

.send-code.disabled {
    color: #9aa1aa;
}

.login-btn {
    margin-top: 42rpx;
    border-radius: 44rpx;
}

.forgot-password {
    margin-top: 26rpx;
    text-align: right;
    color: #7b8088;
    font-size: 26rpx;
    
}

.modal-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.58);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48rpx;
    box-sizing: border-box;
}

.agreement-modal {
    width: 100%;
    max-height: 78vh;
    padding: 38rpx 34rpx 34rpx;
    border-radius: 24rpx;
    background: #ffffff;
    box-sizing: border-box;
}

.modal-title {
    display: block;
    margin-bottom: 28rpx;
    color: #30343b;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 48rpx;
    text-align: center;
}

.modal-body {
    max-height: 56vh;
}

.modal-section-title {
    margin: 20rpx 0 12rpx;
    color: #1f2937;
    font-size: 28rpx;
    font-weight: 600;
    line-height: 42rpx;
}

.modal-paragraph {
    margin-bottom: 12rpx;
    color: #4b5563;
    font-size: 26rpx;
    line-height: 42rpx;
    text-align: justify;
}

.modal-actions {
    display: flex;
    margin-top: 30rpx;
}

.modal-btn {
    flex: 1;
    height: 82rpx;
    margin: 0;
    padding: 0;
    border-radius: 42rpx;
    font-size: 28rpx;
    line-height: 82rpx;
}

.disagree-btn {
    margin-right: 24rpx;
    border: 2rpx solid #18bd95;
    background: #ffffff;
    color: #18bd95;
}

.agree-btn {
    border: 0;
    background: #18bd95;
    color: #ffffff;
}
</style>
