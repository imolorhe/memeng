/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */
'use strict';

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
	console.log(memeng.createMeme({id: req.params.id, top: req.params.top, bottom: req.params.bottom}));
	res.send('Found a meme for you.');
});

router.get('/authenticate/:email/:password', (req, res) => {
	memeng.authenticate(req.params.email, req.params.password);
	res.send('Done.');
});

router.post('/template/save', (req, res) => {

});

module.exports = router;

/*
 * API endpoints
 *
 * List available memes
 * /api/memes
 * Create meme
 * /api/meme/<id>/<top>/<bottom>
 * */
