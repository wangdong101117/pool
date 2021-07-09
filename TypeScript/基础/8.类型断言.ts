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
					if (typeof animal.swim === 'function') {
						return true;
					}

					return false;
				}


			上面例子中，获取animal.swim 的时候会报错。
			此时可使用 “类型断言”，将 animal 断言成 Fish：

				interface Cat {
					name: string;
					run(): void;
				}

				interface Fish {
					name: string;
					swim(): void;
				}

				function isFish (animal: Cat | Fish) {
					if (typeof (animal as Fish).swim === 'function') {
						return true;
					}

					return false;
				}

			这样就可解决方法 animal.swim 报错的问题了

			需要注意的是： 类型断言只能 “欺骗”	TypeScript 编译器，无法避免运行时的错误，反而滥用类型断言可能会导致 运行时错误。

				interface Cat {
					name: string;
					run(): void;
				}

				interface Fish {
					name: string;
					swim(): void;
				}

				function swim(animal: Cat | Fish) {
					(animal as Fish).swim();
				}

				const tom:Cat = {
					name: 'Tom',
					run() {
						console.log('run');
					}
				}

				swim(tom);

			上面的例子在编译时不会报错，反而在运行时会报错；
			原因： (animal as Fish).swim() 这段代码隐藏了 animal 可能为 Cat 的情况，将 animal 直接断言为了 Fish，而 TypeScript 编译器信任了我们的断言，所以在调用 swim() 是没有报错。

			但是 swim 函数接受的参数是 Cat | Fish， 一旦传入的参数是 Cat 类型的变量，Cat 上没有 swim 方法，就会导致运行时错误了。	
 */