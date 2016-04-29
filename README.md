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
