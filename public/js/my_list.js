$(document).ready(function () {
    // console.log(W.getSearch())
    let _g = W.getSearch();
    var _user = JSON.parse(localStorage.getItem('user'));

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
            if (_user.user.id == ele.uid && _g.my) {
                $('#name').text('我的用车');
                $('#my_button').show();
            } else {
                $('#name').text(ele.name + '的用车');
                $('#other_button').show();
            }
        });
        $('#container').show();

        res.spstatus.forEach(ele => {
            let icon = !ele.isagree ? '<i class="weui-icon-circle f14 flow_agree_icon"></i>' : ele.isagree == 1 ? '<i class="weui-icon-success f14 flow_agree_icon"></i>' : '<i class="weui-icon-cancel f14 flow_agree_icon"></i>'
            let aud = !ele.isagree ? '·审批中' : ele.isagree == 1 ? '·已通过' : '·驳回'
            let tr_content = `
            <div class="weui-flex">
            <div class="weui-flex__item">
                <div class="weui-cell weui-cell_access p_0 ">
                    <div class="flow_agree weui-media-box_text w_100">
                        `+ icon + `
                        <img src="./img/emoji-1.png" class="small_img">
                        <span class="f_w_7 ">`+ ele.name + aud + `</span>
                    </div>
                </div>
            </div>
        </div>`
            $('#auditer').append(tr_content);
        })
    }
})