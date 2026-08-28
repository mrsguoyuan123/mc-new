<template>
	<!-- <page-meta
	    :background-text-style="bgTextStyle"
	    :background-color="bgColor"
	    :background-color-top="bgColorTop"
	    :background-color-bottom="bgColorBottom"
	    :scroll-top="scrollTop"
	    page-style="color: green"
	    root-font-size="16px"
	  >
	   </page-meta> -->
	<page-meta :root-font-size="fontsize+'px'"></page-meta>
	<view class="page-content page-home	">


		<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between"
			@click="routeTo('profile')">

			<view class="u-flex ">
				<view class="view-icon no-border">
					<u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="view-text">
					<view class=" font-m">
						张三
					</view>
					<view class="font-s">
						支架手术
					</view>
				</view>

			</view>
			<view class="view-icon-circle">
				<u-icon name="arrow-right" color="#909399" size="20rpx"></u-icon>
			</view>

		</view>
		<view class="button-wrapper">
			<view class="radius-15 card-top card-bg card-blue" @click="routeTo('consultation')">
				<view class="view-icon bg-blue">
					<u-icon name="chat" color="white" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="text-white">
					<view class="white-text1">
						在线咨询
					</view>
					<view class="white-text2">
						专属医助服务
					</view>
				</view>
			</view>
			<view class="radius-15 card-top card-bg  card-green" @click="routeTo('healthCenter')">
				<view class="view-icon">
					<u-icon name="heart" color="white" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="text-white">
					<view class="white-text1">
						健康管理中心
					</view>
					<view class="white-text2">
						全方位健康管理
					</view>
				</view>
			</view>

		</view>
		<view class="header-text">
			<view class="header-icon ">

				<u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
				<view class="header-name font-bold font-m">
					我的私人医生团队
				</view>
			</view>

		</view>
		<view class="my-team bg-white radius-15 card-top card-border card-border-gray">
			<view class="team-icon view-icon">
				<text class="custom-icon custom-icon-stethoscope icon-bold" style="font-size:90rpx;color:white;"></text>
			</view>

			<view class="team-content">
				<view class="font-bold text-center">医生团队</view>
				<view class="my-badge-center">
					<u-tag class="margin-right-5" text="心内科" type="primary" size="mini" plain></u-tag>
					<u-tag class="margin-right-5" text="副主任医师" type="primary" size="mini" plain></u-tag>
					<u-tag bgColor="#faf5ff" color="#b110fa" borderColor="#faf5ff" text="三甲" size="mini" plain
						plainFill></u-tag>

					<!-- <view class="badge badge-purple">副主任医师</view> -->
				</view>
				<view class=" text-center font-info font-s">温州医科大学附属第一医院</view>
				<view class="radius-15 bg-gray gray-content">
					<view class="sub-title font-bold font-s margin-bottom-1 margin-top-1">
						<view class="sub-title-line"></view>
						专业擅长
					</view>
					<view class=" font-info font-s">
						医学博士，主任医师，教。现任中国医药信学会心脏监护专业委员会副主任委员。曾任职于中国人民解放军总医院（301医院），从事心血管内科临床工作三十余年，在心血管疾病的诊治与危重症抢救方面积累了深厚经验。
					</view>
					<view class="sub-title font-bold font-s  margin-bottom-1 margin-top-1">
						<view class="sub-title-line"></view>
						个人简介
					</view>
					<view class=" font-info font-s">
						医学博士，主任医师，教。现任中国医药信学会心脏监护专业委员会副主任委员。曾任职于中国人民解放军总医院（301医院），从事心血管内科临床工作三十余年，在心血管疾病的诊治与危重症抢救方面积累了深厚经验。
					</view>
				</view>

			</view>
		</view>
		<view class="bg-chart bg-white radius-15 card-border card-border-gray">
			<view class=" font-bold font-m">
				实时健康监测看板
			</view>
			<view class="chart-content">
				<view class="chart-item">
					<view class="chart-title">
						<view class="header-icon ">
							<text class="custom-icon custom-icon-activity icon-bold"
								style="font-size:30rpx;color:#155DFC;"></text>

							<view class="header-name font-bold font-s">
								血压点位
							</view>
						</view>
					</view>
					<view class="progress-content">
						<view>
							<view class="font-info font-s">舒张压</view>
							<u-line-progress :percentage="80" height="8" activeColor="#2b7fff"
								:showText="false"></u-line-progress>
						</view>
						<view>
							<view class="font-info font-s">收缩压</view>
							<u-line-progress :percentage="60" height="8" activeColor="#fdc700"
								:showText="false"></u-line-progress>
						</view>
						<view>
							<view class="font-info font-s">综合率</view>
							<u-line-progress :percentage="90" height="8" activeColor="#00c950"
								:showText="false"></u-line-progress>
						</view>
					</view>
				</view>
				<view class="chart-item">
					<view class="chart-title">
						<view class="header-icon ">
							<text class="custom-icon custom-icon-activity icon-bold"
								style="font-size:30rpx;color:#00c950;"></text>

							<view class="header-name font-bold  font-s">
								血糖体征
							</view>

						</view>

					</view>
					<view class="space-between align-start">
						<view class="font-info font-s">血压</view>
						<view class="font-bold font-s">118/78</view>
					</view>
					<view class="space-between align-start">
						<view class="font-info font-s">血糖</view>
						<view class="font-bold font-s">5.34</view>
					</view>
				</view>
			</view>
			<view class=" bg-pink radius-15">
				<view class="chart-title">
					<view class="header-icon ">
						<text class="custom-icon custom-icon-trending-down icon-bold"
							style="font-size:30rpx;color:#f6339a;"></text>

						<view class="header-name font-bold font-s">
							体重运动趋势
						</view>
					</view>
				</view>
				<view class="u-flex space-between align-center">
					<u-line-progress :percentage="60" height="8" activeColor="#f6339a" inactiveColor="#fccee8"
						:showText="false"></u-line-progress>
					<view class="font-bold font-pink font-s" style="margin-left: 10px;">
						-1.2kg
					</view>
				</view>
			</view>
			<view class=" bg-yellow radius-15    ">
				<view class="chart-title">
					<view class="header-icon ">
						<u-icon name="file-text" color="#e7c174" :bold="true" size="30rpx"></u-icon>
						<view class="header-name font-bold font-s">
							今日服用
						</view>
					</view>
				</view>
				<view class="my-badge">
					<u-tag text="本品+钙剂" type="primary" size="mini" plain plainFill></u-tag>
					<u-tag text="钙片促吸收" type="primary" size="mini" plain plainFill></u-tag>
					<u-tag text="降压药" type="primary" size="mini" plain plainFill></u-tag>

				</view>
			</view>
		</view>
		<view class="header-text">
			<view class="header-icon ">
				<text class="custom-icon custom-icon-user-check icon-bold"
					style="font-size:40rpx;color:#155DFC;"></text>
				<view class="header-name font-bold font-m">
					健康护照师申请
				</view>
			</view>
			<view class="font-blue font-s font-bold">
				上门服务
			</view>
		</view>
		<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between" @click="routeTo('caregiverApply')">
			<view class="view-icon bg-blue-dark margin-right-5">
				<text class="custom-icon custom-icon-shield icon-bold" style="font-size:40rpx;color:white;"></text>
			</view>
			<view>

				<view class="view-text">
					<view class=" font-m font-bold">
						专业照护人员上门服务
					</view>
					<view class="font-xs margin-15">
						术后康复专项指导 · 居家生活护理 · 24h全天候陪伴
					</view>
				</view>
				<view class="badge-bg  badge-blue-bg">
					已有 1000+ 患者选择
				</view>
			</view>
			<view class="">
				<u-icon name="arrow-right" color="#909399" size="20rpx"></u-icon>
			</view>

		</view>
		<view class="header-text">
			<view class="header-icon ">
				<u-icon name="heart" color="#fb2c36" :bold="true" size="40rpx"></u-icon>
				<view class="header-name font-bold font-m">
					术后健康知识库
				</view>
			</view>
			<view class="font-blue font-s font-bold">
				为您精选
			</view>
		</view>
		<view v-for="item in articles" :key="item.id" class="my-article bg-white radius-15 card-border card-border-gray">
			<view class="u-flex align-center">
				<view class="img-wrapper">
					<image class="img-inner" :src="item.image" :alt="item.desc" mode="aspectFit"></image>
				</view>
				<!-- 重点：flex:1 占剩余空间；min‑width:0 允许flex子项收缩，防止文字把盒子撑开 -->
				<view class="img-text" style="flex: 1; min-width: 0; margin-left:20rpx;">
					<view>
						<u-tag bgColor="#fef2f2" color="#fb2c36" borderColor="#fef2f2" :text="item.dept" size="mini"
							plain-fill></u-tag>
					</view>
					<view class="font-bold font-s" style="margin: 10rpx 0;">{{item.title}}</view>
					<view class="font-info font-s"
						style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
						{{item.desc}}
					</view>
				</view>
			</view>
		</view>



		<main-tabbar :current="0"></main-tabbar>
	</view>

