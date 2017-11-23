var express = require('express');
var router = express.Router();

// home page
router.get('/', function (req, res, next) {
    res.render('fix_apply', { title: 'Account Information' });
});

//获取车牌号码
router.get('/hphm', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_cart where depart = ' + query.depart;
    db.query(str, function (err, row) {
        console.log(err, row);
        res.json(row)
    })
})


//获取维修单位
router.get('/wxdw', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_factory where XLH > 0';
    db.query(str, function (err, rows) {
        console.log(err, rows);
        res.json(rows);
    })
})



router.get('/getaudit', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    console.log(query)
    var str = [];
    for (var o in query) {
        str.push(query[o])
    }
    var sql = 'select * from ga_user where depart in (' + str.join(',') + ')'
    console.log(sql)
    db.query(sql, function (err, result) {
        // console.log(result)
        // data.depart = result[0];
        res.json(result)
    })
})
module.exports = router;
