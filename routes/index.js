var express = require('express');
var router = express.Router();
var addr = require('./_areaData')

// home page
console.log(addr)
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Account Information' });
});

router.get('/my_list', function (req, res, next) {
    res.render('my_list');
})

//获取部门
router.get('/get_depart', function (req, res, next) {
    var db = req.con;
    var query = req.query.data;

    var sql = 'SELECT * FROM ga_depart  WHERE  id > 0';
    db.query(sql, function (err, rows) {
        var data = rows;
        res.json(rows)
    });
})
//获取地址
router.get('/address', function (req, res, next) {
    res.json(addr)
})
//获取个人信息
router.get('/get_user', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var sql = 'SELECT * from ga_user WHERE userid = ' + '"' + query.userid + '"';
    console.log(sql)
    db.query(sql, function (err, rows) {
        console.log(rows, 'dfd')
        var data = {};
        data.user = rows[0];
        if (rows.length) {
            var sql2 = 'SELECT * FROM ga_depart WHERE id = ' + '"' + rows[0].depart + '"';
            db.query(sql2, function (err, result) {
                console.log(result)
                data.depart = result[0];
                res.json(data)
            })
        } else {
            res.json(data);
        }


    })
    // console.log(query, 'query')
})


router.get('/get_car', function (req, res, next) {
    var db = req.con;
    var depart = req.query.depart;
    var sql = null;
    if (depart == 0) {
        sql = "select a.*,b.*,c.* from ((select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart > " + depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num) left join ga_user as c on b.name = c.name";
    } else {
        sql = "select a.*,b.*,c.* from ((select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart = " + depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num) left join ga_user as c on b.name = c.name";
    }
    db.query(sql, function (err, result) {
        // console.log(result)
        // data.depart = result[0];
        res.json(result)
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



router.get('/add_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    console.log(query);
    let form = query.form_option;
    let text = [];
    // let val = [];
    let val2 = [];
    for (var o in form) {
        text.push(o);
        if (o == 'cre_tm') {
            console.log(typeof parseInt(form[o]))
            val2.push(parseInt(form[o]))
        } else {
            val2.push(form[o])
        }

    }
    // console.log(typeof form.cre_tm)
    let _uid = query.form_option.uid
    let _cre_tm = query.form_option.cre_tm;
    let val_str = '';
    val2.forEach(ele => {
        val_str += '"' + ele + '",'
    })
    val_str = val_str.slice(0, -1);
    console.log(val_str)
    let str1 = 'INSERT INTO ga_apply(' + text.join(',') + ') VALUES(' + val_str + ')'
    // console.log(str1)

    let spstatus_data = query.auditer || [];

    db.query(str1, function (err, result) {
        console.log(result, 'ddd')
        let applyid = result.insertId;
        console.log(spstatus_data, 'dfd')
        // if (applyid) {
        spstatus_data.forEach(ele => {
            if (ele) {
                let _sop = {
                    id: 0,
                    uid: ele.id,
                    apply_id: applyid,
                    cre_tm: _cre_tm
                }
                if (ele.role == "科所队领导") {
                    _sop.status = 1
                } else if (ele.role == '警务保障室领导') {
                    _sop.status = 2
                } else {
                    _sop.status = 3
                }
                let stext = [];
                // let val = [];
                let sval = [];
                for (var o in _sop) {
                    stext.push(o);
                    if (o == 'cre_tm') {
                        sval.push(parseInt(_sop[o]))
                    } else {
                        sval.push(_sop[o])
                    }

                }
                let sval_str = '';
                sval.forEach(ele => {
                    sval_str += '"' + ele + '",'
                })
                sval_str = sval_str.slice(0, -1);
                let sstr = 'INSERT INTO ga_spstatus(' + stext.join(',') + ') VALUES(' + sval_str + ')'
                console.log(sstr)
                db.query(sstr, function (err, sres) {
                    console.log(sres, 'res')
                })
            }

        })
        res.json(applyid)
        // }


        // console.log(applyid)
    })


})
// router.get('./')



router.get('/getapply_list', function (req, res, next) {
    let db = req.con;
    let query = req.query;

    let sql = 'select * from ga_apply where id = ' + query.applyid;
    let _r_o = {};
    db.query(sql, function (err, row) {
        console.log(row);
        _r_o.apply = row;

        // let sql2 = 'select * from ga_spstatus where apply_id = ' + query.applyid;
        let sql2 = "select a.*,b.* from (select * ,ga_spstatus.id As sid,ga_spstatus.status As sstatus from ga_spstatus where apply_id = " + query.applyid + ") as a left join ga_user as b on a.uid = b.id";
        console.log(sql2)
        db.query(sql2, function (err, rows) {
            console.log(err,row)
            _r_o.spstatus = rows;
            res.json(_r_o);
        })

    })
    // console.log(query)
})
module.exports = router;
