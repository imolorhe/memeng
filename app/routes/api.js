/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

let express = require('express');
let router = express.Router();

router.get('/memes', (req, res) => {
	res.send('Memes returned.');
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
