/*
* @Author: william
* @Date:   2017-07-19 16:26:58
* @Last Modified by:   pengweifu
* @Last Modified time: 2017-07-19 16:44:19
*/
define(function (require) {
    var app = require('../app');

    app.controller('homeCtrl', ['$scope', function($scope) {
        $scope.name = 'Home';
    }]);
});