/* 联合类型: union types
	表示取值可以为多种类型中的一种

	联合类型使用 | 分隔每个类型
		string | number 的含义是: 允许的类型是 string 或者 number, 但不能是其他类型

	例如:
		let myFavoriteNumer: string | number;
		myFavoriteNumber = 'six';
		myFavoriteNumber = 6;

	但是如果是这样: 会报错
		let myFavoriteNumber: string | number;
		myFavoriteNumber = true;
 */

/* 访问联合类型的属性或方法:
	当 TypeScript 不确定一个联合类型的变量到底是哪个类型的时候, 我们只能访问该联合类型的所有类型里面共有的属性或方法

	function getLength(something: string | number): number {
		return something.length;
	}

	// 会报错: length 不是 string 和 number 的共有属性

	而访问 string 和 number 的共有属性是没问题的:

	function getString(something: string | number): string {
		return something.toString();
	}

	联合类型的变量在被赋值的时候, 会根据类型推论的规则推断出一个类型:
		let number: string | number;
		number = 'six';
		console.log(number.length); // 3
		number = 6;
		console.log(numner.length); // 编译时报错, number 类型没有 length 属性

		// 上面 number = 'six' 被推断成了 string 类型, 而 number = 6 则被推断成了 numer 类型
 */