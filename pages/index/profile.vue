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
						<u-form-item label="性别" labelWidth="100%" prop="userInfo.sex" labelPosition="top"
							@click="showSex = true; hideKeyboard()">
							<view class="input-wrap">
								<text class="custom-icon custom-icon-activity icon-activity"
									style="font-size:50rpx;color:#155DFC;"></text>
								<view class="input-inner">
									<u--input v-model="model1.userInfo.sex" disabled disabledColor="#ffffff"
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
						<u-form-item label="就诊医院" labelWidth="100%" prop="userInfo.hospital" labelPosition="top">
							<u--input placeholder="请输入就诊医院" prefixIcon="coupon"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.hospital"></u--input>
						</u-form-item>
						<u-form-item label="科室" labelWidth="100%" prop="userInfo.department" labelPosition="top">
							<u--input placeholder="请输入科室" prefixIcon="home"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.department"></u--input>
						</u-form-item>
						<u-form-item label="手术名称" labelWidth="100%" prop="userInfo.surgeryName" labelPosition="top">
							<u--input placeholder="请输入手术名称" prefixIcon="gift"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.surgeryName"></u--input>
						</u-form-item>
						<u-form-item label="主刀医生" labelWidth="100%" prop="userInfo.doctor" labelPosition="top">
							<u--input placeholder="请输入主刀医生" prefixIcon="man-delete"
								prefixIconStyle="font-size:50rpx;color: #155DFC"
								v-model="model1.userInfo.doctor"></u--input>
						</u-form-item>
					</u--form>
				</view>
			</view>

			<u-button class="width-100 margin-top-8" shape="circle" :hairline="false" @click="logOut()" type="error"
				text="退出当前账号"></u-button>
			<main-tabbar :current="3"></main-tabbar>
		</view>
	</view>
</template>
<script>
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'
	import {
		mapState
	} from 'vuex'
	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
			mainTabbar
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

				tabList: [{
					id: 1,
					name: "首页",
					icon: "home",
					badge: "",
					route: "home"
				}, {
					id: 2,
					name: "健康",
					icon: "heart",
					badge: "",
					route: "healthCenter"
				}, {
					id: 3,
					name: "消息",
					icon: "chat",
					badge: "3",
					route: "messages"
				}, {
					id: 4,
					name: "我的",
					icon: "account",
					badge: "",
					route: "profile"
				}],
				activeTab: 3,
				isShow: true,
				showSex: false,
				message1: "完善专业档案",
				message2: "您好，患者。请填写以下信息以提供精准服务",
				model1: {
					userInfo: {
						name: '',
						sex: '',
						age: '',
						region: '',
						hospital: '',
						department: '',
						surgeryName: '',
						doctor: ''
					},
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
					'userInfo.sex': {
						type: 'string',
						required: true,
						message: '请选择性别',
						trigger: ['blur', 'change']
					},
					// 如需其他字段校验在这里补充示例
					// 'userInfo.age': { required:true, message:'请输入年龄', trigger:'blur' }
				},
				radio: '',
				switchVal: false
			};
		},
		onLoad() {},
		methods: {

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
			handleSave(e) {
				this.$refs.uForm.validate().then(res => {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
				}).catch(err => {
					console.log('校验失败', err)
				})
			},
			sexSelect(e) {
				this.model1.userInfo.sex = e.name
				this.$refs.uForm.validateField('userInfo.sex')
			},
			routeTo(res) {
				let data = {
					title: 'hello',
					id: 1
				}
				let routeUrl = `/pages/index/` + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				this.$safeJump(routeUrl)
			},

			logOut(res) {
				uni.showModal({
					title: '提示',
					content: '确定退出账号？',
					success: resp => {
						if (resp.confirm) {
							uni.reLaunch({
								url: '/pages/index/login'
							})
						}
					}
				})
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

	.page-content {
		padding: 30rpx;
	}

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

	.page-profile .u-input {
		padding: 20rpx 20rpx !important;
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
</style>