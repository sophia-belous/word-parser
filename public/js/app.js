(function() {
	'use strict';
	angular.module('app', [
		'restangular',
		'btford.socket-io',
		'ui.router',
		'ngMaterial',
		'ngMessages',
        'home',
		'file-model'
	]);
})();