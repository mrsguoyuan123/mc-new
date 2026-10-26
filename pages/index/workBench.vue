<template>
	<view class="page-workbench page-content">
		<!-- 头部标题 + 头像 -->
		<view class="page-header">
			<view>
				<text class="font-l font-bold">客服工作台</text>
				<view class="margin-top-5 font-m font-info">CS WORKBENCH</view>
			</view>
			<view class="avatar-box">
				<view class="avatar-icon">
					<u-icon name="account" color="#909399" :bold="true" size="50rpx"></u-icon>
				</view>
				<view class="dot"></view>
			</view>
		</view>
		<!-- 搜索框 -->
		<view class="margin-30 ">
			<u--input placeholder="搜索患者姓名、意向、手机号" shape="" v-model="searchKey" prefixIcon="search"
				prefixIconStyle="font-size: 22px;color: #909399"></u--input>
		</view>
		<!-- 统计数字卡片组 -->
		<view class="stat-row">
			<view class="stat-item mr-24">
				<view class="dot red"></view>
				<view class="badge-num">
					<u-badge bgColor="#f53f3f" max="99" value="3"></u-badge>
				</view>
				<text class="num">{{highIntent}}</text>
				<text class="stat-label">高意向</text>
			</view>
			<view class="stat-item  mr-24">
				<view class="dot orange"></view>
				<view class="badge-num">
					<u-badge bgColor="#f53f3f" max="99" value="143"></u-badge>
				</view>
				<text class="num">{{pendingCall}}</text>
				<text class="stat-label">待电话沟通</text>
			</view>
			<view class="stat-item">
				<view class="dot green"></view>
				<view class="badge-num">
					<u-badge bgColor="#f53f3f" max="99" value="143"></u-badge>
				</view>
				<text class="num">{{pendingReply}}</text>
				<text class="stat-label">待信息回复</text>
			</view>
		</view>
		<!-- 沟通记录标题 -->
		<view class="record-head">
			<text class="font-m font-bold">沟通记录 (6)</text>
			<text class="tip font-s font-info">实时同步意向</text>
		</view>
		<!-- 沟通记录列表 -->
		<!-- 	<scroll-view scroll-y class="list-scroll">
