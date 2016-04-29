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
    
    rem------手机端部分解决方案会使用viewport缩放，这个时候我们需要添加一些样式，页面在缩放的情况下正常显示
##使用说明
    ###API
    new IosSelect(level, data, options)
    level: 选择的层级 1 2 3 最多支持3层
	data: [oneLevelArray[, twoLevelArray[, threeLevelArray]]]
	options:
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
	####参数说明
	level: 级联等级，支持1,2,3 必选项
	data: 数组，前三项分别对应级联1,2,3项，每一项又是一个数组，如果是一级下拉菜单，data长度为1
	    
	    每一项数组中包含一系列对象，每个对象必须要有id,作为该条数据在该项数组中的唯一标识，parentId是可选属性，作为关联的标志
	options.callback(selectOneObj[[, selectTwoObj], selectThreeObj]) 每个级联选中项，包含对应数据的所有字段及dom对象
    ####以地址选择为例：
    data为三个数组：
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
##demo说明
一级级联，银行选择

http://zhoushengfe.com/iosselect/demo/one/bank.html

二级级联，三国杀将领组合选

http://zhoushengfe.com/iosselect/demo/two/sanguokill.html

三级级联，省市区选择

http://zhoushengfe.com/iosselect/demo/three/area.html

viewport缩放时处理方案

http://zhoushengfe.com/iosselect/demo/rem/bank.html
    
    
