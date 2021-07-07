<template>
  <view class="content">
    <qiun-title-bar title="localdata渲染图表1+点击获取索引"/>
    <view class="charts-box">
      <!-- 只需绑定@getIndex即可获取点击索引 -->
      <qiun-data-charts type="column" :localdata="chartsDatalocaldataA"  @getIndex="getIndex"/>
    </view>
    <qiun-title-bar title="localdata渲染图表2+禁用鼠标移动"/>
    <view class="charts-box">
      <qiun-data-charts type="pie" :localdata="chartsDatalocaldataB" :onmouse="false"/>
    </view>
    <qiun-title-bar title="渲染完成后显示自定义tooltip" />
    <view class="charts-box"> 
      <!-- 渲染完成后进行操作图表，需要绑定@complete事件，然后在@complete事件中进行操作 -->
      <qiun-data-charts
        type="column"
        :chartData="chartsDataColumn1"
        @complete="complete"
      />
    </view>
    <qiun-title-bar title="跟手tooltip示例" />
    <view class="charts-box" >
      <!-- 开启onmovetip后，建议同时开启canvas2d模式（需要传canvasId），否则在小程序端会很卡。开启onmovetip功能的前提是需要开启ontouch，并且关闭图表滚动条，即:opts="{enableScroll: false}" -->
      <qiun-data-charts
        type="column"
        :opts="{enableScroll: false}"
        canvasId="canvas2dNeedId"
        :chartData="chartsDataColumn1"
        :canvas2d="true"
        :ontouch="true"
        :onmovetip="true"
        @getTouchMove="getTouchMove"
      />
    </view>
    <qiun-title-bar title="固定位置显示tooltip" />
    <view class="charts-box">
      <!-- 这个demo演示自定义tooltip的样式及增加额外的数据，例如换行等 -->
      <qiun-data-charts
        type="line"
        :opts="{extra:{tooltip:{showArrow: false,borderWidth: 1,borderRadius:8,borderColor: '#FF0000',bgColor: '#FFFFFF',bgOpacity: 0.9,fontColor: '#000000',splitLine: false}}}"
        :chartData="chartsDataColumn1"
        :tooltipCustom="{x:2,y:2}"
      />
    </view>
    <qiun-title-bar title="禁用组件tooltip自行触发(换行)" />
    <view class="charts-box">
      <!-- 需要关闭组件的tooltip，即:tooltipShow="false"，然后在@getIndex中调用uCharts的showTooltip方法，注意，APP端不能实现，其他端需要引用config-ucharts.js作为实例承载的中间件。 -->
      <!-- 如果需要做跟手tooltip，需要在@getTouchMove事件中调用，注意需要添加防抖，可参考组件内防抖方法，否则会导致逻辑层与视图层频繁通信造成卡顿 -->
      <qiun-data-charts
        type="line"
        :tooltipShow="false"
        :chartData="chartsDataColumn1"
        @getIndex="showMyTooltip"
      />
    </view>
    <qiun-title-bar title="强制展示错误信息"/>
    <button class="uni-button" type="default" @click="changeErrorMessage">点击展示错误信息</button>
    <view class="charts-box">
      <qiun-data-charts type="line" :chartData="chartsDataLine1" :errorMessage="errorMessage" @error="error"/>
    </view>
    <qiun-title-bar title="uCharts保存为图片"/>
    <button class="uni-button" type="default" @click="createImage('createImageUCharts')">点击保存为图片</button>
    <view class="charts-box">
      <qiun-data-charts type="area" ref="createImageUCharts" :chartData="chartsDataLine1"/>
    </view>
  </view>
</template>

<script>
//下面是演示数据，您的项目不需要引用，数据需要您从服务器自行获取
import demodata from '@/mockdata/demodata.json';

//下面是uCharts的配置文件及qiun-data-charts组件的公用中转参数，可以从本配置文件中获取uCharts实例、opts配置、format配置（APP端因采用renderjs无法从此配置文件获取uCharts实例）
//***并不是所有的页面都需要引用这个文件***引入这个configjs是为了获取组件的uCharts实例，从而操作uCharts的一些方法，例如手动显示tooltip及一些其他uCharts包含的方法及事件。
//再说一遍，只能在H5内使用，APP不行，APP不行，APP不行
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js';

