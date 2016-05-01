(function() {
	'use strict';
	angular.module('home')
		.factory('Home', Home);

	function Home(ConfiguredRestangular, $http) {
		return {
			getIps: getIps,
            validateWord: validateWord,
            clearResultFile: clearResultFile,
            uploadFile: uploadFile,
            validateInputWord: validateInputWord
		};
		           
		function getIps() {
			return ConfiguredRestangular.all('workers').getList();
		}
        
        function validateWord(fileName) {
            return $http({
                method: 'POST',
                url: '/api/validation/file',
                data: JSON.stringify({fileName : fileName}),
                headers: {'Content-Type': 'application/json'}
            });
        }
        
        function validateInputWord(wordData) {
            return $http({
                method: 'POST',
                url: '/api/validation/words',
                data: JSON.stringify({wordString: wordData}),
                headers: {'Content-Type': 'application/json'}
            });
        }
        
        function clearResultFile() {
            return $http({
                method: 'DELETE',
                url: '/api/words'
            });
        }
        
        function uploadFile(file) {
			var formData = new FormData();
			formData.append('file', file);
			
			return ConfiguredRestangular.all('uploads')
				.withHttpConfig({transformRequest: angular.identity})
				.customPOST(formData, undefined, undefined, {'Content-Type': undefined });
		}
	}
})();