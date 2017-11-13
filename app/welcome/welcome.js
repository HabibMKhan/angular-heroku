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

	// Login is required for this web app. TODO: Should we force log in?
	if(!$scope.username){
		$location.path('/home');
	} else if ($scope.username === 'habibmkhan92@gmail.com' || $scope.username === 'david.AS1337@gmail.com') {
		// Username Check If Administrator
		$scope.showAdminPanel = true;
	}

	var donationsRef = firebase.database().ref().child('Donations');
	$scope.donations = $firebaseArray(donationsRef);
	const length = $scope.donations.length - 1;
	let x = $scope.donations;
	console.log('yo heres $scope.donations: ', $scope.donations);
	console.log('yo heres $scope.donations.length: ', $scope.donations.length);
	console.log('yo heres x.length: ', x.length);
	// $scope.donationsData = $scope.donations[3];
	$scope.donationsData = [];

	donationsRef.on("value", function(snapshot) {
		let obj = snapshot.val();
		let keys = Object.keys(obj);
		let chosenKey = keys[keys.length - 1];
		let myData = obj[chosenKey];
		$scope.donationsData = obj[chosenKey];
		$scope.updateHallOfFame();
	}, function (error) {
		console.log("Error: " + error.code);
	});

	var ref = firebase.database().ref().child('Articles');
	$scope.articles = $firebaseArray(ref);

	$scope.updateDonationsDB = (donationsArray) => {
		$scope.donations.$add(donationsArray);
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
		// let tempAccessToken = 'fRiYmdIT7w9LrzFAChsMk15a6Kck7UJyoZRDqlRt';
		// let url = "https://streamlabs.com/api/v1.0/donations?access_token=" + tempAccessToken;
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
			$scope.username = 'Habib';
			$scope.$digest();
			console.log('responseData', responseData);
			console.log('now that we have data... lets update DB');
			$scope.updateDonationsDB(responseData.data);
			$scope.updateHallOfFame();
		}).catch((error) => {
			console.log('error was: ', error);
		});
	}

	$scope.updateHallOfFame = () => {
		let topDonors = [];
		let donationsByUser = {};
		// let donor = '';
		// let amount = 0;
		let donationObj = {};
		let highestDonations = {
			'scrubby': { amount: 10 },
			'richguy': { amount: 999 },
			'other': { amount: 22 },
			'yo': { amount: 12 }
		};
		$scope.donationsData.forEach((donation) => {
			// donor = donation.name;
			// amount = donation.amount;
			if (!donationsByUser[donation.name]) {
				donationsByUser[donation.name] = {
					amount: parseFloat(donation.amount)
				};
			} else {
				donationsByUser[donation.name].amount = parseFloat(donationsByUser[donation.name].amount) +
					parseFloat(donation.amount);
			}
		});
		console.log('donationsByUser', donationsByUser);
		let donorPeople = [];
		for (const key in donationsByUser) {
			donorPeople.push({
				name: key,
				amount: donationsByUser[key].amount
			});
		}
		console.log('donationsByUser', donationsByUser);
		let orderedDonors = _.sortBy(donorPeople, ['amount']).reverse();
		console.log('orderedDonors', orderedDonors);
		let hallOfFame = [];
		let hallOfFameLimit = 0;
		const HALL_OF_FAME_LIMIT = 25;
		if (orderedDonors.length <= HALL_OF_FAME_LIMIT) {
			hallOfFameLimit = orderedDonors.length;
		} else {
			hallOfFameLimit = HALL_OF_FAME_LIMIT;
		}
		for (let i = 0; i < hallOfFameLimit; i++) {
			hallOfFame.push({
				name: orderedDonors[i].name,
				amount: orderedDonors[i].amount.toFixed(2)
			});
		}
		$scope.hallOfFame = hallOfFame;
	}





}])
