/*
@data:2017.04.10
@author:guo
@description:控制器文件
*/

'use strict';
app.controller("commonCtrl", ["$scope", "$http", "$filter", "$interval", "$timeout", "ws", "storage", "random", "numberPre", "mask", function($scope, $http, $filter, $interval, $timeout, ws, storage, random, numberPre, mask) {
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
            data: []
        },
        yAxis: [{
            axisLabel: {
                formatter: '{value} $'
            }
        }],
        series: []
    };

    $scope.option2 = null;
    //在ws中实施的将数据保存起来，存到localStorage上
    //初步想存两组数据，一组是元数据不变，另一组是格式化后的数据存储
    //元数据是否每次打开页面都要实时刷新？初步计划设定每2小时刷新一遍元数据

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
    $scope.trans = function(num) {
        $scope.option2.series[0].data[1] = num;
        $scope.$broadcast("changeData", [$scope.option2]);
    }

    function refresh() {
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
                }
            };
            $scope.option2.xAxis.data.push("2013-02-11");
            //此处最好用这种形式给数组添加数据，因为可复用性比较强，后期可以直接通过修改后台api来实现数据添加(就是折
            //线添加)，而不用手动修改前端数据。
            $scope.option2.series.forEach(function(item, i) {
                //在此处操作数据的变化-一般更新为添加，图标应该是一个上升曲线
                item.data.push(random.random(1, 100));
            });
        }, 1000);
    };
    //模拟数据测试功能区
    $http.get("./mock/data2.json").success(function(data) {
        //将拉取的api数据存储到本地
        storage.addData("serviceData", data);
        //数据缓存
        var tmpDate = storage.getData("serviceData");
        //对数据格式化，将坐标轴的纵轴，即时间数组填充
        var xAris = tmpDate.data.map(function(item, i) { return item.createtime; });
        //该步是进行数据汇总计算
        tmpDate.data.reduce(function(prev, item, i) {
            //count实现上一个对象的值与当前对象的值的计算，计算结果存到当前对象中，实现了累加
            //注意第一项不会进行计算，在后边获取第一项的值的时候，注意判断将第一项的值默认设置为他的自身
            var count = prev["PaidMoney"] + item["PaidMoney"];
            item["count"] = count;
            //此处是个坑，reduce这个函数要有一个返回值作为下一次循环的第一个参数，此处根据上边对应，返回
            //一个带有属性值为paidmoney的对象即可。
            return { "PaidMoney": count };
        });
        //存储坐标轴的具体数值，将数值数组取出来，里边填了上边reduce函数的坑
        var cont = tmpDate.data.map(function(item, i) {
            return (i == 0) ? item.PaidMoney : item.count;
        });
        var PaidMoney = tmpDate.data.map(function(item, i) {
            return item.PaidMoney;
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
    });
    //使用$timeout模拟ws驱动发送数据
    // $interval(function() {
    //     baseDate.data.date.push("2017-03-31");
    //     baseDate.data.cont.forEach(function(item, i, ary) {
    //         var oldItem = item.data[item.data.length - 1];
    //         if (item.name == "销售额") {
    //             item.data.push(1310 + oldItem);
    //         } else {
    //             item.data.push(1310);
    //         }
    //     });
    //     updateDate(function() {
    //         $scope.$broadcast("changeData", [$scope.option2]);
    //     });
    // }, 1000);

    //此函数功能实现图标数值对应，图表完整，实现图表的数据更新
    function updateDate(cb) {
        //此处的baseDate是存储的本地格式化后的值，所以图表的更改应该是去操作这个baseDate的值，实现数表的改变(即增加显示项)
        $scope.option2.xAxis.data = baseDate.data.date.map(function(item, i) {
            // return '2017-' + numberPre.fillZero(random.random(1, 12)) + "-" + numberPre.fillZero(random.random(1, 28));
            return item;
        });
        $scope.option2.legend.data = baseDate.data.cont.map(function(item, i) {
            return item.name;
        });
        $scope.option2.series = baseDate.data.cont.map(function(item, i) {
            return {
                name: item.name,
                type: "line",
                smooth: true,
                data: item.data.map(function(key, index) {
                    //return random.random(1, 100);
                    return key;
                })
            };
        });
        if (cb != undefined) {
            cb();
        }
    }
    /*------------------------*/
    console.log(mask.dom);
    // var tmpDom = document.createElement("div");
    // tmpDom.style = "height:200px;width:200px;background-color:red;";
    // mask.addHTML(tmpDom);
    // mask.clearDom();
    // //mask.hide();
    // mask.mask.onclick = function() {
    //     mask.hide();
    // }

}]);
app.controller("commonCtrl2", ["$scope", "ws", function($scope, ws, storage) {
    $scope.option2 = {
        title: {
            text: " ECharts 入门示例 "
        },
        calculable: true,
        tooltip: {},
        legend: {
            data: ["销量"]
        },
        dataZoom: [{
            startValue: "10"
        }, {
            type: 'inside'
        }],
        xAxis: {
            data: [15, 10, 26, 30, 10, 80]
        },
        yAxis: {},
        series: [{
            name: "销量",
            type: "bar",
            data: [15, 10, 26, 30, 10, 80]
        }],
        dataRange: {}
    };
    $scope.trans = function(num) {
        $scope.option2.series[0].data[1] = num;
        $scope.$broadcast("changeData", [$scope.option2]);
    }

}]);


