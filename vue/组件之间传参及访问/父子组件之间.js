/*
如果有两个组件:
	父组件: father
		<child :msg="msg" @pass-msg="getPassMsg" ref="child" />
		<button @click="sayName">点击调用子组件中的 sayName 方法</button>

		data () {
			return {
				msg: '传递给子组件的参数'
			}
		},
		methods:{
			getPassMsg(value) {},
			sayHi() {
				console.log('你好');
			},
			sayName() {
				// 通过ref属性调用子组件中的方法
				this.$refs.child.sayName();
			}
		}
	
	子组件: child
		<div>
			<span>{{msg}}</span>
			<button @click="passMsg">点击传递给父组件参数</button>	
		</div>	

		<script>
			props: {
				msg: {
					type: String,
					default: ''
				}
			},	

			methods: {
				passMsg() {
					this.$emit('pass-msg', {
						value: 1
					})
					
					// 子组件中可使用 this.$parent 访问 父组件中的数据和方法
					this.$parent.sayHi();
				},
				sayName() {
					console.log('我是子组件');
				}
			}
		</script>


	1. 父传子
		父组件: father 中使用 子组件:
			通过 :msg="msg" 传递参数

		子组件: child 使用props 属性进行接收
			
	2. 子传父:
		通过使用 this.$emit() 注册并执行一个自定义事件, 在父组件中设置好自定义事件的处理函数: getPassMsg;
		该处理函数中有个参数value: 就是子组件注册执行的 自定义事件 传递的参数


	3. 在子组件中通过: this.$parent 可访问到父组件中的数据和方法


	4. 在父组件中 可通过 ref 属性访问到 子组件的数据和方法	
				

 */