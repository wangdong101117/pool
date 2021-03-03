<template>
	<view class="content">
		<!-- #ifdef APP-PLUS || H5  -->
		<view id="container"></view>
		<!-- #endif -->
		<!-- #ifndef APP-PLUS || H5 -->
		<view>非 APP、H5 环境不支持</view>
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		onLoad() {},
		methods: {}
	}
</script>

<script module="f2" lang="renderjs">
	let myChart
	export default {
		data: function() {
			return {
				canvas: '',
			}
		},
		mounted() {
			console.log(this.sdata);
			// renderjs 里可以自由操作 window 、dom等浏览器环境属性
			const container = document.getElementById('container')
			// 创建 html5 canvas DOM
			const canvas = document.createElement('canvas')
			// id 不可重复
			canvas.id = 'f2'
			canvas.width = uni.upx2px(750)
			canvas.height = uni.upx2px(750)
			container.appendChild(canvas)
			this.canvas = canvas;

			if (typeof window.F2 === 'function') {
				this.initF4()
			} else {
				// 动态引入较大类库避免影响页面展示
				const script = document.createElement('script')
				script.src = 'static/echarts.min.js'
				script.onload = this.initF4.bind(this)
				document.head.appendChild(script)

			}
		},
		methods: {
			initF4() {
				var myChart = echarts.init(this.canvas);
				var option = {
        legend: {},
        tooltip: {
            trigger: 'axis',
            showContent: false
        },
        dataset: {
            source: [
                ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
                ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
                ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
                ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
                ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
            ]
        },
        xAxis: {type: 'category'},
        yAxis: {gridIndex: 0},
        grid: {top: '55%'},
        series: [
            {type: 'line', smooth: true, seriesLayoutBy: 'row'},
            {type: 'line', smooth: true, seriesLayoutBy: 'row'},
            {type: 'line', smooth: true, seriesLayoutBy: 'row'},
            {type: 'line', smooth: true, seriesLayoutBy: 'row'},
            {
                type: 'pie',
                id: 'pie',
                radius: '30%',
                center: ['50%', '25%'],
                label: {
                    formatter: '{b}: {@2012} ({d}%)'
                },
                encode: {
                    itemName: 'product',
                    value: '2012',
                    tooltip: '2012'
                }
            }
        ]
    };



				myChart.setOption(option);
			},
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 20px;
		background-color: #fff;
	}

	.fitness-ring {
		background-color: #151515;
		box-shadow: 0px 0px 1px 0px #06060d;
	}
</style>
