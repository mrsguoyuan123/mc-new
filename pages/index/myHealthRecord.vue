<template>
    <view class="page">
        <!-- 1.基本信息 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('info')">
                <view class="panel-title">1. 基本信息</view>
                <view class="tag-sync">权威同步</view>
                <view class="arrow" :class="{ rotate: show.info }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.info">
                <view class="sub-title">患者身份档案 <span class="source">权威来源:HIS身份中心</span></view>
                <view class="grid-row">
                    <view class="grid-item">
                        <view class="label">患者姓名</view>
                        <view class="value">{{ basicInfo.name }}</view>
                    </view>
                    <view class="grid-item">
                        <view class="label">性别</view>
                        <view class="value">{{ basicInfo.gender }}</view>
                    </view>
                </view>
                <view class="grid-row">
                    <view class="grid-item">
                        <view class="label">年龄/出生日期</view>
                        <view class="value">{{ basicInfo.age }}岁</view>
                    </view>
                    <view class="grid-item">
                        <view class="label">联系方式</view>
                        <view class="value">{{ basicInfo.phone }}</view>
                    </view>
                </view>
                <view class="grid-row">
                    <view class="grid-item">
                        <view class="label">住院号/就诊号</view>
                        <view class="value blue-text">{{ basicInfo.hospitalNo }}</view>
                    </view>
                    <view class="grid-item">
                        <view class="label">就诊医院</view>
                        <view class="value">{{ basicInfo.hospitalName }}</view>
                    </view>
                </view>

                <view class="sub-title mt20">诊断与手术明细 <span class="source">临床查阅权威一致</span></view>
                <view class="info-card blue-bg">
                    <view class="label">主要诊断 <span class="source">来源:出院小结记录</span></view>
                    <view class="value">{{ basicInfo.mainDiagnosis }}</view>
                </view>
                <view class="grid-row">
                    <view class="grid-item">
                        <view class="label">手术类型</view>
                        <view class="value">{{ basicInfo.surgeryType }}</view>
                    </view>
                    <view class="grid-item">
                        <view class="label">手术时间</view>
                        <view class="value">{{ basicInfo.surgeryDate }}</view>
                    </view>
                </view>
                <view class="grid-row">
                    <view class="grid-item">
                        <view class="label">主刀/主管医生</view>
                        <view class="value">{{ basicInfo.doctorName }}</view>
                    </view>
                    <view class="grid-item"></view>
                </view>

                <view class="info-item">
                    <view class="label">既往病史</view>
                    <view class="value">{{ basicInfo.medicalRecord.history }}</view>
                </view>
                <view class="info-item">
                    <view class="label">既往手术史</view>
                    <view class="value">{{ basicInfo.medicalRecord.surgeryHistory }}</view>
                </view>
            </view>
        </view>

        <!-- 2.附件资料库 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('file')">
                <view class="panel-title">2. 附件资料库</view>
                <view class="tag-sync">5份</view>
                <view class="arrow" :class="{ rotate: show.file }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.file">
                <view class="tabs">
                    <view class="tab-item" :class="{ active: fileTab === 'all' }" @click="fileTab = 'all'">全部</view>
                    <view class="tab-item" :class="{ active: fileTab === 'check' }" @click="fileTab = 'check'">检查报告</view>
                    <view class="tab-item" :class="{ active: fileTab === 'image' }" @click="fileTab = 'image'">影像资料</view>
                    <view class="tab-item" :class="{ active: fileTab === 'path' }" @click="fileTab = 'path'">病理资料</view>
                    <view class="tab-item" :class="{ active: fileTab === 'diet' }" @click="fileTab = 'diet'">饮食记录</view>
                </view>
                <view class="file-list">
                    <view class="file-item" v-for="(f, idx) in fileList" :key="idx">
                        <view class="file-icon">📄</view>
                        <view class="file-info">
                            <view class="file-name">{{ f.name }}</view>
                            <view class="file-desc">{{ f.type }} · {{ f.time }} · {{ f.author }}</view>
                        </view>
                        <view class="file-actions">
                            <view class="btn-view" @click="viewFile(f)">查看</view>
                            <view class="btn-down">↓</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 3.饮食分析 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('diet')">
                <view class="panel-title">3. 饮食分析</view>
                <view class="arrow" :class="{ rotate: show.diet }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.diet">
                <view class="tip-card">
                    <view class="tip-top">最近一次记录：{{ diet.latest.date }} 
                       
                    </view>
                    <view class="tip-text">食物内容：{{ diet.latest.food }}</view>
                    <view class="index-row">
                        <view class="index-item">
                            <view class="num orange">{{ diet.latest.calories }}</view>
                            <view class="name">总热量 kcal</view>
                        </view>
                        <view class="index-item">
                            <view class="num blue">{{ diet.latest.protein }}</view>
                            <view class="name">蛋白质 g</view>
                        </view>
                        <view class="index-item">
                            <view class="num green">{{ diet.latest.fat }}</view>
                            <view class="name">脂肪 g</view>
                        </view>
                        <view class="index-item">
                            <view class="num purple">{{ diet.latest.vitamin }}</view>
                            <view class="name">维生素 %</view>
                        </view>
                    </view>
                </view>
                <view class="chart-wrap">
                    <view class="chart-title">7天内饮食变化趋势
                        <view class="chart-tab">
                            <span class="chart-tab-item active">热量</span>
                            <span class="chart-tab-item">蛋白质</span>
                            <span class="chart-tab-item">脂肪</span>
                            <span class="chart-tab-item">维生素</span>
                        </view>
                    </view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>
            </view>
        </view>

        <!-- 4.运动分析 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('exercise')">
                <view class="panel-title">4. 运动分析</view>
                <view class="arrow" :class="{ rotate: show.exercise }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.exercise">
                <view class="tip-card green-card">
                    <view class="tip-top">最近一次记录：{{ exercise.latest.date }} <span class="tag-green">按时达标</span></view>
                    <view class="tip-text">运动类型：{{ exercise.latest.type }}</view>
                    <view class="index-row">
                        <view class="index-item">
                            <view class="num">{{ exercise.latest.items[0].type }}</view>
                            <view class="name">运动类型</view>
                        </view>
                        <view class="index-item">
                            <view class="num">{{ exercise.latest.durationMin }}</view>
                            <view class="name">单次时长</view>
                        </view>
                        <view class="index-item">
                            <view class="num blue">{{ exercise.latest.rpe }}</view>
                            <view class="name">RPE疲劳评分</view>
                        </view>
                      
                    </view>
                </view>
                <view class="chart-wrap">
                    <view class="chart-title">7天内目标与实际RPE趋势</view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>
            </view>
        </view>

        <!-- 5.体重动态 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('weight')">
                <view class="panel-title">5. 体重动态</view>
                <view class="arrow" :class="{ rotate: show.weight }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.weight">
                <view class="tip-card purple-card">
                    <view class="tip-top">最近记录：{{ weight.latest.date }}
                        <span class="tag-green">{{ weight.latest.desc }}</span>
                    </view>
                    <view class="big-num">{{ weight.latest.weight }} <text class="unit">kg</text></view>
                </view>
                <view class="chart-wrap">
                    <view class="chart-title">7天内体重趋势</view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>
            </view>
        </view>

        <!-- 6.血糖与血压 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('bp')">
                <view class="panel-title">6. 血糖与血压</view>
                <view class="arrow" :class="{ rotate: show.bp }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.bp">
                <view class="sub-tab">
                    <view class="sub-tab-item active">血糖监测</view>
                    <view class="sub-tab-item">血压监测</view>
                </view>
                <view class="tip-card red-card">
                    <view class="tip-top">最近空腹血糖({{ bloodGlucosePressure.glucose.latest.date }})
                        <span class="tag-green">{{ bloodGlucosePressure.glucose.latest.status }}</span>
                    </view>
                    <view class="big-num">{{ bloodGlucosePressure.glucose.latest.value }} <text class="unit">mmol/L</text></view>
                    <view class="range">正常范围：{{ bloodGlucosePressure.glucose.latest.range }}</view>
                </view>
                <view class="tip-card red-card">
                    <view class="tip-top">最近血压记录({{ bloodGlucosePressure.bloodPressure.latest.date }})
                        <span class="tag-green">{{ bloodGlucosePressure.bloodPressure.latest.status }}</span>
                    </view>
                    <view class="big-num">{{ bloodGlucosePressure.bloodPressure.latest.sbp }}/ {{ bloodGlucosePressure.bloodPressure.latest.dbp }} <text class="unit">mmHg</text></view>
                    <view class="range">正常范围：{{ bloodGlucosePressure.bloodPressure.latest.standard }}</view>
                </view>
                <view class="chart-wrap">
                    <view class="chart-title">血糖趋势</view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>
            </view>
        </view>

        <!-- 7.肿瘤标志物 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('tumor')">
                <view class="panel-title">7. 肿瘤标志物</view>
                <view class="arrow" :class="{ rotate: show.tumor }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.tumor">
                <view class="index-row"  >
                    <view class="index-item" v-for="(item,index) in tumorMarkers.latestCards" key="index">
                        <view class="name">{{ item.name }}</view>
                        <view class="num">{{ item.value }}</view>

                        <view class="name">{{ item.unit }}</view>
                        <view class="name">参考{{ item.referenceRange }}</view>

                        <!-- <view class="down-rate">-{{ item.rate.CEA }}%</view> -->
                    </view>
                  
                </view>
                <view class="chart-wrap">
                    <view class="chart-title">30天 CEA & CA199趋势</view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>

                
            </view>
        </view>

        <!-- 8.血常规 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('blood')" >
                
                <view class="panel-title">8. 血常规</view>
                <view class="arrow" :class="{ rotate: show.blood }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.blood">
                <view  class="index-row"  v-for="(item,index) in bloodRoutine.latestCards" key="index">
                        <view class="name">{{ item.name }}</view>
                        <view class="num">{{ item.value }}</view>

                        <view class="name">{{ item.unit }}</view>
                        <view class="name">参考{{ item.referenceRange }}</view>

                </view>
             
                <view class="chart-wrap">
                    <view class="chart-title">30天血红蛋白回升趋势</view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>
            </view>
        </view>

        <!-- 9.肝功能/白蛋白营养 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('liver')">
                <view class="panel-title">9. 肝功能/白蛋白营养</view>
                <view class="arrow" :class="{ rotate: show.liver }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.liver">
                  <view  class="index-row"  v-for="(item,index) in liverNutrition.latestCards" key="index">
                        <view class="name">{{ item.name }}</view>
                        <view class="num">{{ item.value }}</view>

                        <view class="name">{{ item.unit }}</view>
                        <view class="name">参考{{ item.referenceRange }}</view>

                </view>
                <view class="chart-wrap">
                    <view class="chart-title">30天白蛋白(ALB)营养恢复趋势</view>
                    <view class="chart-box">【图表占位 - 接入uCharts折线图】</view>
                </view>
            </view>
        </view>

        <!-- 10.其他附件查阅 -->
        <view class="collapse-panel">
            <view class="panel-header" @click="toggle('otherFile')">
                <view class="panel-title">10. 其他附件查阅</view>
                <view class="arrow" :class="{ rotate: show.otherFile }">⌄</view>
            </view>
            <view class="panel-body" v-if="show.otherFile">
                <view class="file-list">
                    <view class="file-item" v-for="(f, idx) in otherAttachments" :key="idx">
                        <view class="file-icon">📋</view>
                        <view class="file-info">
                            <view class="file-name">{{ f.name }}</view>
                        </view>
                        <view class="file-actions">
                            <view class="btn-view">查看</view>
                            <view class="btn-down">↓</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <myTabbar :current="1"></myTabbar>

    </view>
