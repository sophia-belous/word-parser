(function() {
	'use strict';
	angular.module('home').controller('HomeController', HomeController);
	
	function HomeController($scope, Home) {
		 $scope.testline = 'Home';
		 
		 $scope.$watch('files.length',function(newVal,oldVal){
            console.log($scope.files);
        });
		
		$scope.onSubmit = function() {
            Home.uploadFile($scope.files).then(function(result) {
				console.log(result);
            }, function(err) {
				return err;
            });
        };
	}
})();