<template>
    <view>
        <view
                class="my-card radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
                <view class="view-icon badge-blue-bg badge-circle margin-bottom-2">
                    <u-icon name="camera" color="#155DFC" size="80rpx"></u-icon>
                </view>
                <view>

                    <view class="view-text">
                        <view class="view-text1 font-l margin-bottom-2 text-center ">
                            上传今日膳食照片
                        </view>
                        <view class="view-text2 font-info font-s margin-bottom-2 text-center ">
                            实时拍照分析食物营养与食物含量分析
                        </view>
                    </view>

                </view>
                <view class="margin-top-1">
                    <u-button style="padding: 0 40px;" color="#155DFC" type="primary" text="立即拍照/上传"
                        shape="circle" @click="chooseMealImage" :loading="analyzing"></u-button>
                </view>

        </view>

        <view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between u-flex-column ">
            <view class="header-text">
                <view class="header-icon ">
                    <view class="header-name font-bold font-m">
                        饮食分析报告
                    </view>
					<view class=" font-bold font-s ml-16 font-info" v-show="analysisSource == 'MOCK'">
                        （示例分析）
                    </view>
                </view>
                <view class="font-green font-s font-bold">
                    今日累计
                </view>
            </view>
            <view class="float-wrapper">
                <view class="u-float-left u-width-50">
                    <view class="font-s font-info margin-bottom-5">总热量</view>
                    <view class="u-flex  column-center">
                        <view class="font-l font-bold  margin-right-5">{{ hasResult ? analysis.calories : '--' }}</view>
                        <view class="font-s font-info  ">kal</view>
                    </view>
                </view>
                <view class="u-float-left u-width-50">
                    <view class="font-s font-info margin-bottom-5">蛋白质</view>
                    <view class="u-flex  column-center">
                        <view class="font-l font-bold  margin-right-5">{{ hasResult ? analysis.protein : '--' }}</view>
                        <view class="font-s font-info  ">g</view>
                    </view>
                </view>
            </view>
            <view class="radius-15 bg-gray gray-content">
                <view class="font-bold font-s margin-bottom-1">营养占比分析</view>
                <view class="u-flex  space-between u-badge">
                    <view class="badge-blue-bg radius-1 padding-10">
                        <view class="font-l font-bold">{{ hasResult ? analysis.protein : '--' }}</view>
                        <view class="font-s font-info">蛋白质（g)</view>
                    </view>
                    <view class="badge-orange-bg radius-1 padding-10">
                        <view class="font-l font-bold">{{ hasResult ? analysis.carb : '--' }}</view>
                        <view class="font-s font-info">碳水（g)</view>
                    </view>
                    <view class="badge-green-bg radius-1 padding-10">
                        <view class="font-l font-bold">{{ hasResult ? analysis.fat : '--' }}</view>
                        <view class="font-s font-info">脂肪(g)</view>
                    </view>
                </view>
                <view class="radius-1 bg-white margin-top-1 padding-1">
                    <view class="float-wrapper ">
                        <text class="custom-icon custom-icon-trending-up icon-bold"
                            style="font-size:20rpx;color:#00a63e;"></text>

                        <text class=" font-green font-s margin-left-5">
                            医学专业评估：
                        </text>
                        <view class="font-info  font-s margin-top-10">
                            {{ hasResult ? analysis.assessment : '暂无评估，上传照片后自动生成' }}
                        </view>
                    </view>

                </view>
                <view class="radius-1 bg-white margin-top-1 padding-1 border-blue bg-linear-blue">
                    <view class="u-flex space-start">
                        <u-icon name="checkmark-circle" color="#155DFC" :bold="true" size="20rpx"></u-icon>
                        <text class=" font-bold font-s margin-left-5">
                            本周饮食汇总
                        </text>
                    </view>
                    <view class="  font-s margin-top-10">
                        {{ hasResult ? `维生素评级：${analysis.vitamin}` : '上传照片生成本周饮食建议' }}
                    </view>
                    <view class="font-blue font-s margin-top-10 font-bold">
                        查看详细报告 →
                    </view>
                </view>

            </view>
        </view>
    </view>
</template>

