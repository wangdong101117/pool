// 任意值 (any) 用来表示允许赋值为 任意类型

/* 任意值类型:
	如果是一个普通类型, 那么在赋值过程中改变类型是不被允许的:

		let myFavoriteNumber: string = 'six';
		myfavoriteNumber = 6;

		// 报错: index.ts(2, 1): error...  Type 'number' is no assignable to type 'string'

	但是如果是 any 类型, 则允许被赋值为任意类型

		let myFavoriteNumber: any = 'six';
		myFavoriteNumber = 6;	 
*/

/* 任意值的属性和方法:
	在任意值上访问任何属性以及调用任何方法都是允许的:
 */

let anyThing: any = 'hello';
console.log(anyThing.myName);
console.log(anything.myName.firstName);
	
let anyName: any = '张三';
anyName.setName('李四');
anyName.setName('李四').sayHi();

	// 可以认为: 声明一个变量为任意值之后, 对它的任何操作, 返回的内容得类型都是任意值

/* 未声明类型的变量
	变量如果在声明的时候, 未指定其类型, 那么它会被识别为任意值类型:
 */	

let something;
something = 'six';
something = 6;
something.setName('张三');

	// 等价于:
	let something: any;
	something = 'six';
	something = 6;
	something.setName('张三');		