</scroll-view> -->
		<view v-for="(item, idx) in filterList" :key="idx">
			<view class="record-item">
				<!-- 左侧竖条标记 -->
				<view class="left-bar" :class="{active: item.purchaseIntent == 'HIGH'}"></view>
				<!-- 头像缩写 -->
				<view class="short-avatar">{{ item.name.charAt(0) }}</view>
				<view class="info">
					<view class="name-row">
						<text class="name mr-16">{{ item.name }}</text>
						<view class="intent-tag-wrapper">
							<text class="intent-tag"
								:class="'tag-' + item.purchaseIntent">{{ item.purchaseIntent === 'HIGH' ? '高意向' : item.purchaseIntent === 'MEDIUM' ? '中等意向' : item.purchaseIntent === 'LOW' ? '低意向' : '' }}</text>
						</view>
						<text class="custom-icon custom-icon-message" style="font-size:45rpx;color:#1ec76f;"
							@click="routeTo(item)"></text>
					</view>
					<view class="desc-line">
						<text class="desc">{{ item.surgeryType }} | {{ item.hospitalName }}</text>
					</view>
					<view class="sub-desc">
						<text>主刀: {{ item.surgeon }} | 地区: {{ item.surgeryRegion }}</text>
					</view>
				</view>
				<!-- 	<view class="btn-group">
					<view class="call-btn" :class="item.btnClass" @click="openStepPanel(item)">
						<u-icon class="" name="phone-fill" :color="item.btnClass == 'btn-gray'? '#909399':'#fff'"
							:bold="true" size="32rpx"></u-icon>
						<view class="margin-left-5">拨打</view>
					</view>
					<text class="btn-tip">{{ item.btnTip }}</text>
				</view> -->
			</view>


			<view v-if="item.showStepPanel" class="step-panel">
				<!-- 步骤条 -->
				<view class=" bg-blue bar-top">
					<view class="step-bar">
						<view class="step-item" v-for="(s,si) in stepList" :key="si"
							:class="{ 'step-last': si === stepList.length -1 }">
							<view class="step-circle"
								:class="{done:item.currentStep>si+1,active:item.currentStep===si+1}">
								<text v-if="item.currentStep>si+1">✓</text>
								<text v-else>{{si+1}}</text>
							</view>
							<view v-if="si !== stepList.length-1" class="step-line"
								:class="{done:item.currentStep>si+1}">
							</view>
						</view>
					</view>
					<view class="step-title">{{stepList[item.currentStep-1].title}}</view>
				</view>
				<!-- step1 第一步：电话沟通  绿色按钮 -->
				<view v-if="item.currentStep===1 && item.btnClass == 'btn-green'" class="step-content">
					<view v-if="item.callLoading" class="call-loading-box radius-15 bg-blue border-blue">
						<view class="call-icon">
							<u-icon name="phone-fill" color="white" :bold="true" size="80rpx"></u-icon>
						</view>
						<text class="call-text">正在为您呼叫患者...</text>
						<text class="call-en">SECURE LINE CONNECTING</text>
					</view>
					<view v-else class="call-connected bg-blue border-blue radius-15">
						<view class="call-state-row">
							<view class="state-label">
								<u-icon class="margin-right-5" name="phone" color="#0052cc" :bold="true"
									size="40rpx"></u-icon>
								<view>沟通线路状态</view>
							</view>
							<text class="state-tag">线路已接通</text>
						</view>
						<view class="call-row">
							<view class="phone-box mr-24">
								<u-icon name="phone" color="#00a63e" :bold="true" size="50rpx"></u-icon>
								<view>
									{{item.formCall.phone}}
								</view>
							</view>
							<view class="picker-wrapper">
								<picker class="picker-item" mode="selector" :value="item.formCall.statusIndex"
									:range="callStatusList" @change="handleStatusChange(item, $event,'statusIndex')">
									<view class="picker-box">
										<text
											:class="[item.formCall.statusIndex === -1 ? 'placeholder-text' : 'value-text']">
											{{ item.formCall.statusIndex === -1 ? '状态登记' : callStatusList[item.formCall.statusIndex] }}
										</text>
									</view>
								</picker>
							</view>
						</view>
						<view class="reconnect-tip">
							<text>呼叫失败？</text>
							<text class="link" @click="reconnect(item)"> 重新连接云端线路</text>
						</view>
					</view>
					<view v-if="item.formCall.statusIndex == 1">
						<view class="form-item  margin-top-1">
							<view class="picker-label">
								<text class="required-star">*</text>
								<text class="label">沟通失败原因:</text>
							</view>
							<picker mode="selector" :value="item.formCall.failReason" :range="failOptions"
								@change="handleStatusChange(item, $event,'failReason')">
								<view class="picker-input">
									<text
										:class="[item.formCall.failReason === -1 ? 'placeholder-text' : 'value-text']">
										{{ item.formCall.failReason === -1 ? '请选择' : failOptions[item.formCall.failReason] }}
									</text>
								</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">备注:</text>
							<textarea class="textarea" v-model="item.formCall.failRemark"
								placeholder="如漏服原因、调整用药具体操作等..."></textarea>
						</view>
					</view>
					<view class="next-btn" @click="nextStep(item)"> 下一步</view>
				</view>
				<!-- step1 第一步：电话沟通  蓝色按钮 -->
				<view v-if="item.currentStep===1 && item.btnClass == 'btn-blue'" class="step-content">
					<view v-if="item.callLoading" class="call-loading-box radius-15 bg-blue border-blue">
						<view class="call-icon">
							<u-icon name="phone-fill" color="white" :bold="true" size="80rpx"></u-icon>
						</view>
						<text class="call-text">正在为您呼叫患者...</text>
						<text class="call-en">SECURE LINE CONNECTING</text>
					</view>
					<view v-else class="call-connected bg-blue border-blue radius-15">
						<view class="call-state-row">
							<view class="state-label">
								<u-icon class="margin-right-5" name="phone" color="#0052cc" :bold="true"
									size="40rpx"></u-icon>
								<view>沟通线路状态</view>
							</view>
							<text class="state-tag" v-if="item.callSuccess">线路已接通</text>
							<text class="state-tag state-tag-gray" v-else>待连接</text>
						</view>
						<view class="call-row" v-if="!item.callSuccess">
							<view class=" call-btn btn-blue mr-24" @click="reconnect(item)">
								<u-icon class="" name="phone-fill" color="white" :bold="true" size="32rpx"></u-icon>
								<view class="margin-left-5">重新发起呼叫</view>
							</view>
							<view class="picker-wrapper">
								<picker class="picker-item" mode="selector" :value="item.formCall.statusIndex"
									:range="callStatusList" @change="handleStatusChange(item, $event,'statusIndex')"
									:disabled="!item.callSuccess">
									<view class="picker-box">
										<text
											:class="[item.formCall.statusIndex === -1 ? 'placeholder-text' : 'value-text']">
											{{ item.formCall.statusIndex === -1 ? '状态登记' : callStatusList[item.formCall.statusIndex] }}
										</text>
									</view>
								</picker>
							</view>
						</view>
						<view class="call-row" v-if="item.callSuccess">
							<!-- {{item.callSuccess}} -->
							<view class="phone-box  mr-24">
								<u-icon name="phone" color="#00a63e" :bold="true" size="50rpx"></u-icon>
								<view>
									{{item.formCall.phone}}
								</view>
							</view>
							<view class="picker-wrapper">
								<picker class="picker-item" mode="selector" :value="item.formCall.statusIndex"
									:range="callStatusList" @change="handleStatusChange(item, $event,'statusIndex')">
									<view class="picker-box">
										<text
											:class="[item.formCall.statusIndex === -1 ? 'placeholder-text' : 'value-text']">
											{{ item.formCall.statusIndex === -1 ? '状态登记' : callStatusList[item.formCall.statusIndex] }}
										</text>
									</view>
								</picker>
							</view>
						</view>
						<view class="reconnect-tip">
							<text>呼叫失败？</text>
							<text class="link" @click="reconnect(item)"> 重新连接云端线路</text>
						</view>
					</view>
					<view v-if="item.formCall.statusIndex == 1">
						<view class="form-item margin-top-1">
							<view class="picker-label">
								<text class="required-star">*</text>
								<text class="label">沟通失败原因:</text>
							</view>
							<picker mode="selector" :value="item.formCall.failReason" :range="failOptions"
								@change="handleStatusChange(item, $event,'failReason')">
								<view class="picker-input">
									<text
										:class="[item.formCall.failReason === -1 ? 'placeholder-text' : 'value-text']">
										{{ item.formCall.failReason === -1 ? '请选择' : failOptions[item.formCall.failReason] }}
									</text>
								</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">备注:</text>
							<textarea class="textarea" v-model="item.formCall.failRemark"
								placeholder="如漏服原因、调整用药具体操作等..."></textarea>
						</view>
					</view>
					<view class="next-btn" @click="nextStep(item,'called')"> 下一步</view>
				</view>
				<!-- step2 第二步：记录信息 -->
				<view v-if="item.currentStep===2" class="step-content">
					<view class="form-item">
						<view class="picker-label">
							<text class="required-star">*</text>
							<text class="label">用药情况:</text>
						</view>
						<picker mode="selector" :value="item.formCall.medicationStatus" :range="medicOptions"
							@change="handleStatusChange(item, $event,'medicationStatus')">
							<view class="picker-input">
								<text
									:class="[item.formCall.medicationStatus === -1 ? 'placeholder-text' : 'value-text']">
									{{ item.formCall.medicationStatus === -1 ? '请选择' : medicOptions[item.formCall.medicationStatus] }}
								</text>
							</view>
						</picker>

					</view>
					<view class="form-item">
						<view class="picker-label">
							<text class="required-star">*</text>
							<text class="label">身体恢复情况:</text>
						</view>
						<picker mode="selector" :value="item.formCall.recoveryStatus" :range="recoverOptions"
							@change="handleStatusChange(item, $event,'recoveryStatus')">
							<view class="picker-input">
								<text
									:class="[item.formCall.recoveryStatus === -1 ? 'placeholder-text' : 'value-text']">
									{{ item.formCall.recoveryStatus === -1 ? '请选择' : recoverOptions[item.formCall.recoveryStatus] }}
								</text>
							</view>
						</picker>

					</view>
					<view class="form-item">
						<view class="picker-label">
							<text class="required-star">*</text>
							<text class="label">遵医嘱情况:</text>
						</view>
						<picker mode="selector" :value="item.formCall.complianceStatus" :range="followOptions"
							@change="handleStatusChange(item, $event,'complianceStatus')">
							<view class="picker-input">
								<text
									:class="[item.formCall.complianceStatus === -1 ? 'placeholder-text' : 'value-text']">
									{{ item.formCall.complianceStatus === -1 ? '请选择' : followOptions[item.formCall.complianceStatus] }}
								</text>
							</view>
						</picker>

					</view>
					<view class="form-item">
						<text class="label">备注:</text>
						<textarea class="textarea margin-bottom-1" v-model="item.formCall.suggestion"
							placeholder="如漏服原因、调整用药具体操作等..."></textarea>
						<text class="orange-hint">如身体较差需说明具体症状: 伤口红肿、头晕等</text>
					</view>
					<view class="next-btn" @click="nextStep(item)"> 下一步</view>
					<!-- <button> </button> -->
				</view>
				<!-- step3 第三步：服务包记录 -->
				<view v-if="item.currentStep===3" class="step-content">
					<view class="form-item">
						<view class="picker-label">
							<text class="required-star">*</text>
							<text class="label">当前服务包反馈:</text>
						</view>
						<picker mode="selector" :value="item.formCall.pkgFeedIndex" :range="pkgFeedOptions"
							@change="handleStatusChange(item, $event,'pkgFeedIndex')">
							<view class="picker-input">
								<text :class="[item.formCall.pkgFeedIndex === -1 ? 'placeholder-text' : 'value-text']">
									{{ item.formCall.pkgFeedIndex === -1 ? '请选择' : pkgFeedOptions[item.formCall.pkgFeedIndex] }}
								</text>
							</view>
						</picker>
					</view>
					<view class="form-item">
						<view class="picker-label">
							<text class="required-star">*</text>
							<text class="label">二次购买意向:</text>
						</view>
						<picker mode="selector" :value="item.formCall.buyIndex" :range="buyOptions"
							@change="handleStatusChange(item, $event,'buyIndex')">
							<view class="picker-input">
								<text :class="[item.formCall.buyIndex === -1 ? 'placeholder-text' : 'value-text']">
									{{ item.formCall.buyIndex === -1 ? '请选择' : buyOptions[item.formCall.buyIndex] }}
								</text>
							</view>
						</picker>

					</view>
					<view class="form-item">
						<text class="label">备注:</text>
						<textarea class="textarea" v-model="item.formCall.demand"
							placeholder="备注未使用原因、购意向购买时间、顾虑点等..."></textarea>
					</view>
					<view class="next-btn" @click="nextStep(item)"> 下一步</view>
				</view>
				<!-- step4 第四步：评价满意度 -->
				<view v-if="item.currentStep===4" class="step-content">
					<view class="eval-box">
						<view class="eval-left">
							<text class="eval-title">电话评价结果</text>
							<text class="eval-sub">患者已通过电话按键/语音确认</text>
						</view>
						<view class="eval-tag">
							<u-icon class="margin-right-5" name="checkmark-circle" color="#008833" :bold="true"
								size="25rpx"></u-icon>
							<view>非常满意</view>
						</view>
					</view>
					<view class="form-item">
						<text class="label">改进建议:</text>
						<textarea class="textarea" v-model="item.formCall.suggest"
							placeholder="患者反馈的改进建议..."></textarea>
					</view>
					<view class="form-item">
						<text class="label">其他需求记录:</text>
						<textarea class="textarea" v-model="item.formCall.demand2"
							placeholder="记录患者的其他相关需求..."></textarea>
					</view>
					<view class="btn-row-two">
						<button class="btn-cancel mr-24" @click="closeStepPanel(item)">取消</button>
						<button class="btn-save" @click="handleSave(item)">保存</button>
					</view>
					<button class="btn-save-push" @click="handleSavePush(item)">️ 保存并推送至沟通群</button>
				</view>
			</view>
		</view>
		<view class="empty-tip" v-if="filterList.length === 0">暂无匹配患者</view>
		<view v-if="showCallLoading" class="call-loading-mask">
			<view class="call-loading-content">
				<view class="ping-ring"></view>

				<view class="phone-wrap">
					<view class="phone-icon-wrap">
						<u-icon class="phone-icon" name="phone-fill" color="#2979ff" size="120rpx"></u-icon>
					</view>
				</view>

				<text class="main-text">正在发起安全外呼...</text>
				<text class="sub-text">ENCRYPTED LINE CONNECTING</text>
			</view>
		</view>
		<my-tabbar :current="0"></my-tabbar>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>
