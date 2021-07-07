/*
	1. 布尔值类型：
		TS 中：使用 boolean 定义布尔值类型
			- 注意：使用 new Boolean() 创建的对象不是布尔值。事实上，该方法返回的是一个 Boolean 对象

			- 直接调用 Boolean() 阿返回一个 boolean 类型
 */

let isDone: boolean = false;
let createBoolean: boolean = Boolean(1);

/*
	2. 数值类型
		TS 中：使用 number 定义数值类型

 */

let num: number = 1;

/*
	3. 字符串类型：
		TS 中：使用 string 定义字符串类型
 */

let str: string = '刘京';


/* 
	4. 空值：
		JS 中没有空值（Void）的概念，在 TS 中，可用 void 表示没有任何返回值的函数

		- 声明一个 void 类型的变量没什么用，因为你只能将它赋值为 undefined 和 null
 */
function getName(): void {
	console.log('京京');
}

let unusable: void = undefined;

/*
	5. unll 与 undefined
		TS 中，使用 null 与 undefined 来定义这两个原始数据类型：
 */

let unde: undefined = undefined;
let nu: null = null;
	
	/*
		与 void 的区别：
			undefined 和 null 是所有类型的子类型，即：undefined 类型的变量可复制给 number 类型的变量。
	 */
	
	let num2: number = undefined; // 事实上，这样也不会报错，应该是非严格模式下，tsconfig.json 中配置 strict: false
	// 也可这样写：
	let und: undefined;
	let num4: number = und;

	/*
		但 void 类型的变量不能赋值给 number 类型的变量

		let u: void;
		let num3: number = u; // 会报错
	 */
	
