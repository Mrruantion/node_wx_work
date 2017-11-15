$(document).ready(function () {


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
    let userid = W.getCookie('userid');
    getJson('/get_user', MY_User, { userid: userid })
    function MY_User(res) {
        console.log(res, 'dfdfdf')
        localStorage.setItem('user', JSON.stringify(res))
    }

    // getJson('/get_left', get_car)
    // function get_car(res){
    //     console.log(res)
    // }
    // localStorage.setItem()


    weui.tab('#tab', {
        defaultIndex: 0,
        onChange: function (index) {
            console.log(index);
        }
    });

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
        defaultIndex: 0,
        onChange: function (index) {
            console.log(index);
        }
    });

    $('#use_car').on('click', function () {
        top.location = './apply'
    })

})