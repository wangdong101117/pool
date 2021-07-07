/*
	联合类型：union types 【表示取值可以为多种类型的其中一种】

	联合类型使用 | 分割每个类型
		如： string | number 的含义：允许的类型是 string 或者 number，但不能是其他类型。
 */


let myGirl: string | number;
myGirl = 'jingjing';
myGirl = 22;

/*
	访问联合类型的属性或者方法：
		当 TS 不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问该联合类型的所有类型里面共有的属性或方法。

		function getLength(something: string | number): number {
			return something.length; 
		}

		// 上面代码在编译时会报错：因为 length 不是 string 和 number 的共有属性

		// 而访问 string 和 number 的共有属性是没问题的：

		function getString(something: string | number): string {
			return something.toString();
		}


		联合类型的变量在被赋值的时候，会根据类型推论的规则推断出一个类型:

			let number: string | number;
			number = 'six'; // 此时 被推断为了 string 类型

			console.log(number.length); // 3

			number = 6; // 此时 被推断为了 number 类型
			console.log(number.length); // 编译时报错，number 类型没有 length 属性
 */