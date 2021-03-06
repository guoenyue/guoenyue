/*
@data:2017.04.10
@author:guo
@description:控制器文件
*/

'use strict';
app.controller("commonCtrl", ["$scope", "$http", "$filter", "$interval", "$timeout", "ws", "storage", "random", "numberPre", "mask", "load", "operateData", function($scope, $http, $filter, $interval, $timeout, ws, storage, random, numberPre, mask, load, operateData) {
    var startDate = $filter("date")(new Date().getTime(), "yyyy-MM-dd");
    var baseDate = storage.getData("metadata") || {};
    //刷新时间0-59,当前设置为5分钟刷新一次
    var REFRESH_MIN = 5;
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
        // dataZoom: [{
        //     start: 90
        //         //startValue: $filter("date")(new Date().getTime(), "yyyy-MM-dd")
        // }, {
        //     type: 'inside'
        // }],
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
        xAxis: {
            type: 'time',
            name: '时间',
            interval: 10 * 60 * 1000,
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            },
            nameTextStyle: {
                color: '#333'
            },
            axisLabel: {
                textStyle: {
                    color: '#333'
                },
                formatter: function(value) {
                    return format(new Date(value), 'hh:mm')
                }
            },
            axisTick: {
                show: false
            }
            //data: []
        },
        yAxis: [{
            axisLabel: {
                formatter: '{value} $'
            }
        }],
        series: [{
            name: '心率',
            type: 'line',
            hoverAnimation: false,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            itemStyle: {
                normal: {
                    opacity: 0
                }
            },
            markPoint: {
                symbol: 'image://http://res.takefit.cn/static/img/maxp.png',
                symbolOffset: [0, '-100%'],
                symbolSize: [40, 30],
                itemStyle: {
                    normal: {
                        color: '#eb426d'
                    }
                },
                data: [{
                    name: '最高心率',
                    type: 'max',
                    valueIndex: 1
                }]
            },
            data: [],
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                        offset: 1,
                        color: '#c5c5e1' // 0% 处的颜色
                    }, {
                        offset: 0,
                        color: '#f9fafb' // 100% 处的颜色
                    }], false),
                    opacity: 0.4
                }
            }
        }]
    };

    $scope.option2 = null;
    //在ws中实施的将数据保存起来，存到localStorage上
    //初步想存两组数据，一组是元数据不变，另一组是格式化后的数据存储
    //元数据是否每次打开页面都要实时刷新？

    // ws.socket.onopen = function(event) {
    //     console.log(event)
    //     console.log("ws链接开启成功");
    //     // 发送一个初始化消息
    //     ws.socket.send('I am the client and I\'m listening!');
    //     // 监听消息
    //     ws.socket.onmessage = function(event) {
    //         console.log("message");
    //         console.log('Client received a message', event);
    //         console.log(JSON.parse(event.data));
    //     };
    //     // 监听Socket的关闭
    //     ws.socket.onclose = function(event) {
    //         console.log("close");
    //         console.log('Client notified socket has closed', event);
    //     };
    //     // 关闭Socket.... 
    //     //setTimeout(ws.socket.close())
    // };

    //此处的消息发射应该是每5分钟发射一次，即将数据变动每隔5分钟刷新一次
    //所以应当使用$interval服务，在此服务的函数中，每次都要将localstorage存取的数据从新赋值给option,格
    //式化完数据之后将事件广播给指令(即图表控件)调用setOption方法刷新视图
    // $scope.trans = function(num) {
    //     $scope.option2.series[0].data[1] = num;
    //     $scope.$broadcast("changeData", [$scope.option2]);
    // }

    /*function refresh() {
        //定时器更新模块
        $interval(function() {
            $scope.myDate = new Date().getTime();
            $scope.sec = numberPre.fillZero((new Date()).getSeconds());
            if ($scope.sec % 60 == 0) {
                $scope.min = numberPre.fillZero((new Date()).getMinutes());
                if ($scope.min % REFRESH_MIN == 0) {
                    //每达到整5分钟时更新一次信息
                    $scope.$broadcast("changeData", $scope.option2);
                    $scope.hour = numberPre.fillZero((new Date()).getHours());
                    //后边数据太多的话有可能限制条数，限制方法对数据数组进行截取，保留最新的若干条即可
                    //截取数组后一半数据或者后n条数据，这个功能可能几个小时启动一次

                    /*
                        1.截取一半
                        var len = parseInt((arr.length-1)/2);
                        arr.splice(0,len);
                        2.截取后留下n条最新
                        var len = arr.length-n;
                        arr.splice(0,len);
                    */



    /*
        时间间隔的计算
        
    */
    /*       }
            };
            $scope.option2.xAxis.data.push("2013-02-11");
            //此处最好用这种形式给数组添加数据，因为可复用性比较强，后期可以直接通过修改后台api来实现数据添加(就是折
            //线添加)，而不用手动修改前端数据。
            $scope.option2.series.forEach(function(item, i) {
                //在此处操作数据的变化-一般更新为添加，图标应该是一个上升曲线
                item.data.push(random.random(1, 100));
            });
        }, 1000);
    };*/
    //模拟数据测试功能区
    $http.get("./mock/data2.json").success(function(data) {
        //将拉取的api数据存储到本地
        storage.addData("serviceData", data);
        //initData();
        var tmpDate = storage.getData("serviceData").data;
        console.log(tmpDate);
        var xAdata = tmpDate.map(function(item, i) {
            var time = new Date(item.year, item.month, item.day, item.hour, item.minute, item.secon).getTime();
            return {
                name: item.PaidMoney,
                value: [time, item.PaidMoney]
            }
        });
        baseSheet.series[0].data = xAdata;
        var myDtae = {
            "title": "销售实时数据分析表",
            "token": "fhsfshshfawkdkakn2e3e2",
            "lastLogin": "2017-04-13",
            "data": {
                "date": xAdata,
                "cont": [{
                    "name": "销售额",
                    "data": xAdata.map(function(item) { return item.value[1] })
                }, {
                    "name": "交易额",
                    "data": xAdata.map(function(item) { return item.value[1] })
                }]
            }
        };
        /*以下是具体的操作数据的固定方法*/
        storage.addData("metadata", myDtae);
        baseDate = storage.getData("metadata");
        baseSheet
        $scope.option2 = baseSheet;
        $scope.$broadcast("chartInit", [$scope.option2]);
        $scope.$broadcast("changeData", [$scope.option2]);
    });


    //使用$timeout模拟ws驱动发送数据
    // $interval(function() {
    //     // //刷新图表
    //     // $scope.option2.xAxis.data = baseDate.data.date;
    //     // $scope.$broadcast("changeData", [$scope.option2]);

    //     //数据操作完毕之后，需要将推送过来的数据存储到本地整合到原始数据中，使他们成为完整的api。
    //     //原始数据：storage.getData("serviceData");
    //     var tmpDate = storage.getData("serviceData");
    //     tmpDate.data.push({
    //         "orderID": "xxx",
    //         "createtime": "2017-01-22 10:02:22",
    //         "OrderStatus": 1,
    //         "PaidMoney": random.random(1000, 2000),
    //         "year": 2017,
    //         "month": 1,
    //         "day": 11,
    //         "hour": 10,
    //         "minute": random.random(0, 59),
    //         "secon": 21
    //     });
    //     storage.addData("serviceData", tmpDate);
    //     initData();
    // }, 5000);

    function format(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        console.log(fmt);
        return fmt;
    }

    function initData() {
        //数据缓存
        var tmpDate = storage.getData("serviceData");
        tmpDate = operateData.operateData(tmpDate.data);
        console.log(tmpDate);
        tmpDate.forEach(function(item, i) {
            item.data = operateData.arrToObj(item.data, "PaidMoney", "total").total;
        });
        console.log(tmpDate);
        tmpDate = operateData.getTotal(tmpDate, "data", "total");
        console.log(tmpDate);

        //对数据格式化，将坐标轴的纵轴，即时间数组填充
        var xAris = tmpDate.map(function(item, i) {
            var time = item.time;
            var year = time.substr(0, 4);
            var month = time.substr(4, 2);
            var day = time.substr(6, 2);
            var hour = time.substr(8, 2);
            var min = time.substr(10, 2);

            return year + '-' + month + '-' + day + '  ' + hour + ':' + min;
        });
        //存储坐标轴的具体数值，将数值数组取出来，里边填了上边reduce函数的坑
        var cont = tmpDate.map(function(item, i) {
            return item.total;
        });
        var PaidMoney = tmpDate.map(function(item, i) {
            return item.data;
        });

        // 自定义的本地api格式
        var myDtae = {
            "title": "销售实时数据分析表",
            "token": "fhsfshshfawkdkakn2e3e2",
            "lastLogin": "2017-04-13",
            "data": {
                "date": xAris,
                "cont": [{
                    "name": "销售额",
                    "data": cont
                }, {
                    "name": "交易额",
                    "data": PaidMoney
                }]
            }
        };
        /*以下是具体的操作数据的固定方法*/
        storage.addData("metadata", myDtae);
        baseDate = storage.getData("metadata");
        $scope.option2 = baseSheet;
        updateDate(function() {
            $scope.$broadcast("chartInit", [$scope.option2]);
        });
        $scope.$broadcast("changeData", [$scope.option2]);
        //refresh();

        //手动释放内存
        tmpDate = xAris = cont = PaidMoney = myDtae = null;
    };

    //此函数功能实现图标数值对应，图表完整，实现图表的数据更新
    function updateDate(cb) {
        //此处的baseDate是存储的本地格式化后的值，所以图表的更改应该是去操作这个baseDate的值，实现数表的改变(即增加显示项)
        $scope.option2.xAxis.data = baseDate.data.date;
        //下边两个数组赋值操作会遍历所有的数组值，为了优化，第二次推送单条数据时不应该完全遍历，而只需要添加新增项目即可
        //所以为了方便调用再建一个freshData函数，专门负责处理单条推送数据的更新
        $scope.option2.legend.data = baseDate.data.cont.map(function(item, i) {
            return item.name;
        });
        $scope.option2.series = baseDate.data.cont.map(function(item, i) {
            if (i == 0) { var type = "line" } else {
                type = "bar";
            }
            return {
                name: item.name,
                type: type,
                smooth: true,
                data: item.data
            };
        });
        if (cb != undefined) {
            cb();
        }
    }
    /*------------------------*/
    // var tmpDom = document.createElement("div");
    // tmpDom.style = "height:200px;width:200px;background-color:red;";
    // mask.addHTML(tmpDom);
    // mask.clearDom();
    // //mask.hide();
    // mask.mask.onclick = function() {
    //     mask.hide();
    // }
    load.on();
    $scope.progress = load;
    $scope.complete = function() {
        load.success(function() {
            console.log("加加加加");
        });
        console.log(load);
    }

    function format(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        console.log(fmt);
        return fmt;
    }
}]);