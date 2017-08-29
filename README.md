# iOSselect
master主干为稳定版，可放心使用 如果好用请帮我点个star

html下拉菜单select在安卓和IOS下表现不一样，iosselect正是为统一下拉菜单样式而生，我们以IOS下select的交互和样式为蓝本，开发了这一组件。

## 官网

http://zhoushengfe.com/iosselect/website/index.html

### 特点

* 0依赖，只需引用一个js和css即可
* 样式可自己定制，也可使用默认样式
* 一个页面同时实例化多个组件
* 支持最多5级级联
* 支持设置高度和高度单位
* 适用于android和iOS设备(PC端支持IE9+，不过PC端上滑动体验不太实用)

### 起步

* npm

``` javascript
npm install iosselect
```

* 下载文件

点击下载文件到项目目录中，在HTML文件中插入以下代码，并按需调整路径。

``` html
<link rel="stylesheet" href="/static/css/iosSelect.css">
<script type="text/javascript" src="/static/js/iosSelect.js"></script>
```

* 实例化组件

``` javascript
var data=[{'id': '10001', 'value': '演示数据1'},{'id': '10002', 'value': '演示数据2'}];
var showDom = document.querySelector('#showDom');// 绑定一个触发元素
var valDom = document.querySelector('#valDom');  // 绑定一个存储结果的元素
showDom.addEventListener('click', function () {  // 添加监听事件
    var val = showDom.dataset['id'];             // 获取元素的data-id属性值
    var title = showDom.dataset['value'];        // 获取元素的data-value属性值
	// 实例化组件
    var example = new IosSelect(1,               // 第一个参数为级联层级，演示为1
        [data],                             // 演示数据
        {
            container: '.container',             // 容器class
            title: '演示标题',                    // 标题
            itemHeight: 50,                      // 每个元素的高度
            itemShowCount: 3,                    // 每一列显示元素个数，超出将隐藏
            oneLevelId: val,                     // 第一级默认值
            callback: function (selectOneObj) {  // 用户确认选择后的回调函数
                valDom.value = selectOneObj.id;
                showDom.innerHTML = selectOneObj.value;
                showDom.dataset['id'] = selectOneObj.id;
                showDom.dataset['value'] = selectOneObj.value;
            }
    });
});
```

### Demos

* 一级级联，银行选择

http://zhoushengfe.com/iosselect/demo/one/bank.html

* 二级级联，三国杀将领组合选

http://zhoushengfe.com/iosselect/demo/two/sanguokill.html

* 三级级联，省市区选择

http://zhoushengfe.com/iosselect/demo/three/area.html

* viewport缩放时处理方案

http://zhoushengfe.com/iosselect/demo/rem/bank.html

* 日期选择器 三级联动，通过方法获取数据，并且有加载中效果

http://zhoushengfe.com/iosselect/demo/datepicker/date.html

* 日期时间选择器，共五级，通过方法获取数据

http://zhoushengfe.com/iosselect/demo/five/time.html

* AJAX获取数据

https://pengweifu.github.io/iosselect/demo/ajax/area2.html

* 出场动画／退场动画

https://pengweifu.github.io/iosselect/demo/one/animate.html

* 组件实例化多次

https://pengweifu.github.io/iosselect/demo/one/multi.html

* AngularJS 异步加载

https://pengweifu.github.io/iosselect/demo/ajax/angular/index.html#/components


### 如果要修改菜单项里样式，请自行修改样式，比如：

.ios-select-widget-box ul li

### 参数说明

#### level

	default: 1
	type:    number

数据的层级，最多支持5层

#### data

	default: undefined
	type:    ...Array

[oneLevelArray[, twoLevelArray[, threeLevelArray, [fourLevelArray, [fiveLevelArray]]]]] 可以用数组，也可以用方法。
前五项分别对应级联1,2,3,4,5项，每一项又是一个数组或方法
如果是数组：
每一项数组中包含一系列对象，每个对象必须要有id,作为该条数据在该项数组中的唯一标识，value作为显示值，parentId是可选属性，作为关联的标志，数据形如：

```
var iosProvinces = [
  {"id": "130000', "value": "河北省", "parentId": "0"}
];
var iosCitys = [
  {"id":"130100","value":"石家庄市","parentId":"130000"},
];
```

