<template>
	<view>
		
	</view>
</template>

<script>


export default {
  data() {
    return {
      profile: {},
      healthManagerInfo: null,
      medicalRecordList: [],
      ocrTaskId: ''
    }
  },
  methods: {
    // 获取个人信息
    async fetchProfile() {
      const res = await getMeProfile()
      this.profile = res.data
    },
    // 修改个人信息
    async updateProfile() {
      await putMeProfile({
        area: '',
        hospital: '',
        department: '',
        operationName: '',
        doctorName: ''
      })
    },
    // 获取健康管家
    async fetchHealthManager() {
      const res = await getMeHealthManager()
      this.healthManagerInfo = res.data
    },
    // 获取病历
    async fetchMedicalRecord() {
      const res = await getMeMedicalRecord()
      this.medicalRecordList = res.data
    },

    // 选择图片，上传做OCR识别
    async scanMedical() {
      // 选择相册图片
      uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async (imgRes) => {
          const filePath = imgRes.tempFilePaths[0]
          const res = await postMeMedicalRecordScan(filePath)
          this.ocrTaskId = res.data.taskId
          // 轮询查询OCR结果
          this.pollOcrResult(this.ocrTaskId)
        }
      })
    },

    // 轮询OCR识别结果
    async pollOcrResult(taskId) {
      const timer = setInterval(async () => {
        const res = await getMeMedicalRecordScanResult(taskId)
        // 根据后端状态判断是否识别完成
        if (res.data && res.data.status === 'done') {
          clearInterval(timer)
          // 确认回填病历
          await postMeMedicalRecordConfirm(res.data)
          uni.showToast({ title: '病历识别完成' })
        }
      }, 1500)
    }
  }
}
</script>


<style>

</style>