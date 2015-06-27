'use strict';
var app = angular.module('app', ['ui.router']);

var API_URL = 'http://hackacity.app:8000';

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('activities', {
        url: '/activities',
        templateUrl: 'activities.html',
        controller: 'ActivitiesController',
          access: {
            requiresLogin: true,
        }
    })
    .state('places', {
        url:'/places/:activity',
        templateUrl: 'places.html',
        controller: 'PlacesController',
        access: {
            requiresLogin: true,
        }
    })
    .state('stats', {
        url: '/stats/:place',
        templateUrl: 'stats.html',
        controller: 'StatsController',
        resolve: {
            hasEvent: function($http, $stateParams) {
              return $http.get(API_URL + '/locals/' + $stateParams.place + '/users').then(function(success) {
                console.log(success.data);
                    return success.data;
                }, function(errors) {
                    return errors.data;
                });
            }
        }
    })
    .state('create-event', {
        url: '/create-event/:local',
        templateUrl: 'create-event.html',
        controller: 'CreateEventsController',
        access: {
            requiresLogin: true,
        }
    })
    .state('login', {
        url: '/login',
        templateUrl: 'login.html',
        controller: 'AuthenticationController'
    });
    $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $state, AuthorizationService, $window) {
   $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    var authorized,
        currentUser = $window.localStorage.getItem('currentUser'),
        token = $window.localStorage.getItem('auth-token');
    if( (currentUser || token ) && (toState.name == 'login') ) {
      event.preventDefault();
      $state.go('activities');
    }
    if(toState.access !== undefined) {
      authorized = AuthorizationService.authorize(
        toState.access.requiresLogin
      );
      if(authorized === 'loginIsRequired' || authorized === 'notAuthorized') {
        event.preventDefault();
        $state.go('login');
      }
    }
   });
});

app.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});

app.factory('PlacesService', ['$http', function($http){
    return {
        getPlaces: function() {
            return $http.get('../js/data.json');
        }
    };
    //return $http.get('http://fiware-porto.citibrain.com/v1/contextEntityTypes/EnvironmentEvent?key=hackacityporto2015_browser');
}]);

app.factory('AuthenticationService', function($http, $window) {
    var store = $window.localStorage;
    return {
        login: function(credentials) {
          var login = $http.post(API_URL + '/login', credentials);
          return login;
        },

        logout: function() {
          store.removeItem('auth-token');
          store.removeItem('currentUser');
          store.removeItem('id');
        },

        createSession: function(response) {
          var user = response.data.user;
          store.setItem('auth-token', response.data.token);
          store.setItem('currentUser', JSON.stringify(user) );
          store.setItem('id', user.id);
        },

        getCurrentUser: function() {
          var user = store.getItem('currentUser');
          return user ? JSON.parse(user) : undefined;
        }
  };
})

app.factory('AuthorizationService', function(AuthenticationService, $window){
    return {
    authorize: function(requiresLogin, requiredPermissions, permissionType) {
      var result = 'authorized',
          user = AuthenticationService.getCurrentUser(),
          token = $window.localStorage.getItem('auth-token'),
          hasPermission = true;

      if(requiresLogin === true && user === undefined) {
        result = 'loginIsRequired';
      }else if( (requiresLogin === true && user !== undefined) &&
        (requiredPermissions === undefined || requiredPermissions.length === 0) ) {
        result = 'authorized';
      }
       
      return result;
    }
  };
});

app.factory('AuthInterceptor', function($window) {
    var store = $window.localStorage;
    return {
        request: function(config) {
            var token = store.getItem('auth-token');
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }
          return config;
        }
    };
});

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

    $scope.back = function() {
        $state.go('activities');
    };

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
            
            if (v.type == "coords") {
                    var split = v.value.split(',');
                    var latitude = split[0];
                    var longitude = split[1];
                    
                    var myLatlng = new google.maps.LatLng(latitude,longitude);
                          
                    var allMarkers = new google.maps.Marker({
                        position: myLatlng,
                        map: $scope.map,
                    });
                    google.maps.event.addListener(allMarkers, 'click', function () {
                        $state.go('stats', {"place": value.contextElement.id });
                    });
                }
            });
        });
    });
});

app.controller('StatsController', function($scope, PlacesService, $stateParams, $window, $http, hasEvent, $state) {
    var placeId = $stateParams.place;
    $scope.users = hasEvent;
    $scope.hasEvent = hasEvent.id ? true : false;

    $scope.back = function() {
        $window.history.back();
    }

    $scope.addEvent = function() {
        $state.go('create-event', {"local": placeId});
    }

    PlacesService.getPlaces().then(function(places) {
        angular.forEach(places.data.contextResponses, function(value, key){
            if( value.contextElement.id == placeId ) {
                $scope.stats = [
                    {
                        "name": "Carbon Monoxide",
                        "value": value.contextElement.attributes[3].value
                    },
                    {
                        "name": "Noise Level",
                        "value": value.contextElement.attributes[11].value
                    },
                    {
                        "name": "Solar Radiation",
                        "value": value.contextElement.attributes[10].value
                    },
                    {
                        "name": "Temperature",
                        "value": value.contextElement.attributes[1].value
                    },
                    {
                        "name": "Humidity",
                        "value": value.contextElement.attributes[2].value
                    },
                    {
                        "name": "Wind Speed",
                        "value": value.contextElement.attributes[9].value
                    }
                ];
            }
        });
    });
    
});

app.controller('CreateEventsController', function($scope, $http, AuthenticationService, $stateParams, $state) {
    $scope.events = {};
    $scope.createEvent = function(events) {
        events.user_id = AuthenticationService.getCurrentUser().id;
        events.local_id = $stateParams.local;
        $http.post(API_URL + '/events', events).then(function(response){
            $state.go('stats', {"place": $stateParams.local});
        });
    }


});

app.controller('AuthenticationController', function($scope, AuthenticationService, $state){

    $scope.authenticate = function(credentials) {
        console.log(credentials);
        AuthenticationService.login(credentials).then(function(success){
            AuthenticationService.createSession(success);
            $state.go('activities');
        }, function( error ) {
            $scope.errors = 'Email or Password Invalid.';
        });
    };
});
