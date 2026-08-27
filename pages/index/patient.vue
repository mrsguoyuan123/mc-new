<template>
  <view class=" page-content page-patient">
    <!-- 上方信息卡片 -->
    <view class="card-top1 radius-15 card-border-gray">
      <view class="card-header">
        <view class="icon-box">
          <u-icon name="file-text" color="#9c27b0" size="60rpx"></u-icon>
        </view>
        <view class="header-info">
          <view class="name-row">
            <text class="name font-l">{{detailData.name}}</text>
            <text class="font-info font-m">{{detailData.age}}岁</text>
          </view>
          <text class="status">{{detailData.status}}</text>
        </view>
      </view>

      <view class="info-item">
        <u-icon name="phone" color="#909399" size="32rpx"></u-icon>
        <text class="font-info">{{detailData.phone}}</text>
      </view>
      <view class="info-item">
        <u-icon name="map" color="#909399" size="32rpx"></u-icon>
        <text class="font-info">{{detailData.hospital}}</text>
      </view>
      <view class="info-item">
        <u-icon name="clock" color="#909399" size="32rpx"></u-icon>
        <text class="font-info">服务时间: {{detailData.serviceTime}}</text>
      </view>
    </view>

    <!-- 服务记录卡片 -->
    <view class="card-record  radius-15 card-border-gray">
      <text class="card-title font-l">服务记录</text>
      <view class="record-list">
        <view v-for="(item, idx) in detailData.recordList" :key="idx" class="record-item">
          <view class="node-wrap">
            <u-icon name="checkmark-circle" color="#36b37e" size="40rpx"></u-icon>
            <!-- 时间轴竖线，非最后一项显示 -->
            <view v-if="idx < detailData.recordList.length - 1" class="timeline-line"></view>
          </view>
          <view class="record-content">
            <text class="record-name">{{item.title}}</text>
            <text class="record-date font-info">{{item.date}}</text>
          </view>
        </view>
      </view>
    </view>
	<custom-tabbar :current="0"></custom-tabbar>
  </view>
</template>

<script>
	import customTabbar from "@/components/custom-tabbar/custom-tabbar.vue";
export default {
	components: { customTabbar },
  data() {
    return {
      detailData: {
        name: "孙患者",
        age: 45,
        status: "已完成",
        phone: "138****5678",
        hospital: "杭州市第一人民医院",
        serviceTime: "2026-04-22 09:00",
        recordList: [
          { title: "诊后随访", date: "2026-04-10" },
          { title: "术后陪诊", date: "2026-03-25" }
        ]
      }
    }
  }
}
</script>

<style scoped>

.page-content {
  padding: 24rpx;
}

.card-top1 {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.card-header {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
  margin-bottom: 32rpx;
}
.icon-box {
  width: 100rpx;
  height: 100rpx;
  flex-shrink: 0;
  border-radius: 24rpx;
  background-color: #f8f0fc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-info {
  flex: 1;
}
.name-row {
  display: flex;
  gap: 16rpx;
  align-items: baseline;
  margin-bottom: 12rpx;
}
.name {
  font-weight: bold;
  
}
.status {
  color: #00c950;
  font-size: 30rpx;
}

.info-item {
  display: flex;
  gap: 16rpx;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-record {
  background: #ffffff;
  padding: 32rpx;
}
.card-title {
  /* font-size: 44rpx; */
  font-weight: bold;
  display: block;
  margin-bottom: 40rpx;
}

.record-item {
  display: flex;
  gap: 24rpx;
  position: relative;
  /* 条目间距 = 圆圈到下一个圆圈的距离 */
  margin-bottom: 64rpx;
}
.record-item:last-child {
  margin-bottom: 0;
}

.node-wrap {
  position: relative;
  flex-shrink: 0;
}
/* 竖线：从图标底部一直向下，刚好连到下一个图标的顶部 */
.timeline-line {
  position: absolute;
  left: 50%;
  /* 从check图标底部开始 */
  top: 40rpx;
  transform: translateX(-50%);
  width: 2rpx;
  /* 和record-item的margin-bottom保持一致，完美对接下一个节点 */
  height: 64rpx;
  background-color: #e8e8e8;
}

.record-content {
  padding-top: 4rpx;
}
.record-name {
  font-size: 30rpx;
  font-weight: 500;
  /* color: #111; */
  display: block;
  margin-bottom: 8rpx;
}
.record-date {
  font-size: 25rpx;
}


</style>
