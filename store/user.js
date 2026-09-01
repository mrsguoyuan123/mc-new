import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  const userInfo = ref(null)

  // 修改方法
  const setToken = (val) => {
    token.value = val
  }
  const setUserInfo = (info) => {
    userInfo.value = info
  }
  const logout = () => {
    token.value = ''
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout
  }
}, {
  persist: true //开启持久化，自动存uni.storage，刷新页面不丢失
})
