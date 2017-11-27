$(document).ready(function () {
    let _user = JSON.parse(localStorage.getItem('user'));
    var _val = $('input[name="order"]:checked').val();
    sessionStorage.setItem('clmx', JSON.stringify({}))
    let clmc_arr = [];
    let clmx_option = {};
    getAudit(_val)

    Array.prototype.uniques = function () {
        var res = [];
        var json = {};
        for (var i = 0; i < this.length; i++) {
            if (!json[this[i].XMMC]) {
                res.push(this[i].XMMC);
                json[this[i].XMMC] = 1;
            }
        }
        return res;
    }
    W.ajax('/fix_apply/code_king', {
        success: function (res) {
            console.log(res)
        }
    })
    W.ajax('/fix_apply/get_repairinfo', {
        success: function (res) {
            // console.log(res)
            // console.log(res.uniques())
            clmc_arr = res.uniques();

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



        // function unique(){

        // }


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
    $('#clmc').on('input', function () {
        console.log(this.value, 22);
        let show_clmc_list = [];
        let _this = this;
        show_clmc_list = clmc_arr.filter(ele => ele.includes(this.value));
        console.log(show_clmc_list);
        $('#clmc_list').empty();

        for (var i = 0; i < 5; i++) {
            if (show_clmc_list[i]) {
                let _id = `list${i}`
                let tr_content = `<div id="list${i}">${show_clmc_list[i]}</div>`;
                $('#clmc_list').append(tr_content);
                $(`#${_id}`).on('click', function () {
                    // console.log($(`#${_id}`).text())
                    let _text = $(`#${_id}`).text();
                    $('#clmc').val(_text);
                    show_clmc_list = [];
                    $('#clmc_list').hide()
                })
            }
        }
        if (this.value.length) {
            $('#clmc_list').show();
        } else {
            $('#clmc_list').hide();
        }
    })

    $('#clmx_save').on('click', function () {
        let is_details = location.hash;
        let details_index = parseInt(is_details.slice(-1));
        clmx_option.XMBH = $('#clbh').val();
        clmx_option.XMMC = $('#clmc').val();
        clmx_option.SL = $('#clsl').val();
        clmx_option.DJ = $('#cldj').val();
        clmx_option.JE = $('#clje').val();
        clmx_option.LB = $('input[name="lb"]:checked').val();
        if (!clmx_option.XMMC) {
            weui.alert('请填写材料名称')
            return false;
        }
        if (!clmx_option.SL) {
            weui.alert('请填写数量');
            return false;
        }
        if (!clmx_option.DJ) {
            weui.alert('请填写单价');
            return false;
        }
        // if(!clmx_option.JE){
        //     weui.alert('请填写金额')
        // }
        console.log(clmx_option, 'option')
        let clmx_arr = sessionStorage.getItem('clmx') ? JSON.parse(sessionStorage.getItem('clmx')) : {};
        !clmx_arr.clmx_arr ? clmx_arr.clmx_arr = [] : null;
        let _i;
        if(is_details.includes('details')){
            _i = details_index;
        }else {
            _i = clmx_arr.clmx_arr ? clmx_arr.clmx_arr.length : 0;
        }
        clmx_arr.clmx_arr[_i] = clmx_option;
        sessionStorage.setItem('clmx', JSON.stringify(clmx_arr));
        history.back();
        show_wxmx(clmx_arr)
    })

    function show_wxmx(data) {
        $('#show_clli').empty();
        data.clmx_arr.forEach((ele, index) => {
            let _lb;
            ele.LB == 1 ? _lb = '工时费' : _lb = '材料费'
            let tr_content = `<div class="weui-flex" style="line-height:2">
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">${_lb}</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">${ele.XMMC}</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">${ele.JE}</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">
                    <input type='button' value="详情" id=xq_${index} />
                    <input type='button' value="删除" id=delete_${index} />
                </div>
            </div>
        </div>`
            $('#show_clli').append(tr_content);
            $('#xq_' + index).on('click', function () {
                // console.log(index)
                $('#container').hide();
                $('#repair_info').show();
                var state = { 'page_id': 1, 'user_id': 5 };
                var title = '明细详情';
                var url = 'fix_apply#details_' + index;
                let _thisArr = data.clmx_arr[index];

                // $("#lb").find("input[name='lb']").removeAttr("checked");
                console.log($("#gsf"))
                $("#gsf")[0].checked = false;
                $('#clf')[0].checked = false;
                console.log($("#lb").find("input[name='lb']"))
                // console.log($("#lb").find("input[name='lb']"))
                if (_thisArr.LB == 1) {
                    // $("#gsf").attr("checked", 'checked');
                    $("#gsf")[0].checked = true;
                } else if (_thisArr.LB == 2) {
                    $('#clf')[0].checked = true;
                    // $("#clf").attr("checked", 'checked');
                }
                console.log($('input[name="lb"]:checked').val())
                $('#clbh').val(_thisArr.XMBH);
                $('#clmc').val(_thisArr.XMMC);
                $('#clsl').val(_thisArr.SL);
                $('#cldj').val(_thisArr.DJ);
                $('#clje').val(_thisArr.JE)
                history.pushState(state, title, url);
                window.addEventListener('popstate', function (e) {
                    // console.log(e);
                    $('#container').show();
                    $('#repair_info').hide();
                });



            })
            $('#delete_' + index).on('click', function () {
                // console.log(index);
                data.clmx_arr.splice(index, 1);
                sessionStorage.setItem('clmx', JSON.stringify(data));
                show_wxmx(data)
            })
        });
        if (data.clmx_arr.length) {
            $('#show_clli').prepend(`<div class="weui-flex" style="background:#cccccc47;line-height:2">
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">类别</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">材料名称</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">金额</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">操作</div>
            </div>
        </div>`);
            $('#show_clli').show();
        }


    }
    $('#clsl').on('input', function () {
        let _dj = $('#cldj').val();
        if (this.value && _dj) {
            let _je = this.value * _dj
            $('#clje').val(_je)
        } else {
            $('#clje').val('')
        }
    })
    $('#cldj').on('input', function () {
        let _sl = $('#clsl').val();
        if (this.value && _sl) {
            let _je = this.value * _sl
            $('#clje').val(_je)
        } else {
            $('#clje').val('')
        }
    })

    $('body').bind('click', function (event) {
        // IE支持 event.srcElement ， FF支持 event.target    
        var evt = event.srcElement ? event.srcElement : event.target;
        if (evt.id == 'clmc_list') return; // 如果是元素本身，则返回
        else {
            $('#clmc_list').hide(); // 如不是则隐藏元素
        }
    });
})