(function() {
	'use strict';
	angular.module('home').controller('HomeController', HomeController);
	
	function HomeController($scope, $rootScope, Home, workers) {
		var wordsSeparator = ' ';
		var chunkSize = 100;
		 $scope.word = '';
		
		$scope.onSubmit = function() {
			readAllFile();
        };
		
		var workersQueue = [];
		//
		function sendToNextFreeWorker(words) {
			var serviceAddress = workersQueue.shift();
			sendToWorker(words, serviceAddress);
		}
		
		var nextWorkerIndex = 0;
		//
		function sendToNextWorker(words) {
			var serviceAddress = workers[nextWorkerIndex++ % workers.length];
			sendToWorker(words, serviceAddress);
		}
		
		function sendToWorker(words, address) {
			console.log(address);
			Home.validateWord(address, words).then(function(result) {		
				Home.saveWord(result);
				workersQueue.push(address);
				$rootScope.$broadcast('requestFinished', address);
			});						
		}
		
		function readAllFile() {            
            var file = document.getElementById('input').files[0];
            var fileSize = file.size;
            var startIndex = 0;
            
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
					console.log(words);
                    
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
			}
            
            readNextChunk();
        }
	}
})();