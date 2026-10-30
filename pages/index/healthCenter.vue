<template>
	<view class="page-content page-heathCenter">
		<view class="margin-bottom-1">
			<view class="font-bold font-l margin-bottom-5">健康管理中心</view>
			<view class="u-flex ">
				<u-icon name="info-circle" color="#ff6900" :size="fontSize1"></u-icon>
				<view class="font-s font-info margin-left-5">数据监测连续更新 · 术后第 12 天</view>
			</view>

		</view>
		<view class="tab-scroll margin-bottom-1">
			<scroll-view scroll-x class="scroll-x-box">
				<view class="scroll-inner">
					<!-- 子项，横向排开 -->
					<view class="u-flex space-between align-center tab-wrapper">
						<view @click="clickTab(item)" :class="activeTab2 == item.id?'activeTab':''"
							v-for="item in tabList2" :key="item.id"
							class="tab-icons radius-1 card-border-gray u-flex space-between align-center u-flex-column margin-right-10">

							<text :color="activeTab2 == item.id?'white':'#a1a5af'" :class="'custom-icon-' + item.icon"
								class="custom-icon  icon-bold margin-bottom-5" style="font-size:40rpx;"></text>
							<view class="font-info font-s font-bold tab-font ">
								{{item.name}}
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 饮食分析 -->
		<view v-if="activeTab2 == 1">
<mealDetail></mealDetail>
			
		</view>
		<!-- 运动处方 -->
		<view v-else-if="activeTab2 == 2">
