(function() {
	'use strict';
	angular.module('home').controller('HomeController', HomeController);
	
	function HomeController($scope, $rootScope, Home, workers) {
		var wordsSeparator = ' ',
			chunkSize = 10000;
		Home.clearResultFile();	
		 $scope.words = [];
		 $scope.percent = 0;
		 $scope.validWords = 0;
		 $scope.invalidWords = 0;
		
		$scope.checkFileWords = function() {
			// Home.clearResultFile();
			readAllFile();
        };
		
		$scope.checkWords = function() {
			// Home.clearResultFile();
			readAllText();
        };
		
		// $scope.removeCheckedWords = function() {
		// 	Home.clearResultFile();
		// };
		
		var workersQueue = [];
		function sendToNextFreeWorker(words) {
			var serviceAddress = workersQueue.shift();
			sendToWorker(words, serviceAddress);
		}
		
		var nextWorkerIndex = 1;
		function sendToNextWorker(words) {
			var serviceAddress = workers[nextWorkerIndex++ % workers.length];
			sendToWorker(words, serviceAddress);
		}
		
		function sendToWorker(words, address) {
			console.log(address);
			Home.validateWord(address, words).then(function(result) {		
				Home.saveWord(result);
				for(var i = 0; i < result.data.words.length; i++) {
					var resultWord = result.data.words[0];
					if(resultWord.status) {
						$scope.validWords++;
					} else {
						$scope.invalidWords++;
					}
				}
				workersQueue.push(address);
				$rootScope.$broadcast('requestFinished');
			});						
		}
		
		function readAllText() {
			var words = $scope.words.split(wordsSeparator).filter(function(el) {return el.length != 0}),
				startIndex = 0,
				wordsCount = words.length,
				wordsLength = words.length,
				splicedWords;
				
			$scope.percent = 0;
			$scope.validWords = 0;
			$scope.invalidWords = 0;
			$scope.words = [];
			
				
			var initialRequestsCount = workers.length;
			
			function checkNextWords() {
			
				if (initialRequestsCount) {
					initialRequestsCount--;
					sendToNextWorker(splicedWords);
					if(initialRequestsCount) {
						getNextWords();
					}
				} else {
					sendToNextFreeWorker(splicedWords);
				}
				
			}
			
			function getNextWords() {
				if (!wordsCount) {
					return;
				}
				
				if (wordsCount < 20) {
					splicedWords = words.splice(startIndex, wordsCount);
					wordsCount = 0; 					
				} else {
					splicedWords = words.splice(startIndex, 20); 
					wordsCount -= 20;
				}
				checkNextWords(); 
			}
			
			$rootScope.$on('requestFinished', onRequestFinished);
			
			function onRequestFinished() {
				getNextWords()
				$scope.percent = (wordsLength - words.length) / wordsLength * 100;
			}
			
			getNextWords();			
		}
		
		function readAllFile() {            
            var file = document.getElementById('input').files[0];
            var fileSize = file.size;
            var startIndex = 0;
			$scope.percent = 0;
			$scope.validWords = 0;
			$scope.invalidWords = 0;
			
            
            var wordsStack = [];
            var initialRequestsCount = workers.length;
            
            var isInitial = true; 
            var chunkReading = false;        
            
            function onloadend(evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    var isLastChunk = (startIndex + chunkSize > fileSize) ? true : false;
                    var textChunk = evt.target.result.replace( /\n/g, ' ').replace( /\r/g, '');
                    var readChunkSize = textChunk.length;
                    
                    if (!isLastChunk) {
                        var indexOfLastWord = textChunk.lastIndexOf(wordsSeparator);                        
                        if (indexOfLastWord > 0) {
                            textChunk = textChunk.slice(0, indexOfLastWord);
                            readChunkSize = indexOfLastWord;
                        }
                    }
                    
					var words = textChunk.split(wordsSeparator).filter(function(el) {return el.length != 0});
                    startIndex += readChunkSize;
                    
					if (initialRequestsCount) {
						initialRequestsCount--;
						sendToNextWorker(words);
						if(initialRequestsCount)
							readNextChunk();
					} else {
						sendToNextFreeWorker(words);
					}
                }
            };
        
            function readNextChunk(params) {
                if (startIndex >= fileSize) {
                    return;
                }
                var reader = new FileReader();
                reader.onloadend = onloadend;
                var chunk = file.slice(startIndex, startIndex + chunkSize);
                reader.readAsBinaryString(chunk);   
            }
			
			$rootScope.$on('requestFinished', onRequestFinished);
			
			function onRequestFinished(event, args) {
				readNextChunk();
				$scope.percent = startIndex / fileSize * 100;
			}
            
            readNextChunk();
        }
	}
})();