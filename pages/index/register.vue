<template>
  <view>
    <input v-model="phone" placeholder="手机号"/>
    <view>
      <input v-model="smsCode" placeholder="验证码"/>
      <button @click="sendCode" :disabled="countDown>0">{{countDown>0?countDown+'s':'获取验证码'}}</button>
    </view>
    <input v-model="password" placeholder="设置密码" password/>
    <button @click="handleRegister">注册</button>
  </view>
</template>
<script>

export default {
  data(){
    return{
      phone:'',
      smsCode:'',
      password:'',
      countDown:0
    }
  },
  methods:{
   
    async handleRegister(){
     
      uni.showToast({title:'注册成功，请登录'})
      uni.navigateBack()
    }
  }
}
</script>
