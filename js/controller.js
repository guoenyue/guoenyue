/*
@data:2017.04.10
@author:guo
@description:控制器文件
*/

'use strict';
app.controller("commonCtrl", ["$scope", "$http", "$filter", "$interval", "$timeout", "ws", "storage", "random", "numberPre", "mask", "load", "operateData", function($scope, $http, $filter, $interval, $timeout, ws, storage, random, numberPre, mask, load, operateData) {
    var startDate = $filter("date")(new Date().getTime(), "yyyy-MM-dd");
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
            boundaryGap: ["20%", "20%"],
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
                } //,
                // formatter: function(value) {
                //     return format(new Date(value), 'hh:mm')
                // }
            },
            axisTick: {
                show: false
            },
            data: []
        }],
        yAxis: [{
            axisLabel: {
                formatter: '{value} $'
            }
        }, {
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
            min: 100000,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            itemStyle: {
                normal: {
                    opacity: 0.3
                }
            },
            data: []
        }, {
            name: '交易额',
            type: 'bar',
            boundaryGap: ['20%', '20%'],
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


    //模拟数据测试功能区
    $http.get("./mock/data2.json").success(function(data) {
        //将拉取的api数据存储到本地
        storage.addData("serviceData", data);
        initData(function() {
            $scope.$broadcast("chartInit", [$scope.option2]);
        });
    });


    //使用$timeout模拟ws驱动发送数据
    $interval(function() {
        // //刷新图表
        // $scope.option2.xAxis.data = baseDate.data.date;
        // $scope.$broadcast("changeData", [$scope.option2]);

        //数据操作完毕之后，需要将推送过来的数据存储到本地整合到原始数据中，使他们成为完整的api。
        //原始数据：storage.getData("serviceData");
        var tmpDate = storage.getData("serviceData");
        tmpDate.data.push({
            "orderID": "xxx",
            "createtime": "2017-01-22 10:02:22",
            "OrderStatus": 1,
            "PaidMoney": random.random(1000, 2000),
            "year": 2017,
            "month": 1,
            "day": 11,
            "hour": 10,
            "minute": random.random(0, 59),
            "secon": 21
        });
        storage.addData("serviceData", tmpDate);
        //实际的ws发送数据处理
        //每次发送都要与上一个的时间进行比较，因为每次的推送时间肯定是晚于当前显示的最后一个，所以不用再跟其他的比较
        //若数据异步交互，无法保证时间的顺序，则应当每次都要全都循环一遍，并且在后边的对象for in时进行排序
        //现在默认时间顺序延后，只需要比较是不是跟最后一个时间段有重合即可。
        //比较参数为时间轴的最后一个时间刻度：var xA=baseSheet.xAxis[0].data ;
        //第二个参数是对传递过来的时间进行对比

        initData();
    }, 5000);


    function initData(cb) {
        var tmpDate = storage.getData("serviceData").data;
        var arrTmp = operateData.operateData(tmpDate).map(function(item, i) {
            var tmpObj = operateData.arrToObj(operateData.getTotal(item.data, "PaidMoney", "total"), "PaidMoney", "total");
            tmpObj.time = item.time;
            return tmpObj;
        });
        arrTmp = operateData.getTotal(arrTmp, "total", "allTotal");

        var myData = {
            "title": "销售实时数据分析表",
            "token": "fhsfshshfawkdkakn2e3e2",
            "lastLogin": "2017-04-13",
            "data": {
                "date": '',
                "cont": [{
                    "name": "销售额",
                    "data": arrTmp.map(function(item, i) { return item.allTotal; })
                }, {
                    "name": "交易额",
                    "data": arrTmp.map(function(item, i) { return item.total; })
                }]
            }
        };
        //x轴坐标
        baseSheet.xAxis[0].data = arrTmp.map(function(item, i) {
            var time = item.time;
            var year = time.substr(0, 4);
            var month = time.substr(4, 2);
            var day = time.substr(6, 2);
            var hour = time.substr(8, 2);
            var min = time.substr(10, 2);
            return year + '-' + month + '-' + day + '  ' + hour + ':' + min;
        });

        //y轴坐标
        baseSheet.series.forEach(function(item, i) {
            item.data = myData.data.cont[i].data;
        });
        console.log(baseSheet.xAxis[0].data);
        /*以下是具体的操作数据的固定方法*/
        storage.addData("metadata", myData);
        baseDate = storage.getData("metadata");
        $scope.option2 = baseSheet;
        $scope.option2.legend.data = myData.data.cont.map(function(item, i) {
            return item.name;
        });
        if (cb != undefined) {
            cb();
        }
        $scope.$broadcast("changeData", [$scope.option2]);
    };

    function updateDate(cb) {
        $scope.option2.xAxis.data = baseDate.data.date;
        //下边两个数组赋值操作会遍历所有的数组值，为了优化，第二次推送单条数据时不应该完全遍历，而只需要添加新增项目即可
        if (cb != undefined) {
            cb();
        }
    }
}]);