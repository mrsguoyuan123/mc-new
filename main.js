import Vue from 'vue'
import App from './App'
import uView from '@/uni_modules/uview-ui'
import request from '@/api/request.js'
import store from '@/store'
import { safeJump } from '@/common/router.js'
Vue.prototype.$store = store
Vue.prototype.$api = request
Vue.prototype.$safeJump = safeJump
Vue.use(uView)
// import api from './api/index.js'
Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