<script>
    import {
        postFilesUploadApi,
        postMeNutritionAnalyzeApi
    } from '@/api/frontApikit.js'
    export default {
        data() {
            return {
                localImage: '',
                remoteFileId: '',
                analyzing: false,
                hasResult: false,
                analysis: null,
                requestId: '',
                metricList: [],
				analysisSource:''
            }
        },
        methods: {
            chooseMealImage() {
                if (this.analyzing) return
                uni.chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera'],
                    success: (res) => {
                        const filePaths = res.tempFilePaths || []
                        if (!filePaths.length) {
                            this.showError('未获取到餐食照片')
                            return
                        }
                        this.uploadAndAnalyze(filePaths[0])
                    },
                    fail: (err) => {
                        if (err && /cancel/i.test(String(err.errMsg || ''))) return
                        this.showError('选择照片失败，请检查相机或相册权限')
                    }
                })
            },
            async uploadAndAnalyze(filePath) {
                if (!filePath || this.analyzing) return
                this.localImage = filePath
                this.remoteFileId = ''
                this.analysis = null
                this.hasResult = false
                this.metricList = []
                this.requestId = 'meal_' + Date.now() + '_' + Math.random().toString(16).slice(2)
                this.analyzing = true
                uni.showLoading({ title: '上传照片中...', mask: true })
                try {
                    const uploadResult = await postFilesUploadApi({
                        filePath,
                        name: 'file',
                        dir: 'meal'
                    })
                    const fileId = this.extractFileId(uploadResult)
                    if (!fileId) throw new Error('文件标识解析失败')
                    this.remoteFileId = fileId

                    uni.showLoading({ title: '营养分析中...', mask: true })
                    const result = await postMeNutritionAnalyzeApi({
                        imageUrls: [fileId],
                        requestId: this.requestId
                    })
                    
                    if (result) {
                        this.fillAnalysis(result)
                        uni.showToast({ title: '分析完成', icon: 'success' })
                    } else {
                        throw new Error('接口返回数据为空')
                    }
                } catch (err) {
                    console.log('餐食营养分析失败：', err)
                    this.showError((err && err.message) || '餐食分析失败，请稍后重试')
                } finally {
                    this.analyzing = false
                    uni.hideLoading()
                }
            },
            extractFileId(result) {
                if (!result) return ''
                if (typeof result === 'string') return result.trim()
                if (Array.isArray(result)) {
                    for (let i = 0; i < result.length; i += 1) {
                        const id = this.extractFileId(result[i])
                        if (id) return id
                    }
                    return ''
                }
                const keys = ['fileId', 'id', 'url', 'fileUrl', 'imageUrl', 'path', 'filePath', 'filename', 'fileName']
                for (let i = 0; i < keys.length; i += 1) {
                    const value = result[keys[i]]
                    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim()
                }
                if (result.data) return this.extractFileId(result.data)
                if (result.file && typeof result.file === 'object') return this.extractFileId(result.file)
                return ''
            },
            fillAnalysis(data) {
                this.analysis = {
                    recordId: data.recordId || '',
                    recordDate: data.recordDate || '',
                    calories: this.toNumber(data.calories),
                    protein: this.toNumber(data.protein),
                    fat: this.toNumber(data.fat),
                    carb: this.toNumber(data.carb),
                    vitamin: data.vitamin || '无',
                    assessment: data.assessment || '暂无评估建议，请结合临床医生意见调整饮食。',
                    analysisSource: data.analysisSource || '',
					

                }
				this.analysisSource = this.analysis.analysisSource
                this.metricList = [{
                    label: '蛋白质',
                    value: this.analysis.protein,
                    unit: 'g',
                    type: 'protein'
                }, {
                    label: '脂肪',
                    value: this.analysis.fat,
                    unit: 'g',
                    type: 'fat'
                }, {
                    label: '碳水化合物',
                    value: this.analysis.carb,
                    unit: 'g',
                    type: 'carb'
                }]
                this.hasResult = true
            },
            toNumber(value) {
                const number = Number(value)
                return Number.isFinite(number) ? Number(number.toFixed(1)) : 0
            },
            previewImage() {
                if (!this.localImage || this.analyzing) return
                uni.previewImage({
                    current: this.localImage,
                    urls: [this.localImage]
                })
            },
            showError(title) {
                uni.showToast({ title, icon: 'none', duration: 2400 })
            }
        }
    }
</script>