app.controller("loginCtrl", ["$scope", "$http", function($scope, $http) {
    $scope.loginSubmit = function() {
        $scope.submitted = true;
        var errArr = [];
        for (var i in $scope.loginForm.$error) {
            errArr.push(i);
        };
        if (errArr.length) {
            return false;
        } else {
            alert("提交了");
            // $http.post({ url: "post.php", dataType: "json" }).success(function(re, status, xhr) {
            //     console.log(re);
            // }).error(function(err) {
            //     console.log(err);
            // })
        }
    }
}]);


app.controller("testRanCtrl", ["$scope", "random", "$interval", function($scope, random, $interval) {
    $scope.random = random.random(1, 9);
}]);


//使用了toaster模块，api地址：https://github.com/jirikavi/AngularJS-Toaster

app.controller('myController', function($scope, toaster) {
    $scope.pop = function() {
        toaster.pop({
            title: 'A toast',
            body: 'with an onHide callback',
            onHideCallback: function() {
                toaster.pop({
                    title: 'A toast',
                    body: 'invoked as an onHide callback'
                });
            }
        });
        toaster.pop({
            title: 'A toast',
            body: 'with an onHide callback'
        });
    };
});

//测试时间控制器
app.controller("dateCtrl", ["$scope", "$interval", "$filter", "date", "numberPre", function($scope, $interval, $filter, date, numberPre) {
    $scope.year = date.year;
    $scope.month = date.month;
    $scope.day = date.date;
    $scope.date = date.day;
    $scope.hour = numberPre.fillZero(date.hour);
    $scope.min = numberPre.fillZero(date.min);
    $scope.sec = numberPre.fillZero(date.sec);
    $scope.myDate = new Date().getTime();
    $interval(function() {
        $scope.myDate = new Date().getTime();
        $scope.sec = numberPre.fillZero((new Date()).getSeconds());
        if ($scope.sec % 60 == 0) {
            $scope.min = numberPre.fillZero((new Date()).getMinutes());
            if ($scope.min % 60 == 0) {
                $scope.hour = numberPre.fillZero((new Date()).getHours());
            }
        }
    }, 1000);
    $scope.num = $filter('currency')(123534, "RMB￥");
}]);


app.controller("textCtrl", ["$scope", function($scope) {
    $scope.message = { "item": 0, "cont": "我是新消息" };
}])

//ui-router控制器
app.controller("routerCtrl", ["$scope", function($scope) {

}]);