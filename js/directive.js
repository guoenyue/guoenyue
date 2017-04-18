'use strict';
app.directive("eCharts", function() {
    return {
        link: function(scope, element, attrs, ctrl) {
            if (!scope.mystyle) return;
            element.css(scope.mystyle);
            var theme, chart;

            function chartsInit() {
                //  console.log("初始化图表");
                theme = (scope.config && scope.config.theme) ?
                    scope.config.theme : 'default';
                chart = echarts.init(element[0], theme);
                chart.showLoading();
                //视图变化更新
                window.onresize = function() {
                    //    console.log("视图容器大小变化");
                    chart.resize();
                };
            }

            function refreshChart() {
                // console.log("图表填入数据并显示");
                // if (scope.config && scope.config.dataLoaded === false) {
                //     chart.showLoading();
                // }
                //chart.showLoading(); //此处应该用条件控制约束，调用显示等待动画，数据更新完成后关闭，
                //if (scope.config && scope.config.dataLoaded) {
                chart.setOption(scope.option);
                chart.resize();
                chart.hideLoading();
                // }

                // if (scope.config && scope.config.event) {
                //     if (angular.isArray(scope.config.event)) {
                //         angular.forEach(scope.config.event, function(value, key) {
                //             for (var e in value) {
                //                 chart.on(e, value[e]);
                //             }
                //         });
                //     }
                // }
            };

            //自定义参数 - config
            // event 定义事件
            // theme 主题名称
            // dataLoaded 数据是否加载

            // scope.$watch(
            //     function() { return scope.config; },
            //     function(value) { if (value) { refreshChart(); } },
            //     true
            // );

            //图表原生option
            /*scope.$watch(
                function() { return scope.option; },
                function(value) { if (value) { refreshChart(); } },
                true
            );*/
            //此处通过调用ng的watch函数进行脏值检查，但是大量数据操作是不宜进行反复的whatch函数，
            //改正思路可ws更新函数放到controller中来，将echarts提供的setOption函数放到更新函数中去，可
            //省去一步ng的脏值检查



            //此处已修改为事件传递通过父级作用域的函数，触发事件，只在父级作用域申明事件即可，这样做性能更好
            //省去了一步watch监听函数，
            scope.$on("changeData", function(e) {
                refreshChart();
            });
            scope.$on("chartInit", function(e) {
                scope.option = e.targetScope.option2;
                chartsInit();
            })
        },
        scope: {
            option: '=options',
            mystyle: '='
                //,config: '=ecConfig'

        },
        replace: true,
        restrict: 'EA'
    }
})