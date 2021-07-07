/* 函数声明:
	JS中, 有两种常见的定义函数的方式: 
		- 函数声明语句
			function sum() {}
		- 函数表达式
			let sum = function() {}
	
	一个函数有输入和输出, 要在 TS 中对其进行约束, 需要将输入和输入都考虑到, 其中函数声明的类型定义较为简单:


	函数声明：

		function sum (x: number, y: number): number {
			return x + y;
		} 

		// 调用时，实参个数必须要与形参的个数相同
		sum(1, 2); 


	函数表达式:
		
		let mySum: (x: number, y: number) => bumber = function (x: number, y:number): number {
			return x + y;
		}

		注意不要混淆了 TypeScript 中的 => 与 ES6 中的 =>。

		在TypeScript 的类型定义中，=> 用来表示函数的定义，左边是输入类型，需要用括号括起来，右边是输出类型。


	用接口定义函数的形状：
		可使用井口的方式来定义一个函数需要符合的形状：

			interface searchFunc {
				(source: string, subString: string): booleadn;
			}

	
	可选参数：
		实参的个数不等于形参的个数时，是不允许的。如何定义可选参数呢？

		与接口中的可选属性类似，我们用 ？ 表示可选的参数：

			function buildName (firstName: string, lastName?: string) {
				if (lastName) {
					return firstName + ' ' + lastName; 
				} else {
					return firstName;
				}
			}				

			let ljwd = buildName('liuj', 'wangd');
			let jj = buildName('jingjing');

		- 注意点：
			可选参数必须在必选参数的后面


	参数默认值：
		在 ES6 中，我们允许给函数的参数添加默认值，TypeScript会将添加了默认值的参数识别为可选参数：

			function buildName (firstName: string, lastName: string = 'wangd') {
				return firstName + ' ' + lastName;
			}

			- 注意: 此时就不受：可选参数必须接在必选参数后面的限制了：

	剩余参数：
		在 ES6 中，可用 ...rest 的方式获取函数中的剩余参数（rest参数）：

		function push (array, ...items) {
			items.forEach(function (item) {
				array.push(item);
			})
		}

		let a: any[] = [];
		push(a, 1, 2, 3);

		事实上，items 是一个数组。因此可用数组的类型来定义它：
			function push (array: any[], ...items: any[]) {
				items.forEach(function (item) {
					array.push(item);
				})
			}

			let a = [];
			push(a, 1, 2, 3);	
 */