<template>
	<page-meta :root-font-size="fontsize + 'px'"></page-meta>
	<view class="page-content page-home	">


		<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between"
			@click="routeTo('profile')">

			<view class="u-flex ">
				<view class="view-icon no-border">
					<u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
				</view>
				<view class="view-text">
					<view class=" font-m">
						{{ archivePatient.name }}
					</view>
					<view class="font-s">
						{{ archivePatient.surgeryType }}
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
				<view class="font-bold text-center">{{ advisorCard.name }}</view>
				<view class="my-badge-center">
					<u-tag class="margin-right-5" :text="advisorCard.title" type="primary" size="mini" plain></u-tag>
					<!-- 	<u-tag class="margin-right-5" text="副主任医师" type="primary" size="mini" plain></u-tag>
					<u-tag bgColor="#faf5ff" color="#b110fa" borderColor="#faf5ff" text="三甲" size="mini" plain
						plainFill></u-tag> -->

					<!-- <view class="badge badge-purple">副主任医师</view> -->
				</view>
				<view class=" text-center font-info font-s">{{ advisorCard.hospitalName }}</view>
				<view class="radius-15 bg-gray gray-content">
					<view class="sub-title font-bold font-s margin-bottom-1 margin-top-1">
						<view class="sub-title-line"></view>
						专业擅长
					</view>
					<view class=" font-info font-s">
						{{ advisorCard.specialty }}
					</view>
					<view class="sub-title font-bold font-s  margin-bottom-1 margin-top-1">
						<view class="sub-title-line"></view>
						个人简介
					</view>
					<view class=" font-info font-s">
						{{ advisorCard.bio }}
					</view>
				</view>

			</view>
		</view>
		<view class="header-text">
			<view class="header-icon ">

				<u-icon name="account" color="#155DFC" :bold="true" size="40rpx"></u-icon>
				<view class="header-name font-bold font-m">
					个人健康档案
				</view>
			</view>

		</view>
		<view class="health-archive">
			<view class="ha-panel ha-archive-head">
				<view>
					<view class="ha-title">个人健康档案</view>
					<view class="ha-subtitle">病历扫描件结构化归档与连续检验趋势</view>
				</view>
				<view class="ha-status">
					<view class="ha-status-dot"></view>
					<text>本人档案已同步</text>
				</view>
				<!-- <view class="ha-filter-row">
					<view v-for="item in archiveRanges" :key="item.value"
						:class="['ha-filter-pill', archiveRange === item.value ? 'is-active' : '']"
						@click="setArchiveRange(item.value)">
						{{ item.label }}
					</view>
				</view> -->
			</view>

			<view class="ha-panel ha-patient-card">
				<view class="ha-patient-summary" @click="toggleArchive">
					<view class="ha-avatar">{{ archivePatient.name ? archivePatient.name[0] : '' }}</view>
					<view class="ha-patient-main">
						<view class="ha-name-row">
							<text class="ha-name">{{ archivePatient.name }}</text>
							<text class="ha-gender">{{ archivePatient.gender }}，{{ archivePatient.age }}岁</text>
							<!-- <text class="ha-built-tag">{{ archivePatient.tag }}</text> -->
						</view>
						<!-- <view class="ha-diagnosis">诊断：{{ archivePatient.mainDiagnosis }}</view> -->
						<view class="ha-surgery">{{ archivePatient.mainDiagnosis }}</view>
						<!-- <view class="ha-update-row">
							<u-icon name="clock" color="#15a05a" size="26rpx"></u-icon>
							<text>档案更新：</text>
							{{ archivePatient.surgeryDate }}
							
						</view> -->
					</view>
					<view class="ha-chevron" :class="archiveExpanded ? 'is-open' : ''">
						<u-icon name="arrow-down" color="#7b8a82" size="28rpx"></u-icon>
					</view>

				</view>
				<view class="u-flex space-between margin-top-1">
					<view class="ha-surgery">手术类型：{{ archivePatient.surgeryType }}</view>
					<view class="ha-surgery">手术时间：{{ archivePatient.surgeryDate }}</view>

				</view>
				<view v-show="archiveExpanded" class="ha-expanded">
					<view class="ha-section">
						<view class="ha-section-title">
							<view class="ha-title-mark"></view>
							<text>一、基础信息</text>
						</view>
						<view class="ha-form-grid">
							<view class="ha-form-item">
								<text class="ha-form-label">姓名</text>
								<text class="ha-form-value">{{ archivePatient.name }}</text>
							</view>
							<view class="ha-form-item">
								<text class="ha-form-label">性别</text>
								<text class="ha-form-value">{{ archivePatient.gender }}</text>
							</view>
							<view class="ha-form-item">
								<text class="ha-form-label">年龄</text>
								<text class="ha-form-value">{{ archivePatient.age }}岁</text>
							</view>
							<view class="ha-form-item">
								<text class="ha-form-label">联系电话</text>
								<text class="ha-form-value">{{ archivePatient.phone }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">证件号</text>
								<text class="ha-form-value">{{ archivePatient.idCard }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">住院号、就诊号</text>
								<text class="ha-form-value">{{ archivePatient.idCard }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">主要诊断</text>
								<text class="ha-form-value">{{ archivePatient.mainDiagnosis }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">手术类型</text>
								<text class="ha-form-value">{{ archivePatient.surgeryType }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">手术时间</text>
								<text class="ha-form-value">{{ archivePatient.surgeryDate }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">既往病史</text>
								<text class="ha-form-value">{{ }}</text>
							</view>
							<view class="ha-form-item ha-full">
								<text class="ha-form-label">既往手术史</text>
								<text class="ha-form-value">{{ }}</text>
							</view>
						</view>

					</view>

					<view class="ha-section">
						<view class="ha-section-title ha-section-between">
							<view class="ha-title-line">
								<view class="ha-title-mark"></view>
								<text>二、病历扫描件</text>
							</view>
							<view class="ha-camera-btn" @click.stop="refreshScan">
								<u-icon name="camera-fill" color="#15a05a" size="26rpx"></u-icon>
								<text>拍照更新</text>
							</view>
						</view>
						<view class="ha-scan-list">
							<view v-if="archiveScans.length === 0" class="ha-empty">暂无病历扫描件</view>
							<view v-for="scan in archiveScans" :key="scan.id" class="ha-scan-card"
								@click="previewScan(scan)">
								<view class="ha-scan-icon">
									<u-icon :name="scan.icon" color="#15a05a" size="38rpx"></u-icon>
								</view>
								<view class="ha-scan-info">
									<view class="ha-scan-name">{{ scan.name }}</view>
									<view class="ha-scan-meta">{{ scan.date }} · {{ scan.pages }}</view>
								</view>
								<u-icon name="arrow-right" color="#b5c3bb" size="26rpx"></u-icon>
							</view>
						</view>

					</view>

					<view v-for="group in archiveGroups" :key="group.key" class="ha-section ha-lab-card">
						<view class="ha-section-title u-flex space-between">
							<view class="u-flex align-center">
								<view class="ha-title-mark"></view>
								<text>{{ group.index }}、{{ group.title }}</text>
							</view>

							<view class="ha-add-record" @click="openAppendPopup(group)">
								<u-icon name="camera-fill" color="#ffffff" size="34rpx"></u-icon>
								<text>追加记录</text>
							</view>
						</view>

						<view class="ha-tabs">
							<view :class="['ha-tab', group.activeTab === 'latest' ? 'is-active' : '']"
								@click="setMetricTab(group, 'latest')">最新指标
								<view class="ha-line"></view>
							</view>
							<view :class="['ha-tab', group.activeTab === 'trend' ? 'is-active' : '']"
								@click="setMetricTab(group, 'trend')">近期趋势
								<view class="ha-line"></view>
							</view>
						</view>
						<view v-if="group.activeTab === 'latest'" class="ha-metric-list">
							<view v-if="group && group.metrics && group.metrics.length === 0" class="ha-empty">暂无检验记录
							</view>
							<view v-for="metric in (group && group.metrics) || []" :key="metric.name"
								class="ha-metric-row">
								<view class="ha-metric-name">
									<text class="ha-metric-code">{{ metric.name || '-' }}</text>
									<text class="ha-metric-label">{{ metric.label || '' }}</text>
								</view>
								<view class="ha-metric-range">参考 {{ metric.range || '-' }} {{ metric.unit || '' }}
								</view>
								<view class="ha-metric-right">
									<view :class="['ha-metric-value', isMetricAbnormal(metric) ? 'is-abnormal' : '']">
										{{ metric.value !== undefined ? metric.value : '-' }}
										<text class="ha-metric-unit">{{ metric.unit || '' }}</text>
									</view>
									<view :class="['ha-change', metricChangeClass(metric)]">
										较前次 {{ formatChange(metric.change) }}
									</view>
								</view>
							</view>
						</view>



						<view v-if="group.activeTab === 'trend'" class="ha-trend-wrap">
							<view class="ha-chart-box">
								<qiun-data-charts type="line" :opts="archiveChartOpts"
									:chartData="getTrendChartData(group)" />
							</view>
							<view class="ha-analysis">
								<view class="ha-analysis-head">
									<u-icon name="checkmark-circle-fill" color="#e6a217" size="28rpx"></u-icon>
									<text>分析摘要</text>
								</view>
								<view class="ha-analysis-text">{{ group.summary }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>



		<u-popup :show="showAppendPopup" mode="bottom" :round="28" :safeAreaInsetBottom="true"
			@close="closeAppendPopup">
			<view class="ha-popup">
				<view class="ha-popup-head">
					<view class="ha-popup-title">上传{{ group.title }}报告单（支持图片，扫描）</view>
					<view class="ha-popup-subtitle">支持拍照、相册导入、多页拼接及OCR识别</view>

					<view class="ha-popup-close" @click="closeAppendPopup">
						<u-icon name="close" color="#7b8a82" size="34rpx"></u-icon>
					</view>
				</view>
				<view class="ha-upload-option" @click="chooseRecord('camera')">
					<view class="ha-upload-icon">
						<u-icon name="camera-fill" color="#15a05a" size="42rpx"></u-icon>
					</view>
					<view>
						<view class="ha-upload-title">拍照扫描</view>
						<view class="ha-upload-desc">调用高清单反/手机</view>
					</view>

				</view>
				<view class="ha-upload-option" @click="chooseRecord('album')">
					<view class="ha-upload-icon">
						<u-icon name="photo" color="#15a05a" size="42rpx"></u-icon>
					</view>
					<view>
						<view class="ha-upload-title">相册选取</view>
						<view class="ha-upload-desc">支持多图上传</view>
					</view>

				</view>

				<view class="ha-popup-cancel" @click="closeAppendPopup">取消</view>
			</view>
		</u-popup>
		<view class="bg-chart bg-white radius-15 card-top card-border card-border-gray" style="display:block">
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
							<u-line-progress
								:percentage="monitor && monitor.bloodPressure && monitor.bloodPressure.dbp ? getDbpPercent(monitor.bloodPressure.dbp) : 0"
								height="8" activeColor="#2b7fff" :showText="false"></u-line-progress>
						</view>
						<view>
							<view class="font-info font-s">收缩压</view>
							<u-line-progress
								:percentage="monitor && monitor.bloodPressure && monitor.bloodPressure.sbp ? getSbpPercent(monitor.bloodPressure.sbp) : 0"
								height="8" activeColor="#fdc700" :showText="false"></u-line-progress>
						</view>
						<view>
							<view class="font-info font-s">综合率</view>
							<u-line-progress :percentage="monitor && monitor.compositeRate ? monitor.compositeRate : 0"
								height="8" activeColor="#00c950" :showText="false"></u-line-progress>
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
						<view class="font-bold font-s">
							{{ monitor && monitor.bloodPressure && monitor.bloodPressure.sbp !== undefined ?
								monitor.bloodPressure.sbp : '-' }}/{{ monitor && monitor.bloodPressure &&
								monitor.bloodPressure.dbp !== undefined ? monitor.bloodPressure.dbp : '-' }}
							<text class="font-info" style="margin-left:8rpx;">{{ monitor && monitor.bloodPressure &&
								monitor.bloodPressure.level || '' }}</text>
						</view>
					</view>
					<view class="space-between align-start">
						<view class="font-info font-s">血糖</view>
						<view class="font-bold font-s">
							{{ monitor && monitor.bloodGlucose && monitor.bloodGlucose.value !== undefined ?
								monitor.bloodGlucose.value : '-' }}
							<text class="font-info" style="margin-left:8rpx;">{{ monitor && monitor.bloodGlucose &&
								monitor.bloodGlucose.unit || '' }}</text>
						</view>
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
					<u-line-progress
						:percentage="monitor && monitor.weight ? getWeightPercent(monitor.weight.changeKg) : 0"
						height="8"
						:activeColor="getWeightColor(monitor && monitor.weight ? monitor.weight.changeKg : 0)"
						:inactiveColor="monitor && monitor.weight && monitor.weight.changeKg > 0 ? '#fff2cc' : '#fccee8'"
						:showText="false"></u-line-progress>
					<view class="font-bold font-s"
						:class="monitor && monitor.weight && monitor.weight.changeKg > 0 ? 'font-yellow' : 'font-pink'"
						style="margin-left: 10px;">

						{{ monitor && monitor.weight && monitor.weight.changeKg !== undefined ? (monitor.weight.changeKg
							> 0 ? '+' : '') + monitor.weight.changeKg + 'kg' : '-' }}
					</view>
				</view>


			</view>
			<view class=" bg-yellow radius-15">
				<view class="chart-title">
					<view class="header-icon ">
						<u-icon name="file-text" color="#e7c174" :bold="true" size="30rpx"></u-icon>
						<view class="header-name font-bold font-s">
							今日服用
						</view>
					</view>
				</view>
				<view class="my-badge">
					<u-tag v-for="item in (monitor && monitor.medicationToday) || []" :key="item.name" :text="item.name"
						type="primary" size="mini" plain plainFill style="margin-right: 8rpx;"></u-tag>
					<!-- 没有用药时显示 -->
					<text
						v-if="!((monitor && monitor.medicationToday && monitor.medicationToday.length) || 0)">暂无用药</text>
				</view>


			</view>
		</view>

		<view
			v-if="!this.caregiverOption || Object.keys(this.caregiverOption).length === 0 || this.caregiverOption.applyforRefund">
			<view class="header-text">
				<view class="header-icon ">
					<text class="custom-icon custom-icon-user-check icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
					<view class="header-name font-bold font-m">
						陪诊师申请
					</view>
				</view>
				<view class="u-flex align-center">
					<view class="badge-bg  badge-blue-bg margin-right-1">
						剩余次数：{{ escort.escortCount }}次
					</view>
					<view class="font-blue font-s font-bold">
						上门服务
					</view>
				</view>

			</view>
			<view class="radius-15 card-top bg-white card-border card-border-gray  u-flex space-between"
				@click="routeTo('caregiverApply')">
				<view class="view-icon bg-blue-dark margin-right-5">
					<text class="custom-icon custom-icon-shield icon-bold" style="font-size:40rpx;color:white;"></text>
				</view>
				<view>

					<view class="view-text">
						<view class=" font-m font-bold">
							陪诊师上门服务
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

		</view>
		<view v-else>
			<view class="header-text">
				<view class="header-icon ">
					<text class="custom-icon custom-icon-user-check icon-bold"
						style="font-size:40rpx;color:#155DFC;"></text>
					<view class="header-name font-bold font-m">
						当前陪诊服务
					</view>

				</view>
				<view class="u-flex align-center">
					<view class="badge-bg  badge-blue-bg  margin-right-10">
						剩余次数：{{ escort.escortCount }}次
					</view>
					<view class="font-blue font-s font-bold">
						执行中
					</view>
				</view>
			</view>
			<view class="staff-card radius-15 card-top bg-white card-border card-border-gray "
				@click="routeTo('caregiverOrder')">
				<image class="avatar" :src="escort.activeBooking.caregiverInfo.avatar || '/static/default-avatar.png'"
					mode="aspectFill"></image>
				<view class="info-wrap">
					<view class="font-m font-bold">照护师: {{ escort.activeBooking.caregiverInfo.name }}</view>
					<view class="time-row">
						<u-icon name="clock" color="#08b852" size="30rpx"></u-icon>
						<text>首日: {{ escort.activeBooking.caregiverInfo.date }}
							{{ getPeriodText(escort.activeBooking.caregiverInfo.period) }}</text>
					</view>
					<view class="tag">
						<u-icon name="checkmark-circle" color="#08b852" size="26rpx"></u-icon>
						<text>专业级保障中</text>
					</view>
				</view>
				<u-icon name="arrow-right" color="#999" size="34rpx"></u-icon>
			</view>

		</view>

		<view class="header-text">
			<view class="header-icon ">
				<u-icon name="heart" color="#fb2c36" :bold="true" size="40rpx"></u-icon>
				<view class="header-name font-bold font-m">
					术后健康知识库
				</view>
			</view>
			<view class="font-blue font-s font-bold" @click="showNotice = true">
				告知书
			</view>
		</view>
		<view v-for="item in articles" :key="item.id"
			class="my-article bg-white radius-15 card-border card-border-gray">
			<view class="u-flex align-center">
				<view class="img-wrapper">
					<image class="img-inner"
						:src="item.coverUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\' viewBox=\'0 0 300 200\'%3E%3Crect fill=\'%23f5f5f5\' width=\'300\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' fill=\'%23999\' font-size=\'18\' text-anchor=\'middle\' dy=\'.3em\'%3E暂无图片%3C/text%3E%3C/svg%3E'"
						:mode="item.coverUrl ? 'aspectFit' : 'aspectFill'"></image>
				</view>

				<view class="img-text" style="flex: 1; min-width: 0; margin-left:20rpx;">
					<view>
						<u-tag v-if="item.surgeryType" bgColor="#fef2f2" color="#fb2c36" borderColor="#fef2f2"
							:text="item.surgeryType" size="mini" plain-fill></u-tag>
					</view>
					<view class="font-bold font-s" style="margin: 10rpx 0;">
						{{ item.title || '-' }}
					</view>
					<view class="font-info font-s"
						style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
						{{ item.content || '' }}
					</view>
				</view>
			</view>
		</view>



		<!-- 告知书弹窗 -->
		<view class="notice-mask" v-if="showNotice" @click.self="showNotice = false">
			<view class="notice-card">
				<!-- 头部 -->
				<view class="notice-header">
					<view class="header-left">
						<view class="header-title-wrap">
							<view class="main-title">{{ getMeInformedConsent.title }}</view>
							<view class="sub-title">针对【{{ getMeInformedConsent.surgeryType }}】定制·临床康复指导</view>
						</view>
					</view>
					<view class="close-btn" @click="showNotice = false">×</view>
				</view>

				<!-- 顶部提示 -->
				<view class="tip-block">
					<text class="tip-icon">!</text>
					<text class="tip-text">重要提示：术后康复期请务必遵循主管医生与康复团队指导。如出现突发急性症状，请立即就近就医或联系在线医生。</text>
				</view>

				<!-- 章节1 -->
				<view class="section-block">
					<view class="section-title">
						<view class="blue-line"></view>
						<text>注意事项</text>
					</view>
					<view class="section-list">
						<view>
							{{ getMeInformedConsent.content }}
						</view>
					</view>
				</view>

				<!-- 底部来源 -->

				<!-- 确认按钮 -->
				<view class="confirm-btn" @click="MeInformedConsentByIdConfirm()">
					<text>我已阅读并知晓</text>
				</view>
			</view>
		</view>
		<myTabbar :current="0"></myTabbar>


	</view>

</template>


<script>
import {
	getMeHomeApi,
	getMeHealthArchiveApi,
	getMeMedicalRecordApi,
	getMeInformedConsentApi,
	getAppArticlesApi,
	postMeInformedConsentByIdConfirmApi,

} from '@/api/frontApikit.js'

import myTabbar from '@/components/myTabbar.vue'



export default {
	options: {
		styleIsolation: 'shared' // 解除小程序样式隔离，允许穿透样式生效
	},
	components: {
		myTabbar
	},
	data() {

		return {

			id: '',
			archivePatient: {},
			archiveScans: [],
			archiveGroups: [],
			archiveChartOpts: {
				color: ['#2b7fff', '#00b42a', '#f53f3f', '#ff7d00'],
				padding: [20, 20, 30, 20],
				xAxis: {
					disableGrid: true
				},
				yAxis: {
					splitNumber: 4
				}
			},
			showNotice: false,
			caregiverOption: {},
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
			archiveRange: 'all',
			archiveRanges: [{
				label: '全部时间',
				value: 'all'
			},
			{
				label: '近30天',
				value: '30'
			},
			{
				label: '近7天',
				value: '7'
			}
			],
			archiveExpanded: true,
			showAppendPopup: false,
			group: {},
			archivePatient: {},
			archiveScans: [],
			archiveChartOpts: {
				color: ['#15a05a', '#2f7ed8', '#f5a623'],
				padding: [12, 10, 0, 0],
				enableScroll: false,
				legend: {
					show: true,
					position: 'bottom',
					fontSize: 10,
					lineHeight: 24
				},
				xAxis: {
					disableGrid: true,
					fontSize: 10,
					fontColor: '#8a96a0'
				},
				yAxis: {
					gridType: 'dash',
					dashLength: 4,
					fontSize: 10,
					fontColor: '#a8b0af'
				},
				extra: {
					line: {
						type: 'curve',
						width: 2,
						activeType: 'none'
					}
				}
			},
			archiveGroups: [{
				key: 'tumor',
				index: '三',
				title: '肿瘤标志物',
				activeTab: 'latest',
				summary: '近6次复查肿瘤标志物均在参考范围内，CEA、CA19-9、CA125及CA15-3较前次轻度下降，整体趋势平稳，建议按术后随访计划继续复查。',
				categories: ['02-01', '02-10', '02-20', '03-01', '03-10', '03-18'],
				metrics: [{
					name: 'CEA',
					label: '癌胚抗原',
					value: '2.8',
					unit: 'ng/mL',
					range: '0-5',
					min: 0,
					max: 5,
					change: -5.2
				},
				{
					name: 'CA19-9',
					label: '糖类抗原19-9',
					value: '14.2',
					unit: 'U/mL',
					range: '0-37',
					min: 0,
					max: 37,
					change: -8.1
				},
				{
					name: 'CA125',
					label: '糖类抗原125',
					value: '12.8',
					unit: 'U/mL',
					range: '0-35',
					min: 0,
					max: 35,
					change: -3.6
				},
				{
					name: 'CA15-3',
					label: '糖类抗原15-3',
					value: '8.5',
					unit: 'U/mL',
					range: '0-25',
					min: 0,
					max: 25,
					change: -2.1
				}
				],
				trends: {
					CEA: [3.4, 3.2, 3.1, 3.0, 2.95, 2.8],
					'CA19-9': [17.5, 16.6, 15.9, 15.2, 15.4, 14.2],
					'CA125': [15.2, 14.8, 14.1, 13.6, 13.3, 12.8],
					'CA15-3': [9.8, 9.4, 9.2, 8.9, 8.7, 8.5]
				}
			},
			{
				key: 'blood',
				index: '四',
				title: '血常规',
				activeTab: 'latest',
				summary: '白细胞、红细胞、血小板总数保持稳定，但血红蛋白105g/L，呈轻度贫血表现，建议结合营养状态与医嘱随访。',
				categories: ['02-01', '02-10', '02-20', '03-01', '03-10', '03-18'],
				metrics: [{
					name: 'WBC',
					label: '白细胞',
					value: '6.2',
					unit: '×10^9/L',
					range: '3.5-9.5',
					min: 3.5,
					max: 9.5,
					change: -1.5
				},
				{
					name: 'HGB',
					label: '血红蛋白',
					value: '105',
					unit: 'g/L',
					range: '115-150',
					min: 115,
					max: 150,
					change: -2.3,
					abnormal: true
				},
				{
					name: 'PLT',
					label: '血小板',
					value: '216',
					unit: '×10^9/L',
					range: '125-350',
					min: 125,
					max: 350,
					change: -1.8
				},
				{
					name: 'NEUT%',
					label: '中性粒细胞比率',
					value: '58.2',
					unit: '%',
					range: '40-75',
					min: 40,
					max: 75,
					change: -0.4
				}
				],
				trends: {
					WBC: [6.7, 6.5, 6.4, 6.35, 6.3, 6.2],
					HGB: [111, 109, 108, 107, 106, 105],
					PLT: [228, 224, 221, 219, 220, 216],
					'NEUT%': [60.1, 59.6, 59.0, 58.8, 58.5, 58.2]
				}
			},
			{
				key: 'liver',
				index: '五',
				title: '肝功能 / 白蛋白营养',
				activeTab: 'latest',
				summary: '转氨酶与胆红素均在正常范围，白蛋白稳定；前白蛋白186mg/L偏低，提示近期营养储备轻度不足，建议加强蛋白质摄入并复查。',
				categories: ['02-01', '02-10', '02-20', '03-01', '03-10', '03-18'],
				metrics: [{
					name: 'ALT',
					label: '丙氨酸氨基转移酶',
					value: '24',
					unit: 'U/L',
					range: '9-50',
					min: 9,
					max: 50,
					change: -2.1
				},
				{
					name: 'AST',
					label: '天门冬氨酸氨基转移酶',
					value: '22',
					unit: 'U/L',
					range: '15-40',
					min: 15,
					max: 40,
					change: -1.6
				},
				{
					name: 'ALB',
					label: '白蛋白',
					value: '42',
					unit: 'g/L',
					range: '40-55',
					min: 40,
					max: 55,
					change: 0
				},
				{
					name: 'TBIL',
					label: '总胆红素',
					value: '12.8',
					unit: 'μmol/L',
					range: '3.4-20.5',
					min: 3.4,
					max: 20.5,
					change: -1.2
				},
				{
					name: 'PA',
					label: '前白蛋白',
					value: '186',
					unit: 'mg/L',
					range: '200-400',
					min: 200,
					max: 400,
					change: -4.8,
					abnormal: true
				}
				],
				trends: {
					ALT: [27, 26, 25.4, 24.8, 24.5, 24],
					AST: [24.5, 23.8, 23.2, 22.7, 22.4, 22],
					ALB: [41.8, 42.1, 41.9, 42.0, 42.0, 42],
					TBIL: [14.2, 13.7, 13.4, 13.1, 12.95, 12.8],
					PA: [218, 209, 202, 196, 192, 186]
				}
			}
			],
			advisorCard: {},
			consentPending: {},
			escort: {},
			monitor: {},
			postopDays: {},
			articles: [],

			getMeInformedConsent: {}

		};
	},
	onShow() {


	},
	onLoad(options) {
		const userInfo = this.readCurrentUser()
		this.id = userInfo.userId
		this.getData()
		this.getMeHealthArchiveApi()
		this.getMeInformedConsentApi()
		this.getAppArticlesApi()
		this.getMeMedicalRecordApi()
		// 1.先判断 data 是否存在，并且不是字符串"undefined"
		if (options.data && options.data !== "undefined") {
			try {
				const raw = decodeURIComponent(options.data)
				const obj = JSON.parse(raw);

				if (obj.dataName) {
					this.caregiverOption = obj
				}
			} catch (e) {
				console.error('JSON解析失败', e)
			}
		}



	},

	methods: {
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
		// 患者病历  目前是null
		async getMeMedicalRecordApi() {
			console.log('病例', this.id)
			try {
				const PatientsByIdMedicalRecord = await getMeMedicalRecordApi({
					id: this.id
				})
				console.log(PatientsByIdMedicalRecord)

			} catch (e) {
				console.log('报错：', e)
			}
		},
		getPeriodText(val) {
			const map = {
				MORNING: '上午',
				AFTERNOON: '下午'
			}
			return map[val] || val
		},
		// 判断是否异常
		isMetricAbnormal(metric) {
			if (!metric || metric.normal === undefined) return false
			return !metric.normal
		},
		// 变化样式：上升红色、下降绿色、持平灰色
		metricChangeClass(metric) {
			if (!metric || metric.change === undefined) return ''
			const val = Number(metric.change)
			if (val > 0) return 'up'
			if (val < 0) return 'down'
			return 'flat'
		},
		// 格式化变化值，自动带正负号
		formatChange(val) {
			if (val === undefined || val === null) return '-'
			const n = Number(val)
			return n > 0 ? `+${n}` : n
		},
		setMetricTab(group, tabName) {
			group.activeTab = tabName
		},
		// 判断指标异常
		isMetricAbnormal(metric) {
			if (!metric) return false
			if (metric.abnormal === true) return true
			if (metric.min === undefined || metric.max === undefined) return false
			const val = Number(metric.value)
			return val < metric.min || val > metric.max
		},
		// 涨跌样式class
		metricChangeClass(metric) {
			if (!metric || metric.change === undefined) return ''
			const v = Number(metric.change)
			if (v > 0) return 'up'
			if (v < 0) return 'down'
			return 'flat'
		},
		// 格式化变化值
		formatChange(val) {
			if (val === undefined || val === null) return '-'
			const n = Number(val)
			return n > 0 ? `+${n}` : n
		},
		// 组装图表数据，和你模板 getTrendChartData(group) 对应
		getTrendChartData(group) {
			return {
				categories: group.categories || [],
				series: group.metrics.map(m => {
					return {
						name: `${m.name} ${m.label}`,
						data: group.trends && group.trends[m.name] ? group.trends[m.name] : []
					}
				})
			}
		},

		// 舒张压 60~90 → 0~100
		getDbpPercent(val) {
			let pct = (val - 60) / 30 * 100
			// 限制 0-100，防止超标
			return Math.max(0, Math.min(100, pct))
		},
		// 收缩压 90~140 → 0~100
		getSbpPercent(val) {
			let pct = (val - 90) / 50 * 100
			return Math.max(0, Math.min(100, pct))
		},
		getWeightPercent(changeVal) {
			// 区间：-5 ~ +5
			const min = -5
			const max = 5
			let pct = ((changeVal - min) / (max - min)) * 100
			return Math.max(0, Math.min(100, pct))
		},
		getWeightColor(val) {
			if (val > 0) {
				return '#fdc700' // 上涨黄色
			} else {
				return '#f6339a' // 下降粉色
			}
		},
		// 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书）
		async getData() {
			try {
				if (!this.id) {
					console.warn('id为空，跳过请求')
					return
				}
				const data = await getMeHomeApi({
					id: this.id
				})
				// console.log(' 患者首页聚合（术后天数/顾问名片/健康监测/陪诊/待确认告知书）', data)

				console.log('待确认告知书', data.consentPending)
				console.log('陪诊', data.escort)
				console.log('术后天数', data.postopDays)
				this.postopDays = data.postopDays ?? null
				this.advisorCard = data.advisorCard || {}
				this.consentPending = data.consentPending || {}
				this.escort = data.escort || {}
				this.monitor = data.monitor || {}
				// console.log('', this.escort)
			} catch (e) {
				console.log('报错：', e)
			}
		},
		// 我的告知书列表（按术式匹配，含已确认标记）
		async getMeInformedConsentApi() {
			try {
				if (!this.id) {
					console.warn('id为空，跳过请求')
					return
				}
				const getMeInformedConsent = await getMeInformedConsentApi({
					id: this.id
				})
				this.getMeInformedConsent = getMeInformedConsent[0]
				// console.log('getMeInformedConsent：', this.getMeInformedConsent)
			} catch (e) {
				console.log('报错：', e)
			}
		},
		// 确认告知书
		async MeInformedConsentByIdConfirm() {
			console.log(this.consentPending.id)
			try {
				if (!this.consentPending.id) {
					console.warn('id为空，跳过请求')
					return
				}
				await postMeInformedConsentByIdConfirmApi({
					id: this.consentPending.id
				})
				this.showNotice = false
			} catch (e) {
				console.log('报错：', e)
			}
		},
		// 资讯/健康文章/心理健康内容（C端公开，按科室+术式）
		async getAppArticlesApi() {

			try {

				const getAppArticles = await getAppArticlesApi()
				this.articles = getAppArticles.list
				// console.log('文章', this.articles)
			} catch (e) {
				console.log('报错：', e)
			}
		},


		// 个人健康档案 我的健康档案（基本信息+肿瘤标志物/血常规/肝功能 records+historyTrend）
		async getMeHealthArchiveApi() {
			try {
				if (!this.id) {
					console.warn('id为空，跳过请求')
					return
				}
				const res = await getMeHealthArchiveApi({
					id: this.id
				})

				const basic = res.basicInfo
				this.archivePatient = basic
				console.log(1234, this.archivePatient)
				this.archiveScans = basic.scanDocs || [];

				const groupConfig = [{
					key: 'tumorMarkers',
					title: '肿瘤标志物',
					index: '三'
				},
				{
					key: 'bloodRoutine',
					title: '血常规',
					index: '四'
				},
				{
					key: 'liverNutrition',
					title: '肝功能 / 白蛋白营养',
					index: '五'
				}
				]

				this.archiveGroups = groupConfig.map(item => {
					const groupData = res[item.key] || {}
					const records = groupData.records || []
					const historyTrend = groupData.historyTrend || []

					let summary = ''
					if (records.length === 0) {
						summary = '暂无该分类检验记录'
					} else {
						summary = '指标已更新，请结合主治医生意见随访复查。'
					}

					const trends = {}
					const categories = []
					if (historyTrend && historyTrend.length > 0) {
						historyTrend.forEach(hd => {
							if (!categories.includes(hd.date)) {
								categories.push(hd.date)
							}
							if (!trends[hd.name]) {
								trends[hd.name] = []
							}
							trends[hd.name].push(Number(hd.value))
						})
					}

					return {
						key: item.key,
						index: item.index,
						title: item.title,
						activeTab: 'latest', // 默认打开最新指标
						summary: summary,
						metrics: records,
						categories: categories,
						trends: trends
					}
				})

				console.log('archiveGroups', this.archiveGroups)
			} catch (e) {
				console.log('报错：', e)
				uni.showToast({
					title: '档案加载失败',
					icon: 'none'
				})
			}
		},






		routeTo(res) {
			console.log(res)
			let routeUrl = "/pages/index/" + res + `?data=` + encodeURIComponent(JSON.stringify(this.caregiverOption))
			this.$safeJump(routeUrl)
		},
		setArchiveRange(value) {
			this.archiveRange = value;
		},
		toggleArchive() {
			this.archiveExpanded = !this.archiveExpanded;
		},
		setMetricTab(group, tab) {
			this.$set(group, 'activeTab', tab);
		},
		isMetricAbnormal(metric) {
			if (metric.abnormal) return true;
			const value = Number(metric.value);
			return !Number.isNaN(value) && (value < metric.min || value > metric.max);
		},
		formatChange(change) {
			const value = Number(change) || 0;
			return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
		},
		metricChangeClass(metric) {
			const value = Number(metric.change) || 0;
			if (value < 0) return 'is-down';
			if (value > 0) return 'is-up';
			return 'is-flat';
		},
		getTrendCategories(group) {
			if (this.archiveRange === '7') return group.categories.slice(-3);
			if (this.archiveRange === '30') return group.categories.slice(-5);
			return group.categories;
		},
		getTrendChartData(group) {
			const categories = this.getTrendCategories(group);
			const start = group.categories.length - categories.length;
			const colors = ['#15a05a', '#2f7ed8', '#f5a623'];
			const series = Object.keys(group.trends).slice(0, 3).map((key, index) => ({
				name: key,
				color: colors[index],
				data: group.trends[key].slice(start)
			}));
			return {
				categories,
				series
			};
		},
		openAppendPopup(group) {
			console.log(group)
			this.group = group
			this.showAppendPopup = true;
		},
		closeAppendPopup() {
			this.showAppendPopup = false;
		},
		refreshScan() {
			this.chooseRecord('camera');
		},
		previewScan(scan) {
			uni.showToast({
				title: scan.name,
				icon: 'none'
			});
		},
		chooseRecord(source) {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: [source === 'camera' ? 'camera' : 'album'],
				success: () => {
					this.closeAppendPopup();
					uni.showToast({
						title: '已选择图片，mock上传成功',
						icon: 'none'
					});
				},
				fail: () => { }
			});
		}

	},


};
</script>

<style scoped>
.font-pink {
	color: #f6339a;
}

.font-yellow {
	color: #fdc700;
}

.ha-empty {
	padding: 40rpx 0;
	text-align: center;
	font-size: 26rpx;
	color: #999;
}

.staff-card {
	display: flex;
	align-items: center;
	padding: 36rpx 32rpx;
	background: #ffffff;
	border-radius: 40rpx;
	background-image: radial-gradient(circle at 95% 10%, #ecfcf0 0%, transparent 40%);

}

.staff-card .avatar {
	width: 140rpx;
	height: 140rpx;
	border-radius: 28rpx;
	margin-right: 28rpx;
}

.staff-card .info-wrap {
	flex: 1;
}

.staff-card .name-row {
	font-size: 42rpx;
	font-weight: bold;
	color: #111;
	margin-bottom: 12rpx;
}

.staff-card .time-row {
	display: flex;
	align-items: center;
	font-size: 25rpx;
	color: #089944;
	margin: 16rpx 0;
}

.staff-card .tag {
	display: flex;
	align-items: center;
	background: #ecfcf0;
	color: #089944;
	font-size: 28rpx;
	padding: 12rpx 20rpx;
	border-radius: 16rpx;
	width: fit-content;
}

.page-home {}

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

.health-archive {
	position: relative;
	margin: 20rpx 0 30rpx;
}

.ha-panel {
	background: #ffffff;
	border-radius: 22rpx;
	box-shadow: 0 8rpx 28rpx rgba(22, 60, 45, 0.06);
}

.ha-archive-head {
	position: relative;
	padding: 28rpx;
	margin-bottom: 22rpx;
	background: linear-gradient(135deg, #ffffff 0%, #f3fbf6 100%);
}

.ha-title {
	font-size: 34rpx;
	line-height: 48rpx;
	font-weight: 700;
	color: #172b22;
}

.ha-subtitle {
	margin-top: 8rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #718078;
	padding-right: 190rpx;
}

.ha-status {
	position: absolute;
	right: 28rpx;
	top: 30rpx;
	display: flex;
	align-items: center;
	font-size: 22rpx;
	color: #159e58;
}

.ha-status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #16b765;
	margin-right: 8rpx;
	box-shadow: 0 0 0 6rpx rgba(22, 183, 101, 0.12);
}

.ha-filter-row {
	display: flex;
	margin-top: 24rpx;
	background: #f1f5f2;
	border-radius: 999rpx;
	padding: 6rpx;
}

.ha-filter-pill {
	flex: 1;
	height: 48rpx;
	line-height: 48rpx;
	text-align: center;
	font-size: 24rpx;
	color: #65736d;
	border-radius: 999rpx;
}

.ha-filter-pill.is-active {
	color: #ffffff;
	font-weight: 700;
	background: #15a05a;
	box-shadow: 0 6rpx 16rpx rgba(21, 160, 90, 0.22);
}

.ha-patient-card {
	padding: 28rpx;
}

.ha-patient-summary {
	display: flex;
	align-items: flex-start;
}

.ha-avatar {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #18b566, #0e8f4d);
	color: #ffffff;
	font-size: 36rpx;
	font-weight: 700;
	text-align: center;
	line-height: 88rpx;
	margin-right: 22rpx;
	flex-shrink: 0;
}

.ha-patient-main {
	flex: 1;
	min-width: 0;
}

.ha-name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
}

.ha-name {
	font-size: 34rpx;
	font-weight: 700;
	color: #182b22;
	margin-right: 12rpx;
}

.ha-built-tag {
	font-size: 20rpx;
	color: #15a05a;
	border: 1rpx solid rgba(21, 160, 90, 0.35);
	background: #edf9f2;
	border-radius: 999rpx;
	padding: 3rpx 12rpx;
	margin-right: 12rpx;
}

.ha-gender {
	font-size: 24rpx;
	color: #7b8a82;
}

.ha-diagnosis,
.ha-surgery,
.ha-update-row {
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #52625a;
}

.ha-update-row {
	display: flex;
	align-items: center;
	color: #159e58;
}

.ha-update-row text {
	margin-left: 8rpx;
}

.ha-chevron {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.25s ease;
}

.ha-chevron.is-open {
	transform: rotate(180deg);
}

.ha-expanded {
	margin-top: 26rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #edf1ee;
}

.ha-section {
	margin-bottom: 28rpx;
}

.ha-section:last-child {
	margin-bottom: 0;
}

.ha-section-title {
	display: flex;
	align-items: center;
	font-size: 29rpx;
	font-weight: 700;
	color: #1e3028;
	margin-bottom: 20rpx;
}

.ha-title-line {
	display: flex;
	align-items: center;
}

.ha-title-mark {
	width: 8rpx;
	height: 30rpx;
	border-radius: 999rpx;
	background: #15a05a;
	margin-right: 12rpx;
}

.ha-section-between {
	justify-content: space-between;
}

.ha-form-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	background: #f8fbf9;
	border-radius: 18rpx;
	padding: 8rpx 20rpx;
}

.ha-form-item {
	width: 48%;
	min-height: 60rpx;
	line-height: 60rpx;
	display: flex;
	flex-direction: row;
	justify-content: start;
	/* border-bottom: 1rpx solid #edf2ef; */
}

.ha-form-item.ha-full {
	width: 100%;
}

.ha-form-label {
	font-size: 22rpx;
	color: #8b9892;
	line-height: 60rpx;
}

.ha-form-value {
	font-size: 22rpx;
	color: #263238;
	line-height: 60rpx;
	margin-left: 15rpx;
}

.ha-note-block {
	background: #f7faf7;
	border: 1rpx solid #edf3ee;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-top: 18rpx;
}

.ha-note-label {
	font-size: 24rpx;
	font-weight: 700;
	color: #304239;
	margin-bottom: 10rpx;
}

.ha-note-text {
	font-size: 24rpx;
	line-height: 38rpx;
	color: #64726b;
}

.ha-camera-btn {
	display: flex;
	align-items: center;
	height: 52rpx;
	padding: 0 18rpx;
	font-size: 22rpx;
	color: #15a05a;
	background: #edf9f2;
	border: 1rpx solid rgba(21, 160, 90, 0.24);
	border-radius: 999rpx;
}

.ha-camera-btn text {
	margin-left: 6rpx;
}

.ha-scan-list {
	display: flex;
}

.ha-scan-card {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	padding: 18rpx;
	border: 1rpx solid #e6eee9;
	border-radius: 18rpx;
	background: #fbfdfc;
	margin-right: 18rpx;
}

.ha-scan-card:last-child {
	margin-right: 0;
}

.ha-scan-icon {
	width: 76rpx;
	height: 76rpx;
	border-radius: 18rpx;
	background: #eaf8f0;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.ha-scan-info {
	flex: 1;
	min-width: 0;
}

.ha-scan-name {
	font-size: 25rpx;
	font-weight: 700;
	color: #273930;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.ha-scan-meta {
	margin-top: 8rpx;
	font-size: 21rpx;
	color: #93a099;
}

.ha-lab-card {
	background: #fcfefd;
	border: 1rpx solid #edf3ef;
	border-radius: 20rpx;
	padding: 22rpx;
}



.ha-metric-row {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #eef3f0;
}

.ha-metric-row:last-child {
	border-bottom: 0;
}

.ha-metric-name {
	width: 210rpx;
	flex-shrink: 0;
}

.ha-metric-code {
	display: block;
	font-size: 27rpx;
	font-weight: 700;
	color: #24352c;
	line-height: 36rpx;
}

.ha-metric-label {
	display: block;
	margin-top: 4rpx;
	font-size: 21rpx;
	color: #8b9892;
	transform: scale(0.92);
	transform-origin: left center;
}

.ha-metric-range {
	flex: 1;
	min-width: 0;
	font-size: 21rpx;
	line-height: 32rpx;
	color: #98a49e;
	padding-right: 12rpx;
}

.ha-metric-right {
	width: 170rpx;
	text-align: right;
	flex-shrink: 0;
}

.ha-metric-value {
	font-size: 32rpx;
	line-height: 40rpx;
	font-weight: 700;
	color: #1f3128;
}

.ha-metric-value.is-abnormal {
	color: #e84a4a;
}

.ha-metric-unit {
	font-size: 19rpx;
	font-weight: 400;
	margin-left: 4rpx;
}

.ha-change {
	margin-top: 4rpx;
	font-size: 20rpx;
	line-height: 28rpx;
}

.ha-change.is-down {
	color: #159e58;
}

.ha-change.is-up {
	color: #e84a4a;
}

.ha-change.is-flat {
	color: #98a49e;
}

.ha-chart-box {
	width: 100%;
	height: 360rpx;
}

.ha-analysis {
	margin-top: 18rpx;
	padding: 20rpx;
	border-radius: 18rpx;
	background: #f0faf4;
}

.ha-analysis-head {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	font-weight: 700;
	color: #14804b;
}

.ha-analysis-head text {
	margin-left: 8rpx;
}

.ha-analysis-text {
	margin-top: 10rpx;
	font-size: 23rpx;
	line-height: 36rpx;
	color: #4f6659;
}

.ha-add-record {
	/* position: fixed;
		right: 28rpx;
		bottom: 150rpx;
		z-index: 20; */
	height: 50rpx;
	padding: 0 26rpx;
	border-radius: 10rpx;
	background: linear-gradient(135deg, #1ab869, #0d944e);
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 12rpx 28rpx rgba(21, 160, 90, 0.32);
	font-size: 16rpx;
	font-weight: 700;
}

.ha-add-record text {
	margin-left: 8rpx;
}

.ha-popup {
	padding: 30rpx 28rpx 36rpx;
	border-radius: 28rpx 28rpx 0 0;
	background: #ffffff;
}

.ha-popup-head {
	position: relative;

	margin-bottom: 36rpx;
}

.ha-popup-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #1e3028;
	width: 100%;
}

.ha-popup-subtitle {
	font-size: 20rpx;
	margin-top: 14rpx;
	color: #999;
	width: 100%;
}

.ha-popup-close {
	position: absolute;
	right: 0;
	top: 0;
	width: 52rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.ha-upload-option {
	display: flex;
	align-items: center;
	padding: 24rpx;
	border-radius: 20rpx;
	background: #f7faf8;
	border: 1rpx solid #e8f0eb;
	margin-bottom: 18rpx;
}

.ha-upload-icon {
	width: 84rpx;
	height: 84rpx;
	border-radius: 22rpx;
	background: #e8f8ef;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.ha-upload-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #25372e;
	line-height: 40rpx;
}

.ha-upload-desc {
	margin-top: 4rpx;
	font-size: 22rpx;
	color: #8b9892;
	line-height: 32rpx;
}

.ha-popup-tip {
	text-align: center;
	font-size: 22rpx;
	color: #9aa69f;
	margin: 12rpx 0 24rpx;
}

.ha-popup-cancel {
	height: 84rpx;
	line-height: 84rpx;
	text-align: center;
	border-radius: 999rpx;
	background: #f2f6f3;
	color: #53625a;
	font-size: 28rpx;
	font-weight: 700;
}

.card-top {
	/* display: block; */
}

.notice-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	padding: 30rpx;
}

.notice-card {
	width: 100%;
	max-width: 680rpx;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-sizing: border-box;
	max-height: 90vh;
	overflow-y: auto;
}

.notice-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.header-left {
	display: flex;
	align-items: center;
}

.doc-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 16rpx;
	background-color: #1677ff;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-right: 20rpx;
}

.main-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #111;
}

.sub-title {
	font-size: 24rpx;
	color: #666;
	margin-top: 20rpx;
}

.close-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background-color: #f5f7fa;
	text-align: center;
	line-height: 56rpx;
	font-size: 32rpx;
	color: #666;
}

.tip-block {
	background-color: #e8f3ff;
	border-radius: 12rpx;
	padding: 20rpx;
	display: flex;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.tip-icon {
	color: #1677ff;
	font-weight: bold;
}

.tip-text {
	font-size: 26rpx;
	color: #1677ff;
	line-height: 1.6;
}

.section-block {
	background-color: #fbfcfe;
	border-radius: 14rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
}

.section-title {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	font-weight: 600;
	color: #222;
	margin-bottom: 16rpx;
}

.blue-line {
	width: 8rpx;
	height: 30rpx;
	background-color: #1677ff;
	border-radius: 4rpx;
	margin-right: 12rpx;
}

.section-list {
	font-size: 26rpx;
	color: #333;
	line-height: 1.7;
}

.list-item {
	margin-bottom: 10rpx;
}

.warning-block {
	background-color: #fff2f2;
}

.warning-title {
	color: #d93025;
}

.red-line {
	width: 8rpx;
	height: 30rpx;
	background-color: #d93025;
	border-radius: 4rpx;
	margin-right: 12rpx;
}

.warning-text {
	color: #d93025;
	font-weight: 500;
}

.source-text {
	text-align: center;
	font-size: 24rpx;
	color: #888;
	margin: 16rpx 0 32rpx;
}

.confirm-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background-color: #1677ff;
	color: #fff;
	text-align: center;
	border-radius: 44rpx;
	font-size: 30rpx;
	font-weight: 500;
}

.ha-section {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	padding: 24rpx;
}

.ha-section-title {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.ha-title-mark {
	width: 6rpx;
	height: 28rpx;
	background: #2b7fff;
	border-radius: 3rpx;
	margin-right: 12rpx;
}

.ha-tabs {
	display: flex;
}

.ha-tab {
	position: relative;

	padding: 8rpx 20rpx;
	padding-bottom: 20rpx;
	font-size: 26rpx;
	color: #666;
}

.ha-tab.is-active {
	color: #00a64c;
}

.ha-line {
	position: absolute;
	left: 32rpx;
	bottom: 0;
	width: calc(100% - 64rpx);
	height: 6rpx;
	background: transparent;
}

.ha-tab.is-active .ha-line {
	background-color: #00a64c;
}

.ha-tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 20rpx;
}




.ha-metric-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #eee;
}

