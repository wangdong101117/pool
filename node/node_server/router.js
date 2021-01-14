/**
 * router.js 路由模块
 * 职责:
 * 		处理路由
 * 		根据不同的请求方法+请求路径设置具体的请求处理函数
 * 	模块职责要单一, 不要乱写
 * 	我们划分模块的目的就是为了增强项目代码的可维护性, 提升开发效率	
 */

var fs = require('fs');
var Student = require('./api/student')

// Express框架 提供了一种专门用来包装路由的方式
var express = require('express');

// 1. 创建路由容器
var router = express.router();

// 2. 将路由挂载到 router路由当中
// 

/* 渲染学生列表界面 */
router.get('/students', function (req, res) {
	if (req.query.name !== null && req.query.name !== undefined && req.query.name !== '') {

	}
})

module.exports = router;