
	import { mapState } from 'vuex'
	import myTabbar from '@/components/myTabbar.vue'
	import {
		getMeHomeApi,
		getMeEscortCaregiversApi,
		getMeEscortBookingsApi,
		postMeEscortBookingsByIdCancelApi,
		buildFileAccessUrl
	} from '@/api/frontApikit.js'

	const PERIOD_NAME_MAP = {
		MORNING: '上午门诊陪诊',
		AFTERNOON: '下午门诊/检查',
		FULLDAY: '全天深度陪诊'
	}
	const PERIOD_TIME_MAP = {
		MORNING: '08:00 - 12:00',
		AFTERNOON: '13:30 - 17:30',
		FULLDAY: '08:00 - 17:00'
	}
	const STATUS_TEXT_MAP = {
		WAIT_ACCEPT: '专属陪诊预约',
		CONFIRMED: '专属陪诊预约',
		IN_SERVICE: '专属陪诊服务'
	}

	export default {
		options: {
			styleIsolation: 'shared'
		},
		components: {
			myTabbar
		},
		data() {
			return {
				pageLoading: true,
				pageError: '',
				cancelling: false,
				escortCount: null,
				booking: null,
				caregiver: {},
				guideList: [
					{ keyword: '集合接洽', content: '驻点将在就诊前30分钟在医院正门或门诊大厅导医台等候。' },
					{ keyword: '证件携带', content: '请随身携带用户身份证、医保卡及既往出院小结、手术记录等资料。' },
					{ keyword: '全程陪同', content: '涵盖挂号、排队取号、轮椅借用、辅助问诊、检查陪护、缴费及取药代办。' },
					{ keyword: '就诊小结', content: '就诊结束后驻点将整理专科医嘱及复诊检查清单同步至系统。' }
				]
			}
		},
		computed: {
			...mapState(['statusBarHeight', 'menuButton']),
			periodName() {
				return PERIOD_NAME_MAP[this.booking && this.booking.period] || '门诊陪诊'
			},
			periodTime() {
				return PERIOD_TIME_MAP[this.booking && this.booking.period] || ''
			},
			statusText() {
				return STATUS_TEXT_MAP[this.booking && this.booking.status] || '专属陪诊预约'
			},
			caregiverInfo() {
				return (this.booking && this.booking.caregiverInfo) || {}
			},
			caregiverAvatar() {
				const avatar = this.caregiver.avatar || this.caregiverInfo.avatar || ''
				return avatar ? buildFileAccessUrl(avatar) : ''
			},
			caregiverPhone() {
				return this.caregiverInfo.phone || this.caregiver.phone || ''
			},
			destination() {
				const hospital = this.caregiverInfo.hospital || ''
				const department = this.caregiverInfo.department || ''
				const remark = this.caregiverInfo.remark || this.booking.remark || ''
				const main = [hospital, department].filter(Boolean).join(' · ')
				return [main, remark].filter(Boolean).join(' / ')
			},
			stationDesc() {
				if (this.caregiver.desc) return this.caregiver.desc
				if (this.caregiver.expYears) return `从业${this.caregiver.expYears}年 · 已实名认证`
				return '资深三甲驻点 · 已实名认证'
			},
			stationTags() {
				const tags = Array.isArray(this.caregiver.tags) ? this.caregiver.tags.slice(0, 3) : []
				return tags
			}
		},
		created() {
			this.loadPageData()
		},
		methods: {
			// 页面初始化：首页聚合(剩余权益/有效预约) + 绑定驻点 + 预约明细(联系方式/医院科室)
			async loadPageData() {
				this.pageLoading = true
				this.pageError = ''
				uni.showLoading({ title: '加载中...', mask: true })
				try {
					const [homeRes, caregiverRes, bookingRes] = await Promise.all([
						getMeHomeApi().catch(error => { console.warn('获取首页聚合失败', error); return null }),
						getMeEscortCaregiversApi().catch(error => { console.warn('获取陪诊师列表失败', error); return [] }),
						getMeEscortBookingsApi().catch(error => { console.warn('获取预约列表失败', error); return [] })
					])

					const home = homeRes || {}
					const escort = home.escort || {}
					this.escortCount = escort.escortCount !== undefined && escort.escortCount !== null
						? escort.escortCount
						: null

					const caregivers = this.extractList(caregiverRes)
					// 专属驻点模式：取数组第 0 项为绑定驻点
					this.caregiver = caregivers[0] || {}

					const bookingList = this.extractList(bookingRes)
					const activeBooking = this.pickActiveBooking(escort.activeBooking, bookingList)
					this.booking = activeBooking
					if (!activeBooking) {
						this.pageError = '暂无进行中的陪诊预约'
					}
				} catch (error) {
					console.error('陪诊服务详情加载失败', error)
					this.pageError = (error && error.message) || '加载失败，请稍后重试'
					uni.showToast({ title: this.pageError, icon: 'none' })
				} finally {
					this.pageLoading = false
					uni.hideLoading()
				}
			},
			// 优先取首页聚合的有效预约，缺失时从预约列表挑最近一条未结束预约
			pickActiveBooking(homeActive, bookingList) {
				if (homeActive && homeActive.id) return homeActive
				const activeStatus = ['WAIT_ACCEPT', 'CONFIRMED', 'IN_SERVICE']
				const list = bookingList
					.filter(item => activeStatus.indexOf(item.status) !== -1)
					.sort((a, b) => {
						const ta = new Date(String(a.serviceDate || a.createTime || '').replace(/-/g, '/')).getTime() || 0
						const tb = new Date(String(b.serviceDate || b.createTime || '').replace(/-/g, '/')).getTime() || 0
						return tb - ta
					})
				if (!list.length) return null
				const latest = list[0]
				// EscortBookingView 字段映射为 ActiveBooking 结构，统一模板取值
				return {
					id: latest.id,
					status: latest.status,
					serviceDate: latest.serviceDate,
					period: latest.period,
					remark: latest.remark,
					caregiverInfo: {
						id: latest.caregiverId,
						name: latest.caregiverName,
						avatar: latest.caregiverAvatar,
						phone: latest.caregiverPhone,
						hospital: latest.hospital,
						department: latest.department,
						remark: latest.remark
					}
				}
			},
			extractList(data) {
				if (Array.isArray(data)) return data
				if (!data) return []
				if (Array.isArray(data.list)) return data.list
				if (Array.isArray(data.records)) return data.records
				if (Array.isArray(data.rows)) return data.rows
				if (Array.isArray(data.items)) return data.items
				if (Array.isArray(data.data)) return data.data
				return []
			},
			formatRating(rating) {
				const num = Number(rating)
				return Number.isFinite(num) && num > 0 ? num.toFixed(1) : '5.0'
			},
			handleCall() {
				const phone = this.caregiverPhone
				if (!phone) {
					uni.showToast({ title: '暂无陪诊师联系电话', icon: 'none' })
					return
				}
				uni.makePhoneCall({
					phoneNumber: String(phone),
					fail: error => console.warn('拨号取消或失败', error)
				})
			},
			handleMeetingPoint() {
				const hospital = this.caregiverInfo.hospital
				if (!hospital) {
					uni.showToast({ title: '就诊医院信息待确认，请先电话沟通', icon: 'none' })
					return
				}
				uni.showModal({
					title: '确认集合点',
					content: '就诊前30分钟，驻点将在「' + hospital + '」正门或门诊大厅导医台等候，请提前到达并保持电话畅通。',
					showCancel: false,
					confirmText: '我知道了',
					confirmColor: '#2563ff'
				})
			},
			handleCancel() {
				if (this.cancelling || !this.booking || !this.booking.id) return
				uni.showModal({
					title: '取消预约',
					content: '确认取消当前陪诊预约吗？取消后权益次数将全额返还。',
					confirmText: '确认取消',
					cancelText: '再想想',
					confirmColor: '#f56c6c',
					success: res => {
						if (res.confirm) this.confirmCancel()
					}
				})
			},
			async confirmCancel() {
				this.cancelling = true
				uni.showLoading({ title: '取消中...', mask: true })
				try {
					await postMeEscortBookingsByIdCancelApi({ id: this.booking.id })
					uni.showToast({ title: '预约已取消，权益已返还', icon: 'success' })
					await this.loadPageData()
				} catch (error) {
					console.error('取消预约失败', error)
					if (!error || !error.isApiError) {
						uni.showToast({ title: (error && error.message) || '取消失败，请稍后重试', icon: 'none' })
					}
				} finally {
					this.cancelling = false
					uni.hideLoading()
				}
			},
			goApply() {
				uni.navigateTo({ url: '/pages/index/caregiverApply' })
			},
			handleBack() {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 })
				} else {
					uni.reLaunch({ url: '/pages/index/home' })
				}
			}
		}
	}
