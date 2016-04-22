(function() {
	'use strict';
	angular.module('app').config(appConfig);
	
	function appConfig($stateProvider, $locationProvider, RestangularProvider) {
		RestangularProvider.setBaseUrl('/api');
        $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'views/home.html',
                    controller: 'HomeController'
                })
                ;
        $locationProvider.html5Mode(true);       
	}
})();