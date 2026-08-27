<template>
  <view class="custom-tabbar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      @click="onTabClick(index)"
    >
      <u-icon
        :name="item.icon"
        :color="current === index ? selectedColor : color"
        size="48rpx"
		
      ></u-icon>
      <text
        class="tab-text"
        :style="{color: current === index ? selectedColor : color}"
      >
        {{ item.text }}
      </text>
    </view>
    <view class="safe-area"></view>
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
      selectedColor: "#9810fa",
      tabList: [
        {
          pagePath: "/pages/index/onsite",
          icon: "home",
          text: "首页"
        },
        {
          pagePath: "/pages/index/service",
          icon: "hourglass",
          text: "服务中"
        },
        {
          pagePath: "/pages/index/mine",
          icon: "account",
          text: "我的"
        }
      ]
    };
  },
  methods: {
    onTabClick(index) {
      const item = this.tabList[index];
      uni.switchTab({
        url: item.pagePath
      });
    }
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
.safe-area {
  position: absolute;
  width: 100%;
  height: var(--safe-area-inset-bottom);
  bottom: calc(-1 * var(--safe-area-inset-bottom));
  background: #ffffff;
}
</style>
