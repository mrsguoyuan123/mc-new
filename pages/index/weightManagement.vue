<template>
  <view class="rehab-page">
    <view class="debug-tool" :class="{ collapsed: toolbarCollapsed }">
      <view class="tool-head" @click="toggleToolbar">
        <view class="tool-title">
          <view class="tool-shield"><u-icon name="checkmark-circle" color="#ffffff" size="13"></u-icon></view>
          <text class="tool-title-text">状态快速验证</text>
        </view>
        <view class="tool-action">
          <text>{{ toolbarCollapsed ? '展开工具条' : '收起工具条' }}</text>
          <u-icon :name="toolbarCollapsed ? 'arrow-down' : 'arrow-up'" color="#aebedb" size="13"></u-icon>
        </view>
      </view>
      <scroll-view v-show="!toolbarCollapsed" class="tool-scroll" scroll-x>
        <view class="tool-chips">
          <view
            v-for="item in scenarios"
            :key="item.key"
            class="tool-chip"
            :class="{ active: activeScenario === item.key }"
            @click.stop="applyScenario(item.key)"
          >{{ item.name }}</view>
        </view>
      </scroll-view>
    </view>

    <scroll-view class="category-tabs" :class="{ collapsed: toolbarCollapsed }" scroll-x>
      <view class="category-track">
        <view
          v-for="tab in categoryTabs"
          :key="tab.key"
          class="category-tab"
          :class="{ active: tab.key === 'sport' }"
          @click="changeCategory(tab)"
        >{{ tab.name }}</view>
      </view>
    </scroll-view>

    <view v-if="toast.visible" class="top-toast" :class="toast.type">
      <view class="toast-icon"><u-icon :name="toast.icon" color="#ffffff" size="15"></u-icon></view>
      <text class="toast-text">{{ toast.text }}</text>
    </view>

    <view class="page-body" :class="{ 'tool-mini': toolbarCollapsed }">
      <view class="section-heading">
        <view class="heading-left">
          <view class="heading-bar"></view>
          <text class="heading-title">健康管理团队为你制定</text>
        </view>
        <view class="date-pill">今日方案 · 10月21日</view>
      </view>

      <view class="card plan-card">
        <template v-if="hasPlan">
          <view class="plan-top">
            <view>
              <view class="plan-title-row">
                <text class="card-title">今日运动方案</text>
                <text class="today-badge">今日方案</text>
              </view>
              <text class="card-subtitle">健康管理团队制定</text>
            </view>
            <view class="summary-pill">共 {{ exercises.length }} 项 · 约 {{ totalMinutes }} 分钟</view>
          </view>
          <view class="progress-box">
            <view class="progress-label">
              <view class="progress-dot"></view>
              <text>今日完成进度：已完成 {{ completedCount }} / {{ exercises.length }}</text>
            </view>
            <view class="progress-track">
              <view class="progress-inner" :style="{ width: progressPercent + '%' }"></view>
            </view>
          </view>
          <view class="exercise-list">
            <view
              v-for="item in exercises"
              :key="item.id"
              class="exercise-item"
              :class="{ active: currentActionId === item.id, completed: item.status === 'completed' }"
              @click="selectAction(item)"
            >
              <view class="item-index" :class="statusTheme(item.status)">{{ item.order }}</view>
              <view class="item-info">
                <text class="item-name">{{ item.name }}</text>
                <text class="item-dose">剂量：{{ item.dose }}</text>
              </view>
              <view class="item-right">
                <text class="status-tag" :class="statusTheme(item.status)">{{ statusText(item.status, true) }}</text>
                <u-icon name="arrow-right" color="#9aa7ba" size="14"></u-icon>
              </view>
            </view>
          </view>
          <view
            class="primary-btn start-btn"
            :class="{ disabled: completedCount === exercises.length }"
            @click="startTraining"
          >
            <u-icon name="play-right" color="#ffffff" size="16"></u-icon>
            <text>{{ completedCount === exercises.length ? '今日运动已完成' : '开始今日运动' }}</text>
          </view>
        </template>
        <template v-else>
          <view class="empty-plan">
            <view class="empty-icon"><u-icon name="calendar" color="#1677ff" size="30"></u-icon></view>
            <text class="empty-title">今日暂无运动方案</text>
            <text class="empty-desc">健康管理团队将根据术后恢复情况，通过后台为你配置当天训练内容。</text>
            <view class="primary-btn disabled empty-btn">
              <u-icon name="clock" color="#ffffff" size="16"></u-icon><text>等待团队配置</text>
            </view>
          </view>
        </template>
      </view>

      <view v-if="hasPlan" class="card media-card">
        <view class="card-head">
          <text class="card-title">动作说明</text>
          <view class="small-tabs">
            <view :class="{ active: mediaTab === 'video' }" @click="mediaTab = 'video'">视频</view>
            <view :class="{ active: mediaTab === 'guide' }" @click="mediaTab = 'guide'">图解</view>
          </view>
        </view>
        <view v-if="mediaTab === 'video' && currentAction" class="video-wrap" :class="'cover-' + currentAction.cover" @click="playVideo">
          <view class="video-cover-bg"></view>
          <view class="cover-grid"></view>
          <view class="cover-orbit orbit-one"></view>
          <view class="cover-orbit orbit-two"></view>
          <view class="cover-icon">
            <u-icon :name="currentAction.icon" color="#ffffff" size="46"></u-icon>
          </view>
          <view class="cover-pulse">
            <view class="pulse-bar bar-one"></view>
            <view class="pulse-bar bar-two"></view>
            <view class="pulse-bar bar-three"></view>
          </view>
          <view class="video-label">术后规范标准动作</view>
          <view class="play-circle"><u-icon name="play-right-fill" color="#1677ff" size="25"></u-icon></view>
          <view class="zoom-icon"><u-icon name="scan" color="#ffffff" size="15"></u-icon></view>
        </view>
        <view v-else-if="mediaTab === 'video'" class="video-wrap video-empty">
          <u-icon name="photo" color="#b8c2d5" size="34"></u-icon><text>暂无动作视频</text>
        </view>
        <view v-else class="diagram-panel">
          <view v-for="(step, index) in diagramSteps" :key="index" class="diagram-step">
            <view class="diagram-no">{{ index + 1 }}</view>
            <view class="diagram-content">
              <text class="diagram-title">{{ step.title }}</text>
              <text class="diagram-desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
        <view class="media-name-row">
          <text class="media-name">{{ currentAction ? currentAction.name : '暂无动作' }}</text>
          <view class="link-text" @click="playVideo">
            <text>查看完整动作</text><u-icon name="arrow-right" color="#1677ff" size="13"></u-icon>
          </view>
        </view>
        <text class="media-desc">{{ currentAction ? currentAction.description : '等待健康管理团队配置训练动作。' }}</text>
        <view class="media-footer">
          <text class="config-text">本动作由健康管理团队配置</text>
          <view class="guide-btn" @click="openClinicalGuide">临床康复指引</view>
        </view>
      </view>

      <view v-if="hasPlan" class="card record-card">
        <view class="card-head align-start">
          <view>
            <text class="card-title">训练记录</text>
            <text class="card-subtitle">按照健康管理团队设置的剂量完成</text>
          </view>
          <view class="small-tabs">
            <view :class="{ active: mode === 'count' }" @click="switchMode('count')">计数模式</view>
            <view :class="{ active: mode === 'time' }" @click="switchMode('time')">计时模式</view>
          </view>
        </view>
        <template v-if="currentAction">
          <view class="current-row">
            <text class="current-label">当前训练动作</text>
            <text class="current-name">{{ currentAction.name }}</text>
          </view>
          <view class="record-content">
            <text class="group-progress">组数进度：第 {{ currentGroup }} 组 / 共 {{ currentAction.sets }} 组</text>
            <view class="group-dots">
              <view
                v-for="dot in groupDots"
                :key="dot.index"
                class="group-dot"
                :class="{ finished: dot.finished, active: dot.index === currentGroup }"
              ></view>
            </view>
            <view class="big-number-box">
              <template v-if="mode === 'count'">
                <text class="big-number">{{ currentAction.reps || 10 }}</text><text class="big-unit">次</text>
              </template>
              <template v-else>
                <text class="big-number time-number">{{ formattedTime }}</text>
              </template>
              <text class="number-tip">{{ mode === 'count' ? '每组标准动作次数' : timerStatusText }}</text>
            </view>
            <view
              v-if="showGroupButton"
              class="primary-btn record-main"
              :class="{ disabled: !canOperate || (mode === 'count' && countPaused) }"
              @click="completeGroup"
            ><text>完成这一组</text></view>
            <view class="control-row" :class="{ three: mode === 'time' }">
              <view class="light-btn" :class="{ disabled: !canOperate }" @click="togglePause">
                <u-icon :name="pauseIconName" size="14" color="#d18a00"></u-icon><text>{{ pauseButtonText }}</text>
              </view>
              <view class="light-btn" :class="{ disabled: !canOperate }" @click="resetTraining">
                <u-icon name="reload" size="14" color="#61708a"></u-icon><text>重置</text>
              </view>
              <view
                v-if="mode === 'time'"
                class="small-primary"
                :class="{ disabled: !canOperate }"
                @click="completeCurrentAction"
              ><text>完成本项运动</text></view>
            </view>
            <view
              v-if="mode === 'count'"
              class="primary-btn finish-btn"
              :class="{ disabled: !canOperate }"
              @click="completeCurrentAction"
            ><text>完成本项运动</text></view>
            <view class="danger-tip" @click="stopBecauseUnwell">感觉不适，停止训练</view>
          </view>
        </template>
        <view v-else class="record-empty">
          <u-icon name="info-circle" color="#9aa7ba" size="23"></u-icon><text>今日暂无可记录的训练动作</text>
        </view>
      </view>

      <view v-if="hasPlan" class="card finish-card">
        <view class="card-head align-start">
          <view>
            <text class="card-title">{{ completionTitle }}</text>
            <text class="card-subtitle">完成后请填写训练后评估</text>
          </view>
          <view class="progress-pill">已完成 {{ completedCount }} / {{ exercises.length }} 项</view>
        </view>
        <template v-if="currentAction">
          <view class="status-rows">
            <view class="status-row">
              <text class="current-label">当前动作</text><text class="row-value">{{ currentAction.name }}</text>
            </view>
            <view class="status-row">
              <text class="current-label">动作状态</text>
              <text class="status-tag large" :class="statusTheme(currentAction.status)">{{ statusText(currentAction.status, false) }}</text>
            </view>
          </view>
          <view v-if="currentAction.status === 'completed'" class="archive-strip">
            <u-icon name="checkmark-circle-fill" color="#1677ff" size="17"></u-icon>
            <text>该动作训练已达成，训练后评估已归档</text>
          </view>
          <view v-if="currentAction.status === 'paused'" class="warning-box">
            <view class="warning-title">
              <u-icon name="error-circle-fill" color="#d77b00" size="18"></u-icon>
              <text>建议暂停训练，并联系健康管理团队确认</text>
            </view>
            <text class="warning-desc">触发指标：{{ abnormalReasons }}。评估结果不显示医学诊断结论，由医护团队跟进。</text>
            <view class="orange-btn" @click="contactTeam">
              <u-icon name="phone" color="#ffffff" size="16"></u-icon><text>联系健康管理团队</text>
            </view>
          </view>
          <view
            v-if="currentAction.status !== 'completed'"
            class="primary-btn assessment-entry"
            @click="openEvaluation"
          >
            <u-icon name="edit-pen" color="#ffffff" size="16"></u-icon><text>填写训练后评估</text>
          </view>
        </template>
        <view v-else class="record-empty finish-empty"><text>暂无完成项需要处理</text></view>
      </view>

      <view v-if="hasPlan" id="assessmentCard" class="card assessment-card">
        <view class="card-head align-start">
          <view>
            <view class="assessment-title-row">
              <text class="card-title">训练后评估</text>
              <text class="backend-badge">由后台配置</text>
            </view>
            <text class="card-subtitle">记录今天的感受，帮助健康管理团队了解恢复情况</text>
          </view>
          <view class="collapse-btn" @click="assessmentExpanded = !assessmentExpanded">
            <text>{{ assessmentExpanded ? '收起' : '展开' }}</text>
            <u-icon :name="assessmentExpanded ? 'arrow-up' : 'arrow-down'" color="#61708a" size="14"></u-icon>
          </view>
        </view>

        <view v-show="assessmentExpanded">
          <view class="engine-tip">
            <u-icon name="info-circle" color="#1677ff" size="16"></u-icon>
            <text>配置引擎：支持单选、多选、滑杆、输入、是否、备注；支持 1-8 项动态增删排序、设置必填及异常阈值。</text>
          </view>

          <view class="form-block">
            <view class="form-title">
              <text class="form-no">1.</text>
              <text class="form-label">现在的疼痛程度</text>
              <text class="required">必填</text>
            </view>
            <text class="form-desc">请拖动滑块选择你此刻感受到的疼痛等级（0-10）</text>
            <view class="scale-row">
              <text>无疼痛</text>
              <text class="score-bubble">{{ form.pain }} 分</text>
              <text class="danger-text">剧烈疼痛</text>
            </view>
            <slider
              class="pain-slider"
              :value="form.pain"
              :min="0"
              :max="10"
              :step="1"
              activeColor="#1677ff"
              backgroundColor="#d9deea"
              block-size="24"
              @changing="onPainChanging"
              @change="onPainChange"
            />
            <view class="threshold-row"><text>异常预警阈值：≥ 6 分</text></view>
          </view>

          <view class="form-block">
            <view class="form-title">
              <text class="form-no">2.</text>
              <text class="form-label">患处肿胀情况</text>
              <text class="required">必填</text>
            </view>
            <text class="form-desc">观察手术部位周围皮肤及组织是否出现发胀发红</text>
            <view class="option-row">
              <view
                v-for="item in swellingOptions"
                :key="item"
                class="option-btn"
                :class="{ active: form.swelling === item }"
                @click="chooseOption('swelling', item)"
              >{{ item }}</view>
            </view>
          </view>

          <view class="form-block">
            <view class="form-title">
              <text class="form-no">3.</text>
              <text class="form-label">训练后的疲劳程度</text>
              <text class="required">必填</text>
            </view>
            <text class="form-desc">身体整体精力与呼吸耐受程度</text>
            <view class="option-row">
              <view
                v-for="item in fatigueOptions"
                :key="item"
                class="option-btn"
                :class="{ active: form.fatigue === item }"
                @click="chooseOption('fatigue', item)"
              >{{ item }}</view>
            </view>
          </view>

          <view class="form-block">
            <view class="form-title">
              <text class="form-no">4.</text>
              <text class="form-label">其他不适情况</text>
              <text class="custom-badge">自定义示例</text>
            </view>
            <text class="form-desc">后台可自主增删此项，如头晕、心慌、关节弹响等</text>
            <view class="option-row">
              <view
                v-for="item in discomfortOptions"
                :key="item"
                class="option-btn"
                :class="{ active: form.discomfort === item }"
                @click="chooseOption('discomfort', item)"
              >{{ item }}</view>
            </view>
          </view>

          <view class="textarea-block">
            <text class="textarea-label">还有什么想告诉健康管理团队？（选填）</text>
            <textarea
              v-model="form.note"
              class="note-input"
              maxlength="200"
              placeholder="记录训练后的感受、疑问或希望医护确认的内容"
              placeholder-class="note-placeholder"
            />
          </view>

          <view v-if="hasAbnormal" class="inline-warning">
            <view class="warning-title">
              <u-icon name="error-circle-fill" color="#d77b00" size="18"></u-icon>
              <text>建议暂停训练，并联系健康管理团队确认</text>
            </view>
            <text class="warning-desc">触发指标：{{ abnormalReasons }}。评估结果不显示医学诊断结论，由医护团队跟进。</text>
            <view class="orange-btn" @click="contactTeam">
              <u-icon name="phone" color="#ffffff" size="16"></u-icon><text>联系健康管理团队</text>
            </view>
          </view>

          <view class="assessment-actions">
            <view class="ghost-btn" @click="saveDraft">稍后填写 / 返回今日方案</view>
            <view class="primary-btn save-btn" @click="saveEvaluation"><text>保存评估</text></view>
          </view>
        </view>
      </view>

      <view class="card week-card">
        <view class="card-head">
          <text class="card-title">本周完成率</text>
          <view class="week-pill">本周</view>
        </view>
        <view class="week-summary">
          <view class="ring" :style="{ background: ringBackground }">
            <view class="ring-inner">
              <text class="ring-percent">{{ weekPercent }}%</text>
            </view>
          </view>
          <view class="week-text">
            <text class="week-count">完成 {{ week.done }} / {{ week.target }} 次</text>
            <text class="week-compare">较上周 +{{ week.compare }} 次</text>
          </view>
          <view class="trend-line">
            <view class="trend-dot dot-a"></view>
            <view class="trend-dot dot-b"></view>
            <view class="trend-dot dot-c"></view>
          </view>
        </view>
        <view class="week-calendar">
          <view v-for="day in week.days" :key="day.date" class="day-col" :class="{ today: day.isToday }">
            <text class="day-name">{{ day.name }}</text>
            <view class="day-dot" :class="day.status">
              <u-icon v-if="day.status === 'done'" name="checkmark" color="#ffffff" size="11"></u-icon>
            </view>
            <text class="day-date">{{ day.date }}</text>
          </view>
        </view>
        <view class="week-footer">
          <text>不设排名与打卡刺激，遵循术后生理节律</text>
          <view class="link-text" @click="showToast('本周康复节律已归档，可在健康档案查看详情。', 'info')">
            <text>查看详情</text><u-icon name="arrow-right" color="#1677ff" size="13"></u-icon>
          </view>
        </view>
      </view>

      <view class="sync-btn" @click="syncAdvisor">
        <text class="send-symbol">➤</text>
        <text>同步运动记录至我的私人健康顾问</text>
      </view>

      <text class="disclaimer">本测评与训练计划仅为健康筛查及术后康复参考，不构成医疗诊断。模板内容，最终以健康管理团队后台配置为准。</text>
    </view>

    <view v-if="warningVisible" class="modal-mask" @click="warningVisible = false">
      <view class="warning-modal" @click.stop>
        <view class="modal-icon">
          <u-icon name="error-circle-fill" color="#f08a00" size="38"></u-icon>
        </view>
        <text class="modal-title">评估异常提醒</text>
        <text class="modal-desc">建议暂停训练，并联系健康管理团队确认。</text>
        <text class="modal-meta">触发指标：{{ abnormalReasons }}</text>
        <view class="modal-actions">
          <view class="ghost-btn modal-button" @click="warningVisible = false">先返回</view>
          <view class="orange-btn modal-button" @click="contactTeam">
            <u-icon name="phone" color="#ffffff" size="16"></u-icon><text>联系健康管理团队</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-tabbar">
      <view v-for="tab in tabList" :key="tab.key" class="tab-item" @click="changeTab(tab)">
        <view class="tab-badge-wrap">
          <u-icon :name="activeTab === tab.key ? tab.activeIcon : tab.icon" :color="activeTab === tab.key ? '#1677ff' : '#aeb6c4'" size="23"></u-icon>
          <text v-if="tab.badge" class="tab-badge">{{ tab.badge }}</text>
        </view>
        <text :class="{ active: activeTab === tab.key }">{{ tab.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>

function createWalk(overrides) {
  return Object.assign({
    id: 'walk',
    order: '01',
    name: '床边步行（示例）',
    shortName: '床边步行',
    mode: 'time',
    reps: 0,
    sets: 1,
    durationMinutes: 5,
    durationSeconds: 300,
    remainingSeconds: 0,
    dose: '5分钟',
    status: 'completed',
    completedAt: '20:04',
    icon: 'account',
    cover: 'walk',
    description: '动作缓慢，保持自然呼吸，以不引起明显不适为前提。双脚踩实地面，目光向前看。'
  }, overrides || {})
}

function createBreath(overrides) {
  return Object.assign({
    id: 'breath',
    order: '02',
    name: '呼吸放松（示例）',
    shortName: '呼吸放松',
    mode: 'count',
    reps: 10,
    sets: 2,
    durationMinutes: 4,
    durationSeconds: 0,
    remainingSeconds: 0,
    dose: '10次 × 2组',
    status: 'pendingEvaluation',
    completedAt: '',
    icon: 'heart',
    cover: 'breath',
    description: '双肩自然下沉，鼻吸口呼，腹部微隆起。深长平缓，配合胸腹温和起伏舒缓身心。'
  }, overrides || {})
}

function createRehab(overrides) {
  return Object.assign({
    id: 'rehab',
    order: '03',
    name: '康复动作 03（后台配置）',
    shortName: '康复动作 03',
    mode: 'time',
    reps: 10,
    sets: 2,
    durationMinutes: 2,
    durationSeconds: 60,
    remainingSeconds: 60,
    dose: '60秒 × 2组',
    status: 'pending',
    completedAt: '',
    icon: 'checkmark-circle',
    cover: 'rehab',
    description: '按后台配置的角度与节奏完成，动作幅度以轻微牵拉为宜，如出现疼痛加重应立即停止。'
  }, overrides || {})
}

function createDefaultActions() {
  return [createWalk(), createBreath(), createRehab()]
}

function createForm() {
  return {
    pain: 2,
    swelling: '轻微',
    fatigue: '一般',
    discomfort: '无',
    note: ''
  }
}

function createEmptyWeek() {
  var week = createWeek()
  week.done = 0
  week.compare = 0
  week.todayLogged = false
  week.days.forEach(function(day) {
    if (day.status === 'done') {
      day.status = 'pending'
    }
  })
  return week
}

function createWeek() {
  return {
    done: 5,
    target: 6,
    compare: 1,
    todayLogged: false,
    days: [
      { name: '周一', date: '10-16', status: 'done', isToday: false },
      { name: '周二', date: '10-17', status: 'done', isToday: false },
      { name: '周三', date: '10-18', status: 'done', isToday: false },
      { name: '周四', date: '10-19', status: 'done', isToday: false },
      { name: '周五', date: '10-20', status: 'done', isToday: false },
      { name: '周六', date: '10-21', status: 'pending', isToday: true },
      { name: '周日', date: '10-22', status: 'rest', isToday: false }
    ]
  }
}

export default {
  data() {
    return {
      toolbarCollapsed: false,
      activeScenario: 'default',
      categoryTabs: [
        { key: 'diet', name: '饮食分析' },
        { key: 'sport', name: '运动管理' },
        { key: 'weight', name: '体重动态' },
        { key: 'pressure', name: '血压血糖' },
        { key: 'medicine', name: '用药提醒' }
      ],
      scenarios: [
        { key: 'default', name: '默认流程' },
        { key: 'noPlan', name: '状态1：无运动方案' },
        { key: 'allDone', name: '状态2：今日已完成' },
        { key: 'pendingEvaluation', name: '状态3：评估未完成' },
        { key: 'abnormal', name: '状态4：异常评估' }
      ],
      hasPlan: true,
      exercises: createDefaultActions(),
      currentActionId: 'breath',
      currentGroup: 2,
      mode: 'count',
      countPaused: false,
      running: false,
      remainingSeconds: 0,
      timer: null,
      mediaTab: 'video',
      assessmentExpanded: true,
      warningVisible: false,
      activeTab: 'health',
      form: createForm(),
      swellingOptions: ['无', '轻微', '明显'],
      fatigueOptions: ['轻松', '一般', '很累'],
      discomfortOptions: ['无', '有，想告诉医护'],
      diagramSteps: [
        { title: '准备姿势', desc: '坐稳或站稳，双肩放松，保持自然呼吸，确认周围环境安全。' },
        { title: '按剂量完成', desc: '跟随组数与次数节奏训练，计时动作以温和持续为主。' },
        { title: '结束观察', desc: '训练后静息片刻，记录疼痛、肿胀、疲劳及其他不适情况。' }
      ],
      week: createWeek(),
      toast: {
        visible: false,
        text: '已暂存，您可以稍后返回今日方案继续填写',
        type: 'info',
        icon: 'info-circle'
      },
      toastTimer: null,
      tabList: [
        { key: 'home', name: '首页', icon: 'home', activeIcon: 'home-fill', badge: '' },
        { key: 'health', name: '健康', icon: 'heart', activeIcon: 'heart-fill', badge: '' },
        { key: 'message', name: '消息', icon: 'chat', activeIcon: 'chat-fill', badge: '3' },
        { key: 'mine', name: '我的', icon: 'account', activeIcon: 'account-fill', badge: '' }
      ]
    }
  },
  computed: {
    currentAction: function() {
      for (var i = 0; i < this.exercises.length; i += 1) {
        if (this.exercises[i].id === this.currentActionId) {
          return this.exercises[i]
        }
      }
      return null
    },
    completedCount: function() {
      return this.exercises.filter(function(item) {
        return item.status === 'completed'
      }).length
    },
    progressPercent: function() {
      if (!this.exercises.length) {
        return 0
      }
      return Math.round(this.completedCount / this.exercises.length * 100)
    },
    totalMinutes: function() {
      return this.exercises.reduce(function(total, item) {
        return total + item.durationMinutes
      }, 0)
    },
    groupDots: function() {
      var list = []
      if (!this.currentAction) {
        return list
      }
      for (var i = 1; i <= this.currentAction.sets; i += 1) {
        list.push({
          index: i,
          finished: i < this.currentGroup || this.currentAction.status === 'completed'
        })
      }
      return list
    },
    canOperate: function() {
      return !!this.currentAction &&
        this.currentAction.status !== 'completed' &&
        this.currentAction.status !== 'pendingEvaluation' &&
        this.currentAction.status !== 'paused'
    },
    showGroupButton: function() {
      if (!this.currentAction || !this.canOperate) {
        return false
      }
      return this.currentAction.sets > 1 && this.currentGroup < this.currentAction.sets
    },
    formattedTime: function() {
      var seconds = Math.max(0, this.remainingSeconds)
      var minutes = Math.min(99, Math.floor(seconds / 60))
      var rest = seconds % 60
      return String(minutes).padStart(2, '0') + ':' + String(rest).padStart(2, '0')
    },
    timerStatusText: function() {
      if (!this.currentAction) {
        return '暂无训练动作'
      }
      if (this.currentAction.status === 'paused') {
        return '训练已暂停'
      }
      if (this.currentAction.status === 'completed') {
        return '本项训练已完成'
      }
      if (this.running) {
        return '正在平缓计时中...'
      }
      return this.mode === 'time' ? '点击开始进行平缓计时' : '计数训练准备中'
    },
    pauseButtonText: function() {
      if (this.mode === 'count') {
        return this.countPaused ? '继续' : '暂停'
      }
      return this.running ? '暂停' : '开始'
    },
    pauseIconName: function() {
      if (this.mode === 'count') {
        return this.countPaused ? 'play-right' : 'pause'
      }
      return this.running ? 'pause' : 'play-right'
    },
    hasAbnormal: function() {
      return Number(this.form.pain) >= 6 ||
        this.form.swelling === '明显' ||
        this.form.fatigue === '很累' ||
        this.form.discomfort === '有，想告诉医护'
    },
    abnormalReasons: function() {
      var reasons = []
      if (Number(this.form.pain) >= 6) reasons.push('疼痛程度≥6分')
      if (this.form.swelling === '明显') reasons.push('患处明显肿胀')
      if (this.form.fatigue === '很累') reasons.push('训练后很累')
      if (this.form.discomfort === '有，想告诉医护') reasons.push('其他不适情况选择“有，想告诉医护”')
      return reasons.length ? reasons.join('、') : '暂无异常指标'
    },
    completionTitle: function() {
      return this.currentAction && this.currentAction.status === 'completed' ? '本项运动已完成' : '完成本项运动'
    },
    weekPercent: function() {
      return this.week.target ? Math.round(this.week.done / this.week.target * 100) : 0
    },
    ringBackground: function() {
      var deg = this.weekPercent * 3.6
      return 'conic-gradient(#1677ff 0deg, #1677ff ' + deg + 'deg, #dce5f4 ' + deg + 'deg, #dce5f4 360deg)'
    }
  },
  beforeDestroy: function() {
    this.clearTimer()
    clearTimeout(this.toastTimer)
  },
  methods: {
    toggleToolbar: function() {
      this.toolbarCollapsed = !this.toolbarCollapsed
    },
    showToast: function(text, type) {
      var self = this
      var icon = 'info-circle'
      if (type === 'success') {
        icon = 'checkmark-circle-fill'
      } else if (type === 'warning' || type === 'danger') {
        icon = 'error-circle-fill'
      }
      this.toast = {
        visible: true,
        text: text,
        type: type || 'info',
        icon: icon
      }
      clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(function() {
        self.toast.visible = false
      }, 2800)
    },
    statusText: function(status, short) {
      if (status === 'completed') return '已完成'
      if (status === 'pendingEvaluation') return short ? '待评估' : '待填写评估'
      if (status === 'inProgress') return '进行中'
      if (status === 'paused') return '因身体不适已暂停'
      return '待完成'
    },
    statusTheme: function(status) {
      if (status === 'completed') return 'done'
      if (status === 'pendingEvaluation') return 'evaluate'
      if (status === 'inProgress') return 'progress'
      if (status === 'paused') return 'paused'
      return 'pending'
    },
    selectAction: function(item) {
      if (!this.hasPlan) return
      this.currentActionId = item.id
      this.mode = item.mode
      if (item.status === 'pending' || item.status === 'inProgress') {
        this.currentGroup = 1
      } else {
        this.currentGroup = item.sets
      }
      if (item.mode === 'time') {
        if (item.status === 'pending' || item.status === 'inProgress') {
          item.remainingSeconds = item.durationSeconds
        } else if (item.status === 'completed') {
          item.remainingSeconds = 0
        }
      }
      this.remainingSeconds = item.mode === 'time' ? item.remainingSeconds || 0 : 0
      this.running = false
      this.countPaused = false
      this.clearTimer()
      this.form = createForm()
      this.warningVisible = false
      this.assessmentExpanded = item.status === 'pendingEvaluation' || item.status === 'paused'
    },
    findFirst: function(statusList) {
      for (var i = 0; i < this.exercises.length; i += 1) {
        if (statusList.indexOf(this.exercises[i].status) !== -1) {
          return this.exercises[i]
        }
      }
      return null
    },
    startTraining: function() {
      if (!this.hasPlan) {
        this.showToast('今日暂无运动方案，等待健康管理团队后台配置。', 'info')
        return
      }
      if (this.completedCount === this.exercises.length) {
        this.showToast('今日运动已全部完成，请遵循术后节律休息。', 'success')
        return
      }
      var pausedAction = this.findFirst(['paused'])
      if (pausedAction) {
        this.selectAction(pausedAction)
        this.warningVisible = true
        this.assessmentExpanded = true
        this.showToast('评估异常，训练已暂停，请先联系健康管理团队。', 'warning')
        return
      }
      var pendingEvaluation = this.findFirst(['pendingEvaluation'])
      if (pendingEvaluation) {
        this.selectAction(pendingEvaluation)
        this.openEvaluation()
        this.showToast('请先完成上一项运动的训练后评估。', 'warning')
        return
      }
      var target = this.findFirst(['inProgress', 'pending'])
      if (!target) {
        this.showToast('存在待填写评估，请先完成训练后评估。', 'warning')
        return
      }
      this.selectAction(target)
      target.status = 'inProgress'
      if (target.mode === 'time') {
        if (target.remainingSeconds <= 0) {
          target.remainingSeconds = target.durationSeconds
          this.remainingSeconds = target.remainingSeconds
        }
        this.startTimer()
      } else {
        this.countPaused = false
      }
      this.showToast('训练已开始，请按动作说明平缓完成。', 'info')
    },
    switchMode: function(nextMode) {
      if (!this.currentAction) return
      if (this.mode === nextMode) return
      if (!this.canOperate) {
        this.showToast('当前动作已结项或已暂停，模式仅供查看。', 'info')
        this.mode = nextMode
        if (nextMode === 'time') {
          this.remainingSeconds = this.currentAction.remainingSeconds || this.currentAction.durationSeconds || 120
        }
        return
      }
      this.mode = nextMode
      if (nextMode === 'time') {
        this.countPaused = false
        this.remainingSeconds = this.currentAction.durationSeconds || 120
        this.currentAction.remainingSeconds = this.remainingSeconds
        this.startTimer()
      } else {
        this.pauseTimer()
        this.remainingSeconds = 0
      }
    },
    startTimer: function() {
      var self = this
      if (this.mode !== 'time' || this.remainingSeconds <= 0) {
        this.running = false
        return
      }
      this.clearTimer()
      this.running = true
      this.timer = setInterval(function() {
        self.remainingSeconds = Math.max(0, self.remainingSeconds - 1)
        if (self.currentAction) {
          self.currentAction.remainingSeconds = self.remainingSeconds
        }
        if (self.remainingSeconds <= 0) {
          self.pauseTimer()
          if (self.currentAction && self.currentGroup < self.currentAction.sets) {
            self.currentGroup += 1
            self.remainingSeconds = self.currentAction.durationSeconds
            self.currentAction.remainingSeconds = self.remainingSeconds
            self.startTimer()
            self.showToast('第 ' + self.currentGroup + ' 组倒计时结束，请继续下一组。', 'success')
          } else if (self.currentAction) {
            self.markPendingEvaluation()
          }
        }
      }, 1000)
    },
    pauseTimer: function() {
      this.running = false
      this.clearTimer()
    },
    clearTimer: function() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    togglePause: function() {
      if (!this.canOperate) {
        this.showToast('当前状态不可调整训练计时。', 'warning')
        return
      }
      if (this.mode === 'time') {
        if (this.running) {
          this.pauseTimer()
          this.showToast('训练计时已暂停。', 'info')
        } else {
          this.startTimer()
          this.showToast('训练计时继续。', 'info')
        }
      } else {
        this.countPaused = !this.countPaused
        this.showToast(this.countPaused ? '计数训练已暂停。' : '计数训练继续。', 'info')
      }
    },
    resetTraining: function() {
      if (!this.canOperate) {
        this.showToast('当前状态不可重置。', 'warning')
        return
      }
      var duration = this.currentAction.durationSeconds || 120
      this.remainingSeconds = duration
      this.currentGroup = 1
      this.countPaused = false
      this.currentAction.remainingSeconds = duration
      this.pauseTimer()
      this.showToast('本组训练记录已重置。', 'info')
    },
    completeGroup: function() {
      if (!this.canOperate) {
        this.showToast('请先恢复训练后再完成本组。', 'warning')
        return
      }
      if (this.mode === 'count' && this.countPaused) {
        this.showToast('训练已暂停，请点击继续后再完成本组。', 'warning')
        return
      }
      if (this.currentGroup < this.currentAction.sets) {
        this.currentGroup += 1
        if (this.mode === 'time') {
          this.remainingSeconds = this.currentAction.durationSeconds
          this.currentAction.remainingSeconds = this.remainingSeconds
          this.startTimer()
        }
        this.showToast('第 ' + (this.currentGroup - 1) + ' 组已完成，请继续下一组。', 'success')
      } else {
        this.markPendingEvaluation()
      }
    },
    markPendingEvaluation: function() {
      if (!this.currentAction) return
      this.pauseTimer()
      this.currentAction.status = 'pendingEvaluation'
      this.currentGroup = this.currentAction.sets
      if (this.currentAction.mode === 'time') {
        this.currentAction.remainingSeconds = 0
        this.remainingSeconds = 0
      }
      this.assessmentExpanded = true
      this.showToast('本项运动已完成训练，请填写训练后评估。', 'info')
      this.$nextTick(function() {
        uni.pageScrollTo({
          selector: '#assessmentCard',
          duration: 260
        })
      })
    },
    completeCurrentAction: function() {
      if (!this.canOperate) {
        this.showToast('当前动作无需再次完成。', 'warning')
        return
      }
      this.markPendingEvaluation()
    },
    stopBecauseUnwell: function() {
      if (!this.currentAction) return
      this.pauseTimer()
      this.countPaused = true
      this.currentAction.status = 'paused'
      this.form.discomfort = '有，想告诉医护'
      this.warningVisible = true
      this.assessmentExpanded = true
      this.showToast('已记录身体不适，训练已暂停。', 'warning')
    },
    openEvaluation: function() {
      this.assessmentExpanded = true
      this.$nextTick(function() {
        uni.pageScrollTo({
          selector: '#assessmentCard',
          duration: 260
        })
      })
    },
    onPainChanging: function(event) {
      this.form.pain = event.detail.value
    },
    onPainChange: function(event) {
      this.form.pain = event.detail.value
      if (Number(this.form.pain) >= 6) {
        this.warningVisible = true
      }
    },
    chooseOption: function(field, value) {
      this.form[field] = value
      if (field === 'discomfort' && value === '有，想告诉医护') {
        this.warningVisible = true
        this.assessmentExpanded = true
      }
      if ((field === 'swelling' && value === '明显') || (field === 'fatigue' && value === '很累')) {
        this.warningVisible = true
        this.assessmentExpanded = true
      }
    },
    validateForm: function() {
      if (this.form.pain === '' || this.form.pain === null || this.form.pain === undefined) {
        this.showToast('请先滑动选择现在的疼痛程度。', 'warning')
        return false
      }
      if (!this.form.swelling) {
        this.showToast('请选择患处肿胀情况。', 'warning')
        return false
      }
      if (!this.form.fatigue) {
        this.showToast('请选择训练后的疲劳程度。', 'warning')
        return false
      }
      if (!this.form.discomfort) {
        this.showToast('请选择其他不适情况。', 'warning')
        return false
      }
      return true
    },
    saveDraft: function() {
      this.warningVisible = false
      this.showToast('已暂存，您可以稍后返回今日方案继续填写', 'info')
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 260
      })
    },
    saveEvaluation: function() {
      if (!this.currentAction) {
        this.showToast('暂无可保存评估的训练动作。', 'warning')
        return
      }
      if (!this.validateForm()) return
      var action = this.currentAction
      this.pauseTimer()
      if (this.hasAbnormal) {
        action.status = 'paused'
        action.completedAt = ''
        action.remainingSeconds = action.mode === 'time' ? this.remainingSeconds : 0
        this.warningVisible = true
        this.assessmentExpanded = true
        this.showToast('评估存在异常指标，建议暂停训练并联系医护。', 'warning')
        return
      }
      action.status = 'completed'
      action.completedAt = this.nowTime()
      if (action.mode === 'time') {
        action.remainingSeconds = 0
      }
      this.warningVisible = false
      this.assessmentExpanded = false
      if (!this.week.todayLogged) {
        this.week.done = Math.min(this.week.target, this.week.done + 1)
        this.week.todayLogged = true
        var today = this.week.days.filter(function(day) {
          return day.isToday
        })[0]
        if (today) {
          today.status = 'done'
        }
      }
      var pending = this.findFirst(['pending', 'inProgress'])
      if (pending) {
        this.selectAction(pending)
      } else {
        var first = this.exercises[0]
        if (first) this.selectAction(first)
      }
      if (this.completedCount !== this.exercises.length) {
        this.showToast('训练后评估已归档保存！数据已加密同步至健康管理团队', 'success')
      } else {
        this.showToast('今日运动已全部完成，训练记录已归档。', 'success')
      }
    },
    nowTime: function() {
      var date = new Date()
      var hour = String(date.getHours()).padStart(2, '0')
      var minute = String(date.getMinutes()).padStart(2, '0')
      return hour + ':' + minute
    },
    contactTeam: function() {
      var phone = '4008209988'
      uni.makePhoneCall({
        phoneNumber: phone,
        fail: function() {
          uni.showModal({
            title: '联系健康管理团队',
            content: '电话：400-820-9988，也可以在会话中直接咨询。',
            showCancel: false,
            confirmText: '我知道了'
          })
        }
      })
    },
    playVideo: function() {
      this.showToast('视频播放为演示状态，正式环境接入健康管理团队上传素材。', 'info')
    },
    openClinicalGuide: function() {
      uni.showModal({
        title: '临床康复指引',
        content: '请按健康管理团队配置的剂量、角度和节奏训练，出现疼痛加重、明显肿胀或头晕心慌时立即停止。',
        showCancel: false,
        confirmText: '我知道了'
      })
    },
    syncAdvisor: function() {
      this.showToast('已为您连接责任医护与个案管理师，运动记录已加密同步。', 'success')
    },
    changeTab: function(tab) {
      this.activeTab = tab.key
      if (tab.key !== 'health') {
        this.showToast('当前为康复运动原型，底部导航仅作状态展示。', 'info')
      }
    },
    changeCategory: function(tab) {
      if (tab.key !== 'sport') {
        this.showToast('当前演示页面为运动管理，' + tab.name + '模块由对应页面承载。', 'info')
      }
    },
    applyScenario: function(key) {
      this.activeScenario = key
      this.clearTimer()
      this.warningVisible = false
      this.assessmentExpanded = true
      this.form = createForm()
      this.mediaTab = 'video'

      if (key === 'noPlan') {
        this.hasPlan = false
        this.exercises = []
        this.currentActionId = ''
        this.currentGroup = 1
        this.remainingSeconds = 0
        this.running = false
        this.countPaused = false
        this.week = createEmptyWeek()
        this.assessmentExpanded = false
        this.showToast('当前状态：今日暂无运动方案。', 'info')
        return
      }

      this.hasPlan = true
      if (key === 'default') {
        this.exercises = createDefaultActions()
        this.week = createWeek()
        this.selectAction(this.exercises[1])
        this.form = createForm()
        this.showToast('已切换到默认流程：呼吸放松待评估。', 'info')
      }

      if (key === 'allDone') {
        this.exercises = [
          createWalk({ status: 'completed', completedAt: '20:04', remainingSeconds: 0 }),
          createBreath({ status: 'completed', completedAt: '20:08' }),
          createRehab({ status: 'completed', completedAt: '20:12', remainingSeconds: 0 })
        ]
        this.week = createWeek()
        this.week.done = 6
        this.week.todayLogged = true
        this.week.days[5].status = 'done'
        this.selectAction(this.exercises[0])
        this.mode = 'time'
        this.remainingSeconds = 0
        this.assessmentExpanded = false
        this.showToast('今日方案已全部完成，评估已归档。', 'success')
      }

      if (key === 'pendingEvaluation') {
        this.exercises = createDefaultActions()
        this.week = createWeek()
        this.selectAction(this.exercises[1])
        this.assessmentExpanded = true
        this.showToast('训练已完成，训练后评估尚未填写。', 'info')
      }

      if (key === 'abnormal') {
        this.exercises = createDefaultActions()
        this.exercises[1] = createBreath({ status: 'paused' })
        this.week = createWeek()
        this.selectAction(this.exercises[1])
        this.form.pain = 7
        this.form.swelling = '无'
        this.form.fatigue = '一般'
        this.form.discomfort = '有，想告诉医护'
        this.warningVisible = true
        this.assessmentExpanded = true
        this.showToast('评估异常，训练已暂停，请联系健康管理团队。', 'warning')
      }
    }
  }
}
</script>