<script>
	import {
		getConversationsStatsApi,
		getCsPatientsApi
	} from '@/api/frontApikit.js'
	import myTabbar from '@/components/my‑tabbar/my‑tabbar.vue'
	export default {
		options: {
			styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
		},
		components: {
			myTabbar
		},
		data() {
			return {
				searchKey: "",
				showCallLoading: false,
				formValue: null,
				show: false,
				highIntent: 0,
				pendingCall: 0,
				pendingReply: 0,
				columns: [{
						label: "待沟通",
						value: 1
					},
					{
						label: "已完成",
						value: 2
					}
				],
				// 患者列表
				list: [],
				// 步骤条
				stepList: [{
						title: "第一步电话沟通"
					},
					{
						title: "第二步记录信息"
					},
					{
						title: "第三步服务包相关记录"
					},
					{
						title: "第四步评价以及满意度记录"
					}
				],
				currentTaskId: '',
				taskId: '',
				pollTimer: null,
				pollTimer2: null,
				tipMsg1: '',
				tipMsg1: '',
				callStatusList: ["沟通成功", "沟通失败"],
				medicOptions: ["按时用药", "间断用药", "未用药"],
				recoverOptions: ["恢复良好", "一般恢复", "恢复较差"],
				followOptions: ["完全遵守", "部分遵守", "未遵医嘱"],
				failOptions: ["无人接听", "号码错误/空号", "患者/家属拒绝沟通", "通话中断 (信号/其他)"],
				pkgFeedOptions: ["服务满意", "部分不满意", "很不满意"],
				buyOptions: ["强烈意向", "一般意向", "无意向"]
			}
		},
		onUnload() {
			if (this.pollTimer) {
				clearInterval(this.pollTimer)
				this.pollTimer = null
			}
			if (this.pollTimer2) {
				clearInterval(this.pollTimer2)
				this.pollTimer2 = null
			}


		},
		computed: {
			filterList() {
				let arr = [...this.list]
				// 1. 卡片筛选
				if (this.activeFilter) {
					arr = arr.filter(item => item.intentType === this.activeFilter)
				}
				// 2. 搜索过滤
				const key = this.searchKey?.trim()
				if (key) {
					const lowKey = key.toLowerCase()
					// 映射：中文/小写英文 匹配后端大写 HIGH MEDIUM LOW
					const levelMap = {
						'高意向': 'high',
						'high': 'high',
						'中等意向': 'medium',
						'中意向': 'medium',
						'medium': 'medium',
						'低意向': 'low',
						'low': 'low'
					}
					arr = arr.filter(item => {
						const matchName = item.name && item.name.toLowerCase().includes(lowKey)
						const matchIntent = item.purchaseIntent && item.purchaseIntent.toLowerCase().includes(
							lowKey)
						const matchPhone = item.phone && item.phone.includes(key)

						// 匹配意向等级：把后端purchaseIntent转小写对比
						const targetLevel = levelMap[lowKey]
						const matchLevel = targetLevel ? item.purchaseIntent?.toLowerCase() === targetLevel : false

						return matchName || matchIntent || matchPhone || matchLevel
					})
				}
				return arr
			}
		},


		onLoad() {

			this.getList()
			this.getConversationsStats()
		},
		methods: {
			async getList() {

				try {
					const listData = await getCsPatientsApi({
						page: 1,
						pageSize: 20
					})
					console.log('列表返回：', listData)

					this.list = listData.list
				} catch (e) {
					console.log('getList报错：', e)
				}
			},
			async getConversationsStats() {
				try {
					const statsData = await getConversationsStatsApi()
					console.log('统计数据', statsData);
					this.highIntent = statsData.highIntent ?? 0
					this.pendingCall = statsData.pendingCall ?? 0
					this.pendingReply = statsData.pendingReply ?? 0
				} catch (e) {
					console.log('统计接口报错', e)
				}
			},



			handleStatusChange(item, e, value) {
				this.$set(item.formCall, value, e.detail.value)
			},
			// 状态  表单清空
			clearCallstatus() {
				this.list.forEach(item => {
					item.showStepPanel = false
					item.callLoading = false
					item.currentStep = 1
					item.callSuccess = false
					item.formCall = {
						id: 0,
						taskId: 0,
						patientId: 0,
						csId: 0,
						callStatus: "",
						statusIndex: -1, //沟通成功or失败
						failReason: -1, //沟通失败原因  select
						failRemark: "",
						durationSec: 0,
						medicationStatus: -1, //用药情况
						recoveryStatus: -1, //身体恢复情况
						complianceStatus: -1, //遵医嘱情况:
						suggestion: "",
						pkgFeedIndex: -1, //当前服务包反馈
						buyIndex: -1, //二次购买意向
						demand: "",
						suggest: "",
						demand2: "",
						phone: '024-01234567'
					}
				})

			},
			routeTo(res) {
				console.log(res)
				const data = {
					id: res.id
				}
				let routeUrl = `/pages/index/chat` + `?data=` + encodeURIComponent(JSON.stringify(data))
				this.$safeJump(routeUrl)
			},

			onCallStatusChange(item, e) {
				item.formCall.statusIndex = Number(e.detail.value)
			},
			// 点击重新连接云端线路	  重新发起呼叫
			reconnect(item) {
				console.log(item)
				item.callLoading = true;
				this.$refs.uToast.show({
					message: "正在通过云端线路发起呼叫...\n正在为您生成加密虚拟保护号码",
					type: "success",
					duration: 1500,
					complete: () => {
						item.callLoading = false;
						item.callSuccess = true;
					}
				})

			},
			// 安全外呼
			async handleSafeCall(item) {
				this.currentTaskId = item.id
				this.showCallLoading = true
				try {
					console.log('1 准备调用safeCall')
					console.log('currentTaskId', this.currentTaskId)

					// 打印api方法
					console.log('safeCall函数', this.$api.safeCall)

					const res = await this.$api.safeCall({
						id: this.currentTaskId
					})
					console.log('2 请求返回', res)
					this.taskId = res.data.taskId
					this.pollCallStatus(item, res.data.taskId)

				} catch (err) {
					console.error('呼叫异常catch捕获', err)
					uni.showToast({
						title: '发起呼叫失败',
						icon: 'none'
					})
				}
				this.showCallLoading = false
			},
			// 轮询呼叫状态
			async pollCallStatus(item, taskId) {
				try {
					const res = await this.$api.getCallStatus({
						id: taskId
					})
					const info = res.data
					const status = info.status

					console.log('呼叫状态：', status)



					switch (status) {
						case 'waiting':
							this.tipMsg1 = "正在通过云端线路发起呼叫..."
							break
						case 'generating_virtual':
							this.tipMsg1 = "正在通过云端线路发起呼叫..."
							this.tipMsg2 = "正在为您生成加密虚拟保护号码"
							break
						case 'calling_agent':
							this.tipMsg1 = "正在呼叫您的手机"
							break
						case 'calling_customer':
							item.currentStep = 1
							break
						case 'connected':
							item.currentStep = 2;
							this.$set(item, 'callSuccess', true)
							this.$set(item.formCall, 'phone', 'xxxx')
							break
						case 'hangup':
						case 'fail':
							this.$set(item, 'callSuccess', false)
							// this.showCallModal = false
							return // 终止轮询
					}
					// 继续轮询
					setTimeout(() => {
						this.pollCallStatus()
					}, 1200)

				} catch (e) {
					setTimeout(() => {
						this.pollCallStatus()
					}, 1200)
				}
			},
			// 点击拨打
			openStepPanel(item) {
				console.log(item)
				if (item.btnClass == 'btn-gray') {

					this.handleSafeCall(item)

				} else {

					this.clearCallstatus()
					// console.log(this.list)
					item.showStepPanel = true
					item.currentStep = 1
					console.log(item.callSuccess)
					if (item.btnClass == "btn-green") {
						item.callLoading = true;
						this.$refs.uToast.show({
							message: "正在通过云端线路发起呼叫...\n正在为您生成加密虚拟保护号码",
							type: "success",
							duration: 1500,
							complete: () => {
								item.callLoading = false;
							}
						})

					} else {
						console.log(1111111111)
						item.callLoading = false;
					}
				}



			},

			closeStepPanel(item) {
				console.log(item.formCall)
				item.showStepPanel = false
				item.currentStep = 1

			},
			nextStep(item, val) {
				console.log(item.formCall);
				console.log(item.currentStep)
				console.log(val)
				if (item.currentStep == 1) {
					if (item.formCall.statusIndex == -1) {
						this.$refs.uToast.show({
							message: "请选择沟通状态",
							type: "error",
							duration: 1500,

						})
					} else if (item.formCall.statusIndex == 1) {
						console.log(222222222)
						if (item.formCall.failReason == -1) {
							this.$refs.uToast.show({
								message: "请选择沟通失败原因",
								type: "error",
								duration: 1500,

							})
						} else {
							if (item.currentStep < 4) {
								item.currentStep++
							}
						}
					} else {
						if (item.currentStep < 4) {
							item.currentStep++
						}
					}

				} else if (item.currentStep == 2) {
					if (item.formCall.medicationStatus == -1) {
						this.$refs.uToast.show({
							message: "请选择用药情况",
							type: "error",
							duration: 1500,

						})
					} else if (item.formCall.recoveryStatus == -1) {
						this.$refs.uToast.show({
							message: "请选择身体恢复情况",
							type: "error",
							duration: 1500,

						})
					} else if (item.formCall.complianceStatus == -1) {
						this.$refs.uToast.show({
							message: "请选择遵医嘱情况",
							type: "error",
							duration: 1500,

						})
					} else {
						if (item.currentStep < 4) {
							item.currentStep++
						}
					}

				} else if (item.currentStep == 3) {
					if (item.formCall.pkgFeedIndex == -1) {
						this.$refs.uToast.show({
							message: "请选择当前服务包反馈",
							type: "error",
							duration: 1500,

						})
					} else if (item.formCall.buyIndex == -1) {
						this.$refs.uToast.show({
							message: "请选择二次购买意向",
							type: "error",
							duration: 1500,

						})
					} else {
						if (item.currentStep < 4) {
							item.currentStep++
						}
					}
				}

			},
			handleSave(item) {
				uni.showToast({
					title: "保存成功"
				})
				this.closeStepPanel(item)
			},
			handleSavePush(item) {
				this.$refs.uToast.show({
					message: "已成功推送至患者沟通群\n康复进度记录已同步，点击患者详情可查看完整对话。",
					type: "success",
					duration: 1500,
					// complete: () => {
					// 	this.$safeJump(routeUrl)
					// }
				})

				this.closeStepPanel(item)
			}
		}
	}
