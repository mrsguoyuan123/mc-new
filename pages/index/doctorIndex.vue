<template>
  <view class="page-doctor-index">
    <!-- 头部 -->
    <view class="header">
      <view class="title-wrap">
        <view class="icon-doc"></view>
        <view class="title">医生</view>
      </view>
      <view class="sub-title">术后患者全流程管理</view>
    </view>
    <!-- 搜索 -->
    <view class="search-wrap">
      <input class="search-input" placeholder="搜索患者姓名、手机号、手术名称..." v-model="keyword" @input="onSearch" />
    </view>
    <!-- 筛选行 -->
    <view class="filter-row">
      <picker mode="selector" :range="sortOptions" :value="sortIndex" @change="onSortChange">
        <view class="filter-item">
          <text>时间倒序 (默认最近)</text>
        </view>
      </picker>
      <picker mode="selector" :range="deptOptions" :value="deptIndex" @change="onDeptChange">
        <view class="filter-item">
          <text>科室</text>
        </view>
      </picker>
    </view>
    <!-- 时间标签 -->
    <view class="time-tab">
      <view class="time-tab-item" :class="{active:timeType==='all'}" @click="timeType='all'">全部</view>
      <view class="time-tab-item" :class="{active:timeType==='7d'}" @click="timeType='7d'">近7天</view>
      <view class="time-tab-item" :class="{active:timeType==='30d'}" @click="timeType='30d'">近30天</view>
      <view class="time-tab-item" :class="{active:timeType==='custom'}" @click="openCustomDate">自定义</view>
    </view>
    <!-- 列表统计 -->
    <view class="list-tip">
      <text>共 {{total}} 位患者记录</text>
      <text class="right">点击进入详情</text>
    </view>
    <!-- 患者列表 -->
    <view class="patient-list">
      <view class="patient-item" v-for="item in patientList" :key="item.id">
        <view class="left-avatar">
          <view class="avatar-circle">{{item.name.charAt(0)}}</view>
        </view>
        <view class="content">
          <view class="name-row">
            <text class="name">{{item.name}}</text>
            <text class="gender">{{item.gender}}</text>
            <button class="btn-chat" >查看沟通记录</button>
          </view>
          <view class="surgery-name">{{item.surgeryType}}</view>
          <view class="time-row">
            <text>手术时间：{{item.surgeryDate}}</text>
            <text class="btn-archive" @click="routeTo(item.id)">查看详情报告</text>
          </view>
        </view>
      </view>
    </view>

    <myTabbar :current="1"></myTabbar>
  </view>
</template>

<script>
import myTabbar from "@/components/myTabbar";
import { getDoctorPatientsApi,getDoctorPatientsByIdConversationApi,postDoctorPatientsByIdAttachmentsApi,deleteDoctorPatientsByIdAttachmentsByAttIdApi } from '@/api/frontApikit.js'
export default {
  components: {
    myTabbar
  },
  data() {
    return {
      userInfo: {},
      keyword:'',
      departmentId:'',
      from:'',
      to:'',
      sort:'desc',
      page:1,
      pageSize:20,
      patientList:[],
      total:0,
      timeType:'all',
      sortOptions:['时间倒序','时间正序'],
      sortIndex:0,
      deptOptions:['全部科室'],
      deptIndex:0
    }
  },
  onLoad() {
    const userInfo = this.readCurrentUser()
    this.userInfo = userInfo
    this.loadData();
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
    // 获取患者列表
    async loadData() {
     
      const res = await getDoctorPatientsApi({
        keyword:this.keyword,
        departmentId:this.departmentId,
        from:this.from,
        to:this.to,
        sort:this.sort,
        page:this.page,
        pageSize:this.pageSize
      })
      console.log('患者列表',res)
        this.patientList = res.list
        this.total = res.total

     
    },
    onSearch(){
      this.page = 1
      this.loadData()
    },
    onSortChange(e){
      this.sort = e.detail.value === 0 ? 'desc' : 'asc'
      this.loadData()
    },
    onDeptChange(e){
      // 这里后续对接科室ID
      this.loadData()
    },
    openCustomDate(){
      uni.showToast({title:'自定义时间',icon:'none'})
    },
   
   
    // 跳转患者档案（详情报告）
    routeTo(patientId){
      
      uni.navigateTo({
        url:`/pages/index/myHealthRecord?id=${patientId}`
      })
    }
  }
}
</script>

<style scoped>
.page-doctor-index{
  padding:24rpx;
  background-color:#f7f8fa;
  min-height:100vh;
  padding-bottom:140rpx;
}
.header{
  margin-bottom:20rpx;
}
.title-wrap{
  display:flex;
  align-items:center;
  gap:16rpx;
}
.title{
  font-size:36rpx;
  font-weight:bold;
}
.sub-title{
  font-size:26rpx;
  color:#666;
  margin-top:4rpx;
}
.search-wrap{
  background:#fff;
  border-radius:16rpx;
  padding:20rpx;
  margin-bottom:20rpx;
}
.search-input{
  height:60rpx;
  font-size:28rpx;
}
.filter-row{
  display:flex;
  gap:20rpx;
  margin-bottom:20rpx;
}
.filter-item{
  background:#fff;
  padding:16rpx 24rpx;
  border-radius:12rpx;
  font-size:26rpx;
  color:#333;
}
.time-tab{
  display:flex;
  gap:16rpx;
  margin-bottom:24rpx;
}
.time-tab-item{
  padding:12rpx 24rpx;
  background:#fff;
  border-radius:12rpx;
  font-size:26rpx;
}
.time-tab-item.active{
  background:#0066ff;
  color:#fff;
}
.list-tip{
  display:flex;
  justify-content:space-between;
  font-size:26rpx;
  color:#666;
  margin-bottom:20rpx;
}
.patient-item{
  background:#fff;
  border-radius:16rpx;
  padding:24rpx;
  display:flex;
  gap:20rpx;
  margin-bottom:20rpx;
  border-left:8rpx solid #4080ff;
}
.avatar-circle{
  width:80rpx;
  height:80rpx;
  border-radius:50%;
  background:#e8f0fe;
  color:#4080ff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:32rpx;
}
.content{
  flex:1;
}
.name-row{
  display:flex;
  align-items:center;
  gap:12rpx;
}
.name{
  font-size:32rpx;
  font-weight:500;
}
.gender{
  color:#666;
  font-size:26rpx;
}
.btn-chat{
  margin-left:auto;
  font-size:24rpx;
  color:#4080ff;
  border:1rpx solid #4080ff;
  padding:8rpx 16rpx;
  border-radius:8rpx;
}
.surgery-name{
  font-size:28rpx;
  color:#444;
  margin:8rpx 0;
}
.time-row{
  display:flex;
  justify-content:space-between;
  font-size:26rpx;
  color:#666;
}
.btn-archive{
  color:#4080ff;
}
</style>
