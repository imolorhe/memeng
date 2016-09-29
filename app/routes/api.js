/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */
'use strict';

let express = require('express');
let router = express.Router();

router.get('/memes', (req, res) => {
	res.send('Memes returned.');
});

router.get('/meme/:id/:top/:bottom', (req, res) => {
	res.send('Found a meme for you.');
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
