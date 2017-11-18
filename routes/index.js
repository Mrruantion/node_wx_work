// import { setTimeout } from 'timers';

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


//提交申请
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
        // console.log(result, 'ddd')
        let applyid = result.insertId;
        // console.log(spstatus_data, 'dfd')
        // if (applyid) {
        // console.log(spstatus_data,'ddddddd')
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
                // if()
                console.log(sstr)
                db.query(sstr, function (err, sres) {
                    console.log(sres, 'res')
                })
            } else {
                // if (form.role == '局领导') {
                //     console.log('ddd,')
                //     let sstr = 'INSERT INTO ga_spstatus(id,status,isagree,uid,advice,cre_tm,apply_id) VALUES(0,1,1' + form.uid + ',' + form.cre_tm + ',' + applyid + ')'
                //     db.query(sstr, function (err, sres) {
                //         console.log(sres, 'res')
                //     })
                // }
            }

        })
        if (!spstatus_data.length) {
            if (form.role == '局领导') {
                console.log('ddd,')
                let sstr = 'INSERT INTO ga_spstatus(id,status,isagree,uid,cre_tm,apply_id) VALUES("0","1","1","' + form.uid + '","' + form.cre_tm + '","' + applyid + '")'
                console.log(sstr, 'res')
                db.query(sstr, function (err, sres) {
                    console.log(err, sstr, 'res')
                })
            }
        }
        res.json(applyid)
        // }


        // console.log(applyid)
    })


})
// router.get('./')


//获取申请详情
router.get('/getapply_list', function (req, res, next) {
    let db = req.con;
    let query = req.query;

    // let sql = 'select * from ga_apply where id = ' + query.applyid;
    let sql = 'select a.*,b.* from (select * ,ga_apply.id as aid from ga_apply where id = ' + query.applyid + ') as a left join (select *,ga_user.id as usid,ga_user.name as uname,ga_user.status as ustatus from ga_user where id > 0) as b on a.uid = b.id'
    // let sql = ' select * from ga_apply where id = ' + query.applyid 
    let _r_o = {};
    db.query(sql, function (err, row) {
        console.log(row);
        _r_o.apply = row;

        // let sql2 = 'select * from ga_spstatus where apply_id = ' + query.applyid;
        let sql2 = "select a.*,b.* from (select * ,ga_spstatus.id As sid,ga_spstatus.status As sstatus from ga_spstatus where apply_id = " + query.applyid + ") as a left join ga_user as b on a.uid = b.id";
        console.log(sql2)
        db.query(sql2, function (err, rows) {
            console.log(err, row);
            let sql3 = 'select * from ga_cart where name = "' + row[0].car_num + '"';
            _r_o.spstatus = rows;

            if (row[0].car_num) {
                console.log(row[0].car_num, 'car');
                console.log(sql3)
                db.query(sql3, function (err, rows3) {
                    console.log(rows3)
                    _r_o.cart = rows3;
                    res.json(_r_o)
                })
            } else {
                res.json(_r_o);
            }
        })

    })
    // console.log(query)
})

//获取我的提交列表
router.get('/get_applys', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_apply where uid = ' + query.uid + ' order by id desc ';
    db.query(str, function (err, rows) {
        console.log(rows, '')
        let data = rows || [];
        if (data.length >= 1) {
            let i = 0;
            data.forEach((ele, index) => {
                var str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + 'order by ga_spstatus.status';
                db.query(str2, function (error, row) {
                    i++;
                    console.log(str2, error, index, i)
                    ele.spstatus = row || [];
                    if (data.length == i) {
                        res.json(data);
                    }

                })

            })
        } else {
            res.json(rows)
        }
    })
})


//获取我审核的列表
router.get('/audit_list', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var str = 'select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ') as a left join ga_apply as b on a.apply_id = b.id order by a.id desc'
    // var str = 'select * from ga_spstatus where uid = ' + query.uid
    let _index = 0;
    db.query(str, function (err, rows) {
        console.log(err, rows, query);
        let data = rows;
        data.forEach((ele, index) => {
            console.log(_index)
            if (ele.id) {
                let str1 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by ga_spstatus.status';
                db.query(str1, function (err, rowss) {
                    _index++;
                    console.log(str1, _index)
                    ele.spstatus = rowss;
                    if (data.length == _index) {
                        res.json(rows);
                    }
                })
            } else {
                _index++;
                if (rows.length == _index) {
                    res.json(rows);
                }
            }
        })
        // res.json(rows)
    })
})

//获取车队还车列表
router.get('/getcar_num', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str1 = "select a.*,b.* from (select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart = " + query.depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num";
    console.log(str1)
    // let str = 'select * from ga_cart where depart = 58';
    let i = 0;
    db.query(str1, function (err, row) {
        // res.json(row)
        row.forEach(ele => {
            let _eid = ele.id || 0
            let str = 'select * from ga_spstatus where apply_id = ' + _eid +'order by ga_spstatus.status';
            console.log(str, 'str')
            db.query(str, function (er, ro) {
                console.log(row.length, i, er)
                i++;
                ele.spstatus = ro;

                if (row.length == i) {
                    res.json(row)
                }
            })

        })

    })
})


router.get('/up_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str = 'UPDATE ga_apply SET etm=' + query.etm + ',is_sh = 2 WHERE id=' + query.id;
    db.query(str, function (err, row) {
        console.log(row);
        res.json(row)

    })
    // console.log(str)
})

router.get('/agree_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str = 'UPDATE ga_spstatus SET isagree=' + query.isagree + ' WHERE id=' + query.id;
    db.query(str, function (err, row) {
        console.log(row);
        res.json(row)

    })
})



router.get('/getdriver', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_apply where driver = 3 order by id desc ';
    db.query(str, function (err, rows) {
        console.log(rows, '')
        let data = rows || [];
        if (data.length >= 1) {
            let i = 0;
            data.forEach((ele, index) => {
                var str2 = 'select * from ga_spstatus where apply_id = ' + ele.id;
                db.query(str2, function (error, row) {
                    i++;
                    console.log(str2, error, index, i)
                    ele.spstatus = row || [];
                    if (data.length == i) {
                        res.json(data);
                    }

                })

            })
        } else {
            res.json(rows)
        }
    })
})



router.get('/getcar_driver', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str1 = "select a.*,b.* from (select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart = " + query.depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num";
    // console.log(str1)
    // let str = 'select * from ga_cart where depart = 58';
    // let i = 0;

    db.query(str1, function (err, row) {
        let data = { car: row }
        let str2 = "select a.*,b.* from (select *, ga_driver.id AS did, ga_driver.uid AS duid,ga_driver.cre_tm AS dcre_tm,ga_driver.name AS dname from ga_driver where uid = 1) as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.driver";
        db.query(str2, function (err, rows) {
            data.driver = rows;
            res.json(data)
        })

    })
})


router.get('/up_applypc', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str = 'UPDATE ga_apply SET car_num="' + query.car + '",driver = "' + query.driver + '" WHERE id=' + query.id;
    console.log(str)
    db.query(str, function (err, ros) {
        console.log(err)
        res.json(ros)
    })
})

// router.get('/up_applyend', function (req, res, next) {
//     var db = req.con;
//     var query = req.query;
//     let str = 'UPDATE ga_apply SET etm="' + query.car + '",driver = "' + query.driver + '" WHERE id=' + query.id;
//     db.query(str, function (err, ros) {
//         console.log(err)
//         res.json(ros)
//     })
// })

module.exports = router;