</template>

<script>
import myTabbar from "@/components/myTabbar";

import { getDoctorPatientsByIdArchiveApi, getDoctorPatientsByIdConversationApi, postDoctorPatientsByIdAttachmentsApi, deleteDoctorPatientsByIdAttachmentsByAttIdApi } from '@/api/frontApikit.js'

export default {
    components: {
        myTabbar
    },
    data() {
        return {
            show: {
                info: true,
                file: true,
                diet: true,
                exercise: true,
                weight: true,
                bp: true,
                tumor: true,
                blood: true,
                liver: true,
                otherFile: true
            },
            fileTab: 'all',
            
            fileList: [
                { name: '入院手术记录及吻合口检查单.pdf', type: '病理资料', time: '2026-04-18 14:20', author: '李医生(主刀)' },
                { name: '全腹部增强CT平扫影像报告.png', type: '影像资料', time: '2026-04-17 09:10', author: '放射科高副主任' },
                { name: '术后血生化全套与血常规化验单.pdf', type: '检查报告', time: '2026-04-19 08:30', author: '检验科' },
                { name: '术后第2天早午餐膳食日志照片.jpg', type: '饮食记录', time: '2026-04-19 12:45', author: '陪诊师(王小磊)' },
                { name: '踝泵运动与床边站立训练记录.mp4', type: '运动记录', time: '2026-04-18 16:00', author: '陪诊师(陈陪诊)' }
            ],
          
         
          
           
          
            liver: {
                latest: { albumin: 38.5, alt: 32, pa: 248 }
            },
            basicInfo: {},
            diet: {},
            exercise: {},
            weight: {},
            bloodGlucosePressure: {},
            tumorMarkers: {},
            bloodRoutine: {},
            liverNutrition: {},
            otherAttachments: {},
        }
    },
    onLoad() {

        this.getDoctorPatientsByIdArchive()
        this.postDoctorPatientsByIdAttachments()
    },
    methods: {
        async getDoctorPatientsByIdArchive(id) {
            const res = await getDoctorPatientsByIdArchiveApi({ id: 501 })
            this.basicInfo = res.basicInfo          
            this.bloodGlucosePressure = res.bloodGlucosePressure
            this.bloodRoutine = res.bloodRoutine
            this.diet = res.diet
            this.exercise = res.exercise
            this.liverNutrition = res.liverNutrition
            this.otherAttachments = res.otherAttachments
            this.tumorMarkers = res.tumorMarkers
            this.weight = res.weight


          


        },
         async postDoctorPatientsByIdAttachments(id) {
            const res = await postDoctorPatientsByIdAttachmentsApi({ id: 501 })
         

            console.log(111111111111,  res)


        },
         toggle(key) {
        this.show[key] = !this.show[key]
    },
    viewFile(item) {
        uni.showToast({ title: '打开:' + item.name })
    }
        
    },
   

}
</script>

