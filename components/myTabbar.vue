<template>
  <view class="my-tabbar">
    <u-tabbar
      :value="activeIndex"
      :placeholder="false"
      :fixed="true"
      activeColor="rgb(21, 93, 252)"
      inactiveColor="#72758b"
    >
      <u-tabbar-item
        v-for="item in tabList"
        :key="item.pagePath"
        :text="item.text"
        :icon="item.icon"
        :badge="item.badge"
        @click="handleTabClick(item)"
      ></u-tabbar-item>
    </u-tabbar>
  </view>
</template>

<script>
import {
  getMeConversationsApi as fetchConversationsApi,
} from '@/api/frontApikit.js'
export default {
  name: 'myTabbar',
  data() {
    return {
      tabList: [],
      conversationList: [],
      totalUnread: 0,
    }
  },
  computed: {
    userInfo() {
      return this.readCurrentUser()
    },
    role() {
      return this.userInfo.role || ''
    },
    activeIndex() {
      const path = this.$route.path
      const idx = this.tabList.findIndex(item => item.pagePath === path)
      return idx >= 0 ? idx : 0
    }
  },
  watch: {
    role: {
      handler() {
        console.log('【watch role】', this.role)
        this.buildTabList()
      },
      immediate: true
    },
    totalUnread: {
      handler(val) {
   //     console.log('【watch totalUnread】新值=', val)
        this.buildTabList()
      },
      immediate: true
    }
  },
  created() {
  //  console.log('【created】开始请求消息')
    if(this.role == 'PATIENT'){
    this.loadConversations()

    }
  },
  methods: {
    async loadConversations() {
      try {
        const result = await fetchConversationsApi()
        const data = result || {}
        const conversationList = this.normalizeConversations(data.conversations || [])
        const systemNotificationList = this.normalizeNotifications(data.systemNotifications || [])
        const allMessageList = conversationList.concat(systemNotificationList)

        let total = 0
        allMessageList.forEach(item => {
          total += Number(item.unreadCount || 0)
        })
     //   console.log('【接口返回计算 total】', total)
        this.totalUnread = total

      } catch (e) {
     //   console.error('拉取消息失败', e)
      } finally {
        uni.hideLoading()
      }
    },
    normalizeConversations(list) {
      return (list || []).map(item => {
        const unreadCount = Number(item.unread || 0)
        return {
          unreadCount: unreadCount,
        }
      })
    },
    normalizeNotifications(list) {
      return (list || []).map(item => {
        const unreadCount = item.isRead ? 0 : 1
        return {
          unreadCount: unreadCount,
          isRead: !!item.isRead,
        }
      })
    },
    buildTabList() {
      //console.log('【buildTabList执行】 totalUnread=', this.totalUnread)
      let list = []
      if (this.role === 'DOCTOR') {
        list = [
          { pagePath: "/pages/index/doctorIndex", icon: "home", text: "首页", badge: "" },
          { pagePath: "/pages/index/doctorMine", icon: "account", text: "我的", badge: "" }
        ]
      } else if (this.role === 'CAREGIVER') {
        list = [
          { pagePath: "/pages/index/caregiverIndex", icon: "home", text: "首页", badge: "" },
          { pagePath: "/pages/index/service", icon: "hourglass", text: "服务中", badge: "" },
          { pagePath: "/pages/index/mine", icon: "account", text: "我的", badge: "" }
        ]
      } else if (this.role === 'CS') {
        list = [
          { pagePath: "/pages/index/workBench", icon: "home", text: "工作台", badge: "" },
          { pagePath: "/pages/index/systemCustomerService", icon: "account", text: "我的", badge: "" }
        ]
      } else if (this.role === 'PATIENT') {
        list = [
          { pagePath: "/pages/index/home", text: "首页", icon: "home", badge: "" },
          { pagePath: "/pages/index/healthCenter", text: "健康", icon: "heart", badge: "" },
          { pagePath: "/pages/index/messages", text: "消息", icon: "chat", badge: "" },
          { pagePath: "/pages/index/profile", text: "我的", icon: "account", badge: "" }
        ]
      }
      const msgItem = list.find(i => i.pagePath === '/pages/index/messages')
      if (msgItem) {
        msgItem.badge = this.totalUnread > 0 ? String(this.totalUnread) : ''
      //  console.log('【消息tab badge赋值】', msgItem.badge)
      }
      this.tabList = JSON.parse(JSON.stringify(list)) //  深度克隆，彻底切断引用，Vue2最稳方案
     // console.log('【最终tabList】', this.tabList)
    },
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
    handleTabClick(item) {
      uni.switchTab({
        url: item.pagePath,
        fail(err) {
          console.warn('switchTab失败，尝试navigateTo', err)
          uni.navigateTo({ url: item.pagePath })
        }
      })
    }
  }
}
</script>

<style scoped>
.my-tabbar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  border-top: 1rpx solid #eeeeee;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
