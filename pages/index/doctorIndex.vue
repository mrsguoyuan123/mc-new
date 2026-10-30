<template>
  <view class="doctor-index-page">
    <!-- 搜索框 -->
    <view class="search-wrap">
      <u-search
        v-model="searchKey"
        placeholder="搜索患者姓名、手机号、手术名称..."
        :show-action="false"
        bg-color="#f5f7fa"
        height="72"
        @input="handleSearch"
      ></u-search>
    </view>

    <!-- 排序 & 科室筛选 -->
    <view class="filter-top">
      <u-dropdown
        ref="sortDropdown"
        v-model="sortValue"
        :options="sortOptions"
        title="时间倒序 (默认最近)"
        @change="handleSortChange"
      ></u-dropdown>
      <u-dropdown
        ref="deptDropdown"
        v-model="deptValue"
        :options="deptOptions"
        title="科室"
        @change="handleDeptChange"
      ></u-dropdown>
    </view>

    <!-- 时间快捷标签 -->
    <view class="time-tabs">
      <view
        v-for="item in timeTabList"
        :key="item.type"
        class="time-tab-item"
        :class="{ active: activeTimeTab === item.type }"
        @click="handleTimeTabClick(item)"
      >
        {{ item.label }}
      </view>
    </view>

    <!-- 列表统计 -->
    <view class="list-tip">
      共 {{ total }} 位患者记录
      <text class="tip-right">点击进入详情</text>
    </view>

    <!-- 患者列表 -->
    <view class="patient-list">
      <view class="patient-item" v-for="item in patientList" :key="item.id" @click="goDetail(item)">
        <view class="item-left">
          <view class="avatar">{{ item.name.slice(0,1) }}</view>
        </view>
        <view class="item-center">
          <view class="name-row">
            <text class="name">{{ item.name }}</text>
            <text class="gender">{{ item.gender }}</text>
          </view>
          <view class="operation-name">{{ item.operationName }}</view>
          <view class="time-row">
            <u-icon name="clock" size="14" color="#999"></u-icon>
            <text class="time-text">手术时间: {{ item.operationTime }}</text>
          </view>
        </view>
        <view class="item-right">
          <view class="btn-msg" @click.stop="openChat(item)">查看沟通记录</view>
          <view class="btn-report" @click.stop="openReport(item)">查看详情报告</view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <u-empty v-if="patientList.length === 0 && !loading" text="暂无患者数据"></u-empty>

    <!-- 加载 -->
    <u-loading v-if="loading"></u-loading>

    <!-- 自定义时间弹窗 -->
    <u-popup v-model="showDatePopup" mode="center" border-radius="16" width="85%">
      <view class="date-popup">
        <view class="popup-title">自定义手术时间范围</view>
        <view class="date-row">
          <view class="date-label">起始日期</view>
          <u-date-picker
            v-model="startDate"
            mode="date"
            @confirm="onStartDateConfirm"
          >
            <view class="date-input">{{ startDate || '请选择' }}</view>
          </u-date-picker>
        </view>
        <view class="date-row">
          <view class="date-label">截止日期</view>
          <u-date-picker
            v-model="endDate"
            mode="date"
            @confirm="onEndDateConfirm"
          >
            <view class="date-input">{{ endDate || '请选择' }}</view>
          </u-date-picker>
        </view>
        <view class="popup-btn-row">
          <view class="btn-cancel" @click="showDatePopup = false">取消</view>
          <view class="btn-confirm" @click="confirmDateFilter">确认筛选</view>
        </view>
      </view>
    </u-popup>

    <!-- 底部tab -->
    <u-tabbar
      v-model="tabActive"
      :list="tabList"
      @change="tabChange"
    ></u-tabbar>
  </view>
</template>

