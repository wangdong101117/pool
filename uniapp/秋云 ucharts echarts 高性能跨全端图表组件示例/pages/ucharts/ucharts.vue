<template>
  <view class="content">
    <qiun-title-bar title="基本柱状图"/>
    <!--
    极简调用示例，只需指定type及chartData即可。
    图表默认配置请修改js_sdk/u-charts/config-ucharts.js对应图表类型下配置 
    注：1、更新前请自行备份config-ucharts.js、config-echarts.js，以免被覆盖
    2、此方式调用组件chartData需自行按图表类型需求的数据格式拼接
    配置参数请用在线生成工具(http://demo.ucharts.cn/)生成
    3、class="charts-box"这个样式，指定了高度，如果你的父元素有固定高度，请修改为height:100%
    -->
    <view class="charts-box">
      <qiun-data-charts type="column" :chartData="chartsDataColumn1" />
    </view>
    <qiun-title-bar title="堆叠柱状图"/>
    <!-- 只需要在:opts中传入与config-ucharts.js中默认配置不同的属性即可覆盖默认配置，既保证了全局图表样式的统一性，也减少了代码量与包体积 -->
    <view class="charts-box">
      <qiun-data-charts type="column" :opts="{extra:{column:{type:'stack'}}}" :chartData="chartsDataColumn2"/>
    </view>
    <qiun-title-bar title="温度计图表"/>
    <view class="charts-box">
      <qiun-data-charts type="column" :opts="{extra:{column:{type:'meter'}}}" :chartData="chartsDataColumn3"/>
    </view>
    <qiun-title-bar title="柱状图滚动条"/>
    <!-- 开启滚动条，需要开启拖动功能，即:ontouch="true" ，微信小程序需要开启canvas2d，否则会很卡，开启2d需要指定canvasId -->
    <view class="charts-box">
      <qiun-data-charts type="column" canvasId="scrollcolumnid" :opts="{enableScroll:true,xAxis:{scrollShow:true,itemCount:4,disableGrid:true}}" :ontouch="true" :canvas2d="true" :chartData="chartsDataColumn4"/>
    </view>
    <qiun-title-bar title="圆角+渐变+半透明柱状图"/>
    <view class="charts-box">
      <qiun-data-charts type="column" :opts="{color:['#FAC858','#EE6666'],extra:{column:{linearType:'custom',seriesGap:5,linearOpacity:0.5,barBorderCircle:true,customColor:['#FA7D8D','#EB88E2']}}}" :chartData="chartsDataColumn5"/>
    </view>
    <qiun-title-bar title="全圆角柱状图+标记线"/>
    <view class="charts-box">
      <qiun-data-charts type="column" :opts="{yAxis:{data:[{min:0}]},enableMarkLine:true,extra:{column:{seriesGap:5,barBorderRadius:[6,6,6,6]},markLine:{data:[{value:21,showLabel:true}]}}}" :chartData="chartsDataColumn6" />
    </view>
    <qiun-title-bar title="柱状图横屏模式"/>
    <view style="width: 100%;height: 500px;">
      <qiun-data-charts type="column" :opts="{rotate:true}" :chartData="chartsDataColumn1" />
    </view>
    <qiun-title-bar title="基本折线图"/>
    <view class="charts-box">
      <qiun-data-charts type="line" :chartData="chartsDataLine1"/>
    </view>
    <qiun-title-bar title="基本曲线图(自定义图表类型)"/>
    <view class="charts-box">
      <!-- 这里的type="demotype"演示了自定义图表类型的demo，您可以根据需求自己定义一种额外的图表类型 -->
      <qiun-data-charts type="demotype" :opts="{xAxis:{boundaryGap:'justify'}}" :chartData="chartsDataLine2"/>
      <!-- 如果不定义"demotype"这个图表类型，可以通过传递opts来覆盖line下的默认配置，如下 -->
      <!-- <qiun-data-charts type="line" :opts="{extra:{line:{type:'curve'}}}" :chartData="chartsData.Line2"/> -->
    </view>
    <qiun-title-bar title="基本时序图"/>
    <view class="charts-box">
      <qiun-data-charts type="line" :opts="{extra:{line:{type:'step'}}}" :chartData="chartsDataLine3"/>
    </view>
    <qiun-title-bar title="折线图滚动条"/>
    <!-- 开启滚动条，需要开启拖动功能，即:ontouch="true"，微信小程序需要开启canvas2d，否则会很卡，开启2d需要指定canvasId -->
    <view class="charts-box">
      <qiun-data-charts type="line" canvasId="scrolllineid" :opts="{enableScroll:true,xAxis:{scrollShow:true,itemCount:4,disableGrid:true}}" :chartData="chartsDataLine4" :ontouch="true" :canvas2d="true"/>
    </view>
    <qiun-title-bar title="折线图+断点续连connectNulls"/>
    <view class="charts-box">
      <qiun-data-charts type="line" :chartData="chartsDataLine5"/>
    </view>
    <qiun-title-bar title="时间轴(矢量轴)折线图"/>
    <!-- 矢量轴图表支持折线图、区域图、散点图、气泡图。需要注意chartData中，如果是矢量轴，则不能带categories -->
    <view class="charts-box">
      <qiun-data-charts type="tline" :opts="{yAxis:{data:[{min:0,max:80}]}}" :chartData="chartsDataTLine" />
    </view>
    <qiun-title-bar title="基本折线区域图"/>
    <view class="charts-box">
      <qiun-data-charts type="area" :chartData="chartsDataArea1"/>
    </view>
    <qiun-title-bar title="渐变色时序区域图"/>
    <view class="charts-box">
      <qiun-data-charts type="area" :opts="{extra:{area:{type:'step',addLine:true,gradient:true}}}" :chartData="chartsDataArea2"/>
    </view>
    <qiun-title-bar title="渐变色曲线区域图"/>
    <view class="charts-box">
      <qiun-data-charts type="area" :opts="{extra:{area:{type:'curve',addLine:true,gradient:true}}}" :chartData="chartsDataArea2"/>
    </view>
    <qiun-title-bar title="时间轴(矢量轴)区域图"/>
    <!-- 矢量轴图表支持折线图、区域图、散点图、气泡图。需要注意chartData中，如果是矢量轴，则不能带categories -->
    <view class="charts-box">
      <qiun-data-charts type="tarea" :opts="{xAxis:{format:'xAxisDemo2'},yAxis:{data:[{min:0,max:80}]}}" :chartData="chartsDataTLine" />
    </view>
    <qiun-title-bar title="散点图"/>
    <view class="charts-box">
      <qiun-data-charts type="scatter" :chartData="chartsDataScatter" />
    </view>
    <qiun-title-bar title="气泡图"/>
    <view class="charts-box">
      <qiun-data-charts type="bubble" :chartData="chartsDataBubble" />
    </view>
    <qiun-title-bar title="多坐标系混合图"/>
    <view class="charts-box" style="height: 400px;">
      <qiun-data-charts type="mix" :opts="{yAxis:{data:[{position: 'left',title: '折线'},{position: 'right',min: 0,max: 200,title: '柱状图',textAlign: 'left'},{position: 'right',min: 0,max: 200,title: '点',textAlign: 'left'}]}}" :chartData="chartsDataMix1"/>
    </view>
    <qiun-title-bar title="基本饼状图"/>
    <view class="charts-box">
      <qiun-data-charts type="pie" :chartData="chartsDataPie1"/>
    </view>
    <qiun-title-bar title="环形图+渐变色"/>
    <view class="charts-box">
      <qiun-data-charts type="ring" :opts="{legend:{position: 'bottom'},extra:{ring:{ringWidth: 60,linearType:'custom',centerColor:'#FF0'}}}" :chartData="chartsDataRing1"/>
    </view>
    <qiun-title-bar title="面积玫瑰图"/>
    <view class="charts-box">
      <qiun-data-charts type="rose" :opts="{legend:{position: 'bottom'}}" :chartData="chartsDataRose1"/>
    </view>
    <qiun-title-bar title="半径玫瑰图"/>
    <view class="charts-box">
      <qiun-data-charts type="rose" :opts="{legend:{position: 'bottom'},extra:{rose:{type:'radius'}}}" :chartData="chartsDataRose2"/>
    </view>
    <qiun-title-bar title="圆弧进度条"/>
    <!-- 这里的title.name和subtitle.name如果需要联动chartData，请定义一个变量同步传入:opts和:chartData中 -->
    <view class="charts-box">
      <qiun-data-charts type="arcbar" :opts="{title:{name:'80%',color:'#2fc25b',fontSize:35},subtitle:{name:'正确率',color:'#666666',fontSize:25}}" :chartData="chartsDataArcbar1"/>
    </view>
    <qiun-title-bar title="多重圆弧进度条"/>
    <view class="charts-box">
      <qiun-data-charts type="arcbar" :opts="{title:{name:'指标',color:'#1890ff',fontSize:35},subtitle:{},extra:{arcbar:{type:'circle',startAngle:1.5}}}" :chartData="chartsDataArcbar2"/>
    </view>
    <qiun-title-bar title="多边形雷达图"/>
    <view class="charts-box">
      <qiun-data-charts type="radar" :opts="{legend:{position: 'bottom'},extra:{radar:{border:true}}}" :chartData="chartsDataRadar1"/>
    </view>
    <qiun-title-bar title="圆形雷达图"/>
    <view class="charts-box">
      <qiun-data-charts type="radar" :opts="{legend:{position: 'bottom'},extra:{radar:{gridType:'circle'}}}" :chartData="chartsDataRadar2"/>
    </view>
    <qiun-title-bar title="基本仪表盘"/>
    <!-- 这里的title.name和subtitle.name如果需要联动chartData，请定义一个变量同步传入:opts和:chartData中 -->
    <view class="charts-box">
      <qiun-data-charts type="gauge" :opts="{title:{name: '60Km/H',color: '#2fc25b',fontSize: 25,offsetY:50},subtitle: {name: '实时速度',color: '#666666',fontSize: 15,offsetY:-50}}" :chartData="chartsDataGauge1"/>
    </view>
    <qiun-title-bar title="其他仪表盘"/>
    <view class="charts-box">
      <qiun-data-charts type="gauge" :opts="{title:{offsetY:0},subtitle:{offsetY:0},extra:{gauge:{type:'progress',width:20,splitLine:{fixRadius:-10,width:15,},}}}" :chartData="chartsDataGauge2"/>
    </view>
    <qiun-title-bar title="词云图"/>
    <view class="charts-box">
      <qiun-data-charts type="word" :chartData="chartsDataWord1"/>
    </view>
    <qiun-title-bar title="漏斗图+渐变色"/>
    <view class="charts-box">
      <qiun-data-charts type="funnel" :opts="{extra:{funnel:{linearType:'custom'}}}" :chartData="chartsDataFunnel1"/>
    </view>
    <qiun-title-bar title="倒三角形漏斗图"/>
    <view class="charts-box">
      <qiun-data-charts type="funnel" :opts="{extra:{funnel:{type:'triangle'}}}" :chartData="chartsDataFunnel1"/>
    </view>
    <qiun-title-bar title="金字塔形漏斗图"/>
    <view class="charts-box">
      <qiun-data-charts type="funnel" :opts="{extra:{funnel:{type:'pyramid',labelAlign:'left'}}}" :chartData="chartsDataFunnel1"/>
    </view>
    <qiun-title-bar title="K线图"/>
    <view class="charts-box" style="height: 400px;">
      <qiun-data-charts type="candle" :ontouch="true" :canvas2d="true" canvasId="klineid" :chartData="chartsDataCandle1"/>
    </view>
    <qiun-title-bar title="地图"/>
    <view class="charts-box" style="height: 400px;">
      <qiun-data-charts type="map" :chartData="chartsDataMap1"/>
    </view>
  </view>
</template>

<script>
//下面是演示数据，您的项目不需要引用，数据需要您从服务器自行获取
import demodata from '@/mockdata/demodata.json';
import mapdata from '@/mockdata/mapdata.json'
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js';

export default {
  data() {
    return {
      chartsDataColumn1:{},
      chartsDataColumn2:{},
      chartsDataColumn3:{},
      chartsDataColumn4:{},
      chartsDataColumn5:{},
      chartsDataColumn6:{},
      chartsDataLine1:{},
      chartsDataLine2:{},
      chartsDataLine3:{},
      chartsDataLine4:{},
      chartsDataLine5:{},
      chartsDataTLine:{},
      chartsDataScatter:{},
      chartsDataBubble:{},
      chartsDataArea1:{},
      chartsDataArea2:{},
      chartsDataMix1:{},
      chartsDataPie1:{},
      chartsDataRing1:{},
      chartsDataRose1:{},
      chartsDataRose2:{},
      chartsDataArcbar1:{},
      chartsDataArcbar2:{},
      chartsDataGauge1:{},
      chartsDataGauge2:{},
      chartsDataRadar1:{},
      chartsDataRadar2:{},
      chartsDataWord1:{},
      chartsDataFunnel1:{},
      chartsDataMap1:{},
      chartsDataCandle1:{},
    };
  },
  onReady() {
    //模拟从服务器获取数据
    this.getServerData()
  },
  methods: {
    complete(e){
      console.log("渲染完成事件",uCharts.instance[e.id]);
    },
    getServerData() {
      setTimeout(() => {
      	//因部分数据格式一样，这里不同图表引用同一数据源的话，需要深拷贝一下构造不同的对象
      	//开发者需要自行处理服务器返回的数据，应与标准数据格式一致，注意series的data数值应为数字格式
        this.chartsDataColumn1=JSON.parse(JSON.stringify(demodata.Column))
      	this.chartsDataColumn2=JSON.parse(JSON.stringify(demodata.Column))
      	this.chartsDataColumn3=JSON.parse(JSON.stringify(demodata.Column))
      	this.chartsDataColumn4=JSON.parse(JSON.stringify(demodata.Column))
        this.chartsDataColumn5=JSON.parse(JSON.stringify(demodata.Column))
        let tmpColumn6=JSON.parse(JSON.stringify(demodata.Column))
        tmpColumn6.series[1].data[2]={value:21,color:'#EE6666'}
        //注意，因为组件内监听了chartData，构造chartData的时候，一定要先定义一个临时变量，构造完成后统一赋值给chartData绑定的变量，否则会导致多次渲染图表
      	this.chartsDataColumn6=tmpColumn6
      	this.chartsDataLine1=JSON.parse(JSON.stringify(demodata.Line))
      	this.chartsDataLine2=JSON.parse(JSON.stringify(demodata.Line))
      	this.chartsDataLine3=JSON.parse(JSON.stringify(demodata.Line))
      	this.chartsDataLine4=JSON.parse(JSON.stringify(demodata.Line))
        let tmpLine5=JSON.parse(JSON.stringify(demodata.Line))
        for (var i = 0; i < tmpLine5.series.length; i++) {
          tmpLine5.series[i].data[2]=null
        }
        tmpLine5.series[1].connectNulls=true
        this.chartsDataLine5=tmpLine5
        this.chartsDataTLine=JSON.parse(JSON.stringify(demodata.TLine))
        this.chartsDataScatter=JSON.parse(JSON.stringify(demodata.Scatter))
        this.chartsDataBubble=JSON.parse(JSON.stringify(demodata.Bubble))
      	this.chartsDataArea1=JSON.parse(JSON.stringify(demodata.Line))
      	this.chartsDataArea2=JSON.parse(JSON.stringify(demodata.Line))
      	this.chartsDataMix1=JSON.parse(JSON.stringify(demodata.Mix))
      	this.chartsDataPie1=JSON.parse(JSON.stringify(demodata.PieA))
      	this.chartsDataRing1=JSON.parse(JSON.stringify(demodata.PieA))
      	this.chartsDataRose1=JSON.parse(JSON.stringify(demodata.PieA))
      	this.chartsDataRose2=JSON.parse(JSON.stringify(demodata.PieA))
      	this.chartsDataArcbar1=JSON.parse(JSON.stringify(demodata.Arcbar1))
      	this.chartsDataArcbar2=JSON.parse(JSON.stringify(demodata.Arcbar2))
      	this.chartsDataGauge1=JSON.parse(JSON.stringify(demodata.Gauge))
      	this.chartsDataGauge2=JSON.parse(JSON.stringify(demodata.Gauge))
      	this.chartsDataRadar1=JSON.parse(JSON.stringify(demodata.Radar))
      	this.chartsDataRadar2=JSON.parse(JSON.stringify(demodata.Radar))
      	this.chartsDataWord1=JSON.parse(JSON.stringify(demodata.Word))
      	this.chartsDataFunnel1=JSON.parse(JSON.stringify(demodata.PieA))
      	this.chartsDataMap1={series:mapdata.features}
      	this.chartsDataCandle1=JSON.parse(JSON.stringify(demodata.Candle))
      }, 1500);
    }
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
