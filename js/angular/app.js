var download = angular.module('download', [
    'ngRoute',
    'downloadApp'
]);
download.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            }).
            when('/pan')
        ;
}]);