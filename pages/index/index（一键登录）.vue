<template>
	<view class="login-wrap">
		<!-- 微信手机号一键登录 -->
		<button open-type="getPhoneNumber" @getphonenumber="wxPhoneLogin">
			微信手机号一键登录
		</button>

		<view class="divider" @click="showSmsLogin ='true' ">或短信验证码登录</view>

		<!-- 短信登录表单（降级方案） -->
		<view class="form" v-if="showSmsLogin">
			<view class="input-item">
				<input v-model="form.phone" type="number" placeholder="请输入手机号" maxlength="11" />
			</view>
			<view class="input-item code-row">
				<input v-model="form.code" type="number" placeholder="请输入6位验证码" maxlength="6" />
				<button class="btn-code" :disabled="codeDisabled" @click="sendCode">
					{{ codeText }}
				</button>
			</view>
			<button class="btn-login" @click="handleSmsLogin">登录</button>
		</view>
	</view>
</template>

<script>
	import {
		useUserStore
	} from '@/stores/user';

	function testFunc(params) {
		const userStore = useUserStore()

		// 设置数据
		userStore.setToken('abc123456')

		// 获取数据
		console.log(userStore.token)
	}

	// 直接调用，页面加载执行
	testFunc('我是参数')
	export default {
		data() {
			return {
				form: {
					phone: '',
					code: ''
				},
				showSmsLogin: false,
				codeText: '获取验证码',
				codeDisabled: false,
				timer: null
			}
		},
		onMounted() {
			pageinit();
		},
		onUnload() {

			if (this.timer) clearInterval(this.timer)
		},
		methods: {

			pageinit() {

			},


			// ========== 微信一键获取手机号登录 ==========
			async wxPhoneLogin(e) {
				// 用户拒绝授权
				if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
					uni.showToast({
						title: '您取消了授权，请使用短信登录',
						icon: 'none'
					})
					this.showSmsLogin = true

					return
				}
				// 没有code，授权失败
				if (!e.detail.code) {
					uni.showToast({
						title: '获取手机号失败',
						icon: 'none'
					})
					this.showSmsLogin = true
					return
				}

				uni.showLoading({
					title: '登录中'
				})
				try {
					// 将code传给自有后端解密手机号并登录
					const res = await this.$api.userApi.wxPhoneLogin({
						code: e.detail.code
					})
					uni.setStorageSync('token', res.data.token)
					uni.reLaunch({
						url: '/pages/index/index'
					})
				} catch (err) {
					console.error('微信一键登录失败', err)
					this.showSmsLogin = true
				} finally {
					uni.hideLoading()
				}
			},

			// ========== 短信登录（降级，之前封装好的） ==========
			async sendCode() {
				const phone = this.form.phone.trim()
				if (!/^1[3-9]\d{9}$/.test(phone)) {
					return uni.showToast({
						title: '请输入正确手机号',
						icon: 'none'
					})
				}
				await this.$api.userApi.sendSmsCode({
					phone
				})
				uni.showToast({
					title: '验证码已发送'
				})
				this.startCountDown()
			},
			startCountDown() {
				let time = 60
				this.codeDisabled = true
				this.codeText = `${time}s后重发`
				this.timer = setInterval(() => {
					time--
					if (time <= 0) {
						clearInterval(this.timer)
						this.codeDisabled = false
						this.codeText = '获取验证码'
					} else {
						this.codeText = `${time}s后重发`
					}
				}, 1000)
			},
			async handleSmsLogin() {
				const {
					phone,
					code
				} = this.form
				if (!/^1[3-9]\d{9}$/.test(phone)) {
					return uni.showToast({
						title: '请输入正确手机号',
						icon: 'none'
					})
				}
				if (!code || code.length !== 6) {
					return uni.showToast({
						title: '请输入6位验证码',
						icon: 'none'
					})
				}
				const res = await this.$api.userApi.smsLogin({
					phone,
					code
				})
				uni.setStorageSync('token', res.data.token)
				uni.reLaunch({
					url: '/pages/index/index'
				})
			}
		}
	}
</script>

<style scoped>
	.login-wrap {
		padding: 40rpx;
	}

	button {
		margin: 20rpx 0;
		background: #07C160;
		color: #fff;
	}

	.divider {
		text-align: center;
		color: #999;
		margin: 30rpx 0;
	}

	.input-item {
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.code-row {
		display: flex;
		align-items: center;
	}

	.code-row input {
		flex: 1;
	}

	.btn-code {
		width: 200rpx;
		background: #eee;
		color: #333;
		margin: 0;
	}

	button[disabled] {
		background: #ccc !important;
	}
</style>