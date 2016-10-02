/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */
'use strict';

let express = require('express');
let cookieParser = require('cookie-parser');

let app = express();

let api = require('./routes/api');

app.use(express.static('public'));

app.use('/api', api);

app.get('/', (req, res) => {
	res.send('Hello.');
});

app.get('/api', (req, res) => {
	var data = {
		b: 1,
		s: 2
	};
	res.send(data);
});

let port = process.env.PORT || 8081;
let server = app.listen(port, () => {
	console.log('MemeNG server is now running.', port);
});

module.exports = server;
