<template>
	<view class="login-page">
		<view class="login-header">
			<view class="bg-blue-dark margin-right-10">
				<text class="custom-icon custom-icon-stethoscope icon-bold" style="font-size:80rpx;color:#ffff;"></text>
			</view>
			<text class="title text-center">术后康复管理</text>
			<text class="desc text-center">链接医生与患者的康复桥梁</text>
		</view>
		<view class="login-form">
			<!-- 手机号 -->
			<view class="input-item">
				<u-input v-model="phone" placeholder="请输入手机号" type="number" maxlength="11" border="surround" />
			</view>

			<!-- 密码登录输入框 -->
			<view class="input-item" v-show="isPwdLogin">
				<u-input v-model="password" placeholder="请输入密码" type="password" border="surround" />
			</view>

			<!-- 密码登录按钮 -->
			<view class="margin-bottom-2" v-show="isPwdLogin">
				<u-button type="primary" @click="handleLogin" :disabled="!canLogin">
					密码登录
				</u-button>
			</view>

			<!-- 验证码登录行 -->
			<view class="code-row" v-show="!isPwdLogin">
				<view class="code-input-wrap">
					<u-input v-model="code" placeholder="请输入验证码" type="number" maxlength="6" border="surround" />
				</view>
				<view class="code-btn-wrap">
					<u-button :disabled="codeCountDown > 0 || !validPhone" @click="getCode" type="primary" size="small">
						{{ codeCountDown > 0 ? `${codeCountDown}s后重发` : '获取验证码' }}
					</u-button>
				</view>
			</view>

			<!-- 验证码登录按钮 -->
			<view class="margin-bottom-2" v-show="!isPwdLogin">
				<u-button type="primary" @click="handleLogin" :disabled="!canLogin">
					验证码登录
				</u-button>
			</view>

			<!-- 切换登录方式【修复：v-if/v-else 放在相邻 view 上】 -->
			<view class="register-wrap margin-bottom-2" v-if="isPwdLogin">
				<text class="tip">收不到验证码？</text>
				<text class="register-text" @click="switchLoginMode">验证码登录</text>
			</view>
			<view class="register-wrap margin-bottom-2" v-else>
				<text class="tip">忘记密码？</text>
				<text class="register-text" @click="goForgetPwd">密码登录</text>
			</view>

			<!-- 一键登录 -->
			<view class="margin-bottom-2">
				<u-button type="info" @click="handleOneKeyLogin">一键登录</u-button>
			</view>

			<!-- 跳转注册 -->
			<view class="register-wrap">
				<text class="tip">还没有账号？</text>
				<text class="register-text" @click="goRegister">去注册</text>
			</view>
		</view>

		<!-- 协议提示 -->
		<view class="protocol">
			<u-checkbox-group v-model="checkArr">
				<u-checkbox name="agree" shape="circle"></u-checkbox>
			</u-checkbox-group>
			<view class="u-flex flex-start align-center">
				<text class="protocol-text">我已阅读并同意 </text>
				<text class="protocol-text font-blue" @click="openUserAgreement">《用户服务协议》</text>
				<text class="protocol-text">与 </text>
				<text class="protocol-text font-blue" @click="openPrivacy">《隐私条款》</text>
			</view>
		</view>
	</view>
</template>


