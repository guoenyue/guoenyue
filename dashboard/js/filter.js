app.filter("fillZero", function() {
    return function(input) {
        //input是输入的值，type是过滤器中的参数(来自html),将处理好的值返回作为操作完成的值显示回去
        //string
        var fill = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"];
        return fill[input] ? fill[input] : ('' + input);
    }
})