<style scoped>
page {
    background-color: #f6f7fb;
}

.page {
    padding: 20rpx;
}

.collapse-panel {
    background-color: #fff;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
}

.panel-header {
    display: flex;
    align-items: center;
    padding: 24rpx;
}

.panel-title {
    font-size: 32rpx;
    font-weight: 500;
}

.tag-sync {
    background-color: #e8f0fe;
    color: #3671c9;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    margin-left: 12rpx;
}

.arrow {
    margin-left: auto;
    font-size: 28rpx;
    color: #999;
    transition: transform 0.3s;
}

.arrow.rotate {
    transform: rotate(180deg);
}

.panel-body {
    padding: 0 24rpx 24rpx;
}

.sub-title {
    font-size: 28rpx;
    margin: 16rpx 0;
}

.source {
    font-size: 22rpx;
    color: #999;
}

.grid-row {
    display: flex;
    margin-bottom: 16rpx;
}

.grid-item {
    width: 50%;
}

.label {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 6rpx;
}

.value {
    font-size: 28rpx;
}

.blue-text {
    color: #3671c9;
}

.info-card {
    padding: 16rpx;
    border-radius: 12rpx;
    margin: 12rpx 0;
}

.blue-bg {
    background-color: #f0f7ff;
}

.info-item {
    margin: 12rpx 0;
}

