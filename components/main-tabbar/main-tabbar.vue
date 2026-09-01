<template>
	<view class="custom-tabbar">

		<u-tabbar :value="current" :placeholder="false" @change="name => activeTab = name" :fixed="true"
			activeColor="rgb(21, 93, 252)" inactiveColor="#d2d6dd">
			<u-tabbar-item v-for="item in tabList" :key="item.id" :text="item.text" :icon="item.icon"
				:badge="item.badge" @click="routeTo(item.route)"></u-tabbar-item>

		</u-tabbar>
	</view>
</template>

<script>
	export default {
		name: "customTabbar",
		props: {
			current: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				color: "#c0c4cc",
				selectedColor: "rgb(21, 93, 252)",
				tabList: [{
					id: 1,
					text: "首页",
					icon: "home",
					badge: "",
					route: "home"
				}, {
					id: 2,
					text: "健康",
					icon: "heart",
					badge: "",
					route: "healthCenter"
				}, {
					id: 3,
					text: "消息",
					icon: "chat",
					badge: "3",
					route: "messages"
				}, {
					id: 4,
					text: "我的",
					icon: "account",
					badge: "",
					route: "profile"
				}],
			};
		},
		methods: {
			routeTo(res) {
				console.log(res)
				let data = {
					title: 'hello',
					id: 1
				}
				const pages = getCurrentPages()
				let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				this.$safeJump(routeUrl)

			},

		}
	};
</script>

<style scoped>
	.custom-tabbar {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		background-color: #ffffff;
		display: flex;
		border-top: 1rpx solid #eeeeee;
		z-index: 999;
		/* height: 120rpx; */
		padding-bottom: env(safe-area-inset-bottom);
	}


	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 120rpx;
	}

	.tab-text {
		font-size: 24rpx;
		margin-top: 8rpx;
	}
</style>