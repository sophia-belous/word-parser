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
		$scope.wordsLength = 0;
		$scope.ips = [];
		
		Home.getIps().then(function(data) {
			$scope.ips = data.plain();
		})
		
		$scope.sendWithSocket = function (msg) {
			socket.emit("something", msg);
		}
		
		socket.on("chunks", function (data) {
			$scope.validWords = data.validWords;
			$scope.invalidWords = data.invalidWords;
			$scope.progress += data.progress;
			if($scope.fileSize)
				$scope.percent = $scope.progress / $scope.fileSize * 100;
			else
				$scope.percent = $scope.progress / $scope.wordsLength * 100;
		});
		
		socket.on("wordlength", function(data) {
			$scope.wordsLength = data.wordsLength;
		})
		
		$scope.uploadFile = function(txtFile) {       
			Home.uploadFile(txtFile).then(function(response) {
				$scope.fileName = response.plain().fileName;
				$scope.fileSize = response.plain().fileSize;
			});
		};  
		
		$scope.checkFileWords = function() {
			Home.clearResultFile();	
			Home.validateWord($scope.fileName).then(function() {
				console.log("doooooone")
			});
		} 
		
		$scope.checkWords = function() {
			Home.clearResultFile();	
			Home.validateInputWord($scope.words).then(function() {
				console.log("doooooone")
			});;
        };
	}
})();