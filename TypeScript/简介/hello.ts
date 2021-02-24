function say(person: string) {
	return `Hello, ${person}`;
}

let user = '张三';
console.log(say(user));

// 执行 tsc hello.ts 将文件编译为js, 这时会生成一个编译好的hello.js

/*
	在 TypeScript 中, 使用 : 指定变量的类型, : 前后有无空格都可
		在上述示例中: 用 : 来指定 person 参数类型为 string, 但在编译为js后, 并无其他检查到的代码
		被插进来, 这是因为: TypeScript 只会在编译时对类型进行静态检查, 如果发现有错误, 编译时就会报错, 
		而在运行时, 与普通的 JavaScript 文件一样, 不会对类型进行检查

		因此, 如果我们需要保证运行时的参数类型, 还得手动对类型进行判断:
 */ 
function sayHi(person: string) {
	if (typeof person === 'string') {
		return `Hello, ${person}`;	
	} else {
		throw new Error('person is not a string');
	}
}

/*
	在对 TypeScript 代码进行编译时, vscode会提示错误, 编译时也会出错, 但还是会生成 .js 文件
	这是因为, 编译时即使报错了, 还是会生成编译结果, 我们仍可使用这个编译后的文件

	- 如果要在报错时终止 js 文件的生成, 可在 tsconfig.json 中配置 noEmitOnError 即可
*/