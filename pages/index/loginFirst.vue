<template>
	<view class="page-content page-loginFirst ">

		<view class=" card-top  u-flex space-between u-flex-column ">
			<view class="view-icon badge-blue-bg badge-circle margin-bottom-2">
				<u-icon name="account" color="#155DFC" :bold="true" size="40"></u-icon>
			</view>
			<view class="">

				<view class="view-text">
					<view class="font-bold font-l margin-bottom-1 text-center">
						首次登录
					</view>
					<view class="font-info font-s margin-bottom-3 text-center">
						由于您是首次登录系统，请先选择您的角色以进入对应的服务空间
					</view>
				</view>

			</view>
			<view @click="routeTo(item)" :class="item.routeto=='onsite'?'list-outside':'list-home'"
				v-for="(item,index) in userList"
				class="card-list radius-15 card-top bg-white card-border card-border-gray">
				<view class=" massage-list">
					<view class="massage-icon-left view-icon bg-white1 margin-right-10 " v-if="item.routeto=='home'">
						<u-icon name="account" color="#16c288" :bold="true" size="40rpx"></u-icon>
					</view>
					<view class="massage-icon-left view-icon bg-white1 margin-right-10 "
						v-else-if="item.routeto=='onsite'">
						<u-icon name="map" color="#155DFC" :bold="true" size="40rpx"></u-icon>
					</view>

					<view class="massage-content">
						<!-- 内容 -->
						<view class="view-text">
							<view class="view-text1 font-l">
								{{item.name}}
							</view>
							<u--text size="12" class="font-info font-s" :lines="1" :text="item.lastMsg"></u--text>
						</view>

					</view>
					<view class="massage-icon-right">
						<u-icon name="arrow-right" color="#909399" size="20rpx"></u-icon>
					</view>

				</view>

			</view>
			<view @click="logOut" class="font-info font-m margin-top-3">返回登录界面</view>
		</view>
	</view>
</template>

<script>
	import {
		authLogout
	} from '@/api/auth'
	export default {
		data() {
			return {
				userList: [{
						id: "1",
						name: "我是患者",
						lastMsg: "查看病历、预约复诊及咨询管家",
						routeto: "home",

					},
					{
						id: "sys-1",
						name: "我是驻点",
						lastMsg: "提供陪诊服务、协调院内资源",
						routeto: "onsite",

					},
					{
						id: "sys-1",
						name: "我是客服",
						lastMsg: "提供陪诊服务、协调院内资源",
						routeto: "workBench",

					},

				]
			};
		},
		methods: {
			routeTo(item) {
				uni.showLoading()
				uni.hideLoading()


				console.log(item.routeto)
				if (item.routeto == 'onsite') {
					uni.switchTab({
						url: "/pages/index/onsite"
					})
				} else {
					let routeUrl = "/pages/index/" + item.routeto + `?data=` + encodeURIComponent(JSON.stringify(item))
					this.$safeJump(routeUrl)

				}



			},
			logOut() {
				uni.showModal({
					title: '提示',
					content: '确认退出登录？',
					success(res) {
						if (res.confirm) {
							uni.clearStorageSync()
							uni.reLaunch({
								url: '/pages/index/login'
							})
						}
					}
				})

			},
			// async logOut() {
			// 	try {
			// 		await authLogout()
			// 	} catch (e) {
			// 		console.warn('登出后端通知失败，继续清理本地', e)
			// 	} finally {
			// 		uni.removeStorageSync('token')
			// 		uni.removeStorageSync('refreshToken')
			// 		uni.reLaunch({
			// 			url: '/pages/login/login'
			// 		})
			// 	}
			// },

		},


	};
</script>

<style scoped lang="scss">


	.page-loginFirst .card-list {
		width: 100%;

	}

	.list-home {
		box-shadow: none;
		background-color: #f5fbf8;
		border-color: #d0fae5;

	}

	.list-outside {
		box-shadow: none;
		background-color: #f6f9fb;
		border-color: #dbeafe;

	}

	/* 左图标 */
	.massage-list .massage-icon-left {
		position: absolute;
		left: 0;
		top: 0;
		width: 40rpx;
		height: 40rpx;
	}

	/* 中间内容 */
	.massage-list {
		position: relative;
		width: calc(100% - 150rpx);
		padding: 0 50rpx 0 90rpx;
	}

	/* 右箭头 */
	.massage-list .massage-icon-right {
		position: absolute;
		right: 0;
		top: calc(50% - 20rpx);
	}

	/* 右边小点  */
	.massage-time {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		/* border: 1px solid ; */
		width: 90rpx;
	}
</style>