<style scoped>
.rehab-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f2d3d;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  box-sizing: border-box;
}
.rehab-page view,
.rehab-page text,
.rehab-page image,
.rehab-page scroll-view,
.rehab-page slider,
.rehab-page textarea {
  box-sizing: border-box;
}
.debug-tool {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 100;
  width: 702rpx;
  padding: 18rpx 20rpx 16rpx;
  transform: translateX(-50%);
  border-radius: 0 0 22rpx 22rpx;
  background: linear-gradient(135deg, #101a31 0%, #14294d 100%);
  box-shadow: 0 10rpx 28rpx rgba(20, 34, 64, 0.22);
}
.debug-tool.collapsed {
  width: 260rpx;
  padding-bottom: 14rpx;
}
.tool-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38rpx;
}
.tool-title {
  display: flex;
  align-items: center;
}
.tool-shield {
  width: 26rpx;
  height: 26rpx;
  margin-right: 8rpx;
  border-radius: 50%;
  background: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tool-title-text {
  color: #ffffff;
  font-size: 21rpx;
  font-weight: 700;
}
.tool-action {
  display: flex;
  align-items: center;
  color: #aebedb;
  font-size: 18rpx;
}
.tool-action text {
  margin-right: 4rpx;
}
.tool-scroll {
  width: 100%;
  margin-top: 14rpx;
  white-space: nowrap;
}
.tool-chips {
  display: flex;
  align-items: center;
  min-width: max-content;
}
.tool-chip {
  flex: 0 0 auto;
  margin-right: 12rpx;
  padding: 10rpx 18rpx;
  border: 1rpx solid rgba(156, 176, 216, 0.28);
  border-radius: 22rpx;
  color: #cad7ee;
  background: rgba(255, 255, 255, 0.06);
  font-size: 19rpx;
  line-height: 1;
}
.tool-chip.active {
  color: #ffffff;
  border-color: #1677ff;
  background: #1677ff;
  font-weight: 700;
}
.category-tabs {
  position: fixed;
  top: 98rpx;
  left: 0;
  right: 0;
  z-index: 90;
  height: 78rpx;
  background: #f4f7fb;
  white-space: nowrap;
}
.category-tabs.collapsed {
  top: 64rpx;
}
.category-track {
  display: inline-flex;
  align-items: center;
  height: 78rpx;
  padding: 0 24rpx;
}
.category-tab {
  flex: 0 0 auto;
  margin-right: 16rpx;
  padding: 12rpx 24rpx;
  border-radius: 28rpx;
  background: #ffffff;
  color: #66748b;
  font-size: 22rpx;
  font-weight: 700;
  border: 1rpx solid #e3e9f2;
}
.category-tab.active {
  color: #ffffff;
  background: #1677ff;
  border-color: #1677ff;
  box-shadow: 0 8rpx 18rpx rgba(22, 119, 255, 0.22);
}
.top-toast {
  position: fixed;
  top: 190rpx;
  left: 50%;
  z-index: 120;
  width: 670rpx;
  min-height: 72rpx;
  padding: 16rpx 20rpx;
  transform: translateX(-50%);
  border: 1rpx solid rgba(22, 119, 255, 0.18);
  border-radius: 16rpx;
  background: #eef5ff;
  box-shadow: 0 10rpx 30rpx rgba(22, 119, 255, 0.18);
  display: flex;
  align-items: center;
}
.top-toast.success {
  background: #eafaf1;
  border-color: rgba(22, 163, 95, 0.22);
  box-shadow: 0 10rpx 30rpx rgba(22, 163, 95, 0.16);
}
.top-toast.warning,
.top-toast.danger {
  background: #fff8e8;
  border-color: rgba(231, 143, 0, 0.28);
  box-shadow: 0 10rpx 30rpx rgba(231, 143, 0, 0.16);
}
.toast-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  border-radius: 50%;
  background: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.top-toast.success .toast-icon {
  background: #16a35f;
}
.top-toast.warning .toast-icon,
.top-toast.danger .toast-icon {
  background: #f08a00;
}
.toast-text {
  color: #27466e;
  font-size: 22rpx;
  line-height: 1.45;
  font-weight: 600;
}
.page-body {
  padding: 198rpx 24rpx 150rpx;
}
.page-body.tool-mini {
  padding-top: 160rpx;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4rpx 4rpx 16rpx;
}
.heading-left {
  display: flex;
  align-items: center;
}
.heading-bar {
  width: 8rpx;
  height: 28rpx;
  margin-right: 12rpx;
  border-radius: 8rpx;
  background: #1677ff;
}
.heading-title {
  color: #1f2d3d;
  font-size: 28rpx;
  font-weight: 800;
}
.date-pill {
  padding: 9rpx 16rpx;
  border-radius: 22rpx;
  color: #1677ff;
  background: #edf3ff;
  font-size: 20rpx;
  font-weight: 700;
}
.card {
  margin-bottom: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 28rpx rgba(33, 51, 83, 0.06);
  border: 1rpx solid rgba(226, 232, 242, 0.88);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-head.align-start {
  align-items: flex-start;
}
.card-title {
  color: #182338;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.35;
}
.card-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #8b97aa;
  font-size: 21rpx;
  line-height: 1.4;
}
.small-tabs {
  display: flex;
  align-items: center;
  padding: 4rpx;
  border-radius: 22rpx;
  background: #f1f4f9;
}
.small-tabs view {
  min-width: 78rpx;
  padding: 10rpx 18rpx;
  border-radius: 18rpx;
  color: #7c889c;
  font-size: 20rpx;
  font-weight: 700;
  text-align: center;
}
.small-tabs view.active {
  color: #ffffff;
  background: #1677ff;
  box-shadow: 0 6rpx 14rpx rgba(22, 119, 255, 0.22);
}
.primary-btn {
  min-height: 76rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #1677ff 0%, #0e6bd6 100%);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 22rpx rgba(22, 119, 255, 0.22);
}
.primary-btn.disabled {
  background: #b8c8e7;
  box-shadow: none;
  color: rgba(255, 255, 255, 0.88);
}
.primary-btn text {
  margin-left: 8rpx;
}
.plan-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.plan-title-row {
  display: flex;
  align-items: center;
}
.today-badge {
  margin-left: 12rpx;
  padding: 6rpx 14rpx;
  border-radius: 18rpx;
  background: #e9f1ff;
  color: #1677ff;
  font-size: 18rpx;
  font-weight: 700;
}
.summary-pill {
  padding: 10rpx 16rpx;
  border-radius: 24rpx;
  color: #8b97aa;
  background: #f5f7fb;
  font-size: 20rpx;
  font-weight: 700;
  white-space: nowrap;
}
.progress-box {
  margin-top: 24rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #f8fafd;
}
.progress-label {
  display: flex;
  align-items: center;
  color: #657187;
  font-size: 22rpx;
  font-weight: 600;
}
.progress-dot {
  width: 12rpx;
  height: 12rpx;
  margin-right: 10rpx;
  border-radius: 50%;
  background: #1677ff;
}
.progress-track {
  height: 12rpx;
  margin-top: 14rpx;
  border-radius: 10rpx;
  background: #dfe4ee;
  overflow: hidden;
}
.progress-inner {
  height: 100%;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #1677ff, #4d93ff);
  transition: width 0.25s ease;
}
.exercise-list {
  margin-top: 18rpx;
}
.exercise-item {
  min-height: 98rpx;
  margin-bottom: 14rpx;
  padding: 18rpx;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  background: #f8fafd;
  display: flex;
  align-items: center;
}
.exercise-item.active {
  border-color: #1677ff;
  background: #eef5ff;
  box-shadow: inset 5rpx 0 0 #1677ff;
}
.exercise-item.completed {
  background: #f7faff;
}
.item-index {
  width: 52rpx;
  height: 52rpx;
  margin-right: 16rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21rpx;
  font-weight: 800;
  flex: 0 0 auto;
}
.item-index.pending {
  color: #8b97aa;
  background: #e5e9f1;
}
.item-index.done {
  color: #1677ff;
  background: #dfe9ff;
}
.item-index.evaluate,
.item-index.progress {
  color: #ffffff;
  background: #1677ff;
}
.item-index.paused {
  color: #d77b00;
  background: #fff0d5;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-name {
  display: block;
  color: #202b3f;
  font-size: 25rpx;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-dose {
  display: block;
  margin-top: 6rpx;
  color: #8b97aa;
  font-size: 20rpx;
}
.item-right {
  display: flex;
  align-items: center;
  margin-left: 10rpx;
}
.status-tag {
  margin-right: 8rpx;
  padding: 7rpx 12rpx;
  border-radius: 16rpx;
  font-size: 18rpx;
  font-weight: 800;
  white-space: nowrap;
}
.status-tag.large {
  padding: 9rpx 16rpx;
  font-size: 20rpx;
}
.status-tag.pending {
  color: #9aa5b8;
  background: #f0f2f6;
}
.status-tag.done {
  color: #1677ff;
  background: #e8f0ff;
}
.status-tag.evaluate {
  color: #c98100;
  background: #fff5d7;
}
.status-tag.progress {
  color: #1677ff;
  background: #e8f0ff;
}
.status-tag.paused {
  color: #d05a00;
  background: #fff0dc;
}
.start-btn {
  margin-top: 20rpx;
}
.empty-plan {
  padding: 40rpx 20rpx 20rpx;
  text-align: center;
}
.empty-icon {
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  background: #edf3ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-title {
  display: block;
  color: #202b3f;
  font-size: 28rpx;
  font-weight: 800;
}
.empty-desc {
  display: block;
  margin: 14rpx 24rpx 26rpx;
  color: #8b97aa;
  font-size: 22rpx;
  line-height: 1.55;
}
.empty-btn {
  width: 100%;
}
.media-card .card-head,
.record-card .card-head {
  margin-bottom: 22rpx;
}
.video-wrap {
  position: relative;
  height: 320rpx;
  border-radius: 18rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #dff0ff 0%, #8fc4f7 100%);
}
.cover-walk {
  background: linear-gradient(135deg, #e3f3ff 0%, #6db5f2 58%, #2d86d5 100%);
}
.cover-breath {
  background: linear-gradient(135deg, #e8f7ff 0%, #9ed8f0 55%, #4aa6d7 100%);
}
.cover-rehab {
  background: linear-gradient(135deg, #e9f2ff 0%, #9cc4f8 55%, #3e83d8 100%);
}
.video-cover-bg {
  position: absolute;
  left: -90rpx;
  bottom: -120rpx;
  width: 520rpx;
  height: 360rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
}
.cover-grid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 76rpx;
  background:
    linear-gradient(rgba(255, 255, 255, 0.18) 2rpx, transparent 2rpx),
    linear-gradient(90deg, rgba(255, 255, 255, 0.16) 2rpx, transparent 2rpx);
  background-size: 42rpx 26rpx;
  opacity: 0.72;
}
.cover-orbit {
  position: absolute;
  border: 2rpx solid rgba(255, 255, 255, 0.36);
  border-radius: 50%;
}
.orbit-one {
  right: -70rpx;
  top: -44rpx;
  width: 210rpx;
  height: 210rpx;
}
.orbit-two {
  left: 32rpx;
  bottom: 48rpx;
  width: 126rpx;
  height: 126rpx;
}
.cover-icon {
  position: absolute;
  left: 38rpx;
  bottom: 64rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.22);
  border: 2rpx solid rgba(255, 255, 255, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8rpx);
}
.cover-pulse {
  position: absolute;
  right: 34rpx;
  bottom: 56rpx;
  display: flex;
  align-items: flex-end;
  height: 72rpx;
}
.pulse-bar {
  width: 10rpx;
  margin-left: 10rpx;
  border-radius: 10rpx;
  background: rgba(255, 255, 255, 0.72);
}
.bar-one {
  height: 34rpx;
}
.bar-two {
  height: 58rpx;
}
.bar-three {
  height: 44rpx;
}
.video-image {
  width: 100%;
  height: 100%;
}
.video-label {
  position: absolute;
  left: 18rpx;
  top: 18rpx;
  padding: 8rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.42);
  color: #ffffff;
  font-size: 19rpx;
}
.play-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 88rpx;
  height: 88rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.22);
}
.zoom-icon {
  position: absolute;
  right: 18rpx;
  bottom: 18rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 10rpx;
  background: rgba(0, 0, 0, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a8b2c3;
  font-size: 22rpx;
}
.diagram-panel {
  border-radius: 18rpx;
  background: #f6f9ff;
  padding: 10rpx 18rpx;
}
.diagram-step {
  display: flex;
  align-items: flex-start;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #e8eef8;
}
.diagram-step:last-child {
  border-bottom: none;
}
.diagram-no {
  width: 42rpx;
  height: 42rpx;
  margin-right: 14rpx;
  border-radius: 50%;
  background: #1677ff;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.diagram-title {
  display: block;
  color: #202b3f;
  font-size: 23rpx;
  font-weight: 800;
}
.diagram-desc {
  display: block;
  margin-top: 6rpx;
  color: #7e8a9e;
  font-size: 20rpx;
  line-height: 1.5;
}
.media-name-row {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.media-name {
  color: #202b3f;
  font-size: 27rpx;
  font-weight: 800;
}
.link-text {
  display: flex;
  align-items: center;
  color: #1677ff;
  font-size: 20rpx;
  font-weight: 700;
}
.media-desc {
  display: block;
  margin-top: 12rpx;
  color: #6d788c;
  font-size: 22rpx;
  line-height: 1.55;
}
.media-footer {
  margin-top: 22rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #eef1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.config-text {
  color: #a2acbc;
  font-size: 19rpx;
}
.guide-btn {
  padding: 8rpx 14rpx;
  border-radius: 14rpx;
  background: #f4f6fa;
  color: #8b97aa;
  font-size: 18rpx;
}
.current-row,
.status-row {
  min-height: 70rpx;
  padding: 0 22rpx;
  border-radius: 16rpx;
  background: #f8fafd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.current-label {
  color: #8994a7;
  font-size: 22rpx;
}
.current-name,
.row-value {
  color: #202b3f;
  font-size: 23rpx;
  font-weight: 800;
  text-align: right;
}
.record-content {
  padding-top: 26rpx;
}
.group-progress {
  display: block;
  text-align: center;
  color: #707c91;
  font-size: 22rpx;
  font-weight: 700;
}
.group-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16rpx 0 8rpx;
}
.group-dot {
  width: 54rpx;
  height: 14rpx;
  margin: 0 8rpx;
  border-radius: 10rpx;
  background: #dce2ee;
}
.group-dot.finished,
.group-dot.active {
  background: #1677ff;
}
.big-number-box {
  padding: 18rpx 0 24rpx;
  text-align: center;
}
.big-number {
  color: #17233b;
  font-size: 86rpx;
  line-height: 1;
  font-weight: 300;
}
.time-number {
  font-size: 76rpx;
  letter-spacing: 2rpx;
}
.big-unit {
  color: #8d98aa;
  font-size: 30rpx;
  margin-left: 6rpx;
}
.number-tip {
  display: block;
  margin-top: 14rpx;
  color: #9aa5b7;
  font-size: 21rpx;
}
.record-main {
  width: 100%;
}
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
}
.control-row.three .light-btn {
  flex: 1;
  margin-right: 14rpx;
}
.control-row.three .small-primary {
  flex: 1.25;
}
.light-btn {
  min-height: 70rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
  background: #fff8e8;
  color: #c97800;
  border: 1rpx solid #f3d99a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
  font-weight: 800;
}
.control-row .light-btn + .light-btn {
  background: #ffffff;
  color: #61708a;
  border-color: #dfe4ee;
}
.light-btn.disabled {
  opacity: 0.55;
}
.light-btn text {
  margin-left: 8rpx;
}
.small-primary {
  min-height: 70rpx;
  border-radius: 18rpx;
  background: #1677ff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
}
.small-primary.disabled {
  background: #a9bfe8;
}
.finish-btn {
  width: 100%;
  margin-top: 18rpx;
}
.danger-tip {
  margin-top: 22rpx;
  text-align: center;
  color: #ef3d52;
  font-size: 23rpx;
  font-weight: 800;
  text-decoration: underline;
}
.record-empty {
  min-height: 150rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa7ba;
  font-size: 22rpx;
}
.record-empty text {
  margin-left: 10rpx;
}
.progress-pill,
.week-pill {
  padding: 9rpx 16rpx;
  border-radius: 20rpx;
  color: #738098;
  background: #f5f7fb;
  font-size: 20rpx;
  font-weight: 700;
}
.status-rows {
  margin-top: 20rpx;
  border-radius: 18rpx;
  overflow: hidden;
}
.status-row {
  min-height: 76rpx;
  border-bottom: 1rpx solid #edf0f5;
  background: #ffffff;
}
.status-row:last-child {
  border-bottom: none;
}
.archive-strip {
  margin-top: 20rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #edf4ff;
  color: #1677ff;
  display: flex;
  align-items: center;
  font-size: 21rpx;
  font-weight: 700;
}
.archive-strip text {
  margin-left: 10rpx;
}
.warning-box,
.inline-warning {
  margin-top: 20rpx;
  padding: 20rpx;
  border: 1rpx solid #f4d08a;
  border-radius: 18rpx;
  background: #fff9e8;
}
.warning-title {
  display: flex;
  align-items: flex-start;
  color: #a95f00;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 1.45;
}
.warning-title text {
  margin-left: 8rpx;
}
.warning-desc {
  display: block;
  margin-top: 10rpx;
  color: #8f7448;
  font-size: 20rpx;
  line-height: 1.55;
}
.orange-btn {
  min-height: 68rpx;
  margin-top: 16rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #f28a00 0%, #df6f00 100%);
  color: #ffffff;
  font-size: 23rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(226, 123, 0, 0.22);
}
.orange-btn text {
  margin-left: 8rpx;
}
.assessment-entry {
  width: 100%;
  margin-top: 20rpx;
}
.finish-empty {
  min-height: 90rpx;
}
.assessment-title-row {
  display: flex;
  align-items: center;
}
.backend-badge {
  margin-left: 10rpx;
  padding: 5rpx 12rpx;
  border-radius: 14rpx;
  background: #e9f1ff;
  color: #1677ff;
  font-size: 17rpx;
  font-weight: 700;
}
.collapse-btn {
  display: flex;
  align-items: center;
  color: #61708a;
  font-size: 21rpx;
}
.collapse-btn text {
  margin-right: 4rpx;
}
.engine-tip {
  margin-top: 20rpx;
  padding: 16rpx 18rpx;
  border-radius: 16rpx;
  background: #f7faff;
  display: flex;
  align-items: flex-start;
}
.engine-tip text {
  margin-left: 10rpx;
  color: #68758c;
  font-size: 19rpx;
  line-height: 1.5;
}
.form-block {
  margin-top: 20rpx;
  padding: 22rpx 20rpx;
  border-radius: 20rpx;
  background: #f8fafd;
}
.form-title {
  display: flex;
  align-items: center;
}
.form-no {
  color: #1f2d3d;
  font-size: 24rpx;
  font-weight: 800;
  margin-right: 6rpx;
}
.form-label {
  color: #202b3f;
  font-size: 24rpx;
  font-weight: 800;
}
.required {
  margin-left: 10rpx;
  color: #ef3d52;
  font-size: 18rpx;
  font-weight: 800;
}
.custom-badge {
  margin-left: 10rpx;
  padding: 5rpx 10rpx;
  border-radius: 12rpx;
  color: #1677ff;
  background: #e9f1ff;
  font-size: 17rpx;
}
.form-desc {
  display: block;
  margin: 10rpx 0 18rpx;
  color: #9aa5b7;
  font-size: 20rpx;
  line-height: 1.45;
}
.scale-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8a95a8;
  font-size: 21rpx;
}
.score-bubble {
  min-width: 84rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: #ffffff;
  color: #1677ff;
  border: 2rpx solid #9fc0ff;
  text-align: center;
  font-size: 23rpx;
  font-weight: 900;
}
.danger-text {
  color: #ef5968;
}
.pain-slider {
  margin: 8rpx 8rpx 0;
}
.threshold-row {
  text-align: right;
  color: #9aa5b7;
  font-size: 19rpx;
}
.option-row {
  display: flex;
  justify-content: space-between;
}
.option-btn {
  flex: 1;
  min-height: 64rpx;
  margin: 0 8rpx;
  border: 1rpx solid #dfe4ee;
  border-radius: 18rpx;
  background: #ffffff;
  color: #59667c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
}
.option-btn:first-child {
  margin-left: 0;
}
.option-btn:last-child {
  margin-right: 0;
}
.option-btn.active {
  border: 2rpx solid #8db2ff;
  background: #eef5ff;
  color: #1677ff;
  font-weight: 900;
}
.textarea-block {
  margin-top: 20rpx;
}
.textarea-label {
  display: block;
  color: #202b3f;
  font-size: 23rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
}
.note-input {
  width: 100%;
  height: 130rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #f8fafd;
  color: #202b3f;
  font-size: 22rpx;
  line-height: 1.5;
}
.note-placeholder {
  color: #aab4c4;
}
.inline-warning {
  margin-bottom: 20rpx;
}
.assessment-actions {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}
.ghost-btn {
  flex: 1;
  min-height: 76rpx;
  margin-right: 18rpx;
  border-radius: 18rpx;
  border: 1rpx solid #dfe4ee;
  background: #ffffff;
  color: #48556c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
}
.save-btn {
  flex: 1.15;
}
.week-card {
  padding-bottom: 24rpx;
}
.week-summary {
  margin-top: 22rpx;
  padding: 22rpx 18rpx;
  border-radius: 20rpx;
  background: #f8fafd;
  display: flex;
  align-items: center;
}
.ring {
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
  padding: 12rpx;
  flex: 0 0 auto;
}
.ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-percent {
  color: #1677ff;
  font-size: 28rpx;
  font-weight: 900;
}
.week-text {
  flex: 1;
  min-width: 0;
  padding: 0 18rpx;
}
.week-count {
  display: block;
  color: #202b3f;
  font-size: 25rpx;
  font-weight: 800;
}
.week-compare {
  display: block;
  margin-top: 10rpx;
  color: #16a35f;
  font-size: 21rpx;
  font-weight: 700;
}
.trend-line {
  width: 112rpx;
  height: 72rpx;
  position: relative;
  flex: 0 0 auto;
}
.trend-dot {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #9db8f5;
}
.trend-dot.dot-a {
  left: 8rpx;
  top: 48rpx;
}
.trend-dot.dot-b {
  left: 48rpx;
  top: 30rpx;
}
.trend-dot.dot-c {
  right: 8rpx;
  top: 12rpx;
  background: #1677ff;
}
.week-calendar {
  margin-top: 22rpx;
  display: flex;
  justify-content: space-between;
}
.day-col {
  width: 13.2%;
  text-align: center;
}
.day-name {
  display: block;
  color: #8b97aa;
  font-size: 19rpx;
}
.day-dot {
  width: 42rpx;
  height: 42rpx;
  margin: 10rpx auto 8rpx;
  border-radius: 50%;
  background: #e8edf6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.day-dot.done {
  background: #1677ff;
}
.day-dot.rest {
  background: #f1f4f9;
  border: 1rpx dashed #c8d1df;
}
.day-col.today .day-name {
  color: #1677ff;
  font-weight: 900;
}
.day-col.today .day-dot {
  box-shadow: 0 0 0 6rpx rgba(22, 119, 255, 0.12);
}
.day-date {
  color: #a2acbc;
  font-size: 17rpx;
}
.week-footer {
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #eef1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.week-footer text {
  flex: 1;
  color: #9aa5b7;
  font-size: 19rpx;
  line-height: 1.45;
  padding-right: 14rpx;
}
.week-footer .link-text {
  flex: 0 0 auto;
}
.sync-btn {
  min-height: 82rpx;
  margin: 4rpx 0 18rpx;
  border-radius: 20rpx;
  border: 2rpx solid #1677ff;
  background: #edf4ff;
  color: #1677ff;
  font-size: 25rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-symbol {
  margin-right: 10rpx;
  font-size: 25rpx;
}
.disclaimer {
  display: block;
  padding: 0 14rpx 120rpx;
  color: #a2acbc;
  font-size: 18rpx;
  line-height: 1.6;
  text-align: center;
}
.modal-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 130;
  background: rgba(15, 23, 42, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}
.warning-modal {
  width: 100%;
  padding: 34rpx 28rpx 28rpx;
  border-radius: 26rpx;
  background: #ffffff;
  text-align: center;
}
.modal-icon {
  width: 92rpx;
  height: 92rpx;
  margin: 0 auto 18rpx;
  border-radius: 50%;
  background: #fff4dc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-title {
  display: block;
  color: #202b3f;
  font-size: 30rpx;
  font-weight: 900;
}
.modal-desc {
  display: block;
  margin-top: 14rpx;
  color: #69758b;
  font-size: 23rpx;
  line-height: 1.6;
}
.modal-meta {
  display: block;
  margin-top: 12rpx;
  color: #b16800;
  font-size: 20rpx;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  margin-top: 26rpx;
}
.modal-button {
  flex: 1;
  min-height: 74rpx;
  margin-top: 0;
  margin-right: 0;
}
.modal-actions .ghost-btn {
  margin-right: 16rpx;
}
.bottom-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 110;
  height: 112rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.98);
  border-top: 1rpx solid #e6ebf3;
  display: flex;
  box-shadow: 0 -8rpx 24rpx rgba(31, 45, 61, 0.06);
}
.tab-item {
  flex: 1;
  height: 112rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9aa5b7;
  font-size: 19rpx;
}
.tab-item text:last-child {
  margin-top: 5rpx;
}
.tab-item text.active {
  color: #1677ff;
  font-weight: 800;
}
.tab-badge-wrap {
  position: relative;
  width: 42rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-badge {
  position: absolute;
  right: -18rpx;
  top: -10rpx;
  min-width: 24rpx;
  height: 24rpx;
  padding: 0 6rpx;
  border-radius: 12rpx;
  background: #ef4444;
  color: #ffffff;
  font-size: 16rpx;
  line-height: 24rpx;
  text-align: center;
}
</style>