<script>
	import {
		authLogin,
		authSmsCode,
		authSmsLogin,
		authWxLogin,
		getAuthMe,
		authLogout
	} from '@/api/auth'
	export default {
		data() {
			return {
				phone: '',
				password: '',
				isPwdLogin: true,
				code: '',
				codeCountDown: 0,
				// isAgree: false, // 删除旧布尔变量
				checkArr: [], // checkbox-group绑定数组，选中会存入name:"agree"
				timer: null
			}
		},
		computed: {
			validPhone() {
				return /^1[3-9]\d{9}$/.test(this.phone)
			},
			canLogin() {
				if (!this.validPhone) return false
				// 数组包含agree代表勾选协议
				const isAgree = this.checkArr.includes('agree')
				if (!isAgree) return false

				if (this.isPwdLogin) {
					return !!this.password
				} else {
					return this.code.length === 6
				}
			}
		},
		methods: {
			// 切换登录模式，清空输入、清除倒计时
			switchLoginMode() {
				this.isPwdLogin = !this.isPwdLogin
				if (this.isPwdLogin) {
					this.code = ''
					this.clearTimer()
				} else {
					this.password = ''
				}
			},

			// 忘记密码页面
			// goForgetPwd() {
			// 	this.clearTimer()
			// 	uni.navigateTo({
			// 		url: '/pages/index/forgetPwd'
			// 	})
			// },

			async getCode() {
				if (!this.validPhone) {
					return uni.showToast({
						title: '请输入正确手机号',
						icon: 'none'
					})
				}
				try {
					await authSmsCode({
						phone: this.phone
					})
					uni.showToast({
						title: '验证码已发送',
						icon: 'success'
					})
					this.codeCountDown = 60
					this.clearTimer()
					this.timer = setInterval(() => {
						this.codeCountDown--
						if (this.codeCountDown <= 0) {
							this.clearTimer()
						}
					}, 1000)
				} catch (err) {
					console.error('获取验证码失败：', err)
				}
			},

			// 统一登录入口：密码 / 验证码两套逻辑
			async handleLogin() {
				if (!this.checkArr.includes('agree')) {
					return uni.showToast({
						title: '请同意协议',
						icon: 'none'
					})
				}
				if (!this.phone) {
					return uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
				}
				this.clearTimer()
				uni.showLoading({
					title: '登录中...',
					mask: true
				})
				try {
					let res
					if (this.isPwdLogin) {
						// 密码登录 员工登录接口 authLogin
						res = await authLogin({
							phone: this.phone,
							password: this.password
						})
					} else {
						// 验证码登录
						if (!this.code || this.code.length !== 6) {
							uni.hideLoading()
							return uni.showToast({
								title: '请输入6位验证码',
								icon: 'none'
							})
						}
						res = await authSmsLogin({
							phone: this.phone,
							code: this.code
						})
					}
					uni.setStorageSync('token', res.data.token)
					uni.setStorageSync('refreshToken', res.data.refreshToken)
					await getAuthMe()
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
					// setTimeout(() => {
					// 	uni.reLaunch({
					// 		url: '/pages/mine/mine'
					// 	})
					// }, 500)
				} catch (err) {
					console.error('登录异常', err)
					uni.showToast({
						title: '登录失败，请检查信息',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},

			handleOneKeyLogin() {
				if (!this.checkArr.includes('agree')) {
					return uni.showToast({
						title: '请同意协议',
						icon: 'none'
					})
				}
				this.clearTimer()
				uni.reLaunch({
					url: '/pages/index/loginFirst'
				})
			},
			goRegister() {
				this.clearTimer()
				let routeUrl = '/pages/index/register'
				this.$safeJump(routeUrl)
			},


			async logout() {
				try {
					await authLogout()
				} catch (e) {
					console.warn('登出后端通知失败，继续清理本地', e)
				} finally {
					uni.removeStorageSync('token')
					uni.removeStorageSync('refreshToken')
					uni.reLaunch({
						url: '/pages/index/login'
					})
				}
			},

			openUserAgreement() {

				let routeUrl = '/pages/index/user'
				this.$safeJump(routeUrl)
			},
			openPrivacy() {

				let routeUrl = '/pages/index/privacy'
				this.$safeJump(routeUrl)
			},

			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			}
		},
		beforeDestroy() {
			this.clearTimer()
		},
		onUnload() {
			this.clearTimer()
			// 新增：卸载清空输入框，切断u‑input组件回调
			this.phone = ''
			this.password = ''
			this.code = ''
		}
	}
</script>

<style scoped>
	.login-page {
		padding: 80rpx 60rpx;
		max-width: 500px;
		min-width: 300px;
		margin: 0 auto;
	}

	.login-header {
		margin-bottom: 80rpx;
	}

	.bg-blue-dark {
		padding: 40rpx;
		border-radius: 40rpx;
		text-align: center;
		width: 90rpx;
		margin: 0 auto 30rpx auto;
		background-color: #155dfc;
	}

	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 15rpx;
		text-align: center;
	}

	.desc {
		font-size: 25rpx;
		color: #999;
		display: block;
		text-align: center;
	}

	.input-item {
		margin-bottom: 30rpx;
	}

	.code-row {
		display: flex;
		width: 100%;
		gap: 20rpx;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.code-input-wrap {
		flex: 1;
	}

	.code-btn-wrap {
		width: 220rpx;
		flex-shrink: 0;
	}

	.register-wrap {
		display: flex;
		justify-content: center;
		gap: 10rpx;
		margin-top: 20rpx;
	}

	.tip {
		font-size: 28rpx;
		color: #666;
	}

	.register-text {
		font-size: 28rpx;
		color: #155dfc;
	}

	.protocol {
		margin-top: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.protocol-text {
		font-size: 24rpx;
		color: #666;
	}

	.font-blue {
		color: #155dfc;
	}
</style>