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
			init5: function() {
				console.log(234);
			},
			initF4() {
				var myChart = echarts.init(this.canvas);
				var option = {
					angleAxis: {},
					radiusAxis: {
						type: 'category',
						data: ['周一', '周二', '周三', '周四'],
						z: 10
					},
					polar: {},
					series: [{
						type: 'bar',
						data: [1, 2, 3, 4],
						coordinateSystem: 'polar',
						name: 'A',
						stack: 'a'
					}, {
						type: 'bar',
						data: [2, 4, 6, 8],
						coordinateSystem: 'polar',
						name: 'B',
						stack: 'a'
					}, {
						type: 'bar',
						data: [1, 2, 3, 4],
						coordinateSystem: 'polar',
						name: 'C',
						stack: 'a'
					}],
					legend: {
						show: true,
						data: ['A', 'B', 'C']
					}
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
