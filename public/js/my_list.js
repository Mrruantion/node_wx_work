$(document).ready(function () {
    // console.log(W.getSearch())
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
                $('#name').text(ele.name + '的用车');
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
            $('#auditer').append(tr_content);
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
                    str = 'http://jct.chease.cn' + '/my_list?applyid=' + res.apply[0].aid
                    let url = 'http://h5.bibibaba.cn/send_qywx.php?touser=' + res.spstatus[0].userid
                        + '&toparty=&totag=&'
                        + 'title=用车申请&'
                        + 'desc=' + _user.user.name + '的用车&'
                        + 'url=' + str + '&remark=查看详情'
                    // if (res.spstatus[0]) {
                    W.ajax(url, {
                        dataType: 'json',
                        success: function (res) {
                            // console.log(res)
                            weui.alert('已催办')
                        }
                    })
                    // }
                })

                $('#agree').on('click', function () {
                    // let etm = 
                    getJson('./agree_apply', function (res) {
                        // console.log(res)
                        sendmessage(_res.apply[0].aid, _res.apply[0].userid, '审批通过');
                        history.go(0)

                    }, { id: res.spstatus[0].sid, isagree: 1 })
                })
                $('#reject').on('click', function () {
                    getJson('./agree_apply', function (res) {
                        console.log(res)
                        sendmessage(_res.apply[0].aid, _res.apply[0].userid, '审批驳回');
                        history.go(0)
                    }, { id: res.spstatus[0].sid, isagree: 1 })
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
                let _sid = null;
                if (!res.spstatus[0].isagree) {
                    _userid = res.spstatus[0].userid;
                    _sid = res.spstatus[0].sid
                } else if (!res.spstatus[1].isagree) {
                    _userid = res.spstatus[1].userid
                    _sid = res.spstatus[1].sid
                } else if (!res.spstatus[2].isagree) {
                    _userid = res.spstatus[2].userid
                    _sid = res.spstatus[2].sid
                }

                $('#urge').on('click', function () {
                    str = 'http://jct.chease.cn' + '/my_list?applyid=' + res.apply[0].aid
                    let url = 'http://h5.bibibaba.cn/send_qywx.php?touser=' + _userid
                        + '&toparty=&totag=&'
                        + 'title=用车申请&'
                        + 'desc=' + _user.user.name + '的用车&'
                        + 'url=' + str + '&remark=查看详情'
                    // if (res.spstatus[0]) {
                    W.ajax(url, {
                        dataType: 'json',
                        success: function (res) {
                            // console.log(res)
                            weui.alert('已催办')
                        }
                    })
                    // }
                })

                $('#agree').on('click', function () {
                    // let etm = 
                    let _senid = res.apply[0].aid
                    getJson('./agree_apply', function (res) {
                        // console.log(res);
                        history.go(0)
                        if (_user.user.role != '局领导') {
                            sendmessage(_senid, _userid)
                        } else if (_user.user.role == '局领导') {
                            sendmessage(_senid, res.apply[0].userid, '审批通过')
                            // history.back();
                        }


                    }, { id: _sid, isagree: 1 })
                })
                $('#reject').on('click', function () {
                    let _senid = res.apply[0].aid
                    getJson('./agree_apply', function (res) {
                        // console.log(res);
                        sendmessage(_senid, res.apply[0].userid, '审批驳回')
                        history.go(0)
                    }, { id: _sid, isagree: 1 })
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
            _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
            $('#_spstatus').text(use_status);

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
                if (res.cart[0].depart == '58'&&!_g.my) {
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
                sendmessage(res.apply[0].aid, res.apply[0].userid, '车队已派车')
            }, { car: car, driver: driver, id: res.apply[0].aid })
        })


        let _res = res
        $('#backout').on('click', function () {
            let etm = ~~(new Date().getTime() / 1000)
            getJson('/up_apply', function (res) {
                console.log(res)
                // top.location
                sendmessage(_res.apply[0].aid, _res.apply[0].userid, '还车成功')
                history.go(0)
            }, { etm: etm, id: res.apply[0].aid })
        })

        $('#back_carlist').on('click', function () {
            let etm = ~~(new Date().getTime() / 1000)
            getJson('/up_apply', function (res) {
                console.log(res)
                // top.location
                sendmessage(_res.apply[0].aid, _res.apply[0].userid, '还车成功')
                history.go(0)
            }, { etm: etm, id: res.apply[0].aid })
        })

        $('#back_car').on('click', function () {
            let etm = ~~(new Date().getTime() / 1000)
            getJson('/up_apply', function (res) {
                console.log(res)
                // top.location
                sendmessage(_res.apply[0].aid, _res.apply[0].userid, '还车成功')
                history.go(0)
            }, { etm: etm, id: res.apply[0].aid })
        })
        $('#carlist_back').on('click', function () {
            // let etm = 
            // getJson('./agree_apply', function () {
            sendmessage(_res.apply[0].aid, '034237', '请还车');
            weui.alert('已通知车队还车')

            // }, { id: res.spstatus[0].sid, isagree: 1 })
        })
        // $('#reject ').on('click', function () {

        // }, { id: res.spstatus[0].sid, isagree: 2 })



    }

    function sendmessage(id, userid, ti) {
        var titles = ti || '用车申请'
        str = 'http://jct.chease.cn' + '/my_list?applyid=' + id
        let url = 'http://h5.bibibaba.cn/send_qywx.php?touser=' + userid
            + '&toparty=&totag=&'
            + 'title=' + titles + '&'
            + 'desc=' + _user.user.name + '的用车&'
            + 'url=' + str + '&remark=查看详情'
        // if (res.spstatus[0]) {
        W.ajax(url, {
            dataType: 'json',
            success: function (res) {
                console.log(res)
                // weui.alert('已催办')
                // history.back()
            }
        })
        // }
    }
})


