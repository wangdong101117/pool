<template>
  <view class="content">
    <view class="uni-tabs__header">
    	<view class="uni-tabs__nav-wrap">
    		<view class="uni-tabs__nav-scroll">
    			<scroll-view class="uni-tabs__nav" :scroll-x="true">
    				<block v-for="(item, index) in menus" :key="index">
    					<view @click="switchTab(item.value)" :class="{'is-active':currentTab===item.value}" class="uni-tabs__item">{{item.text}}</view>
    				</block>
    			</scroll-view>
    		</view>
    	</view>
    </view>
    <view v-show="currentTab==='ucharts1'">
      <!-- 如果tab切换的父容器使用了v-show来控制显示，组件上需绑定reshow属性用于强制重新渲染图表。如组件父元素没有v-show，则不必传此参数。-->
      <qiun-title-bar title="基本柱状图"/>
      <view class="charts-box">
      <!-- 这里因为是页面初始化默认显示的，如果不给reshow也会显示，切换回来也不会变成白板，但切换到其他tab后，改变了窗口尺寸再切换回来后，没有reshow则不会根据改变后的窗口自动适应（除非在当前tab显示的情况下再变更窗口大小才会自适应），所以建议加上reshow属性 -->
        <qiun-data-charts type="column" :chartData="chartsDataColumn1" />
      </view>
      <qiun-title-bar title="堆叠柱状图"/>
      <view class="charts-box">
        <!-- 这个图加了reshow属性，上图没加，可以对比一下差异 -->
        <qiun-data-charts type="column" :opts="{extra:{column:{type:'stack'}}}" :chartData="chartsDataColumn2" :reshow="currentTab==='ucharts1'"/>
      </view>
      
    </view>
    <view v-if="currentTab==='ucharts2'">
        <!-- 第二个选项卡页面，用v-if控制则不需要加reshow，父元素使用v-if后，会导致组件重新加载，造成资源浪费 -->
      <qiun-title-bar title="基本饼状图"/>
      <view class="charts-box">
        <qiun-data-charts type="pie" :chartData="chartsDataPie1"/>
      </view>
      <qiun-title-bar title="环形图"/>
      <view class="charts-box">
        <qiun-data-charts type="ring" :opts="{extra:{ring:{ringWidth: 60,linearType:'custom'}}}" :chartData="chartsDataRing1"/>
      </view>
    </view>
    <view v-show="currentTab==='echarts1'">
      <qiun-title-bar title="基本折线图"/>
      <view class="charts-box">
        <qiun-data-charts type="line" :chartData="chartsDataLine1" :echartsH5="true" :echartsApp="true" :reshow="currentTab==='echarts1'"/>
      </view>
      <qiun-title-bar title="基本柱状图" />
      <view class="charts-box">
        <qiun-data-charts type="column" :chartData="chartsDataColumn1" :echartsH5="true" :echartsApp="true" :reshow="currentTab==='echarts1'"/>
      </view>
    </view>
    <!-- ECharts如果父元素用了v-if，因renderjs与逻辑层通信不同步，可能会导致初始化时监听不到prop变化，不能成功初始化，虽然组件内使用延时200ms的方法返回逻辑层强制重新读取数据，但这不是正确的解决问题的办法，并且父元素使用了 v-if 会导致组件重新加载，造成资源浪费，强烈建议将v-if改成v-show！！！ -->
    <view v-if="currentTab==='echarts2'">
      <qiun-title-bar title="基本柱状图"/>
      <view class="charts-box">
        <qiun-data-charts type="column" :chartData="chartsDataColumn1" :echartsH5="true" :echartsApp="true" :reshow="currentTab==='echarts2'"/>
      </view>
      <qiun-title-bar title="基本折线图" />
      <view class="charts-box">
        <qiun-data-charts type="line" :chartData="chartsDataLine1" :echartsH5="true" :echartsApp="true" :reshow="currentTab==='echarts2'"/>
      </view>
    </view>
  </view>
</template>

<script>
//下面是演示数据，您的项目不需要引用，数据需要您从服务器自行获取
import demodata from '@/mockdata/demodata.json';

export default {
  data() {
    return {
      chartsDataColumn1:{},
      chartsDataColumn2:{},
      chartsDataPie1:{},
      chartsDataRing1:{},
      chartsDataLine1:{},
      chartsDataLine2:{},
      menus:[{text:"uCharts图1",value:"ucharts1"},{text:"uCharts图2",value:"ucharts2"},{text:"ECharts图1",value:"echarts1"},{text:"ECharts图2",value:"echarts2"}],
      currentTab: 'ucharts1',
    };
  },
  onLoad() {
    //模拟从服务器获取数据
    this.getServerData()
  },
  methods: {
    getServerData() {
      setTimeout(() => {
      	//因部分数据格式一样，这里不同图表引用同一数据源的话，需要深拷贝一下构造不同的对象
      	//开发者需要自行处理服务器返回的数据，应与标准数据格式一致，注意series的data数值应为数字格式
        this.chartsDataColumn1=JSON.parse(JSON.stringify(demodata.Column))
        this.chartsDataColumn2=JSON.parse(JSON.stringify(demodata.Column))
        this.chartsDataPie1=JSON.parse(JSON.stringify(demodata.PieA))
        this.chartsDataRing1=JSON.parse(JSON.stringify(demodata.PieA))
        this.chartsDataLine1=JSON.parse(JSON.stringify(demodata.Line))
        this.chartsDataLine2=JSON.parse(JSON.stringify(demodata.Line))
      }, 1500);
    },
    switchTab(tab) {
    	this.currentTab = tab
    },
  }
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.charts-box {
  width: 100%;
  height: 300px;
}
</style>
