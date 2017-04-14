'use strict';
app.service("ws", function() {
    var socketUrl = "ws://192.168.4.54:8005/api/Listen?nickName=aa";
    // var socket = new WebSocket(socketUrl);
    // this.socket = socket;
});
app.service("storage", function() {
    this.storage = window.localStorage;
    this.add = function(key, val) {
        if (val instanceof String || val instanceof Number) {
            this.storage[key] = val;
        } else {
            this.addData(key, val);
        }
    };
    this.get = function(key) {
        //获得简单数据，字符串类型，若为数字需要在外部格式化
        return this.storage[key];
    };
    this.addData = function(key, obj) {
        //此函数将元数据通过json格式化工具转换成字符串存到storage中
        this.storage[key] = JSON.stringify(obj);
    };
    this.getData = function(key) {
        //为了优化节省时间，简单数据(数字，字符串)不应从此函数中获得
        //注意此处返回的是元数据格式的值，而非存进去的字符串
        //  console.log(key);
        //console.log(this.storage[key]);
        return this.storage[key] && JSON.parse(this.storage[key]);
    };
});
//随机函数
app.service("random", function() {
    this.random = function(min, max) {
        // [min, max] = [min, max].sort(function(a, b) { return a - b; })
        return Math.round(Math.random() * (max - min)) + min;
    }
});

//数字处理函数
app.service('numberPre', function() {
    this.Int = function(num) {
        return parseInt(num);
    };
    this.Float = function(num) {
        return parseFloat(num);
    };
    this.Fixed = function(num, point) {
        return num.toFixed(point);
    };
    this.fillZero = function(num) {
        //string
        var fill = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];
        return fill[num] ? fill[num] : ('' + num);
    }
});

//处理时间函数----时间还是交给过滤器去处理吧，还有上边那个数字处理也应该放在过滤器当中
app.service("date", function() {
    var date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth() + 1;
    this.date = date.getUTCDate();
    this.day = (new Date()).getDay();
    this.hour = (new Date()).getHours();
    this.min = (new Date()).getMinutes();
    this.sec = (new Date()).getSeconds();
});
//全局遮罩层服务
app.service("mask", function() {
    var maskDom = document.createElement("div");
    maskDom.className = "my_mask";
    maskDom.id = "my_mask";
    document.body.appendChild(maskDom);
    this.mask = maskDom;
    this.addHTML = function(html) {
        if (html instanceof HTMLElement) {
            console.log("我是dom");
            maskDom.appendChild(html);
        } else if (typeof html == "string") {
            console.log("我是字符串生成的dom");
            maskDom.innerHTML = html;
        } else {
            return false;
        }
    };
    this.clearDom = function() {
        this.mask.innerHTML = "";
    }
    this.hide = function(cb) {
        this.mask.style.display = "none";
        if (cb != undefined && typeof cb == Function) {
            cb();
        }
    };
    this.show = function(cb) {
        this.mask.style.display = "block";
        if (cb != undefined && typeof cb == Function) {
            cb();
        }
    }
})