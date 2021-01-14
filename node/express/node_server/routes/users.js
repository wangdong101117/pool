var express = require('express');
var router = express.Router();

let resData;
	router.use((req,res,next)=>{
		resData = {
			code:200,//200表示得到了返回值，后面可以定义其他的返回代码
			message:""
		}
	})
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

/* GET users listing. */
router.get('/', function(req, res, next) {
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

module.exports = router;
