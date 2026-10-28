<template>
	<view class="sleep-page">
		<view v-if="pageLoading" class="page-loading">
			<view class="page-loading-spinner"></view>
			<text class="page-loading-text">正在加载睡眠评估...</text>
		</view>

		<view v-else-if="currentView === 'home'" class="home-view">
			<view :style="{ height: statusBarHeight + 'px' }"></view>

			<view class="psqi-card">
				<view class="psqi-head" @click="handlePrimaryAction">
					<view class="psqi-logo">
						<view class="ic ic-moon"></view>
					</view>
					<view class="psqi-heading">
						<view class="psqi-title-row">
							<text class="psqi-title">睡眠质量评估（PSQI）</text>
							<text :class="['finished-badge', statusBadgeClass]">{{ statusText }}</text>
						</view>
						<view class="assess-date">
							<view class="ic ic-calendar"></view>
							<text>最近评估日期：{{ reportDate || '暂无评估记录' }}</text>
						</view>
					</view>
					<view class="head-arrow">
						<view class="ic ic-arrow-right"></view>
					</view>
				</view>

				<view class="score-panel">
					<view class="score-main">
						<text class="score-label">评估总分：</text>
						<text class="score-num">{{ hasReport ? reportScore : '--' }}</text>
						<text class="score-total"> / 21 分</text>
						<text v-if="reportLevel" class="level-tag">{{ reportLevel }}</text>
					</view>
					<text class="score-advice">{{ reportSummary }}</text>
				</view>

				<view class="blue-btn report-btn" @click="handlePrimaryAction">
					<text>{{ primaryActionText }}</text>
					<view class="ic ic-arrow-right-white"></view>
				</view>
			</view>

			<view class="section-head">
				<view class="section-title-wrap">
					<view class="ic ic-spark-blue"></view>
					<text class="section-title">针对性睡眠改善建议</text>
				</view>
				<text class="section-note">基于 PSQI 结果生成</text>
			</view>

			<view v-for="item in suggestions" :key="item.title" class="advice-card">
				<view :class="['advice-icon', item.theme]">
					<view :class="['ic', item.icon]"></view>
				</view>
				<view class="advice-content">
					<view class="advice-title-row">
						<text class="advice-title">{{ item.title }}</text>
						<text class="advice-tag">{{ item.tag }}</text>
					</view>
					<text class="advice-text">{{ item.content }}</text>
				</view>
			</view>

			<view class="device-card">
				<view class="device-head">
					<view :class="['device-logo', deviceConnected ? 'connected' : '']">
						<view :class="['ic', deviceConnected ? 'ic-radar-green' : 'ic-radar-blue']"></view>
					</view>
					<view class="device-info">
						<view class="device-title-row">
							<text class="device-name">{{ deviceConnected ? 'SomnoGuard 睡眠监测仪' : '睡眠仪未连接' }}</text>
							<text :class="['device-state', deviceConnected ? 'is-connected' : '']">
								{{ deviceConnected ? '蓝牙已连接' : '蓝牙未连接' }}
							</text>
						</view>
						<text class="device-subtitle">
							{{ deviceConnected ? '已同步睡眠数据与夜间生命体征' : '连接后可同步睡眠数据与夜间生命体征' }}
						</text>
					</view>
				</view>
				<view class="device-desc-box"><text class="device-desc">{{ deviceDesc }}</text></view>
				<view class="blue-btn connect-device-btn" @click="toggleBluetooth">
					<view :class="['ic', deviceConnected ? 'ic-check-white' : 'ic-bluetooth-white']"></view>
					<text>{{ deviceConnected ? '已连接 · 点击断开' : '一键连接睡眠仪' }}</text>
				</view>
			</view>
		</view>

		<view v-else-if="currentView === 'questionnaire'" class="questionnaire-view">
			<view class="custom-header">
				<view :style="{ height: statusBarHeight + 'px' }"></view>
				<view class="nav-bar">
					<view class="nav-back" @click="handleNavBack">
						<view class="ic ic-back"></view><text>返回</text>
					</view>
					<view class="nav-center">
						<text class="nav-title">PSQI 睡眠质量评估</text>
						<text class="nav-subtitle">{{ currentStepMeta.subtitle }}</text>
					</view>
					<view class="save-entry" @click="showSaveConfirm = true">
						<view class="ic ic-save-blue"></view><text>暂存退出</text>
					</view>
				</view>
				<view class="progress-track">
					<view class="progress-inner" :style="{ width: progressPercent + '%' }"></view>
				</view>
			</view>

			<scroll-view scroll-y class="question-scroll">
				<view v-if="stepIndex === 0" class="question-card">
					<text class="part-kicker">第一部分·作息规律</text>
					<text class="part-title">作息信息采集</text>
					<text class="part-desc">请回忆您在最近1个月中大多数晚上的习惯作息：</text>

					<view class="question-block time-question">
						<text class="question-text">1. 通常晚上上床准备睡觉的时间：</text>
						<picker mode="time" :value="answers.bedTime" @change="onBedTimeChange">
							<view class="time-field"><text>{{ answers.bedTime }}</text>
								<view class="ic ic-clock-dark"></view>
							</view>
						</picker>
					</view>

					<view class="question-block option-question">
						<view class="question-head">
							<text class="question-text">2. 从上床到顺利入睡通常需要：</text>
							<text class="selected-summary">{{ selectedLatencySummary }}</text>
						</view>
						<view class="option-row">
							<view v-for="opt in latencyOptions" :key="opt.value"
								:class="['option-btn', answers.latency === opt.value ? 'selected' : '']"
								@click="answers.latency = opt.value">{{ opt.label }}</view>
						</view>
					</view>

					<view class="question-block time-question">
						<text class="question-text">3. 通常早上起床时间：</text>
						<picker mode="time" :value="answers.wakeTime" @change="onWakeTimeChange">
							<view class="time-field"><text>{{ answers.wakeTime }}</text>
								<view class="ic ic-clock-dark"></view>
							</view>
						</picker>
					</view>

					<view class="question-block option-question no-divider">
						<view class="question-head">
							<text class="question-text">4. 每夜通常实际睡眠时间（不包括醒着赖床）：</text>
							<text class="selected-summary">{{ selectedDurationSummary }}</text>
						</view>
						<view class="option-row">
							<view v-for="opt in durationOptions" :key="opt.value"
								:class="['option-btn', answers.duration === opt.value ? 'selected' : '']"
								@click="answers.duration = opt.value">{{ opt.label }}</view>
						</view>
					</view>
				</view>

				<view v-else-if="stepIndex === 1" class="question-card">
					<text class="part-kicker">第二部分·睡眠困扰 (第5题 a-e 项)</text>
					<text class="part-title">夜间身体与生理困扰</text>
					<text class="part-desc">在过去1个月中，您因为下列原因导致睡眠受阻的频率：</text>
					<view v-for="item in troubleAGroups" :key="item.key" class="trouble-block">
						<view>
							<text class="question-text">{{ item.code }}. {{ item.title }}</text>
							<text class="question-desc">{{ item.desc }}</text>
						</view>
						<view class="option-row four-options">
							<view v-for="opt in frequencyOptions" :key="opt.label"
								:class="['option-btn', answers[item.key] === opt.value ? 'selected' : '']"
								@click="answers[item.key] = opt.value">{{ opt.label }}</view>
						</view>
					</view>
				</view>

				<view v-else-if="stepIndex === 2" class="question-card">
					<text class="part-kicker">第二部分·睡眠困扰 (第5题 f-j 项)</text>
					<text class="part-title">术后疼痛与身心困扰</text>
					<text class="part-desc">特别是术后恢复期的切口疼痛与呼吸情况：</text>
					<view v-for="item in troubleBGroups" :key="item.key" class="trouble-block">
						<view>
							<text class="question-text">{{ item.code }}. {{ item.title }}</text>
							<text class="question-desc">{{ item.desc }}</text>
						</view>
						<view class="option-row four-options">
							<view v-for="opt in frequencyOptions" :key="opt.label"
								:class="['option-btn', answers[item.key] === opt.value ? 'selected' : '']"
								@click="answers[item.key] = opt.value">{{ opt.label }}</view>
						</view>
					</view>
				</view>

				<view v-else class="question-card last-card">
					<text class="part-kicker">第三部分·药物与日间感受 (6-9题)</text>
					<text class="part-title">主观体验与日间机能</text>
					<text class="part-desc">完成以下4题即可生成最终医学睡眠评估报告：</text>
					<view v-for="block in finalBlocks" :key="block.key" class="question-block option-question"
						:class="{ 'no-divider': block.key === 'energy' }">
						<text class="question-text">{{ block.title }}</text>
						<view class="option-row four-options">
							<view v-for="opt in block.options" :key="opt.label"
								:class="['option-btn', answers[block.key] === opt.value ? 'selected' : '']"
								@click="answers[block.key] = opt.value">{{ opt.label }}</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<view class="question-bottom">
				<view class="prev-btn" @click="prevStep">上一题</view>
				<view class="next-btn" @click="nextStep">
					<view v-if="stepIndex === 3" class="ic ic-spark-white"></view>
					<text>{{ currentStepMeta.button }}</text>
					<view v-if="stepIndex < 3" class="ic ic-arrow-right-white small"></view>
				</view>
			</view>
		</view>

		<view v-else-if="currentView === 'loading'" class="loading-view">
			<view class="custom-header">
				<view :style="{ height: statusBarHeight + 'px' }"></view>
				<view class="nav-bar simple">
					<view class="nav-back" @click="handleNavBack">
						<view class="ic ic-back"></view><text>返回</text>
					</view>
					<text class="nav-title">PSQI 睡眠质量评估</text>
					<view class="nav-placeholder"></view>
				</view>
			</view>
			<view class="loading-content">
				<view class="loading-circle">
					<view class="ic ic-pulse-white"></view>
				</view>
				<text class="loading-title">正在生成您的睡眠报告...</text>
				<text class="loading-desc">正在运用 PSQI 临床 7 维度模型对您的入睡效率、深浅睡眠阻碍及术后疼痛干扰进行多维交叉校准</text>
			</view>
		</view>

		<view v-else class="report-view">
			<view class="custom-header">
				<view :style="{ height: statusBarHeight + 'px' }"></view>
				<view class="nav-bar simple">
					<view class="nav-back" @click="handleNavBack">
						<view class="ic ic-back"></view><text>返回</text>
					</view>
					<text class="nav-title">PSQI 睡眠质量评估</text>
					<view class="nav-placeholder"></view>
				</view>
			</view>

			<scroll-view scroll-y class="report-scroll">
				<view class="report-hero">
					<view class="report-date-pill">
						<view class="ic ic-clock-gray"></view><text>{{ reportDate }}</text>
					</view>
					<view class="report-score-line">
					<text class="report-score">{{ reportScore }}</text><text class="report-score-total"> / 21 分</text>
					</view>
					<text class="level-tag report-level">{{ reportLevel }}</text>
					<view class="report-summary-box"><text>{{ reportSummary }}</text></view>
				</view>

				<view class="highlight-card">
					<view class="highlight-title-row">
						<view class="ic ic-alert-orange"></view><text class="highlight-title">突出关注的睡眠困扰维度</text>
					</view>
					<text class="highlight-desc">基于您的答题，系统检测到以下 2 个维度对您的术后睡眠造成了主要制约：</text>
					<view v-for="item in focusDimensions" :key="item.name" class="focus-row">
						<view>
							<text class="focus-name">{{ item.name }}</text>
							<text class="focus-desc">{{ item.desc }}</text>
						</view>
						<text class="focus-score">{{ item.score }} / 3 分</text>
					</view>
				</view>

				<view class="dimension-card">
					<view class="dimension-head">
						<text class="dimension-title">七大维度评分明细</text>
						<text class="dimension-note">单项最高 3 分，分数越低越优</text>
					</view>
					<view v-for="item in dimensions" :key="item.name"
						:class="['dimension-row', item.key === 'medicine' ? 'is-medicine' : '']">
						<view class="dimension-label-row"><text>{{ item.name }}</text><text>{{ item.score }} 分</text>
						</view>
						<view class="dimension-bar">
							<view :class="['dimension-fill', item.hot ? 'hot' : '']"
								:style="{ width: item.score / 3 * 100 + '%' }"></view>
						</view>
					</view>
				</view>

				<view class="section-head report-section-head">
					<view class="section-title-wrap">
						<view class="ic ic-spark-blue"></view><text class="section-title">针对性睡眠改善建议</text>
					</view>
					<text class="section-note">基于 PSQI 结果生成</text>
				</view>
				<view v-for="item in suggestions" :key="item.title" class="advice-card">
					<view :class="['advice-icon', item.theme]">
						<view :class="['ic', item.icon]"></view>
					</view>
					<view class="advice-content">
						<view class="advice-title-row">
							<text class="advice-title">{{ item.title }}</text>
							<text class="advice-tag">{{ item.tag }}</text>
						</view>
						<text class="advice-text">{{ item.content }}</text>
					</view>
				</view>
			</scroll-view>

			<view class="report-bottom">
				<view class="restart-btn" @click="startAssessment">
					<view class="ic ic-restart-gray"></view><text>重新评估</text>
				</view>
				<view class="back-sleep-btn" @click="goHome"><text>返回睡眠页</text>
					<view class="ic ic-back-white"></view>
				</view>
			</view>
		</view>

		<view v-if="showSaveConfirm" class="modal-mask" @click="showSaveConfirm = false">
			<view class="confirm-dialog" @click.stop>
				<view class="save-dialog-icon">
					<view class="ic ic-save-dialog"></view>
				</view>
				<text class="confirm-title">确定要暂存退出吗？</text>
				<text class="confirm-desc">当前进度将为您保留，随时可以从断点继续完成评估。</text>
				<view class="confirm-actions">
					<view class="continue-btn" @click="showSaveConfirm = false">继续作答</view>
					<view class="save-exit-btn" @click="saveAndExit">暂存并退出</view>
				</view>
			</view>
		</view>

		<view v-if="showBluetoothModal" class="modal-mask bluetooth-mask" @click="closeBluetooth">
			<view class="bluetooth-dialog" @click.stop>
				<view class="dialog-head">
					<view class="dialog-title-wrap">
						<view class="dialog-bluetooth-icon">
							<view class="ic ic-bluetooth-blue"></view>
						</view>
						<view>
							<text class="dialog-title">连接睡眠仪</text>
							<text class="dialog-subtitle">微信小程序轻量蓝牙配对</text>
						</view>
					</view>
					<view class="dialog-close" @click="closeBluetooth">
						<view class="ic ic-close-gray"></view>
					</view>
				</view>

				<view class="dialog-line"></view>

				<view class="bluetooth-tip">
					<view class="ic ic-shield-blue"></view>
					<text>请将手机靠近睡眠仪（保持 1 米以内），并确保手机已开启蓝牙与睡眠仪电源。</text>
				</view>

				<view v-if="bluetoothState === 'searching'" class="bluetooth-search-body">
					<view class="radar-ring">
						<view class="radar-core">
							<view class="ic ic-radar-white"></view>
						</view>
					</view>
					<text class="bluetooth-state-title">正在搜索设备...</text>
					<text class="bluetooth-state-desc">正在扫描周围低功耗蓝牙 (BLE) 医疗睡眠仪</text>
				</view>

				<view v-else class="bluetooth-success-body">
					<view class="success-circle">
						<view class="ic ic-check-green"></view>
					</view>
					<text class="bluetooth-success-title">连接成功</text>
					<text class="bluetooth-state-desc">已同步睡眠监测传感器，监测数据将实时加密流转</text>
					<view class="device-result-card">
						<view class="device-result-icon">
							<view class="ic ic-radar-green"></view>
						</view>
						<view class="device-result-info">
							<view class="device-result-head">
								<text class="device-result-name">SomnoGuard 医疗级智能睡眠监测仪</text>
								<view class="battery-result">
									<view class="ic ic-battery-green"></view><text>88%</text>
								</view>
							</view>
							<text class="device-result-meta">设备ID：C8:7E:89:12:4A:99 · 固件 v2.4.1</text>
						</view>
					</view>
				</view>

				<view class="dialog-bottom-line"></view>
				<view v-if="bluetoothState === 'searching'" class="dialog-cancel" @click="closeBluetooth">取消</view>
				<view v-else class="blue-btn dialog-confirm" @click="finishBluetooth">完成并返回</view>
			</view>
		</view>

	</view>
