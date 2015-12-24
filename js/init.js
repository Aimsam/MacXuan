var lifestealer = angular.module('lifestealer', [
    'ngRoute'
]).
    config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'pages/home.html',
                    controller: 'MainCtrl'
                })
            ;
        }]);