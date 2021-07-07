<template>
  <view>
    <view class="charts-box">
      <qiun-data-charts type="column" :opts="{dataLabel:false}" :chartData="chartsDataColumn1" :canvas2d="true" canvasId="componentsinit"  />
    </view>
  </view>
</template>

<script>
//下面是演示数据，您的项目不需要引用，数据需要您从服务器自行获取
import demodata from '@/mockdata/demodata.json';

export default {
  name: 'test-charts',
  props: {
    pageScrollTop: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      chartsDataColumn1: {},
    };
  },
  //新手注意了，组件里没有onLoad事件！！！
  mounted() {
    this.getServerData()
  },
  methods: {
    getServerData() {
      setTimeout(() => {
      	//因部分数据格式一样，这里不同图表引用同一数据源的话，需要深拷贝一下构造不同的对象
      	//开发者需要自行处理服务器返回的数据，应与标准数据格式一致，注意series的data数值应为数字格式
        this.chartsDataColumn1=JSON.parse(JSON.stringify(demodata.Column))
        
      }, 1500);
    },
  }
};
</script>

<style>
  .charts-box {
    width: 100%;
    height: 300px;
  }
</style>