</template>


<script>
	import mainTabbar from '@/components/main-tabbar/main-tabbar.vue'

	export default {
		components: {
			mainTabbar
		},
		data() {
			return {
				bgTextStyle: 'dark',
				scrollTop: '200rpx',
				bgColor: '#ff0000',
				bgColorTop: '#00ff00',
				bgColorBottom: '#0000ff',
				nbTitle: '标题',
				nbLoading: false,
				nbFrontColor: '#000000',
				nbBackgroundColor: '#ffffff',
				fontsize: 12,
				activeTab: 0,

				articles: [{
						id: "h1",
						dept: "支架手术",
						title: "支架手术术后常见护理方案",
						desc: "术后48小时是关键期，注意用药与活动量控制...",
						image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"
					},
					{
						id: "h2",
						dept: "支架手术",
						title: "支架术后饮食指南：如何保护血管",
						desc: "低盐低脂饮食，规律作息，避免剧烈运动...",
						image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"
					},
					{
						id: "h3",
						dept: "骨科",
						title: "骨折术后康复锻炼：从被动到主动",
						desc: "阶梯式功能练习有助于关节活动度的恢复...",
						image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"
					},
					{
						id: "h4",
						dept: "骨科",
						title: "关节置换术后：如何居家安全活动",
						desc: "环境布置、助行器使用及跌倒预防全攻略...",
						image: "https://images.unsplash.com/photo-1598184273446-94410290f6e7?w=400&q=80"
					},
					{
						id: "h5",
						dept: "心外科",
						title: "支架术后生活指南",
						desc: "戒烟限酒、规律用药是心脏支架术后长久的关键...",
						image: "https://images.unsplash.com/photo-1505751172107-573225ad4b73?w=400&q=80"
					},
					{
						id: "h6",
						dept: "妇产科",
						title: "产后康复：骨盆修复与腹直肌调理",
						desc: "科学月子期护理，帮助身体机能快速回弹...",
						image: "https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?w=400&q=80"
					},

				]

			};
		},
		onLoad() {
			let srceenNunber = 19.2; //因设计图是1920所有把设计图分为19.2份，所以html字体大小为100px
			let that = this;

			//窗体改变大小触发事件
			uni.onWindowResize((res) => {
				console.log('变化后的窗口宽度=', res.size.windowWidth);
				that.fontsize = parseFloat(res.size.windowWidth) / srceenNunber;
				console.log('字体大小：', that.fontsize);
			})

			//打开获取屏幕大小
			uni.getSystemInfo({
				success(res) {
					console.log('设备信息：', res);
					that.fontsize = res.screenWidth / srceenNunber;
					console.log('字体大小：', that.fontsize);
				}
			})
		},

		methods: {
			routeTo(res) {
				console.log(res)

				let data = {
					id: 1
				}
				let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(data))
				uni.navigateTo({
					url: routeUrl,
					fail: (err) => {
						console.error('跳转失败', err) //打印失败原因
					}
				})
				// if (res == 'healthCenter' || res == 'home' || res == 'chat' || res == 'account') {
				// 	uni.switchTab({
				// 		url: routeUrl,
				// 		fail: (err) => {
				// 			console.error('跳转失败', err) //打印失败原因
				// 		}
				// 	})
				// } else {
				// 	uni.navigateTo({
				// 		url: routeUrl,
				// 		fail: (err) => {
				// 			console.error('跳转失败', err) //打印失败原因
				// 		}
				// 	})
				// }

			}
		},


	};
