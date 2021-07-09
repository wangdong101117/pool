/*
    JavaScript 的类型分为两种:
        - 原始数据类型(基本数据类型)
            - Number
            - String     
            - Boolean
            - Undefined
            - Null
            (es6中的新类型: Symbol 和 es10中的新类型： BigInt)
        
        - 对象数据类型(复杂数据类型)
*/ 

/* 1. 布尔值类型: 
        TypeScript中: 使用 boolean 定义布尔值类型

        - 注意: 使用 new Boolean() 创建的对象不是布尔值
            - 事实上, new Boolean() 返回的是一个 Boolean 对象
        
            - 直接调用 Boolean() 也可返回一个 boolean 类型
*/

let isDone: boolean = false;
let createNewBoolean: boolean = new Boolean(1); // 这种方式创建的对象不是布尔值 Type 'Boolean' is not assignable to type 'boolean'.
let createOtherBoolean: boolean = Boolean(1);


/* 2. 数值:
        TypeScript中: 使用 number 定义数值类型
*/

let num: number = 1;

    /* - 编译后的结果为: 
            let num = 1;
    */


/* 3. 字符串:
        TypeScript中: 使用 string 定义字符串类型
*/

let str: string = '张三';
let say_str: string =  `你好, 我的名字是: ${str}`;


/* 4. 空值:
        JavaScript 中没有空值(Void)的概念, 在TypeScript中, 可用 void 表示没有任何返回值的函数
*/

function getName(): void {
    return '张三';
}

    /*
        声明一个 void 类型的变量没什么用, 因为你只能将它赋值为 undefined 和 null
    */
    let unusable: void = undefined;


/* 5. Null 和 Undefined
        TypeScript中, 可使用 null 和 undefined 来定义这两个原始数据类型:
*/

let und: undefined = undefined;
let nu: null = null;

    /*
        与 void 的区别: undefined 和 null 是所有类型的子类型, 即: undefined 类型的变量可赋值给 number 类型的变量 
    */
    
    let num: number = undefined; // 这样也不会报错, 应该是非严格模式下, tsconfig.json 中配置 strict: false
    // 或者:
    let und: undefined;
    let num: number = und;

    /* 
        但是: void类型的变量不能赋值给 number 类型的变量
    */
   
    let u: void;
    let num: numebr = u; // 这样会报错 Type 'void' is not assignable to type 'number'.