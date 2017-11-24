$(document).ready(function () {
    let _user = JSON.parse(localStorage.getItem('user'));
    var _val = $('input[name="order"]:checked').val();

    getAudit(_val)

    W.ajax('/fix_apply/code_king', {
        success: function (res) {
            console.log(res)
        }
    })
    W.ajax('/fix_apply/get_repairinfo', {
        success: function (res) {
            console.log(res)
        }
    })
    // console.log(_user)


    //进厂日期
    $('#jcrq').on('click', function () {
        let _year = new Date().getFullYear();
        let _mon = new Date().getMonth() + 1;
        let _day = new Date().getDate();
        let end_year = _year + 20;
        console.log(_mon)
        weui.datePicker({
            start: _year,
            end: end_year,
            defaultValue: [_year, _mon, _day],
            onChange: function (res) {
                console.log(res);
            },
            onConfirm: function (res) {
                // console.log(res);
                let dateString = res[0].value + '-' + res[1].value + '-' + res[2].value;
                console.log(dateString)
                $('#jcrq .weui-cell__ft').text(dateString);
                $('#jcrq .weui-cell__ft').css({ color: '#000' })
            },
            id: 'jcrq'
        })
    })
    //出厂日期
    $('#ccrq').on('click', function () {
        let _year = new Date().getFullYear();
        let _mon = new Date().getMonth() + 1;
        let _day = new Date().getDate();
        let end_year = _year + 20;
        console.log(_mon)
        weui.datePicker({
            start: _year,
            end: end_year,
            defaultValue: [_year, _mon, _day],
            onChange: function (res) {
                console.log(res);
            },
            onConfirm: function (res) {
                // console.log(res);
                let dateString = res[0].value + '-' + res[1].value + '-' + res[2].value;
                console.log(dateString)
                $('#ccrq .weui-cell__ft').text(dateString);
                $('#ccrq .weui-cell__ft').css({ color: '#000' })
            },
            id: 'ccrq'
        })
    })



    $('#audit_user').on('click', function () {
        $('#container').hide();
        $('#audit_list').show();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '选择审核人';
        var url = 'fix_apply#auditer';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#audit_list').hide();
        });
    })

    $('#add_repairInfo').on('click', function () {
        $('#container').hide();
        $('#repair_info').show();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '添加明细';
        var url = 'fix_apply#add_repair';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#repair_info').hide();
        });

    })



    //获取号牌号码
    W.ajax('/fix_apply/hphm', {
        data: { depart: 34 },
        success: function (res) {
            // console.log(res)
            console.log(res)
            let op_arr = [];
            res.forEach((ele, index) => {
                let wx_op = {
                    label: ele.name,
                    value: ele.id
                };
                op_arr.push(wx_op)

            });
            $('#hphm').on('click', function () {
                weui.picker(op_arr, {
                    onChange: function (result) {
                        console.log(result);
                    },
                    onConfirm: function (result) {
                        let text = result[0].label;
                        $('#hphm .weui-cell__ft').text(text);
                        $('#hphm .weui-cell__ft').css({ color: '#000' })
                    },
                    id: 'hphm'
                });
            });
        }
    })
    //获取维修单位
    W.ajax('/fix_apply/wxdw', {
        success: function (res) {
            console.log(res)
            let op_arr = [];
            res.forEach((ele, index) => {
                let wx_op = {
                    label: ele.MC,
                    value: ele.XLH
                };
                op_arr.push(wx_op)

            });
            $('#wxdw').on('click', function () {
                weui.picker(op_arr, {
                    onChange: function (result) {
                        console.log(result);
                    },
                    onConfirm: function (result) {
                        let text = result[0].label;
                        $('#wxdw .weui-cell__ft').text(text);
                        $('#wxdw .weui-cell__ft').css({ color: '#000' })
                    },
                    id: 'wxdw'
                });
            });
        }
    });


    $('input[name="price"]').on('click', function (e) {
        // form_option.night = e.target.value;
        console.log(e.target.value)
        let value = e.target.value;
        getAudit(value)
        // console.log(form_option);
    });

    //获取审核人
    function getAudit(v) {
        let op = {};
        op.depart = _user.depart.id;
        if (v == 1) {
            op.jwdepart = 10;
        } else if (v == 2) {
            op.jwdepart = 10;
            op.judepart = 1;
        }
        W.ajax('/getaudit', {
            data: op,
            success: function (res) {
                showaudit(res)
            }
        })



        function show_auditer(data) {
            $('#add_auditer').empty();
            data.forEach((ele, index) => {
                if (ele) {
                    let str = 'show_i' + index
                    let tr_content = `<div class="weui-cell__hd weui-flex" style="position: relative;" >
                        <img src="./img/1.png" class="" style="height:50px;width: 50px;display: block">
                        <span class="" style="position: absolute;top:-12px;right: 17px;" id="` + str + `">
                        <i class="weui-icon-cancel icon-delete"></i>
                        </span>
                        <span class="l_h_40 elli">...</span>
                        <span class="addr_book">` + ele.name + `</span>
                        </div>`
                    $('#add_auditer').append(tr_content);
                    let ff = '#' + str
                    $(ff).on('click', function (res) {
                        // select_auditer(ele)
                        // console.log(index)
                        apend_data[index] = null;
                        show_auditer(apend_data);
                    })
                }

            })
        }
        let apend_data = [];
        function showaudit(res) {
            console.log(res, 'res')
            let auditer = res.filter(ele => { return ele.role == '科所队领导' || ele.role == '局领导' || ele.role == '警务保障室领导' })
            console.log(auditer)
            let k_l = res.filter(ele => { return ele.role == '科所队领导' })
            let j_l = res.filter(ele => { return ele.role == '警务保障室领导' });
            let ju_l = res.filter(ele => { return ele.role == '局领导' });
            apend_data = [k_l[0], j_l[0], ju_l[0]];
            // $('#add_auditer').empty();
            show_auditer(apend_data)

            $('#audit_list').empty();
            if (ju_l.length) {
                ju_l.forEach((ele, index) => {
                    let str = 'ju_l' + index
                    let tr_content = `<div class="weui-cell weui-cell_access" id="` + str + `">
                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                        <img src="./img/1.png" style="width: 50px;display: block">
                    </div>
                    <div class="weui-cell__bd">
                        <p>`+ ele.name + `</p>
                        <p style="font-size: 13px;color: #888888;">`+ ele.role + `</p>
                    </div>
                </div>`
                    $('#audit_list').append(tr_content);
                    let ff = '#' + str
                    $(ff).on('click', function (res) {
                        select_auditer(ele)
                    })
                })
            }
            if (j_l.length) {
                j_l.forEach((ele, index) => {
                    let str = 'j_l' + index
                    let tr_content = `<div class="weui-cell weui-cell_access" id="` + str + `">
                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                            <img src="./img/1.png" style="width: 50px;display: block">
                        </div>
                        <div class="weui-cell__bd">
                            <p>`+ ele.name + `</p>
                            <p style="font-size: 13px;color: #888888;">`+ ele.role + `</p>
                        </div>
                    </div>`
                    $('#audit_list').append(tr_content);
                    let ff = '#' + str
                    $(ff).on('click', function (res) {
                        select_auditer(ele)
                    })
                })
            }
            if (k_l.length) {
                k_l.forEach((ele, index) => {
                    let str = 'k_l' + index
                    let tr_content = `<div class="weui-cell weui-cell_access" id="` + str + `">
                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                        <img src="./img/1.png" style="width: 50px;display: block">
                    </div>
                    <div class="weui-cell__bd">
                        <p>`+ ele.name + `</p>
                        <p style="font-size: 13px;color: #888888;">`+ ele.role + `</p>
                    </div>
                </div>`

                    $('#audit_list').append(tr_content);
                    let ff = '#' + str
                    $(ff).on('click', function (res) {
                        // console.log(ele, index, 'ddd')
                        select_auditer(ele)
                    })
                })

            }
        }

        function select_auditer(data) {
            if (data.role == '局领导') {
                apend_data[2] = data
            } else if (data.role == '警务保障室领导') {
                apend_data[1] = data
            } else {
                apend_data[0] = data;
            }
            history.back();
            show_auditer(apend_data);
        }



        // if (_user.user) {
        //     if (_user.user.role == "科所队领导") {
        //         getJson('/getaudit', showaudit, op);
        //     } else if (_user.user.role == '局领导') {

        //     } else {
        //         if (form_option.night == 1 || is_kq) {
        //             op.jwdepart = 10;
        //             op.judepart = 1;
        //         }
        //         W.ajax('/getaudit', {
        //             data: op,
        //             success: function (res) {
        //                 console.log(res)
        //             }
        //         });
        //     }
        // }
    }


})