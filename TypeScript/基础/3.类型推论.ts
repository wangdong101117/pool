/* 类型推论:
	如果没有明确的指定类型, 那么 TypeScript 会依照类型推论(Type Inference) 的规则推断出一个类型
 */

/* 什么是类型推论:
	例如: 
		let myFavoriteNumber = 'six';
		myFavoriteNumber = 6; 

		// 会报错, 因为 这等价于:

		let myFavoriteNumber: string = 'six';
		myFavoriteNumber = 6;


	TypeScript 会在没有明确的指定类型的时候推测出一个类型, 这就是类型推论	
 */

/* 如果定义的时候没有赋值, 不管之后有没有赋值都会被推断成 any 类型而完全不被类型检查
 */
let myFavoriteNumber;
myFavoriteNumber = 'six';
myFavoriteNumber = 6;