'use strict';

angular.module('webApp.welcome', ['ngRoute', 'firebase'])

.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/welcome',{
		templateUrl: 'welcome/welcome.html',
		controller: 'WelcomeCtrl'
	});
}])

.controller('WelcomeCtrl', ['$scope', 'CommonProp', '$firebaseArray', '$firebaseObject', '$location',
	function($scope, CommonProp, $firebaseArray, $firebaseObject, $location){
	$scope.username = CommonProp.getUser();

	if(!$scope.username){
		$location.path('/home');
	}

	var ref = firebase.database().ref().child('Articles');
	$scope.articles = $firebaseArray(ref);

	$scope.editPost = function(id){
		var ref = firebase.database().ref().child('Articles/' + id);
		$scope.editPostData = $firebaseObject(ref);
	};

	$scope.updatePost = function(id){
		var ref = firebase.database().ref().child('Articles/' + id);
		ref.update({
			title: $scope.editPostData.title,
			post: $scope.editPostData.post
		}).then(function(ref){
			$scope.$apply(function(){
				$("#editModal").modal('hide');
			});
		}, function(error){
			console.log(error);
		});
	};

	$scope.deleteCnf = function(article){
		$scope.deleteArticle = article;
	};

	$scope.deletePost = function(deleteArticle){
		$scope.articles.$remove(deleteArticle);
		$("#deleteModal").modal('hide');
	};

	$scope.logout = function(){
		CommonProp.logoutUser();
	};

	$scope.getToken = () => {
		console.log('Yo it\'s Habib!');
		const TWITCH_INFO = {
			client_id: 'sdGTj9jKWwjI1mlfu9jZf2AFxzJS99HxL7PWNKad',
			redirect_uri: 'https://angular-firebase-habib.herokuapp.com/#/welcome'
		};
		let tokenConfig = {
			'client_id': TWITCH_INFO['client_id'],
      'redirect_uri': TWITCH_INFO['redirect_uri'],
      'response_type': 'code',
      'scope': 'donations.read'
		};

		console.log('Just set up token config to contain: ', tokenConfig);
		var data = JSON.stringify(true);

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;

		xhr.addEventListener("readystatechange", function () {
		  if (this.readyState === this.DONE) {
		    console.log(this.responseText);
		  }
		});
		let qs = `response_type=${tokenConfig.response_type}&client_id=${tokenConfig.client_id}&redirect_uri=${tokenConfig.redirect_uri}&scope=${tokenConfig.scope}`

		let url = "https://streamlabs.com/api/v1.0/authorize?" + qs;
		console.log('url used', url);
		// xhr.open("GET", "https://api.twitch.tv/kraken/oauth2/authorize?response_type=token%20id_token&client_id=yprajwgtjud39lbdvgv4lqgoq0qbwt&redirect_uri=https://angular-firebase-habib.herokuapp.com&scope=viewing_activity_read" );
		// xhr.open("GET", "https://api.twitch.tv/kraken/oauth2/authorize?client_id=yprajwgtjud39lbdvgv4lqgoq0qbwt" );
		xhr.open("POST", "https://api.twitch.tv/kraken/oauth2/token?client_id=yprajwgtjud39lbdvgv4lqgoq0qbwt&client_secret=fj4ni7pgrhmot62fvlwgrofv6mgjrf&grant_type=client_credentials", true );

		xhr.send(data);
		console.log('data received', data);

		xhr.onreadystatechange = function() {//Call a function when the state changes.
	    if(xhr.status == 200) {
	        console.log('xhr from ', xhr);
					alert(xhr.responseText);
	    }
		}
		console.log('xhr', xhr);
	}

		// https://api.twitch.tv/kraken/oauth2/authorize?response_type=token+id_token&client_id=yprajwgtjud39lbdvgv4lqgoq0qbwt&redirect_uri=https://angular-firebase-habib.herokuapp.com/#/welcome&scope=viewing_activity_read
























}])
