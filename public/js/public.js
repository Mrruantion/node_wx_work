function W(select, needAll) {
    if (needAll)
        return document.querySelectorAll(select);
    else
        return document.querySelector(select);
}


W.setCookie = function(c_name, value, expiredays, path) {
    var exdate = new Date();
    expiredays = expiredays || 1; //默认为1天
    if (expiredays > 1)
        exdate.setDate(exdate.getDate() + expiredays);
    else if (expiredays > 0)
        exdate.setHours(exdate.getHours() + expiredays * 24);
    else
        exdate.setMinutes(exdate.getMinutes() - expiredays);
    var domain = "";
    if (path) {
        domain = "; path=" + path + ";";
    } else {
        domain = "; path=/; domain=" + document.domain;
    }
    var tem = c_name + "=" + encodeURIComponent(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + domain;
    document.cookie = tem;
}

/**
 * 获取cookie
 * @param {String} c_name
 */
W.getCookie = function(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return decodeURIComponent(document.cookie.substring(c_start, c_end));
        }
    }
}

W.getSearch = function(){
    var url = location.search;
    if (!url) return {};
    url = url.split("?")[1].split("&");
    var json = {};
    var n = url.length;
    for (var i = 0; i < n; i++) {
        json[url[i].split("=")[0]] = decodeURIComponent(url[i].split("=")[1]);
    }
    return json;
};