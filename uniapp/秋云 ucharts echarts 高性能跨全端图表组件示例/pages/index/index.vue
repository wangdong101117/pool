<template>
  <view class="content">
    <block v-for="(item, index) in list" :key="index">
      <view class="list-box" @tap="gotourl(item.url)">{{item.name}}</view>
    </block>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [
        {name:"全端uCharts渲染图表",url:"../ucharts/ucharts"},
        {name:"H5、App用ECharts，其他端用uCharts",url:"../echarts/echarts"},
        {name:"uniCloud数据渲染图表",url:"../unicloud/unicloud"},
        {name:"动态更新数据示例",url:"../updata/updata"},
        {name:"图表交互示例",url:"../other/other"},
        {name:"uCharts的formatter用法",url:"../format-u/format-u"},
        {name:"ECharts的formatter用法",url:"../format-e/format-e"},
        {name:"Tab选项卡切换示例",url:"../tab/tab"},
        {name:"特殊布局示例",url:"../layout/layout"},
        {name:"原生用法示例（非组件）",url:"../canvas/canvas"},
      ],
    }
  },
  onReady() {
  },
  methods: {
    gotourl(url) {
      uni.navigateTo({
          url: url
      });
    },
  }
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  padding-bottom: 40px;
}
.list-box{
  text-align: center;
  margin-top: 40px;
  line-height: 40px;
  width: 80%;
  border: 1 px solid #317ac3;
  border-radius: 5px;
  background: #409EFF;
  font-size: 20px;
  color: #FFFFFF;
}
</style>