<style scoped>
.meal-page {
    min-height: 100vh;
    padding: 24rpx 24rpx calc(36rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(36rpx + env(safe-area-inset-bottom));
    background: #f5f8fb;
    box-sizing: border-box;
}

.medical-card {
    background: #ffffff;
    border-radius: 24rpx;
    border: 1rpx solid #e6edf3;
    box-shadow: 0 12rpx 36rpx rgba(31, 58, 88, 0.06);
    box-sizing: border-box;
}

.upload-card {
    padding: 34rpx 30rpx 36rpx;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 34rpx;
    font-weight: 700;
    color: #172033;
    line-height: 48rpx;
}

.title-icon {
    width: 10rpx;
    height: 34rpx;
    margin-right: 16rpx;
    border-radius: 8rpx;
    background: #1567d8;
}

.section-desc {
    margin: 12rpx 0 28rpx 26rpx;
    color: #7b8794;
    font-size: 25rpx;
    line-height: 38rpx;
}

.photo-picker {
    position: relative;
    height: 360rpx;
    border-radius: 22rpx;
    overflow: hidden;
    background: linear-gradient(180deg, #f0f7ff 0%, #f7fbff 100%);
    border: 2rpx dashed #b9d4f4;
}

.photo-picker.has-image {
    border-style: solid;
    border-color: #cfe2f8;
}

.meal-image {
    width: 100%;
    height: 100%;
    display: block;
}

.upload-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #536274;
}

.upload-icon {
    width: 96rpx;
    height: 96rpx;
    margin-bottom: 18rpx;
    border-radius: 28rpx;
    background: #e7f1ff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-main-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.upload-sub-text {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #8a97a8;
}

.image-mask {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 18rpx 22rpx;
    background: rgba(15, 35, 58, 0.58);
    color: #ffffff;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}

.primary-button {
    margin-top: 28rpx;
    height: 88rpx;
    border-radius: 44rpx;
    background: #1567d8;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 88rpx;
}

.primary-button::after {
    border: none;
}

.primary-button[disabled] {
    background: #94b8e8;
    color: rgba(255, 255, 255, 0.9);
}

.report-card {
    margin-top: 24rpx;
    padding: 32rpx 28rpx 34rpx;
}

.report-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28rpx;
}

.report-name {
    font-size: 32rpx;
    font-weight: 700;
    color: #172033;
}

.report-date {
    margin-top: 8rpx;
    font-size: 23rpx;
    color: #93a0af;
}

.status-tag {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    line-height: 32rpx;
}

.status-tag.ready {
    background: #e8f7f1;
    color: #0b9f6e;
}

.status-tag.mock {
    background: #fff5e6;
    color: #d78618;
}

.status-tag.waiting {
    background: #edf2f7;
    color: #7b8794;
}

.summary-grid {
    display: flex;
    gap: 18rpx;
}

.summary-item {
    flex: 1;
    padding: 26rpx 12rpx;
    border-radius: 20rpx;
    text-align: center;
    background: #f4f8fc;
}

.summary-item.calorie {
    background: #eaf3ff;
}

.summary-value {
    font-size: 42rpx;
    font-weight: 700;
    color: #155dfc;
    line-height: 54rpx;
}

.summary-unit {
    margin-left: 4rpx;
    font-size: 22rpx;
    font-weight: 400;
    color: #7b8794;
}

.summary-label {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #6b7788;
}

.nutrition-grid {
    display: flex;
    gap: 16rpx;
    margin-top: 18rpx;
}

.nutrition-item {
    flex: 1;
    padding: 22rpx 8rpx;
    border-radius: 18rpx;
    text-align: center;
    background: #f7f9fc;
}

.nutrition-item.protein {
    background: #eef5ff;
}

.nutrition-item.fat {
    background: #fff5ec;
}

.nutrition-item.carb {
    background: #eefaf5;
}

.nutrition-number {
    font-size: 34rpx;
    font-weight: 700;
    color: #253247;
    line-height: 46rpx;
}

.nutrition-unit {
    margin-left: 3rpx;
    font-size: 20rpx;
    font-weight: 400;
    color: #8a97a8;
}

.nutrition-label {
    margin-top: 6rpx;
    font-size: 23rpx;
    color: #738092;
}

.info-panel {
    margin-top: 20rpx;
    padding: 24rpx;
    border-radius: 18rpx;
    background: #f7fafc;
}

.info-title {
    margin-bottom: 12rpx;
    font-size: 27rpx;
    font-weight: 700;
    color: #263447;
}

.info-text {
    font-size: 25rpx;
    color: #536274;
    line-height: 42rpx;
}

.assessment-panel {
    margin-top: 18rpx;
    padding: 24rpx;
    border-radius: 18rpx;
    background: #f0f8ff;
    border-left: 6rpx solid #1567d8;
}

.assessment-title {
    margin-bottom: 10rpx;
    font-size: 27rpx;
    font-weight: 700;
    color: #155dfc;
}

.assessment-text {
    font-size: 25rpx;
    color: #425466;
    line-height: 42rpx;
}

.empty-report {
    padding: 46rpx 20rpx;
    border-radius: 18rpx;
    background: #f7fafc;
    text-align: center;
}

.empty-text {
    margin-top: 14rpx;
    font-size: 26rpx;
    color: #8a97a8;
}

.disclaimer {
    margin-top: 20rpx;
    font-size: 22rpx;
    color: #9aa5b3;
    line-height: 34rpx;
    text-align: center;
}
.header-text{
	width:100%
}
.u-badge {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 10px;
}
.u-badge > view {
  flex: 1;
  margin: 0;
}
.float-wrapper  .font-info {
	line-height: 1.5;
}
</style>
