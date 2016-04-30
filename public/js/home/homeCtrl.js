(function() {
	'use strict';
	angular.module('home').controller('HomeController', HomeController);
	
	function HomeController($scope, Home, $state, socket) {
		$scope.fileName = "";
		$scope.words = "";
		$scope.percent = 0;
		$scope.progress = 0;
		$scope.validWords = 0;
		$scope.invalidWords = 0;
		
		$scope.sendWithSocket = function (msg) {
			socket.emit("something", msg);
		}
		
		socket.on("chunks", function (data) {
			$scope.validWords = data.validWords;
			$scope.invalidWords = data.invalidWords;
			$scope.progress += data.progress;
			$scope.percent = $scope.progress / $scope.fileSize * 100;
		});
		
		$scope.uploadFile = function(txtFile) {       
			Home.uploadFile(txtFile).then(function(response) {
				$scope.fileName = response.plain().fileName;
				$scope.fileSize = response.plain().fileSize;
			});
		};  
		
		$scope.checkFileWords = function() {
			Home.validateWord($scope.fileName).then(function() {
				console.log("doooooone")
			});
		} 
		
		$scope.checkWords = function() {
			valideteInputWord($scope.words);
        };
	}
})();