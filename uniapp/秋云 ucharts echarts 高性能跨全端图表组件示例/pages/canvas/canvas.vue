<template>
  <view class="content">
    <!-- 从页面整洁度及代码可阅读性上来看，不再推荐使用原生canvas写法来调用uCharts -->
    <qiun-title-bar title="原生canvas用法示例"/>
    <canvas canvasId="canvasLine" id="canvasLine" class="charts" @tap="tap($event,'canvasLine')"/>
    <!-- #ifdef MP-WEIXIN -->
    <!-- 只有微信小程序有canvas2d模式 -->
    <qiun-title-bar title="启用type='2d'用法示例"/>
    <!-- 开启canvas2d模式后@tap的获取的点击坐标会不准确，开发者需按组件源码自行处理event的坐标为正确的坐标，并传入uCharts的实例中方可正确调用showTooltip方法 -->
    <canvas canvasId="canvasColumn" id="canvasColumn" type="2d" class="charts" @tap="tap($event,'canvasColumn')"/>
    <!-- #endif -->
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};

//下面是演示数据，您的项目不需要引用，数据需要您从服务器自行获取
import demodata from '@/mockdata/demodata.json';


export default {
  data() {
    return {
      cWidth:350,
      cHeight:300,
      pixelRatio:1,
    };
  },
  onLoad() {
  	//#ifdef MP-ALIPAY || MP-WEIXIN
  	this.pixelRatio=uni.getSystemInfoSync().pixelRatio;
  	//#endif
  	this.cWidth=uni.upx2px(750);
  	this.cHeight=uni.upx2px(500);
  	this.getServerData();
  },
  onReady() {
    this.getServerData()
  },
  methods: {
    //模拟从服务器获取数据
    getServerData() {
      setTimeout(() => {
        // 需要自行拼接chartsData
        let chartsData=JSON.parse(JSON.stringify(demodata.Line))
        let type2dData=JSON.parse(JSON.stringify(demodata.Column))
        this.drawCharts("canvasLine",chartsData);
        // #ifdef MP-WEIXIN
        this.draw2dCharts("canvasColumn",type2dData);
        // #endif
      }, 500);
    },
    drawCharts(id,data){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id]=new uCharts({
        //$this:this, //v2.0版本不需要再传canvasId和$this了，v1.0因为传$this会导致实例混乱
        //canvasId: canvasId, //v2.0版本不需要再传canvasId和$this了，v1.0因为传$this会导致实例混乱
        type: 'line',
        context:ctx,//v2.0版本必须要传context
        fontSize:11,
        padding:[15,15,0,15],
        dataLabel:true,
        categories: data.categories,
        series: data.series,
        animation: true,
        width: this.cWidth,
        height: this.cHeight,
        extra: {
        	line:{
        		type: 'straight'
        	}
        }
      });
    },
    draw2dCharts(id,data){
      const query = uni.createSelectorQuery().in(this);
      query.select('#' + id).fields({ node: true, size: true }).exec(res => {
        if (res[0]) {
          const canvas = res[0].node
          //v2.0版本必须要获取context并传入opts(option)中
          const ctx = canvas.getContext('2d')
          canvas.width = res[0].width * this.pixelRatio
          canvas.height = res[0].height * this.pixelRatio
          uChartsInstance[id]=new uCharts({
            //canvasId: canvasId, v2.0版本不需要再传canvasId和$this了，v1.0因为传$this会导致实例混乱
            type: 'column',
            padding:[15,5,0,15],
            dataLabel: true,
            width: this.cWidth*this.pixelRatio,
            height: this.cHeight*this.pixelRatio,
            pixelRatio:this.pixelRatio,
            canvas2d:true,//开启canvas2d
            context:ctx,//v2.0版本必须要传context
            fontSize:11,
            animation: true,
            categories: data.categories,
            series: data.series,
            xAxis: {
              disableGrid:true,
            },
            yAxis: {
              data:[{
                position:'right',
                axisLine:false,
                //注意，v2.0版本的format变成了formatter
                formatter:(val)=>{return val.toFixed(0)+'元'},
              }]
            },
            extra: {
              column: {
                type:'group',
                width: 20
              }
            }
          });
        }else{
          console.error("[uCharts]:未获取到context")
        }
      })
    },
    tap(e,id){
      uChartsInstance[id].showToolTip(e)
    }
  }
}
  
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 40px;
}
.charts{
  width: 750rpx;
  height: 500rpx;
}
</style>
