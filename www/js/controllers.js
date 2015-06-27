'use strict';
var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('activities', {
        url: '/',
        template: '<h1>teste</h1>',
        controller: 'indexController'
    }).state('state1', {
        url:'/state1',
        template: '<h1>state1</h1>'
    });
    $locationProvider.html5Mode(true);
});

app.factory('getService', ['$http', function($http){
    return $http.get('../js/data.json');
    //return $http.get('http://fiware-porto.citibrain.com/v1/contextEntityTypes/EnvironmentEvent?key=hackacityporto2015_browser');
}]);

app.controller('indexController', ['getService', '$scope', function(getService, $scope) {
    $scope.activities = [
        {"name": "Football"},
        {"name": "Kite Surf"},
        {"name": "Beach Volley"},
        {"name": "Run"},
        {"name": "Cycle"},
        {"name": "Skate"},
    ];

    $scope.teste = getService;
    console.log($scope.teste);
}]);
