/*
 * @Author: william
 * @Date:   2017-07-19 16:26:58
 * @Last Modified by:   pengweifu
 * @Last Modified time: 2017-07-19 23:53:08
 */
define(function(require) {
    var app = require('../app');

    // dynamic load angular-ui-mask plugins for UI
    // require('angular-ui-mask');
    // app.useModule('ui.mask');
    var IosSelect=require('IosSelect');

    app.directive('ngIosselect', function() {
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                $element.on('click', function(e) {
                    var $element=e.target;
                    var bankId = $element.dataset['id'];
                    var bankName = $element.dataset['value'];
                    var data = [
                        {'id': '10001', 'value': '工商银行'},
                        {'id': '10002', 'value': '农业银行'},
                        {'id': '10003', 'value': '建设银行'},
                        {'id': '10004', 'value': '中国银行'},
                        {'id': '10005', 'value': '交通银行'},
                        {'id': '10006', 'value': '浦发银行'},
                        {'id': '10007', 'value': '上海银行'},
                        {'id': '10008', 'value': '汇丰银行'},

                        {'id': '10009', 'value': '光大银行'},
                        {'id': '10010', 'value': '招商银行'},
                        {'id': '10011', 'value': '中信银行'},
                        {'id': '10012', 'value': '民生银行'},
                        {'id': '10013', 'value': '平安银行'},
                        {'id': '10014', 'value': '华夏银行'},
                        {'id': '10015', 'value': '广发银行'},
                        {'id': '10016', 'value': '北京银行'}
                    ];

                    var bankSelect = new IosSelect(1, [data], {
                        container: '.container',
                        title: '银行卡选择',
                        itemHeight: 50,
                        itemShowCount: 3,
                        oneLevelId: bankId,
                        callback: function(selectOneObj) {
                            $element.value = selectOneObj.value;
                            $element.dataset['id'] = selectOneObj.id;
                            $element.dataset['value'] = selectOneObj.value;
                        }
                    });
                });
            },
        };
    });

    app.controller('componentsCtrl', ['$scope', function($scope) {
        $scope.name = 'UI Components';
    }]);

});