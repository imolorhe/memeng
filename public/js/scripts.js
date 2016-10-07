/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

(function () {

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	console.log('Script loaded.');

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDI15Gplajb3hRSpvk6PuH7juZCXeOjKKA",
		authDomain: "memeng-66697.firebaseapp.com",
		databaseURL: "https://memeng-66697.firebaseio.com",
		storageBucket: "memeng-66697.appspot.com",
		messagingSenderId: "413501286970"
	};
	// var noop = function(){return {ref:noop, once:function(){return new Promise();}};};
	var firebase = window.firebase; // || {initializeApp:noop, auth: noop, database: noop};

	if(!firebase){
		console.log('Firebase app is not available.');
		return false;
	}

	var memeng = new MemeNG(firebase, config);

	memeng.getMemes().then(function (snapshot) {
		console.log(snapshot.val());
	});
	console.log(memeng.getMemes());

	var router = new MemeNGRouter();

	router.route('/', function () {
		console.log('First route /');
	});

	router.route('home', function () {
		console.log('Second route..');
	});

	router.route('/finder', function () {
		console.log('Third route finder.');
	});

	router.route('d/:x/:y/z', function (x, y) {
		console.log('Awkward route.', x, y);
	});

	router.route('api/meme/:id', function (id) {
		console.log('Checking for meme: ', id);
		console.log(memeng.createMemeLink({id: id, top: 'Over here', bottom: 'Understood'}));
	});


	router.init();

	var allLinks = document.querySelectorAll('a');
	for(var i = 0, len = allLinks.length; i < len; i++){
		allLinks[i].addEventListener('click', function (e) {
			e.preventDefault();

			console.log('link clicked:', this.href);
			router.goto(this.href);
		});
	}
	console.log('Setup done.');

})();
