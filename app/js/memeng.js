/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

'use strict';

let path = require('path');
let https = require('https');
let fs = require('fs');
let crypto = require('crypto');
let sh = require('shorthash');
// http://stackoverflow.com/a/17133012
// Must set encoding to null for the response body type to be buffer
let request = require('request').defaults({encoding: null});

let Canvas = require('canvas');
let Image = Canvas.Image;


let firebase = require('./firebase');
let GCloud = require('gcloud');

let MemeNGLogger = require('./memeng-logger');

/**
 *
 * @param config
 * @returns {*}
 * @constructor
 */
var MemeNG = function (config) {
	this.logger = new MemeNGLogger();

	if(!firebase){
		this.logger.error('Firebase app is not available.');
		return false;
	}

	// Check if firebase has been initialised, else initialise it.
	try{
		firebase.app();
	}
	catch(e){
		firebase.initializeApp(config);
	}

	// this.logger.log('%cMemeNG initialised.', 'color: green;');
	this.firebase = firebase;
	this.database = firebase.database();
	this.auth = firebase.auth();
	if(firebase.storage){
		this.storage = firebase.storage();
	}
	else{
		var gcloud = GCloud({
			projectId: config.projectId,
			// keyFilename: config.keyJsonFilePath
			credentials: config.keyJsonContent
		});

		var gcs = gcloud.storage();

		// Save a reference to the bucket object
		this.bucket = gcs.bucket(config.storageBucket);
		this.bucket.exists(function (err, exists) {
			// console.log(err, exists);
			if(err){
				console.log('Something went wrong.', err.message);
			}
		});
	}

	// console.log('Storage bucket: ');
	// console.log(this.storage);

	// meme image canvas attributes
	this.canvasWidth = 700;
	this.canvasHeight = 700;

	this.memeWidth = this.canvasWidth;
	this.memeHeight = this.canvasHeight;

	this.canvas = new Canvas(this.canvasWidth, this.canvasHeight);
	this.ctx = this.canvas.getContext('2d');

	this.canvasImg = new Image();

	return this;
};

/**
 * Get data for all the available memes
 * @returns {!firebase.Promise.<*>|firebase.Promise<any>}
 */
MemeNG.prototype.getMemes = function () {
	return this.database.ref('/memes').once('value');
};

/**
 * Get the details of the meme with the specified id
 * @param id
 * @returns {!firebase.Promise.<*>|firebase.Thenable<any>|firebase.Promise<any>}
 */
MemeNG.prototype.getMemeDetails = function (id) {
	return this.database.ref('/memes/' + id).once('value').then(function (snapshot) {
		return snapshot.val();
	});
};

/**
 * returns the URL of the generated meme
 * @version 1.0
 * @param opts.id
 * @param opts.top
 * @param opts.bottom
 *
 */
MemeNG.prototype.createMemeLink = function (opts) {
	var id = opts.id;
	var topText = opts.top;
	var bottomText = opts.bottom;

	var that = this;

	return new Promise(function(resolve, reject){
		that.getMemeTemplateURL(id).then(function(imageURL){

			var url = 'https://memegen.link/custom/<top>/<bottom>.jpg?alt=' + encodeURIComponent(imageURL);

			// var url = 'https://memegen.link/api/templates/' + id + '/' + MemeNG.encodeMemeText(topText) + '/' + MemeNG.encodeMemeText(bottomText) + '';
			url = url
				.replace('<top>', MemeNG.encodeMemeText(topText) || '')
				.replace('<bottom>', MemeNG.encodeMemeText(bottomText) || '');

			var result = {
				url: url,
				opts: opts
			};
			resolve(result);
		}).catch(reject);
	});

};

/**
 * Generate a valid URL for the meme template
 * @param id
 * @returns {Promise}
 */
