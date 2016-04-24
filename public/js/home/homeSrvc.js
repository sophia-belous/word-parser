(function() {
	'use strict';
	angular.module('home')
		.factory('Home', Home);

	function Home(ConfiguredRestangular, $http) {
		return {
			getIps: getIps,
            validateWord: validateWord,
            saveWord: saveWord
		};
		           
		function getIps() {
			return ConfiguredRestangular.all('workers').getList();
		}
        
        function validateWord(ip, words) {
            return $http({
                method: 'POST',
                url: ip + '/api/validation/word',
                data: JSON.stringify({words : words}),
                headers: {'Content-Type': 'application/json'}
            });
        }
        
        function saveWord(wordData) {
            return $http({
                method: 'POST',
                url: '/api/words',
                data: JSON.stringify(wordData),
                headers: {'Content-Type': 'application/json'}
            });
        }
	}
})();