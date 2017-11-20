function W(select, needAll) {
    if (needAll)
        return document.querySelectorAll(select);
    else
        return document.querySelector(select);
}


W.setCookie = function (c_name, value, expiredays, path) {
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
W.getCookie = function (c_name) {
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

W.getSearch = function () {
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

W.dateToString = function (d) {
    var j = {};
    j.m = d.getMonth() + 1;
    j.d = d.getDate();
    j.h = d.getHours();
    j.mi = d.getMinutes();
    j.s = d.getSeconds();
    for (items in j) {
        if (j[items] < 10)
            j[items] = "0" + j[items];
    }
    return d.getFullYear() + "-" + j.m + "-" + j.d + " " + j.h + ":" + j.mi + ":" + j.s;
}

W.ajax = function (url, options) {
    var json = {
        dataType: "json",
        timeout: 10000,
        type: "GET",
        success: W.noop,
        error: W.noop
    }
    var headers = {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded"
    };
    json.url = url;
    Object.assign(json, options);
    options.headers ? Object.assign(headers, options.headers) : null;

    json.type = json.type.toUpperCase();
    var data = "";
    if (json.data) {
        for (items in json.data) {
            data += "&" + items + "=" + json.data[items];
        }
        if (json.type == "GET") {
            if (json.url.indexOf('?') == -1)
                json.url += "?" + data.slice(1);
            else
                json.url += data;
        }
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.responseType = json.dataType || 'json';
    if (json.timeout > 0) {
        xmlhttp.timeout = json.timeout;
        xmlhttp.ontimeout = function () {
            json.error(xmlhttp, 'timeout', json);
        }
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            xmlhttp.onreadystatechange = W.noop;
            if ((xmlhttp.status >= 200 && xmlhttp.status < 300) || xmlhttp.status === 304 || xmlhttp.status === 0) {
                var result = xmlhttp.response || { "status_code": -1, "err_msg": "无返回信息" };
                json.success(result, xmlhttp, json);
            } else {
                json.error(xmlhttp, xmlhttp.status ? 'error' : 'abort', json);
            }
        }
    }
    xmlhttp.open(json.type, json.url, true);

    for (var name in json.headers) {
        xmlhttp.setRequestHeader(name, json.headers[name]);
    }
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(data);

    return xmlhttp;
};

/**
 * 简化的ajax，用get方式
 * @param {String} url
 * @param {Object} data
 * @param {Function} success
 * @param {String} dataType
 */
W.get = function (url, data, success, dataType) {
    var options = {
        data: data,
        dataType: dataType, //服务器返回json格式数据
        type: 'get', //HTTP请求类型
        timeout: 10000, //超时时间设置为10秒；
        success: success,
        error: function (xhr, type, errorThrown) {
            console.log(type + "___url:" + url);
        }
    };
    W.ajax(url, options);
}

/**
 * 简化的ajax，用post方式
 * @param {String} url
 * @param {Object} data
 * @param {Function} success
 * @param {String} dataType
 */
W.post = function (url, data, success, dataType) {
    var options = {
        data: data,
        dataType: dataType, //服务器返回json格式数据
        type: 'post', //HTTP请求类型
        timeout: 10000, //超时时间设置为10秒；
        success: success,
        error: function (xhr, type, errorThrown) {
            console.log(type + "___url:" + url);
        }
    };
    W.ajax(url, options);
}

/**
 * 简化的ajax，用get方式,返回json格式数据
 * @param {String} url
 * @param {Object} data
 * @param {Function} success
 */
W.getJSON = function (url, data, success) {
    var options = {
        data: data,
        dataType: "json",
        type: 'get',
        timeout: 10000,
        success: success,
        error: function (xhr, type, errorThrown) {
            console.log(type + "___url:" + url);
        }
    };
    W.ajax(url, options);
}