/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */
'use strict';

let express = require('express');
let router = express.Router();
let config = require('../js/config');
let MemeNG = require('../js/memeng');

let memeng = new MemeNG(config);

router.get('/memes', (req, res) => {
	let data = null;
	memeng.getMemes().then(function(snapshot){
		data = snapshot.val();
		res.send(data);
		// console.log(snapshot.val());
	}).catch(function(err){
		console.log(err.message);
	});
});

router.get('/meme/:id/:top/:bottom?', (req, res) => {

	console.log(req.params.id, req.params.top, req.params.bottom);
	memeng.createMeme({id: req.params.id, top: req.params.top || '', bottom: req.params.bottom || ''}).then((meme) => {

		// res.send('<img src="' + memeURL + '" />');
		res.set('Content-Type', 'image/png');
		res.send(meme);
		// res.send(memeURL);
	}).catch(function(err){
		console.error(err.message);
		res.send('We couldnt get your meme. Sorry.');
	});

	// Old implementation using memeLink from memegen.link
	// memeng.createMemeLink({id: req.params.id, top: req.params.top, bottom: req.params.bottom}).then(function(parameters){
	// 	var url = parameters.url;
    //
	// 	MemeNG.downloadFile(url).then((result) => {
	// 		res.sendFile(result.fileURL);
	// 	});
	// 	// res.send('<img src="' + url + '"/>');
	// }).catch(function(err){
	// 	console.error(err.message);
	// 	res.send('We couldnt get your meme. Sorry.');
	// });
});

router.get('/authenticate/:email/:password', (req, res) => {
	memeng.authenticate(req.params.email, req.params.password);
	res.send('Done.');
});

router.post('/template/save', (req, res) => {

});

router.get('/test', (req, res) => {
	memeng.createMeme({id: 'packing-chairs', top: 'Okay'}).then((meme) => {

		// res.send('<img src="' + memeURL + '" />');
		res.set('Content-Type', 'image/png');
		res.send(meme);
		// res.send(memeURL);
	});
});

// memeng.getMemeDetails('packing-chairs');
// memeng.createMemeLink({id: 'jack-tunde', top: 'Over here', bottom: 'Understood'}).then(function(url){
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
