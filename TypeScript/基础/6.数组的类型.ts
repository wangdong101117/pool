/* 数组的类型:
	在 TypeScript 中, 数组类型有多种定义方式, 比较灵活
 */

/* 类型 + [] 来表示数组
	let arr: number[] = [1, 2, 3, 4];

	数组的项中不允许出现其他的类型:
	let arr: number[] = [1, 2, '3', 4]; // 报错

	数组的一些方法的参数也会 根据数组在定义时的类型进行限制
	arr.push('7');
 */

/* 数组泛型
	我们也可会用数组泛型 Array<type> 来表示数组:

		let arr: Array<number> = [1, 2, 3, 4];
 */

/* 用接口表示数组
	接口也可用来描述数组:
		interface NumberArray {
			[index: number]: number;
		}

		let arr: NumberArray = [1, 1, 2, 3];

		// [index: number]: number; 表示: 索引的类型是数字, 值的类型也是数字

	虽然接口也可用来描述数组, 但一般不这样使用, 因为这种方式较为复杂
 */

/* 类数组:
	类数组并不是数组类型, 如: arguments

		// 下面这样写 报错
		function sum() {
			let args: number[] = arguments;
		}	

		// 因为 arguments 实际上是一个类数组, 不能用普通的数组的方式来描述, 而应该用接口

		function sum {
			let args: {
				[index: number]: number;
				length: number;
				callee: Function;
			} = arguments;
		}

		// 上面例子中, 我们除了约束当索引的类型是数字时, 值的类型必须是数字之外, 也约束了它还有 length 和 callee 两个属性

	事实上, 常用的类数组都有自己的接口定义:
		
		- IArguments	
		- NodeList
		- HTMLCollection 等

		function sum () {
			let args: IArguments = arguments;
		}	

		// IArguments 是 TypeScripts 中定义好了的类型, 实际上就是:

			interface IArguments {
				[index: number]: any;
				length: number;
				callee: Function;
			}
 */

/* any 在数组中的应用
	一个比较常见的做法是: 用 any 表示数组中允许出现任意类型:
		let list: any[] = ['1', 2, {name: 'zs'}];
 */