.ha-metric-name {
	width: 220rpx;
}

.ha-metric-code {
	font-weight: bold;
}

.ha-metric-label {
	font-size: 24rpx;
	color: #666;
	margin-left: 8rpx;
}

.ha-metric-range {
	font-size: 24rpx;
	color: #666;
}

.ha-metric-right {
	text-align: right;
}

.ha-metric-value {
	font-weight: bold;
}

.is-abnormal {
	color: #f53f3f;
}

.ha-metric-unit {
	font-size: 24rpx;
	color: #666;
	margin-left: 4rpx;
}

.ha-change {
	font-size: 22rpx;
	margin-top: 4rpx;
}

.ha-change.up {
	color: #f53f3f;
}

.ha-change.down {
	color: #00b42a;
}

.ha-change.flat {
	color: #86909c;
}

.ha-empty {
	text-align: center;
	padding: 30rpx 0;
	color: #999;
}

.ha-trend-wrap {}

.ha-chart-box {
	width: 100%;
	height: 400rpx;
}

.ha-analysis {
	margin-top: 20rpx;
	background: #fff9e8;
	border-radius: 12rpx;
	padding: 16rpx;
}

.ha-analysis-head {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.ha-analysis-text {
	font-size: 26rpx;
	line-height: 1.6;
	color: #444;
}

.staff-card {
	display: flex;
	align-items: center;
	padding: 24rpx;
	gap: 20rpx;
	position: relative;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #f4f4f4;
}

.info-wrap {
	flex: 1;
}

.time-row {
	display: flex;
	align-items: center;
	margin: 10rpx 0;
	font-size: 26rpx;
	color: #666;
	gap: 6rpx;
}

.tag {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	color: #08b852;
	gap: 4rpx;
}
</style>