<rehabSport></rehabSport>
			<!-- <view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							今日运动方案
						</view>
					</view>
					<view class="font-blue font-s font-bold">
						术后康复期 (第2阶段)
					</view>
				</view>
				<view :class="item.completed?'activeCheckbox':''" @click="toggleTask(item.id)" v-for="item in useState"
					:key="item.id"
					class="u-flex space-between radius-1 margin-bottom-1 badge-gray-bg bg-gray padding-1 healthCheckbox">
					<view class="u-flex align-center">
						<view v-if="!item.completed">
							<u-icon name="checkmark-circle" color="#909399" size="30rpx"></u-icon>
						</view>
						<view v-else>
							<u-icon name="checkmark-circle-fill" color="#155dfc" size="30rpx"></u-icon>
						</view>
						<view class="margin-left-5">
							<view class="font-bold  font-m font-gray-dark ">{{item.name}}</view>
							<view class="font-info font-s">{{item.duration}}</view>
						</view>

					</view>
					<view class="badge-white badge">{{item.intensity}}</view>
				</view>

			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							实时心率监测 (运动中)
						</view>
					</view>

				</view>
				<view class="chart-wrap">
					<qiun-data-charts type="column" :opts="chartOpts" :chartData="chartData" />
				</view>

				<view class="heart-bottom">
					<view class="heart-desc font-info font-s">当前平均心率</view>
					<view class="heart-val">82 <text class="unit">bpm</text></view>
				</view>

			</view>
			<view class="radius-1 bg-white margin-top-1 padding-1 border-blue bg-linear-purple">
				<view class="u-flex space-start">
					<text class="custom-icon custom-icon-trending-up icon-bold"
						:style="{color: '#155DFC',fontSize: fontSize1}"></text>

					<text class=" font-bold font-s margin-left-5">
						运动建议
					</text>
				</view>
				<view class="font-s margin-top-10">
					今日运动心率平稳，建议保持当前强度。若感到胸闷或气促请立即停止。
				</view>
			</view> -->

		</view>
		<!-- 体重动态 -->
		<view v-else-if="activeTab2 == 3">
			
			<weightControl />
			<!-- <view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							今日体重记录11111111111111111111
						</view>
					</view>

				</view>
				<view class="u-flex space-between align-center weight-wrapper">
					<u--input placeholder="请输入体重" type="number"></u--input>
					<view class="font-bold font-info margin-left-5">kg</view>
				</view>
				<view class="button-wrapper-fill u-flex flex-center margin-top-1">
					保存记录
				</view>

			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							体重趋势
						</view>
					</view>
					<view class="font-info font-s ">
						近7天
					</view>
				</view>
				<view class="header-text">
					<view class="header-icon ">
						<view class=" font-s">
							当前体重
						</view>
					</view>
					<view class="font-bold font-l ">
						65kg
					</view>
				</view>
				<view class="radius-1 badge-green-bg  padding-1 card-green">
					<view class="u-flex space-start">
						<text class="custom-icon custom-icon-trending-down icon-bold"
							:style="{fontSize: fontSize1,color:'#009689'}"></text>
						<text class=" font-green font-s margin-left-5">
							较初始减重 1.7 kg
						</text>

					</view>

				</view>

			</view>

			<view class="radius-1 bg-white margin-top-1 padding-1 border-orange bg-linear-orange">
				<view class="u-flex space-start align-center">
					<u-icon name="info-circle" color="#ff6900" :bold="true" :size="fontSize1"></u-icon>
					<text class=" font-bold font-s margin-left-5">
						医学监测预警
					</text>
				</view>
				<view class="  font-s margin-top-10">
					体重控制处于安全区间，建议维持当前方案。
				</view>
			</view> -->

		</view>
		<!-- 血压血糖 -->
		<view v-else-if="activeTab2 == 4">
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							今日数据录入
						</view>
					</view>

				</view>
				<view class="input-wrapper margin-bottom-5 font-gray-dark">血压 (mmHg)</view>
				<view class="u-flex space-between align-center weight-wrapper">
					<u--input placeholder="收缩压" type="number"></u--input>
					<view style="margin: 0 5px;">/</view>
					<u--input placeholder="舒张压" type="number"></u--input>
				</view>
				<view class="input-wrapper margin-bottom-5 font-gray-dark margin-top-1">血糖 (mmol/L)</view>
				<view class="u-flex space-between align-center weight-wrapper">
					<u--input placeholder="请输入血糖" type="number"></u--input>
				</view>
				<view class="button-wrapper-fill u-flex flex-center margin-top-15">
					保存数据
				</view>

			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							今日数据对比
						</view>
					</view>

				</view>
				<view class="u-flex  space-between card-spe">
					<view class="badge-blue-bg radius-1 padding-15 margin-right-1">
						<view class="u-flex  space-start ">
							<text class="custom-icon custom-icon-activity icon-bold"
								style="font-size:30rpx;color:#155DFC;"></text>
							<view class=" font-s margin-left-5">
								血压
							</view>
						</view>
						<view class="font-l font-bold">24.4</view>
						<view class="font-s  font-green font-bold">正常范围</view>
					</view>

					<view class="badge-green-bg radius-1 padding-15">
						<view class="u-flex  space-start ">
							<text class="custom-icon custom-icon-activity icon-bold"
								style="font-size:30rpx;color:#00a63e;"></text>
							<view class=" font-s margin-left-5">
								血糖
							</view>
						</view>
						<view class="font-l font-bold">24.4</view>
						<view class="font-s  font-green font-bold">控制良好</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 今日用药 -->
		<view v-else-if="activeTab2 == 5" class="heath-5">
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="font-m font-bold font-m">
							添加用药提醒
						</view>
					</view>

				</view>
				<view class="wrap">
					<view class="card">
						<view class="header">
							<view class="icon-box">
								<text class="custom-icon custom-icon-PillOutline icon-bold"
									style="font-size:40rpx;color:#155DFC;"></text>

							</view>
							<view class="title-box">
								<view class="main-title">添加用药提醒</view>
								<view class="sub-title1">按时服药，别忘了确认</view>
							</view>
						</view>

						<view class="form-item">
							<view class="label-row">
								<view class="label">药物名称<text class="star">*</text></view>
								<view class="required-txt">必填</view>
							</view>
							<view class="input-wrap">
								<input class="input" v-model="form.name" placeholder="请输入药物名称" />
								<view class="input-icon">
									<text class="custom-icon custom-icon-PillOutline icon-bold"
										style="font-size:30rpx;color:#155DFC;"></text>


								</view>
							</view>
						</view>

						<view class="form-item">
							<view class="label-row">
								<view class="label">每日次数<text class="star">*</text></view>
								<view class="required-txt">必填</view>
							</view>
							<view class="radio-group">
								<view class="radio-item" :class="{active: form.timesPerDay === 1}"
									@click="form.timesPerDay = 1">1次
								</view>
								<view class="radio-item" :class="{active: form.timesPerDay === 2}"
									@click="form.timesPerDay = 2">2次
								</view>
								<view class="radio-item" :class="{active: form.timesPerDay === 3}"
									@click="form.timesPerDay = 3">3次
								</view>
							</view>
							<view class="tip-small">请按照医嘱选择每日服用次数</view>
						</view>

						<view class="info-tip">
							<view class="info-icon">
								<u-icon name="info-circle" color="#ff6900" :size="fontSize1"></u-icon>

							</view>
							<view class="info-text">请按医嘱或药品说明书使用，本提醒不替代医护建议。</view>
						</view>
						<u-button class="button-wrapper-fill" :disabled="!form.name" @click="postMeMedicationApi">+
							添加提醒
						</u-button>
						<!-- <view class="button-wrapper-fill" :disabled="{disabled: !form.name}" @click="postMeMedicationApi">
							+ 添加提醒
						</view> -->
					</view>
				</view>
			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray u-flex space-between u-flex-column ">
    <view class="header-text">
      <view class="">
        <view class="font-m font-bold font-m">今日用药</view>
        <view class="font-info font-s">服药后请点击确认</view>
      </view>
      <view class="font-info font-s" v-if="medicationList.length">共{{ medicationList.length }}项</view>
    </view>

    <!-- 全部确认成功提示块 -->
    <view v-if="medicationList.length && isAllTaken" class="all-done-tip">
      <u-icon name="checkmark-circle-fill" color="#06b370" size="44rpx"></u-icon>
      <view class="tip-text-wrap">
        <view class="tip-title">今日用药已全部确认</view>
        <view class="tip-desc">遵医嘱规律服药有助术后平稳康复，请保持良好作息</view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!medicationList.length" class="empty-wrap">
      <view class="empty-icon">
