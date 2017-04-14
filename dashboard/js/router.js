app.config(function($stateProvider, $urlRouterProvider) {
    //console.log($stateProvider);
    $stateProvider.state("index", {
        url: "/index",
        template: "hello,我是index"
    }).state("cont", {
        url: "/cont",
        template: "你好我是详细页"
    });
    $urlRouterProvider.otherwise(function($injector, $location) {
        $location.path('/index');
    });
})