/*
	任意值（any）用来表示允许赋值为任意类型

	如果是一个普通类型，那么在赋值过程中改变类型是不被允许的：
		let myGirl: string = '京京';
		myGirl = 22; // 会报错，不允许被赋值为 数字类型

	但：如果是 any 类型，则允许被赋值为任意类型。
		let myGirl: any = '京京';
		myGirl = 22;	
 */

let myGirl: any = '京京';
myGirl = 22;

/*
	任意值的属性和方法：
		在任意值上访问任何属性以及调用任何方法都是允许的：

 */

let anyThing: any = 'hello';
console.log(anyThing.myGirl);

let anyName: any = '张三';
anyName.setName('李四');


/*
	未声明类型的变量
		变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型。
 */

let something;
something = 'jingjing';
something = 22;
something.setName('京京');

console.log(something);