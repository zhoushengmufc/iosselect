# iosselect
#webapp模仿ios下拉菜单  
html下拉菜单select在安卓和IOS下表现不一样，iosselect正是为统一下拉菜单样式而生

我们以IOS下select的交互和样式为蓝本，开发了这一组件

##特点
可以做到0依赖，只需引用一个js和css即可，样式可自己定制，也可使用默认样式
##文件说明
src------iosselect基于iscroll5开发，在这个文件夹下可以看到iscroll.js,iosselect.js,iosselect.css，如果项目里有单独使用iscroll5,可以使用这个版本

merge------合并了iscroll与iosselect,做到组件0依赖，方便开发

demo------使用demo,说明如下：

    one------一级下拉菜单，以银行选择为实例
    
    two------二级下拉菜单，相互独立，没有关联，以三国杀组合选将为例
    
    three------三级下拉菜单，省市区选择三级联动
    
    rem------rem框架adaptivejs的特定版本
    
    datepicker------时间选择器，通过方法筛选数据，实现三级联动，ajax获取数据时可参考此例
##使用说明##
###API##
	    new IosSelect(level, data, options)
	    level: 选择的层级 1 2 3 最多支持3层
		data: [oneLevelArray[, twoLevelArray[, threeLevelArray]]] 除了用数组，也可以用方法
		options:
		     container: 组件的父元素，传入css3选择器，比如'.a' 或 '#a'之类的
		     callback: 选择完毕后的回调函数 必选
		     title: 选择框title  可选，没有此参数则不显示title
		     itemHeight: 每一项的高度，可选，默认 35px
		     headerHeight: 组件标题栏高度 可选，默认 44px
		     addClassName: 组件额外类名 可选，用于自定义样式
		     oneTwoRelation: 第一列和第二列是否通过parentId关联 可选，默认不关联
		     twoThreeRelation: 第二列和第三列是否通过parentId关联 可选，默认不关联
		     oneLevelId: 第一级选中id 可选
		     twoLevelId: 第二级选中id 可选
		     threeLevelId: 第三级选中id 可选
		     showLoading: 如果你的数据是异步加载的，可以使用该参数设置为true，下拉菜单会有加载中的效果
##参数说明##
		level: 级联等级，支持1,2,3 必选项
		data: 数组，前三项分别对应级联1,2,3项，每一项又是一个数组或方法，如果是一级下拉菜单，data长度为1
		    如果是数组：
		        每一项数组中包含一系列对象，每个对象必须要有id,作为该条数据在该项数组中的唯一标识，parentId是可选属性，作为关联的标志
		options.callback(selectOneObj[[, selectTwoObj], selectThreeObj]) 每个级联选中项，包含对应数据的所有字段及dom对象
		    如果是方法：
		    传入一个方法，在方法中获取数据
	    -----------------------------------------------------------------------------
##以地址选择为例：##
##data为三个数组：##
http://zhoushengfe.com/iosselect/demo/three/area.html

	    // 省份列表
	    var iosProvinces = [
	        {'id': '130000', 'value': '河北省', 'parentId': '0'}
	    ];
	
	    // 城市列表
	    var iosCitys = [
	        {"id":"130100","value":"石家庄市","parentId":"130000"}
	    ];
	
	    // 区县列表
	    var iosCountys = [
	        {"id":"130102","value":"长安区","parentId":"130100"}
	    ];
	    实例化：
	    var iosSelect = new IosSelect(3, 
	            [iosProvinces, iosCitys, iosCountys],
	            {
	                title: '地址选择',
	                itemHeight: 35,
	                oneTwoRelation: 1,
	                twoThreeRelation: 1,
	                oneLevelId: oneLevelId,
	                twoLevelId: twoLevelId,
	                threeLevelId: threeLevelId,
	                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
	                    selectOneObj = {
	                        atindex:26,
	                        dom:li.at,
	                        id:"510000",
	                        parentid:"0",
	                        value:"四川省"
	                    }
	                }
	        });
	    --------------------------------------------------------------------------------