<text class="custom-icon custom-icon-PillOutline icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
	  </view>
	 
      <view class="empty-title">还没有添加用药提醒</view>
      <view class="empty-desc">添加药物后，可以在这里确认服用情况。</view>
    </view>

    <!-- 用药列表 -->
    <view
      class="card-list u-flex space-between radius-1 medication-wrapper margin-bottom-1 no-shadow"
      :class="item.taken ? 'medicationTake' : ''"
      v-for="item in medicationList"
      :key="item.id"
    >
      <view class="massage-list u-flex align-center flex-center">
        <view class="massage-icon-left view-icon"  :class="item.status === 'TAKEN' ? 'message-checked' : ''">
          <u-icon v-if="item.status === 'TAKEN'" name="checkmark-circle-fill" color="#06b370" size="44rpx"></u-icon>
          <text v-else class="custom-icon custom-icon-PillOutline icon-bold" style="font-size:40rpx;color:#999;"></text>
        </view>
        <view class="massage-content">
          <view class="view-text">
            <u--text size="28rpx" :bold="true" class="font-m font-black font-bold" lines="1" :text="item.name"></u--text>
            <view class="badge-wrapper margin-top-1">
              <view class="font-info font-s">每日{{item.timesPerDay}}次</view>
              <view
                class="font-info font-s"
                :class="{'color-green': item.status === 'TAKEN', 'color-gray': item.status === 'PENDING'}"
              >
                {{ item.status === 'PENDING' ? '待服用' : item.status === 'TAKEN' ? '已服用' : item.status }}
              </view>
            </view>
          </view>
        </view>
        <view class="massage-icon-right">
          <view
            @click="openModal(item)"
            v-show="item.status == 'PENDING'"
            class="font-blue font-bold font-s btn-confirm-txt"
          >
            确认已服用
          </view>
          <view
            v-show="item.status == 'TAKEN'"
            class="font-info font-s color-gray btn-confirmed-txt"
          >
            已确认
          </view>
          <view @click="openModal2(item)" class="font-blue font-bold font-s">删除</view>
        </view>
      </view>
    </view>
  </view>
			<!-- <view class="radius-1 bg-white margin-top-1 padding-1 border-pink bg-linear-pink">
				<view class="u-flex space-start">
					<text class="custom-icon custom-icon-PillOutline icon-bold"
						:style="{color: '#9810fa',fontSize: fontSize1}"></text>
					<text class=" font-bold font-s margin-left-5">
						用药提醒设置
					</text>
				</view>
				<view class="  font-s margin-top-10">
					系统将在每日 8:00 和 19:00 推送用药提醒。
				</view>
				<view class="font-blue font-s margin-top-10 font-bold">
					编辑提醒时间 →
				</view>
			</view> -->

		</view>


		<view v-else-if="activeTab2 == 6" class="">
			
			<sleepManagement />
		
		</view>
		<view v-if="activeTab2 != 5" class="button-wrapper u-flex flex-center font-s" @click="showToast()" ref="uToast">
			<text class="custom-icon custom-icon-navigation icon-bold" style="color:#155DFC;margin-right: 5px;"></text>
			同步到我的私人医生团队
		</view>
		<myTabbar :current="1"></myTabbar>
	
		<u-toast ref="uToast"></u-toast>
		<view class="mask" v-if="showModal">
			<view class="dialog">
				<view class="dialog-icon">
					<text class="custom-icon custom-icon-PillOutline icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
				</view>
				<view class="dialog-title">确认已服用?</view>
				<view class="dialog-desc">请确认已完成本次服用: "{{ drugName }}"</view>
				<view class="btn-row">
					<view class="btn-cancel" @click="closeModal">取消</view>
					<view class="btn-confirm" @click="postMeMedicationByIdTakeApi(drugId)">确认已服用</view>
				</view>
			</view>
		</view>
		<view class="mask" v-if="showModal2">
			<view class="dialog">
				<view class="dialog-icon">
					<text class="custom-icon custom-icon-PillOutline icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
				</view>
				<view class="dialog-title">确认删除提醒?</view>
				      <view class="dialog-desc">请确认删除用药提醒: "{{ drugName }}"</view>
				      <view class="btn-row">
					        <view class="btn-cancel" @click="closeModal2">取消</view>
					        <view class="btn-confirm" @click="deleteMeMedicationByIdApi(drugId)">确认删除提醒</view>
				</view>
			</view>
		</view>
	
	
	</view>
