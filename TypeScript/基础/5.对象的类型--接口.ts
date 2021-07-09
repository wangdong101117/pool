/* 对象的类型--接口:
	在 TypeScript 中: 我们使用接口(Interfaces) 来定义对象的类型
 */

/* 什么是接口
	在面向对象语言中: 接口(interfaces) 是一个很重要的概念, 它是对行为的抽象, 而具体的则需要通过类(classes)去实现

	TypeScript 中的接口是一个非常灵活的概念, 除了可用于对类的一部分行为进行抽象外, 也常用于对: 对象的形状进行描述

	如:
		interface Person {
			name: string;
			age: number;
		}

		let tom: Person = {
			name: 'Tom',
			age: 25
		};

		上面例子中, 定义了一个接口 Person, 接着定义了一个变量 tom, 它的类型是 Person; 这样我们就约束了 tom 的形状必须和接口 Persion 一致

	接口一般首字母大写;

	定义的变量比接口少或多一些属性是不被允许的	
 */

/* 可选属性:
	有时我们希望不要完全匹配一个形状, 那么可以用: 可选属性
		可选属性的含义是该属性可以不存在; 但仍然不允许添加未定义的属性

	interface Person {
		name: string;
		age?: number;
	} 

	let tom: Person = {
		name: 'Tom'
	};

	let jenny: Person = {
		name: 'Jenny',
		age: 20
	}
 */

/* 任意属性
	有时候我们希望一个接口允许有任意的属性, 可使用如下方式

	interface Person {
		name: string;
		age?: number;
		[propName: string]: any;
	}

	let tom: Person = {
		name: 'Tom',
		gender: 'male'
	}

	使用 [propName: string] 定义了任意属性取 string 类型的值
	需要注意的是: 一旦定义了任意属性, 那么确定属性和可选属性的类型都必须是它的类型的子集

		let tom: Person = {
			name: 'Tom',
			age: 25,
			gender: 'male'
		}

		// 报错, 因为任意属性的值允许是 string, 但可选属性 age 的值却是 number类型, number不是 string 的子属性, 所以报错了; // 这里应该是解释错误

	一个接口中只能定义一个任意属性; 如果接口中有多个类型的属性, 则可以在任意属性中使用联合类型: 

		interface Person {
			name: string;
			age?: number;
			[propName: string]: string | number;
		}

		let tom: Person = {
			name: 'Tom',
			age?: 25,
			gender: 'male'
		};
 */

/* 只读属性:
	有时候我们希望对象中的一些字段只能在创建的时候被赋值, 那么可以用 readonly 定义只读属性:

		interface Person {
			readonly id: number;
			name: string;
			age?: number;
			[propName: string]: any;
		}

		let tom: Person = {
			id: 89757,
			name: 'Tom',
			gender: 'male'
		};

		tom.id = 9527; // 报错, 使用 readonly 定义的属性 id 初始化后, 又被赋值了, 所以报错了

	注意: 
		只读的约束是存在于第一次给对象赋值的时候, 而不是第一次给只读属性赋值的时候:
 */