export default {
  data() {
    return {
      //注意如果使用localdata数据格式，默认值的类型应该是数组
      chartsDatalocaldataA:[],
      chartsDatalocaldataB:[],
      //注意如果使用localdata数据格式，默认值的类型应该是数组
      chartsDataColumn1:{},
      chartsDataLine1:{},
      errorMessage:"自定义的错误信息，点击重新加载",
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
        this.chartsDatalocaldataA=JSON.parse(JSON.stringify(demodata.localdata))
        this.chartsDatalocaldataB=JSON.parse(JSON.stringify(demodata.localdataB))
      	this.chartsDataColumn1=JSON.parse(JSON.stringify(demodata.Column))
        this.chartsDataLine1=JSON.parse(JSON.stringify(demodata.Line))
      }, 1500);
    },
    complete(e) {
      console.log("渲染完成事件",e);
      //uCharts.instance[e.id]代表当前的图表实例（除APP端，APP不可在组件外调用uCharts的实例）
      console.log("uCharts实例",uCharts.instance[e.id]);
      //uCharts.option[e.id]代表当前的图表的opts（除APP端，APP不可在组件外调用uCharts的实例）
      console.log("uCharts的option",uCharts.option[e.id]);
      //下面展示渲染完成后，通过实例调用uCharts的showToolTip方法，有了uCharts实例，您也可以在其他地方调用图表的方法及数据（除APP端，APP因采用renderjs，无法获取uCharts实例）
      // #ifndef APP-PLUS
      //如果需要tooltip换行显示，也可以参照本示例，关闭组件本身的tooltip功能，即:tooltipShow="false"，然后在@getIndex事件中，通过uCharts.instance[e.id].showToolTip()方法来自定义。
      let textList = [
        { text: '默认显示的tooltip', color: null },
        { text: '类别1：某个值xxx', color: '#2fc25b' },
        { text: '类别2：某个值xxx', color: '#facc14' },
        { text: '类别3：某个值xxx', color: '#f04864' }
      ];
      //这里指定了changedTouches的x和y坐标，当指定index索引时，x值会被自动修正到正确位置，给0即可，主要是y的坐标值
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [{ x: 0, y: 100 }] },
        {
          index: 3,
          textList: textList
        }
      );
      // #endif
    },
    getIndex(e){
      console.log("获取点击索引事件",e);
    },
    showMyTooltip(e){
      console.log("获取点击索引事件",e);
      //拿到canvasId后即e.id，可以通过uCharts.instance[e.id]代表当前的图表实例（除APP端，APP不可在组件外调用uCharts的实例）
      console.log("获取uCharts实例",uCharts.instance[e.id]);
      //uCharts.option[e.id]代表当前的图表的opts（除APP端，APP不可在组件外调用uCharts的实例）
      console.log("uCharts的option",uCharts.option[e.id]);
      //从option（opts）中获取数据
      let categories = uCharts.option[e.id].categories;
      let series = uCharts.option[e.id].series;
      //e.currentIndex是点击的的点位索引值
      let index = e.currentIndex;
      //自行通过uCharts的实例调用showToolTip方法（APP端不能实现，无法通过renderjs获取到uCharts实例）
      // #ifndef APP-PLUS
      //如果需要tooltip换行显示，也可以参照本示例，关闭组件本身的tooltip功能，即:tooltipShow="false"，然后在@getIndex事件中，通过uCharts.instance[e.id].showToolTip()方法来自定义。
      let textList = [{ text: categories[index] + "年收入情况", color: null }];
      for (let i = 0; i < series.length; i++) {
        textList.push({text: "自定义" + series[i].name + ":" + series[i].data[index] + "美元", color: series[i].color})
      }
      //changedTouches是点击的坐标值
      uCharts.instance[e.id].showToolTip(
        { changedTouches: [e.event] },
        {
          index: index,
          textList: textList
        }
      );
      // #endif
      
    },
    getTouchMove(e){
      console.log("获取TouchMove",e);
    },
    changeErrorMessage(){
      this.errorMessage="自定义错误信息，点击重试"+Math.floor(Math.random() * 1000)
    },
    createImage(refid){
    	this.$refs[refid].saveImage();
    },
    error(e){
      console.log("组件传递过来的错误信息",e);
      //TODO something 重新加载或者其他你想干的事
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
