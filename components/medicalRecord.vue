<template>
    <view class="medical-record">
        <view class="header-text">
            <view class="header-icon">
                <u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
                <view class="header-name font-bold font-m">
                    个人健康档案
                </view>
            </view>
        </view>
        <view class="health-archive">
            <view class="ha-panel ha-archive-head">
                <view>
                    <view class="ha-title">个人健康档案</view>
                    <view class="ha-subtitle">病历扫描件结构化归档与连续检验趋势</view>
                </view>
                <view class="ha-status">
                    <view class="ha-status-dot"></view>
                    <text>本人档案已同步</text>
                </view>
                <view class="ha-filter-row">
                    <view v-for="item in archiveRanges" :key="item.value"
                        :class="['ha-filter-pill', archiveRange === item.value ? 'is-active' : '']"
                        @click="setArchiveRange(item.value)">
                        {{ item.label }}
                    </view>
                </view>
            </view>

            <view class="ha-panel ha-patient-card">
                <view class="ha-patient-summary" @click="toggleArchive">
                    <view class="ha-avatar">{{ archivePatient.name ? archivePatient.name[0] : '' }}</view>
                    <view class="ha-patient-main">
                        <view class="ha-name-row">
                            <text class="ha-name">{{ archivePatient.name }}</text>
                            <text class="ha-gender">{{ archivePatient.gender }}，{{ archivePatient.age }}岁</text>
                        </view>
                        <view class="ha-surgery">{{ archivePatient.mainDiagnosis }}</view>
                    </view>
                    <view class="ha-chevron" :class="archiveExpanded ? 'is-open' : ''">
                        <u-icon name="arrow-down" color="#7b8a82" size="28rpx"></u-icon>
                    </view>
                </view>
                <view class="u-flex space-between margin-top-1">
                    <view class="ha-surgery">手术类型：{{ archivePatient.surgeryType }}</view>
                    <view class="ha-surgery">手术时间：{{ archivePatient.surgeryDate }}</view>
                </view>
                <view v-show="archiveExpanded" class="ha-expanded">
                    <view class="ha-section">
                        <view class="ha-section-title">
                            <view class="ha-title-mark"></view>
                            <text>一、基础信息</text>
                        </view>
                        <view class="ha-form-grid">
                            <view class="ha-form-item">
                                <text class="ha-form-label">姓名</text>
                                <text class="ha-form-value">{{ archivePatient.name || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item">
                                <text class="ha-form-label">性别</text>
                                <text class="ha-form-value">{{ archivePatient.gender || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item">
                                <text class="ha-form-label">年龄</text>
                                <text class="ha-form-value">{{ archivePatient.age ? archivePatient.age + '岁' : '暂无'
                                }}</text>
                            </view>
                            <view class="ha-form-item">
                                <text class="ha-form-label">电话</text>
                                <text class="ha-form-value">{{ archivePatient.phone || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item ha-full">
                                <text class="ha-form-label">住院号/就诊号</text>
                                <text class="ha-form-value">{{ archivePatient.hospitalNo || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item ha-full">
                                <text class="ha-form-label">主要诊断</text>
                                <text class="ha-form-value">{{ archivePatient.mainDiagnosis || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item ha-full">
                                <text class="ha-form-label">手术类型</text>
                                <text class="ha-form-value">{{ archivePatient.surgeryType || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item ha-full">
                                <text class="ha-form-label">手术时间</text>
                                <text class="ha-form-value">{{ archivePatient.surgeryDate || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item ha-full">
                                <text class="ha-form-label">既往病史</text>
                                <text class="ha-form-value">{{ medicalHistoryText || '暂无' }}</text>
                            </view>
                            <view class="ha-form-item ha-full">
                                <text class="ha-form-label">既往手术史</text>
                                <text class="ha-form-value">{{ surgeryHistoryText || '暂无' }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="ha-section">
                        <view class="ha-section-title ha-section-between">
                            <view class="ha-title-line">
                                <view class="ha-title-mark"></view>
                                <text>二、病历扫描件</text>
                            </view>
                            <view class="ha-camera-btn" @click.stop="openSourcePopup">
                                <u-icon name="camera-fill" color="#15a05a" size="26rpx"></u-icon>
                                <text>拍照更新</text>
                            </view>
                        </view>
                        <scroll-view scroll-x class="ha-scan-list">
                            <view v-if="archiveScans.length === 0" class="ha-empty">暂无病历扫描件</view>
                            <view class="scan-wrap">
                                <view v-for="scan in archiveScans" :key="scan.url" class="ha-scan-card"
                                    @click="previewScan(scan)">
                                    <!-- 缩略图区域 -->
                                    <view class="scan-preview">
                                        <image v-if="isImageScan(scan.url)" :src="scan.url" mode="aspectFill"></image>
                                        <view v-else class="file-icon-wrap">
                                            <u-icon name="file-text" color="#15a05a" size="60rpx"></u-icon>
                                        </view>
                                    </view>
                                    <view class="scan-name">{{ scanTitle(scan) }}</view>
                                    <view class="scan-time">{{ formatScanTime(scan.uploadTime) }}</view>
                                </view>
                            </view>
                        </scroll-view>

                    </view>

                    <view v-for="group in archiveGroups" :key="group.key" class="ha-section ha-lab-card">
                        <view class="ha-section-title u-flex space-between">
                            <view class="u-flex align-center">
                                <view class="ha-title-mark"></view>
                                <text>{{ group.index }}、{{ group.title }}</text>
                            </view>
                            <view class="ha-add-record" @click="openSourcePopup">
                                <u-icon name="camera-fill" color="#ffffff" size="34rpx"></u-icon>
                                <text>追加记录</text>
                            </view>
                        </view>

                        <view class="ha-tabs">
                            <view :class="['ha-tab', group.activeTab === 'latest' ? 'is-active' : '']"
                                @click="setMetricTab(group, 'latest')">最新指标
                                <view class="ha-line"></view>
                            </view>
                            <view :class="['ha-tab', group.activeTab === 'trend' ? 'is-active' : '']"
                                @click="setMetricTab(group, 'trend')">近期趋势
                                <view class="ha-line"></view>
                            </view>
                        </view>

                        <view v-if="group.activeTab === 'latest'" class="ha-metric-list">
                            <view v-if="group.latestIndicators.length === 0" class="ha-empty">暂无检验记录</view>
                            <view v-else>
                                <view v-if="group.latestRecord" class="ha-record-head">
                                    <text class="ha-record-doc">{{ group.latestRecord.sourceDocName || '检验报告' }}</text>
                                    <text class="show-img">查看原始报告</text>
                                </view>
                                <view v-for="ind in group.latestIndicators" :key="ind.name" class="ha-metric-row">
                                    <view class="ha-metric-name">
                                        <view class="name-wrapper">
                                            <text class="ha-metric-code">
                                                {{ ind.label }}
                                            </text>
                                            <text class="ha-metric-info">
                                                ({{ ind.name }})
                                            </text>
                                        </view>

                                        <text class="ha-metric-label">参考 {{ ind.referenceRange }} {{ ind.unit || ''
                                        }}</text>
                                    </view>
                                    <!-- <view class="ha-metric-range">
                                        <text v-if="ind.referenceRange"></text>
                                    </view> -->
                                    <view class="ha-metric-right">
                                        <view
                                            :class="['ha-metric-value', isIndicatorAbnormal(ind) ? 'is-abnormal' : '']">
                                            <text class="ind-qualifier">{{ qualifierText(ind.qualifier) }}</text>{{
                                                ind.value }}
                                            <text class="ha-metric-unit" v-if="ind.unit">{{ ind.unit }}</text>
                                        </view>
                                        <view class="end-wrapper">
                                            <view class="font-info">较前次</view>
                                            <text v-if="changeClass(ind.changeRate) === 'is-up'"
                                                class="custom-icon custom-icon-trending-up icon-bold"
                                                style="font-size:30rpx;color:#e84a4a;"></text>
                                            <text v-else-if="changeClass(ind.changeRate) === 'is-down'"
                                                class="custom-icon custom-icon-trending-down icon-bold"
                                                style="font-size:30rpx;color:#159e58;"></text>
                                            <view :class="['ha-change', changeClass(ind.changeRate)]">
                                                {{ formatChangeRate(ind.changeRate) }}
                                            </view>
                                        </view>

                                    </view>
                                </view>
                            </view>
                        </view>

                        <view v-if="group.activeTab === 'trend'" class="ha-trend-wrap">
                            <view v-if="hasTrendData(group)" class="ha-chart-box">
                                <qiun-data-charts type="line" :opts="archiveChartOpts"
                                    :chartData="getTrendChartData(group)" />
                            </view>
                            <view v-else class="ha-empty">暂无可绘制的趋势数据</view>
                            <view class="ha-analysis">
                                <view class="ha-analysis-head">
                                    <u-icon name="checkmark-circle-fill" color="#e6a217" size="28rpx"></u-icon>
                                    <text>分析摘要</text>
                                </view>
                                <view class="ha-analysis-text">{{ group.summary }}</view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 来源选择弹窗（拍照/相册） -->
        <u-popup :show="showSourcePopup" mode="bottom" :round="20" @close="closeSourcePopup">
            <view class="upload-popup">
                <view class="popup-header">
                    <view class="popup-title">上传病历 / 检验报告</view>
                    <view class="popup-close" @click="closeSourcePopup">
                        <u-icon name="close" color="#111" size="30rpx"></u-icon>
                    </view>
                </view>
                <view class="popup-btn-row">
                    <view class="popup-btn-item mr-40" @click="chooseImages('camera')">
                        <view class="popup-icon">
                            <u-icon name="camera" color="#155dfc" size="80rpx"></u-icon>
                        </view>
                        <view>拍照</view>
                    </view>
                    <view class="popup-btn-item" @click="chooseImages('album')">
                        <view class="popup-icon">
                            <u-icon name="photo" color="#155dfc" size="80rpx"></u-icon>
                        </view>
                        <view>相册</view>
                    </view>
                </view>
            </view>
        </u-popup>

        <!-- 病历字段确认弹窗（MEDICAL_RECORD / MIXED） -->
        <u-popup :show="showFieldPopup" mode="bottom" :round="20" :safeAreaInsetBottom="true" @close="closeFieldPopup">
            <view class="field-popup">
                <view class="popup-header">
                    <view class="popup-title">核对病历信息</view>
                    <view class="popup-close" @click="closeFieldPopup">
                        <u-icon name="close" color="#111" size="30rpx"></u-icon>
                    </view>
                </view>
                <view class="field-popup-tip">仅提交您勾选的字段；姓名/电话等身份字段默认不勾选，请勿用报告抬头自动覆盖档案</view>
                <scroll-view scroll-y class="field-popup-scroll">
                    <view v-if="fieldList.length === 0" class="ha-empty">未识别到可确认的病历字段</view>
                    <view v-for="field in fieldList" :key="field.key" class="field-item"
                        :class="{ 'is-checked': field.checked }" @click="toggleField(field)">
                        <view class="field-check">
                            <u-icon v-if="field.checked" name="checkbox-mark" color="#ffffff" size="26rpx"></u-icon>
                        </view>
                        <view class="field-main">
                            <view class="field-label">
                                {{ field.label }}
                                <text v-if="field.identity" class="identity-tag">身份字段</text>
                                <text v-if="field.lowConfidence" class="missing-tag">低置信度</text>
                            </view>
                            <view class="field-value">{{ field.value }}</view>
                        </view>
                    </view>
                </scroll-view>
                <button class="field-confirm-btn" :disabled="confirming || !hasCheckedField"
                    @click="confirmMedicalRecord">
                    {{ confirming ? '提交中...' : '确认勾选字段' }}
                </button>
            </view>
        </u-popup>
    </view>
</template>

<script>
import {
    getMeHealthArchiveApi,
    postFilesUploadApi,
    postMeMedicalRecordScanApi,
    getMeMedicalRecordScanByTaskIdApi,
    postMeMedicalRecordScanByTaskIdApplyApi,
    postMeMedicalRecordConfirmApi
} from '@/api/frontApikit.js'

const IDENTITY_KEYS = ['name', 'phone', 'idCard', 'gender', 'age']
const DISEASE_FLAG_KEYS = [
    'hypertension', 'heartDisease', 'diabetes', 'cerebrovascular', 'respiratory',
    'kidneyDisease', 'liverDisease', 'surgeryHistory', 'bloodTransfusion',
    'poisoningHistory', 'infectiousHistory', 'viralHepatitis'
]
const FIELD_LABELS = {
    name: '姓名', gender: '性别', age: '年龄', phone: '联系电话', idCard: '身份证号',
    birthDate: '出生日期', nativePlace: '籍贯', occupation: '职业', education: '文化程度',
    maritalStatus: '婚姻状况', address: '住址', hypertension: '高血压', heartDisease: '心脏病',
    diabetes: '糖尿病', cerebrovascular: '脑血管疾病', respiratory: '呼吸系统疾病',
    kidneyDisease: '肾脏疾病', liverDisease: '肝脏疾病', surgeryHistory: '既往手术史',
    bloodTransfusion: '输血史', poisoningHistory: '中毒史', infectiousHistory: '传染病史',
    viralHepatitis: '病毒性肝炎', bloodPressure: '血压', painScore: '疼痛评分',
    nutrition: '营养情况', bmi: 'BMI', smokingDrinking: '烟酒史',
    longTermMedication: '长期用药情况', externalMedication: '外院用药',
    anticoagulantWeek: '近一周抗凝用药', allergyHistory: '过敏史',
    admissionDiagnosis: '入院诊断', admissionCondition: '入院情况',
    treatmentProcess: '诊疗经过', chemoPlan: '化疗方案', mdtRecord: '多学科会诊记录',
    dischargeDiagnosis: '出院诊断', pathologyReport: '病理报告',
    dischargeMedication: '出院带药', mainDiagnosis: '主要诊断',
    surgeryType: '手术类型', surgeryDate: '手术日期', diseaseIntro: '病情简介',
    region: '所在地区', hospitalName: '就诊医院', departmentName: '就诊科室',
    attendingDoctorName: '主诊医生', medicalHistory: '既往病史'
}
const POLL_INTERVAL = 2000
const POLL_MAX_TIMES = 90

export default {
    name: 'medicalRecord',
    data() {
        return {
            archiveLoading: false,
            archivePatient: {},
            archiveScans: [],
            archiveRange: 'all',
            archiveRanges: [
                { label: '全部时间', value: 'all' },
                { label: '近30天', value: '30d' },
                { label: '近7天', value: '7d' }
            ],
            archiveExpanded: true,
            archiveGroups: [],
            archiveChartOpts: {
                color: ['#15a05a', '#2f7ed8', '#f5a623'],
                padding: [15, 15, 30, 15],
                xAxis: { disableGrid: true, axisLine: true, axisTick: false, labelColor: '#909399', labelFontSize: 10 },
                yAxis: { splitNumber: 4, disableGrid: false, gridColor: '#eeeeee', axisLine: false, axisTick: false, labelColor: '#909399', labelFontSize: 10 },
                legend: { show: true, position: 'bottom', float: false, fontSize: 10, color: '#333' },
                line: { width: 2, curve: true, dataPointShape: 'circle', dataPointSize: 4, dataPointShapeHollow: false },
                dataLabel: false
            },
            showSourcePopup: false,
            showFieldPopup: false,
            applying: false,
            confirming: false,
            currentTaskId: '',
            taskView: null,
            ocrResult: null,
            failReason: '',
            fieldList: [],
            pollTimer: null,
            destroyed: false
        }
    },
    computed: {
        hasCheckedField() {
            return this.fieldList.some(item => item.checked)
        },
        medicalHistoryText() {
            const record = this.archivePatient.medicalRecord || {}
            return record.medicalHistory || ''
        },
        surgeryHistoryText() {
            const record = this.archivePatient.medicalRecord || {}
            return record.surgeryHistoryDetail || ''
        },
        scanGroupList() {
            const arr = []
            for (let i = 0; i < this.archiveScans.length; i += 2) {
                arr.push(this.archiveScans.slice(i, i + 2))
            }
            return arr
        }
    },
    created() {
        this.loadArchive()
    },
    beforeDestroy() {
        this.clearTimers()
        this.destroyed = true
    },
    methods: {
        readCurrentUser() {
            try {
                const raw = uni.getStorageSync('userInfo')
                if (!raw) return {}
                return typeof raw === 'string' ? JSON.parse(raw) : raw
            } catch (error) {
                console.error('读取userInfo失败', error)
                return {}
            }
        },
        // 加载健康档案：基本信息 + 扫描件 + 三模块检验记录/趋势
        async loadArchive() {
            const userInfo = this.readCurrentUser()
            if (!userInfo.userId) {
                console.warn('用户id为空，跳过档案请求')
                return
            }
            this.archiveLoading = true
            try {
                const res = await getMeHealthArchiveApi({ id: userInfo.userId, range: this.archiveRange })
                const basic = res.basicInfo || {}
                this.archivePatient = basic
                this.archiveScans = basic.scanDocs || []
                this.$emit('loaded', basic)
                const groupConfig = [
                    { key: 'tumorMarkers', title: '肿瘤标志物', index: '三' },
                    { key: 'bloodRoutine', title: '血常规', index: '四' },
                    { key: 'liverNutrition', title: '肝功能 / 白蛋白营养', index: '五' }
                ]
                this.archiveGroups = groupConfig.map(item => {
                    const groupData = res[item.key] || {}
                    const records = groupData.records || []
                    const historyTrend = groupData.historyTrend || []
                    const latestRecord = records[0] || null
                    const latestIndicators = latestRecord ? latestRecord.indicators || [] : []
                    const categories = historyTrend.map(hd => hd.date)
                    const trends = {}
                    latestIndicators.forEach(ind => {
                        trends[ind.label || ind.name] = historyTrend.map(hd => hd[ind.name] ?? null)
                    })
                    return {
                        key: item.key,
                        index: item.index,
                        title: item.title,
                        activeTab: 'latest',
                        summary: records.length === 0 ? '暂无该分类检验记录' : '指标已更新，请结合主治医生意见随访复查。',
                        records,
                        latestRecord,
                        latestIndicators,
                        categories,
                        trends
                    }
                })
            } catch (error) {
                console.error('健康档案加载失败：', error)
                if (!error || !error.isApiError) {
                    uni.showToast({ title: '档案加载失败', icon: 'none' })
                }
            } finally {
                this.archiveLoading = false
            }
        },
        async setArchiveRange(value) {
            if (this.archiveRange === value) return
            uni.showLoading({ title: '日期切换中...', mask: true })
            this.archiveRange = value
            try {
                await this.loadArchive()
            } finally {
                setTimeout(() => uni.hideLoading(), 250)
            }
        },
        toggleArchive() {
            this.archiveExpanded = !this.archiveExpanded
        },
        setMetricTab(group, tab) {
            this.$set(group, 'activeTab', tab)
        },
        // 真实指标异常：status=high/low
        isIndicatorAbnormal(ind) {
            return !!ind && (ind.status === 'high' || ind.status === 'low')
        },
        changeClass(rate) {
            const value = Number(rate)
            if (Number.isNaN(value) || value === 0) return 'is-flat'
            return value < 0 ? 'is-down' : 'is-up'
        },
        formatChangeRate(rate) {
            if (rate === null || rate === undefined || rate === '') return '-'
            const value = Number(rate)
            if (Number.isNaN(value)) return '-'
            return (value > 0 ? '+' : '') + value.toFixed(1) + '%'
        },
        qualifierText(qualifier) {
            if (qualifier === 'LT') return '<'
            if (qualifier === 'GT') return '>'
            return ''
        },
        hasTrendData(group) {
            if (!group || !Array.isArray(group.categories) || group.categories.length === 0) return false
            return Object.keys(group.trends || {}).some(key => (group.trends[key] || []).some(v => v !== null && v !== undefined && v !== ''))
        },
        getTrendChartData(group) {
            const categories = group.categories || []
            const colors = ['#15a05a', '#2f7ed8', '#f5a623']
            const series = Object.keys(group.trends || {}).slice(0, 3).map((key, index) => ({
                name: key,
                color: colors[index],
                data: group.trends[key]
            })).filter(item => item.data.some(v => v !== null && v !== undefined && v !== ''))
            return { categories, series }
        },
        // ===== OCR：来源选择弹窗 =====
        openSourcePopup() {
            this.showSourcePopup = true
        },
        closeSourcePopup() {
            this.showSourcePopup = false
        },
        chooseImages(source) {
            this.closeSourcePopup()
            uni.chooseImage({
                count: 5,
                sizeType: ['compressed'],
                sourceType: [source === 'camera' ? 'camera' : 'album'],
                success: res => {
                    const paths = res.tempFilePaths || []
                    if (paths.length) this.runOcrPipeline(paths)
                },
                fail: () => { }
            })
        },
        // 主流程：上传 → 建任务 → 轮询 → docType 分流
        async runOcrPipeline(filePaths) {
            this.clearTimers()
            this.destroyed = false
            this.ocrResult = null
            this.taskView = null
            this.failReason = ''
            this.fieldList = []
            this.currentTaskId = ''
            uni.showLoading({ title: '上传识别中...', mask: true })
            try {
                if (filePaths.length > 5) throw new Error('单次最多上传 5 张报告图片')
                const imageUrls = []
                for (const filePath of filePaths) {
                    const url = await postFilesUploadApi({ filePath, name: 'file', dir: 'medical' })
                    if (!url || !/^\/files\/medical\//.test(String(url))) {
                        throw new Error('上传返回地址不合规，请重试')
                    }
                    imageUrls.push(String(url))
                }
                const scanRes = await postMeMedicalRecordScanApi({ imageUrls })
                const taskId = String(scanRes.taskId || '').trim()
                if (!taskId) throw new Error('未获取到识别任务ID')
                this.currentTaskId = taskId
                const view = await this.pollTask(taskId)
                let settledView = view
                try {
                    settledView = await this.settleByDocType(view)
                } catch (settleError) {
                    console.error('自动入库处理失败，保留识别结果供手动重试：', settleError)
                }
                this.taskView = settledView
                this.ocrResult = settledView.result || null
                this.failReason = settledView.failReason || ''
                this.handleResult()
            } catch (error) {
                console.error('OCR 流程失败：', error)
                if (error && error.scanFailed) {
                    uni.showToast({ title: error.message || '识别失败，请重新扫描或手工录入', icon: 'none', duration: 2500 })
                } else if (!error || !error.isApiError) {
                    uni.showToast({ title: (error && error.message) || '处理失败，请稍后重试', icon: 'none' })
                }
            } finally {
                this.clearTimers()
                uni.hideLoading()
            }
        },
        // 轮询：每 2s 一次，最多 180s；FAILED 不再轮询旧 taskId
        pollTask(taskId) {
            let times = 0
            return new Promise((resolve, reject) => {
                const tick = () => {
                    if (this.destroyed) {
                        reject(new Error('组件已销毁'))
                        return
                    }
                    getMeMedicalRecordScanByTaskIdApi({ taskId }).then(view => {
                        const status = view && view.status
                        if (status === 'SUCCESS') {
                            resolve(view)
                            return
                        }
                        if (status === 'FAILED') {
                            const error = new Error((view && view.failReason) || '识别失败，请重新拍摄或手工录入')
                            error.scanFailed = true
                            reject(error)
                            return
                        }
                        times += 1
                        if (times >= POLL_MAX_TIMES) {
                            reject(new Error('识别超时（180秒），请稍后在健康档案查看或重新扫描'))
                            return
                        }
                        this.pollTimer = setTimeout(tick, POLL_INTERVAL)
                    }).catch(reject)
                }
                tick()
            })
        },
        // LAB_REPORT：处理 PENDING/FAILED 自动入库中间态
        async settleByDocType(view) {
            const docType = view.result && view.result.docType
            if (docType !== 'LAB_REPORT') return view
            let latest = view
            let reports = (view.result && view.result.labReports) || []
            const hasPending = () => reports.some(item => item.action === 'PENDING')
            const hasFailed = () => reports.some(item => item.action === 'FAILED' || item.applyError)
            if (hasPending()) {
                await this.sleep(POLL_INTERVAL)
                latest = await getMeMedicalRecordScanByTaskIdApi({ taskId: view.taskId })
                reports = (latest.result && latest.result.labReports) || []
            }
            if (hasPending() || hasFailed()) {
                await postMeMedicalRecordScanByTaskIdApplyApi({ taskId: String(view.taskId) })
                latest = await getMeMedicalRecordScanByTaskIdApi({ taskId: view.taskId })
            }
            return latest
        },
        // 按 docType 分流处理
        handleResult() {
            const result = this.ocrResult
            if (!result) {
                uni.showToast({ title: '识别结果为空，请重新扫描', icon: 'none' })
                return
            }
            const docType = result.docType
            if (docType === 'LAB_REPORT') {
                this.handleLabReport(result)
            } else if (docType === 'MEDICAL_RECORD' || docType === 'MIXED') {
                this.fieldList = this.buildFieldList(result.fields || {}, result.confidence || {}, result.missing || [])
                this.showFieldPopup = true
            } else if (docType === 'UNKNOWN') {
                uni.showModal({
                    title: '未能识别',
                    content: this.failReason || '请重新拍摄清晰的病历或检验报告，或手工录入',
                    showCancel: false,
                    confirmText: '我知道了'
                })
            }
        },
        handleLabReport(result) {
            const reports = result.labReports || []
            const failed = reports.filter(item => item.action === 'FAILED' || item.applyError)
            if (failed.length) {
                uni.showModal({
                    title: '部分报告入库失败',
                    content: '检验指标自动写入档案失败，是否立即重试？',
                    success: res => {
                        if (res.confirm) this.retryApply()
                    }
                })
                return
            }
            uni.showToast({ title: '检验报告已自动写入健康档案', icon: 'none', duration: 2500 })
            this.loadArchive()
        },
        // LAB_REPORT 手动幂等重试
        async retryApply() {
            if (this.applying || !this.taskView) return
            this.applying = true
            uni.showLoading({ title: '重试入库中...', mask: true })
            try {
                await postMeMedicalRecordScanByTaskIdApplyApi({ taskId: String(this.taskView.taskId) })
                const fresh = await getMeMedicalRecordScanByTaskIdApi({ taskId: String(this.taskView.taskId) })
                this.taskView = fresh
                this.ocrResult = fresh.result || this.ocrResult
                uni.showToast({ title: '已重新入库', icon: 'success' })
                this.loadArchive()
            } catch (error) {
                console.error('apply 重试失败：', error)
                if (!error || !error.isApiError) {
                    uni.showToast({ title: (error && error.message) || '重试失败，请稍后再试', icon: 'none' })
                }
            } finally {
                this.applying = false
                uni.hideLoading()
            }
        },
        buildFieldList(fields, confidence, missing) {
            return Object.keys(fields)
                .filter(key => fields[key] !== null && fields[key] !== undefined && fields[key] !== '')
                .map(key => {
                    const isIdentity = IDENTITY_KEYS.indexOf(key) !== -1
                    return {
                        key,
                        label: FIELD_LABELS[key] || key,
                        rawValue: fields[key],
                        value: this.formatFieldValue(key, fields[key]),
                        identity: isIdentity,
                        checked: !isIdentity,
                        lowConfidence: missing.indexOf(key) !== -1 || (confidence[key] !== undefined && Number(confidence[key]) < 0.6)
                    }
                })
        },
        formatFieldValue(key, value) {
            if (DISEASE_FLAG_KEYS.indexOf(key) !== -1) return Number(value) === 1 ? '是' : '否'
            if (typeof value === 'object') return JSON.stringify(value)
            return String(value)
        },
        toggleField(field) {
            field.checked = !field.checked
        },
        closeFieldPopup() {
            this.showFieldPopup = false
        },
        // MEDICAL_RECORD / MIXED：仅提交勾选字段，严禁自动覆盖身份信息
        async confirmMedicalRecord() {
            if (this.confirming) return
            const checked = this.fieldList.filter(item => item.checked)
            if (!checked.length) {
                uni.showToast({ title: '请至少勾选一个需要确认的字段', icon: 'none' })
                return
            }
            const basicInfoPatch = {}
            checked.forEach(item => { basicInfoPatch[item.key] = item.rawValue })
            this.confirming = true
            uni.showLoading({ title: '提交确认中...', mask: true })
            try {
                await postMeMedicalRecordConfirmApi({ taskId: this.currentTaskId, basicInfoPatch })
                uni.showToast({ title: '病历信息已确认', icon: 'success' })
                this.closeFieldPopup()
                this.loadArchive()
            } catch (error) {
                console.error('确认病历字段失败：', error)
                if (!error || !error.isApiError) {
                    uni.showToast({ title: (error && error.message) || '提交失败，请稍后重试', icon: 'none' })
                }
            } finally {
                this.confirming = false
                uni.hideLoading()
            }
        },
        // ===== 扫描件辅助 =====
        isImageScan(url) {
            return /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(String(url || ''))
        },
        scanTitle(scan) {
            if (scan && scan.title) return scan.title
            if (scan && scan.url) {
                const seg = String(scan.url).split('?')[0].split('/').filter(Boolean).pop() || ''
                return decodeURIComponent(seg) || '病历扫描件'
            }
            return '病历扫描件'
        },
        formatScanTime(time) {
            if (!time) return ''
            return String(time).replace('T', ' ').slice(0, 16)
        },
        previewScan(scan) {
            if (!scan || !scan.url) {
                uni.showToast({ title: '暂无可预览文件', icon: 'none' })
                return
            }
            if (this.isImageScan(scan.url)) {
                uni.previewImage({ urls: [scan.url], current: scan.url })
                return
            }
            uni.showLoading({ title: '正在打开...', mask: true })
            uni.downloadFile({
                url: scan.url,
                success: res => {
                    if (res.statusCode === 200 && res.tempFilePath) {
                        uni.openDocument({
                            filePath: res.tempFilePath,
                            showMenu: true,
                            fail: () => uni.showToast({ title: '文件暂不支持预览', icon: 'none' })
                        })
                    } else {
                        uni.showToast({ title: '文件下载失败', icon: 'none' })
                    }
                },
                fail: () => uni.showToast({ title: '文件下载失败', icon: 'none' }),
                complete: () => uni.hideLoading()
            })
        },
        clearTimers() {
            if (this.pollTimer) {
                clearTimeout(this.pollTimer)
                this.pollTimer = null
            }
        },
        sleep(ms) {
            return new Promise(resolve => { this.pollTimer = setTimeout(resolve, ms) })
        }
    }
}
</script>

<style scoped>
.ha-empty {
    padding: 40rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: #999;
}

.ha-panel {
    background: #ffffff;
    border-radius: 22rpx;
    box-shadow: 0 8rpx 28rpx rgba(22, 60, 45, 0.06);
}

.ha-archive-head {
    position: relative;
    padding: 28rpx;
    margin-bottom: 22rpx;
    background: linear-gradient(135deg, #ffffff 0%, #f3fbf6 100%);
}

.ha-title {
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
    color: #172b22;
}

.ha-subtitle {
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 36rpx;
    color: #718078;
    padding-right: 190rpx;
}

.ha-status {
    position: absolute;
    right: 28rpx;
    top: 30rpx;
    display: flex;
    align-items: center;
    font-size: 22rpx;
    color: #159e58;
}

.ha-status-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #16b765;
    margin-right: 8rpx;
    box-shadow: 0 0 0 6rpx rgba(22, 183, 101, 0.12);
}

.ha-filter-row {
    display: flex;
    margin-top: 24rpx;
    background: #f1f5f2;
    border-radius: 999rpx;
    padding: 6rpx;
}

.ha-filter-pill {
    flex: 1;
    height: 48rpx;
    line-height: 48rpx;
    text-align: center;
    font-size: 24rpx;
    color: #65736d;
    border-radius: 999rpx;
}

.ha-filter-pill.is-active {
    color: #ffffff;
    font-weight: 700;
    background: #15a05a;
    box-shadow: 0 6rpx 16rpx rgba(21, 160, 90, 0.22);
}

.ha-patient-card {
    padding: 28rpx;
}

.ha-patient-summary {
    display: flex;
    align-items: flex-start;
}

.ha-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #18b566, #0e8f4d);
    color: #ffffff;
    font-size: 36rpx;
    font-weight: 700;
    text-align: center;
    line-height: 88rpx;
    margin-right: 22rpx;
    flex-shrink: 0;
}

.ha-patient-main {
    flex: 1;
    min-width: 0;
}

.ha-name-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.ha-name {
    font-size: 34rpx;
    font-weight: 700;
    color: #182b22;
    margin-right: 12rpx;
}

.ha-built-tag {
    font-size: 20rpx;
    color: #15a05a;
    border: 1rpx solid rgba(21, 160, 90, 0.35);
    background: #edf9f2;
    border-radius: 999rpx;
    padding: 3rpx 12rpx;
    margin-right: 12rpx;
}

.ha-gender {
    font-size: 24rpx;
    color: #7b8a82;
}

.ha-diagnosis,
.ha-surgery,
.ha-update-row {
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 36rpx;
    color: #52625a;
}

.ha-update-row {
    display: flex;
    align-items: center;
    color: #159e58;
}

.ha-update-row text {
    margin-left: 8rpx;
}

.ha-chevron {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s ease;
}

.ha-chevron.is-open {
    transform: rotate(180deg);
}

.ha-expanded {
    margin-top: 26rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #edf1ee;
}

.ha-section {
    margin-bottom: 28rpx;
}

.ha-section:last-child {
    margin-bottom: 0;
}

.ha-section-title {
    display: flex;
    align-items: center;
    font-size: 29rpx;
    font-weight: 700;
    color: #1e3028;
    margin-bottom: 20rpx;
}

.ha-title-line {
    display: flex;
    align-items: center;
}

.ha-title-mark {
    width: 8rpx;
    height: 30rpx;
    border-radius: 999rpx;
    background: #15a05a;
    margin-right: 12rpx;
}

.ha-section-between {
    justify-content: space-between;
}

.ha-form-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    background: #f8fbf9;
    border-radius: 18rpx;
    padding: 8rpx 20rpx;
}

.ha-form-item {
    width: 48%;
    min-height: 60rpx;
    line-height: 60rpx;
    display: flex;
    flex-direction: row;
    justify-content: start;
    /* border-bottom: 1rpx solid #edf2ef; */
}

.ha-form-item.ha-full {
    width: 100%;
}

.ha-form-label {
    font-size: 22rpx;
    color: #8b9892;
    line-height: 60rpx;
}

.ha-form-value {
    font-size: 22rpx;
    color: #263238;
    line-height: 60rpx;
    margin-left: 15rpx;
}

.ha-note-block {
    background: #f7faf7;
    border: 1rpx solid #edf3ee;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-top: 18rpx;
}

.ha-note-label {
    font-size: 24rpx;
    font-weight: 700;
    color: #304239;
    margin-bottom: 10rpx;
}

.ha-note-text {
    font-size: 24rpx;
    line-height: 38rpx;
    color: #64726b;
}

.ha-camera-btn {
    display: flex;
    align-items: center;
    height: 52rpx;
    padding: 0 18rpx;
    font-size: 22rpx;
    color: #15a05a;
    background: #edf9f2;
    border: 1rpx solid rgba(21, 160, 90, 0.24);
    border-radius: 999rpx;
}

.ha-camera-btn text {
    margin-left: 6rpx;
}

.ha-scan-list {
    display: flex;
}

.ha-scan-list {
    white-space: nowrap;
}

.ha-scan-group {
    display: inline-flex;
    flex-direction: column;
    gap: 18rpx;
    margin-right: 18rpx;
    /* 一组宽度 = 单卡宽度，你可以按需调整 */
}

.ha-scan-card {
    width: 320rpx;
    /* 固定卡片宽度，控制一行2个 */
    display: flex;
    align-items: center;
    padding: 18rpx;
    border: 1rpx solid #e6eee9;
    border-radius: 18rpx;
    background: #fbfdfc;
    flex-shrink: 0;
}

.ha-scan-icon {
    width: 76rpx;
    height: 76rpx;
    border-radius: 18rpx;
    background: #eaf8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.ha-scan-info {
    flex: 1;
    min-width: 0;
}

.ha-scan-name {
    font-size: 25rpx;
    font-weight: 700;
    color: #273930;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.ha-scan-meta {
    margin-top: 8rpx;
    font-size: 21rpx;
    color: #93a099;
}

.ha-lab-card {
    background: #fcfefd;
    border: 1rpx solid #edf3ef;
    border-radius: 20rpx;
    padding: 22rpx;
}

.ha-metric-row {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eef3f0;
}

.ha-metric-row:last-child {
    border-bottom: 0;
}

.ha-metric-code {
    display: block;
    font-size: 24rpx;
    font-weight: 700;
    color: #24352c;
    line-height: 36rpx;
}

.ha-metric-label {
    display: block;
    margin-top: 4rpx;
    font-size: 21rpx;
    color: #8b9892;
    transform: scale(0.92);
    transform-origin: left center;
}

.ha-metric-range {
    flex: 1;
    min-width: 0;
    font-size: 21rpx;
    line-height: 32rpx;
    color: #98a49e;
    padding-right: 12rpx;
}

.ha-metric-right {
    width: 240rpx;
    text-align: right;
    flex-shrink: 0;
}

.ha-metric-value {
    font-size: 32rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #1f3128;
}

.ha-metric-value.is-abnormal {
    color: #e84a4a;
}

.ha-metric-unit {
    font-size: 19rpx;
    font-weight: 400;
    margin-left: 4rpx;
}

.ha-change {
    margin-top: 4rpx;
    font-size: 20rpx;
    line-height: 28rpx;
    font-weight: bold;
}

.ha-change.is-down {
    color: #159e58;
}

.ha-change.is-up {
    color: #e84a4a;
}

.ha-change.is-flat {
    color: #98a49e;
}

.ha-analysis {
    margin-top: 18rpx;
    padding: 20rpx;
    border-radius: 18rpx;
    background: #f0faf4;
}

.ha-analysis-head {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    font-weight: 700;
    color: #14804b;
}

.ha-analysis-head text {
    margin-left: 8rpx;
}

.ha-analysis-text {
    margin-top: 10rpx;
    font-size: 23rpx;
    line-height: 36rpx;
    color: #4f6659;
}

.ha-add-record {
    /* position: fixed;
		right: 28rpx;
		bottom: 150rpx;
		z-index: 20; */
    height: 50rpx;
    padding: 0 26rpx;
    border-radius: 10rpx;
    background: linear-gradient(135deg, #1ab869, #0d944e);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 28rpx rgba(21, 160, 90, 0.32);
    font-size: 16rpx;
    font-weight: 700;
}

.ha-add-record text {
    margin-left: 8rpx;
}

.ha-section {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    /* padding: 24rpx; */
}

.ha-section-title {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
}

.ha-title-mark {
    width: 6rpx;
    height: 28rpx;
    background: #2b7fff;
    border-radius: 3rpx;
    margin-right: 12rpx;
}

.ha-tabs {
    display: flex;
}

.ha-tab {
    position: relative;

    padding: 8rpx 20rpx;
    padding-bottom: 20rpx;
    font-size: 26rpx;
    color: #909399;
}

.ha-tab.is-active {
    color: #00a64c;
}

.ha-line {
    position: absolute;
    left: 32rpx;
    bottom: 0;
    width: calc(100% - 64rpx);
    height: 6rpx;
    background: transparent;
}

.ha-tab.is-active .ha-line {
    background-color: #00a64c;
}

.ha-tabs {
    display: flex;
    gap: 16rpx;
    margin-bottom: 20rpx;
}

.ha-metric-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
}

.ha-metric-code {
    font-weight: bold;
}

.ha-metric-label {
    font-size: 24rpx;
    color: #909399;
    margin-left: 8rpx;
}

.ha-metric-range {
    font-size: 24rpx;
    color: #909399;
}

.ha-metric-right {
    text-align: right;
}

.ha-metric-value {
    font-weight: bold;
}

.is-abnormal {
    color: #f53f3f;
}

.ha-metric-unit {
    font-size: 24rpx;
    color: #909399;
    margin-left: 4rpx;
}

.ha-change {
    font-size: 22rpx;
    margin-top: 4rpx;
}

.ha-change.up {
    color: #f53f3f;
}

.ha-change.down {
    color: #00b42a;
}

.ha-change.flat {
    color: #86909c;
}

.ha-empty {
    text-align: center;
    padding: 30rpx 0;
    color: #999;
}

.ha-trend-wrap {}

.ha-chart-box {
    width: 100%;
    height: 200rpx;
}

.ha-analysis {
    margin-top: 20rpx;
    background: #fff9e8;
    border-radius: 12rpx;
    padding: 16rpx;
}

.ha-analysis-head {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
}

.ha-analysis-text {
    font-size: 26rpx;
    line-height: 1.6;
    color: #444;
}

.ha-scan-list {
    display: flex;
    white-space: nowrap;
}

.medical-record {
    position: relative;
}

.health-archive {
    position: relative;
    margin: 20rpx 0 30rpx;
}

.ind-qualifier {
    font-size: 26rpx;
    margin-right: 2rpx;
}

.ha-record-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #eef3f0;
}

.ha-record-doc {
    font-size: 24rpx;
    color: #909399;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 26rpx;
}

.show-img {
    color: #2563ff;
}

.ha-record-date {
    font-size: 23rpx;
    color: #98a49e;
    flex-shrink: 0;
}

/* 来源选择弹窗（对齐 consultation） */
.upload-popup {
    padding: 40rpx;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
}

.popup-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #1f2329;
}

.popup-close {
    font-size: 40rpx;
    color: #888;
    padding: 10rpx;
}

.popup-btn-row {
    display: flex;
}

.popup-btn-item {
    flex: 1;
    text-align: center;
    padding: 40rpx 20rpx;
    background: #f7f8fa;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #303133;
}

.popup-icon {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 20rpx;
    width: fit-content;
    margin-bottom: 16rpx;
}

/* 病历字段确认弹窗 */
.field-popup {
    padding: 40rpx;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.field-popup-tip {
    font-size: 23rpx;
    color: #ff7800;
    background-color: rgba(255, 120, 0, 0.08);
    border-radius: 12rpx;
    padding: 16rpx 20rpx;
    line-height: 1.5;
    margin-bottom: 24rpx;
}

.field-popup-scroll {
    max-height: 50vh;
}

.field-item {
    display: flex;
    align-items: flex-start;
    padding: 24rpx 20rpx;
    border: 1rpx solid #edf3ef;
    border-radius: 16rpx;
    margin-bottom: 18rpx;
    background-color: #fcfefd;
}

.field-item.is-checked {
    border-color: #155dfc;
    background-color: rgba(21, 93, 252, 0.04);
}

.field-check {
    width: 40rpx;
    height: 40rpx;
    border-radius: 10rpx;
    border: 2rpx solid #c0c4cc;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 4rpx;
}

.field-item.is-checked .field-check {
    background-color: #155dfc;
    border-color: #155dfc;
}

.field-main {
    margin-left: 20rpx;
    flex: 1;
    min-width: 0;
}

.field-label {
    font-size: 27rpx;
    font-weight: bold;
    color: #1f2329;
    display: flex;
    align-items: center;
}

.identity-tag {
    margin-left: 12rpx;
    font-size: 20rpx;
    font-weight: normal;
    color: #ff7800;
    background-color: rgba(255, 120, 0, 0.1);
    padding: 2rpx 12rpx;
    border-radius: 16rpx;
}

.missing-tag {
    margin-left: 12rpx;
    font-size: 20rpx;
    font-weight: normal;
    color: #909399;
    background-color: #f4f4f5;
    padding: 2rpx 12rpx;
    border-radius: 16rpx;
}

.field-value {
    margin-top: 10rpx;
    font-size: 26rpx;
    color: #606266;
    line-height: 1.5;
    word-break: break-all;
}

.field-confirm-btn {
    margin-top: 24rpx;
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    background: linear-gradient(135deg, #2563ff 0%, #447dfd 100%);
    color: #ffffff;
    font-size: 30rpx;
    font-weight: bold;
    border: none;
}

.field-confirm-btn[disabled] {
    opacity: 0.5;
}

.name-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.end-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.ha-metric-info {
    color: #909399;
    font-size: 20rpx;
}

.ha-metric-name {
    /* width: 210rpx; */
    /* flex-shrink: 0; */
    flex: 1;
}
</style>
