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
			<view v-show="isPwdLogin">
				<view class="input-item">
					<u-input v-model="username" placeholder="请输入用户名" border="surround" />
				</view>

				<!-- 密码登录输入框 -->
				<view class="input-item">
					<u-input v-model="password" placeholder="请输入密码" type="password" border="surround" />
				</view>
				<!-- 密码登录按钮 -->
				<view class="margin-bottom-2" v-show="isPwdLogin">
					<u-button type="primary" @click="handleLogin" :disabled="!canLogin">
						密码登录
					</u-button>
				</view>
			</view>
			<view v-show="!isPwdLogin">
				<!-- 手机号 -->
				<view class="input-item">
					<u-input v-model="phone" placeholder="请输入手机号" type="number" maxlength="11" border="surround" />
				</view>

				<!-- 验证码登录行 -->
				<view class="code-row">
					<view class="code-input-wrap">
						<u-input v-model="code" placeholder="请输入验证码" type="number" maxlength="6" border="surround" />
					</view>
					<view class="code-btn-wrap">
						<u-button :disabled="codeCountDown > 0 || !validPhone" @click="getCode" type="primary"
							size="small">
							{{ codeCountDown > 0 ? `${codeCountDown}s后重发` : '获取验证码' }}
						</u-button>
					</view>
				</view>

			</view>

			<!-- 验证码登录按钮 -->
			<view class="margin-bottom-2" v-show="!isPwdLogin">
				<u-button type="primary" @click="handleLogin" :disabled="!canLogin">
					验证码登录
				</u-button>
			</view>

			<view class="register-wrap margin-bottom-2" v-if="isPwdLogin">
				<text class="tip">忘记密码？</text>
				<text class="register-text" @click="switchLoginMode">验证码登录</text>
			</view>
			<view class="register-wrap margin-bottom-2" v-else>
				<!-- <text class="tip">忘记密码？</text> -->
				<text class="register-text" @click="switchLoginMode">密码登录</text>
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
//用户名密码，发送验证码，
import { postAuthLoginApi,postAuthRegisterApi,getAuthMeApi } from '@/api/frontApikit.js'
	export default {
		data() {
			return {
				username: 'admin2',
				password: '1',
				isPwdLogin: true,
				phone: '18841452206',
				code: '',
				codeCountDown: 0,
				checkArr: [], // checkbox-group绑定数组，选中会存入name:"agree"
				timer: null
			}
		},
		computed: {
			validPhone() {
				return /^1[3-9]\d{9}$/.test(this.phone)
			},
			canLogin() {
				const isAgree = this.checkArr.includes('agree')
				if (!isAgree) return false
				if (this.isPwdLogin) {
					return !!this.username && !!this.password
				} else {
					return this.validPhone && this.code.length === 6
				}
			}
		},
		methods: {
	
			switchLoginMode() {
				console.log('切换登录方式')
				this.isPwdLogin = !this.isPwdLogin
				if (this.isPwdLogin) {
					this.code = ''
					this.phone = ''
					this.clearTimer()
				} else {
					this.password = ''
					this.username = ''
				}
			},
			async getCode() {
				if (!this.validPhone) {
					return uni.showToast({
						title: '请输入正确手机号',
						icon: 'none'
					})
				}
				
				try {
					const res =await postAuthLoginApi({
						phone: this.phone
					})
					console.log(res)
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
		async handleLogin() {
  if (!this.checkArr.includes('agree')) {
    return uni.showToast({
      title: '请同意协议!',
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
    // 用户名密码登录
    if (this.isPwdLogin) {
      const postData = {
        username: this.username,
        password: this.password
      }
      res = await postAuthLoginApi(postData);
      console.log('密码登录返回：', res)
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
      console.log('验证码登录返回：', res)
    }


    uni.setStorageSync('token', res.token)
    uni.setStorageSync('refreshToken', res.refreshToken);
    this.getAuth()
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
  } catch (err) {
    console.log('登录报错：', err)
    let errMsg = err?.message || '登录失败，请检查信息'
    uni.showToast({
      title: errMsg,
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
},

			// 获取角色
			async getAuth() {
				try {
					let res
					res = await getAuthMeApi()
					console.log(res);
					const data = {
						id: res.userId
					}
					
					//患者  `admin2/1` 
					if(res.role == 'PATIENT'){
						if(!res.isRegistered){

						}
				
						let routeUrl = `/pages/index/home` + `?data=` + encodeURIComponent(JSON.stringify(data))
						this.$safeJump(routeUrl)
					// 客服  `admin/1`
					}else if(res.role == 'CS'){
						
						let routeUrl = '/pages/index/workBench'
						this.$safeJump(routeUrl)
						// 陪诊师  `admin3/1`
					}else if(res.role == 'CAREGIVER'){
							alert()
						let routeUrl = '/pages/index/onsite'
						
						this.$safeJump(routeUrl)
						// 医生  `admin5/1`  新建
					}else if(res.role == 'DOCTOR'){
						
						let routeUrl = '/pages/index/home'
						this.$safeJump(routeUrl)
					}
				} catch (err) {
					let errMsg = err?.message || '失败'
					uni.showToast({
						title: errMsg,
						icon: 'none'
					})
				} 
			},
			// 一键登录
			async handleOneKeyLogin() {
				if (!this.checkArr.includes('agree')) {
					return uni.showToast({
						title: '请同意协议!',
						icon: 'none'
					})
				}
				this.clearTimer()
				try {
					// const res = await getAppBanners({});
					// console.log(res)
					let routeUrl = '/pages/index/loginFirst'
					this.$safeJump(routeUrl)
				} catch (err) {
					console.error(err)
				}
			},
			// 注册
			goRegister() {
				this.clearTimer()
				let routeUrl = '/pages/index/register'
				this.$safeJump(routeUrl)
			},
			// 用户服务协议
			openUserAgreement() {
				let routeUrl = '/pages/index/user'
				this.$safeJump(routeUrl)
			},
			// 隐私条款
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
			this.phone = ''
			this.password = ''
			this.code = ''
			this.username = ''
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
		align-items: center;
		margin-bottom: 40rpx;
	}

	.code-row ::v-deep .code-input-wrap:first-child {
		margin-right: 20rpx;
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

		margin-top: 20rpx;
	}

	.tip {
		font-size: 28rpx;
		color: #666;
		margin-right: 10rpx;
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
	}

	.protocol-text {
		font-size: 24rpx;
		color: #666;
	}

	.font-blue {
		color: #155dfc;
	}
</style>