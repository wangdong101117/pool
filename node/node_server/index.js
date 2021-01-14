/**
 * index.js 入口文件模块
 * 职责:
 * 		创建服务
 * 		做一些服务相关配置
 * 			模板引擎
 * 			body-parser 解析表单 post 请求体
 * 			提供静态资源服务
 * 		 	挂载路由
 * 		监听端口启动服务	
 */

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

// 创建express服务器
var app = express();

// 拆分模块, 使用express.router(), 这里放在router.js中完成
var router = express.Router();
// var router = require('./router');


app.use(cors());
// 配置模板引擎以及 body-parser 一定要在 app.use(router) 挂载路由之前
app.use(bodyParser.json()); // json请求
app.use(bodyParser.urlencoded({extended: false})); // 表单请求

// 解决跨域请求
app.use(function(req, res, next) {
 	res.header("Access-Control-Allow-Origin", "*");
 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
  	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  	res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

var mysql = require('mysql');
var options = {
	host: 'localhost', // mysql服务器地址
	user: 'root', // 数据库用户名
	password: 'wang08101117', // 数据库密码
	port: 3306, // 端口号, 如果默认为3306, 可不写
	database: 'node_server', // 要操作的数据库
	connectTimeout: 5000, // 连接超时时间
} 
var conn = mysql.createConnection(options)

	// -3. 连接数据库:
conn.connect()
let resData;
	router.use((req,res,next)=>{
		resData = {
			code:200,//200表示得到了返回值，后面可以定义其他的返回代码
			message:""
		}
	})
app.get('/', function(req, res, next) {
  	let sql = `select * from student`
	conn.query(sql, (err, result) => {
		if (err) {
			console.log(err)
		}
		if (result) {
			console.log(result);
			resData.data = result;
			res.json(resData)
		}
	})
});

// 挂载路由到app服务中
app.use(router);

// 开启创建的服务器
app.listen(3000, () => {
	console.log('node server express 服务启动');
})