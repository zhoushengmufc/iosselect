#如果好用请star下项目，谢谢
# iosselect
#webapp模仿ios下拉菜单  
html下拉菜单select在安卓和IOS下表现不一样，iosselect正是为统一下拉菜单样式而生

我们以IOS下select的交互和样式为蓝本，开发了这一组件

##特点
可以做到0依赖，只需引用一个js和css即可，样式可自己定制，也可使用默认样式

##更新日志

    2016-11-28
    
    1，添加options.itemShowCount参数，展示的选项可以为3,5,7,9。默认为7项
    
    2016-11-11
    
    1，npm publish
    
    2016-11-7 
    
    1，支持最多5级级联，level参数可设置1,2,3,4,5  
    
    2，支持设置高度和高度单位，默认单位px，itemHeight默认35,headerHeight默认44
	  比如我们要使用rem，可以在options参数里设置如下参数
	  itemHeight: 0.7,
	  headerHeight: 0.88,
	  cssUnit: 'rem',

    3，联动后默认值，比如年份变更后，之前的月份选中值不变
    
##使用方法

    方法1：npm install iosselect
    
    方法2：直接引用静态文件，参看demo
	      

##文件说明
src------iosselect基于iscroll5开发，在这个文件夹下可以看到iscroll.js,iosselect.js,iosselect.css，如果项目里有单独使用iscroll5,可以使用这个版本

merge------合并了iscroll与iosselect,做到组件0依赖，方便开发

demo------使用demo,说明如下：

    one------一级下拉菜单，以银行选择为实例
    
    two------二级下拉菜单，相互独立，没有关联，以三国杀组合选将为例
    
    three------三级下拉菜单，省市区选择三级联动
    
    rem------rem框架adaptivejs的特定版本
    
    datepicker------日期选择器，通过方法筛选数据，实现三级联动，ajax获取数据时可参考此例
    
    five------日期时间选择器，五级选择器，前三级联动
##使用说明##
###API##
	    new IosSelect(level, data, options)
	        level: 级联等级，支持1,2,3,4,5 必选项
		data: [oneLevelArray[, twoLevelArray[, threeLevelArray, [fourLevelArray, [fiveLevelArray]]]]] 除了用数组，也可以用方法
		options:
		     container: 组件的父元素，传入css3选择器，比如'.a' 或 '#a'之类的
		     callback: 选择完毕后的回调函数 必选
		     title: 选择框title  可选，没有此参数则不显示title
		     itemHeight: 每一项的高度，可选，默认 35
		     headerHeight: 组件标题栏高度 可选，默认 44
		     cssUnit: css单位，目前支持px和rem，默认为px
		     addClassName: 组件额外类名 可选，用于自定义样式
		     relation: [1, 1, 0, 0]: [第一二级是否关联，第二三级是否关联，第三四级是否关联，第四五级是否关联] ，默认不关联，即默认是[0, 0, 0, 0]
		     oneLevelId: 第一级选中id 可选
		     twoLevelId: 第二级选中id 可选
		     threeLevelId: 第三级选中id 可选
		     fourLevelId: 第四级选中id 可选
		     fiveLevelId: 第五级选中id 可选
		     showLoading: 如果你的数据是异步加载的，可以使用该参数设置为true，下拉菜单会有加载中的效果
##参数说明##
		
		data: 数组，前五项分别对应级联1,2,3,4,5项，每一项又是一个数组或方法
		    如果是数组：
		        每一项数组中包含一系列对象，每个对象必须要有id,作为该条数据在该项数组中的唯一标识，value作为显示值，parentId是可选属性，作为关联的标志
			数据形如：
			var iosProvinces = [
                            {'id': '130000', 'value': '河北省', 'parentId': '0'}
			];
			var iosCitys = [
			    {"id":"130100","value":"石家庄市","parentId":"130000"},
			];
			当我们选择河北省时，就到城市中找到parentId为河北省id的数据，然后展示出来
			
		options.callback(selectOneObj, selectTwoObj, selectThreeObj, selectFourObj, selectFiveObj) 每级选中项，包含对应数据的所有字段及dom对象
		    如果是方法：
		    传入一个方法，在方法中获取数据
		    数据形如：
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
		    如果是异步获取数据，比如ajax获取数据，请使用方法，如果想有加载中效果，可设置showLoading: true
		    具体可参考demo中的日期选择器和日期时间选择器
		    
	    -----------------------------------------------------------------------------
##以地址选择为例：##
##data为三个数组：##
http://zhoushengfe.com/iosselect/demo/three/area.html

	    --------------------------------------------------------------------------------
##日期选择器##
##data为方法：##
http://zhoushengfe.com/iosselect/demo/datepicker/date.html

            --------------------------------------------------------------------------------
##demo说明
一级级联，银行选择

http://zhoushengfe.com/iosselect/demo/one/bank.html

二级级联，三国杀将领组合选

http://zhoushengfe.com/iosselect/demo/two/sanguokill.html

三级级联，省市区选择

http://zhoushengfe.com/iosselect/demo/three/area.html

viewport缩放时处理方案

http://zhoushengfe.com/iosselect/demo/rem/bank.html

日期选择器 三级联动，通过方法获取数据，并且有加载中效果

http://zhoushengfe.com/iosselect/demo/datepicker/date.html

日期时间选择器，共五级，通过方法获取数据

http://zhoushengfe.com/iosselect/demo/five/time.html 
    
###如果要修改菜单项里样式，请自行修改样式，比如：

.ios-select-widget-box ul li  

###如果要设置页面默认选中值，可以将默认值写在html元素中，以地址选择器为例：

```html
<span data-city-code="510100" data-province-code="510000" data-district-code="510105" id="show_contact">四川省 成都市 青羊区</span>
```

页面就有默认选项啦



 如果有使用问题，可加QQ群：419468553
