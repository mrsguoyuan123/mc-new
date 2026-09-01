<template>
	<view class="page-caregiver">
		<view class="page-content">
			<!-- 平台专业保障卡片 -->
			<view class="guarantee-card">
				<view class="guarantee-title">
					<text class="custom-icon custom-icon-shield-check " style="font-size:45rpx;color:#fff;"></text>
					<text>平台专业保障</text>
				</view>
				<view class="guarantee-desc">
					所有健康照护师均经过 100% 实名认证、背景调查及术后康复专项技能考核，为您提供最专业的线下陪伴。
				</view>
			</view>

			<!-- 照护师列表 -->
			<scroll-view scroll-y class="list-wrap">
				<view class="item-card radius-15 card-top bg-white card-border card-border-gray"
					v-for="(item,idx) in caregiverList" :key="idx" @click="routeTo(item)">
					<view class="item-left">
						<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
					</view>
					<view class="item-right">
						<view class="row-name">
							<text class="name">{{item.name}}</text>
							<text class="age">{{item.age}}岁</text>
							<view class="star-box">
								<u-icon name="star-fill" color="#ff8800" size="30rpx"></u-icon>
								<text class="score">{{item.rating}}</text>
							</view>
						</view>
						<!-- 标签 -->
						<view class="tag-wrap">
							<u-tag v-for="(tag,i) in item.tags" :key="i" :text="tag" size="mini"></u-tag>
						</view>
						<u--text size="12" class="font-info font-s" :lines="3" :text="item.desc"></u--text>
						<view class="row-bottom">
							<text class="service-count">已服务 {{item.count}} 人次</text>
							<view class="select-btn">
								<text>选择</text>
								<u-icon name="arrow-right" color="#447dfd" :bold="true" size="25rpx"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

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
				activeTab: 1,
				caregiverList: [{
						id: "cg1",
						name: "王晓芳",
						age: 38,
						exp: 8,
						rating: 4.9,
						tags: ["金牌照护", "术后专业", "温和耐心"],
						desc: "拥有8年三甲医院临床护理经验，精通骨科、心内科术后康复护理及引流管管理。曾获得“年度优秀照护师”称号，擅长根据患者术后不同阶段调整膳食计划与心理疏导，服务细致，零投诉。",
						avatar: "https://images.unsplash.com/photo-1758691462615-beafbf50bf3c?w=200&q=80",
						count: 128,
						busySlots: ["2026-05-10", "2026-05-12", "2026-05-15"]
					},
					{
						id: "cg2",
						name: "李建国",
						age: 42,
						exp: 12,
						rating: 4.8,
						tags: ["资深护师", "力量感强", "急救背景"],
						desc: "退役武警卫生员背景，具备极强的应急处理能力与体能素质。深耕重症术后照护12年，擅长协助体重大或行动受限患者进行康复锻炼与翻身拍背，对压疮预防及各类辅助器械使用有独到经验。",
						avatar: "https://images.unsplash.com/photo-1592393532405-fb1f165c4a1f?w=200&q=80",
						count: 245,
						busySlots: ["2026-05-08", "2026-05-09", "2026-05-11"]
					},
					{
						id: "cg3",
						name: "陈美琳",
						age: 35,
						exp: 6,
						rating: 5.0,
						tags: ["五星好评", "细致入微", "营养指导"],
						desc: "持有高级康复护理员证及公共营养师证。专注于术后功能性恢复训练与精准营养配餐。她以极度的耐心和温柔著称，能够有效缓解患者术后焦虑，陪护过程深受中老年患者及其家属的喜爱。",
						avatar: "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=200&q=80",
						count: 86,
						busySlots: ["2026-05-13", "2026-05-14"]
					},
					{
						id: "cg4",
						name: "陈美琳",
						age: 35,
						exp: 6,
						rating: 5.0,
						tags: ["五星好评", "细致入微", "营养指导"],
						desc: "持有高级康复护理员证及公共营养师证。专注于术后功能性恢复训练与精准营养配餐。她以极度的耐心和温柔著称，能够有效缓解患者术后焦虑，陪护过程深受中老年患者及其家属的喜爱。",
						avatar: "https://images.unsplash.com/photo-1765896387387-0538bc9f997e?w=200&q=80",
						count: 86,
						busySlots: ["2026-05-13", "2026-05-14"]
					}
				]
			}
		},
		methods: {
			routeTo(res) {
				console.log(res)
				res.dataName = 'caregiverOption'
				let routeUrl = "/pages/index/caregiverDetail" + `?data=` + encodeURIComponent(JSON.stringify(res))
				this.$safeJump(routeUrl)
			},

		}
	}
</script>

<style scoped>
	.page-caregiver {
		height: 100vh;
		background-color: #f7f8fa;
		display: flex;
		flex-direction: column;
	}

	/*导航栏*/
	.nav-bar {
		display: flex;
		align-items: center;
		padding: 30rpx 32rpx 20rpx;
	}

	.back-icon {
		width: 60rpx;
	}

	.nav-title {
		flex: 1;
		text-align: center;
		font-size: 36rpx;
		font-weight: bold;
	}

	.placeholder {
		width: 60rpx;
	}

	/*保障蓝色卡片*/
	.guarantee-card {
		/* margin: 0 32rpx 30rpx; */
		background: #0066ff;
		border-radius: 30rpx;
		padding: 40rpx 32rpx;
		color: #ffffff;
		margin-bottom: 30rpx;
	}

	.guarantee-title {
		display: flex;
		align-items: center;
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.guarantee-title text {
		margin-left: 12rpx;
	}

	.guarantee-desc {
		font-size: 25rpx;
		line-height: 1.6;
		opacity: 0.8;
	}

	.list-wrap {
		flex: 1;
	}

	.item-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		display: flex;
	}

	.item-left {
		margin-right: 24rpx;
	}

	.avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 16rpx;
	}

	.item-right {
		flex: 1;
	}

	.row-name {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.name {
		font-size: 30rpx;
		font-weight: bold;
	}

	.age {
		font-size: 25rpx;
		color: #909399;
		margin-left: 12rpx;
	}

	.star-box {
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.score {
		font-size: 30rpx;
		color: #ff8800;
		font-weight: bold;
	}

	.tag-wrap {
		display: flex;
		gap: 16rpx;
		margin: 16rpx 0;
	}

	.tag {
		font-size: 24rpx;
		color: #0066ff;
		background: #e8f1ff;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
	}

	.desc {
		font-size: 28rpx;
		color: #555;
		line-height: 1.6;
	}

	.row-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20rpx;
	}

	.service-count {
		font-size: 22rpx;
		color: #909399;
	}

	.select-btn {
		display: flex;
		align-items: center;
		color: #0066ff;
		font-size: 25rpx;
		font-weight: bold;
	}
</style>