当我们选择河北省时，就到城市中找到parentId为河北省id的数据，然后展示出来。
点击查看demo：
http://zhoushengfe.com/iosselect/demo/three/area.html

如果是方法：
传入一个方法，在方法中获取数据，数据形如：

``` javascript
var yearData = function(callback) {
callback(formatYear(nowYear))
}
var monthData = function (year, callback) {
callback(formatMonth());
};
var dateData = function (year, month, callback) {
    callback(formatDate(28));
   }
var hourData = function(one, two, three, callback) {
var hours = [];
for (var i = 0,len = 24; i < len; i++) {
    hours.push({
	id: i,
	value: i + '时'
    });
}
callback(hours);
};
var minuteData = function(one, two, three, four, callback) {
var minutes = [];
for (var i = 0, len = 60; i < len; i++) {
    minutes.push({
	id: i,
	value: i + '分'
    });
}
callback(minutes);
};
```

具体可参考demo中的日期选择器和日期时间选择器。
点击查看demo：
http://zhoushengfe.com/iosselect/demo/datepicker/date.html

如何ajax获取数据

![image](http://zhoushengfe.com/img/ajax.jpg)

#### options

	type:    object

其余选项，含以下几个属性：

#### options.container

	default: ''
	type:    string

实例化后的对象包裹元素，可选项

#### options.callback

	default: undefined
	type:    function

选择完毕后的回调函数，必选项
options.callback(selectOneObj, selectTwoObj, selectThreeObj, selectFourObj, selectFiveObj) selectNumberObj为每级对应选中项，包含对应数据的所有字段及dom对象

#### options.fallback

    default: undefined
    type:    function

选择取消后的回调函数，可选项

#### options.title

	default: ''
	type:    string

显示标题，可选项

#### options.sureText

	default: '确定'
	type:    string

设置确定按钮文字，可选项

#### options.closeText

	default: '取消'
	type:    string

设置取消按钮文字，可选项

#### options.itemHeight

	default: 35
	type:    number

每一项的高度，可选项

#### options.itemShowCount

	default: 7
	type:    number

组件展示的项数，可选项，可选3,5,7,9，不过不是3,5,7,9则展示7项

#### options.headerHeight

	default: 44
	type:    number

组件标题栏高度，可选项

#### options.cssUnit

	default: 'px'
	type:    string

元素css尺寸单位，可选项，可选px或者rem

#### options.addClassName

	default: ''
	type:    string

组件额外类名，用于自定义样式，可选项

#### options.relation

	default: [0, 0, 0, 0]
	type:    ...Array

[oneTwoRelation, twoThreeRelation, threeFourRelation, fourFiveRelation]各级选项之间是否通过parentId关联，可选项

#### options.relation.oneTwoRelation

	default: 0
	type:    number

第一列和第二列是否通过parentId关联，可选项

#### options.relation.twoThreeRelation

	default: 0
	type:    number

第二列和第三列是否通过parentId关联，可选项

#### options.relation.threeFourRelation

	default: 0
	type:    number

第三列和第四列是否通过parentId关联，可选项

#### options.relation.fourFiveRelation

	default: 0
	type:    number

第四列和第五列是否通过parentId关联，可选项

#### options.oneLevelId

	type:    string

实例展示时，第一级数据默认选中值，可选项，默认为第一级数据第一项id

#### options.twoLevelId

	type:    string

实例展示时，第二级数据默认选中值，可选项，默认为第二级数据第一项id

#### options.threeLevelId

	type:    string

实例展示时，第三级数据默认选中值，可选项，默认为第三级数据第一项id

#### options.fourLevelId

	type:    string

实例展示时，第四级数据默认选中值，可选项，默认为第四级数据第一项id

#### options.fiveLevelId

	type:    string

实例展示时，第五级数据默认选中值，可选项，默认为第五级数据第一项id

#### options.showLoading

	default: false
	type:    boolean

实例展示时，在数据加载之前下拉菜单是否显示加载中的效果，建议ajax获取数据时设置为true

#### options.showAnimate

    default: false
    type:    boolean

是否显示入场动画和退场动画，如需自定义动画效果，请覆写.fadeInUp .layer和.fadeOutDown .layer的css3动画。PS:动画时间为0.5秒。

## 如果有使用问题，可加QQ群：419468553
