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
			<view
				class="my-card radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="view-icon badge-blue-bg badge-circle margin-bottom-2">
					<u-icon name="camera" color="#155DFC" size="80rpx"></u-icon>
				</view>
				<view>

					<view class="view-text">
						<view class="view-text1 font-l margin-bottom-2 text-center ">
							上传今日膳食照片
						</view>
						<view class="view-text2 font-info font-s margin-bottom-2 text-center ">
							实时拍照分析食物营养与食物含量分析
						</view>
					</view>

				</view>
				<view class="margin-top-1">
					<u-button style="padding: 0 40px;" color="#155DFC" type="primary" text="立即拍照/上传"
						shape="circle"></u-button>
				</view>

			</view>

			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							饮食分析报告
						</view>
					</view>
					<view class="font-green font-s font-bold">
						今日累计
					</view>
				</view>
				<view class="float-wrapper">
					<view class="u-float-left u-width-50">
						<view class="font-s font-info margin-bottom-5">总热量</view>
						<view class="u-flex  column-center">
							<view class="font-l font-bold  margin-right-5">546</view>
							<view class="font-s font-info  ">kal</view>
						</view>
					</view>
					<view class="u-float-left u-width-50">
						<view class="font-s font-info margin-bottom-5">蛋白质</view>
						<view class="u-flex  column-center">
							<view class="font-l font-bold  margin-right-5">546</view>
							<view class="font-s font-info  ">g</view>
						</view>
					</view>
				</view>
				<view class="radius-15 bg-gray gray-content">
					<view class="font-bold font-s margin-bottom-1">营养占比分析</view>
					<view class="u-flex  space-between u-badge">
						<view class="badge-blue-bg radius-1 padding-10">
							<view class="font-l font-bold">24.4</view>
							<view class="font-s font-info">蛋白质（g)</view>
						</view>
						<view class="badge-orange-bg radius-1 padding-10">
							<view class="font-l font-bold">24.4</view>
							<view class="font-s font-info">碳物（g)</view>
						</view>
						<view class="badge-green-bg radius-1 padding-10">
							<view class="font-l font-bold">24.4</view>
							<view class="font-s font-info">维生素</view>
						</view>
					</view>
					<view class="radius-1 bg-white margin-top-1 padding-1">
						<view class="float-wrapper ">
							<text class="custom-icon custom-icon-trending-up icon-bold"
								style="font-size:20rpx;color:#00a63e;"></text>

							<text class=" font-green font-s margin-left-5">
								医学专业评估：
							</text>
							<text class="  font-s margin-left-5">
								当前膳食结构符合术后康复标准，蛋白质占比 24% 处于理想区间。
							</text>
						</view>

					</view>
					<view class="radius-1 bg-white margin-top-1 padding-1 border-blue bg-linear-blue">
						<view class="u-flex space-start">
							<u-icon name="checkmark-circle" color="#155DFC" :bold="true" size="20rpx"></u-icon>
							<text class=" font-bold font-s margin-left-5">
								本周饮食汇总
							</text>
						</view>
						<view class="  font-s margin-top-10">
							本周平均热量摄入符合建议。建议适当增加深海鱼类摄入。
						</view>
						<view class="font-blue font-s margin-top-10 font-bold">
							查看详细报告 →
						</view>
					</view>

				</view>
			</view>
		</view>
		<!-- 运动处方 -->
		<view v-else-if="activeTab2 == 2">

			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
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
					<qiun-data-charts type="column" :opts="chartOpts" :chartData="chartData" canvas2d />
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
			</view>

		</view>
		<!-- 体重动态 -->
		<view v-else-if="activeTab2 == 3">
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="header-name font-bold font-m">
							今日体重记录
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
			</view>

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
		<!-- 睡眠管理 -->
		<view v-else-if="activeTab2 == 5" class="heath-5">
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="font-l font-bold font-m">
							今日用药
						</view>
					</view>
					<view class="font-blue font-bold font-s ">
						+添加
					</view>
				</view>

				<view class="card-list u-flex space-between   radius-1 medication-wrapper margin-bottom-1 no-shadow"
					:class="item.taken? 'medicationTake' : ''" v-for="item in medicationList" :key="item.id">
					<view class=" massage-list u-flex align-center flex-center">
						<view class="massage-icon-left  view-icon  ">
							<u-icon v-if="item.taken" name="checkmark-circle" color="white" size="40rpx"></u-icon>
							<text v-else class="custom-icon custom-icon-PillOutline icon-bold"
								style="font-size:40rpx;color:white;"></text>
						</view>
						<view class="massage-content">
							<!-- 内容 -->
							<view class="view-text">
								<u--text size="28rpx" :bold="true" class=" font-m  font-black font-bold " lines="1"
									:text="item.name"></u--text>

								<view class="badge-wrapper margin-top-1">
									<view class="font-info font-s">
										{{item.dosage}}
									</view>
									<view class="font-info font-s">
										{{item.time}}
									</view>
								</view>
							</view>

						</view>

						<view @click="markTaken(item)" v-show="!item.taken"
							class="massage-icon-right font-blue font-bold font-s">
							标记已服用
						</view>
					</view>

				</view>

			</view>
			<view class="radius-1 bg-white margin-top-1 padding-1 border-pink bg-linear-pink">
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
			</view>

		</view>


		<view v-else-if="activeTab2 == 6" class="">
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="radius-1   padding-1  bg-gray-dark gray-content width-100-2rem">
					<view class="  font-m margin-bottom-1">
						睡眠评估
					</view>
					<view class="u-flex space-start">
						<u-icon name="checkmark-circle" color="#00a63e" :size="fontSize1"></u-icon>
						<text class="  font-s margin-left-5">
							睡眠质量良好
						</text>
					</view>


				</view>
				<view class="font-blue font-s margin-top-10 font-bold width-100">
					记录今日睡眠 →
				</view>
			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
				<view class="header-text">
					<view class="header-icon ">
						<view class="font-m font-bold">
							心理健康内容
						</view>
					</view>

				</view>

				<view
					class="card-list  radius-1 card-top  card-border card-border-gray no-shadow bg-gray margin-bottom-1"
					v-for="item in articleList" :key="item.id">
					<view class="massage-list heath-6 u-flex space-between align-center">

						<view class="massage-icon-left view-icon badge-blue-bg">
							<u-icon name="file-text" color="#155DFC" :bold="true" size="40rpx"></u-icon>
						</view>

						<view class="article-list ">
							<u--text size="28rpx" :bold="true" class=" font-s  font-black font-bold " lines="1"
								:text="item.title"></u--text>
							<!-- 这里加自定义class tag-row -->
							<view class="u-flex space-start margin-top-1 tag-row">
								<u-tag plain plainFill size="mini" :text="item.type"></u-tag>
								<u--text size="22rpx" class="font-info " :lines="1" :text="item.duration"></u--text>
							</view>
						</view>



					</view>

				</view>



			</view>

		</view>
		<view v-if="activeTab2 != 5" class="button-wrapper u-flex flex-center font-s" @click="showToast()" ref="uToast">
			<text class="custom-icon custom-icon-navigation icon-bold" style="color:#155DFC;margin-right: 5px;"></text>
			同步到我的私人医生团队
		</view>
		<main-tabbar :current="1"></main-tabbar>
		<u-toast ref="uToast"></u-toast>

	</view>
