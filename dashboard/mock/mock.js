var baseNum = 5;
var arrSpliceNum = [];
var obj = {};
for (var j = 0; j < 24; j++) {
    for (var i = 0; i < 60; i++) {
        var spliceNum = (Math.floor((i % baseNum) / 10) + Math.floor(i / baseNum) + 1) * baseNum;
        var tmpStr = j + "min" + spliceNum;
        obj[tmpStr] = obj[tmpStr] ? obj[tmpStr] : [];
    }
};
for (var k in obj) {
    arrSpliceNum.push(k);
}
//console.log(arrSpliceNum);
obj = arrSpliceNum.map(function(item, i) {
    var [h, min] = item.split("min");
    //obj[item] = i;
    return {
        "orderID": "xxx",
        "createtime": "2017-01-21 10:02:22",
        "OrderStatus": 1,
        "year": 2017,
        "month": 4,
        "day": new Date().getDate(),
        index: i,
        hour: +h,
        minute: min - Math.floor(Math.random() * 5),
        "PaidMoney": (Math.random() * 104).toFixed(2),
        "secon": 22
    }
});
window.ooo = obj;