(function() {
	'use strict';
	angular.module('home')
		.factory('Home', Home);

	function Home(ConfiguredRestangular) {
		return {
			uploadFile: uploadFile
		};
 
		           
		function uploadFile(files) {
			var formData = new FormData();
			angular.forEach(files,function(obj){
                formData.append('file', obj.lfFile);
            });
			
			return ConfiguredRestangular.all('uploads')
				.withHttpConfig({transformRequest: angular.identity})
				.customPOST(formData, undefined, undefined, {'Content-Type': undefined });
		}
	}
})();