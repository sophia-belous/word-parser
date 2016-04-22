(function() {
	'use strict';
	angular.module('home').controller('HomeController', HomeController);
	
	function HomeController($scope, $http) {
		 $scope.testline = 'Home';
	}
})();