</template>
<script>
	import {
		
		getMeExercisePlanApi,
		getMeMedicationTodayApi,
		postMeMedicationApi,
		postMeMedicationByIdTakeApi,
		deleteMeMedicationByIdApi,
		getHospitalPatientsByIdHealthDetailApi

	} from '@/api/frontApikit.js'
	import weightControl from './weightControl.vue'
	import sleepManagement from './sleepManagement.vue'
	import rehabSport from './rehabSport.vue'
	import mealDetail from './mealDetail.vue'


	import myTabbar from '@/components/myTabbar.vue'

	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
			myTabbar,weightControl,sleepManagement,rehabSport,mealDetail
		},
		computed: {
    isAllTaken() {
      if (!this.medicationList.length) return false
      return this.medicationList.every(item => item.status === 'TAKEN')
    }
  },

		data() {
				const userInfo = JSON.parse(uni.getStorageSync('userInfo')) || {}

			return {
				id: userInfo.userId || '',
				showModal: false,
				showModal2: false,
				drugName: '',
				drugId: "",
				form: {
					name: '',
					timesPerDay: 1
				},
				chartData: {
					categories: ['', '', '', '', '', '', '', '', '', '', ''],
					series: [{
						name: '心率',
						data: [42, 65, 48, 80, 52, 68, 95, 64, 45, 76, 83]
					}]
				},
				chartOpts: {
					color: ['#dbeafe'], //柱子浅蓝色
					dataLabel: false,
					extra: {
						column: {
							barWidth: 20, //柱子宽度
							categoryGap: 2,
							barBorderRadius: [6, 6, 0, 0] //顶部圆角，底部直角
						},
						tooltip: {
							show: false
						} //关闭悬浮提示
					},
					xAxis: {
						disableGrid: true,
						axisLine: false,
						label: {
							show: false
						} //隐藏x轴文字
					},
					yAxis: {
						disabled: true,
						disableGrid: true,
						axisLine: false,
						label: {
							show: false
						}
					},
					legend: {
						show: false
					}, //隐藏图例
					padding: [0, 0, 0, 0],
					label: {
						show: false,
					}

				},
				show: false,
				fontSize1: "30rpx",
				fontSize2: "40rpx",
				activeTab: 1,
				activeTab2: 2,
				medicationList: [],

				tabList2: [{
					id: 1,
					name: "饮食分析",
					icon: "camera",
				}, {
					id: 2,
					name: "运动处方",
					icon: "sport-shoe",
					badge: "",
					route: "healthCenter"
				}, {
					id: 3,
					name: "体重动态",
					icon: "scale",
					badge: "3",
					route: "messages"
				}, {
					id: 4,
					name: "血压血糖",
					icon: "activity",
					badge: "",
					route: "profile"
				}, {
					id: 5,
					name: "用药提醒",
					icon: "PillOutline",

				}, {
					id: 6,
					name: "睡眠管理",
					icon: "moon",

				}],


			};
		},
		onLoad(options) {
			this.getMeMedicationTodayApi()
			// this.getHospitalPatientsByIdHealthDetail()
		
		},
		methods: {
			openModal(item) {
				console.log(item)
				this.drugName = item.name
				this.drugId = item.id
				this.showModal = true
			},
			openModal2(item) {
				
				this.drugName = item.name
				this.drugId = item.id
				this.showModal2 = true
			},
			closeModal() {
				this.showModal = false
			},
			closeModal2() {
				this.showModal2 = false
			},
			confirmTake() {
				console.log('确认服用', this.drugName)
				this.closeModal()
			},
			//  患者健康详情（饮食/运动/体重/血糖血压7天；检查指标30天；其他附件）
			async getHospitalPatientsByIdHealthDetail() {
				try {
					console.log(this.id)

					const mealDetail = await getHospitalPatientsByIdHealthDetailApi({
						id:this.id
					})

			
					console.log(mealDetail)

				} catch (e) {
					console.log('报错：', e)
				}
			},
			//  今日用药列表（status 由当日打卡推导）
			async getMeMedicationTodayApi() {
				try {

					const getMeMedicationToday = await getMeMedicationTodayApi({


					})

					this.medicationList = getMeMedicationToday
					console.log('用药', getMeMedicationToday)

				} catch (e) {
					console.log('报错：', e)
				}
			},
			// 添加用药（药名+每日次数 1-3；v3 不再设置提醒时间）
			async postMeMedicationApi() {
				try {
					console.log(this.form)

					const postMeMedication = await postMeMedicationApi(

						this.form
					)
					uni.showToast({
						title: "用药提醒已添加",
						icon: "success"
					})
					this.getMeMedicationTodayApi()
					// console.log('用药', postMeMedication)

				} catch (e) {
					console.log('报错：', e)
				}
			},
			//用药打卡（当日幂等）
			async postMeMedicationByIdTakeApi(drugId) {

				try {

					const postMeMedicationByIdTake = await postMeMedicationByIdTakeApi({
						id: drugId
					})

					uni.showToast({
						title: "已标记服用",
						icon: "success"
					})
					this.closeModal()
					this.getMeMedicationTodayApi()

				} catch (e) {
					console.log('报错：', e)
				}
			},
			// 删除本人用药提醒

			async deleteMeMedicationByIdApi(drugId) {
				
				try {

					const deleteMeMedicationById = await deleteMeMedicationByIdApi({
						id: drugId

					})
					uni.showToast({
						title: "用药提醒已删除",
						icon: "success"
					})

					this.closeModal2()
					this.getMeMedicationTodayApi()

				} catch (e) {
					console.log('报错：', e)
				}
			},
			// 我的运动康复方案（动作+本周统计；每日重置昨日完成项）
			async getMeExercisePlan() {
				try {

					const MeExercisePlan = await getMeExercisePlanApi({
						id: this.id
					})
					console.log('MeExercisePlan：', MeExercisePlan)
					this.list = listData.list
				} catch (e) {
					console.log('报错：', e)
				}
			},


			toggleTask(id) {
				console.log(id)
				const newState = this.useState.map((item, index) => {
					// 处理逻辑
					if (item.id == id) {
						item.completed = !item.completed
					}

					return item;
				});
				console.log(newState)
				// this.useState.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

			},
			clickTab(item) {
				this.activeTab2 = item.id;
				console.log(this.activeTab2)
			},
			showToast(params) {

				const name = this.tabList2[this.activeTab2 - 1].name;
				const data = {
					value1: '1',
					value2: '2',
					healthType: name

				}
				let routeUrl = "/pages/index/consultation" + `?data=` + encodeURIComponent(JSON.stringify(data))
				const that = this;
				this.$refs.uToast.show({
					title: '',
					position: 'top',
					message: `${name}数据已加密发送至我的私人医生团队,已生成健康卡片同步至聊天窗口`,
					// 如果不传此type参数，默认为default，也可以手动写上 type: 'default'
					type: 'success',
					// 如果不需要图标，请设置为false
					icon: 'checkmark-circle',
					complete() {
						this.$safeJump(routeUrl)
					},
				})

			},
			routeTo(res) {

				let data = {
					title: 'hello',
					id: 1
				}
				let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				this.$safeJump(routeUrl)

			}
		},
		onReady() {
			//如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则。

		},
	};
