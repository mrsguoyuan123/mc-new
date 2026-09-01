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
import {authSmsCode,authRegister} from '@/api/auth'
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
    async sendCode(){
      await authSmsCode({phone:this.phone})
      this.countDown = 60
      const timer = setInterval(()=>{
        this.countDown--
        if(this.countDown<=0) clearInterval(timer)
      },1000)
    },
    async handleRegister(){
      await authRegister({
        phone:this.phone,
        code:this.smsCode,
        password:this.password
      })
      uni.showToast({title:'注册成功，请登录'})
      uni.navigateBack()
    }
  }
}
</script>
