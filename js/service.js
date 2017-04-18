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
    this.parseToDate = function() {

    }
});
//全局数据处理服务

app.service("operateData", ["numberPre", function(numberPre) {
    var baseNum = 5; //每5分钟一个时间段
    this.baseNum = baseNum;
    var that = this;
    //将数据按时间分组格式化，返回数组
    this.operateData = function(data) {
        var metaData = data;
        var tmpObj = {};
        var tmpArr = [];
        metaData.forEach(function(item, i) {
            var year, month, day, hour, min;
            year = item.year;
            month = item.month;
            day = item.day;
            hour = item.hour;
            //min=
            var spliceNum = (Math.ceil(((item.minute + item.secon / 60) % that.baseNum) / 10) + Math.floor(item.minute / that.baseNum)) * that.baseNum;
            if (spliceNum >= 60) {
                spliceNum = "00";
                hour += 1;
            }
            if (hour >= 24) {
                hour = "00";
                day += 1;
            }
            if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10) {
                if (day >= 31) {
                    month += 1;
                    day = 1;
                }
            } else if (month == 4 || month == 6 || month == 9 || month == 11) {
                if (day >= 30) {
                    month += 1;
                    day = 1;
                }
            } else if (month == 2) {
                if (day >= 28 && year % 4 != 0) {
                    month += 1;
                    day = 1;
                } else if (day >= 29 && year % 4 == 0) {
                    month += 1;
                    day = 1;
                }
            } else if (month == 12) {
                if (day >= 31) {
                    month = 1;
                    day = 1;
                    year += 1;
                }
            }
            var tmpStr = "time" + year + numberPre.fillZero(month) + numberPre.fillZero(day) + numberPre.fillZero(hour) + numberPre.fillZero(spliceNum);
            tmpObj[tmpStr] = tmpObj[tmpStr] ? tmpObj[tmpStr] : [];
            tmpObj[tmpStr].push(item);
        });
        //为了慎重，这个遍历应该在变成数组之后从新排序，因为这个for in的遍历循环输出顺序根据浏览器不同可能排序不同
        //但是推送数据都是按照时间顺序推送，此处暂时忽略
        //资料url：http://echizen.github.io/tech/2017/03-12-js-object-forin-order
        for (var i in tmpObj) {
            tmpArr.push({
                time: i.substr(4),
                data: tmpObj[i]
            });
        }
        this.tmpArr = tmpArr;
        this.tmpObj = tmpObj;
        return tmpArr;
    };
    //给数组内的对象添加一项属性，此添加项的属性值等于该数组首位到自身的某项值的和
    //@prama(所需遍历的数组,所需计算项目的名称,[,添加项目的名称])第三个参数默认为total
    this.getTotal = function(arr, nameStr, total) {
        total = total ? total : "total";
        arr.reduce(function(prev, item, i) {
            //count实现上一个对象的值与当前对象的值的计算，计算结果存到当前对象中，实现了累加
            //注意第一项不会进行计算，在后边获取第一项的值的时候，注意判断将第一项的值默认设置为他的自身
            i == 1 ? prev[total] = prev[nameStr] : null;
            var count = prev[nameStr] + item[nameStr];
            item[total] = count;
            //一个带有属性值为nameStr的对象即可。
            var tmpObj = {};
            tmpObj[nameStr] = count;
            return tmpObj;
        });
        if (arr.length == 1) {
            arr[0][total] = arr[0][nameStr];
        }
        return arr;
    };
    //数组转成对象，并将需要的分段时间及分段汇总的值传给对象保存
    this.arrToObj = function(arr, nameStr, total) {
        var tmpArr = this.getTotal(arr, nameStr, total);
        var tmpObj = {};
        tmpObj[total] = tmpArr[tmpArr.length - 1][total];
        return tmpObj;
    }

}]);

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
        if (cb != undefined && typeof cb == "function") {
            cb();
        }
    };
    this.show = function(cb) {
        this.mask.style.display = "block";
        if (cb != undefined && typeof cb == "function") {
            cb();
        }
    }
});
//全局加载进度条
app.service("load", ["$interval", "random", function($interval, random) {
    var progress = 0;
    var timer = null;
    var that = this;
    this.progress = progress;
    this.on = function() {
        progress = 0;
        this.off();
        timer = $interval(function() {
            progress += random.random(2, 10);
            if (progress > 98) {
                progress = 98;
                that.off();
            };
            that.progress = progress;
        }, 200 * random.random(2, 5))
    };
    this.off = function() {
        $interval.cancel(timer);
    }
    this.success = function(cb) {
        this.off();
        this.progress = 100;
        if (cb != undefined && typeof cb == "function") {
            cb();
        }
    }
    this.fail = function(cb) {
        this.off();
        if (cb != undefined && typeof cb == "function") {
            cb();
        }
    }

}]);