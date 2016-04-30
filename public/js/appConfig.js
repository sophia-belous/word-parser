(function() {
	'use strict';
	angular.module('app').config(appConfig)
                        .value('workers', [])
                        .run(appRun)
                        ;
	
	function appConfig($stateProvider, $locationProvider, RestangularProvider, $httpProvider) {
        
		RestangularProvider.setBaseUrl('/api');
        $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'views/home.html',
                    controller: 'HomeController'
                })
                .state('done', {
                    url: '/done',
                    templateUrl: 'views/done.html',
                    controller: 'HomeController'                    
                })
                ;
                
        $httpProvider.defaults.headers.post = {};  
        $locationProvider.html5Mode(true);       
	}
    
    function appRun(Home, workers) {
        Home.getIps().then(function(ips) {
            ips.forEach(function(ip) {
                workers.push(ip);
            });
		});
    }
})();