</script>


<style scoped>
	.header {
		display: flex;
		align-items: center;
		gap: 24rpx;
		margin-bottom: 48rpx;
	}

	.icon-box {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #e8f3ff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
		color: #0066ee;
	}

	.main-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #222;
	}

	.sub-title1 {
		font-size: 26rpx;
		color: #888;
		margin-top: 8rpx;
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.label {
		font-size: 30rpx;
		color: #222;
	}

	.star {
		color: #f56c6c;
	}

	.required-txt {
		font-size: 26rpx;
		color: #999;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		border: 2rpx solid #b4d3ff;
		border-radius: 20rpx;
		padding: 0 24rpx;
		height: 88rpx;
		background: #fff;
	}

	.input {
		flex: 1;
		font-size: 28rpx;
	}

	.input-icon {
		font-size: 28rpx;
		color: #999;
	}

	.radio-group {
		display: flex;
		gap: 16rpx;
	}

	.radio-item {
		flex: 1;
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		background-color: #f4f5f7;
		border-radius: 20rpx;
		color: #333;
	}

	.radio-item.active {
		background-color: #0066ee;
		color: #fff;
	}

	.tip-small {
		font-size: 24rpx;
		color: #888;
		margin-top: 16rpx;
	}

	.info-tip {
		display: flex;
		gap: 12rpx;
		margin: 48rpx 0;
		font-size: 24rpx;
		color: #888;
	}

	.info-icon {
		color: #888;
	}

	.submit-btn {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		text-align: center;
		border-radius: 48rpx;
		font-size: 30rpx;
		background-color: #0066ee;
		color: #fff;
	}

	.submit-btn.disabled {
		background-color: #e7e8eb;
		color: #b9bcc3;
	}

	/* .tab-wrapper {
		::v-deep .u-icon__label {
			display: none !important;
		}
	} */
	::v-deep .u-toast__content__text {
		line-height: 1.4 !important;
	}

	.chart-wrap {
		height: 200rpx !important;
		width: 100% !important;
	}

	.heart-bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		/* margin-top:24rpx; */
		width: 100%;
	}

	.heart-desc {
		font-size: 26rpx;
		color: #666;
	}

	.heart-val {
		font-size: 48rpx;
		color: #2563eb;
		font-weight: bold;
	}

	.unit {
		font-size: 28rpx;
	}

	.page-heathCenter .card-list {
		padding: 30rpx
	}

	.page-heathCenter .medication-wrapper.card-list {
		border: 1px solid #dddd;
	}

	.page-heathCenter .medicationTake {
		border: 1px solid #dbfce7 !important;
		background-color: #f0fdf4;
	}


	.page-heathCenter .card-list .badge-blue-bg {
		background-color: #eff6ff;
	}

	.article-list {
		flex: 1;
		margin-left: 20rpx;
	}

	.tag-row {
		align-items: center;
	}

	.heath-6 .massage-icon-left {
		width: 40rpx;
		height: 40rpx;
	}




	/* 未标记药品 */
	.page-heathCenter .card-list .massage-icon-left {
		background-color: #eff6ff;
		border-radius: 10px;
	}
