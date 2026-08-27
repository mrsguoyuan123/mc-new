<template>
	<view class="page-workbench page-content">
		<view v-if="topTip.show" class="top-tip">
			<view class="tip-close" @click="topTip.show=false">✕</view>
			<view class="tip-icon">ℹ️</view>
			<view class="tip-text">{{topTip.text1}}</view>
			<view class="tip-text">{{topTip.text2}}</view>
		</view>

		<!-- 头部标题 + 头像 -->
		<view class="page-header">
			<view>
				<text class="font-l font-bold">客服工作台</text>
				<view class="margin-top-5 font-m font-info">CS WORKBENCH</view>
			</view>
			<view class="avatar-box">
				<text class="avatar-icon">
					<u-icon name="account" color="#909399" bold="true" size="50rpx"></u-icon>
				</text>
				<view class="dot"></view>
			</view>
		</view>

		<!-- 搜索框 -->
		<view class="margin-30 ">
			<u--input placeholder="搜索患者姓名、意向、手机号" shape="" prefixIcon="search"
				prefixIconStyle="font-size: 22px;color: #909399"></u--input>
		</view>

		<!-- 统计数字卡片组 -->
		<view class="stat-row">
			<view class="stat-item">
				<view class="dot red"></view>
				<u-badge class="badge" bgColor="#f53f3f" max="99" value="3"></u-badge>
				<text class="num">8</text>
				<text class="stat-label">高意向</text>
			</view>
			<view class="stat-item">
				<view class="dot orange"></view>
				<u-badge class="badge" bgColor="#f53f3f" max="99" value="8"></u-badge>
				<text class="num">15</text>
				<text class="stat-label">待电话沟通</text>
			</view>
			<view class="stat-item">
				<view class="dot green"></view>
				<u-badge class="badge" bgColor="#f53f3f" max="99" value="143"></u-badge>
				<text class="num">23</text>
				<text class="stat-label">待信息回复</text>
			</view>
		</view>

		<!-- 沟通记录标题 -->
		<view class="record-head">
			<text class="font-m font-bold">沟通记录 (6)</text>
			<text class="tip font-s font-info">实时同步意向</text>
		</view>

		<!-- 沟通记录列表 -->
		<scroll-view scroll-y class="list-scroll">
			<view v-for="(item, idx) in list" :key="idx">
				<view class="record-item">
					<!-- 左侧竖条标记 -->
					<view class="left-bar" :class="{active: item.highlight}"></view>
					<!-- 头像缩写 -->
					<view class="short-avatar">{{ item.name.charAt(0) }}</view>
					<view class="info">
						<view class="name-row">
							<text class="name">{{ item.name }}</text>
							<view class="intent-tag-wrapper">
								<text class="intent-tag" :class="item.intentClass">{{ item.intent }}</text>
							</view>
							<text class="custom-icon custom-icon-message" style="font-size:45rpx;color:#1ec76f;"></text>
						</view>
						<view class="desc-line">
							<text class="desc">{{ item.operation }} | {{ item.hospital }}</text>
						</view>
						<view class="sub-desc">
							<text>主刀: {{ item.doctor }} | 地区: {{ item.area }}</text>
						</view>
					</view>
					<view class="btn-group">

						<u-button class="call-btn" :class="item.btnClass" type="primary" icon="phone-fill"
							@click="openStepPanel(item)" text="拨打"></u-button>
						<!-- <button icon="phone" class="call-btn" :class="item.btnClass">
						
						</button> -->
						<text class="btn-tip">{{ item.btnTip }}</text>
					</view>

				</view>
				<!-- ========== 多步骤向导面板 ========== -->
				<view v-if="item.showStepPanel" class="step-panel">
					<!-- 步骤条 -->
					<view class=" bg-blue bar-top">
						<view class="step-bar">
							<view class="step-item" v-for="(s,si) in stepList" :key="si">
								<view class="step-circle" :class="{done:currentStep>si+1,active:currentStep===si+1}">
									<text v-if="currentStep>si+1">✓</text>
									<text v-else>{{si+1}}</text>
								</view>
								<view class="step-line" :class="{done:currentStep>si+1}"></view>
							</view>
						</view>
						<view class="step-title">{{stepList[currentStep-1].title}}</view>
					</view>

					<!-- step1 第一步：电话沟通 -->
					<view v-if="currentStep===1" class="step-content">
						<view v-if="callLoading" class="call-loading-box radius-15 bg-blue border-blue">
							<u-icon class="call-icon" name="phone-fill" color="white" bold="true" size="80rpx"></u-icon>
							<text class="call-text">正在为您呼叫患者...</text>
							<text class="call-en">SECURE LINE CONNECTING</text>
						</view>
						<view v-else class="call-connected bg-blue border-blue radius-15">
							<view class="call-state-row">
								<view class="state-label">
									<u-icon class="margin-right-5" name="phone" color="#0052cc" bold="true"
										size="40rpx"></u-icon>
									<view>沟通线路状态</view>
								</view>
								<text class="state-tag">●线路已接通</text>
							</view>
							<view class="call-row">
								<view class="phone-box">
									<u-icon name="phone" color="#00a63e" bold="true" size="50rpx"></u-icon>
									<view>
										{{form1.phone}}
									</view>
								</view>
								<picker :value="form1.statusIndex" :range="callStatusList" @change="onCallStatusChange">
									<view class="picker-btn">{{callStatusList[form1.statusIndex]}}</view>
								</picker>
							</view>
							<view class="reconnect-tip">
								<text>呼叫失败？</text>
								<text class="link">重新连接云端线路</text>
							</view>
						</view>
						<view v-show="form1.statusIndex == 1">
							<view class="form-item">
								<text class="label">沟通失败原因:</text>
								<picker :value="formCall.failReason" :range="failOptions"
									@change="e=>formCall.failReason=e.detail.value">
									<view class="picker-input">{{failOptions[formCall.failReason]}}</view>
								</picker>
							</view>
							<view class="form-item">
								<text class="label">备注:</text>
								<textarea class="textarea" v-model="formCall.failRemark"
									placeholder="如漏服原因、调整用药具体操作等..."></textarea>
							</view>
						</view>
						<button class="next-btn" @click="nextStep">下一步 </button>
					</view>

					<!-- step2 第二步：记录信息 -->
					<view v-if="currentStep===2" class="step-content">
						<view class="form-item">
							<text class="label">用药情况:</text>
							<picker mode="selector" :value="formCall.medicationStatus" :range="medicOptions"
								@change="e=>formCall.medicationStatus=e.detail.value">
								<view class="picker-input">{{medicOptions[formCall.medicationStatus]}}</view>
							</picker>

						</view>
						<view class="form-item">
							<text class="label">身体恢复情况:</text>
							<picker :value="formCall.recoveryStatus" :range="recoverOptions"
								@change="e=>formCall.recoveryStatus=e.detail.value">
								<view class="picker-input">{{recoverOptions[formCall.recoveryStatus]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">遵医嘱情况:</text>
							<picker :value="formCall.complianceStatus" :range="followOptions"
								@change="e=>formCall.complianceStatus=e.detail.value">
								<view class="picker-input">{{followOptions[formCall.complianceStatus]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">备注:</text>
							<textarea class="textarea margin-bottom-1" v-model="formCall.suggestion"
								placeholder="如漏服原因、调整用药具体操作等..."></textarea>
							<text class="orange-hint">如身体较差需说明具体症状: 伤口红肿、头晕等</text>
						</view>
						<button class="next-btn" @click="nextStep">下一步 </button>
					</view>

					<!-- step3 第三步：服务包记录 -->
					<view v-if="currentStep===3" class="step-content">
						<view class="form-item">
							<text class="label">当前服务包反馈:</text>
							<picker :value="formCall.pkgFeedIndex" :range="pkgFeedOptions"
								@change="e=>formCall.pkgFeedIndex=e.detail.value">
								<view class="picker-input">{{pkgFeedOptions[formCall.pkgFeedIndex]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">二次购买意向:</text>
							<picker :value="formCall.buyIndex" :range="buyOptions"
								@change="e=>formCall.buyIndex=e.detail.value">
								<view class="picker-input">{{buyOptions[formCall.buyIndex]}}</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">备注:</text>
							<textarea class="textarea" v-model="formCall.demand"
								placeholder="备注未使用原因、购意向购买时间、顾虑点等..."></textarea>
						</view>
						<button class="next-btn" @click="nextStep">下一步 ></button>
					</view>

					<!-- step4 第四步：评价满意度 -->
					<view v-if="currentStep===4" class="step-content">
						<view class="eval-box">
							<view class="eval-left">
								<text class="eval-title">电话评价结果</text>
								<text class="eval-sub">患者已通过电话按键/语音确认</text>
							</view>
							<view class="eval-tag">
								<u-icon class="margin-right-5" name="checkmark-circle" color="#008833" bold="true"
									size="25rpx"></u-icon>
								<view>非常满意</view>
							</view>

						</view>
						<view class="form-item">
							<text class="label">改进建议:</text>
							<textarea class="textarea" v-model="formCall.suggest" placeholder="患者反馈的改进建议..."></textarea>
						</view>
						<view class="form-item">
							<text class="label">其他需求记录:</text>
							<textarea class="textarea" v-model="formCall.demand2"
								placeholder="记录患者的其他相关需求..."></textarea>
						</view>
						<view class="btn-row-two">
							<button class="btn-cancel" @click="closeStepPanel(item)">取消</button>
							<button class="btn-save" @click="handleSave">保存</button>
						</view>
						<button class="btn-save-push" @click="handleSavePush">️ 保存并推送至沟通群</button>
					</view>
				</view>


			</view>

		</scroll-view>
		<my-tabbar :current="0"></my-tabbar>
	</view>
</template>

<script>
	import myTabbar from '@/components/my‑tabbar/my‑tabbar.vue'

	export default {
		components: {
			myTabbar
		},
		data() {
			return {
				// 患者列表
				list: [{
						name: '张三',
						intent: '高意向',
						intentClass: 'tag-high',
						highlight: true,
						operation: '痔疮手术',
						hospital: '浙一医院',
						doctor: '李医生',
						area: '杭州',
						btnClass: 'btn-green',
						btnTip: '首次触达 (强制记录)',
						showStepPanel: false
					},
					{
						name: '李四',
						intent: '中等意向',
						intentClass: 'tag-mid',
						highlight: false,
						operation: '骨折修复',
						hospital: '瑞金医院',
						doctor: '王医生',
						area: '上海',
						btnClass: 'btn-blue',
						btnTip: '二次采购 (拨号已激活)',
						showStepPanel: false
					},
					{
						name: '王五',
						intent: '低意向',
						intentClass: 'tag-low',
						highlight: false,
						operation: '支架手术',
						hospital: '协和医院',
						doctor: '陈医生',
						area: '北京',
						btnClass: 'btn-blue',
						btnTip: '待跟进',
						showStepPanel: false
					},
					{
						name: '赵六',
						intent: '已购',
						intentClass: 'tag-low',
						highlight: false,
						operation: '支架手术',
						hospital: '协和医院',
						doctor: '陈医生',
						area: '北京',
						btnClass: 'btn-blue',
						btnTip: '待跟进',
						showStepPanel: false
					}
				],
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
				currentStep: 1,
				callLoading: false,
				//顶部提示
				topTip: {
					show: false,
					text1: "正在通过云端线路发起呼叫...",
					text2: "正在为您生成加密虚拟保护号码"
				},
				//通话表单
				formCall: {
					id: 0,
					taskId: 0,
					patientId: 0,
					csId: 0,
					callStatus: "",
					failReason: 0,
					durationSec: 0,
					medicationStatus: 0,
					recoveryStatus: 1,
					complianceStatus: 1,
					followUpDemand: 1,
					satisfaction: 0,
					suggestion: "步骤二",
					pushToGroup: 0,
					createTime: "",
					pkgFeedIndex: 0,
					buyIndex: 0,
					remark: "步骤四",
					suggest: "改进建议",
					demand: "步骤三",
					demand2: "步骤四",
					failRemark: "失败原因"
				},
				callStatusList: ["沟通成功", "沟通失败"],
				form1: {
					phone: "0571‑53979574",
					statusIndex: 0
				},
				medicOptions: ["按时用药", "间断用药", "未用药"],
				recoverOptions: ["恢复良好", "一般恢复", "恢复较差"],
				followOptions: ["完全遵守", "部分遵守", "未遵医嘱"],
				failOptions: ["无人接听", "号码错误/空号", "患者/家属拒绝沟通", "通话中断 (信号/其他)"],
				pkgFeedOptions: ["服务满意", "部分不满意", "很不满意"],
				buyOptions: ["强烈意向", "一般意向", "无意向"]
			}
		},
		methods: {
			onCallStatusChange(e) {
				this.form1.statusIndex = Number(e.detail.value)
			},
			openStepPanel(item) {
				console.log(item)
				item.showStepPanel = true
				this.currentStep = 1
				this.callLoading = true
				this.topTip.show = true
				setTimeout(() => {
					this.callLoading = false
				}, 2000)
			},
			closeStepPanel(item) {
				console.log(this.formCall)
				item.showStepPanel = false
				this.currentStep = 1
				this.topTip.show = false
			},
			nextStep() {
				if (this.currentStep < 4) {
					this.currentStep++
				}
			},
			handleSave() {
				uni.showToast({
					title: "保存成功"
				})
				this.closeStepPanel()
			},
			handleSavePush() {
				this.topTip.show = true
				this.topTip.text1 = "已成功推送至患者沟通群"
				this.topTip.text2 = "康复进度记录已同步，点击患者详情可查看完整对话。"
				uni.showToast({
					title: "推送完成"
				})
				this.closeStepPanel()
			}
		}
	}
</script>

<style scoped>
	/*顶部提示框*/
	.top-tip {
		background: #e8f4ff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		position: relative;
	}

	.tip-close {
		position: absolute;
		top: 16rpx;
		right: 20rpx;
		font-size: 32rpx;
	}

	.tip-icon {
		font-size: 36rpx;
		position: absolute;
		left: 20rpx;
		top: 32rpx;
	}

	.tip-text {
		display: block;
		font-size: 30rpx;
		color: #0052cc;
		margin-left: 70rpx;
		line-height: 1.8;
	}





	/* ========== 步骤面板 ========== */
	.step-panel {
		/* background: #f0f6ff; */
		border-radius: 32rpx;
		/* padding: 40rpx 30rpx; */
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

	}

	.step-item {
		flex: 1;
		display: flex;
		align-items: center;
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
		margin: 20rpx 0 30rpx;
		padding: 10rpx 30rpx;
		border-radius: 20rpx;
		font-weight: bold;
		background-color: #e8f2fe;

	}

	.step-content {
		padding: 30rpx;
		background-color: #fff;
	}

	/* step1 呼叫中 */
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

	.call-row {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.phone-box {
		flex: 1;
		border: 4rpx solid #00a63e;
		border-radius: 20rpx;
		padding: 20rpx;
		font-size: 30rpx;
		color: #00a63e;
		font-weight: bold;
		display: flex;
	}

	.picker-btn {
		background: #fff;
		border: 2rpx solid #ccd8f0;
		border-radius: 16rpx;
		padding: 24rpx 10rpx;
		font-size: 20rpx;

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

	/* 表单通用 */
	.form-item {
		margin-bottom: 30rpx;
	}

	.label {
		font-size: 25rpx;
		color: #333;
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
		/* margin-top: 20rpx; */
	}

	.next-btn {
		/* width: 100%; */
		background: #fff;
		/* border: 2rpx solid #e4e7ed; */
		border-radius: 20rpx;
		/* padding: 28rpx; */
		font-size: 34rpx;
		margin-top: 20rpx;
	}

	/* step4 评价 */
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
		gap: 24rpx;
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



	/* 头部 */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;
	}

	.title {
		/* font-size:52rpx; */
		/* font-weight:bold; */
		/* color:#111; */
	}

	.sub-title {
		font-size: 28rpx;
		color: #888;
		margin-top: 8rpx;
	}

	.avatar-box {
		/*  width:110rpx;
  height:110rpx; */
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

	/* 统计卡片 */
	.stat-row {
		display: flex;
		gap: 24rpx;
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

	.page-workbench .badge {
		position: absolute;
		top: 0;
		right: -25%;
		padding: 10rpx 20rpx;
		transform: translate(-50%, -50%);
		z-index: 999;
		/* background: #f53f3f;
		color: #fff;
		border-radius: 100%;
		 */
		/* font-size: 24rpx; */
		/* line-height: 44rpx; */
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

	/* 沟通记录标题 */
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

	/* 列表项 */
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
		/* border: 1px solid ; */
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
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

	.tag-high {
		background: #ffe9e9;
		color: #e53935;
	}

	.tag-mid {
		background: #fff3e0;
		color: #f57c00;
	}

	.tag-low {
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
		padding: 16rpx 40rpx;
		font-size: 32rpx;
		margin-bottom: 8rpx;
	}

	.page-workbench .btn-green {
		background: #00a63e;
	}

	.page-workbench .btn-blue {
		background: #155dfc;
	}

	.page-workbench .btn-gray {
		background: #f3f4f6;
	}

	.page-workbench .btn-tip {
		font-size: 20rpx;
		color: #909399;
		/* transform: scale(0.8); */
	}

	.bottom-space {
		height: 160rpx;
	}
</style>