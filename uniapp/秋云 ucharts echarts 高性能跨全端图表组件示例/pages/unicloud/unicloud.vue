<template>
  <view class="content">
    <qiun-title-bar title="统计的开始日期"/>
    <uni-datetime-picker type="date" v-model="startDate" start="2021-04-06" end="2021-06-05" return-type="string"></uni-datetime-picker>
    <qiun-title-bar title="统计的结束日期"/>
    <uni-datetime-picker type="date" v-model="endDate" start="2021-04-06" end="2021-06-05" return-type="string"></uni-datetime-picker>
    <qiun-title-bar title="新增用户趋势"/>
    <view class="charts-box">
      <!--
      datacom组件读取uniClinetDB示例
      数据规范：
      带有categories类型的图表定义如下
      group：为series分组的name
      text：为对应categories的字段，即x轴对应的数据
      value：为series的分组data的值
      获取后组件会自动处理categories和series数据，无需手动拼接处理
      注意事项：
      1、如已传入chartData的categories，则优先使用chartData的categories
      2、如返回数据中无分组字段group，否则图例会显示"默认分组"，如下
      chartData={categories:["a","b","c"],series:[{name:"默认分组",data:[0,1,2]}]}
      3、如果text在数据库中定义为enum类型，则需要传入textEnum来描述正确的text值
      4、如果group在数据库中定义为enum类型，则需要传入groupEnum来描述正确的group值
      -->
      <qiun-data-charts
      	class="charts-box"
      	type="area"
      	:opts="{xAxis:{disableGrid:true,labelCount:3},yAxis:{data:[{format:'yAxisDemo2'}]},extra:{area:{type: 'curve',gradient:true}}}"
        :eopts="{seriesTemplate:{areaStyle:{color: {type: 'linear',x: 0,y: 0,x2: 0,y2: 1,colorStops: [{offset: 0, color: '#1890FF'}, {offset: 1, color: '#FFFFFF'}],global: false}},smooth:true}}"
      	collection="qiun-charts-demo"
      	field="register_date,status"
      	:where="'register_date >= ' + new Date(startDate).getTime() + ' && register_date <= ' + new Date(endDate).getTime()"
      	groupby="dateToString(add(new Date(0),register_date),'%Y-%m-%d','+0800') as text,status as group"
      	group-field="count(*) as value"
        :groupEnum="[{text: '正常',value: 0},{text: '禁用',value: 1},{text: '审核中',value: 2},{text: '审核拒绝',value: 3}]"
        :startDate="startDate"
        :endDate="endDate"
        :echartsH5="true"
      />
    </view>
    <qiun-title-bar title="用户男女比例"/>
    <view class="charts-box">
      <!--
      饼图类数据规范：
      value：代表具体数值
      text：代表value的描述
      注意事项：
      1、如果text在数据库中定义为enum类型，则需要传入textEnum来描述正确的text值
      -->
      <qiun-data-charts
      	class="charts-box"
      	type="pie"
      	collection="qiun-charts-demo"
      	field="register_date,gender"
      	:where="'register_date >= ' + new Date(startDate).getTime() + ' && register_date <= ' + new Date(endDate).getTime()"
      	groupby="gender as text"
      	group-field="count(*) as value"
        :textEnum="[{value: 1,text: '男'},{value: 2,text: '女'}]"
      />
    </view>
    <qiun-title-bar title="销售额统计"/>
    <view class="charts-box">
      <qiun-data-charts
      	class="charts-box"
      	type="column"
      	:opts="{xAxis:{disableGrid:true,labelCount:3},yAxis:{data:[{format:'yAxisDemo1'}]}}"
      	collection="qiun-charts-demo"
      	field="register_date,gender,total_fee"
      	:where="'register_date >= ' + new Date(startDate).getTime() + ' && register_date <= ' + new Date(endDate).getTime()"
      	groupby="dateToString(add(new Date(0),register_date),'%Y-%m-%d','+0800') as text"
      	group-field="sum(total_fee) as value"
        :startDate="startDate"
        :endDate="endDate"
      />
    </view>
  </view>
</template>

<script>
//下面是uCharts的配置文件及qiun-data-charts组件的公用中转参数，可以从本配置文件中获取uCharts实例、opts配置、format配置（APP端因采用renderjs无法从此配置文件获取uCharts实例）
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js';

export default {
  data() {
    return {
      startDate: '2021-04-06',
      endDate: '2021-04-13',
    };
  },
  onLoad() {
    
  },
  methods: {
    getServerData() {
      
    },
    complete(e) {
      console.log(e);
      //uCharts.instance[e.id]代表当前的图表实例（除APP端，APP不可在组件外调用uCharts的实例）
      console.log(uCharts.instance[e.id]);
      
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
