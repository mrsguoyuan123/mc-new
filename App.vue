<script>
export default {
	onLaunch() {
	this.$store.dispatch('initSystemInfo')
	}

  // onLaunch() {
  //   uni.addInterceptor('navigateTo',{
  //     invoke(e){
  //       const token = uni.getStorageSync('token')
  //       if(!token && !e.url.includes('/login') && !e.url.includes('/register')){
		// 	setTimeout(()=>{
		// 	      uni.reLaunch({url:'/pages/index/login'})
		// 	    },300)
  //         return false
  //       }
  //     }
  //   })
  // }
}
</script>


<style lang="scss">
/* uview2样式放最前面 */
@import "@/uni_modules/uview-ui/index.scss";
@import "@/static/css/index.css";
@import "@/static/css/iconfont.css";
</style>