</template>

<script>
import {
		getMeScalesPsqiStatusApi,
		postMeScalesPsqiDraftApi,
		postMeScalesPsqiSubmissionsApi,
		getMeScalesPsqiApi
	} from '@/api/frontApikit.js'
	export default {
		data() {
			const systemInfo = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {}
			return {
				currentView: 'home',
				stepIndex: 0,
				draftStepIndex: null,
				pageLoading: false,
				submitting: false,
				savingDraft: false,
				statusState: 'UNASSESSED',
				assessmentProgress: {
					completed: 0,
					total: 18
				},
				latestResult: null,
				statusBarHeight: systemInfo.statusBarHeight || 20,
				showSaveConfirm: false,
				showBluetoothModal: false,
				bluetoothState: 'searching',
				deviceConnected: false,
				loadingTimer: null,
				bluetoothTimer: null,
				reportDate: '',
				reportScore: 0,
				reportLevel: '',
				reportSummary: '完成评估后，将在这里生成 PSQI 睡眠质量报告。',
				deviceDesc: '佩戴睡眠仪可在术后夜间自动采集睡眠分期、体动翻身及血氧稳定性，为您的主治医生提供连续康复参考。',
				latencyOptions: [{
						label: '≤15分',
						value: 0,
						minutes: '15 分钟'
					},
					{
						label: '16-30分',
						value: 1,
						minutes: '25 分钟'
					},
					{
						label: '31-60分',
						value: 2,
						minutes: '45 分钟'
					},
					{
						label: '>60分',
						value: 3,
						minutes: '70 分钟'
					}
				],
				durationOptions: [{
						label: '<5小时',
						value: 0,
						hours: '4 小时'
					},
					{
						label: '5-6小时',
						value: 1,
						hours: '5.5 小时'
					},
					{
						label: '6-7小时',
						value: 2,
						hours: '6.5 小时'
					},
					{
						label: '≥7小时',
						value: 3,
						hours: '7.5 小时'
					}
				],
				frequencyOptions: [{
						label: '从不',
						value: 0
					},
					{
						label: '<1次/周',
						value: 1
					},
					{
						label: '1-2次/周',
						value: 2
					},
					{
						label: '≥3次/周',
						value: 3
					}
				],
				qualityOptions: [{
						label: '很好',
						value: 0
					},
					{
						label: '较好',
						value: 1
					},
					{
						label: '较差',
						value: 2
					},
					{
						label: '很差',
						value: 3
					}
				],
				energyOptions: [{
						label: '完全没有',
						value: 0
					},
					{
						label: '偶尔有一点',
						value: 1
					},
					{
						label: '有时较明显',
						value: 2
					},
					{
						label: '非常严重',
						value: 3
					}
				],
				troubleAGroups: [{
						key: 'troubleA',
						code: '5a',
						title: '不能在30分钟内顺利入睡',
						desc: '翻来覆去难以成眠'
					},
					{
						key: 'troubleB',
						code: '5b',
						title: '夜间易醒或早醒',
						desc: '半夜醒来或天未亮提前醒'
					},
					{
						key: 'troubleC',
						code: '5c',
						title: '夜间不得不起来去洗手间',
						desc: '夜尿打断深度睡眠'
					},
					{
						key: 'troubleD',
						code: '5d',
						title: '咳嗽或鼾声较高',
						desc: '咽喉发痒、咳嗽或打呼'
					},
					{
						key: 'troubleE',
						code: '5e',
						title: '感觉身体发冷',
						desc: '下肢或周身寒凉影响睡眠'
					}
				],
				troubleBGroups: [{
						key: 'troubleF',
						code: '5f',
						title: '感觉很热或出汗',
						desc: '燥热、虚汗影响入睡'
					},
					{
						key: 'troubleG',
						code: '5g',
						title: '做噩梦惊醒',
						desc: '多梦、惊悸或恐惧'
					},
					{
						key: 'troubleH',
						code: '5h',
						title: '感到疼痛或身体不适',
						desc: '术后切口痛、体位牵拉痛（重点）'
					},
					{
						key: 'troubleI',
						code: '5i',
						title: '呼吸不畅或憋醒',
						desc: '夜间胸闷、憋气或憋醒'
					},
					{
						key: 'troubleJ',
						code: '5j',
						title: '其他原因（如焦虑、体位受限等）',
						desc: '卧床姿势受限、环境噪音等'
					}
				],
				finalBlocks: [{
						key: 'quality',
						title: '6. 过去1个月您总体的睡眠质量评估：',
						options: [{
								label: '很好',
								value: 0
							},
							{
								label: '较好',
								value: 1
							},
							{
								label: '较差',
								value: 2
							},
							{
								label: '很差',
								value: 3
							}
						]
					},
					{
						key: 'medicine',
						title: '7. 过去1个月您需要借助催眠药物助眠的频率：',
						options: [{
								label: '从不',
								value: 0
							},
							{
								label: '<1次/周',
								value: 1
							},
							{
								label: '1-2次/周',
								value: 2
							},
							{
								label: '≥3次/周',
								value: 3
							}
						]
					},
					{
						key: 'daySleepy',
						title: '8. 过去1个月在用餐、交谈或日常活动中感到困倦：',
						options: [{
								label: '从不',
								value: 0
							},
							{
								label: '<1次/周',
								value: 1
							},
							{
								label: '1-2次/周',
								value: 2
							},
							{
								label: '≥3次/周',
								value: 3
							}
						]
					},
					{
						key: 'energy',
						title: '9. 过去1个月做事情打不起精神/精力不足的程度：',
						options: [{
								label: '完全没有',
								value: 0
							},
							{
								label: '偶尔有一点',
								value: 1
							},
							{
								label: '有时较明显',
								value: 2
							},
							{
								label: '非常严重',
								value: 3
							}
						]
					}
				],
				answers: this.createDefaultAnswers(),
				suggestions: [{
						title: '固定起床时间',
						tag: '稳定术后昼夜节律',
						content: '无论前夜几点入睡，建议每日早晨在 07:00 前后半小时内准时起床并接受晨光照射，有助于建立规律褪黑素节律。',
						icon: 'ic-clock-purple',
						theme: 'purple'
					},
					{
						title: '睡前身心放松',
						tag: '降低交感神经兴奋',
						content: '睡前 45 分钟离开手机与刺激性荧幕，可通过 4-7-8 腹式呼吸法或轻度肌肉放松训练，减轻切口附近的紧张牵拉感。',
						icon: 'ic-wind-green',
						theme: 'green'
					},
					{
						title: '疼痛或憋醒时及时咨询医生',
						tag: '医学安全提示',
						content: '若术后切口夜间跳痛评分≥4分，或频繁因憋气惊醒，切勿自行加用安眠药，请在小程序随时向私人健康顾问或主管医师报备。',
						icon: 'ic-alert-orange',
						theme: 'orange'
					}
				],
				focusDimensions: [{
						name: '睡眠质量',
						score: 2,
						desc: '自觉睡眠质量偏差，多梦且醒后无恢复感'
					},
					{
						name: '入睡时间',
						score: 1,
						desc: '入睡平稳（15~30分钟）'
					}
				],
				dimensions: [{
						name: '睡眠质量',
						score: 2,
						hot: true,
						key: 'quality'
					},
					{
						name: '入睡时间',
						score: 1,
						key: 'latency'
					},
					{
						name: '睡眠时间',
						score: 1,
						key: 'duration'
					},
					{
						name: '睡眠效率',
						score: 1,
						key: 'efficiency'
					},
					{
						name: '睡眠障碍',
						score: 1,
						key: 'disturbance'
					},
					{
						name: '催眠药物',
						score: 0,
						key: 'medicine'
					},
					{
						name: '日间功能障碍',
						score: 1,
						key: 'daytime'
					}
				]
			}
		},
		computed: {
			stepMetas() {
				return [{
						subtitle: '作息信息 (1-4题)',
						button: '下一步：睡眠困扰（A组）'
					},
					{
						subtitle: '睡眠困扰 A组 (5题a-e)',
						button: '下一步：睡眠困扰（B组）'
					},
					{
						subtitle: '睡眠困扰 B组 (5题f-j)',
						button: '下一步：睡眠感受与日间状态'
					},
					{
						subtitle: '药物与日间感受 (6-9题)',
						button: '完成并提交评估'
					}
				]
			},
			currentStepMeta() {
				return this.stepMetas[this.stepIndex]
			},
			progressPercent() {
				return [25, 50, 75, 100][this.stepIndex]
			},
			hasReport() {
				return !!this.latestResult
			},
			statusText() {
				if (this.statusState === 'COMPLETED') return '已完成评估'
				if (this.statusState === 'IN_PROGRESS') {
					return `评估中 ${this.assessmentProgress.completed}/${this.assessmentProgress.total}`
				}
				if (this.statusState === 'EXPIRED') return '评估已过期'
				return '未评估'
			},
			statusBadgeClass() {
				return `status-${this.statusState.toLowerCase()}`
			},
			primaryActionText() {
				if (this.statusState === 'IN_PROGRESS') return '继续完成评估'
				if (this.statusState === 'COMPLETED') return '查看完整报告'
				if (this.statusState === 'EXPIRED') return '重新评估'
				return '开始睡眠评估'
			},
			selectedLatencySummary() {
				const selected = this.latencyOptions.find(item => item.value === this.answers.latency)
				return selected ? selected.minutes : ''
			},
			selectedDurationSummary() {
				const selected = this.durationOptions.find(item => item.value === this.answers.duration)
				return selected ? selected.hours : ''
			}
		},
		beforeDestroy() {
			this.clearLoadingTimer()
			this.clearBluetoothTimer()
		},
		created() {
			this.initPsqiPage()
		},
		methods: {
			async initPsqiPage() {
				this.pageLoading = true
				uni.showLoading({ title: '加载中...', mask: true })
				try {
					const questionsPromise = this.fetchQuestions()
					const statusPromise = getMeScalesPsqiStatusApi().then(function(result) {
						return { ok: true, value: result }
					}, function(error) {
						return { ok: false, reason: error }
					})
					const results = await Promise.all([
						questionsPromise,
						statusPromise
					])
					const statusState = results[1]
					const statusResult = statusState.ok ? statusState.value : null
					this.applyStatus(statusResult)
					if (!statusState.ok && (!statusState.reason || !statusState.reason.isApiError)) {
						uni.showToast({ title: '评估状态加载失败', icon: 'none' })
					}
				} catch (error) {
					uni.showToast({ title: '评估信息加载失败', icon: 'none' })
				} finally {
					this.pageLoading = false
					uni.hideLoading()
				}
			},
			async fetchQuestions() {
				try {
					return await getMeScalesPsqiApi()
				} catch (error) {
					return null
				}
			},
			applyStatus(result) {
				if (!result) {
					this.statusState = 'UNASSESSED'
					this.applyLatestResult(null)
					return
				}
				this.statusState = result.state || 'UNASSESSED'
				if (result.progress) {
					this.assessmentProgress = {
						completed: result.progress.completed || 0,
						total: result.progress.total || 18
					}
				}
				if (result.draft) this.applyDraft(result.draft)
				if (result.latest) this.applyLatestResult(result.latest)
			},
			applyDraft(draft) {
				if (!draft) return
				if (draft.answers) this.answers = this.normalizeAnswers(draft.answers)
				if (draft.step !== undefined && draft.step !== null) {
					const draftStep = Number(draft.step)
					if (!Number.isNaN(draftStep)) {
						this.draftStepIndex = this.mapServerStepToPage(draftStep)
						this.stepIndex = this.draftStepIndex
					}
				}
			},
			mapServerStepToPage(step) {
				if (step >= 14) return 3
				if (step >= 9) return 2
				if (step >= 4) return 1
				return 0
			},
			applyLatestResult(latest) {
				if (!latest) {
					this.latestResult = null
					this.reportDate = ''
					this.reportScore = 0
					this.reportLevel = ''
					this.reportSummary = '完成评估后，将在这里生成 PSQI 睡眠质量报告。'
					return
				}
				this.latestResult = latest
				const score = this.pickNumber(latest.score, latest.totalScore, NaN)
				this.reportScore = Number.isNaN(score) ? 0 : score
				this.reportLevel = latest.levelTitle || latest.tier || latest.tierText || ''
				this.reportSummary = latest.interpretation || latest.tierText || '本次 PSQI 评估已完成。'
				this.reportDate = this.formatDateTime(latest.assessedAt || latest.createdAt || latest.submittedAt)
				if (Array.isArray(latest.dimensions) && latest.dimensions.length) {
					this.dimensions = this.normalizeDimensions(latest.dimensions)
				}
				this.focusDimensions = this.normalizeFocusDimensions(latest.topConcernDimensions, latest.topConcerns)
			},
			hasReportPayload(result) {
				return !!(result && (
					result.score !== undefined ||
					result.totalScore !== undefined ||
					result.levelTitle ||
					result.tier ||
					result.tierText ||
					(Array.isArray(result.dimensions) && result.dimensions.length)
				))
			},
			normalizeSubmissionResult(result) {
				if (!this.hasReportPayload(result)) return null
				return Object.assign({}, result, {
					totalScore: result.totalScore !== undefined ? result.totalScore : result.score,
					levelTitle: result.levelTitle || result.tier || '',
					interpretation: result.interpretation || result.tierText || ''
				})
			},
			normalizeAnswers(source) {
				const defaults = this.createDefaultAnswers()
				if (!source || typeof source !== 'object') return defaults
				const disturbances = source.disturbances || {}
				const values = {
					bedTime: source.bedTime || source.q1 || defaults.bedTime,
					wakeTime: source.wakeTime || source.q3 || defaults.wakeTime,
					latency: this.parseFrequencyValue(source.latencyMinutes, source.latency, source.q2),
					duration: this.parseDurationValue(source.actualSleepHours, source.duration, source.q4),
					troubleA: this.parseFrequencyValue(source.troubleA, source.q5a, disturbances.a_cantFallAsleep30min),
					troubleB: this.parseFrequencyValue(source.troubleB, source.q5b, disturbances.b_wakeNightOrEarly),
					troubleC: this.parseFrequencyValue(source.troubleC, source.q5c, disturbances.c_bathroomNight),
					troubleD: this.parseFrequencyValue(source.troubleD, source.q5d, disturbances.d_coughOrSnore),
					troubleE: this.parseFrequencyValue(source.troubleE, source.q5e, disturbances.e_feelCold),
					troubleF: this.parseFrequencyValue(source.troubleF, source.q5f, disturbances.f_feelHot),
					troubleG: this.parseFrequencyValue(source.troubleG, source.q5g, disturbances.g_badDreams),
					troubleH: this.parseFrequencyValue(source.troubleH, source.q5h, disturbances.h_painDiscomfort),
					troubleI: this.parseFrequencyValue(source.troubleI, source.q5i, disturbances.i_breathDifficult),
					troubleJ: this.parseFrequencyValue(source.troubleJ, source.q5j, disturbances.j_otherReasons),
					quality: this.parseFrequencyValue(source.quality, source.overallQuality, source.q6),
					medicine: this.parseFrequencyValue(source.medicine, source.hypnoticMeds, source.q7),
					daySleepy: this.parseFrequencyValue(source.daySleepy, source.daytimeSleepiness, source.q8),
					energy: this.parseFrequencyValue(source.energy, source.daytimeEnthusiasm, source.q9)
				}
				return Object.assign({}, defaults, values)
			},
			parseFrequencyValue() {
				for (let index = 0; index < arguments.length; index += 1) {
					const value = arguments[index]
					if (value === undefined || value === null || value === '') continue
					const numberValue = Number(value)
					if (!Number.isNaN(numberValue) && numberValue >= 0 && numberValue <= 3) return numberValue
				}
				return null
			},
			parseDurationValue() {
				for (let index = 0; index < arguments.length; index += 1) {
					const value = arguments[index]
					if (value === undefined || value === null || value === '') continue
					const numberValue = Number(value)
					if (Number.isNaN(numberValue)) continue
					if (numberValue > 0 && numberValue < 5) return 0
					if (numberValue >= 5 && numberValue < 6) return 1
					if (numberValue >= 6 && numberValue < 7) return 2
					if (numberValue >= 7) return 3
				}
				return null
			},
			buildPayloadAnswers() {
				const answers = this.answers
				const latencyMinutes = [15, 25, 45, 70]
				const actualSleepHours = [4, 5.5, 6.5, 7.5]
				const disturbanceKeys = ['troubleA', 'troubleB', 'troubleC', 'troubleD', 'troubleE', 'troubleF', 'troubleG', 'troubleH', 'troubleI', 'troubleJ']
				const disturbanceNames = [
					'a_cantFallAsleep30min',
					'b_wakeNightOrEarly',
					'c_bathroomNight',
					'd_coughOrSnore',
					'e_feelCold',
					'f_feelHot',
					'g_badDreams',
					'h_painDiscomfort',
					'i_breathDifficult',
					'j_otherReasons'
				]
				const disturbances = {}
				disturbanceKeys.forEach((key, index) => {
					disturbances[disturbanceNames[index]] = answers[key]
				})
				const payload = {
					bedTime: answers.bedTime,
					latencyMinutes: answers.latency === null ? null : latencyMinutes[answers.latency],
					wakeTime: answers.wakeTime,
					actualSleepHours: answers.duration === null ? null : actualSleepHours[answers.duration],
					q1: answers.bedTime,
					q2: answers.latency === null ? null : latencyMinutes[answers.latency],
					q3: answers.wakeTime,
					q4: answers.duration === null ? null : actualSleepHours[answers.duration],
					disturbances: disturbances,
					overallQuality: answers.quality,
					hypnoticMeds: answers.medicine,
					daytimeSleepiness: answers.daySleepy,
					daytimeEnthusiasm: answers.energy,
					q6: answers.quality,
					q7: answers.medicine,
					q8: answers.daySleepy,
					q9: answers.energy
				}
				disturbanceKeys.forEach((key, index) => {
					payload[`q5${String.fromCharCode(97 + index)}`] = answers[key]
				})
				return {
					...payload
				}
			},
			buildDraftAnswers() {
				const source = this.buildPayloadAnswers()
				const payload = {}
				Object.keys(source).forEach(key => {
					if (key === 'disturbances') {
						const disturbances = {}
						Object.keys(source.disturbances).forEach((disturbanceKey, index) => {
							if (source.disturbances[disturbanceKey] !== null && source.disturbances[disturbanceKey] !== undefined) {
								disturbances[disturbanceKey] = source.disturbances[disturbanceKey]
							}
						})
						if (Object.keys(disturbances).length) payload.disturbances = disturbances
						return
					}
					if (source[key] !== null && source[key] !== undefined && source[key] !== '') {
						payload[key] = source[key]
					}
				})
				return payload
			},
			normalizeDimensions(serverDimensions) {
				const defaults = this.dimensions
				const mapping = {
					quality: 'quality',
					latency: 'latency',
					duration: 'duration',
					efficiency: 'efficiency',
					disturbances: 'disturbance',
					meds: 'medicine',
					daytime: 'daytime'
				}
				if (!Array.isArray(serverDimensions) || !serverDimensions.length) return defaults
				return defaults.map(item => {
					const serverItem = serverDimensions.find(dimension => dimension.id === item.key || mapping[dimension.id] === item.key)
					return serverItem ? Object.assign({}, item, { score: Number(serverItem.score) || 0 }) : item
				})
			},
			normalizeFocusDimensions(serverFocusDimensions, topConcerns) {
				if (Array.isArray(serverFocusDimensions) && serverFocusDimensions.length) {
					return serverFocusDimensions.map(item => ({
						name: item.name || this.getDimensionName(item.id),
						score: Number(item.score) || 0,
						desc: this.getDimensionDesc(item.id)
					}))
				}
				if (Array.isArray(topConcerns) && topConcerns.length) {
					return topConcerns.map(name => {
						const matched = this.dimensions.find(item => item.name === name)
						return {
							name,
							score: matched ? matched.score : 1,
							desc: this.getDimensionDesc(matched ? matched.key : '')
						}
					})
				}
				return this.dimensions.filter(item => item.score > 0).slice(0, 2)
			},
			getDimensionName(id) {
				const names = {
					quality: '睡眠质量',
					latency: '入睡时间',
					duration: '睡眠时间',
					efficiency: '睡眠效率',
					disturbances: '睡眠障碍',
					meds: '催眠药物',
					daytime: '日间功能障碍'
				}
				return names[id] || '睡眠维度'
			},
			getDimensionDesc(id) {
				const descriptions = {
					quality: '近期主观睡眠质量需要关注',
					latency: '入睡耗时影响睡眠恢复',
					duration: '总睡眠时间可能不足',
					efficiency: '卧床时间中的有效睡眠占比偏低',
					disturbances: '夜间易受疼痛、起夜或呼吸问题打断',
					meds: '存在助眠药物使用情况',
					daytime: '白天困倦或精力不足'
				}
				return descriptions[id] || '建议结合近期作息持续观察'
			},
			pickNumber() {
				for (let index = 0; index < arguments.length; index += 1) {
					const rawValue = arguments[index]
					if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
						const value = Number(rawValue)
						if (!Number.isNaN(value)) return value
					}
				}
				return NaN
			},
			formatDateTime(value) {
				if (!value) return ''
				const date = new Date(value)
				if (Number.isNaN(date.getTime())) return String(value)
				const year = date.getFullYear()
				const month = this.padTwo(date.getMonth() + 1)
				const day = this.padTwo(date.getDate())
				const hour = this.padTwo(date.getHours())
				const minute = this.padTwo(date.getMinutes())
				return `${year}年${month}月${day}日 ${hour}:${minute}`
			},
			padTwo(value) {
				return value < 10 ? `0${value}` : `${value}`
			},
			createDefaultAnswers() {
				return {
					bedTime: '',
					wakeTime: '',
					latency: null,
					duration: null,
					troubleA: null,
					troubleB: null,
					troubleC: null,
					troubleD: null,
					troubleE: null,
					troubleF: null,
					troubleG: null,
					troubleH: null,
					troubleI: null,
					troubleJ: null,
					quality: null,
					medicine: null,
					daySleepy: null,
					energy: null
				}
			},
			goHome() {
				this.currentView = 'home'
			},
			goReport() {
				if (this.statusState !== 'COMPLETED' || !this.hasReport) {
					this.startAssessment()
					return
				}
				this.currentView = 'report'
			},
			handlePrimaryAction() {
				if (this.statusState === 'COMPLETED' && this.hasReport) {
					this.goReport()
					return
				}
				this.startAssessment(this.statusState !== 'IN_PROGRESS')
			},
			startAssessment(resetAnswers) {
				if (resetAnswers) {
					this.answers = this.createDefaultAnswers()
					this.stepIndex = 0
					this.draftStepIndex = null
					this.showSaveConfirm = false
				} else {
					this.stepIndex = this.resolveDraftStep()
				}
				this.showSaveConfirm = false
				this.currentView = 'questionnaire'
			},
			resolveDraftStep() {
				if (this.draftStepIndex !== null) return this.draftStepIndex
				const completed = Number(this.assessmentProgress.completed) || 0
				if (completed >= 14) return 3
				if (completed >= 9) return 2
				if (completed >= 4) return 1
				return 0
			},
			onBedTimeChange(event) {
				this.answers.bedTime = event.detail.value
			},
			onWakeTimeChange(event) {
				this.answers.wakeTime = event.detail.value
			},
			prevStep() {
				if (this.submitting || this.savingDraft) return
				if (this.stepIndex === 0) {
					this.currentView = 'home'
					return
				}
				this.stepIndex -= 1
			},
			async nextStep() {
				if (this.submitting || this.savingDraft) return
				if (!this.validateStep(this.stepIndex)) return
				if (this.stepIndex < 3) {
					this.stepIndex += 1
					return
				}
				await this.submitAssessment()
			},
			validateStep(step) {
				const messages = [
					'请完成本页作息信息',
					'请完成第5题 a-e 项',
					'请完成第5题 f-j 项',
					'请完成睡眠质量、药物和日间状态题目'
				]
				const groups = [
					['bedTime', 'latency', 'wakeTime', 'duration'],
					['troubleA', 'troubleB', 'troubleC', 'troubleD', 'troubleE'],
					['troubleF', 'troubleG', 'troubleH', 'troubleI', 'troubleJ'],
					['quality', 'medicine', 'daySleepy', 'energy']
				]
				const currentKeys = groups[step] || []
				const valid = currentKeys.every(key => this.answers[key] !== '' && this.answers[key] !== null && this.answers[key] !== undefined)
				if (!valid) {
					uni.showToast({ title: messages[step] || '请完善题目', icon: 'none' })
				}
				return valid
			},
			async submitAssessment() {
				if (!this.validateAllAnswers()) return
				this.showSaveConfirm = false
				this.submitting = true
				this.currentView = 'loading'
				uni.showLoading({ title: '提交评估中...', mask: true })
				try {
					const payload = {
						answers: this.buildDraftAnswers(),
						step: this.stepIndex
					}
					const result = this.normalizeSubmissionResult(await postMeScalesPsqiSubmissionsApi(payload))
					if (result && result.valid === false) {
						this.currentView = 'questionnaire'
						uni.showToast({ title: result.message || '存在漏答或答案无效', icon: 'none' })
						return
					}
					this.statusState = 'COMPLETED'
					this.assessmentProgress.completed = this.assessmentProgress.total || 18
					if (result) this.applyLatestResult(result)
					await this.refreshStatus(false)
					this.currentView = 'report'
					uni.showToast({ title: '评估提交成功', icon: 'success' })
				} catch (error) {
					this.currentView = 'questionnaire'
					if (error && error.isApiError) return
					uni.showToast({ title: '评估提交失败，请稍后重试', icon: 'none' })
				} finally {
					this.submitting = false
					uni.hideLoading()
				}
			},
			validateAllAnswers() {
				return [0, 1, 2, 3].every(step => this.validateStep(step))
			},
			async refreshStatus(showLoading) {
				try {
					if (showLoading) uni.showLoading({ title: '刷新中...', mask: true })
					const status = await getMeScalesPsqiStatusApi()
					this.applyStatus(status)
				} catch (error) {
					if (!error || !error.isApiError) {
						uni.showToast({ title: '评估状态刷新失败', icon: 'none' })
					}
				} finally {
					if (showLoading) uni.hideLoading()
				}
			},
			handleNavBack() {
				if (this.submitting) return
				if (this.currentView === 'questionnaire') {
					this.saveAndExit()
					return
				}
				if (this.currentView === 'loading') {
					this.clearLoadingTimer()
				}
				this.currentView = 'home'
			},
			async saveAndExit() {
				if (this.savingDraft || this.submitting) return
				this.showSaveConfirm = false
				this.savingDraft = true
				uni.showLoading({ title: '暂存中...', mask: true })
				try {
					await postMeScalesPsqiDraftApi({
						answers: this.buildDraftAnswers(),
						step: this.stepIndex
					})
					this.statusState = 'IN_PROGRESS'
					this.draftStepIndex = this.stepIndex
					this.assessmentProgress.completed = this.countCompletedAnswers()
					this.clearLoadingTimer()
					this.currentView = 'home'
					uni.showToast({ title: '评估进度已暂存', icon: 'success' })
				} catch (error) {
					if (!error || !error.isApiError) {
						uni.showToast({ title: '暂存失败，请稍后重试', icon: 'none' })
					}
				} finally {
					this.savingDraft = false
					uni.hideLoading()
				}
			},
			countCompletedAnswers() {
				return Object.keys(this.answers).filter(key => this.answers[key] !== '' && this.answers[key] !== null && this.answers[key] !== undefined).length
			},
			clearLoadingTimer() {
				if (this.loadingTimer) {
					clearTimeout(this.loadingTimer)
					this.loadingTimer = null
				}
			},
			openBluetooth() {
				this.showBluetoothModal = true
				this.bluetoothState = 'searching'
				this.clearBluetoothTimer()
				this.bluetoothTimer = setTimeout(() => {
					this.bluetoothState = 'success'
					this.bluetoothTimer = null
				}, 2200)
			},
			closeBluetooth() {
				this.clearBluetoothTimer()
				this.showBluetoothModal = false
			},
			toggleBluetooth() {
				if (this.deviceConnected) {
					this.disconnectDevice()
					return
				}
				this.openBluetooth()
			},
			disconnectDevice() {
				this.deviceConnected = false
				uni.showToast({
					title: '睡眠仪已断开',
					icon: 'none'
				})
			},
			finishBluetooth() {
				this.deviceConnected = true
				this.closeBluetooth()
				uni.showToast({
					title: '睡眠仪连接成功',
					icon: 'success'
				})
			},
			clearBluetoothTimer() {
				if (this.bluetoothTimer) {
					clearTimeout(this.bluetoothTimer)
					this.bluetoothTimer = null
				}
			}
		}
	}
