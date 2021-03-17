# echarts-renderjs

## 参考

本示例参考了 **renderjs-echarts-demo** 插件

## 注意事项

- 仅支持 app-vue、h5 端
- 要求 uni-app 2.5.5+ 以上版本
- APP端要求使用v3编译器
- 本例使用的echarts版本为4.2.1；经测试，4.7.0及以下版本均本会导致h5移动端不能与图形交互
- 如等到renderjs可与业务层方便的通信时，请自行优化

## 解决的问题

- 以组件形式使用echarts
- 使用变通的方法解决echarts相关格式化函数不能使用的问题

## 回调方法不生效的解决办法

- 前提：HBuilderX版本2.7.14，app端
- 当前版本传入的回调方法到renderjs中就消失了。故目前解决方案是外部传入参数、标识，在renderjs中添加相应方法

## 点击事件

- 前提：HBuilderX版本2.7.14，app端
- 经测试，使用this.$el初始化组件时，点击事件不能触发，需设置id。这样的话，同一页面多个组件使用同一个option会导致只能显示一个
- 点击事件的event对象直接传递到renderjs外时会报序列化错误，需要单独传递指定参数
- echarts的点击事件数据需通过原生点击事件传递出去，详见代码注释说明

## 地图等其他js引入

- 引入echarts相关的js时，最好串联着引入，即在上一个js的onload方法内引入下一个js，在最后一个onload方法内进行图表的初始化，防止因js未完全加载导致的图表显示异常

```js
mounted() {
	if (typeof window.echarts === 'object') {
		this.init()
	} else {
		// 动态引入类库
		const script = document.createElement('script')
		script.src = './static/echarts.min.js'
		script.onload = this.init
		document.head.appendChild(script)
	}
},
methods: {
	/**
	 * echarts.min.js的onload事件
	 */
	init() {
	  const script = document.createElement('script')
	  script.src = './static/china.js' // 此文件没有提供，请自行下载
	  script.onload = this.init2
	  document.head.appendChild(script)
	},
	/**
	 * china.js的onload事件
	 */
	init2() {
	  // 初始化图表
	  this.chart = echarts.init(document.getElementById(this.option.id))
	  this.update(this.option)
	}
}
```

## App端加载图表失败的问题

- 请尝试使用 echarts-el 组件，使用$el进行初始化，不支持点击事件
- 如需要点击事件但App报错，请尝试首次赋值option时，延时1秒