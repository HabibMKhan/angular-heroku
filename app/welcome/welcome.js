'use strict';
// const request = require('request');

angular.module('webApp.welcome', ['ngRoute', 'firebase'])

.config(['$routeProvider', function($routeProvider){
	$routeProvider.when('/welcome',{
		templateUrl: 'welcome/welcome.html',
		controller: 'WelcomeCtrl'
	});
}])

.controller('WelcomeCtrl', ['$scope', 'CommonProp', '$firebaseArray', '$firebaseObject', '$location',
	function($scope, CommonProp, $firebaseArray, $firebaseObject, $location){
	// Set Up
	$scope.showAdminPanel = false;
	$scope.username = CommonProp.getUser();

	// Username Check If Administrator
	if(!$scope.username){
		$location.path('/home');
	} else if ($scope.username === 'habibmkhan92@gmail.com' || $scope.username === 'david.AS1337@gmail.com') {
		$scope.showAdminPanel = true;
		// $scope.$digest();
	}

	var donationsRef = firebase.database().ref().child('Donations');
	$scope.donations = $firebaseArray(donationsRef);
	const length = $scope.donations.length - 1;
	let x = $scope.donations;
	console.log('yo heres $scope.donations: ', $scope.donations);
	console.log('yo heres $scope.donations.length: ', $scope.donations.length);
	console.log('yo heres x.length: ', x.length);
	$scope.donationsData = $scope.donations[3];

	donationsRef.on("value", function(snapshot) {
		console.log('hey', snapshot.val());
		let obj = snapshot.val();
		let keys = Object.keys(obj);
		let chosenKey = keys[keys.length - 1];
		let myData = obj[chosenKey];
		$scope.donationsData = obj[chosenKey];
		console.log('obj', obj);
		console.log('keys', keys);
		console.log('chosenKey', chosenKey);
		console.log('myData', myData);
	}, function (error) {
		console.log("Error: " + error.code);
	});

	var ref = firebase.database().ref().child('Articles');
	$scope.articles = $firebaseArray(ref);

	$scope.updateDonationsDB = (donationsArray) => {
		let donationsFromDB = $scope.donations;
		let missingDonations = _.differenceWith(donationsArray, donationsFromDB, _.isEqual);
		console.log('missingDonations', missingDonations);
		console.log('donationsFromDB', donationsFromDB);
		console.log('donationsFromDB.length', donationsFromDB.length);
		const size = donationsFromDB.length - 1;
		console.log('donationsFromDB[size]', donationsFromDB[size]);
		console.log('donationsFromDB[donationsFromDB.length-1]', donationsFromDB[donationsFromDB.length-1]);
		// if (missingDonations.length) {
		// 	$scope.donations.$add(missingDonations)
		// 	.then((ref) => {
		// 		console.log(ref);
		// 		$scope.success = true;
		// 		window.setTimeout(function() {
		// 			$scope.$apply(function(){
		// 				$scope.success = false;
		// 			});
		// 		}, 2000);
		// 	}, function(error){
		// 		console.log(error);
		// 	});
		// }
	};

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

	$scope.getStreamLabsToken = () => {
		console.log('getting stream labs token...');
	  let z = $location.absUrl();
		// gets kfgwkekgrbegrwerjgn from => "Blahblah?code=kfgwkekgrbegrwerjgn#/dfsknsnd";
	  let permissionsCode = z.split("?code=");
	  permissionsCode = permissionsCode[1].split("#/")[0];

		const requestBody = {
			client_id: appConfig['STREAMLABS'].client_id,
			client_secret: appConfig['STREAMLABS'].client_secret,
			redirect_uri: appConfig['STREAMLABS'].redirect_uri,
			grant_type: appConfig['STREAMLABS'].grant_type
		};
		Object.assign(requestBody, { code: permissionsCode } );

		let myHeaders = new Headers();
		// myHeaders.append('grant_type', 'authorization_code');
		myHeaders.append('Content-Type', 'application/json');
		myHeaders.append('Accept', 'application/json');
		console.log('myHeaders', myHeaders);
		console.log('permissionsCode', permissionsCode);
		myHeaders.append('Access-Control-Allow-Origin', 'http://localhost:8000');
		// myHeaders.append('Origin', 'http://localhost:8000');
		myHeaders.append('Access-Control-Request-Method', 'POST');
		myHeaders.append('Access-Control-Request-Headers', 'Access-Control-Allow-Origin, Content-Type');

		const proxyurl = "https://cors-anywhere.herokuapp.com/";
		// let url = "https://streamlabs.com/api/v1.0/token";
		let url = proxyurl + "https://streamlabs.com/api/v1.0/token";
		console.log('url used', url);

		let requestOptions = {
			url: url,
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify(requestBody),
			mode: 'cors',
			cache: 'default'
		}
		console.log('Just set up requestBody to contain: ', requestBody);

		fetch(url, requestOptions).then((response) => {
			// console.log(response.blob());
			// console.log(response);
			return response.json();
		}).then((data) => {
			console.log('look at the data i found!!!!', data);
			if (data.access_token) {
				console.log('Using access token: ', data.access_token);
				$scope.access_token = data.access_token;
			}
		}).catch((error) => {
			console.log('error was: ', error);
		});
	}

	$scope.getSLDonations = () => {
		let url = "https://streamlabs.com/api/v1.0/donations?access_token=" + $scope.access_token;
		console.log('url used', url);

		let myHeaders = new Headers();
		console.log('myHeaders', myHeaders);
		// myHeaders.append('Access-Control-Allow-Origin', '*');

		let requestOptions = {
			method: 'GET',
			headers: myHeaders,
			mode: 'cors',
			cache: 'default'
		};

		fetch(url, requestOptions).then((response) => {
			return response.json();
		}).then((responseData) => {
			$scope.donationsData = responseData.data;
			$scope.username = 'Habib!';
			$scope.$digest();
			console.log('responseData', responseData);
			console.log('now that we have data... lets update DB');
			$scope.updateDonationsDB(responseData.data);
		}).catch((error) => {
			console.log('error was: ', error);
		});
	}





}])
