/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

'use strict';

let request = require('request');
let express = require('express');
let router = express.Router();

let config = require('../js/config');

let MemeNG = require('../js/memeng');

let memeng = new MemeNG(config);

router.post('/slack', (req, res) => {
	// res.send(req.body);
	console.log(req.body);

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
		let responseUrl = req.body.response_url;

		let responseMatch = response.match(/([^\s.]*)\s+(.*)/);
		let memeID = responseMatch[1];
		let texts = responseMatch[2];
		let textsMatch = texts.match(/(.*)[\|]+(.*)/);

		let topText = '';
		let bottomText = '';

		if(textsMatch){
			topText = textsMatch[1];
			bottomText = textsMatch[2];
		}
		else{
			topText = texts;
		}

		// Split the text into the appropriate parameters
		if(responseSet[0] && responseSet[1]){
			let texts = responseSet[1].split('/');

			// Respond to the user while still carrying out the task
			// res.send('Got it!');

			let baseUrl = req.protocol + '://' + req.get('host');
			let fullUrl = baseUrl + '/api/meme/' + encodeURIComponent(memeID) + '/' + encodeURIComponent(topText) + '/' + encodeURIComponent(bottomText);
			console.log(fullUrl);
			var result = {
				attachments: [
					{
						response_type: "in_channel",
						fallback: texts[0] + ' ' + texts[1] + ' from MemeNG.',
						color: '#123456',
						image_url: fullUrl
					}
				]
			};

			res.send(result);

			// Former implementation using createMemeLink. It was slow to respond so was using slack's response_url method to send the information.
			// https://api.slack.com/slash-commands#responding_to_a_command
			// memeng.createMemeLink({id: memeID, top: texts[0], bottom: texts[1]}).then((memeData) => {
            //
			// 	var result = {
			// 		attachments: [
			// 			{
			// 				response_type: "in_channel",
			// 				fallback: texts[0] + ' ' + texts[1] + ' from MemeNG.',
			// 				color: '#123456',
			// 				image_url: memeData.url
			// 			}
			// 		]
			// 	};
			// 	request({
			// 		uri: responseUrl,
			// 		method: 'POST',
			// 		json: result
			// 	}, (err, response, body) => {
			// 		console.log('Request sent. ', body);
			// 		if(err){
			// 			console.log('Oops. Error: ', err.message);
			// 		}
			// 	});
			// 	// res.send(result || 'Got it!');
			// 	return false;
			// }).catch((err) => {
			// 	res.send('Ouch. An error. ' + err.message);
			// });
		}
		else{
			res.send('Sorry you provided incomplete information.');
		}
	}
	else{
		res.send('Oops. Something appears to have gone wrong.');
	}
});

module.exports = router;