</script>

<style scoped lang="scss">
	.page-home {
		// padding-bottom: 70px;
	}

	.page-home .view-icon {
		padding: 10px;
		border-radius: 15px;
		float: left;
	}

	.bg-chart .font-info {
		margin: 6px auto;
	}

	.my-article {
		padding: 20rpx;
		margin: 20rpx auto;
	}

	.bg-chart .bg-pink,
	.bg-chart .bg-yellow {
		padding: 20rpx;
		margin: 20rpx auto;
	}

	.chart-title .header-icon {
		justify-content: start;
		margin: 10rpx auto;
	}

	.chart-content {
		display: flex;
		justify-content: space-between;
		flex-wrap: nowrap;
		align-items: start;
		margin: 10px 0;


	}

	.chart-content .chart-item {
		width: calc(50% - 10px);
	}

	.chart-content .space-between {
		margin: 10px auto;
	}

	.bg-chart {
		margin: 30rpx auto;
		padding: 30rpx;
	}

	.my-badge-center {
		display: flex;
		justify-content: center;
		flex-wrap: nowrap;
		align-items: center;
		margin: 10px 0;


	}

	.my-badge-center ::v-deep .u-transition {
		margin-right: 6px !important;
	}

	.my-badge {
		display: flex;
		justify-content: start;
		flex-wrap: nowrap;
		align-items: center;
		margin: 10px 0;


	}

	.my-badge ::v-deep .u-transition {
		margin-right: 6px !important;
	}

	.team-content {
		margin-top: 60rpx;
		width: 100%;
	}

	.my-team {
		position: relative;
		margin-top: 90rpx;
		background-color: white;
	}

	.team-icon.view-icon {
		background-color: #155dfc;
		border: 3px solid white;
		position: absolute;
		left: 50%;
		top: 0;
		transform: translate(-50%, -50%);
	}

	.card-green .view-icon {
		background-color: #33b865;
	}

	.card-blue .view-icon {
		background-color: #447dfd;
	}

	.card-green {
		background-color: #00a63e;
	}

	.card-blue {
		background-color: #155dfc;
		margin-right: 10px;
	}

	.button-wrapper {
		margin: 30rpx 0;
		display: flex;
		justify-content: space-between;
		flex-wrap: nowrap;
		align-items: center;
	}

	.view-icon-circle {
		border-radius: 100%;
		background-color: #f9fafb;
		width: 20rpx;
		height: 20rpx;
		padding: 16rpx;
	}

	.my-article {
		padding: 24rpx;
	}

	.img-wrapper {
		overflow: hidden;
		width: 150rpx;
		height: 150rpx;
		border-radius: 20rpx;
		margin-right: 10px;
		position: relative;
		flex-shrink: 0;


	}

	.img-wrapper .img-inner {
		width: 100%;
		height: 100%;
		max-height: 100%;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.img-text {
		width: calc(100% - 160rpx);
		flex: 1;
	}

	.img-text ::v-deep .u-tag--mini {
		width: fit-content;
	}
</style>