MemeNG.prototype.getMemeTemplateURL = function(id){
	var that = this;
	return new Promise(function(resolve, reject){
		// If the meme doesn't exist, don't continue
		// if(!this.memeExists(id))return false;
		that.getMemeDetails(id).then(function(data) {
			// console.log(data);

			if(!data){
				console.log('Meme not found.');
				reject(Error('Meme not found.'));
				return false;
			}
			var memeBaseURL = '';
			var memeImageName = data.imageName;
			// console.log('ref', that.storage.storage);
			var memeImageRef = that.bucket.file('memes/' + memeImageName);
			memeImageRef.exists(function(err, exists){
				if(err){
					console.log(err.message);
					reject(err);
					return false;
				}
				if(!exists){
					console.log('File does not exist');
					reject(Error('File does not exist.'));
					return false;
				}

				// Get a valid URL for the image
				memeImageRef.getSignedUrl({
					action: 'read',
					// Make the link available for one day (24 hours * 60 minutes * 60 seconds)
					expires: +(new Date()) + (60 * 60 * 24)
				}, function(err, imageURL){
					if(err){
						console.log(err.message);
						reject(err);
						return false;
					}

					resolve(imageURL);
				});
			});
		});
	});
};

/**
 * checks if the meme identified by the provided id exists
 * @param id
 * @returns {boolean}
 */
MemeNG.prototype.memeExists = function (id) {
	// TODO Check the database if the specified meme exists
	// TODO Return true if the specified meme exists, else return false
	return true;
};

MemeNG.prototype.authenticate = function (email, password) {
	var that = this;
	this.auth.signInWithEmailAndPassword(email, password).catch(function (error) {
		that.logger.log(error.message);
	});
};

MemeNG.prototype.generateMemeCanvas = function(config){
	var defaults = {
		top: '',
		bottom: '',
		imageURL: ''
	};
	var opts = Object.assign({}, defaults, config);

	var that = this;

	console.log(opts);

	return new Promise(function(resolve, reject){
		request.get(opts.imageURL, function(err, response, body){

			if(!err && response.statusCode == 200){
				that.canvasImg.src = new Buffer(body);
				console.log('image loaded.', new Buffer(body));
				that.calculateCanvasSize();
				that.drawMeme(opts.top, opts.bottom);
				resolve(that.canvas.toBuffer());
			}
			else{
				reject(new Error('The image could not be loaded.'));
			}
		});
	});
};

MemeNG.prototype.createMeme = function(opts){
	var id = opts.id;
	var topText = opts.top;
	var bottomText = opts.bottom;

	var that = this;

	return new Promise(function(resolve, reject){
		that.getMemeTemplateURL(id).then(function(imageURL){
			opts.imageURL = imageURL;
			that.generateMemeCanvas(opts).then((memeURL) => {
				resolve(memeURL);
			});
		}).catch((err) => {reject(new Error('Issue encountered generating template URL.', err.message))});
	});
};

/**
 * encodes the text using the prescribed format from memegen.link
 * @param text
 * @returns {XML|string}
 */