</script>
<style scoped>
	.search-input {
		background-color: #f7f7f7;
		border-radius: 8rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
	}

	.empty-tip {
		text-align: center;
		color: #999;
		padding: 60rpx 0;
		font-size: 28rpx;
	}

	.call-loading-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(41, 121, 255, 0.88);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.call-loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.ping-ring {
		position: absolute;
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.4);
		animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	.phone-wrap {
		position: relative;
		width: 180rpx;
		height: 180rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
		z-index: 2;
	}

	.phone-wrap .phone-icon {
		animation: bounce 1.2s infinite ease-in-out;
	}

	.phone-icon-wrap {
		width: 180rpx;
		height: 180rpx;
		background-color: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
	}

	.main-text {
		font-size: 40rpx;
		color: #ffffff;
		font-weight: 600;
		margin-bottom: 16rpx;
		margin-top: 80rpx;
		animation: pulse 2s infinite ease-in-out;
	}

	.sub-text {
		font-size: 22rpx;
		color: #ffffff;
		opacity: 0.85;
		letter-spacing: 2rpx;
	}

	@keyframes ping {
		0% {
			transform: scale(1);
			opacity: 0.7;
		}

		75%,
		100% {
			transform: scale(3);
			opacity: 0;
		}
	}



	@keyframes pulse {

		0%,
		100% {
			opacity: 0.55;
			transform: scale(1);
		}

		50% {
			opacity: 1;
			transform: scale(1.06);
		}
	}

	@keyframes bounce {

		0%,
		100% {
			animation-timing-function: cubic-bezier(.8, 0, 1, 1);
			transform: translateY(-25%);
		}

		50% {
			animation-timing-function: cubic-bezier(0, 0, .2, 1);
			transform: none;
		}

	}


	::v-deep .u-toast__content__text {
		line-height: 1.4 !important;
		font-size: 26rpx;
	}



	.top-tip {
		background: #e8f4ff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		position: absolute;
		top: 0;
		left: 60rpx;
		right: 60rpx;
		z-index: 99;
		display: flex;
		align-items: center;
	}

	.tip-icon {
		margin-right: 10rpx;
	}

	.tip-text {
		display: block;
		font-size: 30rpx;
		color: #0052cc;
		line-height: 1.8;
	}

	.step-panel {
		border-radius: 32rpx;
		margin: 30rpx 0;
		border: 1px solid #ddd;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.bar-top {
		padding: 30rpx;
	}

	.step-bar {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.step-item {
		display: flex;
		align-items: center;
		flex-grow: 0;
		flex-shrink: 0;
		flex-basis: 0;
		flex: 1;
	}

	.step-last {
		flex: 0 0 auto;
	}

	.step-circle {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		border: 4rpx solid #ccd8f0;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		flex-shrink: 0;
	}

	.step-circle.active {
		border-color: #2478f5;
		background: #fff;
		color: #2478f5;
	}

	.step-circle.done {
		background: #2478f5;
		border-color: #2478f5;
		color: #fff;
	}

	.step-line {
		flex: 1;
		height: 4rpx;
		background: #ccd8f0;
		margin: 0 16rpx;
	}

	.step-line.done {
		background: #2478f5;
	}

	.page-workbench .bg-blue {
		background-color: #f3f8fe;
	}

	.step-title {
		text-align: center;
		font-size: 25rpx;
		color: #2152e7;
		padding: 10rpx 30rpx;
		border-radius: 20rpx;
		font-weight: bold;
		background-color: #e8f2fe;
		width: fit-content;
		margin: 20rpx auto;
	}

	.step-content {
		padding: 30rpx;
		background-color: #fff;
	}

	.call-loading-box {
		text-align: center;
		padding: 60rpx 20rpx;
	}

	.call-icon {
		width: 140rpx;
		height: 140rpx;
		background: #2478f5;
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 60rpx;
		margin: 0 auto 30rpx;
	}

	.call-text {
		font-size: 32rpx;
		color: #2478f5;
		display: block;
	}

	.call-en {
		font-size: 20rpx;
		color: #2478f5;
		margin-top: 10rpx;
	}

	.call-connected {
		padding: 30rpx;
	}

	.call-state-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.state-label {
		font-size: 25rpx;
		color: #0052cc;
		display: flex;
		line-height: 40rpx;
	}

	.state-tag {
		font-size: 20rpx;
		color: #28a745;
		background: #e6f9ed;
		padding: 6rpx 16rpx;
		border-radius: 12rpx;
	}

	.state-tag-gray {
		color: #abaeb2;
		background: #f3f4f6;
	}

	.call-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.phone-box {
		flex: 1;
		border: 4rpx solid #00a63e;
		border-radius: 20rpx;
		text-align: center;
		font-size: 30rpx;
		color: #00a63e;
		font-weight: bold;
		display: flex;
		height: 70rpx;
		line-height: 70rpx;
	}

	.page-workbench .call-row .call-btn {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 30rpx;
		border: 2px solid #155dfc;
		flex: 1;
	}

	.picker-wrapper .picker-item {
		height: 70rpx;
		line-height: 70rpx;
		border-radius: 20rpx;
		padding: 0 30rpx;
		background: #fff;
		border: 2px solid #e4e7ed;

	}

	.picker-wrapper uni-picker[disabled] {
		background: #f6f9fc;
		border: 2px solid #e4e7ed;
		color: #abaeb2;
	}


	.picker-btn {
		background: #fff;
		border: 2rpx solid #ccd8f0;
		border-radius: 16rpx;
		padding: 0 30rpx;
		font-size: 20rpx;
		height: 80rpx;
		line-height: 80rpx;
	}

	.reconnect-tip {
		margin: 30rpx 0;
		text-align: center;
	}

	.link {
		color: #2b7fff;
		font-size: 32rpx;
		font-weight: bold;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.picker-label {
		display: flex;
		align-items: center;
		// margin-bottom:12rpx;
	}

	.required-star {
		color: #f53f3f;
		/*红色星号*/
		font-size: 30rpx;
		margin-right: 8rpx;
	}

	.label {
		font-size: 25rpx;
		color: #909399;
		display: block;
		margin-bottom: 14rpx;
	}

	.picker-input {
		background: #f9fafb;
		border: 2rpx solid #e4e7ed;
		border-radius: 16rpx;
		padding: 16rpx;
		font-size: 25rpx;
	}

	.textarea {
		width: 100%;
		background: #f9fafb;
		border: 2rpx solid #e4e7ed;
		border-radius: 20rpx;
		padding: 24rpx;
		min-height: 160rpx;
		font-size: 30rpx;
		box-sizing: border-box;
	}

	.orange-hint {
		font-size: 20rpx;
		color: #ff7800;
	}

	.next-btn {
		background: #fff;
		border: 1rpx solid #e4e7ed;
		border-radius: 20rpx;
		font-size: 34rpx;
		margin-top: 20rpx;
		text-align: center;
		height: 80rpx;
		line-height: 80rpx;
	}

	.eval-box {
		background: #e6f9ed;
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.eval-title {
		font-size: 24rpx;
		color: #008833;
		font-weight: bold;
	}

	.eval-sub {
		font-size: 16rpx;
		color: #28a745;
		display: block;
		margin-top: 6rpx;
	}

	.eval-tag {
		background: #fff;
		border: 2rpx solid #28c76f;
		border-radius: 16rpx;
		padding: 14rpx 14rpx;
		font-size: 20rpx;
		line-height: 25rpx;
		font-weight: bold;
		color: #008833;
		display: flex;
	}

	.btn-row-two {
		display: flex;
		margin-top: 20rpx;
	}

	.btn-cancel {
		flex: 1;
		background: #fff;
		border: 2rpx solid #ddd;
		border-radius: 20rpx;
		font-size: 30rpx;
		color: #666;
		height: 80rpx;
	}

	.btn-save {
		flex: 1;
		background: #2478f5;
		color: #fff;
		border: none;
		border-radius: 20rpx;
		height: 80rpx;
		font-size: 30rpx;
	}

	.btn-save-push {
		width: 100%;
		background: #2478f5;
		color: #fff;
		border: none;
		margin-top: 20rpx;
		border-radius: 20rpx;
		height: 80rpx;
		font-size: 30rpx;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;
	}

	.sub-title {
		font-size: 28rpx;
		color: #888;
		margin-top: 8rpx;
	}

	.avatar-box {
		background: #fff;
		padding: 30rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.avatar-box .dot {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
	}

	.dot {
		width: 18rpx;
		height: 18rpx;
		background: #28c76f;
		border-radius: 50%;
	}

	.stat-row {
		display: flex;
		margin-top: 50rpx;
	}

	.stat-item {
		flex: 1;
		background: #fff;
		border-radius: 24rpx;
		text-align: center;
		padding: 30rpx 10rpx;
		position: relative;
	}

	.stat-row .dot {
		position: absolute;
		top: 40rpx;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.dot.red {
		background: #f53f3f;
	}

	.dot.orange {
		background: #ff9500;
	}

	.dot.green {
		background: #28c76f;
	}

	.page-workbench .badge-num {
		position: absolute;
		top: 0;
		right: -25%;
		transform: translate(-50%, -50%);
		z-index: 999;
		width: fit-content;
	}

	.badge-num ::v-deep .u-badge {
		padding: 8rpx 20rpx;
	}

	.num {
		font-size: 52rpx;
		font-weight: bold;
		display: block;
		margin: 10rpx 0;
	}

	.stat-label {
		font-size: 26rpx;
		color: #666;
	}

	.record-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 40rpx 0 24rpx;
	}

	.record-title {
		font-size: 40rpx;
		font-weight: bold;
	}

	.tip {
		font-size: 28rpx;
		color: #888;
	}

	.list-scroll {
		height: calc(100vh - 560rpx);
	}

	.record-item {
		background: #fff;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		padding: 32rpx 24rpx;
		margin-bottom: 24rpx;
		position: relative;
	}

	.left-bar {
		width: 8rpx;
		height: 100rpx;
		background: transparent;
		border-radius: 4rpx;
		position: absolute;
		left: 0;
	}

	.left-bar.active {
		background: #f53f3f;
	}

	.short-avatar {
		width: 80rpx;
		height: 80rpx;
		background: #f6f7f8;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		color: #909399;
		margin-right: 24rpx;
		font-weight: bold;
	}

	.info {
		flex: 1;
		margin-right: 24rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.name {
		font-size: 30rpx;
		font-weight: bold;
	}

	.intent-tag-wrapper {
		flex: 1;
	}

	.intent-tag {
		font-size: 24rpx;
		padding: 4rpx 14rpx;
		border-radius: 12rpx;
	}

	.tag-HIGH {
		background: #ffe9e9;
		color: #e53935;
	}

	.tag-MEDIUM {
		background: #fff3e0;
		color: #f57c00;
	}

	.tag-LOW {
		background: #f0f1f3;
		color: #666;
	}

	.msg-icon {
		font-size: 36rpx;
	}

	.desc-line {
		font-size: 20rpx;
		color: #333;
		margin-bottom: 8rpx;
	}

	.sub-desc {
		font-size: 20rpx;
		color: #909399;
	}

	.btn-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 180rpx;
	}

	.page-workbench .call-btn {
		border: none;
		color: #fff;
		border-radius: 20rpx;
		padding: 16rpx 30rpx;
		font-size: 30rpx;
		margin-bottom: 8rpx;
		display: flex;
	}

	.page-workbench .btn-green {
		background: #00a63e;
	}

	.page-workbench .btn-blue {
		background: #155dfc;
	}

	.page-workbench .btn-gray {
		background: #f3f4f6;
		color: #909399;
	}

	.page-workbench .btn-tip {
		font-size: 20rpx;
		color: #909399;
	}

	.bottom-space {
		height: 160rpx;
	}
</style>