</script>

<style scoped>
	.sleep-page {
		position: relative;
		min-height: 100vh;
		background: #f7f8fa;
		color: #111827;
		font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	.page-loading {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 120;
		background: rgba(247, 248, 250, 0.9);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.page-loading-spinner {
		width: 72rpx;
		height: 72rpx;
		border: 6rpx solid #dbe7ff;
		border-top-color: #165dff;
		border-radius: 50%;
		animation: page-spin 0.8s linear infinite;
	}

	.page-loading-text {
		margin-top: 22rpx;
		color: #4b5563;
		font-size: 26rpx;
		font-weight: 700;
	}

	@keyframes page-spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.home-view,
	.report-view,
	.questionnaire-view,
	.loading-view {
		min-height: 100vh;
		background: #f7f8fa;
	}

	.ic {
		display: inline-block;
		background-repeat: no-repeat;
		background-position: center;
		background-size: contain;
		flex: 0 0 auto;
	}

	.ic-check-white {
		width: 36rpx;
		height: 36rpx;
		margin-right: 12rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.2 4.2L19 7'/%3E%3C/svg%3E");
	}

	.ic-moon {
		width: 46rpx;
		height: 46rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'/%3E%3C/svg%3E");
	}

	.ic-calendar {
		width: 28rpx;
		height: 28rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239aa3b2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4.5' width='18' height='16' rx='2.5'/%3E%3Cpath d='M8 2.5v4M16 2.5v4M3 9.5h18'/%3E%3C/svg%3E");
	}

	.ic-arrow-right {
		width: 34rpx;
		height: 34rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23165DFF' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 5l7 7-7 7'/%3E%3C/svg%3E");
	}

	.ic-arrow-right-white {
		width: 34rpx;
		height: 34rpx;
		margin-left: 12rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 5l7 7-7 7'/%3E%3C/svg%3E");
	}

	.ic-arrow-right-white.small {
		width: 28rpx;
		height: 28rpx;
	}

	.ic-spark-blue {
		width: 42rpx;
		height: 42rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23165DFF' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'/%3E%3Cpath d='M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'/%3E%3C/svg%3E");
	}

	.ic-spark-white {
		width: 36rpx;
		height: 36rpx;
		margin-right: 10rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'/%3E%3Cpath d='M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'/%3E%3C/svg%3E");
	}

	.ic-radar-blue,
	.ic-radar-green,
	.ic-radar-white {
		width: 54rpx;
		height: 54rpx;
	}

	.ic-radar-blue {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2.2' stroke-linecap='round'%3E%3Cpath d='M8.5 12a3.5 3.5 0 0 1 7 0'/%3E%3Cpath d='M5.8 9.2a7.5 7.5 0 0 1 12.4 0'/%3E%3Cpath d='M3.5 6.8a11 11 0 0 1 17 0'/%3E%3Ccircle cx='12' cy='15.5' r='1.2' fill='%234f46e5'/%3E%3C/svg%3E");
	}

	.ic-radar-green {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.2' stroke-linecap='round'%3E%3Cpath d='M8.5 12a3.5 3.5 0 0 1 7 0'/%3E%3Cpath d='M5.8 9.2a7.5 7.5 0 0 1 12.4 0'/%3E%3Cpath d='M3.5 6.8a11 11 0 0 1 17 0'/%3E%3Ccircle cx='12' cy='15.5' r='1.2' fill='%23059669'/%3E%3C/svg%3E");
	}

	.ic-radar-white {
		width: 58rpx;
		height: 58rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round'%3E%3Cpath d='M8.5 12a3.5 3.5 0 0 1 7 0'/%3E%3Cpath d='M5.8 9.2a7.5 7.5 0 0 1 12.4 0'/%3E%3Cpath d='M3.5 6.8a11 11 0 0 1 17 0'/%3E%3Ccircle cx='12' cy='15.5' r='1.2' fill='white'/%3E%3C/svg%3E");
	}

	.ic-bluetooth-white,
	.ic-bluetooth-blue {
		width: 38rpx;
		height: 38rpx;
	}

	.ic-bluetooth-white {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='7 7 17 17 12 22 12 2 17 7 7 17'/%3E%3C/svg%3E");
	}

	.ic-bluetooth-blue {
		width: 34rpx;
		height: 34rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23165DFF' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='7 7 17 17 12 22 12 2 17 7 7 17'/%3E%3C/svg%3E");
	}

	.blue-btn {
		height: 96rpx;
		border-radius: 30rpx;
		background: #165DFF;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 14rpx 24rpx rgba(22, 93, 255, 0.22);
		box-sizing: border-box;
	}

	.blue-btn text {
		color: #ffffff;
		font-size: 30rpx;
		font-weight: 800;
	}

	.home-view {
		padding: 10rpx 26rpx 46rpx;
		box-sizing: border-box;
	}

	.psqi-card,
	.advice-card,
	.device-card {
		background: #ffffff;
		border-radius: 38rpx;
		box-shadow: 0 8rpx 26rpx rgba(16, 24, 40, 0.08);
		box-sizing: border-box;
	}

	.psqi-card {
		padding: 34rpx 28rpx 30rpx;
	}

	.psqi-head {
		display: flex;
		align-items: center;
	}

	.psqi-logo {
		width: 84rpx;
		height: 84rpx;
		margin-right: 18rpx;
		border-radius: 26rpx;
		background: #165DFF;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.psqi-heading {
		flex: 1;
		min-width: 0;
	}

	.psqi-title-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.psqi-title {
		margin-right: 12rpx;
		color: #111827;
		font-size: 31rpx;
		font-weight: 900;
	}

	.finished-badge {
		padding: 6rpx 16rpx;
		border: 1rpx solid #8de6b7;
		border-radius: 22rpx;
		background: #ecfdf3;
		color: #059669;
		font-size: 22rpx;
		font-weight: 700;
	}

	.finished-badge.status-in_progress {
		border-color: #b9d2ff;
		background: #edf3ff;
		color: #165dff;
	}

	.finished-badge.status-unassessed {
		border-color: #e2e8f2;
		background: #f8fafc;
		color: #667085;
	}

	.finished-badge.status-expired {
		border-color: #fed7aa;
		background: #fff7ed;
		color: #ea580c;
	}

	.assess-date {
		margin-top: 12rpx;
		display: flex;
		align-items: center;
		color: #9aa3b2;
		font-size: 24rpx;
	}

	.assess-date .ic {
		margin-right: 8rpx;
	}

	.head-arrow {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: #f0f5ff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.score-panel {
		margin-top: 24rpx;
		padding: 30rpx 28rpx;
		border-radius: 28rpx;
		border: 1rpx solid #e7edf8;
		background: linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);
	}

	.score-main {
		display: flex;
		align-items: center;
	}

	.score-label {
		color: #667085;
		font-size: 27rpx;
	}

	.score-num {
		color: #101828;
		font-size: 56rpx;
		font-weight: 900;
		line-height: 1;
	}

	.score-total {
		color: #98a2b3;
		font-size: 28rpx;
	}

	.level-tag {
		margin-left: auto;
		padding: 10rpx 24rpx;
		border: 1rpx solid #f5c64d;
		border-radius: 28rpx;
		background: #fff8dc;
		color: #d97706;
		font-size: 24rpx;
		font-weight: 900;
	}

	.score-advice {
		display: block;
		margin-top: 22rpx;
		color: #344054;
		font-size: 26rpx;
		line-height: 1.65;
	}

	.report-btn {
		margin-top: 26rpx;
	}

	.section-head {
		margin: 38rpx 4rpx 22rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title-wrap {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.section-title-wrap .ic {
		margin-right: 12rpx;
	}

	.section-title {
		color: #111827;
		font-size: 31rpx;
		font-weight: 900;
	}

	.section-note {
		color: #9aa3b2;
		font-size: 23rpx;
		flex: 0 0 auto;
	}

	.advice-card {
		margin-bottom: 22rpx;
		padding: 28rpx 24rpx;
		display: flex;
		align-items: flex-start;
	}

	.advice-icon {
		width: 76rpx;
		height: 76rpx;
		margin-right: 20rpx;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.advice-icon.purple {
		background: #f3f0ff;
	}

	.advice-icon.green {
		background: #eafaf4;
	}

	.advice-icon.orange {
		background: #fff7e8;
	}

	.advice-content {
		flex: 1;
		min-width: 0;
	}

	.advice-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.advice-title {
		flex: 1;
		min-width: 0;
		color: #111827;
		font-size: 29rpx;
		font-weight: 900;
		line-height: 1.35;
	}

	.advice-tag {
		margin-left: 14rpx;
		padding: 7rpx 14rpx;
		border-radius: 18rpx;
		background: #f6f7f9;
		color: #98a2b3;
		font-size: 20rpx;
		line-height: 1.2;
		white-space: nowrap;
		flex: 0 0 auto;
	}

	.advice-text {
		display: block;
		margin-top: 12rpx;
		color: #344054;
		font-size: 25rpx;
		line-height: 1.62;
		text-align: justify;
	}

	.device-card {
		margin-top: 28rpx;
		padding: 32rpx 28rpx 28rpx;
	}

	.device-head {
		display: flex;
		align-items: center;
	}

	.device-logo {
		width: 88rpx;
		height: 88rpx;
		margin-right: 20rpx;
		border-radius: 28rpx;
		background: #eef1ff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.device-logo.connected {
		background: #eafaf4;
	}

	.device-info {
		flex: 1;
		min-width: 0;
	}

	.device-title-row {
		display: flex;
		align-items: center;
	}

	.device-name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #111827;
		font-size: 30rpx;
		font-weight: 900;
	}

	.device-state {
		margin-left: 14rpx;
		padding: 7rpx 14rpx;
		border-radius: 18rpx;
		background: #f2f4f7;
		color: #667085;
		font-size: 20rpx;
		font-weight: 700;
	}

	.device-state.is-connected {
		background: #eafaf4;
		color: #059669;
	}

	.device-subtitle {
		display: block;
		margin-top: 10rpx;
		color: #9aa3b2;
		font-size: 24rpx;
	}

	.device-desc-box {
		margin-top: 26rpx;
		padding: 24rpx 22rpx;
		border-radius: 26rpx;
		background: #f7f8fa;
	}

	.device-desc {
		color: #667085;
		font-size: 25rpx;
		line-height: 1.62;
	}

	.connect-device-btn {
		margin-top: 26rpx;
	}

	.connect-device-btn .ic:first-child {
		margin-right: 14rpx;
	}
	.questionnaire-view,
	.report-view {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.custom-header {
		background: #ffffff;
		box-shadow: 0 6rpx 20rpx rgba(16, 24, 40, 0.05);
		position: relative;
		z-index: 5;
	}

	.nav-bar {
		height: 88rpx;
		position: relative;
		display: flex;
		align-items: center;
	}

	.nav-bar.simple {
		justify-content: space-between;
		padding: 0 28rpx;
		box-sizing: border-box;
	}

	.nav-back,
	.save-entry {
		display: flex;
		align-items: center;
		color: #4b5563;
		font-size: 27rpx;
		font-weight: 600;
	}

	.nav-back {
		padding-left: 24rpx;
	}

	.save-entry {
		position: absolute;
		right: 24rpx;
		top: 0;
		height: 88rpx;
		color: #165DFF;
		font-weight: 700;
	}

	.nav-back text {
		margin-left: 6rpx;
	}

	.save-entry text {
		margin-left: 6rpx;
	}

	.nav-center {
		position: absolute;
		left: 180rpx;
		right: 180rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.nav-title {
		color: #111827;
		font-size: 31rpx;
		font-weight: 900;
		line-height: 1.2;
	}

	.nav-subtitle {
		margin-top: 4rpx;
		color: #98a2b3;
		font-size: 20rpx;
		line-height: 1.2;
	}

	.nav-placeholder {
		width: 112rpx;
		height: 40rpx;
	}

	.progress-track {
		height: 8rpx;
		margin: 0 28rpx 18rpx;
		border-radius: 99rpx;
		background: #e9eef7;
		overflow: hidden;
	}

	.progress-inner {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #165DFF 0%, #5B8CFF 100%);
		box-shadow: 0 0 12rpx rgba(22, 93, 255, 0.35);
		transition: width 0.25s ease;
	}

	.question-scroll {
		flex: 1;
		min-height: 0;
		box-sizing: border-box;
		padding: 28rpx 26rpx;
	}

	.question-card {
		padding: 34rpx 30rpx 32rpx;
		border-radius: 34rpx;
		background: #ffffff;
		box-shadow: 0 10rpx 30rpx rgba(16, 24, 40, 0.07);
		box-sizing: border-box;
	}

	.question-card.last-card {
		padding-bottom: 26rpx;
	}

	.part-kicker {
		display: block;
		color: #165DFF;
		font-size: 24rpx;
		font-weight: 900;
		line-height: 1.4;
	}

	.part-title {
		display: block;
		margin-top: 10rpx;
		color: #111827;
		font-size: 38rpx;
		font-weight: 900;
		line-height: 1.35;
	}

	.part-desc {
		display: block;
		margin-top: 14rpx;
		color: #7B8494;
		font-size: 25rpx;
		line-height: 1.55;
	}

	.question-block {
		padding: 28rpx 0;
		border-bottom: 1rpx solid #eef1f5;
	}

	.question-block.no-divider {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.question-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.question-head .question-text {
		flex: 1;
		min-width: 0;
		padding-right: 16rpx;
	}

	.question-text {
		color: #1f2937;
		font-size: 27rpx;
		font-weight: 800;
		line-height: 1.55;
	}

	.question-desc {
		display: block;
		margin-top: 8rpx;
		color: #8b95a5;
		font-size: 23rpx;
		line-height: 1.45;
	}

	.selected-summary {
		flex: 0 0 auto;
		margin-left: 16rpx;
		padding: 6rpx 14rpx;
		border-radius: 18rpx;
		background: #edf3ff;
		color: #165DFF;
		font-size: 21rpx;
		font-weight: 700;
		white-space: nowrap;
	}

	.time-field {
		height: 92rpx;
		margin-top: 20rpx;
		padding: 0 26rpx;
		border: 1rpx solid #e7ebf1;
		border-radius: 26rpx;
		background: #f8f9fb;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.time-field text {
		color: #1f2937;
		font-size: 29rpx;
		font-weight: 700;
	}

	.option-row {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
	}

	.option-btn {
		margin-right: 16rpx;
		margin-bottom: 8rpx;
		min-height: 70rpx;
		padding: 0 24rpx;
		border: 1rpx solid #e2e8f2;
		border-radius: 38rpx;
		background: #ffffff;
		color: #4b5563;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 700;
		line-height: 1.25;
		box-sizing: border-box;
		transition: all 0.18s ease;
	}

	.option-btn.selected {
		border-color: #165DFF;
		background: #165DFF;
		color: #ffffff;
		box-shadow: 0 10rpx 18rpx rgba(22, 93, 255, 0.24);
	}

	.four-options .option-btn {
		flex: 0 0 calc(25% - 9rpx);
		min-width: 0;
		margin-right: 12rpx;
		margin-bottom: 0;
		padding: 0 8rpx;
		font-size: 21rpx;
		white-space: normal;
		text-align: center;
	}

	.four-options .option-btn:nth-child(4n) {
		margin-right: 0;
	}

	.trouble-block {
		margin-top: 22rpx;
		padding: 24rpx 22rpx;
		border-radius: 26rpx;
		background: #f7f8fb;
	}

	.question-bottom {
		padding: 18rpx 26rpx calc(24rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background: #ffffff;
		display: flex;
		box-shadow: 0 -8rpx 24rpx rgba(16, 24, 40, 0.06);
	}

	.question-bottom .prev-btn {
		margin-right: 18rpx;
	}

	.prev-btn {
		width: 210rpx;
		height: 92rpx;
		box-sizing: border-box;
		border: 1rpx solid #e1e6ef;
		border-radius: 28rpx;
		background: #ffffff;
		color: #344054;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 27rpx;
		font-weight: 800;
	}

	.next-btn {
		flex: 1;
		height: 92rpx;
		border-radius: 28rpx;
		background: #165DFF;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 12rpx 22rpx rgba(22, 93, 255, 0.24);
		font-size: 28rpx;
		font-weight: 900;
	}

	.next-btn .ic {
		margin-left: 0;
	}
	.loading-view {
		height: 100vh;
		background: #ffffff;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.loading-content {
		flex: 1;
		padding: 0 70rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.loading-circle {
		width: 176rpx;
		height: 176rpx;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #4A83FF 0%, #165DFF 58%, #0F47D4 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 20rpx 44rpx rgba(22, 93, 255, 0.28), 0 0 0 22rpx rgba(22, 93, 255, 0.08);
		position: relative;
	}

	.loading-circle::before,
	.loading-circle::after {
		content: "";
		position: absolute;
		top: -20rpx;
		right: -20rpx;
		bottom: -20rpx;
		left: -20rpx;
		border: 2rpx solid rgba(22, 93, 255, 0.28);
		border-radius: 50%;
		animation: loading-wave 1.8s infinite ease-out;
	}

	.loading-circle::after {
		animation-delay: 0.7s;
	}

	@keyframes loading-wave {
		0% {
			transform: scale(0.85);
			opacity: 0.9;
		}
		100% {
			transform: scale(1.55);
			opacity: 0;
		}
	}

	.loading-title {
		margin-top: 54rpx;
		color: #111827;
		font-size: 36rpx;
		font-weight: 900;
	}

	.loading-desc {
		margin-top: 24rpx;
		color: #8b95a5;
		font-size: 24rpx;
		line-height: 1.75;
		text-align: center;
	}

	.report-scroll {
		flex: 1;
		min-height: 0;
		padding: 24rpx 26rpx 30rpx;
		box-sizing: border-box;
	}

	.report-hero {
		padding: 34rpx 28rpx 30rpx;
		border-radius: 36rpx;
		background: #ffffff;
		box-shadow: 0 10rpx 30rpx rgba(16, 24, 40, 0.07);
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
	}

	.report-date-pill {
		padding: 11rpx 26rpx;
		border: 1rpx solid #e5eaf2;
		border-radius: 30rpx;
		background: #f8fafc;
		color: #4b5563;
		display: flex;
		align-items: center;
		font-size: 24rpx;
		font-weight: 700;
	}

	.report-date-pill .ic {
		margin-right: 10rpx;
	}

	.report-score-line {
		margin-top: 24rpx;
		display: flex;
		align-items: baseline;
	}

	.report-score {
		color: #111827;
		font-size: 76rpx;
		font-weight: 900;
		line-height: 1;
	}

	.report-score-total {
		color: #98a2b3;
		font-size: 30rpx;
	}

	.report-level {
		margin: 22rpx 0 0;
		font-size: 25rpx;
	}

	.report-summary-box {
		margin-top: 26rpx;
		padding: 22rpx 24rpx;
		border-radius: 26rpx;
		background: #f7f8fa;
	}

	.report-summary-box text {
		color: #4b5563;
		font-size: 25rpx;
		line-height: 1.65;
		text-align: center;
	}

	.highlight-card {
		margin-top: 26rpx;
		padding: 30rpx 28rpx;
		border: 1rpx solid #f4df92;
		border-radius: 34rpx;
		background: #fff9e8;
		box-shadow: 0 8rpx 24rpx rgba(250, 157, 0, 0.08);
		box-sizing: border-box;
	}

	.highlight-title-row {
		display: flex;
		align-items: center;
	}

	.highlight-title-row .ic {
		margin-right: 12rpx;
	}

	.highlight-title {
		color: #8a4a00;
		font-size: 29rpx;
		font-weight: 900;
	}

	.highlight-desc {
		display: block;
		margin-top: 18rpx;
		color: #9a6424;
		font-size: 25rpx;
		line-height: 1.6;
	}

	.focus-row {
		margin-top: 18rpx;
		padding: 24rpx 22rpx;
		border: 1rpx solid #f1dfa7;
		border-radius: 24rpx;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.focus-row > view:first-child {
		flex: 1;
		min-width: 0;
	}

	.focus-name {
		display: block;
		color: #111827;
		font-size: 27rpx;
		font-weight: 900;
	}

	.focus-desc {
		display: block;
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 23rpx;
	}

	.focus-score {
		margin-left: 20rpx;
		color: #d97706;
		font-size: 28rpx;
		font-weight: 900;
		white-space: nowrap;
	}

	.dimension-card {
		margin-top: 26rpx;
		padding: 30rpx 28rpx 26rpx;
		border-radius: 34rpx;
		background: #ffffff;
		box-shadow: 0 10rpx 30rpx rgba(16, 24, 40, 0.07);
		box-sizing: border-box;
	}

	.dimension-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.dimension-title {
		flex: 1;
		min-width: 0;
		color: #111827;
		font-size: 30rpx;
		font-weight: 900;
	}

	.dimension-note {
		margin-left: 18rpx;
		color: #98a2b3;
		font-size: 21rpx;
		line-height: 1.5;
		text-align: right;
	}

	.dimension-row {
		margin-top: 25rpx;
	}

	.dimension-label-row {
		margin-bottom: 10rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #344054;
		font-size: 25rpx;
		font-weight: 700;
	}

	.dimension-bar {
		height: 16rpx;
		border-radius: 99rpx;
		background: #eef1f5;
		overflow: hidden;
	}

	.dimension-fill {
		height: 100%;
		border-radius: inherit;
		background: #2F7DF2;
		min-width: 32rpx;
	}

	.dimension-fill.hot {
		background: #FA9D00;
	}

	.dimension-row.is-medicine .dimension-fill {
		background: #14B86A;
	}

	.report-section-head {
		margin-top: 34rpx;
	}

	.report-bottom {
		padding: 18rpx 26rpx calc(24rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		background: #f7f8fa;
		display: flex;
		box-shadow: 0 -8rpx 24rpx rgba(16, 24, 40, 0.06);
	}

	.report-bottom .restart-btn {
		margin-right: 18rpx;
	}

	.restart-btn,
	.back-sleep-btn {
		height: 92rpx;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 900;
		box-sizing: border-box;
	}

	.restart-btn {
		flex: 1;
		border: 1rpx solid #e1e6ef;
		background: #ffffff;
		color: #344054;
	}

	.restart-btn .ic {
		margin-right: 10rpx;
	}

	.back-sleep-btn {
		flex: 1.25;
		background: #165DFF;
		color: #ffffff;
		box-shadow: 0 12rpx 22rpx rgba(22, 93, 255, 0.24);
	}

	.back-sleep-btn .ic {
		margin-left: 10rpx;
	}
	.modal-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 99;
		background: rgba(15, 23, 42, 0.46);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 42rpx;
		box-sizing: border-box;
	}

	.confirm-dialog {
		width: 620rpx;
		padding: 42rpx 36rpx 34rpx;
		border-radius: 34rpx;
		background: #ffffff;
		box-shadow: 0 24rpx 70rpx rgba(15, 23, 42, 0.22);
		box-sizing: border-box;
	}

	.save-dialog-icon {
		width: 104rpx;
		height: 104rpx;
		margin: 0 auto 24rpx;
		border-radius: 32rpx;
		background: #edf3ff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.confirm-title {
		display: block;
		color: #111827;
		font-size: 34rpx;
		font-weight: 900;
		text-align: center;
	}

	.confirm-desc {
		display: block;
		margin-top: 16rpx;
		color: #7b8494;
		font-size: 25rpx;
		line-height: 1.65;
		text-align: center;
	}

	.confirm-actions {
		margin-top: 34rpx;
		display: flex;
	}

	.confirm-actions .continue-btn {
		margin-right: 18rpx;
	}

	.continue-btn,
	.save-exit-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 27rpx;
		font-weight: 900;
	}

	.continue-btn {
		background: #165DFF;
		color: #ffffff;
		box-shadow: 0 12rpx 22rpx rgba(22, 93, 255, 0.22);
	}

	.save-exit-btn {
		border: 1rpx solid #e1e6ef;
		background: #ffffff;
		color: #4b5563;
	}

	.bluetooth-dialog {
		width: 650rpx;
		padding: 30rpx 30rpx 28rpx;
		border-radius: 36rpx;
		background: #ffffff;
		box-shadow: 0 24rpx 70rpx rgba(15, 23, 42, 0.24);
		box-sizing: border-box;
	}

	.dialog-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.dialog-title-wrap {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.dialog-bluetooth-icon {
		width: 78rpx;
		height: 78rpx;
		margin-right: 18rpx;
		border-radius: 24rpx;
		background: #edf3ff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.dialog-title,
	.dialog-subtitle {
		display: block;
	}

	.dialog-title {
		color: #111827;
		font-size: 30rpx;
		font-weight: 900;
	}

	.dialog-subtitle {
		margin-top: 6rpx;
		color: #98a2b3;
		font-size: 22rpx;
	}

	.dialog-close {
		width: 58rpx;
		height: 58rpx;
		border-radius: 50%;
		background: #f3f5f8;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.dialog-line,
	.dialog-bottom-line {
		height: 1rpx;
		background: #edf0f4;
	}

	.dialog-line {
		margin: 26rpx 0 20rpx;
	}

	.bluetooth-tip {
		padding: 18rpx 20rpx;
		border-radius: 22rpx;
		background: #f0f5ff;
		color: #52627c;
		display: flex;
		align-items: flex-start;
		font-size: 22rpx;
		line-height: 1.55;
		box-sizing: border-box;
	}

	.bluetooth-tip .ic {
		margin-right: 10rpx;
		flex: 0 0 auto;
	}

	.bluetooth-search-body,
	.bluetooth-success-body {
		padding: 36rpx 10rpx 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.radar-ring {
		width: 180rpx;
		height: 180rpx;
		border: 2rpx solid rgba(22, 93, 255, 0.18);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.radar-ring::before,
	.radar-ring::after {
		content: "";
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		border: 2rpx solid rgba(22, 93, 255, 0.32);
		border-radius: 50%;
		animation: bluetooth-radar 1.7s infinite ease-out;
	}

	.radar-ring::after {
		animation-delay: 0.58s;
	}

	@keyframes bluetooth-radar {
		0% {
			transform: scale(0.72);
			opacity: 0.85;
		}
		100% {
			transform: scale(1.28);
			opacity: 0;
		}
	}

	.radar-core {
		width: 116rpx;
		height: 116rpx;
		border-radius: 50%;
		background: linear-gradient(145deg, #3F80FF 0%, #165DFF 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 14rpx 28rpx rgba(22, 93, 255, 0.28);
	}

	.bluetooth-state-title,
	.bluetooth-success-title {
		margin-top: 28rpx;
		font-size: 31rpx;
		font-weight: 900;
	}

	.bluetooth-state-title {
		color: #165DFF;
	}

	.bluetooth-success-title {
		color: #059669;
	}

	.bluetooth-state-desc {
		margin-top: 12rpx;
		color: #7b8494;
		font-size: 23rpx;
		line-height: 1.55;
		text-align: center;
	}

	.bluetooth-simulate {
		margin-top: 8rpx;
		color: #b0b8c5;
		font-size: 20rpx;
	}

	.success-circle {
		width: 128rpx;
		height: 128rpx;
		border-radius: 50%;
		background: #eafaf4;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.device-result-card {
		width: 100%;
		margin-top: 28rpx;
		padding: 22rpx;
		border-radius: 26rpx;
		background: #f1fbf6;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.device-result-icon {
		width: 76rpx;
		height: 76rpx;
		margin-right: 18rpx;
		border-radius: 24rpx;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.device-result-info {
		flex: 1;
		min-width: 0;
	}

	.device-result-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.device-result-name {
		color: #111827;
		font-size: 24rpx;
		font-weight: 900;
		line-height: 1.35;
		flex: 1;
		min-width: 0;
	}

	.battery-result {
		margin-left: 12rpx;
		padding: 6rpx 12rpx;
		border-radius: 18rpx;
		background: #dcf7e9;
		color: #059669;
		display: flex;
		align-items: center;
		font-size: 21rpx;
		font-weight: 900;
		white-space: nowrap;
		flex: 0 0 auto;
	}

	.battery-result .ic {
		margin-right: 5rpx;
	}

	.device-result-meta {
		display: block;
		margin-top: 8rpx;
		color: #667085;
		font-size: 21rpx;
	}

	.dialog-bottom-line {
		margin: 8rpx -30rpx 24rpx;
	}

	.dialog-cancel {
		height: 88rpx;
		border-radius: 28rpx;
		background: #f2f4f7;
		color: #667085;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 800;
	}

	.dialog-confirm {
		height: 88rpx;
		border-radius: 28rpx;
		box-shadow: 0 12rpx 22rpx rgba(22, 93, 255, 0.2);
	}
	.ic-back {
		width: 34rpx;
		height: 34rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 5l-7 7 7 7'/%3E%3C/svg%3E");
	}

	.ic-back-white {
		width: 32rpx;
		height: 32rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 12H5M12 19l-7-7 7-7'/%3E%3C/svg%3E");
	}

	.ic-save-blue,
	.ic-save-dialog {
		width: 34rpx;
		height: 34rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23165DFF' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'/%3E%3Cpolyline points='17 21 17 13 7 13 7 21'/%3E%3Cpolyline points='7 3 7 8 15 8'/%3E%3C/svg%3E");
	}

	.ic-save-dialog {
		width: 52rpx;
		height: 52rpx;
	}

	.ic-clock-dark,
	.ic-clock-gray,
	.ic-clock-purple {
		width: 38rpx;
		height: 38rpx;
	}

	.ic-clock-dark {
		width: 36rpx;
		height: 36rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23111827' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 2'/%3E%3C/svg%3E");
	}

	.ic-clock-gray {
		width: 30rpx;
		height: 30rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 2'/%3E%3C/svg%3E");
	}

	.ic-clock-purple {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235b42d8' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 2'/%3E%3C/svg%3E");
	}

	.ic-wind-green {
		width: 40rpx;
		height: 40rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2310a87a' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 8h11a3 3 0 1 0-3-3'/%3E%3Cpath d='M3 12h16a3 3 0 1 1-3 3'/%3E%3Cpath d='M3 16h8'/%3E%3C/svg%3E");
	}

	.ic-alert-orange {
		width: 42rpx;
		height: 42rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 8v5M12 16h.01'/%3E%3C/svg%3E");
	}

	.ic-restart-gray {
		width: 34rpx;
		height: 34rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-2.64-6.36'/%3E%3Cpath d='M21 3v6h-6'/%3E%3C/svg%3E");
	}

	.ic-pulse-white {
		width: 92rpx;
		height: 70rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32' viewBox='0 0 48 32' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 17h10l4-10 7 18 5-11 3 3h15'/%3E%3C/svg%3E");
	}

	.ic-shield-blue {
		width: 32rpx;
		height: 32rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23165DFF' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z'/%3E%3Cpath d='M9 12l2 2 4-4'/%3E%3C/svg%3E");
	}

	.ic-check-green {
		width: 72rpx;
		height: 72rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none' stroke='%23059669' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 17l6 6 13-14'/%3E%3C/svg%3E");
	}

	.ic-battery-green {
		width: 28rpx;
		height: 28rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='8' width='16' height='9' rx='2'/%3E%3Cpath d='M21 11v3'/%3E%3Cpath d='M6 11v3M9 11v3M12 11v3'/%3E%3C/svg%3E");
	}

	.ic-close-gray {
		width: 30rpx;
		height: 30rpx;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238b95a5' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 6l12 12M18 6L6 18'/%3E%3C/svg%3E");
	}

</style>
