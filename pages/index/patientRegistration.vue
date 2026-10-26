<template>
	<view class="page-content page-register">
		<view class="bg-absolute bg-blue-top"></view>
		<view class="bg-relative">
			<view class="p1">{{message1}}</view>
			<view class="p2 margin-bottom-1">{{message2}}</view>
			<view class="bg-white" v-show="isShow">
				<u--form :labelStyle="{width:'100px',color:'#909399',fontSize:'20rpx'}" labelPosition="left"
					:model="model1" :rules="rules" ref="uForm">
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
		methods: {
			sexclick(){
				console.log(11111111111)
				this.showSex=true
			},
			sexSelect(e) {
				this.model1.userInfo.sex = e.name
				this.$refs.uForm.validateField('userInfo.sex')
			},
			async handleClick() {
				try {
					await this.$refs.uForm.validate()
					//校验全部通过才切换页面
					this.isShow = false;
					this.message1 = "资料已就绪";
					this.message2 = "您的档案已审核通过，现在可以进入系统"
				} catch (err) {
					console.log('表单校验失败', err)
				}
			},
			routeTo() {
				uni.showLoading()
				uni.hideLoading()
				let data = {
					title: 'hello',
					id: 1
				}
				let routeUrl = "/pages/index/home?data=" + encodeURIComponent(JSON.stringify(data))
				this.$safeJump(routeUrl)
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