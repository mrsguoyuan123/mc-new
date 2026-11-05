<template>
  <view class="archive-page">
    <view v-if="loading" class="state-card">
      <u-loading-icon mode="circle" color="#2563eb" size="28"></u-loading-icon>
      <text class="state-text">正在加载患者临床档案...</text>
    </view>
    <view v-else-if="loadError" class="state-card error-state">
      <u-icon name="close-circle" color="#f04438" size="42"></u-icon>
      <text class="state-text">临床档案加载失败</text>
      <view class="retry-btn" @click="fetchArchive">重新加载</view>
    </view>
    <block v-else>
      <view class="patient-summary">
        <view class="patient-avatar">{{ patientInitial }}</view>
        <view class="patient-main">
          <view class="patient-name-row">
            <text class="patient-name">{{ display(basicInfo.name) }}</text>
            <text class="patient-tag">{{ display(basicInfo.gender) }}</text>
            <text class="patient-tag light">{{ basicInfo.age ? basicInfo.age + ' 岁' : '--' }}</text>
          </view>
          <view class="patient-meta">{{ display(basicInfo.hospitalName) }} · {{ display(basicInfo.departmentName) }}</view>
          <view class="patient-meta subtle">{{ display(basicInfo.phone) }} · {{ display(basicInfo.region || basicInfo.surgeryRegion) }}</view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head" @click="togglePanel('info')">
          <view class="section-icon blue"><u-icon name="account" color="#2563eb" size="20"></u-icon></view>
          <view class="section-heading">
            <text class="section-title">1. 基本信息</text>
            <text class="section-subtitle">身份档案 / 诊疗信息</text>
          </view>
          <view class="chevron" :class="{ collapsed: !panels.info }"></view>
        </view>
        <view v-if="panels.info" class="section-body">
          <view class="block-title">患者身份档案</view>
          <view class="info-grid">
            <view class="info-cell"><text class="info-label">患者姓名</text><text class="info-value">{{ display(basicInfo.name) }}</text></view>
            <view class="info-cell"><text class="info-label">性别 / 年龄</text><text class="info-value">{{ display(basicInfo.gender) }} / {{ basicInfo.age || '--' }}</text></view>
            <view class="info-cell"><text class="info-label">联系方式</text><text class="info-value">{{ display(basicInfo.phone) }}</text></view>
            <view class="info-cell"><text class="info-label">患者 ID</text><text class="info-value strong">{{ display(basicInfo.id || patientId) }}</text></view>
            <view class="info-cell"><text class="info-label">就诊医院</text><text class="info-value">{{ display(basicInfo.hospitalName) }}</text></view>
            <view class="info-cell"><text class="info-label">就诊科室</text><text class="info-value">{{ display(basicInfo.departmentName) }}</text></view>
            <view class="info-cell"><text class="info-label">主诊医生</text><text class="info-value">{{ display(basicInfo.doctorName) }}</text></view>
            <view class="info-cell"><text class="info-label">主治医师</text><text class="info-value">{{ display(basicInfo.attendingDoctorName) }}</text></view>
          </view>
          <view class="block-title">诊断与手术明细</view>
          <view class="diagnosis-box">
            <view class="diagnosis-row"><text class="info-label">主要诊断</text><text class="diagnosis-text">{{ display(basicInfo.mainDiagnosis) }}</text></view>
            <view v-if="!isBlank(basicInfo.diseaseIntro)" class="diagnosis-row"><text class="info-label">病情简介</text><text class="diagnosis-text">{{ basicInfo.diseaseIntro }}</text></view>
          </view>
          <view class="info-grid">
            <view class="info-cell"><text class="info-label">手术类型</text><text class="info-value">{{ display(basicInfo.surgeryType) }}</text></view>
            <view class="info-cell"><text class="info-label">手术日期</text><text class="info-value">{{ formatDate(basicInfo.surgeryDate) }}</text></view>
            <view class="info-cell"><text class="info-label">身高</text><text class="info-value">{{ basicInfo.heightCm ? basicInfo.heightCm + ' cm' : '--' }}</text></view>
            <view class="info-cell"><text class="info-label">基础体重</text><text class="info-value">{{ basicInfo.weightKg ? formatNumber(basicInfo.weightKg, 1) + ' kg' : '--' }}</text></view>
          </view>
          <view class="block-title">病史与健康信息</view>
          <view class="history-list">
            <view v-for="item in historyItems" :key="item.label" class="history-item">
              <text class="history-label">{{ item.label }}</text>
              <text class="history-value">{{ item.value }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head" @click="togglePanel('attachments')">
          <view class="section-icon indigo"><u-icon name="folder" color="#4f46e5" size="20"></u-icon></view>
          <view class="section-heading">
            <text class="section-title">2. 附件资料库</text>
            <text class="section-subtitle">检查 / 影像 / 病理 / 随访记录</text>
          </view>
          <view class="head-badge">{{ attachments.length }}</view>
          <view class="chevron" :class="{ collapsed: !panels.attachments }"></view>
        </view>
        <view v-if="panels.attachments" class="section-body">
          <scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
            <view class="filter-row">
              <view v-for="item in attachmentFilters" :key="item.value" class="filter-pill" :class="{ active: fileTab === item.value }" @click="fileTab = item.value">{{ item.label }}</view>
            </view>
          </scroll-view>
          <view v-if="filteredAttachments.length" class="file-list">
            <view v-for="(file, index) in filteredAttachments" :key="file.id || index" class="file-item">
              <view class="file-icon" :class="attachmentKind(file)"><u-icon :name="attachmentIcon(file)" :color="attachmentColor(file)" size="20"></u-icon></view>
              <view class="file-info">
                <text class="file-name">{{ fileDisplayName(file) }}</text>
                <text class="file-desc">{{ attachmentCategoryText(file) }} · {{ formatFileSize(file.fileSize) }} · {{ formatDateTime(file.uploadTime) }}</text>
                <text class="file-uploader">{{ uploaderRoleText(file.uploaderRole) }}{{ file.uploader ? ' · ' + file.uploader : '' }}</text>
              </view>
              <view class="file-actions">
                <view class="file-action" @click.stop="viewFile(file)"><u-icon name="eye" color="#2563eb" size="17"></u-icon></view>
                <view class="file-action" @click.stop="downloadFile(file)"><u-icon name="download" color="#475467" size="17"></u-icon></view>
              </view>
            </view>
          </view>
          <view v-else class="empty-box">暂无该类型附件</view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head" @click="togglePanel('diet')">
          <view class="section-icon orange"><u-icon name="grid" color="#ea580c" size="20"></u-icon></view>
          <view class="section-heading"><text class="section-title">3. 饮食分析</text><text class="section-subtitle">最近记录 / 7 天营养趋势</text></view>
          <view class="chevron" :class="{ collapsed: !panels.diet }"></view>
        </view>
        <view v-if="panels.diet" class="section-body">
          <view class="latest-box orange-bg">
            <view class="latest-top"><text class="latest-label">最近一次记录</text><text class="latest-date">{{ formatDate(pointDate(dietLatest)) }}</text></view>
            <text class="latest-content">{{ dietFoodText }}</text>
            <view class="metric-mini-grid">
              <view v-for="metric in dietCards" :key="metric.key" class="metric-mini">
                <text class="mini-value" :style="{ color: metric.color }">{{ metric.display }}</text>
                <text class="mini-label">{{ metric.label }} {{ metric.unit }}</text>
              </view>
            </view>
          </view>
          <scroll-view class="filter-scroll small" scroll-x :show-scrollbar="false">
            <view class="filter-row">
              <view v-for="metric in dietMetrics" :key="metric.key" class="filter-pill" :class="{ active: dietMetric === metric.key }" @click="dietMetric = metric.key">{{ metric.label }}</view>
            </view>
          </scroll-view>
          <view v-if="hasChartData(dietChartData)" class="chart-box"><qiun-data-charts type="line" canvas-id="dietTrendChart" :chartData="dietChartData" :opts="chartOptions([activeDietMetric.color], activeDietMetric.unit, false)" /></view>
          <view v-else class="empty-box">暂无 7 天饮食趋势数据</view>
        </view>
      </view>
      <view class="section-card">
        <view class="section-head" @click="togglePanel('exercise')">
          <view class="section-icon green"><u-icon name="heart" color="#16a34a" size="20"></u-icon></view>
          <view class="section-heading"><text class="section-title">4. 运动分析</text><text class="section-subtitle">运动执行 / RPE 疲劳评分</text></view>
          <view class="chevron" :class="{ collapsed: !panels.exercise }"></view>
        </view>
        <view v-if="panels.exercise" class="section-body">
          <view class="latest-box green-bg">
            <view class="latest-top"><text class="latest-label">最近一次运动</text><text class="latest-date">{{ formatDate(pointDate(exerciseLatest)) }}</text></view>
            <view class="exercise-head"><text class="exercise-type">{{ exerciseTypeText }}</text><text class="exercise-duration">{{ exerciseDurationText }}</text></view>
            <view class="metric-mini-grid three">
              <view class="metric-mini"><text class="mini-value green-text">{{ metricDisplay(exerciseLatest, exerciseMetrics[0]) }}</text><text class="mini-label">目标 RPE</text></view>
              <view class="metric-mini"><text class="mini-value blue-text">{{ metricDisplay(exerciseLatest, exerciseMetrics[1]) }}</text><text class="mini-label">实际 RPE</text></view>
              <view class="metric-mini"><text class="mini-value orange-text">{{ exerciseDurationText }}</text><text class="mini-label">单次时长</text></view>
            </view>
          </view>
          <view v-if="hasChartData(exerciseChartData)" class="chart-box tall"><qiun-data-charts type="line" canvas-id="exerciseTrendChart" :chartData="exerciseChartData" :opts="chartOptions(['#16a34a', '#2563eb'], 'RPE', true)" /></view>
          <view v-else class="empty-box">暂无 7 天运动趋势数据</view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head" @click="togglePanel('weight')">
          <view class="section-icon violet"><u-icon name="level" color="#7c3aed" size="20"></u-icon></view>
          <view class="section-heading"><text class="section-title">5. 体重动态</text><text class="section-subtitle">体重恢复 / 7 天变化趋势</text></view>
          <view class="chevron" :class="{ collapsed: !panels.weight }"></view>
        </view>
        <view v-if="panels.weight" class="section-body">
          <view class="latest-box violet-bg">
            <view class="latest-top"><text class="latest-label">最近记录</text><text class="latest-date">{{ weightDateText }}</text></view>
            <view class="big-measure"><text class="big-number">{{ weightValueText }}</text><text class="big-unit">kg</text></view>
            <view class="measure-footer"><text>较上次：{{ weightChangeText }}</text><text>BMI：{{ metricDisplay(weightLatest, { aliases: ['bmi'] }, '--', 1) }}</text></view>
          </view>
          <view v-if="hasChartData(weightChartData)" class="chart-box"><qiun-data-charts type="line" canvas-id="weightArchiveChart" :chartData="weightChartData" :opts="chartOptions(['#7c3aed'], 'kg', false)" /></view>
          <view v-else class="empty-box">暂无 7 天体重趋势数据</view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head" @click="togglePanel('glucosePressure')">
          <view class="section-icon red"><u-icon name="heart-fill" color="#dc2626" size="20"></u-icon></view>
          <view class="section-heading"><text class="section-title">6. 血糖与血压</text><text class="section-subtitle">院外指标监测 / 7 天趋势</text></view>
          <view class="chevron" :class="{ collapsed: !panels.glucosePressure }"></view>
        </view>
        <view v-if="panels.glucosePressure" class="section-body">
          <view class="segmented">
            <view class="segment-item" :class="{ active: vitalTab === 'glucose' }" @click="vitalTab = 'glucose'">血糖监测</view>
            <view class="segment-item" :class="{ active: vitalTab === 'pressure' }" @click="vitalTab = 'pressure'">血压监测</view>
          </view>
          <view v-if="vitalTab === 'glucose'" class="latest-box red-bg">
            <view class="latest-top"><text class="latest-label">最近空腹血糖</text><text class="latest-date">{{ formatDate(pointDate(glucoseLatest)) }}</text></view>
            <view class="big-measure"><text class="big-number">{{ metricDisplay(glucoseLatest, glucoseMetric, '--', 1) }}</text><text class="big-unit">mmol/L</text></view>
            <view class="measure-footer"><text>参考范围：{{ metricText(glucoseLatest, ['range', 'referenceRange', 'refRange'], '3.9-6.1 mmol/L') }}</text><text>{{ vitalStatusText(glucoseLatest) }}</text></view>
          </view>
          <view v-else class="latest-box red-bg">
            <view class="latest-top"><text class="latest-label">最近血压记录</text><text class="latest-date">{{ formatDate(pointDate(pressureLatest)) }}</text></view>
            <view class="big-measure"><text class="big-number">{{ pressureValueText }}</text><text class="big-unit">mmHg</text></view>
            <view class="measure-footer"><text>参考范围：{{ metricText(pressureLatest, ['standard', 'range', 'referenceRange', 'refRange'], '< 140/90') }}</text><text>{{ vitalStatusText(pressureLatest) }}</text></view>
          </view>
          <view v-if="hasChartData(vitalChartData)" class="chart-box tall"><qiun-data-charts type="line" canvas-id="vitalTrendChart" :chartData="vitalChartData" :opts="vitalChartOptions" /></view>
          <view v-else class="empty-box">{{ vitalTab === 'glucose' ? '暂无 7 天血糖趋势数据' : '暂无 7 天血压趋势数据' }}</view>
        </view>
      </view>
      <view v-for="section in labSections" :key="section.key" class="section-card">
        <view class="section-head" @click="togglePanel(section.key)">
          <view class="section-icon" :class="section.tone"><u-icon :name="section.icon" :color="section.color" size="20"></u-icon></view>
          <view class="section-heading">
            <text class="section-title">{{ section.index }}. {{ section.title }}</text>
            <text class="section-subtitle">最新指标 / 30 天趋势</text>
          </view>
          <view class="chevron" :class="{ collapsed: !panels[section.key] }"></view>
        </view>
        <view v-if="panels[section.key]" class="section-body">
          <view v-if="section.cards.length" class="lab-card-grid">
            <view v-for="(card, cardIndex) in visibleLabCards(section)" :key="card.name || cardIndex" class="lab-card" :class="labStatusClass(card)">
              <view class="lab-card-head">
                <text class="lab-name">{{ display(card.name) }}</text>
                <text v-if="labStatusText(card)" class="lab-status">{{ labStatusText(card) }}</text>
              </view>
              <view class="lab-value-row">
                <text class="lab-value">{{ display(card.value) }}</text>
                <text class="lab-unit">{{ display(card.unit, '') }}</text>
              </view>
              <text class="lab-range">参考：{{ display(card.refRange || card.referenceRange, '以实验室范围为准') }}</text>
              <text v-if="labChangeText(card) !== '--'" class="lab-change">
                较前次：{{ labChangeText(card) }}
              </text>
            </view>
          </view>
          <view v-else class="empty-box compact">暂无最新检验指标</view>

          <view v-if="section.cards.length > 3" class="expand-more" @click="toggleLabMore(section.key)">
            {{ expandedLabs[section.key] ? '收起更多指标' : '展开全部 ' + section.cards.length + ' 项' }}
          </view>

          <view v-if="hasChartData(labChartData(section))" class="chart-box tall">
            <qiun-data-charts
              type="line"
              :canvas-id="section.key + 'Chart'"
              :chartData="labChartData(section)"
              :opts="chartOptions(section.chartColors, '', labChartData(section).series.length > 1)"
            />
          </view>
          <view v-else class="empty-box">暂无 30 天趋势数据</view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head" @click="togglePanel('other')">
          <view class="section-icon gray"><u-icon name="file-text" color="#475467" size="20"></u-icon></view>
          <view class="section-heading">
            <text class="section-title">10. 其他附件查阅</text>
            <text class="section-subtitle">非医生上传资料 / 只读</text>
          </view>
          <view class="head-badge subtle">{{ otherAttachments.length }}</view>
          <view class="chevron" :class="{ collapsed: !panels.other }"></view>
        </view>
        <view v-if="panels.other" class="section-body">
          <view class="readonly-note">
            <u-icon name="info-circle" color="#2563eb" size="16"></u-icon>
            <text>其他附件由患者或陪诊人员同步，医生端仅支持查阅。</text>
          </view>
          <view v-if="otherAttachments.length" class="file-list">
            <view v-for="(file, index) in otherAttachments" :key="file.id || 'other-' + index" class="file-item">
              <view class="file-icon" :class="attachmentKind(file)"><u-icon :name="attachmentIcon(file)" :color="attachmentColor(file)" size="20"></u-icon></view>
              <view class="file-info">
                <text class="file-name">{{ fileDisplayName(file) }}</text>
                <text class="file-desc">{{ attachmentCategoryText(file) }} · {{ formatDateTime(file.uploadTime) }}</text>
                <text class="file-uploader">{{ uploaderRoleText(file.uploaderRole) }}{{ file.uploader ? ' · ' + file.uploader : '' }}</text>
              </view>
              <view class="file-actions">
                <view class="file-action" @click.stop="viewFile(file)"><u-icon name="eye" color="#2563eb" size="17"></u-icon></view>
              </view>
            </view>
          </view>
          <view v-else class="empty-box">暂无其他附件</view>
        </view>
      </view>
    </block>
  </view>
</template>

<script>
import { getDoctorPatientsByIdArchiveApi } from '@/api/frontApikit.js'

export default {
  data() {
    return {
      loading: true,
      loadError: false,
      patientId: '',
      archive: {},
      fileTab: 'all',
      dietMetric: 'calories',
      vitalTab: 'glucose',
      expandedLabs: {
        tumor: false,
        blood: false,
        liver: false
      },
      attachmentFilters: [
        { value: 'all', label: '全部' },
        { value: 'check', label: '检查报告' },
        { value: 'image', label: '影像资料' },
        { value: 'pathology', label: '病理资料' },
        { value: 'diet', label: '饮食记录' },
        { value: 'exercise', label: '运动记录' },
        { value: 'other', label: '其他' }
      ],
      dietMetrics: [
        { key: 'calories', label: '热量', unit: 'kcal', color: '#ea580c', aliases: ['calories', 'calorie', 'energy', 'kcal', 'totalcalories'] },
        { key: 'protein', label: '蛋白质', unit: 'g', color: '#2563eb', aliases: ['protein', 'proteintake', 'proteing'] },
        { key: 'fat', label: '脂肪', unit: 'g', color: '#16a34a', aliases: ['fat', 'fatintake', 'totalfat'] },
        { key: 'vitamin', label: '维生素', unit: '%', color: '#7c3aed', aliases: ['vitamin', 'vitamins', 'vitaminrate', 'vitaminpercent'] }
      ],
      exerciseMetrics: [
        { key: 'targetRpe', label: '目标RPE', aliases: ['targetrpe', 'rpetarget', 'targetrpescore', 'target'] },
        { key: 'actualRpe', label: '实际RPE', aliases: ['actualrpe', 'rpe', 'actualrpescore', 'rpescore', 'actual'] }
      ],
      glucoseMetric: { key: 'glucose', aliases: ['value', 'glucose', 'bloodglucose', 'bloodglucosevalue', 'fastingglucose'] },
      panels: {
        info: true,
        attachments: true,
        diet: true,
        exercise: true,
        weight: true,
        glucosePressure: true,
        tumor: true,
        blood: true,
        liver: true,
        other: true
      }
    }
  },
  computed: {
    basicInfo() {
      return this.archive.basicInfo || {}
    },
    medicalRecord() {
      return this.basicInfo.medicalRecord || {}
    },
    attachments() {
      return this.asArray(this.archive.attachments)
    },
    otherAttachments() {
      return this.asArray(this.archive.otherAttachments)
    },
    patientInitial() {
      const name = this.basicInfo.name || '患'
      return name.slice(0, 1)
    },
    historyItems() {
      const record = this.medicalRecord
      const diseaseFlags = [
        ['hypertension', '高血压'],
        ['heartDisease', '心脏病'],
        ['diabetes', '糖尿病'],
        ['cerebrovascular', '脑血管疾病'],
        ['respiratory', '呼吸系统疾病'],
        ['kidneyDisease', '肾脏疾病'],
        ['liverDisease', '肝脏疾病']
      ].filter(item => Number(record[item[0]]) === 1).map(item => item[1])
      return [
        { label: '既往疾病', value: diseaseFlags.length ? diseaseFlags.join('、') : this.display(record.pastHistory) },
        { label: '既往手术史', value: record.surgeryHistory !== undefined ? this.boolText(record.surgeryHistory) : this.display(record.history) },
        { label: '过敏史', value: this.display(record.allergyHistory) },
        { label: '烟酒史', value: this.display(record.smokingDrinking) },
        { label: '长期用药', value: this.display(record.longTermMedication || record.externalMedication) },
        { label: '入院诊断', value: this.display(record.admissionDiagnosis) },
        { label: '出院诊断', value: this.display(record.dischargeDiagnosis) },
        { label: '病理报告', value: this.display(record.pathologyReport) }
      ]
    },
    filteredAttachments() {
      if (this.fileTab === 'all') return this.attachments
      return this.attachments.filter(file => this.attachmentMatch(file, this.fileTab))
    },
    dietLatest() {
      return (this.archive.diet || {}).latest || {}
    },
    dietFoodText() {
      return this.metricText(this.dietLatest, ['foodContent', 'foods', 'food', 'mealContent', 'meal', 'remark', 'description'], '暂无饮食内容记录')
    },
    dietCards() {
      return this.dietMetrics.map(metric => ({
        ...metric,
        display: this.metricDisplay(this.dietLatest, metric, '--', 0)
      }))
    },
    activeDietMetric() {
      return this.dietMetrics.find(item => item.key === this.dietMetric) || this.dietMetrics[0]
    },
    dietChartData() {
      return this.buildTrend((this.archive.diet || {}).trend7d, [this.activeDietMetric])
    },
    exerciseLatest() {
      return (this.archive.exercise || {}).latest || {}
    },
    exerciseTypeText() {
      const items = this.asArray(this.exerciseLatest.items || this.exerciseLatest.exerciseItems)
      if (items.length) return items.map(item => typeof item === 'string' ? item : item.type || item.name).filter(Boolean).join('、')
      return this.metricText(this.exerciseLatest, ['exerciseType', 'type', 'name', 'sportType', 'project'], '--')
    },
    exerciseDurationText() {
      const value = this.firstMetric(this.exerciseLatest, ['durationMin', 'duration', 'minutes', 'timeMin', 'durationMinutes'])
      return this.isBlank(value) ? '--' : `${this.formatNumber(value, 0)} 分钟`
    },
    exerciseChartData() {
      return this.buildTrend((this.archive.exercise || {}).trend7d, this.exerciseMetrics)
    },
    weightLatest() {
      return (this.archive.weight || {}).latest || {}
    },
    weightDateText() {
      return this.formatDate(this.pointDate(this.weightLatest))
    },
    weightValueText() {
      return this.metricDisplay(this.weightLatest, { aliases: ['weight', 'weightKg', 'value', 'bodyWeight'] }, '--', 1)
    },
    weightChangeText() {
      const direct = this.firstMetric(this.weightLatest, ['change', 'weightChange', 'difference', 'delta'])
      if (!this.isBlank(direct)) return `${Number(direct) > 0 ? '+' : ''}${this.formatNumber(direct, 1)} kg`
      const points = this.asArray((this.archive.weight || {}).trend7d)
      if (points.length < 2) return '--'
      const current = Number(this.firstMetric(points[0], ['weight', 'weightKg', 'value']))
      const previous = Number(this.firstMetric(points[1], ['weight', 'weightKg', 'value']))
      if (!Number.isFinite(current) || !Number.isFinite(previous)) return '--'
      const diff = current - previous
      return `${diff > 0 ? '+' : ''}${this.formatNumber(diff, 1)} kg`
    },
    weightChartData() {
      return this.buildTrend((this.archive.weight || {}).trend7d, [{ name: '体重', aliases: ['weight', 'weightKg', 'value', 'bodyWeight'] }])
    },
    glucoseLatest() {
      return ((this.archive.bloodGlucosePressure || {}).glucose || {}).latest || {}
    },
    pressureLatest() {
      return ((this.archive.bloodGlucosePressure || {}).bloodPressure || (this.archive.bloodGlucosePressure || {}).bp || {}).latest || {}
    },
    pressureValueText() {
      const sbp = this.metricDisplay(this.pressureLatest, { aliases: ['sbp', 'systolic', 'systolicPressure', 'highPressure', 'high'] }, '--', 0)
      const dbp = this.metricDisplay(this.pressureLatest, { aliases: ['dbp', 'diastolic', 'diastolicPressure', 'lowPressure', 'low'] }, '--', 0)
      return `${sbp}/${dbp}`
    },
    vitalChartData() {
      const points = (this.archive.bloodGlucosePressure || {})[this.vitalTab === 'glucose' ? 'glucose' : 'bloodPressure'] || {}
      if (this.vitalTab === 'glucose') {
        return this.buildTrend(points.trend7d, [{ name: '血糖', ...this.glucoseMetric }])
      }
      return this.buildTrend(points.trend7d, [
        { name: '收缩压', aliases: ['sbp', 'systolic', 'systolicpressure', 'highpressure', 'high'] },
        { name: '舒张压', aliases: ['dbp', 'diastolic', 'diastolicpressure', 'lowpressure', 'low'] }
      ])
    },
    vitalChartOptions() {
      return this.chartOptions(this.vitalTab === 'glucose' ? ['#dc2626'] : ['#dc2626', '#f97316'], this.vitalTab === 'glucose' ? 'mmol/L' : 'mmHg', this.vitalTab === 'pressure')
    },
    labSections() {
      return [
        { key: 'tumor', index: 7, title: '肿瘤标志物', icon: 'column-line', tone: 'cyan', color: '#0891b2', chartColors: ['#0891b2', '#2563eb', '#7c3aed'], module: this.archive.tumorMarkers || {} },
        { key: 'blood', index: 8, title: '血常规', icon: 'grid', tone: 'teal', color: '#0f766e', chartColors: ['#0f766e', '#16a34a', '#f59e0b'], module: this.archive.bloodRoutine || {} },
        { key: 'liver', index: 9, title: '肝功能 / 白蛋白营养', icon: 'heart', tone: 'emerald', color: '#059669', chartColors: ['#059669', '#2563eb', '#ea580c'], module: this.archive.liverNutrition || {} }
      ].map(item => ({
        ...item,
        cards: this.asArray(item.module.latestCards),
        trend: this.asArray(item.module.trend30d)
      }))
    }
  },
  onLoad(options) {
    this.patientId = options && options.id ? decodeURIComponent(options.id) : ''
    uni.setNavigationBarTitle({ title: '患者临床档案' })
    this.fetchArchive()
  },
  methods: {
    async fetchArchive() {
      if (!this.patientId) {
        this.loading = false
        this.loadError = true
        uni.showToast({ title: '患者ID缺失', icon: 'none' })
        return
      }
      this.loading = true
      this.loadError = false
      try {
        this.archive = await getDoctorPatientsByIdArchiveApi({ id: this.patientId }) || {}
      } catch (error) {
        this.loadError = true
        uni.showToast({ title: '临床档案加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    togglePanel(key) {
      this.panels[key] = !this.panels[key]
    },
    isBlank(value) {
      return value === undefined || value === null || String(value).trim() === ''
    },
    display(value, fallback = '--') {
      return this.isBlank(value) ? fallback : String(value)
    },
    asArray(value) {
      return Array.isArray(value) ? value : []
    },
    boolText(value) {
      if (value === true || Number(value) === 1 || value === '是') return '有'
      if (value === false || Number(value) === 0 || value === '否') return '无'
      return '--'
    },
    normalizeKey(key) {
      return String(key || '').toLowerCase().replace(/[\s_\-./（）()]/g, '')
    },
    firstMetric(source, aliases) {
      if (!source || typeof source !== 'object') return undefined
      const list = (Array.isArray(aliases) ? aliases : (aliases && aliases.aliases) || []).map(this.normalizeKey)
      const keys = Object.keys(source)
      for (const alias of list) {
        const matched = keys.find(key => this.normalizeKey(key) === alias)
        if (matched !== undefined && !this.isBlank(source[matched])) return source[matched]
      }
      return undefined
    },
    metricText(source, aliases, fallback = '--') {
      const value = this.firstMetric(source, aliases)
      return this.isBlank(value) ? fallback : String(value)
    },
    metricDisplay(source, metric, fallback = '--', digits = null) {
      const value = this.firstMetric(source, metric)
      if (this.isBlank(value)) return fallback
      const number = Number(value)
      if (!Number.isFinite(number)) return String(value)
      return this.formatNumber(number, digits)
    },
    formatNumber(value, digits = null) {
      const number = Number(value)
      if (!Number.isFinite(number)) return this.display(value)
      if (digits === null || digits === undefined) return String(number)
      return number.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
    },
    pointDate(point) {
      return this.firstMetric(point, ['date', 'recordDate', 'measureDate', 'createTime', 'time', 'measuredAt', 'recordTime'])
    },
    formatDate(value) {
      if (this.isBlank(value)) return '--'
      const text = String(value)
      if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
      const date = new Date(text.replace(/-/g, '/'))
      if (Number.isNaN(date.getTime())) return text.slice(0, 10)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    formatDateTime(value) {
      if (this.isBlank(value)) return '--'
      const text = String(value)
      if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(text)) return text.slice(0, 16).replace('T', ' ')
      return this.formatDate(text)
    },
    formatChange(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '--'
      return `${number > 0 ? '+' : ''}${this.formatNumber(number, 1)}`
    },
    vitalStatusText(source) {
      const status = this.metricText(source, ['status', 'level', 'result'], '').toLowerCase()
      if (['normal', 'normalrange', '正常', '达标'].indexOf(status) !== -1) return '正常'
      if (['warning', 'high', 'low', 'abnormal', '异常', '偏高', '偏低', '不达标'].indexOf(status) !== -1) return '异常'
      return status ? this.display(status, '') : '--'
    },
    toFiniteNumber(value) {
      if (this.isBlank(value)) return null
      const number = Number(String(value).replace('%', '').trim())
      return Number.isFinite(number) ? number : null
    },
    buildTrend(rawPoints, metrics) {
      const points = this.asArray(rawPoints)
      return {
        categories: points.map(point => this.formatDate(this.pointDate(point)).slice(5).replace('-', '/')),
        series: (metrics || []).map(metric => ({
          name: metric.name || metric.label || metric.key || '',
          data: points.map(point => this.toFiniteNumber(this.firstMetric(point, metric)))
        }))
      }
    },
    hasChartData(chartData) {
      return chartData && chartData.categories && chartData.categories.length &&
        chartData.series && chartData.series.some(series => series.data.some(value => value !== null && value !== undefined))
    },
    chartOptions(colors, unit = '', showLegend = false) {
      return {
        color: colors,
        padding: [14, 18, 4, 4],
        enableScroll: false,
        legend: { show: showLegend, position: 'top', float: false, fontSize: 11, lineHeight: 22 },
        dataLabel: false,
        dataPointShape: true,
        xAxis: {
          disableGrid: true,
          axisLine: false,
          fontSize: 10,
          fontColor: '#98a2b3',
          lineHeight: 20,
          boundaryGap: 'justify'
        },
        yAxis: {
          disabled: false,
          disableGrid: false,
          gridType: 'dash',
          dashLength: 4,
          gridColor: '#edf0f5',
          splitNumber: 3,
          fontSize: 10,
          fontColor: '#98a2b3',
          tofix: 1,
          unit: unit || ''
        },
        extra: {
          line: { type: 'curve', width: 2, activeType: 'none' },
          tooltip: { showCategory: true }
        }
      }
    },
    visibleLabCards(section) {
      return this.expandedLabs[section.key] ? section.cards : section.cards.slice(0, 3)
    },
    toggleLabMore(key) {
      this.$set(this.expandedLabs, key, !this.expandedLabs[key])
    },
    labStatusText(card) {
      const status = String(card.status || '').toLowerCase()
      if (status === 'warning' || status === 'high' || status === 'abnormal') return '异常'
      if (status === 'normal') return '正常'
      return ''
    },
    labStatusClass(card) {
      return this.labStatusText(card) === '异常' ? 'warning' : 'normal'
    },
    labChangeText(card) {
      const useRate = card.change === undefined || card.change === null
      const value = useRate ? card.changeRate : card.change
      const text = this.formatChange(value)
      if (text === '--') return '--'
      return useRate ? `${text}%` : text
    },
    labChartData(section) {
      const metrics = section.cards.slice(0, 3).map(card => ({
        name: card.name,
        aliases: [card.name, card.key, card.code, card.englishName].filter(Boolean)
      }))
      return this.buildTrend(section.trend, metrics)
    },
    attachmentMatch(file, tab) {
      const category = this.normalizeKey(file.category || this.attachmentCategoryText(file))
      const fileName = this.normalizeKey(file.fileName || file.name)
      const rules = {
        check: ['检查报告', '检验报告', '化验单', '检查', '检验', 'report', 'lab', 'check'],
        image: ['影像资料', '影像', 'ct', 'mri', 'xray', 'dr', '超声', 'image', 'photo'],
        pathology: ['病理资料', '病理', 'pathology'],
        diet: ['饮食记录', '饮食', '餐食', 'diet', 'meal', 'food'],
        exercise: ['运动记录', '运动', '康复训练', 'exercise', 'sport', 'training'],
        other: ['其他', 'other']
      }
      const haystack = `${category}${fileName}`
      return (rules[tab] || []).some(keyword => haystack.indexOf(this.normalizeKey(keyword)) !== -1)
    },
    attachmentCategoryText(file) {
      return this.display(file.category, '其他资料')
    },
    attachmentKind(file) {
      const name = `${file.category || ''}${file.fileName || file.name || ''}`.toLowerCase()
      if (/\.(jpg|jpeg|png|gif|webp|bmp)$/.test(name) || /影像|照片|image|photo/.test(name)) return 'image'
      if (/\.(mp4|mov|avi|m4v)$|视频|录像|movie/.test(name)) return 'video'
      if (/病理|pathology/.test(name)) return 'pathology'
      if (/饮食|diet|meal|food/.test(name)) return 'diet'
      if (/运动|exercise|sport/.test(name)) return 'exercise'
      return 'document'
    },
    attachmentIcon(file) {
      const kind = this.attachmentKind(file)
      const map = { image: 'photo', video: 'play-right', pathology: 'file-text', diet: 'grid', exercise: 'heart', document: 'file-text' }
      return map[kind] || 'file-text'
    },
    attachmentColor(file) {
      const map = {
        image: '#0891b2',
        video: '#7c3aed',
        pathology: '#dc2626',
        diet: '#ea580c',
        exercise: '#16a34a',
        document: '#4f46e5'
      }
      return map[this.attachmentKind(file)] || '#4f46e5'
    },
    fileDisplayName(file) {
      return this.display(file.fileName || file.name, '未命名文件')
    },
    fileExtension(file) {
      const name = this.fileDisplayName(file)
      const matched = name.match(/\.([a-z0-9]+)$/i)
      return matched ? matched[1].toLowerCase() : ''
    },
    isImageFile(file) {
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].indexOf(this.fileExtension(file)) !== -1
    },
    formatFileSize(value) {
      const size = Number(value)
      if (!Number.isFinite(size) || size <= 0) return '未知大小'
      if (size < 1024) return `${size} B`
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
      return `${(size / 1024 / 1024).toFixed(1)} MB`
    },
    uploaderRoleText(role) {
      const map = { DOCTOR: '医生', CS: '客服', CAREGIVER: '陪诊师', PATIENT: '患者', ADMIN: '管理员' }
      return map[role] || '系统同步'
    },
    resolveFileUrl(file) {
      const raw = String(file.url || file.fileUrl || '').trim()
      if (!raw) return ''
      if (/^https?:\/\//i.test(raw)) return raw
      const baseUrl = 'http://followup.ijunyuan.cn/api/v1'
      if (raw.indexOf('/files/') === 0) return `${baseUrl}${raw}`
      if (raw.indexOf('files/') === 0) return `${baseUrl}/${raw}`
      return `${baseUrl}/files/${raw.replace(/^\/+/, '')}`
    },
    viewFile(file) {
      this.openFile(file, false)
    },
    downloadFile(file) {
      this.openFile(file, true)
    },
    openFile(file, download) {
      const url = this.resolveFileUrl(file)
      if (!url) {
        uni.showToast({ title: '暂无可预览文件', icon: 'none' })
        return
      }
      if (this.isImageFile(file)) {
        uni.previewImage({ urls: [url], current: url })
        return
      }
      uni.showLoading({ title: download ? '正在下载...' : '正在打开...' })
      uni.downloadFile({
        url,
        success: response => {
          if (response.statusCode === 200 && response.tempFilePath) {
            uni.openDocument({
              filePath: response.tempFilePath,
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
    }
  }
}
</script>

<style scoped>
page {
  background: #f6f7fb;
}

.archive-page {
  min-height: 100vh;
  padding: 24rpx 20rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: #f3f6fb;
}

.state-card {
  margin: 180rpx 32rpx;
  padding: 48rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  background: #fff;
  border: 1rpx solid #edf1f7;
  border-radius: 24rpx;
  box-shadow: 0 18rpx 44rpx rgba(15, 23, 42, 0.08);
}

.state-text {
  font-size: 27rpx;
  color: #667085;
}

.retry-btn {
  margin-top: 8rpx;
  padding: 16rpx 42rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 26rpx;
  background: #2563eb;
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.22);
}

.patient-summary {
  display: flex;
  align-items: center;
  padding: 30rpx 26rpx;
  margin-bottom: 22rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 58%, #0f766e 130%);
  box-shadow: 0 18rpx 40rpx rgba(37, 99, 235, 0.22);
  box-sizing: border-box;
}

.patient-avatar {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  color: #2563eb;
  font-size: 40rpx;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.94);
}

.patient-main {
  flex: 1;
  min-width: 0;
}

.patient-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.patient-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.patient-tag {
  padding: 3rpx 12rpx;
  border-radius: 999rpx;
  font-size: 21rpx;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.16);
}

.patient-tag.light {
  color: #fff;
}

.patient-meta {
  font-size: 24rpx;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.9);
}

.patient-meta.subtle {
  color: rgba(219, 234, 254, 0.86);
}

.section-card {
  margin-bottom: 20rpx;
  overflow: hidden;
  border: 1rpx solid #edf1f7;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.section-head {
  min-height: 102rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.section-head:active {
  background: #f8faff;
}

.section-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.section-icon.blue { background: #eaf2ff; }
.section-icon.indigo { background: #eef2ff; }
.section-icon.orange { background: #fff2e8; }
.section-icon.green { background: #eafaf0; }
.section-icon.violet { background: #f3edff; }
.section-icon.red { background: #feecec; }
.section-icon.cyan { background: #e7f9fd; }
.section-icon.teal { background: #e6f7f5; }
.section-icon.emerald { background: #e9f9f1; }
.section-icon.gray { background: #f2f4f7; }

.section-heading {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.section-title {
  font-size: 31rpx;
  line-height: 1.25;
  font-weight: 700;
  color: #101828;
}

.section-subtitle {
  font-size: 22rpx;
  line-height: 1.3;
  color: #98a2b3;
}

.head-badge {
  min-width: 38rpx;
  height: 36rpx;
  padding: 0 10rpx;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 700;
  background: #eaf2ff;
  box-sizing: border-box;
}

.head-badge.subtle {
  color: #475467;
  background: #f2f4f7;
}

.chevron {
  width: 14rpx;
  height: 14rpx;
  border-right: 4rpx solid #98a2b3;
  border-bottom: 4rpx solid #98a2b3;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(225deg);
}

.section-body {
  padding: 8rpx 24rpx 26rpx;
  box-sizing: border-box;
}

.block-title {
  margin: 18rpx 0 14rpx;
  padding-left: 14rpx;
  border-left: 6rpx solid #2563eb;
  font-size: 27rpx;
  font-weight: 700;
  color: #344054;
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14rpx 0;
}

.info-cell {
  width: 48%;
  min-height: 98rpx;
  padding: 16rpx 16rpx 14rpx;
  border: 1rpx solid #edf1f7;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #fbfdff 0%, #f6f9fe 100%);
  box-sizing: border-box;
}

.info-label {
  display: block;
  margin-bottom: 6rpx;
  font-size: 22rpx;
  color: #98a2b3;
}

.info-value {
  display: block;
  font-size: 26rpx;
  line-height: 1.4;
  font-weight: 600;
  color: #172033;
  word-break: break-all;
}

.info-value.strong {
  color: #2563eb;
  font-weight: 700;
}

.diagnosis-box {
  padding: 20rpx;
  border: 1rpx solid #dbeafe;
  border-radius: 18rpx;
  background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
}

.diagnosis-row {
  display: flex;
  align-items: flex-start;
  padding: 8rpx 0;
}

.diagnosis-row .info-label {
  width: 130rpx;
  flex-shrink: 0;
}

.diagnosis-text {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.55;
  color: #1f2937;
}

.history-list {
  overflow: hidden;
  border: 1rpx solid #edf1f7;
  border-radius: 18rpx;
  background: #fbfcfe;
}

.history-item {
  display: flex;
  padding: 18rpx 18rpx;
  border-bottom: 1rpx solid #edf1f7;
  box-sizing: border-box;
}

.history-item:last-child {
  border-bottom: none;
}

.history-label {
  width: 150rpx;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #667085;
}

.history-value {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.5;
  color: #172033;
}

.filter-scroll {
  width: 100%;
  margin-bottom: 16rpx;
  white-space: nowrap;
}

.filter-scroll.small {
  margin-top: 14rpx;
  margin-bottom: 8rpx;
}

.filter-row {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 2rpx;
}

.filter-pill {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  color: #475467;
  font-size: 24rpx;
  background: #f1f5f9;
  border: 1rpx solid transparent;
  box-sizing: border-box;
}

.filter-pill:active {
  transform: scale(0.96);
}

.filter-pill.active {
  color: #fff;
  font-weight: 700;
  background: #2563eb;
  box-shadow: 0 8rpx 18rpx rgba(37, 99, 235, 0.2);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 18rpx;
  border: 1rpx solid #e9eef6;
  border-radius: 20rpx;
  background: #f8fafc;
}

.file-icon {
  width: 74rpx;
  height: 74rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.file-icon.document,
.file-icon.pathology {
  background: #eef2ff;
}

.file-icon.image {
  background: #e7f9fd;
}

.file-icon.video {
  background: #f3edff;
}

.file-icon.diet {
  background: #fff2e8;
}

.file-icon.exercise {
  background: #eafaf0;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.file-name {
  font-size: 26rpx;
  line-height: 1.35;
  font-weight: 700;
  color: #172033;
  word-break: break-all;
}

.file-desc,
.file-uploader {
  font-size: 21rpx;
  line-height: 1.35;
  color: #98a2b3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-left: 14rpx;
  flex-shrink: 0;
}

.file-action {
  width: 62rpx;
  height: 62rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf2ff;
}

.file-action:active {
  transform: scale(0.94);
  background: #dbeafe;
}

.latest-box {
  padding: 24rpx;
  border: 1rpx solid rgba(148, 163, 184, 0.18);
  border-radius: 22rpx;
  box-sizing: border-box;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.68);
}

.orange-bg { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); }
.green-bg { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
.violet-bg { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); }
.red-bg { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }

.latest-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.latest-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #344054;
}

.latest-date {
  font-size: 22rpx;
  color: #98a2b3;
}

.latest-content {
  display: block;
  margin: 16rpx 0 20rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.72);
  font-size: 25rpx;
  line-height: 1.58;
  color: #475467;
}

.metric-mini-grid {
  display: flex;
  gap: 12rpx;
}

.metric-mini {
  flex: 1;
  min-width: 0;
  padding: 18rpx 8rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 18rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
}

.mini-value {
  display: block;
  margin-bottom: 8rpx;
  font-size: 34rpx;
  font-weight: 800;
  color: #1f2937;
}

.mini-label {
  font-size: 20rpx;
  color: #667085;
}

.blue-text { color: #2563eb; }
.green-text { color: #16a34a; }
.orange-text { color: #ea580c; }

.exercise-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin: 18rpx 0;
  padding: 14rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.7);
}

.exercise-type,
.exercise-duration {
  font-size: 26rpx;
  color: #344054;
}

.exercise-type {
  font-weight: 700;
}

.big-measure {
  display: flex;
  align-items: flex-end;
  margin: 22rpx 0 14rpx;
  padding: 18rpx 0 4rpx;
  border-top: 1rpx dashed rgba(100, 116, 139, 0.22);
}

.big-number {
  font-size: 64rpx;
  line-height: 1;
  font-weight: 800;
  color: #101828;
}

.big-unit {
  margin: 0 0 6rpx 10rpx;
  font-size: 24rpx;
  color: #667085;
}

.measure-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 12rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #667085;
  background: rgba(255, 255, 255, 0.68);
  box-sizing: border-box;
}

.measure-footer text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segmented {
  display: flex;
  padding: 6rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #e4e7ec;
  border-radius: 18rpx;
  background: #f1f5f9;
}

.segment-item {
  flex: 1;
  padding: 15rpx 0;
  text-align: center;
  border-radius: 14rpx;
  font-size: 25rpx;
  color: #667085;
}

.segment-item.active {
  color: #2563eb;
  font-weight: 700;
  background: #fff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
}

.chart-box {
  width: 100%;
  height: 300rpx;
  margin-top: 16rpx;
  padding: 12rpx 8rpx 4rpx;
  border: 1rpx solid #e9eef6;
  border-radius: 20rpx;
  background: linear-gradient(180deg, #fcfdff 0%, #f8fbff 100%);
  box-sizing: border-box;
}

.chart-box.tall {
  height: 360rpx;
}

.empty-box {
  margin-top: 14rpx;
  padding: 40rpx 20rpx;
  border: 1rpx dashed #d8dee9;
  border-radius: 18rpx;
  text-align: center;
  font-size: 24rpx;
  color: #98a2b3;
  background: #fbfcfe;
}

.empty-box.compact {
  padding: 28rpx 20rpx;
}

.lab-card-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 14rpx 0;
}

.lab-card {
  width: 48%;
  min-height: 168rpx;
  padding: 20rpx 18rpx;
  border: 1rpx solid #e6ebf3;
  border-radius: 20rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fcfdff 0%, #f7f9fc 100%);
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.035);
}

.lab-card.warning {
  border-color: #fecdca;
  background: linear-gradient(180deg, #fffbfa 0%, #fef3f2 100%);
}

.lab-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.lab-name {
  min-width: 0;
  font-size: 23rpx;
  color: #475467;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lab-status {
  flex-shrink: 0;
  padding: 2rpx 9rpx;
  border-radius: 999rpx;
  font-size: 19rpx;
  color: #027a48;
  background: #ecfdf3;
}

.lab-card.warning .lab-status {
  color: #b42318;
  background: #fef3f2;
}

.lab-value-row {
  margin: 12rpx 0 8rpx;
  display: flex;
  align-items: baseline;
}

.lab-value {
  font-size: 40rpx;
  font-weight: 800;
  color: #101828;
}

.lab-unit {
  margin-left: 6rpx;
  font-size: 20rpx;
  color: #667085;
}

.lab-range,
.lab-change {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  line-height: 1.35;
  color: #98a2b3;
}

.expand-more {
  margin-top: 4rpx;
  padding: 20rpx 0 6rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #2563eb;
}

.readonly-note {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin-bottom: 14rpx;
  padding: 18rpx;
  border: 1rpx solid #bfdbfe;
  border-radius: 18rpx;
  font-size: 23rpx;
  line-height: 1.45;
  color: #1d4ed8;
  background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
}
</style>
