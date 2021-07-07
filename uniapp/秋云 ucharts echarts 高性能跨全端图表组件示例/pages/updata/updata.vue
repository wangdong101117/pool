<template>
  <view class="content">
    <view style="padding: 10px;">
      <button class="uni-button" type="default" @click="updataWithLoading">带loading的更新</button>
    </view>
    <view style="padding: 10px;">
      <button class="uni-button" type="default" @click="updataWithOutLoading">不显示loading的更新</button>
    </view>
    <qiun-title-bar title="localdata数据更新"/>
    <view class="charts-box">
      <qiun-data-charts type="column" :localdata="chartsDatalocaldata"/>
    </view>
    <qiun-title-bar title="chartData数据更新"/>
    <view class="charts-box">
      <qiun-data-charts type="line" :chartData="chartsDataLine"/>
    </view>
    <qiun-title-bar title="opts配置更新"/>
    <view class="charts-box">
      <qiun-data-charts type="ring" :opts="ringopts" :chartData="chartsDataRing"/>
    </view>
    <view style="padding: 10px;">
      <button class="uni-button" type="default" @click="updataWithLoading">带loading的更新</button>
    </view>
    <view style="padding: 10px;">
      <button class="uni-button" type="default" @click="updataWithOutLoading">不显示loading的更新</button>
    </view>
  </view>
</template>

<script>
//下面是演示数据，您的项目不需要引用，数据需要您从服务器自行获取
import demodata from '@/mockdata/demodata.json';

export default {
  data() {
    return {
      //注意如果使用localdata数据格式，默认值的类型应该是数组
      chartsDatalocaldata:[],
      //注意如果使用chartsData数据格式，默认值的类型应该是对象
      chartsDataLine:{},
      chartsDataRing:{},
      ringopts:{}
    };
  },
  onLoad() {
    this.getServerData()
  },
  methods: {
    getServerData() {
      //模拟从服务器获取数据的过程，请替换为您封装好的request的API
      setTimeout(() => {
      	//变更图表绑定的数据，一定要整体改变chartData或者localdata，否则会导致多次重新渲染或者监听不到变化的问题
        this.chartsDatalocaldata=JSON.parse(JSON.stringify(demodata.localdata))
        this.chartsDataLine=JSON.parse(JSON.stringify(demodata.Line))
        this.chartsDataRing=JSON.parse(JSON.stringify(demodata.PieA))
        //这里演示圆环图标题和副标题动态变化
        let tmpopts = {
          title:{
            name:this.chartsDataRing.series[0].data[0].name
          },
          subtitle:{
            name:this.chartsDataRing.series[0].data[0].value + "人"
          }
        }
        this.ringopts = tmpopts;
      }, 1500);
    },
    updataWithLoading(){
      //为了展示loading状态，需要把当前绑定的数据先处理一下
      //1:localdata格式的图表数据，展示loading状态需要将绑定数据复位为空数组
      this.chartsDatalocaldata=[];
      //2:chartData格式的图表数据，展示loading状态需要将绑定数据的series复位为空数组
      this.chartsDataLine.series=[];
      this.chartsDataRing.series=[];
      
      //模拟从服务器获取数据的过程，请替换为您封装好的request的API
      setTimeout(()=>{
        //变更图表绑定的数据，一定要【整体改变】【整体改变】【整体改变】chartData或者localdata，否则会导致多次重新渲染或者监听不到变化的问题
        //为了和原始数据不一样，我这里模拟构造一下随机数字。这里应该是您拼接chartData或者localdata的逻辑
        let resLocaldata = this.randomLocalData(JSON.parse(JSON.stringify(demodata.localdata)))
        let resLinedata = this.randomChartData(JSON.parse(JSON.stringify(demodata.Line)))
        let resRingdata = this.randomChartData(JSON.parse(JSON.stringify(demodata.PieA)))
        //这里演示圆环图标题和副标题动态变化
        let tmpopts = {
          title:{
            name:resRingdata.series[0].data[0].name
          },
          subtitle:{
            name:resRingdata.series[0].data[0].value + "人"
          }
        }
        
        //变更图表绑定的数据，一定要【整体改变】【整体改变】【整体改变】chartData或者localdata
        this.chartsDatalocaldata = resLocaldata;
        this.chartsDataLine = resLinedata;
        this.chartsDataRing = resRingdata;
        this.ringopts = tmpopts;
      },1000)
    },
    updataWithOutLoading(){
      //模拟从服务器获取数据的过程，请替换为您封装好的request的API
      setTimeout(()=>{
        //变更图表绑定的数据，一定要【整体改变】【整体改变】【整体改变】chartData或者localdata，否则会导致多次重新渲染或者监听不到变化的问题
        //为了和原始数据不一样，我这里模拟构造一下随机数字。这里应该是您拼接chartData或者localdata的逻辑
        let resLocaldata = this.randomLocalData(JSON.parse(JSON.stringify(demodata.localdata)))
        let resLinedata = this.randomChartData(JSON.parse(JSON.stringify(demodata.Line)))
        let resRingdata = this.randomChartData(JSON.parse(JSON.stringify(demodata.PieA)))
        //这里演示圆环图标题和副标题动态变化
        let tmpopts = {
          title:{
            name:resRingdata.series[0].data[0].name
          },
          subtitle:{
            name:resRingdata.series[0].data[0].value + "人"
          }
        }
        
        //变更图表绑定的数据，一定要【整体改变】【整体改变】【整体改变】chartData或者localdata
        this.chartsDatalocaldata = resLocaldata;
        this.chartsDataLine = resLinedata;
        this.chartsDataRing = resRingdata;
        this.ringopts = tmpopts;
      },200)
    },
    //构造随机数字，模拟用，不必理会
    randomLocalData(data){
      for (var i = 0; i < data.length; i++) {
        data[i].value = Math.floor(Math.random() * 100)
      }
      return data;
    },
    randomChartData(data){
      for (var i = 0; i < data.series.length; i++) {
        for (var j = 0; j < data.series[i].data.length; j++) {
          if(typeof data.series[i].data[j] === 'number'){
            data.series[i].data[j] = Math.floor(Math.random() * 100)
          }else{
            data.series[i].data[j].value = Math.floor(Math.random() * 100)
          }
        }
      }
      return data;
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
