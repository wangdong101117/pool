var Student = new Object();
var mysql = require('mysql');
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'wang08101117',
	database: 'node_server'
})
conn.connect();

/**
 * 查询所有学生
 * @param callback
 */
Student.find = function (callback) {
	conn.query(
		`SELECT * FROM student`,
		function (err, result) {
			if (err) {
				console.log('[SELECTERRIR] - ', err.message);
				return callback(err);
			}
			callback(null, result);
		});
}