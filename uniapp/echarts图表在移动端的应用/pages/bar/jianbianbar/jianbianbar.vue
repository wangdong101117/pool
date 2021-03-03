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
				var dataAxis = ['点', '击', '柱', '子', '或', '者', '两', '指', '在', '触', '屏', '上', '滑', '动', '能', '够', '自', '动', '缩', '放'];
				var data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220];
				var yMax = 500;
				var dataShadow = [];
				
				for (var i = 0; i < data.length; i++) {
				    dataShadow.push(yMax);
				}
				
				var option = {
				    title: {
				        text: '特性示例：渐变色 阴影 点击缩放',
				        subtext: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
				    },
				    xAxis: {
				        data: dataAxis,
				        axisLabel: {
				            inside: true,
				            textStyle: {
				                color: '#fff'
				            }
				        },
				        axisTick: {
				            show: false
				        },
				        axisLine: {
				            show: false
				        },
				        z: 10
				    },
				    yAxis: {
				        axisLine: {
				            show: false
				        },
				        axisTick: {
				            show: false
				        },
				        axisLabel: {
				            textStyle: {
				                color: '#999'
				            }
				        }
				    },
				    dataZoom: [
				        {
				            type: 'inside'
				        }
				    ],
				    series: [
				        { // For shadow
				            type: 'bar',
				            itemStyle: {
				                color: 'rgba(0,0,0,0.05)'
				            },
				            barGap: '-100%',
				            barCategoryGap: '40%',
				            data: dataShadow,
				            animation: false
				        },
				        {
				            type: 'bar',
				            itemStyle: {
				                color: new echarts.graphic.LinearGradient(
				                    0, 0, 0, 1,
				                    [
				                        {offset: 0, color: '#83bff6'},
				                        {offset: 0.5, color: '#188df0'},
				                        {offset: 1, color: '#188df0'}
				                    ]
				                )
				            },
				            emphasis: {
				                itemStyle: {
				                    color: new echarts.graphic.LinearGradient(
				                        0, 0, 0, 1,
				                        [
				                            {offset: 0, color: '#2378f7'},
				                            {offset: 0.7, color: '#2378f7'},
				                            {offset: 1, color: '#83bff6'}
				                        ]
				                    )
				                }
				            },
				            data: data
				        }
				    ]
				};
				
				// Enable data zoom when user click bar.
				var zoomSize = 6;
				myChart.on('click', function (params) {
				    console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
				    myChart.dispatchAction({
				        type: 'dataZoom',
				        startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
				        endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
				    });
				});
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
