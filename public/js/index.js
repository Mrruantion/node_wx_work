// import { create } from "domain";

$(document).ready(function () {
    var _tab = 0;
    var _tab1 = 0;

    _tab = sessionStorage.getItem('tab') || 0;
    _tab1 = sessionStorage.getItem('tab1') || 0;



    var _user = null;
    function getJson(url, callback, option, type) {
        var types = type ? type : 'get';
        var option = Object.assign({}, option ? option : {})
        $.ajax({
            url: url,
            dataType: 'json',
            data: option,
            timeout: 100000,
            type: types,
            success: callback,
            error: function (err) { },
        })
    }
    let userid = W.getCookie('userid');
    getJson('/get_user', MY_User, { userid: userid })
    function MY_User(res) {
        console.log(res, 'dfdfdf')
        localStorage.setItem('user', JSON.stringify(res));
        _user = res;
        if (_tab == 2) {
            getMyList()
        } else if (_tab == 1) {
            getauditlist()
        }
    }

    // getJson('/get_left', get_car)
    // function get_car(res){
    //     console.log(res)
    // }
    // localStorage.setItem()


    weui.tab('#tab', {
        defaultIndex: _tab,
        onChange: function (index) {
            sessionStorage.setItem('tab', index);
            console.log(index, 1);
            _tab = index;
            if (index == 2) {
                getMyList()
            } else if (index == 1) {
                getauditlist()
            }
        }
    });
    //提交列表
    function getMyList() {
        getJson('/get_applys', own_List, { uid: _user.user.id })
    }
    //列出提交列表
    function own_List(res) {
        console.log(res)
        res.forEach((ele, index) => {
            let _href = './my_list?applyid=' + ele.id + '&my=' + true;
            let _status = 0;
            console.log(index)
            if (ele.spstatus.length == 1) {
                if (ele.spstatus[0].isagree == 1) {
                    _status = 1;
                    if (ele.etm) {
                        _status = 2;
                    }
                } else {
                    _status = 0;
                }
                if (ele.spstatus[0].isagree == 2) {
                    _status = 3;
                }
                if (!ele.spstatus[0].isagree && ele.etm > 0) {
                    _status = 4;
                }
            } else if (ele.spstatus.length == 3) {

                if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                    _status = 1;
                    if (ele.etm) {
                        _status = 2;
                    }
                } else {
                    _status = 0;
                }

                if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                    _status = 3;
                }
                if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                    _status = 4;
                }
            }
            let use_status = '';
            _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
            let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
            let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="` + _href + `">
            <div class="f14 w_100">
                <div class="weui-media-box weui-media-box_text">
                    <div class="weui-flex">
                        <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                            <span style="vertical-align: middle">用车</span>
                            <span class="weui-badge great auditing chang_f12" style="margin-left: 5px;">`+ use_status + `</span>
                        </h4>
                        <div class="weui-flex__item t_a_r">`+ date + `</div>
                    </div>

                    <div class="weui-flex ">
                        <div class="weui-flex__item">
                            <div class="weui-cell p_0">
                                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                    <p class="c_9">事由</p>
                                </div>
                                <div class="weui-cell__bd">
                                    <p>`+ ele.days + `</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>`
            $('#own_list').append(str_content);
        })
    }

    //获取审核列表
    function getauditlist() {
        getJson('/audit_list', audit_list, { uid: _user.user.id })
    }
    //筛选审核列表
    function audit_list(res) {
        // console.log(res)
        let audited = [];
        let auditing = [];
        res.forEach((ele, index) => {
            if (ele.isagree) {
                audited.push(ele)
            } else {
                auditing.push(ele)
            }
        })
        if (_tab1 == 1) {
            showAudit(audited, 1)
        } else {
            showAudit(auditing, 2)
        }

    }


    function showAudit(data, type) {
        console.log(data, type)
        _show_audit_list(data, type)
        // own_List(data)
    }

    function _show_audit_list(res, type) {
        console.log(res)
        type == 1 ? $('#_audited').empty() : $('#_auditing').empty();
        let name = '';
        let level_show = false;
        res.forEach((ele, index) => {
            if (ele.id) {
                let _href = './my_list?applyid=' + ele.id;
                name = ele.name + '的用车'
                let _status = 0;
                // console.log(index)
                if (ele.spstatus.length == 1) {
                    if (ele.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (ele.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (ele.spstatus[0].isagree && ele.etm > 0) {
                        _status = 4;
                    }
                } else if (ele.spstatus.length == 3) {
                    // if (ele.spstatus[0].isagree || ele.spstatus[1].isagree || ele.spstatus[2].isagree && ele.etm > 0) {
                    //     _status = 4;
                    // }
                    if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }

                    if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                        _status = 4;
                    }
                    if (_user.user.role == ' 科所队领导') {
                        level_show = true;
                    } else if (_user.user.role == '警务保障室领导') {
                        if (ele.spstatus[0].isagree == 1) {
                            level_show = true
                        }
                    } else if (_user.user.role == '局领导') {
                        if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                            level_show = true
                        }
                    }
                }
                let use_status = '';
                _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                if (_user.user.role == '管理员') {
                    level_show = true;
                }
                let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                if (level_show) {
                    let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="` + _href + `">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                    <span style="vertical-align: middle">`+ name + `</span>
                                    <span class="weui-badge great auditing chang_f12" style="margin-left: 5px;">`+ use_status + `</span>
                                </h4>
                                <div class="weui-flex__item t_a_r">`+ date + `</div>
                            </div>
        
                            <div class="weui-flex ">
                                <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">事由</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>`+ ele.days + `</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>`
                    // $('#own_list').append(str_content);
                    type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                }

            }

        })
    }



    weui.searchBar('#my_list #searchBar');
    weui.searchBar('#audit_list #searchBar1');

    //tab切换
    function tab(selector) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var $eles = $(selector);
        console.log($eles);
        console.log((0, $)(selector))

        var $eles = $(selector);
        options = $.extend({
            defaultIndex: 0,
            onChange: $.noop
        }, options);
        console.log(options)
        $eles.forEach(function (ele) {
            var $tab = $(ele);
            console.log($tab)
            var $tabItems = $tab.find('.weui-navbar__item1, .weui-tabbar__item1');
            console.log($tabItems)
            var $tabContents = $tab.find('.weui-tab__content1');
            console.log($tabContents)

            $tabItems.eq(options.defaultIndex).addClass('weui-bar__item_on');
            $tabContents.eq(options.defaultIndex).show();

            $tabItems.on('click', function () {
                var $this = $(this),
                    index = $this.index();

                $tabItems.removeClass('weui-bar__item_on');
                $this.addClass('weui-bar__item_on');

                $tabContents.hide();
                $tabContents.eq(index).show();

                options.onChange.call(this, index);
            });
        });
    }
    tab('#tab1', {
        defaultIndex: _tab1,
        onChange: function (index) {
            sessionStorage.setItem('tab1', index);
            _tab1 = index;
            getauditlist();
        }
    });

    $('#use_car').on('click', function () {
        top.location = './apply'
    })

})