$(document).ready(function () {
    // console.log(W.getSearch())

    function beta() {
        var _g = W.getSearch();
        var _user = JSON.parse(localStorage.getItem('user1'));
        var vehicleCaptain = null;
        var sendname = null;
        var senduserid = null;
        var driver = '';
        var car = '';
        var status = {
            0: '撤销',
            1: '审批中',
            4: '驳回',
            5: '通过',
            6: '还车'
        }
        var role = {
            9: '普通成员',
            12: '部门领导',
            13: '公司领导'

        }
        if (_user) {
            mainContral(_user)
        } else {
            if (_g.userid) {
                $.ajax({
                    url: '/login',
                    data: { password: hex_md5('123456') },
                    success: function (res) {
                        W.setCookie('dev_key', res.wistorm.dev_key);
                        W.setCookie('app_key', res.wistorm.app_key);
                        W.setCookie('app_secret', res.wistorm.app_secret);
                        W.setCookie('auth_code', res.access_token);
                        wistorm_api.getUserList({ username: _g.userid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                            _user.user = json.data[0];
                            wistorm_api._list('employee', { uid: _user.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                _user.employee = emp.data[0];
                                wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                    _user.depart = dep.data[0];
                                    mainContral(_user)
                                })
                            })
                        })
                    }
                })
            }
        }

        function mainContral(user) {
            console.log(user, 'user')
            localStorage.setItem('user1', JSON.stringify(user));
            //获取车队队长信息
            wistorm_api._list('department', { name: '车队', uid: user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                console.log(dep, 'dep')

                wistorm_api._list('employee', { departId: dep.data[0].objectId, companyId: user.employee.companyId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                    dep.data[0].employee = emp.data[0]
                    // console.log(emp)
                    wistorm_api.getUserList({ objectId: emp.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        dep.data[0].employee.user = json.data[0];
                        vehicleCaptain = dep.data[0];
                        // console.log(dat)
                    })
                })
            })

            W.$ajax('mysql_api/list', {
                json_p: { id: _g.applyid },
                table: 'ga_apply'
            }, function (res) {
                wistorm_api._list('vehicle', { name: res.data[0].car_num }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (vvv) {
                    res.data[0].cart = vvv.data[0];
                    wistorm_api._list('department', { objectId: res.data[0].depart }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                        res.data[0].departName = dep.data[0];
                        wistorm_api.getUserList({ objectId: res.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                            res.data[0].user = json.data[0];
                            console.log(res, 'res')
                            W.$ajax('mysql_api/list', {
                                json_p: { apply_id: res.data[0].id },
                                table: 'ga_spstatus',
                                sorts: 'status'
                            }, function (sps) {
                                var i = 0;
                                sps.data.forEach(ele => {
                                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json1) {
                                        ele.user = json1.data[0];
                                        wistorm_api._list('employee', { uid: ele.uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp1) {
                                            i++;
                                            ele.employee = emp1.data[0]
                                            if (i == sps.data.length) {
                                                res.data[0].spstatus = sps.data;
                                                // console.log(res.data[0],'ddff')
                                                showMesssage(res.data[0])
                                            }
                                        })

                                    })
                                })
                            })
                        })
                    })
                })

            })
        }

        function showMesssage(data) {
            console.log(data);
            console.log(vehicleCaptain, 'vehicle')
            var applystatus = data.spstatus[0].sp_status
            sendname = data.name
            $('#name').text(data.name)
            $('#address').text(data.address || '');
            $('#days').text(data.days || '');
            $('#peer').text(data.peer || '');
            $('#province').text(data.province || '');
            $('#night').text(data.night ? '是' : '否');
            $('#car_num').text(data.car_num || '');
            $('#driver').text(data.driver == 3 ? '' : data.driver);
            $('#container').show();
            showAuditer(data.spstatus);
            if (_g.my && applystatus == 1) {
                $('#my_button').show();
            }
            if (_g.my && applystatus == 5) {
                if (data.cart) {
                    if (data.cart.departId == vehicleCaptain.objectId) { //通知车队还车
                        $('#carlist_back').show()
                    } else { //自己还车
                        $('#back_car').show()
                    }
                }

            }
            if (_g.auditing && applystatus == 1) {
                data.spstatus.forEach(ele => {
                    if (ele.uid == _user.employee.uid && !ele.isagree) {
                        $('#other_button').show();
                    }
                })
            }

            if (_g.vehiclesend && applystatus == 5 && !data.car_num) {
                $('#pcar_driver').show();
                $('#pcar_dd').show();
                showCarDriver()
            }
            if (_g.vehiclesend && applystatus == 5 && data.car_num) {
                $('#back_carlist').show()
            }
            all_toast(data)

            var use_status = '';
            var color_status = '';
            applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
            applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;
            var span_status = `<span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;" id="_spstatus">${use_status}</span>`
            $('#_spstatus_1').empty();
            $('#_spstatus_1').append(span_status);
        }

        function showAuditer(data) {
            $('#auditer').empty();
            data.forEach(ele => {
                if (ele.isagree == 0) {
                    senduserid = ele.user.username;
                }
                var icon = !ele.isagree ? '<i class="weui-icon-circle f14 flow_agree_icon"></i>' : ele.isagree == 1 ? '<i class="weui-icon-success f14 flow_agree_icon"></i>' : '<i class="weui-icon-cancel f14 flow_agree_icon"></i>'
                var aud = !ele.isagree ? '·审批中' : ele.isagree == 1 ? '·已通过' : '·驳回'
                var tr_content = `
                <div class="weui-flex">
                <div class="weui-flex__item">
                    <div class="weui-cell weui-cell_access p_0 ">
                        <div class="flow_agree weui-media-box_text w_100">
                            `+ icon + `
                            <img src="./img/1.png" class="small_img">
                            <span class="f_w_7 ">`+ ele.employee.name + aud + `</span>
                        </div>
                    </div>
                </div>
            </div>`
                $('#auditer').append(tr_content);
            })
        }

        function showCarDriver() {
            wistorm_api._list('vehicle', { departId: _user.depart.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (veh) {
                var i = 0;
                if (veh.data.length) {
                    veh.data.forEach(ele => {
                        if (ele.status == 1) { //出车
                            W.$ajax('mysql_api/list', {
                                table: 'ga_apply',
                                json_p: { car_num: ele.name, etm: 0 },
                                sorts: '-id'
                            }, function (res) {
                                ele.apply = res.data[0];
                                if (res.data[0]) {
                                    wistorm_api._list('employee', { name: res.data[0].name }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                        i++;
                                        ele.driverMessage = emp.data[0];
                                        if (i == veh.data.length) {
                                            show_car(veh.data)
                                        }
                                    })
                                }else {
                                    i++;
                                    if (i == veh.data.length) {
                                        show_car(veh.data)
                                    }
                                }
                            })
                        } else {
                            i++;
                            if (i == veh.data.length) {
                                show_car(veh.data)
                            }
                        }
                    })
                } else {
                    show_car(veh.data)
                }

            })
            wistorm_api._list('employee', { departId: _user.depart.objectId, role: 9 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                var i = 0;
                if (emp.data.length) {
                    emp.data.forEach(ele => {
                        // if (ele.status == 1) { //出车
                        W.$ajax('mysql_api/list', {
                            table: 'ga_apply',
                            json_p: { driver: ele.name, etm: 0 },
                            sorts: '-id'
                        }, function (res) {
                            ele.apply = res.data[0];
                            i++;
                            if (i == emp.data.length) {
                                show_driver(emp.data)
                            }
                        })
                    })
                } else {
                    show_driver(emp.data)
                }
            })
            function show_car(res) {
                console.log(res, 'car')
                var car_data = [];
                // var user_car = [];
                res.forEach((ele, index) => {
                    var op = {};
                    if (ele.status == 1) {
                        ele.apply && ele.driverMessage ? op.label = ele.name + '(' + ele.apply.name + ele.driverMessage.tel + ')' : ele.apply ? op.label = ele.name + '(' + ele.apply.name + ')' : op.label = ele.name;
                    } else {
                        op.label = ele.name
                    }
                    op.value = ele.objectId;
                    car_data.push(op);
                    // ele.status == 0 ? user_car.push(ele) : null
                })
                $('#select_car').on('click', function () {
                    weui.picker(car_data, {
                        onConfirm: function (result) {
                            console.log(result)
                            car = result[0].label;
                            $('#carss').text(result[0].label)
                        },
                        id: 'select_car'
                    });
                });
            }
            function show_driver(res) {
                console.log(res, 'res')
                var driver_data = [];
                res.forEach((ele, index) => {
                    var op = {};
                    ele.apply ? op.label = ele.name + '(' + ele.apply.car_num + ')' : op.label = ele.name;
                    // op.label = ele.name
                    op.value = ele.objectId;
                    driver_data.push(op);
                })
                $('#select_driver').on('click', function () {
                    weui.picker(driver_data, {
                        onConfirm: function (result) {
                            console.log(result)
                            driver = result[0].label;
                            $('#driverss').text(result[0].label)
                        },
                        id: 'select_driver'
                    });
                });
            }
        }

        function all_toast(data) {
            console.log(data, 'toast_button');
            $('#urge').on('click', function () {  //催办
                weui.alert('已催办', function () {
                    sendmessage(_g.applyid, senduserid, sendname, '', 2, function () {
                        history.go(0)
                    })
                })
            })

            //撤销
            $('#backout').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { etm: etm, estatus: 0, is_sh: 2 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 0, },
                        table: 'ga_spstatus'
                    }, function (u_s) {
                        console.log(u_s)
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '撤销成功', 1, function () {
                                history.go(0)
                            })

                        });
                    })
                })
            })
            //同意
            $('#agree').on('click', function () {
                if (data.status == 1) { //一级审批
                    var etm = ~~(new Date().getTime() / 1000)
                    W.$ajax('mysql_api/update', {
                        json_p: { id: _g.applyid },
                        update_json: { estatus: 8, is_sh: 2 },
                        table: 'ga_apply'
                    }, function (res) {
                        console.log(res)
                        W.$ajax('mysql_api/update', {
                            json_p: { uid: _user.user.objectId },
                            update_json: { isagree: 2, sp_status: 5 },
                            table: 'ga_spstatus'
                        }, function (us) {
                            if (data.car_num) {
                                sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, function () {
                                    history.go(0)
                                })
                            } else {
                                sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '派车申请', 3, function () {
                                    sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, function () {
                                        history.go(0)
                                    })
                                })
                            }
                        })
                    })
                } else if (data.status == 3) { //三级审批
                    if (_user.employee.role == 13) {
                        W.$ajax('mysql_api/update', {
                            json_p: { id: _g.applyid },
                            update_json: { estatus: 8 },
                            table: 'ga_apply'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { uid: _user.user.objectId },
                                update_json: { isagree: 1 },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/update', {
                                    json_p: { apply_id: _g.applyid },
                                    update_json: { sp_status: 5 },
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    if (data.car_num) {
                                        sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, function () {
                                            history.go(0)
                                        })
                                    } else {
                                        sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '派车申请', 3, function () {
                                            sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, function () {
                                                history.go(0)
                                            })
                                        })
                                    }

                                })
                            })
                        })

                    } else if (_user.employee.role == 12) {
                        if (data.spstatus.length == 1) {
                            wistorm_api._list('department', { isSupportDepart: true, uid: _user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                wistorm_api._list('employee', { departId: dep.data[0].objectId, role: 12 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    var i = 0;
                                    emp.data.forEach(ele => {
                                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                            ele.user = json.data[0]
                                            i++;
                                            if (i == emp.data.length) {
                                                console.log(emp.data)
                                                selectAuditer(emp.data, 1)
                                            }
                                        })
                                    })
                                })
                            })
                        } else if (data.spstatus.length == 2) {
                            wistorm_api._list('employee', { departId: '1', role: 13 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                var i = 0;
                                emp.data.forEach(ele => {
                                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                                        ele.user = json.data[0];
                                        i++;
                                        if (i == emp.data.length) {
                                            console.log(emp.data)
                                            selectAuditer(emp.data, 2)
                                        }
                                    })
                                })
                            })
                        }
                    }
                }

                function selectAuditer(data, type) {
                    $('#nextAuditer').empty();
                    var append_spstatus = {};
                    var sendid = null;
                    var _index = null;
                    data.forEach((ele, index) => {
                        var _id = 'add' + index;
                        var checked = 'checked';
                        ele.responsibility.indexOf('1') > -1 ? _index = index : index == 0 ? _index = index : ''
                        var tr_content = `
                        <label>
                            <div class="weui-cell weui-cell_access" id="` + _id + `">
                                <input type="radio" style="margin-right:5px" name='add' `+ (ele.responsibility.indexOf('1') > -1 ? checked : index == 0 ? checked : '') + `/>
                                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                    <img src="./img/1.png" style="width: 50px;display: block">
                                </div>
                                <div class="weui-cell__bd">
                                    <p>`+ ele.name + `</p>
                                    <p style="font-size: 13px;color: #888888;">`+ role[ele.role] + `</p>
                                </div>
                            </div>
                            <label />
                        `
                        $('#nextAuditer').append(tr_content);
                        $('#' + _id).on('click', function () {
                            console.log(index)
                            append_spstatus = {
                                id: 0,
                                isagree: 0,
                                uid: data[index].uid,
                                cre_tm: ~~(new Date().getTime() / 1000),
                                apply_id: _g.applyid,
                                sp_status: 1
                            }
                            type == 1 ? append_spstatus.status = 2 : type == 2 ? append_spstatus.status = 3 : null;
                            sendid = data[index].username
                        })
                    })
                    append_spstatus = {
                        id: 0,
                        isagree: 0,
                        uid: data[_index].uid,
                        cre_tm: ~~(new Date().getTime() / 1000),
                        apply_id: _g.applyid,
                        sp_status: 1
                    }
                    type == 1 ? append_spstatus.status = 2 : type == 2 ? append_spstatus.status = 3 : null;
                    sendid = data[_index].user.username;
                    $('#androidDialog1').fadeIn(200);
                    $('#audit_cancle').on('click', function () {
                        $('#androidDialog1').fadeOut(200);
                    })
                    $('#audit_commit').on('click', function () {
                        // console.log(11)
                        console.log(append_spstatus, 'spstatus')
                        var update_json = {};
                        if (type == 1) {
                            update_json.estatus = 4
                        } else if (type == 2) {
                            update_json.estatus = 6
                        }
                        W.$ajax('mysql_api/update', {
                            json_p: { id: _g.applyid },
                            update_json: update_json,
                            table: 'ga_apply'
                        }, function (res) {
                            W.$ajax('mysql_api/update', {
                                json_p: { uid: _user.user.objectId },
                                update_json: { isagree: 1 },
                                table: 'ga_spstatus'
                            }, function (res1) {
                                W.$ajax('mysql_api/create', {
                                    json_p: append_spstatus,
                                    table: 'ga_spstatus'
                                }, function (res2) {
                                    sendmessage(_g.applyid, sendid, sendname, '', 2, function () {
                                        history.go(0)
                                    })
                                })
                            })
                        })
                    })
                }
            })
            //驳回
            $('#reject').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { etm: etm, estatus: 0, is_sh: 2 },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { uid: _user.user.objectId },
                        update_json: { isagree: 2 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        console.log(us)
                        W.$ajax('mysql_api/update', {
                            json_p: { apply_id: _g.applyid },
                            update_json: { sp_status: 0, },
                            table: 'ga_spstatus'
                        }, function (u_s) {
                            console.log(u_s)
                            wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                                console.log(veh)
                                sendmessage(_g.applyid, data.user.username, sendname, '申请驳回', 1, function () {
                                    history.go(0)
                                })
                            });
                        })
                    })
                })
            })


            //车队还车
            $('#back_carlist').on('click', function () {
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { estatus: 'A', etm: etm },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '还车成功', 1, function () {
                                sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '还车成功', 3, function () {
                                    history.go(0)
                                })
                            })
                        });
                    })
                })

            })
            //用于我还车
            $('#back_car').on('click', function () {
                //update apply spstatus vehicle
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { estatus: 'A', etm: etm },
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 6 },
                        table: 'ga_spstatus'
                    }, function (us) {
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '还车成功', 1, function () {
                                history.go(0)
                            })
                        });
                    })
                })
            })
            $('#pcar_dd').on('click', function () {
                if (!driver) {
                    weui.alert('请选择司机');
                    return;
                }
                if (!car) {
                    weui.alert('车辆');
                    return;
                }
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: { driver: driver, car_num: car },
                    table: 'ga_apply'
                }, function (ga) {
                    wistorm_api._update('vehicle', { name: car }, { status: 1 }, W.getCookie('auth_code'), true, function (veh) {
                        sendmessage(_g.applyid, data.user.username, sendname, '车队已派车', 1, function () {
                            history.go(0)
                        })
                    })
                })
            })
            
            
            //通知车队还车
            $('#carlist_back').on('click', function () {
                weui.alert('已通知车队还车', function () {
                    sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '', 3, function () {
                        history.go(0)
                    })
                })
            })

        }

        function sendmessage(id, userid, name, ti, type, callback) {
            var titles = ti || '用车申请'
            var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
            if (type == 1) { //提交
                str += '&my=true'
            } else if (type == 2) { //审核
                str += '&auditing=true'
            } else if (type == 3) { //车队
                str += '&vehiclesend=true'
            }
            str += '&userid=' + userid
            var _desc = name + '的用车'
            var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
            $.ajax({
                url: 'http://h5.bibibaba.cn/send_qywx.php',
                data: _op_data,
                dataType: 'jsonp',
                crossDomain: true,
                success: function (re) {
                    callback()
                },
                error: function (err) {
                    // console.log(err)
                    callback()

                }
            })
        }

    }


    beta()

















    /****************************************************美丽的分隔符********************************************* */
    function test() {
        let _g = W.getSearch();
        var _user = JSON.parse(localStorage.getItem('user'));
        let car = '';
        let driver = '';
        function getJson(url, callback, option, type) {
            var types = type ? type : 'get';
            var option = Object.assign({}, option ? option : {})
            $.ajax({
                url: url,
                dataType: 'json',
                data: option,
                timeout: 10000,
                type: types,
                success: callback,
                error: function (err) { },
            })
        }

        getJson('/getapply_list?applyid=' + _g.applyid, getapply_spstatus)

        function getapply_spstatus(res) {
            console.log(res)
            // $('#container').hide();
            let username = res.apply[0].aname
            res.apply.forEach(ele => {
                $('#address').text(ele.address);
                $('#days').text(ele.days);
                $('#peer').text(ele.peer);
                $('#province').text(ele.province);
                $('#night').text(ele.night ? '是' : '否');
                $('#car_num').text(ele.car_num);
                $('#driver').text(ele.driver);
                if (ele.driver == 3) {
                    $('#use_car').show();
                    $('#car_driver').hide();
                    $('#cars').text('车队派车')
                }
                if (_user.user.id == ele.uid && _g.my) {
                    $('#name').text('我的用车');
                    $('#my_button').show();
                } else {
                    $('#name').text(ele.aname + '的用车');
                    $('#other_button').show();
                }
            });
            $('#container').show();
            let _spstatus = [];
            res.spstatus.forEach(ele => {
                if (ele.role == '科所队领导') {
                    _spstatus[0] = ele
                } else if (ele.role == '警务保障室领导') {
                    _spstatus[1] = ele
                } else if (ele.role == '局领导') {
                    _spstatus[2] = ele
                } else if (ele.role == '管理员') {
                    _spstatus[0] = ele
                }
            })
            res.spstatus = _spstatus;

            res.spstatus.forEach(ele => {
                let icon = !ele.isagree ? '<i class="weui-icon-circle f14 flow_agree_icon"></i>' : ele.isagree == 1 ? '<i class="weui-icon-success f14 flow_agree_icon"></i>' : '<i class="weui-icon-cancel f14 flow_agree_icon"></i>'
                let aud = !ele.isagree ? '·审批中' : ele.isagree == 1 ? '·已通过' : '·驳回'
                let tr_content = `
                <div class="weui-flex">
                <div class="weui-flex__item">
                    <div class="weui-cell weui-cell_access p_0 ">
                        <div class="flow_agree weui-media-box_text w_100">
                            `+ icon + `
                            <img src="./img/1.png" class="small_img">
                            <span class="f_w_7 ">`+ ele.name + aud + `</span>
                        </div>
                    </div>
                </div>
            </div>`
                $('#add').append(tr_content);
            })

            if (res.apply[0].etm) {
                $('#my_button').hide();
                $('#other_button').hide();
            }
            let _status = 0;
            res.apply.forEach((ele, index) => {
                let _href = './my_list?applyid=' + ele.id + '&my=' + true;
                _status = 0;
                if (res.spstatus.length == 1) {
                    if (res.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (res.apply[0].etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (res.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (!res.spstatus[0].isagree && res.apply[0].etm > 0) {
                        _status = 4;
                    }
                    let _res = res;
                    $('#urge').on('click', function () {
                        // str = 'http://jct.chease.cn' + '/my_list?applyid=' + res.apply[0].aid
                        // let url = 'http://h5.bibibaba.cn/send_qywx.php?touser=' + res.spstatus[0].userid
                        //     + '&toparty=&totag=&'
                        //     + 'title=用车申请&'
                        //     + 'desc=' + _user.user.name + '的用车&'
                        //     + 'url=' + str + '&remark=查看详情'
                        // // if (res.spstatus[0]) {
                        // W.ajax(url, {
                        //     dataType: 'json',
                        //     success: function (res) {
                        //         console.log(res)
                        //         weui.alert('已催办')
                        //     }
                        // })
                        sendmessage(res.apply[0].aid, res.spstatus[0].userid, username, null, '已催办')
                        // }
                    })

                    $('#agree').on('click', function () {
                        // let etm = 
                        let d_op = {
                            id: res.spstatus[0].sid,
                            isagree: 1,
                            applyid: _g.applyid,
                            sp_status: 5,
                        }
                        getJson('./agree_apply', function (res) {
                            // console.log(res)
                            sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批通过');
                            // history.go(0)

                        }, d_op)
                    })
                    $('#reject').on('click', function () {
                        let re_etm = ~~(new Date().getTime() / 1000);
                        let d_op = {
                            id: res.spstatus[0].sid,
                            isagree: 2,
                            applyid: _g.applyid,
                            sp_status: 4,
                            etm: re_etm
                        }
                        getJson('./agree_apply', function (res) {
                            console.log(res)
                            sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批驳回');
                            // history.go(0)
                        }, d_op)
                    })

                } else if (res.spstatus.length == 3) {
                    if (res.spstatus[0].isagree == 1 && res.spstatus[1].isagree == 1 && res.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (res.apply[0].etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (res.spstatus[0].isagree == 2 || res.spstatus[1].isagree == 2 || res.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!res.spstatus[0].isagree || !res.spstatus[1].isagree || !res.spstatus[2].isagree) && res.apply[0].etm > 0) {
                        _status = 4;
                    }
                    let _userid = null;
                    let _userid2 = null;
                    let _sid = null;
                    let d_op = {};
                    if (!res.spstatus[0].isagree) {
                        _userid = res.spstatus[0].userid;
                        _userid2 = res.spstatus[1].userid
                        _sid = res.spstatus[0].sid
                    } else if (!res.spstatus[1].isagree) {
                        _userid = res.spstatus[1].userid
                        _userid2 = res.spstatus[2].userid
                        _sid = res.spstatus[1].sid
                    } else if (!res.spstatus[2].isagree) {
                        _userid = res.spstatus[2].userid
                        _sid = res.spstatus[2].sid;
                        d_op.sp_status = 5
                    }
                    $('#urge').on('click', function () {
                        sendmessage(res.apply[0].aid, _userid, username, null, '已催办')
                    })


                    $('#agree').on('click', function () {
                        // let etm = 
                        d_op.id = _sid;
                        d_op.isagree = 1;
                        d_op.applyid = _g.applyid;
                        let _senid = res.apply[0].aid
                        getJson('./agree_apply', function (result) {
                            // console.log(res);
                            // history.go(0)
                            if (_user.user.role != '局领导') {
                                sendmessage(_senid, _userid2, username)
                            } else if (_user.user.role == '局领导') {
                                sendmessage(_senid, res.apply[0].userid, username, '审批通过')
                                // history.back();
                            }
                        }, d_op)
                    })
                    $('#reject').on('click', function () {
                        let _senid = res.apply[0].aid;
                        let re_etm = ~~(new Date().getTime() / 1000);

                        getJson('./agree_apply', function (result) {
                            // console.log(res);
                            sendmessage(_senid, res.apply[0].userid, username, '审批驳回')
                            // history.go(0)
                        }, { id: _sid, isagree: 2, applyid: res.apply[0].aid, etm: re_etm, sp_status: 4 })
                    })

                    if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导') {
                        if (_user.user.role == '科所队领导' && res.spstatus[0].isagree) {
                            $('#other_button').hide();
                        } else if (_user.user.role == '警务保障室领导' && res.spstatus[1].isagree) {
                            $('#other_button').hide();
                        } else if (_user.user.role == '局领导' && res.spstatus[2].isagree) {
                            $('#other_button').hide();
                        }
                    } else {
                    }

                }




                let use_status = '';
                let color_status = '';
                _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                let span_status = `<span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;" id="_spstatus">${use_status}</span>`
                $('#_spstatus_1').empty();
                $('#_spstatus_1').append(span_status);
                // $('#_spstatus').addClass(color_status)
            })



            if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导') {
                if (_status == 1 || _status == 3) {
                    $('#other_button').hide();
                }
                // if (_user.user.role == '科所队领导' && res.spstatus[0].isagree) {
                //     $('#other_button').hide();
                // } else if (_user.user.role == '警务保障室领导' && res.spstatus[1].isagree) {
                //     $('#other_button').hide();
                // } else if (_user.user.role == '局领导' && res.spstatus[2].isagree) {
                //     $('#other_button').hide();
                // }
            } else {
                if (_status == 0) {
                    $('#my_button').show();
                } else if (_status == 2) {
                    $('#my_button').hide();
                }
            }

            if (_status == 1) {
                $('#my_button').hide();
                $('#other_button').hide();
                if (res.apply[0].car_num) { //还车
                    $('#my_button').hide();
                    $('#other_button').hide();
                    if (res.cart[0].depart != '58' && _g.my) { //本单位和借车单位还车
                        $('#back_car').show();
                    } else if (_g.my) {
                        $('#carlist_back').show();
                    }
                    if (res.cart[0].depart == '58' && !_g.my) {
                        $('#back_carlist').show();
                    }

                } else { //车队派车
                    if (_user.user.role == '管理员') {
                        $('#pcar_driver').show();
                        $('#pcar_dd').show();
                        getJson('/getcar_driver', function (res) {
                            console.log(res)
                            $('#select_car').on('click', function () {
                                let data = [];
                                res.car.forEach((ele) => {
                                    let op = {};
                                    if (ele.id) {
                                        op.label = ele.cname + ele.driver
                                    } else {
                                        op.label = ele.cname;
                                    }
                                    op.value = ele.cid
                                    data.push(op)
                                })
                                weui.picker(data, {
                                    onChange: function (result) {
                                        // console.log(result);
                                    },
                                    onConfirm: function (result) {
                                        console.log(result)
                                        car = result[0].label;
                                        $('#carss').text(result[0].label)
                                    },
                                    id: 'select_car'
                                });
                            });

                            $('#select_driver').on('click', function () {
                                let data = [];
                                res.driver.forEach((ele) => {
                                    let op = {};
                                    if (ele.id) {
                                        op.label = ele.dname + ele.car_num
                                    } else {
                                        op.label = ele.dname;
                                    }
                                    op.value = ele.did
                                    data.push(op)
                                })
                                weui.picker(data, {
                                    onChange: function (result) {
                                        // console.log(result);
                                    },
                                    onConfirm: function (result) {
                                        console.log(result)
                                        driver = result[0].label;
                                        $('#driverss').text(result[0].label)
                                    },
                                    id: 'select_driver'
                                });
                            });
                        }, { depart: 58 })

                    }
                }
            }

            $('#pcar_dd').on('click', function () {
                if (!driver) {
                    weui.alert('请选择司机');
                    return;
                }
                if (!car) {
                    weui.alert('车辆');
                    return;
                }

                getJson('up_applypc', function (re) {
                    // console.log(res)
                    sendmessage(res.apply[0].aid, res.apply[0].userid, username, '车队已派车')
                }, { car: car, driver: driver, id: res.apply[0].aid })
            })


            let _res = res
            //撤销
            $('#backout').on('click', function () {
                let etm = ~~(new Date().getTime() / 1000)
                getJson('/up_apply', function (res) {
                    console.log(res)
                    // top.location
                    sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '撤销成功')

                }, { etm: etm, id: res.apply[0].aid, sp_status: 0 })
            })
            //车队还车
            $('#back_carlist').on('click', function () {
                let etm = ~~(new Date().getTime() / 1000)
                getJson('/up_apply', function (res) {
                    console.log(res)
                    sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '还车成功')
                    history.go(0)
                }, { etm: etm, id: res.apply[0].aid, sp_status: 6 })
            })
            //用于我还车
            $('#back_car').on('click', function () {
                let etm = ~~(new Date().getTime() / 1000)
                getJson('/up_apply', function (res) {
                    console.log(res)
                    // top.location
                    sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '还车成功')

                }, { etm: etm, id: res.apply[0].aid, sp_status: 6 })
            })

            $('#carlist_back').on('click', function () {
                sendmessage(_res.apply[0].aid, '034237', username, '请还车', '已通知车队还车');
            })
        }

        function sendmessage(id, userid, name, ti, alt) {
            var titles = ti || '用车申请'
            let str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
            if (alt) {
                str += '&my=true'
            }
            let _desc = name + '的用车'
            let _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
            $.ajax({
                url: 'http://h5.bibibaba.cn/send_qywx.php',
                data: _op_data,
                dataType: 'jsonp',
                crossDomain: true,
                success: function (re) {
                    if (alt) {
                        weui.alert(alt, function () {
                            history.go(0);
                        })
                    } else {
                        history.go(0);
                    }
                },
                error: function (err) {
                    // console.log(err)
                    if (alt) {
                        weui.alert(alt, function () {
                            history.go(0);
                        })
                    } else {
                        history.go(0);
                    }
                }
            })
        }
    }

})


