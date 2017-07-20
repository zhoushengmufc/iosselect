/*
* @Author: william
* @Date:   2017-07-19 15:04:19
* @Last Modified by:   pengweifu
* @Last Modified time: 2017-07-20 08:47:39
*/
require.config({
  baseUrl:'/iosselect/demo/ajax/angular/',
  map:{
  '*': {
    'css': 'assets/requirecss/css'
  }
  },
  paths:{
    'angular':'assets/angular/angular.min',
    'angular-ui-router':'assets/angular-ui-router/angular-ui-router.min',
    'angular-async-loader':'assets/angular-async-loader/angular-async-loader.min',
    'IosSelect':'assets/IosSelect/iosSelect',
  },
  shim:{
    'angular':{exports:'angular'},
    'angular-ui-router':{deps:['angular']},
    'angular-async-loader':{deps:['angular']},
    'IosSelect':{deps:['css!assets/IosSelect/iosSelect.css']}
  }
});
require(['angular','./app-routes'],function(angular){
  angular.element(document).ready(function(){
    angular.bootstrap(document,['app']);
    angular.element(document).find('html').addClass('ng-app');
  });
});