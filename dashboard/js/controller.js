/*
@data:2017.04.10
@author:guo
@description:控制器文件
*/

'use strict';
app.controller("commonCtrl", ["$scope", "$http", "$filter", "$interval", "$timeout", "ws", "storage", "random", "numberPre", "mask", "load", "operateData", function($scope, $http, $filter, $interval, $timeout, ws, storage, random, numberPre, mask, load, operateData) {
    var baseNum = 5;
    var theDate = new Date();
    var initInterval = null; //监察定时器--此定时器只监察当日数据
    var selecteDate = "day" + theDate.getFullYear() + numberPre.fillZero(theDate.getMonth() + 1) + numberPre.fillZero(theDate.getDate());
    var timeArr = [];
    var moneyArr = [];
    var totalArr = [];
    var actObj = null; //当前查看的日期的数据数组（不一定是当天）
    $scope.option2 = null;
    var baseDate = storage.getData("metadata") || {};
    //基础表单数据（各种初始化系统参数设置）,尚未填入数据
    var baseSheet = {
        title: {
            text: "PA 商城销售实时数据分析表"
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        calculable: true,
        legend: {
            orient: "vertical",
            data: []
        },
        toolbox: {
            left: 'right',
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: [{
            type: 'category',
            name: '时间',
            // offset: "-10",
            // position: "bottom",
            //boundaryGap: ["20%", "20%"],
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            },
            nameLocation: "start",
            nameTextStyle: {
                color: '#333'
            },
            axisLabel: {
                textStyle: {
                    color: '#333'
                },
                //interval: 0,
                // formatter: function(value) {
                //     var [h, m] = value.split(":");
                //     m = baseNum + parseInt(m);
                //     if (m == 60) {
                //         h = 1 + parseInt(h);
                //         m = "00";
                //     }
                //     return numberPre.fillZero(h) + ":" + numberPre.fillZero(m);
                // }
            },
            axisTick: {
                show: false
            },
            data: []
        }],
        yAxis: [{
            type: 'value',
            name: '销售额',
            min: 0,
            max: 100000,
            axisLabel: {
                formatter: '{value} $'
            }
        }, {
            type: 'value',
            name: '交易额',
            min: 0,
            max: 800,
            position: "right",
            axisLabel: {
                formatter: '{value} $'
            }
        }],
        series: [{
            name: '销售额',
            type: 'line',
            smooth: true,
            symbolSize: 10,
            animation: false,
            lineWidth: 1.2,
            hoverAnimation: false,
            symbol: 'circle',
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            itemStyle: {
                normal: {
                    opacity: 0.6
                }
            },
            data: []
        }, {
            name: '交易额',
            type: 'bar',
            boundaryGap: ['20%', '20%'],
            barCategoryGap: 1,
            yAxisIndex: 1,
            barWidth: 5,
            // barGap: 1,
            itemStyle: {
                normal: {
                    opacity: .6
                }
            },
            markPoint: {
                data: [{
                    name: '最高交易额',
                    type: 'max',
                    valueIndex: 1
                }]
            },
            data: []
        }]
    };

    ws.socket.onopen = function(event) {
        console.log(event)
        console.log("ws链接开启成功");
        // 发送一个初始化消息
        ws.socket.send('I am the client and I\'m listening!');
        // 监听消息
        ws.socket.onmessage = function(event) {
            console.log('Client received a message', event);
            var data = JSON.parse(event.data);
            updateDate(data);
        };
        // 监听Socket的关闭
        ws.socket.onclose = function(event) {
            console.log("close");
            console.log('Client notified socket has closed', event);
            alert("sever端关闭websocket服务器，数据无法更新，请刷新后在查看实时数据。");
        };
        // 关闭Socket.... 
        //setTimeout(ws.socket.close())
    };

    // $interval(function() {
    //     updateDate({
    //         "orderID": "xxx",
    //         "createtime": "2017-01-22 8:02:22",
    //         "OrderStatus": 1,
    //         "PaidMoney": 20,
    //         "Year": 2017,
    //         "Month": 4,
    //         "Day": 26,
    //         "Hour": random.random(0, 10),
    //         "Minute": 2,
    //         "Second": 22
    //     });
    // }, 10000);

    //模拟数据测试功能区
    //console.log(moment().subtract(6, "days").format("YYYY-MM-DD HH:mm:ss"));

    var startTime = moment().subtract(6, "days").format("YYYY-MM-DD 00:00:00");
    var endTime = moment().format("YYYY-MM-DD HH:mm:ss");
    var postDate = JSON.stringify({ startTime: startTime, endTime: endTime });

    //拉取所有数据作为元数据
    $http.post("http://192.168.4.54:8007/api/Init", postDate).success(function(data) {
        //存取元数据
        storage.addData("serviceData", data);
        var tmpdata = storage.getData("serviceData");
        if (tmpdata.length == 0) {
            alert("当前暂无数据");
            return;
        }
        initData(5);
    });

    //表单数据初始化
    function initData(_baseNum) {
        _baseNum = _baseNum ? _baseNum : baseNum;
        var tmpDate = storage.getData("serviceData");
        tmpDate = JSON.parse(tmpDate);
        var obj = null;
        tmpDate.forEach(function(item, i) {
            obj = operateData.sort(item, _baseNum);
        });
        storage.addData("processedData", obj);
        getSelectedDateArr();
        buildSheet(function() {
            $interval.cancel(initInterval);
            initInterval = $interval(listenDate, 100);
        });
    };
    //设置当前查看时间的数据
    function getSelectedDateArr() {
        var obj = storage.getData("processedData");
        var thisDayArr = obj["baseNum" + baseNum + selecteDate];
        if (thisDayArr == undefined) {
            alert("暂无查询日信息");
            thisDayArr = operateData.dayArr.map(function(item, i) { item.money = 0; return item; });
        };
        actObj = sessionStorage["baseNum" + baseNum + selecteDate] ? JSON.parse(sessionStorage["baseNum" + baseNum + selecteDate]) : operateData.getTotal(thisDayArr, "money", "total");
        sessionStorage["baseNum" + baseNum + selecteDate] = JSON.stringify(actObj);
        return actObj;
    }
    //建立图表
    function buildSheet(cb) {
        var thisDayArr = actObj;
        timeArr = [];
        moneyArr = [];
        totalArr = [];
        var nowTime = new Date();
        var now = {
            Year: nowTime.getFullYear(),
            Month: nowTime.getMonth() + 1,
            Day: nowTime.getDate(),
            Hour: nowTime.getHours(),
            Minute: nowTime.getMinutes()
        }
        var endIndex = getIndex(now, baseNum);
        var thisDay = "day" + now.Year + numberPre.fillZero(now.Month) + numberPre.fillZero(now.Day);
        thisDayArr.forEach(function(item, i) {
            timeArr.push(item.time);
            if (selecteDate == thisDay) {
                if (i < endIndex) {
                    moneyArr.push(item.money);
                    totalArr.push(parseFloat(item.total).toFixed(2));
                };
            } else {
                moneyArr.push(item.money);
                totalArr.push(parseFloat(item.total).toFixed(2));
            }
        });

        var myData = {
            "title": "销售实时数据分析表",
            "token": "fhsfshshfawkdkakn2e3e2",
            "lastLogin": "2017-04-13",
            "data": {
                "date": '',
                "cont": [{
                    "name": "销售额",
                    "data": totalArr
                }, {
                    "name": "交易额",
                    "data": moneyArr
                }]
            }
        };
        baseSheet.xAxis[0].data = timeArr;

        baseSheet.series.forEach(function(item, i) {
            item.data = myData.data.cont[i].data;
        });

        $scope.option2 = baseSheet;
        $scope.option2.legend.data = myData.data.cont.map(function(item, i) {
            return item.name;
        });
        $scope.$broadcast("chartInit", [$scope.option2]);
        if (cb != undefined && typeof cb == "function") {
            cb();
        }
        $scope.$broadcast("changeData", [$scope.option2]);
    };
    //获取推送条目的所在数组的索引值
    function getIndex(item, _baseNum) {
        _baseNum = _baseNum ? _baseNum : baseNum;
        var minRange = Math.floor((item.Minute % _baseNum) / 10) + Math.floor(item.Minute / _baseNum);
        var sortIndex = item.Hour * (60 / _baseNum) + minRange;
        return sortIndex;
    };
    //数据变化图表更新
    function updateDate(_data, cb) {
        var dataNow = { "orderID": "0000000", "createtime": new Date().getTime(), "OrderStatus": 1, "PaidMoney": 0, "Year": new Date().getFullYear(), "Month": new Date().getMonth() + 1, "Day": new Date().getDate(), "Hour": new Date().getHours(), "Minute": new Date().getMinutes(), "Second": new Date().getSeconds() };
        var itemNew = _data || dataNow;
        //非查看日消息不添加
        if (selecteDate != "day" + itemNew.Year + numberPre.fillZero(itemNew.Month) + numberPre.fillZero(itemNew.Day)) return void(0);
        var nowIdx = getIndex(dataNow, baseNum);
        var idx = getIndex(itemNew, baseNum);
        moneyArr[idx] = (isNaN(parseFloat(moneyArr[idx]))) ? itemNew.PaidMoney.toFixed(2) : (parseFloat(moneyArr[idx]) + itemNew.PaidMoney).toFixed(2);
        totalArr[idx] = (isNaN(parseFloat(totalArr[idx])) ? (parseFloat(totalArr[idx - 1] + itemNew.PaidMoney).toFixed(2)) : (parseFloat(totalArr[idx]) + itemNew.PaidMoney).toFixed(2));
        if (_data != undefined && dataNow.Year == _data.Year && dataNow.Month == _data.Month && dataNow.Day == _data.Day) {
            if (idx < nowIdx) {
                for (var fillGo = idx + 1; fillGo < nowIdx; fillGo++) {
                    totalArr[fillGo] = parseFloat(parseFloat(totalArr[fillGo]) + itemNew.PaidMoney).toFixed(2);
                }
            }
        }
        $scope.$broadcast("changeData", [$scope.option2]);
        if (cb != undefined && typeof cb == "function") {
            cb();
        }
    };

    //监听器，此函数功能旨在监听到目前时刻是否有数据变化，若有新数据添加则跳过，若无，则将虚拟数值0填入数组中，以达到实时显示当前信息的目的
    function listenDate() {
        var nowTime = new Date();
        var now = {
            Hour: nowTime.getHours(),
            Minute: nowTime.getMinutes()
        };
        var nowIndex = getIndex(now, baseNum) - 1;
        if (moneyArr[nowIndex] == undefined) {
            moneyArr[nowIndex] = 0;
            totalArr[nowIndex] = nowIndex == 0 ? moneyArr[nowIndex] : totalArr[nowIndex - 1];
            $scope.$broadcast("changeData", [$scope.option2]);
        }
        console.log("监察中...");
    };


    function checkNaN(index) {

    }

    $scope.dateArr = Array.apply(null, { length: 7 }).map(function(item, i) { return moment().subtract(6 - i, "days").format("YYYYMMDD"); });

    $scope.changeDay = getDate;


    function getDate(_date) {
        selecteDate = "day" + _date;
        getSelectedDateArr();
        if (_date == moment().format("YYYYMMDD")) {
            // buildSheet(function() {
            //     $interval.cancel(initInterval);
            //     initInterval = $interval(listenDate, 100);
            // });
            window.location.reload();
        } else {
            buildSheet(function() {
                sessionStorage.removeItem("baseNum" + baseNum + selecteDate);
                $interval.cancel(initInterval);
            });
        }

    };
}]);


/*
图标的设计规格，固定坐标轴y轴暂时定为最大坐标100,000.
尺寸：每个柱状图的柱子大概需要宽5像素，柱子间间隔1像素，共288个横坐标轴，即总共需要至少1728个像素+左右留距
*/