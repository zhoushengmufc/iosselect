/*
* @Author: william
* @Date:   2017-07-19 15:04:04
* @Last Modified by:   pengweifu
* @Last Modified time: 2017-07-19 21:56:54
*/
define(function (require, exports, module) {
    var angular = require('angular');
    var asyncLoader = require('angular-async-loader');

    require('angular-ui-router');

    var app = angular.module('app', ['ui.router']);

    // initialze app module for angular-async-loader
    asyncLoader.configure(app);

    module.exports = app;
});