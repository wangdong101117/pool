<template>
  <view class="content">
    <qiun-title-bar title="饼状图format"/>
    <view class="charts-box">
      <!-- 注意：因各小程序及app端通过组件均不能传递function类型参数，组件内所有formatter方法，均需使用format属性指定config-ucharts.js里事先定义好的formatter的key值，组件会自动匹配与其对应的function -->
      <!-- 饼图的format需要挂到chartData中的series[i].format上，例如pieFormatDemo.series[i].format="pieDemo"。当使用localdata数据渲染图表时，因series是组件自动拼接的，暂时不支持使用format -->
      <qiun-data-charts type="pie" :chartData="chartsDataPie1"/>
    </view>
    <qiun-title-bar title="Y轴format方法1(保留小数点及添加单位)"/>
    <view class="charts-box">
      <qiun-data-charts type="area" :opts="{yAxis:{data:[{tofix:3,unit:'万元',min:0,max:200}]}}" :chartData="chartsDataLine1" />
    </view>
    <qiun-title-bar title="Y轴format方法2(自定义)"/>
    <view class="charts-box">
      <qiun-data-charts type="area" :opts="{yAxis:{data:[{format:'yAxisDemo1'}]}}" :chartData="chartsDataLine1" />
    </view>
    <qiun-title-bar title="X轴format方法"/>
    <view class="charts-box">
      <qiun-data-charts type="area" :opts="{xAxis:{format:'xAxisDemo1'}}" :chartData="chartsDataLine1" />
    </view>
    <qiun-title-bar title="series数据点format"/>
    <view class="charts-box">
      <!-- series的format需要在chartData.series中指定，注意，因为组件监听了chartData，只要有数据变化，就会触发更新，不要用循环chartData绑定的变量，需要一次性整体赋值给chartData！！！ -->
      <qiun-data-charts type="line" :chartData="chartsDataColumn2"/>
    </view>
    <qiun-title-bar title="临时增加的tooltip提示窗format" />
    <view class="charts-box"> 
      <!-- 此方法展示在引用的config-ucharts.js中动态添加tooltip的formatter（APP不能实现） -->
      <qiun-data-charts
        type="column"
        :chartData="chartsDataLine1"
        :tooltipFormat="tooltipFormatTemp"
      />
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
      chartsDataLine1: {},
      chartsDataColumn2: {},
      chartsDataPie1:{},
      tooltipFormatTemp:"tooltipTemp1"
    };
  },
  onLoad() {
    //tooltipFormat临时自定义的示例（APP端不能这么做，只能在config-ucharts.js内预先定义），item, category, index, opts详细解释看文档https://demo.ucharts.cn的帮助页
    uCharts.formatter[this.tooltipFormatTemp] = function(item, category, index, opts) {
      //只有第一组数据和其他组别不一样，想要其他的请自由发挥
      if (index === 0) {
        return '第一组数据' + item.data + '年';
      } else {
        return '2016年以后的' + item.data + '天';
      }
    };
    //模拟从服务器获取数据
    this.getServerData()
    
  },
  methods: {
    getServerData() {
      setTimeout(() => {
      	//因部分数据格式一样，这里不同图表引用同一数据源的话，需要深拷贝一下构造不同的对象
      	//开发者需要自行处理服务器返回的数据，应与标准数据格式一致，注意series的data数值应为数字格式
        this.chartsDataLine1=JSON.parse(JSON.stringify(demodata.Line))
        
        //数据点格式化示例
        //使用format属性指定config-ucharts.js里事先定义好的formatter的key值，组件会自动匹配与其对应的function 
      	let columnFormatDemo=JSON.parse(JSON.stringify(demodata.Column))
        for (var i = 0; i < columnFormatDemo.series.length; i++) {
          columnFormatDemo.series[i].format="seriesDemo1"
        }
        this.chartsDataColumn2=columnFormatDemo
        
        //饼图格式化示例
        //使用format属性指定config-ucharts.js里事先定义好的formatter的key值，组件会自动匹配与其对应的function 
        let pieFormatDemo=JSON.parse(JSON.stringify(demodata.PieA))
        for (var i = 0; i < pieFormatDemo.series.length; i++) {
          pieFormatDemo.series[i].format="pieDemo"
        }
        this.chartsDataPie1=pieFormatDemo
        
      }, 1500);
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
