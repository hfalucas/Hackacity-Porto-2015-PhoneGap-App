'use strict';
var app = angular.module('app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('activities', {
        url: '/activities',
        templateUrl: 'activities.html',
        controller: 'ActivitiesController'
    })
    .state('places', {
        url:'/places/:activity',
        templateUrl: 'places.html',
        controller: 'PlacesController'
    })
    .state('stats', {
        url: '/stats/:place',
        templateUrl: 'stats.html'
    })
    .state('create-event', {
        url: '/create-event',
        templateUrl: 'create-event.html'
    });
    $locationProvider.html5Mode(true);
});

app.factory('PlacesService', ['$http', function($http){
    return {
        getPlaces: function() {
            return $http.get('../js/data.json');
        }
    };
    //return $http.get('http://fiware-porto.citibrain.com/v1/contextEntityTypes/EnvironmentEvent?key=hackacityporto2015_browser');
}]);

app.controller('ActivitiesController', ['$scope', function($scope) {
    $scope.activities = [
        {
            "name": "Football",
            "code": "football" 
        },
        {
            "name": "Kite Surf",
            "code": "kite-surf"
        },
        {
            "name": "Beach Volley",
            "code": "beach-volley"
        },
        {
            "name": "Run",
            "code": "run"
        },
        {
            "name": "Cycle",
            "code": "cycle"
        },
        {
            "name": "Skate",
            "code": "skate"
        },
    ];        
}]);

app.controller('PlacesController', function($stateParams, $scope, PlacesService, $state) {
    var activity = $stateParams.activity;
    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng(41.1621429, -8.621853),
            panControl: false,
            panControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_LEFT
            },
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            scaleControl: false
    };
    $scope.map = new google.maps.Map(mapCanvas, mapOptions);

    PlacesService.getPlaces().then(function(places){
        angular.forEach(places.data.contextResponses, function(value, key){
            angular.forEach(value.contextElement.attributes, function(v, k) {
                switch(expression) {
                    case n:
                        code block
                        break;
                    case n:
                        code block
                        break;
                    default:
                        default code block
                }
                if (v.type == "coords") {
                    var split = v.value.split(',');
                    var latitude = split[0];
                    var longitude = split[1];
                    
                    var myLatlng = new google.maps.LatLng(latitude,longitude);
                          
                    var allMarkers = new google.maps.Marker({
                        position: myLatlng,
                        map: $scope.map,
                        title: 'Yo',
                    });
                    google.maps.event.addListener(allMarkers, 'click', function () {
                        $state.go('stats', {"place": value.contextElement.id });
                    });
                }
            });
        });
    });

});