</template>
<script>
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'

	export default {
		components: {
			mainTabbar
		},
		data() {
			return {
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
				activeTab2: 1,
				medicationList: [{
						id: 1,
						name: "阿司匹林肠溶片阿司匹林肠溶片阿司匹林肠溶片阿司匹林肠溶片",
						time: "早餐后",
						dosage: "100mg",
						taken: true
					},
					{
						id: 2,
						name: "阿托伐他汀钙片阿托伐他汀钙片阿托伐他汀钙片阿托伐他汀钙片阿托伐他汀钙片",
						time: "早餐后",
						dosage: "100mg",
						taken: false
					},
				],
				articleList: [{
					id: 1,
					title: "术后焦虑怎么办？专业医生为您解答专业医生为您解答",
					type: "文章",
					duration: "5分钟"
				}, {
					id: 2,
					title: "术后焦虑怎么办？专业医生为您解答",
					type: "文章",
					duration: "10分钟"
				}, ],
				useState: [{
						id: 1,
						name: "有氧步行 (散步)",
						duration: "30分钟",
						completed: true,
						intensity: "轻度"
					},
					{
						id: 2,
						name: "呼吸功能训练",
						duration: "10分钟",
						completed: true,
						intensity: "低强度"
					},
					{
						id: 3,
						name: "上肢柔韧性练习",
						duration: "15分钟",
						completed: false,
						intensity: "轻度"
					},
				],
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
		methods: {

			// 标记已服用
			markTaken(item) {
				item.taken = true
				uni.showToast({
					title: "已标记服用",
					icon: "success"
				})
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
				
				const name = this.tabList2[this.activeTab2-1].name;
				const data = {
					value1:'1',
					value2:'2',
					healthType:name
					
				}
				let routeUrl = "/pages/index/consultation" + `?data=` + encodeURIComponent(JSON.stringify(data))
				this.$refs.uToast.show({
					title: '',
					position: 'top',
					message: `${name}数据已加密发送至我的私人医生团队,已生成健康卡片同步至聊天窗口`,
					// 如果不传此type参数，默认为default，也可以手动写上 type: 'default'
					type: 'success',
					// 如果不需要图标，请设置为false
					icon: 'checkmark-circle',
					complete() {
						uni.navigateTo({
							url: routeUrl,
							fail: (err) => {
								console.error('跳转失败', err) //打印失败原因
							}
						});
					},
				})

			},
			routeTo(res) {

				let data = {
					title: 'hello',
					id: 1
				}


				uni.navigateTo({
					url: `../index/` + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				})

			}
		},
		onReady() {
			//如果需要兼容微信小程序，并且校验规则中含有方法等，只能通过setRules方法设置规则。

		},
	};
</script>


<style scoped>
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
		gap: 10rpx;
		align-items: center;
	}

	.heath-6 .massage-icon-left {
		width: 40rpx;
		height: 40rpx;
	}


	/* 左边图标 */
	/* .page-heathCenter .massage-list .massage-icon-left {
		position: absolute;
		left: 0;
		top: 0;
		width: 40rpx;
		height: 40rpx;
	} */

	/* 未标记药品 */
	.page-heathCenter .card-list .massage-icon-left {
		background-color: #c8c9cc;
		border-radius: 100%;
	}

	/* 右边文字 标记已服用*/
	.page-heathCenter .massage-list .massage-icon-right {
		width: 260rpx;
		/* border: 1px solid red; */
		/* position: absolute;
		right: 0;
		top: calc(50% - 20rpx); */
	}

	/* 中间内容 未标记 */
	.page-heathCenter .massage-list {
		position: relative;
		/* width: calc(100% - 220rpx); */
		/* border: 1px solid; */
		/* padding: 0 150rpx 0 90rpx; */
		/* height: 80rpx; */

		/* flex: 1; */
	}

	/* 已标记 */
	/* 	.page-heathCenter .medicationTake .massage-list {
		width: calc(100% - 80rpx);
		padding: 0 30rpx 0 90rpx;
	} */

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
</style>