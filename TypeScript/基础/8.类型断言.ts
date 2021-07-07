/*
	类型断言（Type Assertion）可用来手动指定一个值的类型。

	语法：
		1. 值 as 类型 （推荐使用）
		2. <类型>值

		在 tsx 语法（React 的 jsx 语法的 ts 版）中必须使用前者，即 值 as 类型。


	类型断言的作用：
		1. 将一个联合类型断言为其中一个类型
			因为当 TypeScript不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问此联合类型的所有类型中共有的属性或方法：

				interface Cat {
					name: string;
					run(): void;
				}

				interface Fish {
					name: string;
					swim(): void;
				}

				function getName (animal: Cat | Fish) {
					return animal.name
				}


			而有的时候，确实还需要在不确定类型的时候就访问其中一个类型特有的属性或方法，比如：

				interface Cat {
					name: string;
					run(): void;
				}

				interface Fish {
					name: string;
					swim(): void;
				}

				function isFish (animal: Cat | Fish) {
					
				}


 */