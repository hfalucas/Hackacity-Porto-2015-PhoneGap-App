'use strict';
var app = angular.module('app', []);

app.factory('getService', ['$http', function($http){
    return $http.jsonp('https://fiware-porto.citibrain.com/v1/contextEntityTypes/EnvironmentEvent?key=hackacityporto2015_browser?callback=JSON_CALLBACK')
}]);
