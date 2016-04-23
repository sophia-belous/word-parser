(function() {
	'use strict';
	angular.module('home').controller('HomeController', HomeController);
	
	function HomeController($scope, $rootScope, Home, workers) {
		 $scope.testline = 'Home';
		 $scope.word = '';
		
		$scope.onSubmit = function() {
			readAllFile();
        };
		
		function readAllFile() {            
            var file = document.getElementById('input').files[0];
            var fileSize = file.size;
            var startIndex = 0;
            var chunkSize = 100;
            var wordsSeparator = ' ';
            
            var wordsStack = [];
            var requestsCount = 15;
            var freeServices = [];
            
            var isInitial = true; 
            var chunkReading = false;        
            
            function onloadend(evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    var isLastChunk = (startIndex + chunkSize > fileSize) ? true : false;
                    var textChunk = evt.target.result.replace( /\n/g, ' ');
                    var readChunkSize = textChunk.length;
                    var words = textChunk.split(wordsSeparator).filter(function(el) {return el.length != 0});
                    
                    if (!isLastChunk) {
                        var indexOfLastWord = textChunk.lastIndexOf(wordsSeparator);                        
                        if (indexOfLastWord > 0) {
                            textChunk = textChunk.slice(0, indexOfLastWord);
                            readChunkSize = indexOfLastWord;
                        }
                    }
                    
                    words = textChunk.split(wordsSeparator).filter(function(el) {return el.length != 0});
                    wordsStack = wordsStack.concat(words);
                    
                    startIndex += readChunkSize;
                    
                    if (wordsStack.length < requestsCount && !isLastChunk) {
                        readNextChunk();
                    }
                    else if (isInitial){
                        isInitial = false;
                        processWords();
                    } else {
                        processNextWord();
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

            function processWords() {
                for (var i = 0; i < requestsCount; i++) {
                    processWord(wordsStack.shift(), workers[i % workers.length]);
                }
                if (wordsStack.length <= 5) {
                    readNextChunk();
                }
            }
            
            $rootScope.$on('requestFinished', onRequestFinished);
            
            function onRequestFinished(event, args) {
                freeServices.push(args);
                processNextWord();
            }
            
            function processNextWord() {
                var word = wordsStack.shift();
                var service = freeServices.pop();
                if (word) {
                    if (!service) {
                        wordsStack.push(word);
                    } else {
                        processWord(word, service);
                        if (wordsStack.length == 5) {
                            readNextChunk();
                        }
                    }                 
                }
            }
            
            function processWord(word, serviceAddress) {				
				Home.validateWord(serviceAddress, word).then(function(result) {
					Home.saveWord(result, function () {});
                    $rootScope.$broadcast('requestFinished', serviceAddress);
				});
            }
            
            readNextChunk();
        }
	}
})();