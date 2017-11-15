$(document).ready(function () {

    var all_depart;
    var form_option = {};
    var _user = JSON.parse(localStorage.getItem('user'));
    var is_kq = null;
    var _val = $('input[name="order"]:checked').val();

    console.log(_user)
    if (_user.user) {
        form_option.uid = _user.user.id
        if (_user.user.role == "科所队领导") {
            get_carData(_user.depart.id, 1)
            $('#borrow').parent().hide();
            $('#night').hide();
            $('#auditer').show();
            $('#car_driver').show();
        } else if (_user.user.role == '局领导') {
            $('#borrow').parent().hide();
            $('#night').hide();
            $('#auditer').hide();
        } else {
            $('#borrow').parent().show();
            $('#night').show();
            $('#auditer').show();
        }
    }





    form_option.night = _val;
    _user.depart ? form_option.depart = _user.depart.id : null;

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

    getJson('./get_depart', all_depart)
    getJson('./address', address)
    var car_data = [];
    function get_carData(depart, is_kl) {
        getJson('./get_car', get_car, { depart: depart })
        function get_car(res) {
            console.log(res, 'car')
            car_data = [];
            res.forEach((ele, index) => {
                var op = {};
                ele.name ? op.label = ele.cname + '(' + ele.name + ele.mobile + ')' : op.label = ele.cname;
                op.value = ele.cid;
                car_data.push(op)
            })
            is_kl ? car_data.length ? weui.alert('本部门没有车,由车队派车') : null : null;
        }
    }

    $('#select_car').on('click', function () {
        car_data.length ?
            weui.picker(car_data, {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    // console.log(result);
                    form_option.car_num = result[0].label;
                    $('#select_car .weui-cell__ft').text(result[0].label);
                    $('#select_car .weui-cell__ft').css({ color: '#000' });
                },
                id: 'select_car'
            })
            :
            weui.alert('没有车辆选择')
            ;
    });

    // 本部门
    function all_depart(res) {
        // console.log(res)
        all_depart = res;
        var depart_data = [];
        res.forEach((ele, index) => {
            var op = {};
            op.label = ele.name;
            op.value = ele.id;
            depart_data.push(op);
        });
    }


    $('#borrow').on('click', function () {
        weui.picker([
            {
                label: '本单位车辆',
                value: '1'
            }, {
                label: '向其他单位借车',
                value: '2'
            }, {
                label: '向车队申请派车',
                value: '3'
            }
        ], {
                defaultValue: ['1'],
                onChange: function (result) {
                    // console.log(result);
                },
                onConfirm: function (result) {
                    // console.log(result);
                    // form_option.borrow = result[0];
                    var _v = result[0].value;
                    delete_depart();
                    delete_car();
                    if (_v == 3) {
                        $('#car_driver').hide();
                        $('#borrow_depart1').hide()
                    } else {
                        _v == 1 ? $('#car_driver').show() : $('#car_driver').hide();
                        _v == 2 ? $('#borrow_depart1').show() : $('#borrow_depart1').hide();
                        _v == 1 ? get_carData(_user.depart.id) : null;

                    }
                    $('#borrow .weui-cell__ft').text(result[0].label);
                    $('#borrow .weui-cell__ft').css({ color: '#000' });
                    _v == 2 ? b_depart() : null;
                },
                id: 'borrow'
            });
    });


    function delete_car() {
        delete form_option.car_num;
        $('#select_car .weui-cell__ft').text('请选择');
        $('#select_car .weui-cell__ft').css({ color: '#ccc' });
    }

    function delete_depart() {
        // delete form_option.car_num
        $('#borrow_depart .weui-cell__ft').text('请选择');
        $('#borrow_depart .weui-cell__ft').css({ color: '#ccc' });
    }


    //借车单位
    function b_depart() {
        $('#borrow_depart').on('click', function () {
            let depart_data = [];
            let _index = null;
            all_depart.forEach((ele, index) => {
                var op = {};
                if (ele.id != 1 && ele.id != form_option.depart) {
                    op.label = ele.name;
                    op.value = ele.id;
                    depart_data.push(op)
                }
            })
            _index = depart_data[0].value
            weui.picker(depart_data, {
                defaultValue: [_index],
                onChange: function (result) {

                },
                onConfirm: function (result) {
                    form_option.depart = result[0].value;
                    delete_car();
                    get_carData(result[0].value);
                    $('#car_driver').show()
                    $('#borrow_depart .weui-cell__ft').text(result[0].label);
                    $('#borrow_depart .weui-cell__ft').css({ color: '#000' });
                    console.log(result, form_option)
                },
                id: 'borrow_depart'
            });
        });
    }

    //地址
    function address(res) {
        console.log(res, 'res')
        let addr_data = [];
        let provi = [];
        let city = [];
        let addr = [];

        res.forEach((ele, index) => {
            let op = {}
            if (ele.level == 1) {
                op.label = ele.areaName;
                op.value = ele.id;
                provi.push(op);
                addr_data.push(op);
            } else if (ele.level == 2) {
                op.label = ele.areaName;
                op.value = ele.id;
                op.p = ele.parentId
                city.push(op);
            } else {
                op.label = ele.areaName;
                op.value = ele.id;
                op.p = ele.parentId;
                addr.push(op);
            }
        })

        city.forEach((ele, index) => {
            ele.children = [];
            addr.forEach((e, i) => {
                if (ele.value == e.p) {
                    delete e.p;
                    ele.children.push(e);
                }

            })
        })
        provi.forEach((ele, index) => {
            ele.children = [];
            city.forEach((e, i) => {
                if (ele.value == e.p) {
                    delete e.p;
                    ele.children.push(e);
                }
            })
        })
        console.log(provi, city, addr)
        // console.log(addr_data,'addr')
        $('#address').on('click', function () {
            weui.picker(provi, {
                depth: 3,
                defaultValue: [11, 177, 2164],
                onChange: function onChange(result) {
                    console.log(result);
                },
                onConfirm: function onConfirm(result) {
                    // console.log(result);
                    result[1].label == '温州市' ? is_kq = false : is_kq = true;
                    var text = result.reduce(function (pre, current) {
                        return pre.label ? pre.label + current.label : pre + current.label
                    })
                    form_option.province = text;
                    // console.log(text)
                    $('#address .weui-cell__ft').text(text);
                    $('#address .weui-cell__ft').css({ color: '#000' });
                    console.log(is_kq)

                },
                id: 'address'
            });
        });

    }

    function getAuditer() {


    }


    // localStorage.setItem('user', JSON.stringify({ df: 1 }))
    $('#audit_user').on('click', function () {
        $('#container').hide();
        $('#audit_list').show();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '选择审核人';
        var url = 'book';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#audit_list').hide();
        });
    })




    var $submit_success = $('#submit_success');
    $('#toastBtn').on('click', function () {
        if ($submit_success.css('display') != 'none') return;
        $submit_success.fadeIn(100);
        setTimeout(function () {
            $submit_success.fadeOut(100);
        }, 3000);
    });
    // var $submit_unsuccess = $('#submit_unsuccess');
    // $('#toastBtn').on('click', function () {
    //     if ($submit_unsuccess.css('display') != 'none') return;
    //     $submit_unsuccess.fadeIn(100);
    //     setTimeout(function () {
    //         $submit_unsuccess.fadeOut(100);
    //     }, 3000);
    // });
    // console.log(1)



    var use_reason = ['执法办案', '社会面管理', '重大勤务', '督察检查', '指挥通信', '现场勘查', '押解', '勤务保障', '其他执法执勤']
    var op_arr = [];
    for (var i = 0; i < use_reason.length; i++) {
        var op_i = {};
        op_i.label = use_reason[i];
        op_i.value = i + 1;
        op_arr.push(op_i);
    }
    console.log(op_arr)
    $('#reason').on('click', function () {
        weui.picker(op_arr, {
            defaultValue: ['1'],
            onChange: function (result) {
                console.log(result);
            },
            onConfirm: function (result) {
                // console.log(result);
                form_option.days = result[0].label;
                var text = result[0].label;
                $('#reason .weui-cell__ft').text(text);
                $('#reason .weui-cell__ft').css({ color: '#000' })
            },
            id: 'reason'
        });
    });

    $('#user').on('change', function (e) {
        // console.log(e.target.value)
        form_option.name = e.target.value;
    })
    $('#peer').on('change', function (e) {
        form_option.peer = e.target.value;
    })
    $('#driver').on('change', function (e) {
        form_option.driver = e.target.value;
    })
    $('#deta_addr').on('change', function (e) {
        form_option.address = e.target.value;
    })

    // console.log(_val)
    $('input[name="order"]').on('click', function (e) {
        form_option.night = e.target.value;
        console.log(form_option);
    });



    function getAudit() {
        let op = {};
        op.depart = _user.depart.id;
        if (_user.user) {
            if (_user.user.role == "科所队领导") {
                getJson('/getaudit', showaudit, op);
            } else if (_user.user.role == '局领导') {

            } else {
                if (form_option.night || is_kq) {
                    op.jwdepart = 10;
                    op.judepart = 1;
                }
                getJson('/getaudit', showaudit, op);
            }
        }
    }
    getAudit()
    function showaudit(res){
        // console.log(res,'res')
        


    }


});