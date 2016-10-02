/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */
'use strict';

let https = require('https');
let fs = require('fs');
let crypto = require('crypto');
let sh = require('shorthash');

let express = require('express');
let router = express.Router();
let firebase = require('firebase');
let firebaseConfig = require('../js/firebaseConfig');
let MemeNG = new require('../js/memeng');

let memeng = new MemeNG(firebase, firebaseConfig);

router.get('/memes', (req, res) => {
	let data = null;
	memeng.getMemes().then(function(snapshot){
		data = snapshot.val();
		res.send(data);
		// console.log(snapshot.val());
	});
});

router.get('/meme/:id/:top/:bottom', (req, res) => {
	memeng.createMeme({id: req.params.id, top: req.params.top, bottom: req.params.bottom}).then(function(url){

		// let memeHash = crypto.createHash('md5').update(url).digest("hex");
		let memeHash = sh.unique(url);
		let tmpFileURL = process.env.PROJECT_ROOT + '/tmp/' + memeHash + '.jpg';
		// console.log(memeHash);
		// TODO: Check if file has already been created instead of creating multiple files.
		let file = fs.createWriteStream(tmpFileURL);
		let request = https.get(url, function(response) {
			response.pipe(file).on('close', function(){
				res.sendFile(tmpFileURL);
			});
		});
		// res.send('<img src="' + url + '"/>');
	}).catch(function(err){
		console.error(err.message);
		res.send('We couldnt get your meme. Sorry.');
	});
});

router.get('/authenticate/:email/:password', (req, res) => {
	memeng.authenticate(req.params.email, req.params.password);
	res.send('Done.');
});

router.post('/template/save', (req, res) => {

});

// memeng.getMemeDetails('packing-chairs');
// memeng.createMeme({id: 'jack-tunde', top: 'Over here', bottom: 'Understood'}).then(function(url){
// 	console.log('Final image URL: ', url);
// }).catch(function(err){console.error(err.message)});
module.exports = router;

/*
 * API endpoints
 *
 * List available memes
 * /api/memes
 * Create meme
 * /api/meme/<id>/<top>/<bottom>
 * */
