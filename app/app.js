/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

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
	data = {
		b: 1,
		s: 2
	};
	res.send(data);
});

let server = app.listen(8081, () => {
	console.log('Server running...');
});

module.exports = server;
