/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

'use strict';

let express = require('express');
let router = express.Router();

let config = require('../js/config');

let MemeNG = require('../js/memeng');

let memeng = new MemeNG(config);

router.post('/slack', (req, res) => {
	// res.send(req.body);

	// Check the token with the one provided by Slack
	if(req.body.token != config.slackToken){
		res.send('Sorry but it appears you are not authorized for this.');
		return false;
	}
	// Check the command
	if(req.body.command != '/meme'){
		res.send('Sorry. I think you got the wrong address.');
		return false;
	}
	// Get the text
	if(req.body.text){
		let response = req.body.text;
		let responseSet = response.split(/\s+/);

		// Split the text into the appropriate parameters
		if(responseSet[0] && responseSet[1]){
			let memeID = responseSet[0];
			let texts = responseSet[1].split('/');

			memeng.createMeme({id: memeID, top: texts[0], bottom: texts[1]}).then((memeData) => {

				var result = {
					attachments: [
						{
							fallback: texts[0] + ' ' + texts[1] + ' from MemeNG.',
							color: '#123456',
							image_url: memeData.url
						}
					]
				};
				res.send(result);
				return false;
			}).catch((err) => {
				res.send('Ouch. An error. ' + err.message);
			});
		}
	}
	else{
		res.send('Oops. Something appears to have gone wrong.');
	}
});

module.exports = router;