MemeNG.encodeMemeText = function (text) {
	if(!text)return null;
	return text
		.toLowerCase()
		.replace(/-/g, '--')
		.replace(/_/g, '__')
		.replace(/\s/g, '-')
		.replace(/\?/g, '~q')
		.replace(/%/g, '~p')
		.replace(/#/g, '~h')
		.replace(/\//g, '~s')
		.replace(/"/g, "''");
};

/**
 * Downloads the file in the specified URL and returns the local URL
 * @param url
 * @returns {Promise}
 */
MemeNG.downloadFile = function (url) {

	// let memeHash = crypto.createHash('md5').update(url).digest("hex");
	let memeHash = sh.unique(url);
	let tmpFileURL = process.env.PROJECT_ROOT + '/tmp/' + memeHash + '.jpg';
	// console.log(memeHash);
	// TODO: Check if file has already been created instead of creating multiple files.
	let file = fs.createWriteStream(tmpFileURL);
	return new Promise(function(resolve, reject){
		let request = https.get(url, function(response) {
			response.pipe(file).on('close', function(){
				// res.sendFile(tmpFileURL);
				resolve({fileURL: tmpFileURL});
			});
		});
	});

};

MemeNG.prototype.calculateCanvasSize = function () {
	console.log(this.canvasImg.width, this.canvasImg.height);
	if(this.canvasImg.width > this.canvasImg.height){
		this.canvas.height = this.canvasImg.height / this.canvasImg.width * this.canvas.width;
		this.memeWidth = this.canvas.width;
		this.memeHeight = this.canvas.height;
		console.log(this.memeWidth, this.memeHeight);
	}
	return {width: this.memeWidth, height: this.memeHeight};
};

MemeNG.prototype.drawMeme = function (topText, bottomText) {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	this.ctx.drawImage(this.canvasImg, 0, 0, this.memeWidth, this.memeHeight);

	this.ctx.lineWidth  = 8;
	this.ctx.font = 'bold 50pt Impact';
	this.ctx.strokeStyle = 'black';
	this.ctx.mutterLine = 2;
	this.ctx.lineJoin = "miter"; //Experiment with "bevel" & "round" for the effect you want!
	this.ctx.miterLimit = 3;
	this.ctx.fillStyle = 'white';
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = 'top';

	topText = topText.toUpperCase();
	var x = this.memeWidth / 2;
	var y = 0;

	this.writeTextOnCanvas({
		text: topText,
		x: x,
		y: y,
		maxWidth: this.memeWidth,
		lineHeightRatio: 1.6,
		fromBottom: false,
		fontSize: 50
	});

	this.ctx.textBaseline = 'bottom';
	bottomText = bottomText.toUpperCase();
	y = this.memeHeight;

	this.writeTextOnCanvas({
		text: bottomText,
		x: x,
		y: y,
		maxWidth: this.memeWidth,
		lineHeightRatio: 1.6,
		fromBottom: true,
		fontSize: 50
	});
};

MemeNG.prototype.writeTextOnCanvas = function (config) {
	var defaults = {
		text: 'MemeNG',
		x: 0,
		y: 0,
		maxWidth: 1000,
		lineHeightRatio: 2,
		fromBottom: false,
		fontSize: 50,
		maxLines: 2
	};
	var opts = Object.assign({}, defaults, config);

	this.ctx.font = 'bold ' + opts.fontSize + 'pt Impact';

	// If from the bottom, use unshift so the lines can be added to the top of the array.
	// Required since the lines at the bottom are laid out from bottom up.
	var pushMethod = (opts.fromBottom) ? 'unshift' : 'push';

	var _lineHeightRatio = (opts.fromBottom) ? -opts.lineHeightRatio : opts.lineHeightRatio;
	var lineHeight = _lineHeightRatio * opts.fontSize;

	console.log('lineH', lineHeight, opts.lineHeightRatio, opts.fontSize);

	var lines = [];
	var line = '';
	var words = opts.text.split(' ');

	for (var n = 0, len = words.length; n < len; n++) {
		// Create a line by adding the words one after the other
		var testLine = line + ' ' + words[n];

		// Get the width of the line after adding the current word
		var metrics = this.ctx.measureText(testLine);
		var testWidth = metrics.width;

		// Then checking the line width to see if it is more than the specified maxWidth
		if (testWidth > opts.maxWidth) {
			lines[pushMethod](line);
			line = words[n] + ' ';
		} else {
			line = testLine;
		}
	}
	// Don't forget to add the last line after the loop
	lines[pushMethod](line);

	// Check to make sure the number of lines isn't more than the maximum number of lines
	// If it is, then reduce the font size and try again
	if(lines.length > opts.maxLines){
		console.log('Too big.', opts.fontSize);
		this.writeTextOnCanvas({
			text: opts.text,
			x: opts.x,
			y: opts.y,
			maxWidth: opts.maxWidth,
			lineHeightRatio: opts.lineHeightRatio,
			fromBottom: opts.fromBottom,
			fontSize: opts.fontSize - 10
		});
	}
	// If it isn't, then write the text
	else{
		for (var k in lines) {
			this.ctx.strokeText(lines[k], opts.x, opts.y + lineHeight * k);
			this.ctx.fillText(lines[k], opts.x, opts.y + lineHeight * k);
		}
	}
};
//---------
/*
	Meme model
	memes
		id e.g. packing-chairs
		name e.g. Packing Chairs
		description e.g. People packing chairs
		aliases
			chairs
			packing

*/

module.exports = MemeNG;