<script>
export default {
  name: 'DoctorIndex',
  data() {
    return {
      searchKey: '',
      sortValue: 'desc',
      sortOptions: [
        { label: '时间倒序 (默认最近)', value: 'desc' },
        { label: '时间正序', value: 'asc' }
      ],
      deptValue: '',
      deptOptions: [],
      activeTimeTab: 'all',
      timeTabList: [
        { label: '全部', type: 'all' },
        { label: '近7天', type: '7' },
        { label: '近30天', type: '30' },
        { label: '自定义', type: 'custom' }
      ],
      patientList: [],
      total: 0,
      loading: false,
      showDatePopup: false,
      startDate: '',
      endDate: '',
      tabActive: 0,
      tabList: [
        { iconPath: '/static/tab/home.png', selectedIconPath: '/static/tab/home-active.png', text: '首页' },
        { iconPath: '/static/tab/my.png', selectedIconPath: '/static/tab/my-active.png', text: '我的' }
      ],
      page: 1,
      pageSize: 10
    }
  },
  onLoad() {
    this.getDeptList()
    this.fetchPatientList()
  },
  onReachBottom() {
    this.page++
    this.fetchPatientList(true)
  },
  methods: {
    async getDeptList() {
      // const res = await this.$api.getDeptOptions()
      // this.deptOptions = res.data
    },
    async fetchPatientList(isLoadMore = false) {
      if (isLoadMore) {
        this.loading = true
      } else {
        this.page = 1
        this.patientList = []
      }
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          keyword: this.searchKey,
          sort: this.sortValue,
          deptId: this.deptValue,
          timeType: this.activeTimeTab,
          startDate: this.activeTimeTab === 'custom' ? this.startDate : '',
          endDate: this.activeTimeTab === 'custom' ? this.endDate : ''
        }
        const res = await this.$api.doctorPatientList(params)
        if (res.code === 200) {
          const list = res.data.records || []
          this.total = res.data.total
          if (isLoadMore) {
            this.patientList.push(...list)
          } else {
            this.patientList = list
          }
        }
      } catch (err) {
        console.error('列表请求失败', err)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.fetchPatientList()
    },
    handleSortChange() {
      this.fetchPatientList()
    },
    handleDeptChange() {
      this.fetchPatientList()
    },
    handleTimeTabClick(item) {
      this.activeTimeTab = item.type
      if (item.type === 'custom') {
        this.showDatePopup = true
        return
      }
      this.fetchPatientList()
    },
    onStartDateConfirm(e) {
      this.startDate = e.value
    },
    onEndDateConfirm(e) {
      this.endDate = e.value
    },
    confirmDateFilter() {
      if (!this.startDate || !this.endDate) {
        uni.showToast({ title: '请选择起止日期', icon: 'none' })
        return
      }
      this.showDatePopup = false
      this.fetchPatientList()
    },
    goDetail(row) {
      uni.navigateTo({ url: `/pages/doctor/patientDetail?id=${row.id}` })
    },
    openChat(row) {
      uni.navigateTo({ url: `/pages/doctor/chat?id=${row.id}` })
    },
    openReport(row) {
      uni.navigateTo({ url: `/pages/doctor/report?id=${row.id}` })
    },
    tabChange(index) {
      if (index === 1) {
        uni.switchTab({ url: '/pages/doctor/my' })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.doctor-index-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.search-wrap {
  padding: 20rpx 24rpx;
  background-color: #fff;
}
.filter-top {
  display: flex;
  padding: 0 24rpx;
  background: #fff;
  gap: 20rpx;
  padding-bottom: 16rpx;
}
.time-tabs {
  display: flex;
  background: #fff;
  padding: 16rpx 24rpx;
  gap: 16rpx;
}
.time-tab-item {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #666;
  background: #f5f7fa;
}
.time-tab-item.active {
  background: #007aff;
  color: #fff;
}
.list-tip {
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #666;
  display: flex;
  justify-content: space-between;
}
.tip-right {
  color: #999;
}
.patient-list {
  padding: 0 24rpx;
}
.patient-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  border-left: 8rpx solid #007aff;
  align-items: flex-start;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #e8f0fe;
  color: #007aff;
  text-align: center;
  line-height: 80rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.item-center {
  flex: 1;
  margin-left: 20rpx;
}
.name-row {
  display: flex;
  align-items: center;
}
.name {
  font-size: 34rpx;
  font-weight: 500;
}
.gender {
  margin-left: 12rpx;
  color: #999;
  font-size: 26rpx;
}
.operation-name {
  font-size: 28rpx;
  color: #555;
  margin: 8rpx 0;
}
.time-row {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 26rpx;
}
.item-right {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.btn-msg {
  border: 1rpx solid #007aff;
  color: #007aff;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  text-align: center;
}
.btn-report {
  color: #007aff;
  font-size: 26rpx;
  text-align: right;
}
.date-popup {
  padding: 32rpx;
}
.popup-title {
  font-size: 34rpx;
  font-weight: 500;
  margin-bottom: 32rpx;
}
.date-row {
  margin-bottom: 24rpx;
}
.date-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}
.date-input {
  width: 100%;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}
.popup-btn-row {
  display: flex;
  margin-top: 40rpx;
  gap: 20rpx;
}
.btn-cancel {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f5f7fa;
  font-size: 30rpx;
}
.btn-confirm {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #007aff;
  color: #fff;
  font-size: 30rpx;
}
</style>