##日期选择器##
##data为方法：##
http://zhoushengfe.com/iosselect/demo/datepicker/date.html

	    var selectDateDom = $('#selectDate');
    var showDateDom = $('#showDate');
    // 初始化时间
    var now = new Date();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDate = now.getDate();
    showDateDom.attr('data-year', nowYear);
    showDateDom.attr('data-month', nowMonth);
    showDateDom.attr('data-date', nowDate);
    // 数据初始化
    function formatYear (nowYear) {
        var arr = [];
        for (var i = nowYear - 5; i <= nowYear + 5; i++) {
            arr.push({
                id: i + '',
                value: i + '年'
            });
        }
        return arr;
    }
    function formatMonth () {
        var arr = [];
        for (var i = 1; i <= 12; i++) {
            arr.push({
                id: i + '',
                value: i + '月'
            });
        }
        return arr;
    }
    function formatDate (count) {
        var arr = [];
        for (var i = 1; i <= count; i++) {
            arr.push({
                id: i + '',
                value: i + '日'
            });
        }
        return arr;
    }
    var yearData = function(callback) {
        setTimeout(function() {
            callback(formatYear(nowYear))
        }, 2000)
    }
    var monthData = function (year, callback) {
        setTimeout(function() {
            callback(formatMonth());
        }, 2000);
    };
    var dateData = function (year, month, callback) {
        setTimeout(function() {
            if (/^1|3|5|7|8|10|12$/.test(month)) {
                callback(formatDate(31));
            }
            else if (/^4|6|9|11$/.test(month)) {
                callback(formatDate(30));
            }
            else if (/^2$/.test(month)) {
                if (year % 4 === 0 && year % 100 !==0 || year % 400 === 0) {
                    callback(formatDate(29));
                }
                else {
                    callback(formatDate(28));
                }
            }
            else {
                throw new Error('month is illegal');
            }
        }, 2000);
        // ajax请求可以这样写
        /*
        $.ajax({
            type: 'get',
            url: '/example',
            success: function(data) {
                callback(data);
            }
        });
        */
    };
    selectDateDom.bind('click', function () {
        var oneLevelId = showDateDom.attr('data-year');
        var twoLevelId = showDateDom.attr('data-month');
        var threeLevelId = showDateDom.attr('data-date');
        var iosSelect = new IosSelect(3, 
            [yearData, monthData, dateData],
            {
                title: '地址选择',
                itemHeight: 35,
                oneTwoRelation: 1,
                twoThreeRelation: 1,
                oneLevelId: oneLevelId,
                twoLevelId: twoLevelId,
                threeLevelId: threeLevelId,
                showLoading: true,
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    showDateDom.attr('data-year', selectOneObj.id);
                    showDateDom.attr('data-month', selectTwoObj.id);
                    showDateDom.attr('data-date', selectThreeObj.id);
                    showDateDom.html(selectOneObj.value + ' ' + selectTwoObj.value + ' ' + selectThreeObj.value);
                }
        });
    });
##demo说明
一级级联，银行选择

http://zhoushengfe.com/iosselect/demo/one/bank.html

二级级联，三国杀将领组合选

http://zhoushengfe.com/iosselect/demo/two/sanguokill.html

三级级联，省市区选择

http://zhoushengfe.com/iosselect/demo/three/area.html

viewport缩放时处理方案

http://zhoushengfe.com/iosselect/demo/rem/bank.html

日期选择器

http://zhoushengfe.com/iosselect/demo/datepicker/date.html
    
    
    如果有使用问题，可加QQ群：419468553
    
    
如果要修改菜单项高度，请自行修改样式，比如：
.ios-select-widget-box ul li  
.ios-select-widget-box .cover-area1
.ios-select-widget-box .cover-area2

初始化的时候赋值给：itemHeight