.mt20 {
    margin-top: 20rpx;
}

.tabs {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;
}

.tab-item {
    padding: 8rpx 16rpx;
    border-radius: 12rpx;
    background: #f3f4f6;
    font-size: 26rpx;
}

.tab-item.active {
    background: #3671c9;
    color: #fff;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1px solid #eee;
}

.file-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
}

.file-info {
    flex: 1;
}

.file-name {
    font-size: 28rpx;
}

.file-desc {
    font-size: 24rpx;
    color: #999;
    margin-top: 4rpx;
}

.file-actions {
    display: flex;
    gap: 16rpx;
}

.btn-view {
    color: #3671c9;
    font-size: 26rpx;
}

.btn-down {
    font-size: 26rpx;
    color: #666;
}

.tip-card {
    padding: 20rpx;
    border-radius: 16rpx;
    background-color: #fff9e8;
    margin-bottom: 20rpx;
}

.green-card {
    background-color: #edf9f0;
}

.purple-card {
    background-color: #f7f0fc;
}

.red-card {
    background-color: #fff0f0;
}

.tip-top {
    font-size: 26rpx;
    margin-bottom: 12rpx;
}

.tag-yellow {
    background: #ffe8b0;
    padding: 4rpx 10rpx;
    border-radius: 8rpx;
    font-size: 22rpx;
}

.tag-green {
    background: #b9efc9;
    padding: 4rpx 10rpx;
    border-radius: 8rpx;
    font-size: 22rpx;
}

.tip-text {
    font-size: 26rpx;
    color: #444;
    margin-bottom: 16rpx;
}

.index-row {
    display: flex;
    justify-content: space-between;
}

.index-item {
    text-align: center;
    flex: 1;
}

.num {
    font-size: 32rpx;
    font-weight: 500;
}

.num.orange {
    color: #ff7d00;
}

.num.blue {
    color: #3671c9;
}

.num.green {
    color: #28a745;
}

.num.purple {
    color: #9c27b0;
}

.name {
    font-size: 24rpx;
    color: #666;
    margin-top: 6rpx;
}

.down-rate {
    font-size: 24rpx;
    color: #28a745;
}

.chart-wrap {
    margin-bottom: 16rpx;
}

.chart-title {
    font-size: 28rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.chart-tab-item {
    font-size: 24rpx;
    color: #999;
    margin-left: 8rpx;
}

.chart-tab-item.active {
    color: #333;
}

.chart-box {
    height: 240rpx;
    background: #f7f8fa;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #999;
}

.big-num {
    font-size: 48rpx;
    font-weight: 500;
}

.unit {
    font-size: 28rpx;
    color: #666;
}

.range {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
}

.sub-tab {
    display: flex;
    background: #f3f4f6;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
}

.sub-tab-item {
    flex: 1;
    text-align: center;
    padding: 10rpx;
    font-size: 26rpx;
}

.sub-tab-item.active {
    background: #fff;
    border-radius: 12rpx;
    color: #3671c9;
}
</style>
