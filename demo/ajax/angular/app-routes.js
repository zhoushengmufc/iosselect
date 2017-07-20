/*
* @Author: william
* @Date:   2017-07-19 15:04:38
* @Last Modified by:   pengweifu
* @Last Modified time: 2017-07-20 08:44:58
*/
define(function (require) {
    var app = require('./app');
    app.run(['$state', '$stateParams', '$rootScope', function ($state, $stateParams, $rootScope) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'home/home.html',
                // new attribute for ajax load controller
                controllerUrl: 'home/homeCtrl',
                controller: 'homeCtrl'
            })
            .state('components', {
                url: '/components',
                templateUrl: 'components/components.html',
                // new attribute for ajax load controller
                controllerUrl: 'components/componentsCtrl',
                controller: 'componentsCtrl'
            });
    }]);
});