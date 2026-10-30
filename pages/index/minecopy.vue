<template>
	<view>
        <myTabbar :current="2"></myTabbar>
		
	</view>
</template>

<script>
import myTabbar from "@/components/myTabbar";

import { getDoctorProfileApi, getDoctorPatientsByIdConversationApi, postDoctorPatientsByIdAttachmentsApi, deleteDoctorPatientsByIdAttachmentsByAttIdApi } from '@/api/frontApikit.js'

	export default {
		  components: {
        myTabbar
    },
		data() {
			return {
				
			}
		},
		   onLoad() {

        this.getDoctorProfile()
      
    },
    methods: {
        async getDoctorProfile(id) {
            const res = await getDoctorProfileApi({ id: 501 })
            

            console.log(111111111111,  res)
          


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

<style>

</style>