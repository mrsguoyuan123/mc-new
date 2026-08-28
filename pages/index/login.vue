<template>
	<view class="login-page">
		<view class="login-header">
			<view class=" bg-blue-dark margin-right-10">
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
			<!-- 验证码行 -->
			<view class="code-row">
				<view class="code-input-wrap">
					<u-input v-model="code" placeholder="请输入验证码" type="number" maxlength="6" border="surround" />
				</view>
				<view class="code-btn-wrap">
					<u-button :disabled="codeCountDown > 0 || !validPhone" @click="getCode" type="primary" size="small">
						{{ codeCountDown > 0 ? `${codeCountDown}s后重发` : '获取验证码' }}
					</u-button>
				</view>
			</view>



			<!-- 验证码登录 -->
			<view class=" margin-bottom-2">
				<u-button type="primary" @click="handleCodeLogin" :disabled="!canLogin">
					验证码登录
				</u-button>
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
			<u-checkbox-group v-model="isAgree" shape="circle">
				<u-checkbox  v-for="(item, index) in checkboxList1" :key="index"
					:label="item.name" :name="item.name">
				</u-checkbox>
			</u-checkbox-group>
			<view class="u-flex flex-start align-center">
				<text class="protocol-text">我已阅读并同意 </text>
				<text class="protocol-text font-blue">《用户服务协议》</text>
				<text class="protocol-text">与 </text>
				<text class="protocol-text font-blue">《隐私条款》</text>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			phone: '',
			code: '',
			codeCountDown: 0,
			isAgree: [],
			timer: null,
			checkboxList1: [{
				name: ' ',
				disabled: false
			}]
		}
	},
	computed: {
		validPhone() {
			return /^1[3-9]\d{9}$/.test(this.phone)
		},
		canLogin() {
			return this.validPhone && this.code.length === 6 && this.isAgree.length > 0
		}
	},
	methods: {
		// 统一清除定时器
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},
		// 获取验证码
		getCode() {
			if (!this.validPhone) {
				return uni.showToast({
					title: '请输入正确手机号',
					icon: 'none'
				})
			}
			console.log('发送验证码', this.phone)
			uni.showToast({
				title: '验证码已发送',
				icon: 'success'
			})
			this.codeCountDown = 60
			this.clearTimer() // 先清除旧定时器，避免叠加
			this.timer = setInterval(() => {
				this.codeCountDown--
				if (this.codeCountDown <= 0) {
					this.clearTimer()
				}
			}, 1000)
		},
		// 验证码登录
		async handleCodeLogin() {
			if (!this.isAgree.length) {
				return uni.showToast({
					title: '请同意协议',
					icon: 'none'
				})
			}
			// reLaunch跳转前手动清定时器
			this.clearTimer()

			uni.showLoading({
				title: '登录中...'
			})
			try {
				// const res = await api.login.codeLogin({phone:this.phone,code:this.code})
				// uni.setStorageSync('token', res.token)
				await new Promise(resolve => setTimeout(resolve, 800))
				uni.setStorageSync('token', 'mock-token-123456')
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/mine/mine'
					})
				}, 600)
			} catch (err) {
				uni.showToast({
					title: '登录失败，请检查验证码',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		// 一键登录
		handleOneKeyLogin() {
			if (!this.isAgree.length) {
				return uni.showToast({
					title: '请同意协议',
					icon: 'none'
				})
			}
			// 跳转前清除定时器
			this.clearTimer()
			uni.reLaunch({
				url: '/pages/index/loginFirst'
			})
		},
		// 跳注册
		goRegister() {
			this.clearTimer()
			uni.navigateTo({
				url: '/pages/index/register'
			})
		}
	},
	// H5/App端销毁
	beforeDestroy() {
		this.clearTimer()
	},
	// ✨小程序原生页面卸载钩子，uni.reLaunch也会触发，必清定时器
	onUnload() {
		this.clearTimer()
	}
}
</script>


<style scoped>
	.login-page {
		padding: 80rpx 60rpx;
		/* background-color: #f7f8fa; */
		max-width: 500px;
		min-width: 300px;
		margin: 0 auto;
	}

	.login-page .u-input {
		color: #666;
	}

	.my-input::placeholder {
		color: #999;
	}



	.login-header {
		margin-bottom: 80rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 15rpx;
	}
 
 
	.desc {
		font-size: 25rpx;
		color: #999;
		display: block;
	}

	.login-form {}

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
		/* height: 80rpx;
		line-height: 80rpx; */
		/* padding: 0 20rpx !important; */
	}

	.code-input-wrap .u-input,
	.input-item .u-input {
		/* padding: 0 20rpx !important; */
	}

	.input-item ::v-deep .u-input__content {
		/* height: 80rpx; */
	}

	/* 验证码输入框 */
	.code-input-wrap ::v-deep .u-input__content {
		width: 100% !important;
		height: 50rpx;
	}

	.code-btn-wrap {
		width: 220rpx;
		height: 80rpx;
		line-height: 80rpx;
		flex-shrink: 0;
		/* 按钮禁止压缩 */
	}

	.code-btn-wrap ::v-deep .u-button {
		margin: 0;
		height: 80rpx;
		line-height: 80rpx;
		padding: 0;
	}

	.login-btn {
		margin-bottom: 30rpx;
	}

	.onekey-btn {
		margin-bottom: 60rpx;
	}

	.register-wrap {
		display: flex;
		justify-content: center;
		gap: 10rpx;
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
		margin-top: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.protocol-text {
		font-size: 24rpx;
		/* color: #999; */
	}

	.login-header .bg-blue-dark {
		/* width: 300rpx; */
		padding: 40rpx;
		border-radius: 40rpx;
		text-align: center;
		width: 90rpx;
		margin: 0 auto;
		margin-bottom: 30rpx;
	}
</style>