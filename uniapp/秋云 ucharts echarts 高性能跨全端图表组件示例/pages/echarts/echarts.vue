<template>
  <view class="content">
    <!-- config-echarts.js中的seriesTemplate为option.series模板，可以作为series中的默认配置，:chartData.series中的配置如果有相同的，会覆盖掉 seriesTemplate 中的配置 -->
		<qiun-title-bar title="柱状图+动态更新数据" />
    <view class="charts-box">
      <!-- 如果发布到二级或者多级目录中，需要配置 directory 属性 -->
      <!-- <qiun-data-charts type="column" :chartData="chartsDataColumn1" :echartsH5="true" :echartsApp="true" directory="/h5/" @complete="complete"/> -->
      <qiun-data-charts type="column" :chartData="chartsDataColumn1" :echartsH5="true" :echartsApp="true" @complete="complete"/>
    </view>
    <qiun-title-bar title="堆叠柱状图+点击获取索引" />
    <view class="charts-box">
      <!-- 注意：这里的opts是uCharts的配置，eopts是ECharts的配置，不要搞混，如果不需要用在各种小程序端，是不需要传uCharts的opts的，只需要传eopts即可！！！ -->
      <qiun-data-charts type="column" :opts="{extra:{column:{type:'stack'}}}" :eopts="{xAxis:{axisLabel:{color:'#FF0000'}}}" :chartData="chartsDataColumn2" :echartsH5="true" :echartsApp="true" @getIndex="getIndex"/>
    </view>
    <qiun-title-bar title="柱状图+渐变色" />
    <view class="charts-box">
      <qiun-data-charts type="column" :chartData="chartsDataColumn3" :echartsH5="true" :echartsApp="true"/>
    </view>
    <qiun-title-bar title="圆角柱状图" />
    <view class="charts-box">
      <!-- 此处改变的是 seriesTemplate 模板中的默认配置，不必每个series都传itemStyle，将会覆盖:chartData.series 实现更低的代码量 -->
      <qiun-data-charts type="column" :eopts="{seriesTemplate:{itemStyle:{normal:{barBorderRadius:[30, 30, 0, 0]}}}}" :chartData="chartsDataColumn4" :echartsH5="true" :echartsApp="true"/>
    </view>
    <qiun-title-bar title="横向柱状图(仅ECharts)" />
    <view class="charts-box">
      <qiun-data-charts type="column" :eopts="columneopts" :chartData="chartsDataColumn5" :echartsH5="true" :echartsApp="true"/>
    </view>
		<qiun-title-bar title="折线图" />
    <view class="charts-box">
      <qiun-data-charts type="line" :chartData="chartsDataLine1" :echartsH5="true" :echartsApp="true"/>
    </view>
		<qiun-title-bar title="曲线图" />
    <view class="charts-box">
      <!-- 此处改变的是 seriesTemplate 模板中的默认配置，不必每个series都传smooth:true，将会覆盖:chartData.series 实现更低的代码量 -->
      <qiun-data-charts type="line" :opts="{extra:{line:{type:'curve'}}}" :eopts="{seriesTemplate:{smooth:true}}" :chartData="chartsDataLine1" :echartsH5="true" :echartsApp="true"/>
    </view>
		<qiun-title-bar title="区域图" />
    <view class="charts-box">
      <qiun-data-charts type="area" :eopts="{seriesTemplate:{areaStyle:{opacity:0.2}}}" :chartData="chartsDataLine2" :echartsH5="true" :echartsApp="true"/>
    </view>
    <qiun-title-bar title="渐变色区域图" />
    <view class="charts-box">
      <!-- 注意：这里的opts是uCharts的配置，eopts是ECharts的配置，不要搞混，如果不需要用在各种小程序端，是不需要传uCharts的opts的，只需要传eopts即可！！！这里加opts是为了覆盖uCharts的rose图的默认图例配置的位置 -->
      <qiun-data-charts type="area" :opts="{yAxis:{data:[{min:0}]},extra:{area:{type:'curve',addLine:true,gradient:true}}}" :chartData="chartsDataLine3" :echartsH5="true" :echartsApp="true"/>
    </view>
		<qiun-title-bar title="饼图" />
    <view class="charts-box">
      <qiun-data-charts type="pie" :chartData="chartsDataPie1" :echartsH5="true" :echartsApp="true"/>
    </view>
		<qiun-title-bar title="环形图+动态更新option"/>
		<view class="charts-box">
      <!-- 演示动态改变eopts -->
		  <qiun-data-charts type="ring" :opts="{legend:{position:'bottom'}}" :eopts="ringOpts" :chartData="chartsDataPie2" :echartsH5="true" :echartsApp="true"/>
		</view>
		<qiun-title-bar title="面积玫瑰图"/>
		<view class="charts-box">
       <!-- 注意：这里的opts是uCharts的配置，eopts是ECharts的配置，不要搞混，如果不需要用在各种小程序端，是不需要传uCharts的opts的，只需要传eopts即可！！！这里加opts是为了覆盖uCharts的rose图的默认图例配置的位置 -->
		  <qiun-data-charts type="rose" :opts="{legend:{position:'bottom'}}" :chartData="chartsDataPie3" :echartsH5="true" :echartsApp="true"/>
		</view>
		<qiun-title-bar title="漏斗图"/>
		<view class="charts-box">
		  <qiun-data-charts type="funnel" :chartData="chartsDataPie4" :echartsH5="true" :echartsApp="true"/>
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
      chartsDataColumn2: {},
      chartsDataColumn3:{},
      chartsDataColumn4:{},
      chartsDataColumn5:{},
      chartsDataPie1: {},
      chartsDataPie2: {},
      chartsDataPie3: {},
      chartsDataPie4: {},
      chartsDataLine1: {},
      chartsDataLine2: {},
      chartsDataLine3: {},
      ringOpts:{},
      //横向柱状图的配置，您也可以把默认配置写在config-echarts.js中
      columneopts:{
        grid: {
          left: '3%',
          right: '4%',
          bottom: 30,
          top:10,
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          data: []
        },
        //series模板，会覆盖至chartData中的series中的每一个数组内
        seriesTemplate:{
          "label": {
          	"show": true,
            "color": "#666666",
          	"position": 'right',
          },
        }
      }
    };
  },
  onReady() {
    setTimeout(() => {
      this.getServerData();
    }, 1000);
    
    //演示变更数据后显示loading状态，如果不想展示loading状态，则不需要此步，可以注释掉看效果
    setTimeout(() => {
      this.chartsDataColumn1.series=[];
    }, 4000);
    
    setTimeout(() => {
      //模拟新的柱状图
      this.chartsDataColumn1=JSON.parse(JSON.stringify(demodata.Line));
      //测试动态绑定的eopts
      this.ringOpts={
        color:['#FF00FF','#AAFF11'],
        legend:{show:false}
      }
    }, 5000);
  },
  methods: {
    getServerData() {
      
      //因部分数据格式一样，这里不同图表引用同一数据源的话，需要深拷贝一下构造不同的对象
      //开发者需要自行处理服务器返回的数据，应与标准数据格式一致，注意series的data数值应为数字格式
      
      this.chartsDataColumn1=JSON.parse(JSON.stringify(demodata.Column));
      let tmpColumn3=JSON.parse(JSON.stringify(demodata.Column));
      //series.linearGradient代表渐变色：
      //前4个参数用于配置渐变色的起止位置, 这4个参数依次对应右/下/左/上四个方位. 而0 0 0 1则代表渐变色从正上方开始；
      //第5个参数为数组, 用于配置颜色的渐变过程. 每一项为一个对象, 包含offset和color两个参数. offset的范围是0 ~ 1, 用于表示位置
      tmpColumn3.series[0].linearGradient=[0, 0, 0, 1,[{offset: 0, color: '#0EE2F8'},{offset: 1, color: '#1890FF'}]];
      tmpColumn3.series[1].linearGradient=[0, 0, 0, 1,[{offset: 0, color: '#2BDCA8'},{offset: 1, color: '#91CB74'}]];
      this.chartsDataColumn3=tmpColumn3;
      
      this.chartsDataColumn4=JSON.parse(JSON.stringify(demodata.Column));
      this.chartsDataColumn5=JSON.parse(JSON.stringify(demodata.Column));
      this.chartsDataPie1=JSON.parse(JSON.stringify(demodata.PieA))
      this.chartsDataPie2=JSON.parse(JSON.stringify(demodata.PieA))
      this.chartsDataPie3=JSON.parse(JSON.stringify(demodata.PieA))
      this.chartsDataPie4=JSON.parse(JSON.stringify(demodata.PieA))
      this.chartsDataLine1=JSON.parse(JSON.stringify(demodata.Line))
      
      
      //处理堆叠柱状图的series
      let duidie = JSON.parse(JSON.stringify(demodata.Column))
      for (var i = 0; i < duidie.series.length; i++) {
        duidie.series[i].stack = 'one'
        duidie.series[i].barWidth = '50%'
        duidie.series[i].label = {position: 'inside',color:'#FFFFFF'}
      }
      //这里需要注意，一定要定义一个临时的变量再统一赋值给chartData，否则chartData具有监听属性，只要有变化就会导致重新渲染
      this.chartsDataColumn2=duidie
      
      
      let areadata = JSON.parse(JSON.stringify(demodata.Line))
      areadata.series = areadata.series.reverse()
      this.chartsDataLine2=areadata
      
      //渐变色区域图
      let linearareadata={
        categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
        series:[{
          name: "成交量A",
          smooth:true,
          areaStyle:{
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                  offset: 0, color: '#1890FF' // 0% 处的颜色
              }, {
                  offset: 1, color: '#FFFFFF' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          },
          data: [100, 80, 95, 150, 112, 132]
        }]
      }
      this.chartsDataLine3=linearareadata
      
    },
    complete(e) {
      console.log("渲染完成事件",e);
    },
    getIndex(e){
      console.log("获取点击索引事件",e);
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