.page-heathCenter .card-list .massage-icon-left.message-checked {
		background-color: #e8fbf3;
		
	}
	/* 右边文字 标记已服用*/
	.page-heathCenter .massage-list .massage-icon-right {
		width: 260rpx;

	}

	/* 中间内容 未标记 */
	.page-heathCenter .massage-list {
		position: relative;

	}



	.page-heathCenter .medicationTake .massage-icon-left {
		background-color: #c8c9cc;
		background-color: #00c950;
	}

	.page-heathCenter .card-list .badge-blue-bg {
		background-color: #eff6ff;
	}

	.page-heathCenter .activeCheckbox {
		border: 1px solid #dae9fd;
		background-color: #eff6ff;
	}

	.page-heathCenter .activeCheckbox .font-bold {
		color: #1c398e;
	}


	.page-heathCenter .bg-gray {
		/* width:100% */
		width: calc(100% - 30rpx)
	}

	.page-heathCenter .heath-6 {
		padding-right: 0;
		width: 100%;
	}

	.page-heathCenter .badge {
		height: max-content;
	}

	.healthCheckbox {
		width: calc(100% - 60rpx);
		border: 1px solid #f3f4f6;
	}

	.page-heathCenter .button-wrapper {
		border: 2px solid #155DFC;
		color: #155DFC;
		border-radius: 10px;
		padding: 10px;
		margin-top: 50rpx
	}

	.page-heathCenter .button-wrapper-fill {
		background-color: #155DFC;
		border-radius: 10px;
		padding: 10px;
		color: white;
		width: calc(100% - 30rpx);
		text-align: center;
	}

	.page-heathCenter .header-text {
		width: 100%;
		margin: 0 0 30rpx 0;
	}


	.page-heathCenter .float-wrapper .u-icon {
		position: relative;
		top: 6px;

	}

	.weight-wrapper {
		width: 100%;
	}

	.page-heathCenter .card-green {
		width: calc(100% - 30rpx);
	}

	.page-heathCenter .input-wrapper {
		width: 100%;
	}

	.page-heathCenter .card-spe {
		width: 100%;
	}

	.page-heathCenter .card-spe>view {
		color: black;
		width: calc(50% - 15rpx);
	}

	/* 	.page-heathCenter .massage-icon-left1 {
		background-color: #00c950;
		border-radius: 100%;
	}

	.page-heathCenter .massage-icon-left2 {
		background-color: #d1d5dc;
		border-radius: 100%;
	} */

	.page-heathCenter .card-list {
		width: calc(100% - 60rpx);
	}

	.heath-5 .massage-content {
		margin: 0 30rpx;

	}

	.u-badge>view {
		width: calc(33% - 20px);
	}

	.my-card .view-icon {
		padding: 30rpx;
	}

	.color-gray {
		color: #999;
	}

	.color-green {
		color: #00a64c;
	}

	.mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.dialog {
		width: 620rpx;
		background: #fff;
		border-radius: 36rpx;
		padding: 48rpx 36rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.dialog-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 20px;
		background: #e8f3ff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 52rpx;
		color: #0066ee;
		margin-bottom: 32rpx;
	}

	.dialog-title {
		font-size: 40rpx;
		font-weight: 600;
		color: #222;
		margin-bottom: 20rpx;
	}

	.dialog-desc {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 48rpx;
	}

	.btn-row {
		width: 100%;
		display: flex;
		gap: 24rpx;
	}

	.btn-cancel {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background: #f4f5f7;
		border-radius: 44rpx;
		font-size: 30rpx;
		color: #333;
	}

	.btn-confirm {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background: #0066ee;
		border-radius: 44rpx;
		font-size: 30rpx;
		color: #fff;
	}
	.empty-wrap {
  padding:80rpx 20rpx;
  display:flex;
  flex-direction:column;
  align-items:center;
}
.empty-icon {
  width:120rpx;
  height:120rpx;
  background:#f7f8fa;
  border-radius:24rpx;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:48rpx;
  color:#ccc;
  margin-bottom:32rpx;
}
.empty-title {
  font-size:32rpx;
  font-weight:600;
  color:#222;
  margin-bottom:12rpx;
}
.empty-desc {
  font-size:26rpx;
  color:#888;
}
.all-done-tip {
  background: #e8fbf3;
  border-radius: 20rpx;
  padding:24rpx;
  display:flex;
  align-items:center;
  gap:16rpx;
  margin-bottom:24rpx;
}
.tip-title {
  font-size:24rpx;
  font-weight:600;
  color:#00a64c;
}
.tip-desc {
  font-size:20rpx;
  color:#06b370;
  margin-top:4rpx;
}
</style>